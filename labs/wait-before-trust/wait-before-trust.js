const $=id=>document.getElementById(id);
const canvas=$('waitCanvas'),ctx=canvas.getContext('2d');
let running=false,round=0,quality=0,risk=0,skill=0,particles=[],reviewPulse=0,transferPulse=0,shortcutPulse=0;
function labels(){
  const d=+$('delegation').value,i=+$('inspection').value,t=+$('transfer').value;
  $('delegationLevel').textContent=d<35?'Human-owned':d<70?'Shared':'AI-owned';
  $('inspectionLevel').textContent=i<35?'Thin':i<70?'Partial':'Deep';
  $('transferLevel').textContent=t<35?'Output-only':t<70?'Emerging':'Strong';
  $('workflowName').textContent=d<35?'Human-owned workflow':d<70?'Shared workflow':'AI-owned workflow';
  $('workflowText').textContent=d<35?'AI supports a process the human still directs.':d<70?'AI helps, but the human still owns judgment.':'AI is close to owning the work, so bypass risk rises.';
  $('inspectionName').textContent=i<35?'Thin inspection':i<70?'Partial inspection':'Deep inspection';
  $('inspectionText').textContent=i<35?'Fluent output may pass through without enough verification.':i<70?'Some claims are checked, but assumptions may remain hidden.':'Claims, assumptions, and fit are actively inspected.';
  $('transferName').textContent=t<35?'Output-only use':t<70?'Emerging transfer':'Strong transfer';
  $('transferText').textContent=t<35?'The product may improve while the person learns little.':t<70?'Some learning remains with the human, but practice is uneven.':'The workflow deliberately leaves skill behind.';
  return{d,i,t}
}
function reset(){running=false;round=0;quality=0;risk=0;skill=0;reviewPulse=0;transferPulse=0;shortcutPulse=0;particles=[];$('runButton').textContent='Run AI cycle';draw();updateFeedback()}
function spawnPath(kind){particles.push({kind,age:0,max:58,phase:0})}
function step(){const {d,i,t}=labels();round++;reviewPulse=8;transferPulse=t>45?10:2;shortcutPulse=(d>68&&i<45)?10:0;
  const outputBoost=35+d*.42+i*.18+Math.random()*10;
  const inspectionBenefit=i*.22;
  const reliancePressure=d*.55+(100-i)*.35+(100-t)*.25;
  const transferGain=t*.38+i*.12-d*.10;
  quality=Math.max(0,Math.min(100,quality*.70+(outputBoost+inspectionBenefit)*.30));
  risk=Math.max(0,Math.min(100,risk*.65+reliancePressure*.35));
  skill=Math.max(0,Math.min(100,skill*.70+Math.max(0,transferGain)*.30));
  spawnPath('request');spawnPath('output');if(i>25)spawnPath('inspect');if(t>25)spawnPath('transfer');if(shortcutPulse)spawnPath('shortcut');
  draw();updateFeedback()}
