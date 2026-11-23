export function validateReview(value,resume,job) {
  const errors=[];
  if(!value || typeof value!=='object' || Array.isArray(value)) return ['Output must be a JSON object.'];
  if(typeof value.summary!=='string' || !value.summary.trim()) errors.push('summary must be non-empty text.');
  for(const key of ['matched_skills','gaps','rewrites','next_steps']) if(!Array.isArray(value[key])) errors.push(`${key} must be an array.`);
  if(errors.length) return errors;
  function quote(text,source,label) {
    if(typeof text!=='string' || !text.trim() || !source.includes(text)) errors.push(`${label}: quote not found in source.`);
  }
  for(const item of value.matched_skills) {
    if(!item || typeof item.skill!=='string') errors.push('Matched skill needs a name.');
    quote(item?.resume_quote,resume,'Matched skill');
  }
  for(const item of value.gaps) {
    if(!item || typeof item.skill!=='string') errors.push('Gap needs a name.');
    quote(item?.job_quote,job,'Gap');
  }
  if(value.rewrites.length>3) errors.push('At most three rewrites are allowed.');
  for(const item of value.rewrites) {
    quote(item?.before,resume,'Original bullet');quote(item?.evidence,resume,'Rewrite evidence');
    if(typeof item?.after!=='string' || !item.after.trim()) errors.push('Rewrite must contain text.');
    if(item?.clarification_needed!==null && typeof item?.clarification_needed!=='string') errors.push('clarification_needed must be text or null.');
    for(const number of (typeof item?.after==='string'?item.after:'').match(/\d+(?:[.,]\d+)*(?:%)?/g)||[]) {
      if(!String(item?.before||'').includes(number) && !String(item?.evidence||'').includes(number)) errors.push(`Rewrite contains unsupported number: ${number}`);
    }
  }
  if(value.next_steps.some(x=>typeof x!=='string')) errors.push('next_steps must contain text only.');
  return errors;
}
