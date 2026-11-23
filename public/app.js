import {analyze,buildPrompt} from './engine.js';
const $=id=>document.getElementById(id);
let report=null;
function invalidate(){report=null;$('report').hidden=true;$('empty').hidden=false;for(const id of ['resume','job'])$(id+'-count').textContent=`${$(id).value.length.toLocaleString()} / 30,000`;}
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
$('prompt').onclick=()=>{if(report)download('resume-review-prompt.txt',buildPrompt($('resume').value,$('job').value),'text/plain');};
$('download').onclick=()=>{if(report)download('resume-review.json',JSON.stringify({...report,method:'Local dictionary keyword coverage; not an ATS score.'},null,2),'application/json');};
