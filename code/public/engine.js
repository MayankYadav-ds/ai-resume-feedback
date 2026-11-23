import {renderPrompt} from './prompts.js';
const skills = {
  JavaScript:['javascript'], TypeScript:['typescript'], Python:['python'], Java:['java'],
  'C++':['c++'], 'C#':['c#'], React:['react','reactjs','react.js'], Node:['node','nodejs','node.js'],
  SQL:['sql'], PostgreSQL:['postgresql','postgres'], MongoDB:['mongodb'], HTML:['html'], CSS:['css'],
  Docker:['docker'], Kubernetes:['kubernetes','k8s'], AWS:['aws','amazon web services'], Azure:['azure'],
  Git:['git'], 'CI/CD':['ci/cd','continuous integration','continuous delivery'], Agile:['agile','scrum'],
  'REST APIs':['rest','restful','rest api'], Linux:['linux'], Excel:['excel'], 'Power BI':['power bi'],
  Tableau:['tableau'], 'Machine learning':['machine learning'], TensorFlow:['tensorflow'], PyTorch:['pytorch'],
  Communication:['communication'], Leadership:['leadership'], 'Project management':['project management'],
  Testing:['testing','unit tests','unit testing'], Figma:['figma'], 'Data analysis':['data analysis','data analytics']
};
function contains(text,term){
  const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp(`(?<![a-z0-9+#])${escaped}(?![a-z0-9+#])`,'i').test(text);
}
export function analyze(resume,job){
  if(!resume.trim() || !job.trim()) throw new Error('Add both your resume and the job description.');
  if(resume.length>30000 || job.length>30000) throw new Error('Keep each input under 30,000 characters.');
  const required=Object.entries(skills).filter(([,aliases])=>aliases.some(t=>contains(job,t)));
  const matched=required.filter(([,aliases])=>aliases.some(t=>contains(resume,t))).map(([name])=>name);
  const missing=required.map(([name])=>name).filter(name=>!matched.includes(name));
  const bullets=resume.split(/\n/).map(s=>s.trim()).filter(s=>/^[-•*]\s+/.test(s)).slice(0,3).map(s=>s.replace(/^[-•*]\s+/,''));
  return {score:required.length ? Math.round(matched.length/required.length*100):null,matched,missing,total:required.length,
    bullets:bullets.map(before=>({before,after:before.replace(/^Worked with a team on /i,'Collaborated with a team on ').replace(/^Responsible for /i,'Handled '),note:'Conservative wording only. Add outcomes or metrics only if you can verify them; use the AI workflow for deeper editing.'}))};
}
export function buildPrompt(resume,job,version='v3'){
  return renderPrompt(resume,job,version);
}
