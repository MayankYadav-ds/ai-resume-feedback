import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {generateReview} from './provider.js';
const files={'/':'index.html','/app.js':'app.js','/engine.js':'engine.js','/prompts.js':'prompts.js','/validate.js':'validate.js','/style.css':'style.css'};
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
export function createAppServer(config={key:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL},fetcher=fetch) {
  let busy=false;
  return http.createServer(async(req,res)=>{
    function json(status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
    try {
      if(!/^(127\.0\.0\.1|localhost):\d+$/.test(req.headers.host||'')) {json(403,{error:'Local access only.'});return;}
      const path=new URL(req.url,'http://localhost').pathname;
      if(path==='/api/config' && req.method==='GET') {json(200,{enabled:Boolean(config.key&&config.model),model:config.model||null});return;}
      if(path==='/api/review' && req.method==='POST') {
        if(req.headers.origin!==`http://${req.headers.host}` || req.headers['content-type']!=='application/json') {json(403,{error:'Use the local application with JSON requests.'});return;}
        if(busy){json(429,{error:'A review is already running. Wait for it to finish.'});return;}
        let text='';
        for await(const chunk of req){text+=chunk.toString();if(Buffer.byteLength(text)>250000){json(413,{error:'Request too large.'});return;}}
        const data=JSON.parse(text);
        if(data.consent!==true){json(400,{error:'Data-sharing consent is required.'});return;}
        if(typeof data.resume!=='string'||typeof data.job!=='string'){json(400,{error:'Resume and job must be text.'});return;}
        busy=true;
        try{json(200,await generateReview(data,config,fetcher));}finally{busy=false;}
        return;
      }
      const file=files[path];
      if(req.method!=='GET'||!file){json(404,{error:'Not found.'});return;}
      const body=await readFile(new URL(`./public/${file}`,import.meta.url));
      res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"});
      res.end(body);
    }catch(error){json(400,{error:error.name==='TimeoutError'?'Provider timed out. Try again.':error instanceof SyntaxError?'Invalid JSON request.':error.message});}
  });
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  const server=createAppServer();
  server.listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log(`Resume Studio: http://127.0.0.1:${server.address().port}`));
}
