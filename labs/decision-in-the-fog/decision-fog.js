const $ = id => document.getElementById(id);
let choice = 'stage';
const levels = {
  clarity: v => v < 35 ? ['Foggy signal','Evidence is thin. Assumptions dominate the map.'] : v < 70 ? ['Mixed signal','Some evidence is available, but assumptions still matter.'] : ['Clearer signal','Evidence is relatively strong. Acting can be more justified.'],
  pressure: v => v < 35 ? ['Open window','There is enough time to learn before committing.'] : v < 70 ? ['Narrowing window','Waiting has a cost, but rushing can still damage the process.'] : ['Urgent window','Delay is costly. The decision may need action before comfort arrives.'],
  stakes: v => v < 35 ? ['Reversible stakes','The consequences are modest or recoverable.'] : v < 70 ? ['Meaningful stakes','The consequences matter enough to require explicit uncertainty.'] : ['High stakes','The cost of being wrong is significant. Process discipline matters.']
};
function labelValue(id, spanId){ const v=+$(`${id}`).value; const [name,text]=levels[id](v); $(`${spanId}Level`).textContent = name.split(' ')[0] || name; return [v,name,text]; }
function updateEnvironment(){
  const [c,cn,ct]=labelValue('clarity','clarity'); const [p,pn,pt]=labelValue('pressure','pressure'); const [s,sn,st]=labelValue('stakes','stakes');
  $('evidenceName').textContent=cn; $('evidenceText').textContent=ct; $('timingName').textContent=pn; $('timingText').textContent=pt; $('stakesName').textContent=sn; $('stakesText').textContent=st;
  return {clarity:c, pressure:p, stakes:s};
}
function pathFit(env){
  const {clarity:c, pressure:p, stakes:s}=env;
  if(choice==='commit'){
    let fit = 44 + c*.35 + p*.22 - Math.max(0,70-s)*.08;
    return Math.max(0,Math.min(100,fit));
  }
  if(choice==='stage'){
    let uncertainty = 100-c;
    let fit = 62 + uncertainty*.18 + s*.10 - Math.max(0,p-82)*.35;
    return Math.max(0,Math.min(100,fit));
  }
  if(choice==='wait'){
    let fit = 68 + (100-c)*.22 - p*.35 - s*.12;
    return Math.max(0,Math.min(100,fit));
  }
}
function processScore(env){
  let prep = 0;
  if($('assumption').checked) prep += 12;
  if($('unknown').checked) prep += 12;
  if($('trigger').checked) prep += 16;
  let fit = pathFit(env);
  return Math.round(Math.max(0,Math.min(100, 28 + prep + fit*.44)));
}
function outcome(env, proc){
  // Higher clarity and good process help. Higher stakes and urgency increase downside exposure.
  let goodProb = .38 + env.clarity*.003 + proc*.003 - env.stakes*.0016 - Math.max(0,env.pressure-65)*.0015;
  if(choice==='stage') goodProb += .06;
  if(choice==='wait' && env.pressure>70) goodProb -= .15;
  if(choice==='commit' && env.clarity<35) goodProb -= .12;
  goodProb = Math.max(.08,Math.min(.90,goodProb));
  const good = Math.random() < goodProb;
  const score = Math.round((good ? 55 + Math.random()*35 : 15 + Math.random()*35));
  return {good, score, prob:goodProb};
}
function roomKey(procGood, outGood){ return procGood&&outGood?'gg':procGood&&!outGood?'gb':!procGood&&outGood?'bg':'bb'; }
const roomLabels={gg:['Skill plus luck','Good process met a favorable outcome. Reinforce the process, but do not overcredit certainty.'],gb:['Discipline tested','The process was sound, but the world answered badly. Review assumptions without punishing good judgment.'],bg:['Luck disguised as wisdom','The outcome looked good, but the process was weak. This is the danger zone for overlearning.'],bb:['Failure with evidence','The process was weak and the outcome was bad. This is painful, but useful if the lesson is captured.']};
function explain(env, proc, out){
  const reasons=[];
  const fit=Math.round(pathFit(env));
  reasons.push(`Path fit score: ${fit}. ${choice==='commit'?'Commit works best when evidence is clearer or time pressure is high.':choice==='stage'?'Stage works best when uncertainty and stakes both matter.':'Wait works best when evidence is poor and time pressure is low.'}`);
  const prep=[]; if($('assumption').checked) prep.push('assumption named'); if($('unknown').checked) prep.push('unknown named'); if($('trigger').checked) prep.push('update trigger named');
  reasons.push(prep.length?`Preparation visible: ${prep.join(', ')}.`:'Preparation was thin: the pre-outcome mind was not made visible.');
  if(env.clarity<35) reasons.push('Evidence clarity was low, so outcome risk remained high even with a careful process.');
  if(env.pressure>70) reasons.push('Time pressure was high, so waiting became costly and paths were less forgiving.');
  if(env.stakes>70) reasons.push('Stakes were high, increasing the cost of uncertainty.');
  reasons.push(`Outcome was ${out.good?'favorable':'unfavorable'}; estimated favorable-outcome chance was about ${Math.round(out.prob*100)}%.`);
  return reasons;
}
function reveal(){
  const env=updateEnvironment(); const proc=processScore(env); const out=outcome(env,proc); const procGood=proc>=65; const key=roomKey(procGood,out.good);
  $('processScore').textContent=proc; $('processSub').innerHTML=procGood?'<span class="good">Good process</span> before the ending.':'<span class="bad">Weak process</span> before the ending.';
  $('outcomeScore').textContent=out.score; $('outcomeSub').innerHTML=out.good?'<span class="good">Favorable outcome</span> in this run.':'<span class="bad">Unfavorable outcome</span> in this run.';
  $('roomName').textContent=roomLabels[key][0]; $('roomSub').textContent=roomLabels[key][1];
  document.querySelectorAll('.room').forEach(r=>r.classList.remove('active')); $('room-'+key).classList.add('active');
  $('whyText').textContent = `This landed in “${roomLabels[key][0]}” because process quality and outcome quality are being judged separately.`;
  $('whyList').innerHTML = explain(env,proc,out).map(x=>`<li>${x}</li>`).join('');
}
document.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{ choice=btn.dataset.choice; document.querySelectorAll('[data-choice]').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected');}));
['clarity','pressure','stakes'].forEach(id=>$(id).addEventListener('input',updateEnvironment));
['assumption','unknown','trigger'].forEach(id=>$(id).addEventListener('change',()=>{}));
$('reveal').addEventListener('click',reveal);
updateEnvironment();
