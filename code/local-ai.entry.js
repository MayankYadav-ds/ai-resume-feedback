import {CreateMLCEngine} from '@mlc-ai/web-llm';
let engine=null;
const schema={type:'object',properties:{summary:{type:'string'},matched_skills:{type:'array',items:{type:'object',properties:{skill:{type:'string'},resume_quote:{type:'string'}},required:['skill','resume_quote']}},gaps:{type:'array',items:{type:'object',properties:{skill:{type:'string'},job_quote:{type:'string'}},required:['skill','job_quote']}},rewrites:{type:'array',items:{type:'object',properties:{before:{type:'string'},after:{type:'string'},evidence:{type:'string'},clarification_needed:{type:['string','null']}},required:['before','after','evidence','clarification_needed']}},next_steps:{type:'array',items:{type:'string'}}},required:['summary','matched_skills','gaps','rewrites','next_steps']};
export async function runLocalReview(prompt,onProgress=()=>{}) {
  if(!navigator.gpu)throw new Error('This browser does not support WebGPU. Use a recent desktop Chrome or Edge, or the manual prompt workflow.');
  const adapter=await navigator.gpu.requestAdapter();
  if(!adapter)throw new Error('No compatible GPU is available. Manual prompt export still works.');
  const model=adapter.features.has('shader-f16')?'SmolLM2-360M-Instruct-q4f16_1-MLC':'SmolLM2-360M-Instruct-q4f32_1-MLC';
  if(!engine)engine=await CreateMLCEngine(model,{initProgressCallback:report=>onProgress(report.text)});
  onProgress('Model loaded. Generating a private on-device review…');
  let result;
  try {
    result=await engine.chat.completions.create({messages:[{role:'user',content:prompt}],temperature:0.2,max_tokens:1000,response_format:{type:'json_object',schema:JSON.stringify(schema)}});
  }catch(error){
    if(!/grammar|std::string/i.test(error.message))throw error;
    onProgress('Structured decoding is unavailable on this device. Generating a draft for validation…');
    result=await engine.chat.completions.create({messages:[{role:'user',content:prompt}],temperature:0.2,max_tokens:1000});
  }
  const raw=(result.choices[0]?.message?.content||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  return {raw,model,finish_reason:result.choices[0]?.finish_reason};
}