function loop(){if(running){step();setTimeout(loop,760)}}
function toggle(){running=!running;$('runButton').textContent=running?'Pause':'Run AI cycle';if(running)loop()}
function shortcutMode(){running=false;$('runButton').textContent='Run AI cycle';$('delegation').value=88;$('inspection').value=18;$('transfer').value=14;labels();step()}
function waitMode(){running=false;$('runButton').textContent='Run AI cycle';$('delegation').value=46;$('inspection').value=82;$('transfer').value=78;labels();step()}
function haloText(txt,x,y,font,fill,align='center',w=5){ctx.textAlign=align;ctx.font=font;ctx.lineWidth=w;ctx.strokeStyle='rgba(255,255,255,.88)';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function draw(){labels();ctx.clearRect(0,0,820,560);const bg=ctx.createLinearGradient(0,0,820,560);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.58,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,820,560);drawField();drawPaths();drawNodes();drawGates();drawMeters();drawParticles();if(reviewPulse>0)reviewPulse--;if(transferPulse>0)transferPulse--;if(shortcutPulse>0)shortcutPulse--;particles=particles.filter(p=>p.age<p.max)}
function drawField(){haloText('Human-AI judgment loop',410,70,'900 22px Georgia','#124e7f');haloText('AI should return inspected judgment and transferable skill to the human',410,94,'bold 12px Arial','#52677d');
  const g=ctx.createRadialGradient(270,258,10,270,258,260);g.addColorStop(0,'rgba(37,99,235,.14)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(270,258,260,0,Math.PI*2);ctx.fill();
  const a=ctx.createRadialGradient(548,245,10,548,245,240);a.addColorStop(0,'rgba(249,115,22,.14)');a.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=a;ctx.beginPath();ctx.arc(548,245,240,0,Math.PI*2);ctx.fill();}
function line(x1,y1,x2,y2,color,w=5,dash=[]){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([])}
function drawPaths(){const {d,i,t}=labels();line(245,250,520,210,'rgba(249,115,22,.38)',7+d*.055);line(535,245,330,288,'rgba(124,58,237,.32)',6+i*.045,[10,8]);line(314,318,250,274,'rgba(22,163,74,.32)',5+t*.055,[7,8]);if(d>65&&i<50)line(540,220,652,360,'rgba(220,38,38,.42)',7,[12,9]);line(250,250,520,250,'rgba(100,116,139,.16)',2,[5,8])}
function drawNode(x,y,r,color,title,sub){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.stroke();haloText(title,x,y+4,'900 15px Arial','#fff');haloText(sub,x,y+r+22,'bold 12px Arial','#52677d')}
function drawNodes(){drawNode(225,250,54,'#2563eb','Human','judgment owner');drawNode(545,210,52,'#f59e0b','AI','fluent output');drawNode(650,360,44,'#dc2626','Risk','bypass');drawNode(290,350,44,'#16a34a','Skill','transfer')}
function drawGates(){const {i,t}=labels();const gx=410,gy=270;ctx.fillStyle='rgba(255,255,255,.40)';ctx.strokeStyle=reviewPulse?'rgba(124,58,237,.85)':'rgba(124,58,237,.40)';ctx.lineWidth=reviewPulse?6:4;roundRect(gx-72,gy-42,144,84,22,true,true);haloText('inspection gate',gx,gy-6,'900 13px Arial','#7c3aed');haloText(i<35?'thin':i<70?'partial':'deep',gx,gy+18,'bold 12px Arial','#52677d');
  const tx=300,ty=415;ctx.strokeStyle=transferPulse?'rgba(22,163,74,.82)':'rgba(22,163,74,.32)';ctx.lineWidth=transferPulse?6:4;ctx.setLineDash([8,7]);ctx.beginPath();ctx.arc(tx,ty,42+t*.18,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);haloText('transfer loop',tx,ty+5,'900 12px Arial','#15803d')}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function drawMeters(){bar('output quality',quality,70,456,'#2563eb');bar('reliance risk',risk,310,456,'#dc2626');bar('skill transfer',skill,550,456,'#16a34a');haloText(round?'Cycle '+round:'No cycles yet',748,92,'900 13px Arial',round?'#124e7f':'#64748b','right',4)}
function bar(name,val,x,y,c){ctx.fillStyle='#52677d';ctx.font='bold 12px Arial';ctx.textAlign='left';ctx.fillText(name,x,y);ctx.fillStyle='rgba(148,163,184,.22)';roundRect(x,y+10,170,14,7,true,false);ctx.fillStyle=c;roundRect(x,y+10,170*(val/100),14,7,true,false);haloText(Math.round(val)+' / 100',x+85,y+42,'900 13px Arial',c)}
function pathPoint(kind,t){if(kind==='request')return {x:225+(545-225)*t,y:250+(210-250)*t};if(kind==='output')return {x:545+(410-545)*t,y:210+(270-210)*t};if(kind==='inspect')return {x:410+(225-410)*t,y:270+(250-270)*t};if(kind==='transfer')return {x:290+(225-290)*t,y:350+(250-350)*t};return {x:545+(650-545)*t,y:210+(360-210)*t}}
function drawParticles(){particles.forEach(p=>{p.age++;const t=p.age/p.max;const pt=pathPoint(p.kind,Math.min(1,t));let color=p.kind==='shortcut'?'#dc2626':p.kind==='transfer'?'#16a34a':p.kind==='inspect'?'#7c3aed':p.kind==='output'?'#f59e0b':'#2563eb';ctx.fillStyle=color;ctx.globalAlpha=1-Math.max(0,(t-.82))*4;ctx.beginPath();ctx.arc(pt.x,pt.y,p.kind==='shortcut'?8:6,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1})}
function updateFeedback(){const {d,i,t}=labels();$('qualityMetric').textContent=Math.round(quality)+' / 100';$('riskMetric').textContent=Math.round(risk)+' / 100';$('transferMetric').textContent=Math.round(skill)+' / 100';
  if(!round){$('stateName').textContent='WAIT system ready';$('stateText').textContent='Run a cycle to see whether the workflow strengthens judgment or creates reliance.'}
  else if(risk>68&&skill<45){$('stateName').textContent='Output shortcut';$('stateText').textContent='AI is producing usable output, but the workflow is bypassing inspection or transfer.'}
  else if(skill>62&&risk<52){$('stateName').textContent='Judgment extended';$('stateText').textContent='The workflow returns inspected judgment and transferable skill to the human.'}
  else if(quality>62&&risk>55){$('stateName').textContent='Fluent but fragile';$('stateText').textContent='The product may look strong while reliance risk remains high.'}
  else{$('stateName').textContent='Mixed AI relationship';$('stateText').textContent='The workflow is useful, but one WAIT checkpoint is still weak.'}
  $('whyList').innerHTML=[`Delegation: ${$('delegationLevel').textContent}.`,`Inspection: ${$('inspectionLevel').textContent}.`,`Transfer: ${$('transferLevel').textContent}.`,`Cycle count: ${round}.`].map(x=>`<li>${x}</li>`).join('');
  $('moveText').textContent=risk>68?'Add a required inspection gate and one transfer step before final use.':skill<45?'Ask what skill remains with the human after the AI output is produced.':'Keep the human in the loop by inspecting assumptions and converting output into practice.'}
['delegation','inspection','transfer'].forEach(id=>$(id).addEventListener('input',()=>{draw();updateFeedback()}));$('runButton').addEventListener('click',toggle);$('stepButton').addEventListener('click',()=>{if(running){running=false;$('runButton').textContent='Run AI cycle'}step()});$('shortcutButton').addEventListener('click',shortcutMode);$('waitButton').addEventListener('click',waitMode);$('resetButton').addEventListener('click',reset);reset();