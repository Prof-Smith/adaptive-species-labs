const $=id=>document.getElementById(id);
const canvas=$('ignoranceCanvas'),ctx=canvas.getContext('2d');
let running=false,cycle=0,clarity=0,exposure=0,learning=0,probePulse=0,shockPulse=0,points=[];
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,x))}
function labels(){
  const e=+$('evidence').value,n=+$('novelty').value,s=+$('stakes').value;
  $('evidenceLevel').textContent=e<35?'Thin':e<70?'Mixed':'Rich';
  $('noveltyLevel').textContent=n<35?'Familiar':n<70?'Moderate':'New terrain';
  $('stakesLevel').textContent=s<35?'Low':s<70?'High':'Critical';
  $('evidenceName').textContent=e<35?'Thin evidence':e<70?'Mixed evidence':'Rich evidence';
  $('evidenceText').textContent=e<35?'The decision rests on limited or noisy information.':e<70?'Some facts are visible, but important premises still need testing.':'The visible facts are relatively strong, though not complete.';
  $('noveltyName').textContent=n<35?'Familiar terrain':n<70?'Moderate novelty':'New terrain';
  $('noveltyText').textContent=n<35?'Past experience is useful, though it still needs checking.':n<70?'Past experience helps, but transfer is not automatic.':'Old patterns may mislead because the environment has changed.';
  $('stakesName').textContent=s<35?'Low stakes':s<70?'High stakes':'Critical stakes';
  $('stakesText').textContent=s<35?'Small reversible steps are available.':s<70?'The decision needs more guardrails before commitment.':'The decision needs learning before major commitment.';
  return{e,n,s}
}
function reset(){running=false;cycle=0;clarity=0;exposure=0;learning=0;probePulse=0;shockPulse=0;points=[];$('runButton').textContent='Run inventory';draw();updateFeedback()}
function step(){
  const {e,n,s}=labels();cycle++;
  const known=clamp(e*.70 + (100-n)*.12 + Math.random()*8);
  const assumptions=clamp((100-e)*.38 + n*.22 + s*.10 + Math.random()*6);
  const knownUnknowns=clamp((100-e)*.25 + n*.34 + s*.18 + Math.random()*8);
  const unknownUnknowns=clamp(n*.46 + (100-e)*.22 + s*.18 + Math.random()*10);
  clarity=clamp(clarity*.62 + known*.38);
  exposure=clamp(exposure*.64 + Math.max(assumptions,unknownUnknowns)*.36);
  learning=clamp(learning*.64 + (knownUnknowns*.22 + assumptions*.16 + probePulse*3)*.36);
  points=[
    {name:'Known facts',value:known,color:'#2563eb',x:205,y:205},
    {name:'Assumptions',value:assumptions,color:'#f59e0b',x:435,y:205},
    {name:'Known unknowns',value:knownUnknowns,color:'#7c3aed',x:205,y:360},
    {name:'Unknown unknowns',value:unknownUnknowns,color:'#dc2626',x:435,y:360}
  ];
  if(probePulse>0)probePulse--; if(shockPulse>0)shockPulse--;
  draw();updateFeedback()
}
function loop(){if(running){step();setTimeout(loop,780)}}
function toggle(){running=!running;$('runButton').textContent=running?'Pause':'Run inventory';if(running)loop()}
function runProbe(){running=false;$('runButton').textContent='Run inventory';probePulse=10;learning=clamp(learning+18);exposure=clamp(exposure-8);step()}
function revealShock(){running=false;$('runButton').textContent='Run inventory';shockPulse=10;exposure=clamp(exposure+22);learning=clamp(learning+8);step()}
function haloText(txt,x,y,font,fill,align='center',w=5){ctx.textAlign=align;ctx.font=font;ctx.lineWidth=w;ctx.strokeStyle='rgba(255,255,255,.94)';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function draw(){labels();ctx.clearRect(0,0,820,560);const bg=ctx.createLinearGradient(0,0,820,560);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.58,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,820,560);drawBackground();drawMatrix();drawBubbles();drawLegendMeters();if(probePulse>0)drawProbe();if(shockPulse>0)drawShock()}
function drawBackground(){haloText('Ignorance inventory',410,58,'900 24px Georgia','#124e7f');haloText('Classify what you know, what you assume, and what could still surprise you',410,86,'bold 13px Arial','#52677d');haloText(cycle?'Cycle '+cycle:'No cycles yet',746,92,'900 13px Arial',cycle?'#124e7f':'#64748b','right')}
function drawMatrix(){
  ctx.strokeStyle='rgba(18,78,127,.16)';ctx.lineWidth=2;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(320,135);ctx.lineTo(320,425);ctx.moveTo(105,282);ctx.lineTo(535,282);ctx.stroke();ctx.setLineDash([]);
  zone(105,135,210,140,'Known facts','#2563eb','Defensible evidence');
  zone(325,135,210,140,'Assumptions','#f59e0b','Premises to test');
  zone(105,290,210,140,'Known unknowns','#7c3aed','Questions to answer');
  zone(325,290,210,140,'Unknown unknowns','#dc2626','Surprise exposure');
}
function zone(x,y,w,h,title,color,sub){ctx.fillStyle='rgba(255,255,255,.58)';ctx.strokeStyle='rgba(219,234,254,.9)';ctx.lineWidth=2;roundRect(x,y,w,h,22,true,true);haloText(title,x+w/2,y+30,'900 14px Arial',color);haloText(sub,x+w/2,y+55,'bold 11px Arial','#52677d')}
function drawBubbles(){if(!points.length){[{name:'Known facts',value:38,color:'#2563eb',x:205,y:205},{name:'Assumptions',value:42,color:'#f59e0b',x:435,y:205},{name:'Known unknowns',value:46,color:'#7c3aed',x:205,y:360},{name:'Unknown unknowns',value:44,color:'#dc2626',x:435,y:360}].forEach(drawBubble);return} points.forEach(drawBubble)}
function drawBubble(p){const r=18+p.value*.22;ctx.fillStyle=p.color.replace(')',',.14)').replace('rgb','rgba');ctx.beginPath();ctx.arc(p.x,p.y,r+12,0,Math.PI*2);ctx.fill();ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke();haloText(Math.round(p.value),p.x,p.y+5,'900 16px Arial','#fff');}
function drawLegendMeters(){bar('clarity',clarity,585,170,'#2563eb');bar('exposure',exposure,585,270,'#dc2626');bar('learning',learning,585,370,'#16a34a')}
function bar(name,val,x,y,c){ctx.fillStyle='#52677d';ctx.font='bold 12px Arial';ctx.textAlign='left';ctx.fillText(name,x,y);ctx.fillStyle='rgba(148,163,184,.22)';roundRect(x,y+12,170,15,8,true,false);ctx.fillStyle=c;roundRect(x,y+12,170*(val/100),15,8,true,false);haloText(Math.round(val)+' / 100',x+85,y+49,'900 13px Arial',c)}
function drawProbe(){ctx.strokeStyle='rgba(22,163,74,.85)';ctx.lineWidth=5;ctx.setLineDash([10,8]);ctx.beginPath();ctx.arc(205,360,70+probePulse*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);haloText('probe',205,455,'900 13px Arial','#15803d')}
function drawShock(){ctx.strokeStyle='rgba(220,38,38,.80)';ctx.lineWidth=5;ctx.setLineDash([12,8]);ctx.beginPath();ctx.arc(435,360,76+shockPulse*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);haloText('surprise revealed',435,455,'900 13px Arial','#b91c1c')}
function updateFeedback(){const {e,n,s}=labels();$('clarityMetric').textContent=Math.round(clarity)+' / 100';$('exposureMetric').textContent=Math.round(exposure)+' / 100';$('learningMetric').textContent=Math.round(learning)+' / 100';
  if(!cycle){$('stateName').textContent='Inventory ready';$('stateText').textContent='Run a cycle to classify the decision environment.'}
  else if(exposure>70&&learning<48){$('stateName').textContent='Hidden exposure';$('stateText').textContent='The decision has too much untested uncertainty for confident commitment.'}
  else if(learning>62&&exposure<58){$('stateName').textContent='Learning posture';$('stateText').textContent='The decision has active probes and better placement of attention.'}
  else if(clarity>65&&exposure<55){$('stateName').textContent='Usable clarity';$('stateText').textContent='The visible facts are strong enough for a small, reversible move.'}
  else{$('stateName').textContent='Mixed uncertainty';$('stateText').textContent='Some facts are visible, but assumptions and unknowns still need attention.'}
  $('whyList').innerHTML=[`Evidence: ${$('evidenceLevel').textContent}.`,`Novelty: ${$('noveltyLevel').textContent}.`,`Stakes: ${$('stakesLevel').textContent}.`,`Cycle count: ${cycle}.`].map(x=>`<li>${x}</li>`).join('');
  $('moveText').textContent=exposure>70?'Run a small probe before committing. Name the assumption most likely to fail.':learning<45?'Convert one known unknown into a testable question.':'Keep the inventory visible and update it as evidence changes.'}
['evidence','novelty','stakes'].forEach(id=>$(id).addEventListener('input',()=>{draw();updateFeedback()}));$('runButton').addEventListener('click',toggle);$('stepButton').addEventListener('click',()=>{if(running){running=false;$('runButton').textContent='Run inventory'}step()});$('probeButton').addEventListener('click',runProbe);$('shockButton').addEventListener('click',revealShock);$('resetButton').addEventListener('click',reset);reset();