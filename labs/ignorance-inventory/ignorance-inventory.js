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
    {key:'known',title:'Known facts',sub:'Evidence you can currently defend',value:known,color:'#2563eb',move:'Use as a starting point'},
    {key:'assumptions',title:'Assumptions',sub:'Beliefs holding the decision together',value:assumptions,color:'#f59e0b',move:'Test the premise'},
    {key:'questions',title:'Known unknowns',sub:'Questions that can be turned into probes',value:knownUnknowns,color:'#7c3aed',move:'Run a small probe'},
    {key:'surprises',title:'Unknown unknowns',sub:'Exposure to surprise or regime change',value:unknownUnknowns,color:'#dc2626',move:'Add guardrails'}
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
  drawBackground();drawBoard();drawMeters();if(probePulse>0)drawActionHighlight('probe');if(shockPulse>0)drawActionHighlight('shock')
}
function drawBackground(){haloText('Ignorance inventory',410,56,'900 24px Georgia','#124e7f');haloText('Sort uncertainty before choosing the next move',410,84,'bold 13px Arial','#52677d');haloText(cycle?'Cycle '+cycle:'No cycles yet',746,94,'900 13px Arial',cycle?'#124e7f':'#64748b','right')}
function currentRows(){return rows.length?rows:[
  {key:'known',title:'Known facts',sub:'Evidence you can currently defend',value:38,color:'#2563eb',move:'Use as a starting point'},
  {key:'assumptions',title:'Assumptions',sub:'Beliefs holding the decision together',value:42,color:'#f59e0b',move:'Test the premise'},
  {key:'questions',title:'Known unknowns',sub:'Questions that can be turned into probes',value:46,color:'#7c3aed',move:'Run a small probe'},
  {key:'surprises',title:'Unknown unknowns',sub:'Exposure to surprise or regime change',value:44,color:'#dc2626',move:'Add guardrails'}
]}
function drawBoard(){
  haloText('Inventory board',315,126,'900 15px Arial','#124e7f');
  haloText('Category',125,154,'bold 11px Arial','#52677d','left');
  haloText('Pressure',440,154,'bold 11px Arial','#52677d','left');
  haloText('Next move',610,154,'bold 11px Arial','#52677d','left');
  currentRows().forEach((r,i)=>drawRow(r,170+i*78,i));
}
function drawRow(r,y,i){
  const x=70,w=650,h=62;
  ctx.fillStyle='rgba(255,255,255,.70)';ctx.strokeStyle='rgba(219,234,254,.95)';ctx.lineWidth=2;roundRect(x,y,w,h,18,true,true);
  ctx.fillStyle=r.color;ctx.beginPath();ctx.arc(x+30,y+31,13,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=r.color;ctx.font='900 15px Arial';ctx.textAlign='left';ctx.fillText(r.title,x+54,y+25);
  ctx.fillStyle='#52677d';ctx.font='bold 11px Arial';ctx.fillText(r.sub,x+54,y+43);
  const bx=320,by=y+24,bw=170,bh=16;
  ctx.fillStyle='rgba(148,163,184,.20)';roundRect(bx,by,bw,bh,8,true,false);
  ctx.fillStyle=r.color;roundRect(bx,by,bw*(r.value/100),bh,8,true,false);
  haloText(Math.round(r.value)+' / 100',bx+bw+46,y+38,'900 12px Arial',r.color);
  ctx.fillStyle='rgba(248,250,252,.95)';ctx.strokeStyle='rgba(219,234,254,.9)';ctx.lineWidth=1.5;roundRect(590,y+15,110,32,14,true,true);
  haloText(r.move,645,y+36,'bold 10px Arial','#334155');
}
function drawMeters(){
  const x=575,y=454;
  ctx.fillStyle='rgba(255,255,255,.62)';ctx.strokeStyle='rgba(219,234,254,.9)';ctx.lineWidth=2;roundRect(560,438,185,84,20,true,true);
  smallMeter('clarity',clarity,578,463,'#2563eb');
  smallMeter('exposure',exposure,578,488,'#dc2626');
  smallMeter('learning',learning,578,513,'#16a34a');
}
function smallMeter(name,val,x,y,c){ctx.fillStyle='#52677d';ctx.font='bold 10px Arial';ctx.textAlign='left';ctx.fillText(name,x,y);ctx.fillStyle='rgba(148,163,184,.20)';roundRect(x+68,y-10,78,10,5,true,false);ctx.fillStyle=c;roundRect(x+68,y-10,78*(val/100),10,5,true,false);ctx.textAlign='right';ctx.font='900 10px Arial';ctx.fillStyle=c;ctx.fillText(Math.round(val),x+160,y)}
function drawActionHighlight(kind){
  if(kind==='probe'){
    const y=170+2*78;ctx.strokeStyle='rgba(22,163,74,.85)';ctx.lineWidth=4;ctx.setLineDash([10,8]);roundRect(62,y-8,666,78,22,false,true);ctx.setLineDash([]);haloText('probe running',395,y+84,'900 13px Arial','#15803d')
  } else {
    const y=170+3*78;ctx.strokeStyle='rgba(220,38,38,.82)';ctx.lineWidth=4;ctx.setLineDash([12,8]);roundRect(62,y-8,666,78,22,false,true);ctx.setLineDash([]);haloText('surprise revealed',395,y+84,'900 13px Arial','#b91c1c')
  }
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