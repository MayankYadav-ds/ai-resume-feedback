import {buildPrompt,analyze} from './public/engine.js';
import {validateReview} from './public/validate.js';
export async function generateReview({resume,job,version='v3'},config,fetcher=fetch) {
  analyze(resume,job);
  if(!config.key || !config.model) throw new Error('Configure GEMINI_API_KEY and GEMINI_MODEL on the local server first.');
  if(!/^[a-zA-Z0-9._-]{1,100}$/.test(config.model)) throw new Error('Invalid model identifier.');
  const response=await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,{
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':config.key},signal:AbortSignal.timeout(60000),
    body:JSON.stringify({contents:[{role:'user',parts:[{text:buildPrompt(resume,job,version)}]}],generationConfig:{temperature:0.2,maxOutputTokens:4096}})
  });
  if(!response.ok) throw new Error(`Provider request failed (HTTP ${response.status}). Check model access, quota and configuration.`);
  const data=await response.json();const candidate=data.candidates?.[0];
  if(candidate?.finishReason!=='STOP') throw new Error('Provider returned no complete review. Retry or use manual prompt export.');
  const raw=candidate.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('')||'';
  let review;
  try{review=JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));}
  catch{throw new Error('Provider did not return valid JSON. Use the final v3 prompt.');}
  return {review,issues:validateReview(review,resume,job),raw,model:data.modelVersion||config.model,version,generated_at:new Date().toISOString()};
}
