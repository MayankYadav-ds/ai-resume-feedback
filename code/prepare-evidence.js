import {readFile,writeFile} from 'node:fs/promises';
import {analyze,buildPrompt} from './public/engine.js';
import {validateReview} from './public/validate.js';
const root=new URL('../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const evaluation=await read('test-data/results.json');
const input=(await read('test-data/inputs.json'))[0];
const runs=[];
for(const version of ['v1','v2','v3']){
  const response=await readFile(new URL(`test-data/model-runs/${version}-T01-response.txt`,root),'utf8');
  let jsonValid=false,issues=[];
  try{const value=JSON.parse(response);jsonValid=true;issues=validateReview(value,input.resume,input.job);}
  catch{issues=['Response is not JSON.'];}
  const run={version,input:{resume:input.resume,job:input.job},prompt:buildPrompt(input.resume,input.job,version),response,json_valid:jsonValid,contract_valid:issues.length===0,validation_issues:issues,
    executed_on:'2026-11-24',tool:'Codex research assistant',model:'GPT-6 family (exact backend deployment identifier not exposed)',settings:'Inherited assistant defaults; temperature not exposed',provenance:`Independent research-agent session /root/prompt_${version}; original response content retained. JSON whitespace normalized for v2.`,limitations:'One T01 sample per version; not a repeated trial or Gemini benchmark. Each session has platform system/developer instructions.'};
  await writeFile(new URL(`test-data/model-runs/${version}-T01.json`,root),JSON.stringify(run,null,2));runs.push(run);
}
const modules=[['Text input and validation','Working'],['Keyword gap analysis','Working'],['Prompt export','Working'],['Manual AI evidence checking','Working'],['JSON report export','Working'],['Recorded prompt experiment','Working'],['Gemini integration','Implemented; live verification requires own key'],['On-device language model','Working; WebGPU device required']];
await writeFile(new URL('code/public/evidence.json',root),JSON.stringify({evaluation,team:await read('docs/team.json'),regression_tests:17,modules,model_runs:runs},null,2));
await writeFile(new URL('docs/prompt-experiment-results.json',root),JSON.stringify({sample:'T01',runs,summary:{json_valid:runs.map(r=>r.json_valid),final_contract_valid:runs.map(r=>r.contract_valid)}},null,2));
console.log('Saved three actual assistant-session runs and the public evidence manifest.');
