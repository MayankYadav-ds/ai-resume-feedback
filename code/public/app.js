import {analyze,buildPrompt} from './engine.js';
import {validateReview} from './validate.js';
import {generateReview} from './provider.js';

const $=id=>document.getElementById(id);
const panelNames={analyze:'Resume analysis',lab:'Prompt lab',evidence:'Project evidence',team:'Meet the team'};
let report=null,aiReview=null,revision=0,generating=false,localProvider=false;
const promptNotes={v1:'Baseline: open-ended feedback. No strict output contract or evidence safeguards.',v2:'Iteration: JSON fields and no-invention rules. Exact quote fields are not yet specified.',v3:'Final: exact JSON contract, source separation, evidence rules and one example. One final prompt; one model call.'};

function showPanel(name) {
  if(!Object.hasOwn(panelNames,name))name='analyze';
  for(const id of Object.keys(panelNames))$('panel-'+id).hidden=id!==name;
  document.querySelectorAll('.nav-item').forEach(button=>{
    const active=button.dataset.panel===name;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  $('page-title').textContent=panelNames[name];
  history.replaceState(null,'','#'+name);
  window.scrollTo({top:0,behavior:'instant'});
  updatePrompt();
}
document.querySelectorAll('[data-panel]').forEach(button=>button.onclick=()=>showPanel(button.dataset.panel));
function node(tag,text,className) {
  const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;
}
function download(name,text,type='application/json') {
  const url=URL.createObjectURL(new Blob([text],{type}));const a=node('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function inputs(){return {resume:$('resume').value,job:$('job').value};}
function updatePrompt() {
  const {resume,job}=inputs();
  const ready=Boolean(resume.trim()&&job.trim());
  $('source-status').textContent=ready?`Source pair ready · ${resume.length.toLocaleString()} resume characters · ${job.length.toLocaleString()} job characters`:'Add a resume and job description in Resume analysis first.';
  $('version-note').textContent=promptNotes[$('version').value];
  $('prompt-preview').value=ready?buildPrompt(resume,job,$('version').value):'';
  $('prompt').disabled=!ready;$('copy-prompt').disabled=!ready;
}
function invalidate() {
  revision++;report=null;aiReview=null;
  $('report').hidden=true;$('empty').hidden=false;$('ai-export').disabled=true;
  $('ai-json').value='';$('ai-result').replaceChildren();$('ai-status').textContent='';$('error').textContent='';
  $('consent').checked=false;
  for(const id of ['resume','job'])$(id+'-count').textContent=`${$(id).value.length.toLocaleString()} / 30,000`;
  updatePrompt();
}
for(const id of ['resume','job'])$(id).addEventListener('input',invalidate);
$('sample').onclick=()=>{
  $('resume').value='Software developer with JavaScript, React, SQL and Git experience.\n- Built a React dashboard for tracking student placements.\n- Developed REST APIs for a university project.\n- Worked with a team on testing application features.';
  $('job').value='Junior Full Stack Developer\nBuild web applications with React, JavaScript, Node.js and SQL. Experience with REST APIs, Git, Docker and CI/CD. Strong communication and testing skills.';
  invalidate();
};
$('clear').onclick=()=>{$('form').reset();invalidate();$('resume').focus();};
$('upload').onchange=async()=>{
  const file=$('upload').files[0];if(!file)return;
  if(file.size>150000){$('error').textContent='Choose a plain-text file smaller than 150 KB.';$('upload').value='';return;}
  if(!/\.(txt|md)$/i.test(file.name)){$('error').textContent='Upload a .txt or .md file. PDF/DOCX parsing is not included.';return;}
  try{
    const text=await file.text();
    if(text.length>30000)throw new Error('Keep the resume under 30,000 characters.');
    $('resume').value=text;invalidate();
  }catch(error){$('error').textContent=error.message;}
  finally{$('upload').value='';}
};
function chips(id,items,fallback) {
  $(id).replaceChildren();
  for(const item of items.length?items:[fallback])$(id).append(node('span',item,'chip'));
}
function renderLocal(value) {
  $('score').textContent=value.score===null?'N/A':`${value.score}%`;
  $('coverage-bar').value=value.score??0;
  $('coverage').textContent=`${value.matched.length} of ${value.total} recognized job skills found`;
  $('matched-count').textContent=`${value.matched.length} matching skill${value.matched.length===1?'':'s'}`;$('gap-count').textContent=`${value.missing.length} gap${value.missing.length===1?'':'s'} to review`;
  chips('matched',value.matched,'No recognized matches');chips('missing',value.missing,value.total?'No gaps in recognized keywords':'No supported keywords found');
  $('source-evidence').replaceChildren();
  for(const item of value.evidence) {
    $('source-evidence').append(node('p',`${item.skill}: ${item.quotes.length?item.quotes.join(' / '):item.negated?'Only a negated mention found; verify experience.':'No resume evidence found.'}`));
  }
  $('bullets').replaceChildren();
  for(const bullet of value.bullets) {
    const box=node('div',undefined,'edit');
    for(const [label,text] of [['Original',bullet.before],['Suggested',bullet.after]]) {
      const p=node('p');p.append(node('strong',label+': '),document.createTextNode(text));box.append(p);
    }
    $('bullets').append(box);
  }
  if(!value.bullets.length)$('bullets').append(node('p','Add factual project or work bullets, one per line starting with -, • or *.','small'));
  $('next-steps').replaceChildren();
  const steps=[value.missing.length?`Review ${value.missing.slice(0,4).join(', ')}. Add evidence only for skills you actually have.`:'Check that the listed skills are backed by real projects or work.', 'Describe scope and outcomes you can verify. Never invent metrics.', 'Use Prompt lab for contextual feedback, then review every suggested claim.'];
  for(const text of steps)$('next-steps').append(node('li',text));
  $('empty').hidden=true;$('report').hidden=false;
}
$('form').onsubmit=event=>{
  event.preventDefault();
  try{const {resume,job}=inputs();report=analyze(resume,job);$('error').textContent='';renderLocal(report);}
  catch(error){$('error').textContent=error.message;}
};
$('go-lab').onclick=()=>showPanel('lab');
$('download').onclick=()=>{if(report)download('resume-review.json',JSON.stringify({...report,method:'Local dictionary keyword coverage; not an ATS score or hiring prediction.'},null,2));};
$('version').onchange=()=>{revision++;updatePrompt();$('prompt-status').textContent='';};
$('prompt').onclick=()=>{if($('prompt-preview').value)download(`P1-${$('version').value}-resume-review.txt`,$('prompt-preview').value,'text/plain');};
$('copy-prompt').onclick=async()=>{
  try{await navigator.clipboard.writeText($('prompt-preview').value);$('prompt-status').textContent='Prompt copied. Remove private details before sharing it.';}
  catch{$('prompt-status').textContent='Clipboard access is unavailable. Use Download prompt instead.';}
};
function renderAI(value) {
  $('ai-result').replaceChildren();
  const summary=node('div',undefined,'review-block');summary.append(node('h3','The overview'),node('p',value.summary));$('ai-result').append(summary);
  for(const [title,items,render] of [
    ['Matched skills',value.matched_skills,item=>[item.skill,item.resume_quote]],
    ['Gaps to clarify',value.gaps,item=>[item.skill,item.job_quote]],
    ['Evidence-preserving rewrites',value.rewrites,item=>[item.after,item.evidence]]
  ]) {
    const section=node('div',undefined,'review-block');section.append(node('h3',title));
    for(const item of items){const [label,quote]=render(item);section.append(node('p',label),node('blockquote',quote));if(item.clarification_needed)section.append(node('p','Verify: '+item.clarification_needed));}
    if(!items.length)section.append(node('p','No items supplied.'));
    $('ai-result').append(section);
  }
  const next=node('div',undefined,'review-block');next.append(node('h3','Next steps'));const ul=node('ul');for(const text of value.next_steps)ul.append(node('li',text));next.append(ul);$('ai-result').append(next);
}
function checkAI() {
  aiReview=null;$('ai-export').disabled=true;$('ai-result').replaceChildren();
  try {
    const {resume,job}=inputs();analyze(resume,job);
    const review=JSON.parse($('ai-json').value);
    const issues=validateReview(review,resume,job);
    $('ai-status').classList.toggle('error',issues.length>0);
    $('ai-status').textContent=issues.length?'Needs correction: '+issues.join(' '):'Evidence checks passed. Human review is still required.';
    if(!issues.length){aiReview=review;$('ai-export').disabled=false;renderAI(review);}
    return issues;
  }catch(error){$('ai-status').classList.add('error');$('ai-status').textContent=error instanceof SyntaxError?'Paste a valid JSON object from the final v3 prompt.':error.message;return [error.message];}
}
$('validate').onclick=checkAI;
$('ai-json').oninput=()=>{aiReview=null;$('ai-export').disabled=true;$('ai-result').replaceChildren();$('ai-status').textContent='Response changed. Check evidence again.';};
$('ai-export').onclick=()=>{if(aiReview)download('checked-ai-review.json',JSON.stringify(aiReview,null,2));};
$('forget-key').onclick=()=>{$('api-key').value='';$('model').value='';$('consent').checked=false;$('provider-status').textContent='Key cleared from this tab. No key has been saved.';};
$('generate').onclick=async()=>{
  if(generating)return;
  const {resume,job}=inputs();
  try{analyze(resume,job);}catch(error){$('ai-status').textContent=error.message;return;}
  if(!$('consent').checked){$('ai-status').textContent='Confirm data sharing before generating a review.';return;}
  const key=$('api-key').value.trim(),model=$('model').value.trim(),version=$('version').value;
  if(!localProvider&&(!key||!model)){$('ai-status').textContent='Enter your own key and enabled model ID, use a configured local server, or export the prompt for manual use.';return;}
  const sourceRevision=revision;
  generating=true;$('generate').disabled=true;$('generate').textContent='Reviewing…';$('ai-status').textContent='Generating a review. This can take up to a minute.';
  try {
    let data;
    if(key&&model)data=await generateReview({resume,job,version},{key,model});
    else{
      const response=await fetch('./api/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resume,job,version,consent:true})});data=await response.json();if(!response.ok)throw new Error(data.error||'Review failed.');
    }
    if(sourceRevision!==revision)return;
    $('ai-json').value=JSON.stringify(data.review,null,2);checkAI();
    $('ai-status').textContent+=` Model: ${data.model}. Prompt: ${data.version}.`;
  }catch(error){if(sourceRevision===revision){$('ai-status').classList.add('error');$('ai-status').textContent=error.name==='TimeoutError'?'The model timed out. Retry or use manual prompt export.':error.message;}}
  finally{generating=false;$('generate').disabled=false;$('generate').textContent='Generate AI review';}
};
if(['127.0.0.1','localhost'].includes(location.hostname))fetch('./api/config').then(r=>r.json()).then(config=>{
  localProvider=config.enabled===true;
  if(localProvider)$('provider-status').textContent=`Local server configured: ${config.model}. Leave the key fields empty to use the server-side key.`;
}).catch(()=>{});

$('local-generate').onclick=async()=>{
  if(generating)return;
  const {resume,job}=inputs();
  try{analyze(resume,job);if(resume.length+job.length>6000)throw new Error('For the small on-device model, keep the combined inputs under 6,000 characters. Use Gemini or manual export for longer texts.');}
  catch(error){$('local-status').textContent=error.message;return;}
  generating=true;$('local-generate').disabled=true;$('generate').disabled=true;
  const sourceRevision=revision;
  try{
    $('local-status').textContent='Checking device support and loading model files…';
    const {runLocalReview}=await import('./local-ai.bundle.js');
    const result=await runLocalReview(buildPrompt(resume,job,$('version').value),message=>{$('local-status').textContent=message;});
    if(sourceRevision!==revision){$('local-status').textContent='Inputs changed during generation. Run again for the current inputs.';return;}
    $('ai-json').value=result.raw;checkAI();
    $('local-status').textContent=`Generated on this device with ${result.model}. ${result.finish_reason==='stop'?'':'Output may be incomplete; retry with shorter inputs.'}`;
  }catch(error){$('local-status').textContent=error.message+' Prompt export and the recorded example remain available.';}
  finally{generating=false;$('local-generate').disabled=false;$('generate').disabled=false;}
};
async function loadEvidence() {
  try {
    const response=await fetch('./evidence.json');if(!response.ok)throw new Error('Evidence unavailable');const data=await response.json();
    for(const [number,label,detail] of [[1,'Final prompt','P1 · evidence-grounded review'],[3,'Saved versions','Full text and design rationale'],[data.evaluation.total,'Test inputs','Normal, edge and invalid'],[data.evaluation.passed,'Capability passes',`${data.evaluation.failed} documented limitation${data.evaluation.failed===1?'':'s'}`]]){
      const el=node('div',undefined,'metric');el.append(node('strong',String(number)),node('p',label),node('small',detail));$('evidence-metrics').append(el);
    }
    $('evaluation-note').textContent=`Executed ${new Date(data.evaluation.executed_at).toLocaleDateString('en-IN')}. These are actual deterministic local runs, not LLM outputs. ${data.regression_tests} separate regression tests pass. Experience depth remains a known semantic limit.`;
    for(const item of data.evaluation.results){
      const tr=node('tr');const expected=item.expected.error??(item.expected.score===null?'N/A':item.expected.score+'%');const actual=item.actual.error??(item.actual.score===null?'N/A':item.actual.score+'%');
      for(const value of [item.id,item.type,(item.resume||'').slice(0,90),expected,actual])tr.append(node('td',value));tr.append(node('td',item.pass?'Pass':'Fail',item.pass?'pass':'fail'));$('test-table').append(tr);
    }
    for(const [name,status] of data.modules){const row=node('div',undefined,'module-row');row.append(node('span',name),node('span',status));$('module-list').append(row);}
    const renderRun=()=>{$('run-response').textContent=data.model_runs.find(r=>r.version===$('run-version').value).response;};
    $('run-version').onchange=renderRun;renderRun();
    for(const run of data.model_runs){const row=node('div',undefined,'module-row');row.append(node('span',run.version+' · '+(run.json_valid?'Valid JSON':'Free text')),node('span',run.contract_valid?'Final contract passes':'Final contract fails'));$('experiment-summary').append(row);}
    $('recorded-sample').onclick=()=>{const run=data.model_runs.find(r=>r.version==='v3');$('resume').value=run.input.resume;$('job').value=run.input.job;invalidate();$('version').value='v3';updatePrompt();$('ai-json').value=run.response;checkAI();$('ai-status').textContent+=' Recorded Codex response from 24 November 2026; not a new generation.';};
    for(const member of data.team.members){const card=node('article',undefined,'team-card');card.append(node('div',member.name.slice(0,1),'team-avatar'),node('h2',member.name),node('p',member.enrollment),node('small',member.task+' · '+member.contribution_percent+'% assigned ownership'));$('team-grid').append(card);}
  }catch{$('evaluation-note').textContent='Evidence could not be loaded. Open the public repository to see the saved test results.';}
}
showPanel(location.hash.slice(1)||'analyze');loadEvidence();
