import test from 'node:test';
import assert from 'node:assert/strict';
import {validateReview} from '../public/validate.js';
import {generateReview} from '../provider.js';
import {createAppServer} from '../server.js';
const resume='Built a React dashboard.';
const job='React and Docker required.';
const review={summary:'React evidenced, Docker needs clarification.',matched_skills:[{skill:'React',resume_quote:resume}],gaps:[{skill:'Docker',job_quote:job}],rewrites:[{before:resume,after:'Built a dashboard using React.',evidence:resume,clarification_needed:null}],next_steps:['Verify Docker experience.']};
test('accepts structured feedback with exact evidence',()=>assert.deepEqual(validateReview(review,resume,job),[]));
test('rejects invented source quotes and unsupported metrics',()=>{const value=structuredClone(review);value.rewrites[0].after+=' Improved speed by 25%.';value.matched_skills[0].resume_quote='Built Docker';const errors=validateReview(value,resume,job);assert.equal(errors.length,2);});
test('rejects malformed structures without throwing',()=>{for(const value of [null,[],{},42,{...review,rewrites:[null]}])assert.ok(validateReview(value,resume,job).length);});
test('provider adapter passes credentials in header and validates response (mock transport)',async()=>{
  const result=await generateReview({resume,job},{key:'test-only',model:'test-model'},async(url,options)=>{assert.match(url,/test-model:generateContent$/);assert.equal(options.headers['x-goog-api-key'],'test-only');assert.ok(JSON.parse(options.body).contents[0].parts[0].text.includes('SOURCE DATA'));return {ok:true,json:async()=>({modelVersion:'test-model',candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(review)}]}}]})};});
  assert.deepEqual(result.issues,[]);assert.equal(result.model,'test-model');
});
test('provider failures, truncation and malformed JSON are explicit (mock transport)',async()=>{
  await assert.rejects(generateReview({resume,job},{key:'test-only',model:'test-model'},async()=>({ok:false,status:429})),/429/);
  await assert.rejects(generateReview({resume,job},{key:'test-only',model:'test-model'},async()=>({ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS'}]})})),/complete/);
  await assert.rejects(generateReview({resume,job},{key:'test-only',model:'test-model'},async()=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'not json'}]}}]})})),/valid JSON/);
});
test('missing credentials do not silently use fake AI',async()=>assert.rejects(generateReview({resume,job},{}),/Configure/));
test('local API rejects cross-origin requests and unconsented sharing',async()=>{
  const server=createAppServer({});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    assert.equal((await fetch(base+'/api/config').then(r=>r.json())).enabled,false);
    assert.equal((await fetch(base+'/api/review',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://untrusted.example'},body:'{}'})).status,403);
    assert.equal((await fetch(base+'/api/review',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({resume,job,consent:false})})).status,400);
    assert.equal((await fetch(base+'/../.env')).status,404);
  }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
