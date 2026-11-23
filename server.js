import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files = {'/':'index.html','/app.js':'app.js','/engine.js':'engine.js','/style.css':'style.css'};
const types = {html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
const server = http.createServer(async(req,res)=>{
  const file = files[new URL(req.url,'http://localhost').pathname];
  if(req.method !== 'GET' || !file){res.writeHead(404);res.end('Not found');return;}
  try {
    const body = await readFile(new URL(`./public/${file}`,import.meta.url));
    res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    res.end(body);
  }catch{res.writeHead(500);res.end('Unable to load application');}
});
server.listen(Number(process.env.PORT || 3000),'127.0.0.1',()=>console.log(`Resume Studio: http://127.0.0.1:${server.address().port}`));
