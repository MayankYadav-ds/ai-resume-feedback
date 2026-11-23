import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {generateReview} from './provider.js';
if(!process.env.GEMINI_API_KEY||!process.env.GEMINI_MODEL){
  console.error('Set GEMINI_API_KEY and GEMINI_MODEL in your shell. This sends fictional T01 input to Google three times and may use paid quota. No model experiment has been run.');process.exitCode=1;
}else{
  const root=new URL('../',import.meta.url);
  const input=JSON.parse(await readFile(new URL('test-data/inputs.json',root),'utf8'))[0];
  await mkdir(new URL('test-data/model-runs/',root),{recursive:true});
  for(const version of ['v1','v2','v3']){
    try{
      const result=await generateReview({...input,version},{key:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL});
      await writeFile(new URL(`test-data/model-runs/${version}-T01.json`,root),JSON.stringify({input,transport:'Live Gemini API',...result},null,2));
      console.log(`${version}: model=${result.model}; evidence issues=${result.issues.length}`);
    }catch(error){
      await writeFile(new URL(`test-data/model-runs/${version}-T01-error.json`,root),JSON.stringify({version,input,executed_at:new Date().toISOString(),error:error.message},null,2));
      console.error(`${version}: ${error.message}`);
    }
  }
}
