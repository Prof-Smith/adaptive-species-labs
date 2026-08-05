const $=id=>document.getElementById(id);
const canvas=$('waitCanvas'),ctx=canvas.getContext('2d');
let running=false,cycle=0,quality=0,risk=0,learning=0,particles=[],pulse=0;

function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,x))}
function labels(){
  const d=+$('delegation').value,i=+$('inspection').value,t=+$('transfer').value;
  $('delegationLevel').textContent=d<35?'Human-owned':d<70?'Shared':'AI-owned';
  $('inspectionLevel').textContent=i<35?'Thin':i<70?'Partial':'Deep';
  $('transferLevel').textContent=t<35?'Output-only':t<70?'Emerging':'Strong';
  $('workflowName').textContent=d<35?'Human-owned workflow':d<70?'Shared workflow':'AI-owned workflow';
  $('workflowText').textContent=d<35?'AI supports work the human still directs.':d<70?'AI helps, but the human still owns judgment.':'AI is close to owning the work, so bypass risk rises.';
  $('inspectionName').textContent=i<35?'Thin inspection':i<70?'Partial inspection':'Deep inspection';
  $('inspectionText').textContent=i<35?'Fluent output can pass through without enough verification.':i<70?'Some claims are checked, but assumptions may remain hidden.':'Claims, assumptions, and fit are actively inspected.';
  $('transferName').textContent=t<35?'Output-only use':t<70?'Emerging transfer':'Strong transfer';
  $('transferText').textContent=t<35?'The answer may improve while the human learns little.':t<70?'Some learning returns to the human, but practice is uneven.':'The workflow deliberately leaves skill behind.';
  return{d,i,t}
}
function reset(){running=false;cycle=0;quality=0;risk=0;learning=0;particles=[];pulse=0;$('runButton').textContent='Run AI cycle';draw();updateFeedback()}
function spawn(kind){particles.push({kind,age:0,max:76})}
function step(){
  const {d,i,t}=labels();cycle++;pulse=12;
  const product=42+d*.34+i*.24+Math.random()*7;
  const reliance=d*.50+(100-i)*.30+(100-t)*.28;
  const transfer=t*.46+i*.22-d*.14;
  quality=clamp(quality*.64+product*.36);
  risk=clamp(risk*.62+reliance*.38);
  learning=clamp(learning*.66+Math.max(0,transfer)*.34);
  spawn('task');spawn('draft');if(i>25)spawn('review');if(t>28)spawn('return');if(d>68&&(i<48||t<42))spawn('bypass');
  draw();updateFeedback()
}
function loop(){if(running){step();setTimeout(loop,780)}}
function toggle(){running=!running;$('runButton').textContent=running?'Pause':'Run AI cycle';if(running)loop()}
function shortcutMode(){running=false;$('runButton').textContent='Run AI cycle';$('delegation').value=88;$('inspection').value=18;$('transfer').value=16;labels();step()}
function waitMode(){running=false;$('runButton').textContent='Run AI cycle';$('delegation').value=45;$('inspection').value=84;$('transfer').value=80;labels();step()}
function haloText(txt,x,y,font,fill,align='center',w=5){ctx.textAlign=align;ctx.font=font;ctx.lineWidth=w;ctx.strokeStyle='rgba(255,255,255,.94)';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function draw(){
  labels();ctx.clearRect(0,0,820,560);
  const bg=ctx.createLinearGradient(0,0,820,560);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.58,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,820,560);
  drawBackground();
  drawPipeline();    // paths first, cards second, so text is never covered
  drawNodes();
  drawCheckpoint();
  drawMeters();
  drawParticles();
  if(pulse>0)pulse--;
  particles=particles.filter(p=>p.age<p.max)
}
function drawBackground(){
  haloText('WAIT workflow',410,66,'900 24px Georgia','#124e7f');
  haloText('Human task → AI draft → WAIT review → final use, with learning returned below the flow',410,94,'bold 13px Arial','#52677d');
}
function drawArrow(x1,y1,x2,y2,color,w=6,dash=[]){
  ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);
  const ang=Math.atan2(y2-y1,x2-x1);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-12*Math.cos(ang-.45),y2-12*Math.sin(ang-.45));ctx.lineTo(x2-12*Math.cos(ang+.45),y2-12*Math.sin(ang+.45));ctx.closePath();ctx.fill()
}
function drawPolyline(points,color,w=6,dash=[]){
  ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let k=1;k<points.length;k++)ctx.lineTo(points[k][0],points[k][1]);ctx.stroke();ctx.setLineDash([]);
  const a=points[points.length-2],b=points[points.length-1];const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.lineTo(b[0]-12*Math.cos(ang-.45),b[1]-12*Math.sin(ang-.45));ctx.lineTo(b[0]-12*Math.cos(ang+.45),b[1]-12*Math.sin(ang+.45));ctx.closePath();ctx.fill()
}
function drawPipeline(){const {d,i,t}=labels();
  // Main path only occupies the spaces BETWEEN cards. It never crosses labels.
  drawArrow(190,238,298,238,'rgba(249,115,22,.42)',6+d*.022);
  drawArrow(444,238,454,238,'rgba(249,115,22,.38)',5);
  drawArrow(632,238,636,238,'rgba(37,99,235,.34)',5+i*.018);
  // Skill return path is deliberately below the WAIT review box, not through it.
  drawPolyline([[690,306],[690,362],[124,362],[124,300]],'rgba(22,163,74,.34)',5+t*.025,[8,9]);
  // Bypass path routes under the WAIT review box, not across its text.
  if(d>68&&(i<48||t<42))drawPolyline([[444,290],[444,342],[640,392]],'rgba(220,38,38,.50)',7,[12,8]);
}
function card(x,y,w,h,color,title,sub){
  ctx.fillStyle='rgba(255,255,255,.94)';ctx.strokeStyle=color;ctx.lineWidth=4;roundRect(x,y,w,h,24,true,true);
  haloText(title,x+w/2,y+38,'900 16px Arial',color);
  haloText(sub,x+w/2,y+66,'bold 12px Arial','#52677d')
}
function drawNodes(){
  card(54,186,132,104,'#2563eb','Human','owns task');
  card(302,186,138,104,'#f59e0b','AI draft','working answer');
  card(640,186,124,104,'#124e7f','Use','final choice');
  ctx.fillStyle='rgba(255,255,255,.90)';ctx.strokeStyle='rgba(220,38,38,.60)';ctx.lineWidth=4;roundRect(596,364,158,76,22,true,true);
  haloText('Bypass risk',675,395,'900 14px Arial','#b91c1c');
  haloText('review skipped',675,418,'bold 12px Arial','#52677d')
}
function drawCheckpoint(){const {i,d,t}=labels();const x=456,y=154,w=174,h=174;
  ctx.fillStyle='rgba(255,255,255,.96)';ctx.strokeStyle=pulse?'rgba(124,58,237,.92)':'rgba(124,58,237,.58)';ctx.lineWidth=pulse?6:4;roundRect(x,y,w,h,28,true,true);
  haloText('WAIT review',x+w/2,y+30,'900 16px Arial','#7c3aed');
  const rows=[['W','Workflow',d<65?'human-owned':'AI-heavy'],['A','Assumptions',i>55?'named':'hidden'],['I','Inspect',i<35?'thin':i<70?'partial':'deep'],['T','Transfer',t<35?'weak':t<70?'emerging':'strong']];
  rows.forEach((r,idx)=>{const yy=y+62+idx*26;ctx.fillStyle='rgba(124,58,237,.07)';roundRect(x+16,yy-15,w-32,20,10,true,false);haloText(r[0],x+34,yy,'900 12px Arial','#7c3aed');ctx.textAlign='left';ctx.font='bold 11px Arial';ctx.fillStyle='#475569';ctx.fillText(r[1]+': '+r[2],x+53,yy+1);});
}
function drawMeters(){
  bar('product quality',quality,70,456,'#2563eb');bar('reliance risk',risk,310,456,'#dc2626');bar('human learning',learning,550,456,'#16a34a');
  haloText(cycle?'Cycle '+cycle:'No cycles yet',746,96,'900 13px Arial',cycle?'#124e7f':'#64748b','right',4)
}
function bar(name,val,x,y,c){ctx.fillStyle='#52677d';ctx.font='bold 12px Arial';ctx.textAlign='left';ctx.fillText(name,x,y);ctx.fillStyle='rgba(148,163,184,.22)';roundRect(x,y+10,170,14,7,true,false);ctx.fillStyle=c;roundRect(x,y+10,170*(val/100),14,7,true,false);haloText(Math.round(val)+' / 100',x+85,y+42,'900 13px Arial',c)}
function lerp(a,b,t){return a+(b-a)*t}
function segmentPoint(a,b,t){return {x:lerp(a[0],b[0],t),y:lerp(a[1],b[1],t)}}
function polyPoint(points,t){let segs=[];let total=0;for(let i=0;i<points.length-1;i++){let dx=points[i+1][0]-points[i][0],dy=points[i+1][1]-points[i][1];let len=Math.hypot(dx,dy);segs.push(len);total+=len}let dist=t*total;for(let i=0;i<segs.length;i++){if(dist<=segs[i])return segmentPoint(points[i],points[i+1],dist/segs[i]);dist-=segs[i]}return {x:points[points.length-1][0],y:points[points.length-1][1]}}
function point(kind,t){
  if(kind==='task')return polyPoint([[190,238],[298,238]],t);
  if(kind==='draft')return polyPoint([[444,238],[454,238]],t);
  if(kind==='review')return polyPoint([[632,238],[636,238]],t);
  if(kind==='return')return polyPoint([[690,306],[690,362],[124,362],[124,300]],t);
  return polyPoint([[444,290],[444,342],[640,392]],t)
}
function drawParticles(){particles.forEach(p=>{p.age++;let t=p.age/p.max;let pt=point(p.kind,Math.min(1,t));let color=p.kind==='bypass'?'#dc2626':p.kind==='return'?'#16a34a':p.kind==='draft'?'#f59e0b':p.kind==='review'?'#7c3aed':'#2563eb';ctx.globalAlpha=1-Math.max(0,(t-.82))*4;ctx.fillStyle=color;ctx.beginPath();ctx.arc(pt.x,pt.y,p.kind==='bypass'?7:5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1})}
function updateFeedback(){const {d,i,t}=labels();$('qualityMetric').textContent=Math.round(quality)+' / 100';$('riskMetric').textContent=Math.round(risk)+' / 100';$('transferMetric').textContent=Math.round(learning)+' / 100';
  if(!cycle){$('stateName').textContent='WAIT system ready';$('stateText').textContent='Run a cycle to see whether AI strengthens judgment or creates reliance.'}
  else if(risk>68&&learning<45){$('stateName').textContent='Output shortcut';$('stateText').textContent='AI output is bypassing review or transfer. The answer may improve while judgment weakens.'}
  else if(learning>62&&risk<52){$('stateName').textContent='Judgment extended';$('stateText').textContent='The workflow returns reviewed output and usable skill to the human.'}
  else if(quality>62&&risk>55){$('stateName').textContent='Fluent but fragile';$('stateText').textContent='The output may look strong, but reliance risk remains high.'}
  else{$('stateName').textContent='Mixed workflow';$('stateText').textContent='The workflow is useful, but one WAIT checkpoint remains weak.'}
  $('whyList').innerHTML=[`Delegation: ${$('delegationLevel').textContent}.`,`Inspection: ${$('inspectionLevel').textContent}.`,`Transfer: ${$('transferLevel').textContent}.`,`Cycle count: ${cycle}.`].map(x=>`<li>${x}</li>`).join('');
  $('moveText').textContent=risk>68?'Add a required WAIT review before final use.':learning<45?'Require a short transfer step: what did the human learn from the AI draft?':'Keep the loop: inspect assumptions, verify fit, and return skill to the human.'}
['delegation','inspection','transfer'].forEach(id=>$(id).addEventListener('input',()=>{draw();updateFeedback()}));$('runButton').addEventListener('click',toggle);$('stepButton').addEventListener('click',()=>{if(running){running=false;$('runButton').textContent='Run AI cycle'}step()});$('shortcutButton').addEventListener('click',shortcutMode);$('waitButton').addEventListener('click',waitMode);$('resetButton').addEventListener('click',reset);reset();