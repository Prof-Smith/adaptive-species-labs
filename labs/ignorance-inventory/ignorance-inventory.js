const $=id=>document.getElementById(id);
const canvas=$('ignoranceCanvas'),ctx=canvas.getContext('2d');
let running=false,cycle=0,clarity=0,exposure=0,learning=0,probePulse=0,shockPulse=0,rows=[];
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
function reset(){running=false;cycle=0;clarity=0;exposure=0;learning=0;probePulse=0;shockPulse=0;rows=[];$('runButton').textContent='Run inventory';draw();updateFeedback()}
function makeRows(){
  const {e,n,s}=labels();
  const known=clamp(e*.70 + (100-n)*.12 + Math.random()*8);
  const assumptions=clamp((100-e)*.38 + n*.21 + s*.10 + Math.random()*6);
  const knownUnknowns=clamp((100-e)*.24 + n*.32 + s*.18 + Math.random()*8);
  const unknownUnknowns=clamp(n*.44 + (100-e)*.22 + s*.18 + Math.random()*10);
  return [
    {key:'known',title:'Known facts',sub:'Defensible evidence',value:known,color:'#2563eb',move:'Use carefully'},
    {key:'assumptions',title:'Assumptions',sub:'Premises to test',value:assumptions,color:'#f59e0b',move:'Test premise'},
    {key:'questions',title:'Known unknowns',sub:'Testable questions',value:knownUnknowns,color:'#7c3aed',move:'Run probe'},
    {key:'surprises',title:'Unknown unknowns',sub:'Surprise exposure',value:unknownUnknowns,color:'#dc2626',move:'Add guardrails'}
  ];
}
function step(){
  rows=makeRows();cycle++;
  const known=rows[0].value,assumptions=rows[1].value,knownUnknowns=rows[2].value,unknownUnknowns=rows[3].value;
  clarity=clamp(clarity*.62 + known*.38);
  exposure=clamp(exposure*.64 + Math.max(assumptions,unknownUnknowns)*.36);
  learning=clamp(learning*.64 + (knownUnknowns*.22 + assumptions*.16 + probePulse*3)*.36);
  if(probePulse>0)probePulse--; if(shockPulse>0)shockPulse--;
  draw();updateFeedback()
}
function loop(){if(running){step();setTimeout(loop,780)}}
function toggle(){running=!running;$('runButton').textContent=running?'Pause':'Run inventory';if(running)loop()}
function runProbe(){running=false;$('runButton').textContent='Run inventory';probePulse=10;learning=clamp(learning+18);exposure=clamp(exposure-8);step()}
function revealShock(){running=false;$('runButton').textContent='Run inventory';shockPulse=10;exposure=clamp(exposure+22);learning=clamp(learning+8);step()}
function haloText(txt,x,y,font,fill,align='center',w=5){ctx.textAlign=align;ctx.font=font;ctx.lineWidth=w;ctx.strokeStyle='rgba(255,255,255,.94)';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function draw(){
  labels();ctx.clearRect(0,0,820,560);const bg=ctx.createLinearGradient(0,0,820,560);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.58,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,820,560);
  drawBackground();drawBoard();if(probePulse>0)drawActionHighlight('probe');if(shockPulse>0)drawActionHighlight('shock')
}
function drawBackground(){haloText('Ignorance inventory',410,56,'900 24px Georgia','#124e7f');haloText('Sort uncertainty before choosing the next move',410,84,'bold 13px Arial','#52677d');haloText(cycle?'Cycle '+cycle:'No cycles yet',746,94,'900 13px Arial',cycle?'#124e7f':'#64748b','right')}
function currentRows(){return rows.length?rows:[
  {key:'known',title:'Known facts',sub:'Defensible evidence',value:38,color:'#2563eb',move:'Use carefully'},
  {key:'assumptions',title:'Assumptions',sub:'Premises to test',value:42,color:'#f59e0b',move:'Test premise'},
  {key:'questions',title:'Known unknowns',sub:'Testable questions',value:46,color:'#7c3aed',move:'Run probe'},
  {key:'surprises',title:'Unknown unknowns',sub:'Surprise exposure',value:44,color:'#dc2626',move:'Add guardrails'}
]}
function drawBoard(){
  haloText('Inventory board',410,126,'900 16px Arial','#124e7f');
  ctx.textAlign='left';ctx.font='bold 11px Arial';ctx.fillStyle='#52677d';
  ctx.fillText('Category',112,154);
  ctx.fillText('Pressure',410,154);
  ctx.fillText('Next move',642,154);
  currentRows().forEach((r,i)=>drawRow(r,174+i*74,i));
}
function drawRow(r,y,i){
  const x=74,w=672,h=58;
  ctx.fillStyle='rgba(255,255,255,.76)';ctx.strokeStyle='rgba(219,234,254,.95)';ctx.lineWidth=2;roundRect(x,y,w,h,18,true,true);
  ctx.fillStyle=r.color;ctx.beginPath();ctx.arc(x+28,y+29,13,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=r.color;ctx.font='900 15px Arial';ctx.textAlign='left';ctx.fillText(r.title,x+54,y+24);
  ctx.fillStyle='#52677d';ctx.font='bold 11px Arial';ctx.fillText(r.sub,x+54,y+43);
  const bx=382,by=y+22,bw=150,bh=15;
  ctx.fillStyle='rgba(148,163,184,.20)';roundRect(bx,by,bw,bh,8,true,false);
  ctx.fillStyle=r.color;roundRect(bx,by,bw*(r.value/100),bh,8,true,false);
  haloText(Math.round(r.value)+' / 100',bx+bw+45,y+36,'900 12px Arial',r.color);
  ctx.fillStyle='rgba(248,250,252,.96)';ctx.strokeStyle='rgba(219,234,254,.9)';ctx.lineWidth=1.5;roundRect(634,y+13,92,32,14,true,true);
  haloText(r.move,680,y+34,'bold 10px Arial','#334155');
}
function drawActionHighlight(kind){
  const rowIndex=kind==='probe'?2:3;
  const y=174+rowIndex*74;
  ctx.strokeStyle=kind==='probe'?'rgba(22,163,74,.85)':'rgba(220,38,38,.82)';
  ctx.lineWidth=4;ctx.setLineDash(kind==='probe'?[10,8]:[12,8]);roundRect(66,y-7,688,72,22,false,true);ctx.setLineDash([]);
  haloText(kind==='probe'?'probe running':'surprise revealed',410,y+78,'900 13px Arial',kind==='probe'?'#15803d':'#b91c1c')
}
function updateFeedback(){const {e,n,s}=labels();$('clarityMetric').textContent=Math.round(clarity)+' / 100';$('exposureMetric').textContent=Math.round(exposure)+' / 100';$('learningMetric').textContent=Math.round(learning)+' / 100';
  if(!cycle){$('stateName').textContent='Inventory ready';$('stateText').textContent='Run a cycle to classify the decision environment.'}
  else if(exposure>70&&learning<48){$('stateName').textContent='Hidden exposure';$('stateText').textContent='The decision has too much untested uncertainty for confident commitment.'}
  else if(learning>62&&exposure<58){$('stateName').textContent='Learning posture';$('stateText').textContent='The decision has active probes and better placement of attention.'}
  else if(clarity>65&&exposure<55){$('stateName').textContent='Usable clarity';$('stateText').textContent='The visible facts are strong enough for a small, reversible move.'}
  else{$('stateName').textContent='Mixed uncertainty';$('stateText').textContent='Some facts are visible, but assumptions and unknowns still need attention.'}
  $('whyList').innerHTML=[`Evidence: ${$('evidenceLevel').textContent}.`,`Novelty: ${$('noveltyLevel').textContent}.`,`Stakes: ${$('stakesLevel').textContent}.`,`Cycle count: ${cycle}.`].map(x=>`<li>${x}</li>`).join('');
  $('moveText').textContent=exposure>70?'Run a small probe before committing. Name the assumption most likely to fail.':learning<45?'Convert one known unknown into a testable question.':'Keep the inventory visible and update it as evidence changes.'}
['evidence','novelty','stakes'].forEach(id=>$(id).addEventListener('input',()=>{draw();updateFeedback()}));$('runButton').addEventListener('click',toggle);$('stepButton').addEventListener('click',()=>{if(running){running=false;$('runButton').textContent='Run inventory'}step()});$('probeButton').addEventListener('click',runProbe);$('shockButton').addEventListener('click',revealShock);$('resetButton').addEventListener('click',reset);reset();