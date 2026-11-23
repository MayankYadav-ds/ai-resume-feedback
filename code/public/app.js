import {analyze,buildPrompt} from './engine.js';
import {validateReview} from './validate.js';
const $=id=>document.getElementById(id);
let report=null;
let aiReview=null;
let providerEnabled=false;
let generating=false;
let revision=0;
function invalidate(){revision++;report=null;aiReview=null;$('ai-json').value='';$('ai-result').textContent='';$('ai-status').textContent='';$('ai-export').disabled=true;$('report').hidden=true;$('empty').hidden=false;for(const id of ['resume','job'])$(id+'-count').textContent=`${$(id).value.length.toLocaleString()} / 30,000`;}
for(const id of ['resume','job'])$(id).addEventListener('input',invalidate);
$('sample').onclick=()=>{$('resume').value='Software developer with JavaScript, React, SQL and Git experience.\n- Built a React dashboard for tracking student placements.\n- Developed REST APIs for a university project.\n- Worked with a team on testing application features.';$('job').value='Junior Full Stack Developer\nBuild web applications with React, JavaScript, Node.js and SQL. Experience with REST APIs, Git, Docker and CI/CD. Strong communication and testing skills.';invalidate();};
$('clear').onclick=()=>{$('form').reset();$('error').textContent='';invalidate();$('resume').focus();};
function chips(id,items,fallback){$(id).replaceChildren();for(const item of items.length?items:[fallback]){const el=document.createElement('span');el.className='chip';el.textContent=item;$(id).append(el);}}
$('form').onsubmit=e=>{e.preventDefault();try{report=analyze($('resume').value,$('job').value);$('error').textContent='';$('score').textContent=report.score===null?'N/A':`${report.score}%`;$('coverage').textContent=`${report.matched.length} of ${report.total} recognized job skills found`;
chips('matched',report.matched,'No recognized matches');chips('missing',report.missing,report.total?'No gaps in recognized keywords':'No supported keywords found; use the AI prompt for context');$('bullets').replaceChildren();
for(const bullet of report.bullets){const box=document.createElement('div');box.className='edit';for(const [label,value] of [['Original',bullet.before],['Suggested',bullet.after],['Review',bullet.note]]){const p=document.createElement('p');const b=document.createElement('strong');b.textContent=label+': ';p.append(b,document.createTextNode(value));box.append(p);}$('bullets').append(box);}
if(!report.bullets.length)$('bullets').textContent='Use one bullet per line, starting with -, • or *. Add factual project or work bullets, then analyze again.';$('empty').hidden=true;$('report').hidden=false;
}catch(err){$('error').textContent=err.message;}};
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('prompt').onclick=()=>{if(report)download('resume-review-prompt.txt',buildPrompt($('resume').value,$('job').value,$('version').value),'text/plain');};
$('download').onclick=()=>{if(report)download('resume-review.json',JSON.stringify({...report,method:'Local dictionary keyword coverage; not an ATS score.'},null,2),'application/json');};

function checkAI() {
  aiReview=null;$('ai-export').disabled=true;
  try {
    const review=JSON.parse($('ai-json').value);
    const issues=validateReview(review,$('resume').value,$('job').value);
    $('ai-status').textContent=issues.length?'Needs correction: '+issues.join(' '):'Evidence checks passed. Human review is still required.';
    $('ai-result').textContent=JSON.stringify(review,null,2);
    if(!issues.length){aiReview=review;$('ai-export').disabled=false;}
  }catch{$('ai-status').textContent='Paste a valid JSON object from the final v3 prompt.';$('ai-result').textContent='';}
}
$('validate').onclick=checkAI;
$('ai-json').addEventListener('input',()=>{aiReview=null;$('ai-export').disabled=true;$('ai-result').textContent='';$('ai-status').textContent='Response changed. Check evidence again.';});
$('ai-export').onclick=()=>{if(aiReview)download('ai-review.json',JSON.stringify(aiReview,null,2),'application/json');};
$('consent').onchange=()=>{$('generate').disabled=!providerEnabled||!$('consent').checked||generating;};
$('generate').onclick=async()=>{
  if(!providerEnabled||!$('consent').checked||generating)return;
  const sourceRevision=revision;
  generating=true;$('generate').disabled=true;$('ai-status').textContent='Generating a review…';
  try {
    const response=await fetch('./api/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resume:$('resume').value,job:$('job').value,version:$('version').value,consent:true})});
    const data=await response.json();
    if(sourceRevision!==revision)return;
    if(!response.ok)throw new Error(data.error||'Review failed.');
    $('ai-json').value=JSON.stringify(data.review,null,2);checkAI();
    $('ai-status').textContent+=` Model: ${data.model}. Prompt: ${data.version}.`;
  }catch(error){if(sourceRevision===revision)$('ai-status').textContent=error.message;}
  finally{generating=false;$('generate').disabled=!providerEnabled||!$('consent').checked;}
};
// Only probe the optional API on loopback. The public static demo makes no API calls.
if(['127.0.0.1','localhost'].includes(location.hostname)) {
  fetch('./api/config').then(r=>r.json()).then(config=>{providerEnabled=config.enabled===true;$('provider-status').textContent=providerEnabled?`Local Gemini configured: ${config.model}. Text is sent only after consent and clicking Run.`:'Local server: set GEMINI_API_KEY and GEMINI_MODEL to enable automatic review, or use manual prompt export.';$('generate').disabled=!providerEnabled||!$('consent').checked;}).catch(()=>{});
}
