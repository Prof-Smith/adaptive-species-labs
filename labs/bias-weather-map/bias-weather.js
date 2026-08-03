const $ = id => document.getElementById(id);
const levels={
  pressure:v=>v<35?['Calm pressure','There is enough time to think before acting.']:v<70?['Building pressure','Speed is starting to feel like quality.']:['High pressure','Urgency is pushing the decision toward reflex.'],
  ambiguity:v=>v<35?['Clear evidence','The facts are relatively readable.']:v<70?['Cloudy evidence','The situation leaves room for stories to fill gaps.']:['Thick ambiguity','The evidence is unclear enough that the mind wants shortcuts.'],
  social:v=>v<35?['Independent setting','Other people are not strongly shaping the decision.']:v<70?['Noticeable social pull','Other people’s behavior is starting to feel informative.']:['Strong herd pressure','The crowd is becoming a substitute for evidence.']
};
const profiles={
  action:{name:'Action bias',sub:'Urgency makes doing something feel safer than thinking.',why:['Pressure is high enough that speed feels like control.','The decision maker may confuse motion with judgment.'],protectiveTitle:'Protective move: slow the first move',protectiveText:'Add a short pause or pre-commitment rule before acting.'},
  narrative:{name:'Narrative filling',sub:'Ambiguity invites a coherent story before evidence deserves one.',why:['Ambiguity is high, so missing evidence gets filled with explanation.','A clean story can become more persuasive than the facts.'],protectiveTitle:'Protective move: separate evidence from story',protectiveText:'List what is known, assumed, and still missing before accepting the explanation.'},
  herd:{name:'Herding',sub:'Social pull makes the crowd feel like proof.',why:['Social pull is high enough that other people’s behavior becomes persuasive.','The crowd can start to substitute for independent evidence.'],protectiveTitle:'Protective move: create dissent',protectiveText:'Ask one person or group to build the strongest case against the crowd.'},
  proof:{name:'Social proof',sub:'When unclear, others seem informative.',why:['Ambiguity makes private evidence feel incomplete.','Social pull makes the crowd easier to trust.'],protectiveTitle:'Protective move: ask for base rates',protectiveText:'Before following the crowd, ask what usually happens in similar situations.'},
  overconfidence:{name:'Overconfidence under pressure',sub:'Urgency plus uncertainty makes confidence feel useful.',why:['Pressure rewards fast closure.','Ambiguity makes confidence attractive even when evidence is incomplete.'],protectiveTitle:'Protective move: write a confidence range',protectiveText:'Force the decision maker to state what would change the estimate.'},
  storm:{name:'Bias storm',sub:'Pressure, ambiguity, and social pull are all reinforcing shortcuts.',why:['Pressure pushes action.','Ambiguity invites stories.','Social pull makes the crowd feel like evidence.'],protectiveTitle:'Protective move: redesign the environment',protectiveText:'Slow the decision, add dissent, and require base rates before commitment.'},
  balanced:{name:'Manageable weather',sub:'No single force dominates the decision environment.',why:['The environment still contains bias risk, but no one force overwhelms judgment.','This is a good moment to use a simple decision checklist.'],protectiveTitle:'Protective move: use a checklist',protectiveText:'Name facts, assumptions, missing information, and one disconfirming test.'}
};
function setLabels(){
  const p=+$('pressure').value,a=+$('ambiguity').value,s=+$('social').value;
  const [pn,pt]=levels.pressure(p),[an,at]=levels.ambiguity(a),[sn,st]=levels.social(s);
  $('pressureLevel').textContent=pn.split(' ')[0]; $('pressureName').textContent=pn; $('pressureText').textContent=pt;
  $('ambiguityLevel').textContent=an.split(' ')[0]; $('ambiguityName').textContent=an; $('ambiguityText').textContent=at;
  $('socialLevel').textContent=sn.split(' ')[0]; $('socialName').textContent=sn; $('socialText').textContent=st;
  $('fogLayer').style.opacity=(.2+a/120).toFixed(2);
  $('pressureWind').style.strokeWidth=(3+p/18).toFixed(1);
  $('ambiguityFog').style.strokeWidth=(3+a/18).toFixed(1);
  $('socialCurrent').style.strokeWidth=(3+s/18).toFixed(1);
  $('stormRing').style.opacity=(.25+(p+a+s)/420).toFixed(2);
  return {p,a,s};
}
function decideBias({p,a,s}){
  if(p>72 && a>72 && s>72) return 'storm';
  if(p>68 && a>60) return 'overconfidence';
  if(a>62 && s>60) return 'proof';
  if(p>70 && p>=a && p>=s) return 'action';
  if(a>70 && a>=p && a>=s) return 'narrative';
  if(s>70 && s>=p && s>=a) return 'herd';
  if(Math.max(p,a,s)<45) return 'balanced';
  if(a>=s && a>=p) return 'narrative';
  if(s>=a && s>=p) return 'herd';
  return 'action';
}
function update(){
  const env=setLabels();
  const profile=profiles[decideBias(env)];
  $('biasName').textContent=profile.name;
  $('biasSub').textContent=profile.sub;
  $('resultBias').textContent=profile.name;
  $('resultWhy').textContent=profile.sub;
  $('whyList').innerHTML=profile.why.map(x=>`<li>${x}</li>`).join('');
  $('protectiveTitle').textContent=profile.protectiveTitle;
  $('protectiveText').textContent=profile.protectiveText;
}
function storm(){
  $('pressure').value=Math.round(65+Math.random()*35);
  $('ambiguity').value=Math.round(65+Math.random()*35);
  $('social').value=Math.round(55+Math.random()*45);
  update();
}
['pressure','ambiguity','social'].forEach(id=>$(id).addEventListener('input',update));
$('stormButton').addEventListener('click',storm);
update();
