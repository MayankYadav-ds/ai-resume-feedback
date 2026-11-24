import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {analyze} from './public/engine.js';
const root=new URL('../',import.meta.url);
const cases=JSON.parse(await readFile(new URL('test-data/inputs.json',root),'utf8'));
const results=cases.map(c=>{
  const resume=c.resume_repeat?'a'.repeat(c.resume_repeat):c.resume;
  let actual;
  try{actual=analyze(resume,c.job);}catch(error){actual={error:error.message};}
  const comparable=c.expected.error?{error:actual.error}:{score:actual.score,matched:actual.matched};
  return {...c,resume:c.resume_repeat?`[${c.resume_repeat} characters generated as documented]`:resume,actual,pass:isDeepStrictEqual(comparable,c.expected)};
});
await mkdir(new URL('test-data/',root),{recursive:true});
await writeFile(new URL('test-data/results.json',root),JSON.stringify({executed_at:new Date().toISOString(),scope:'Actual local deterministic runs. No LLM calls. T07/T08 intentionally assess semantic capability beyond dictionary coverage.',total:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results},null,2));
const short=x=>JSON.stringify(x).replaceAll('|','/');
await writeFile(new URL('test-data/results.md',root),'# Actual local evaluation\n\nT07 and T08 are known semantic limitations, intentionally retained as failed capability tests. No model quality results are claimed.\n\n| Test | Type | Expected | Actual | Result |\n|---|---|---|---|---|\n'+results.map(r=>`| ${r.id} | ${r.type} | ${short(r.expected)} | ${short(r.actual.error?{error:r.actual.error}:{score:r.actual.score,matched:r.actual.matched})} | ${r.pass?'Pass':'Fail'} |`).join('\n')+'\n');
console.log(`${results.length} inputs: ${results.filter(r=>r.pass).length} passed, ${results.filter(r=>!r.pass).length} known capability limitation(s).`);
