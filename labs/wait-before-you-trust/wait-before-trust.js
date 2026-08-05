const $=id=>document.getElementById(id);
const canvas=$('waitCanvas'),ctx=canvas.getContext('2d');
let running=false,cycle=0,quality=0,risk=0,skill=0,particles=[],pulse=0;

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
  $('transferText').textContent=t<35?'The product may improve while the person learns little.':t<70?'Some learning remains with the human, but practice is uneven.':'The workflow deliberately leaves skill behind.';
  return{d,i,t}
}
function reset(){running=false;cycle=0;quality=0;risk=0;skill=0;particles=[];pulse=0;$('runButton').textContent='Run AI cycle';draw();updateFeedback()}
function spawn(kind){particles.push({kind,age:0,max:70})}
function step(){
  const {d,i,t}=labels();cycle++;pulse=12;
  const product=42+d*.35+i*.25+Math.random()*8;
  const reliance=d*.52+(100-i)*.32+(100-t)*.30;
  const transfer=t*.45+i*.22-d*.16;
  quality=clamp(quality*.64+product*.36);
  risk=clamp(risk*.62+reliance*.38);
  skill=clamp(skill*.66+Math.max(0,transfer)*.34);
  spawn('task');spawn('draft');if(i>28)spawn('inspect');if(t>30)spawn('return');if(d>68&&(i<48||t<42))spawn('bypass');
  draw();updateFeedback()
}
function loop(){if(running){step();setTimeout(loop,780)}}
function toggle(){running=!running;$('runButton').textContent=running?'Pause':'Run AI cycle';if(running)loop()}
function shortcutMode(){running=false;$('runButton').textContent='Run AI cycle';$('delegation').value=88;$('inspection').value=18;$('transfer').value=16;labels();step()}
function waitMode(){running=false;$('runButton').textContent='Run AI cycle';$('delegation').value=45;$('inspection').value=84;$('transfer').value=80;labels();step()}
function haloText(txt,x,y,font,fill,align='center',w=5){ctx.textAlign=align;ctx.font=font;ctx.lineWidth=w;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function draw(){labels();ctx.clearRect(0,0,820,560);const bg=ctx.createLinearGradient(0,0,820,560);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.58,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,820,560);drawBackground();drawPipeline();drawNodes();drawCheckpoint();drawMeters();drawParticles();if(pulse>0)pulse--;particles=particles.filter(p=>p.age<p.max)}
function drawBackground(){haloText('WAIT workflow · v2 clear pipeline',410,64,'900 22px Georgia','#124e7f');haloText('Output is useful only when inspection and transfer return judgment to the human',410,90,'bold 12px Arial','#52677d');}
function drawArrow(x1,y1,x2,y2,color,w=6,dash=[]){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);const ang=Math.atan2(y2-y1,x2-x1);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-12*Math.cos(ang-.45),y2-12*Math.sin(ang-.45));ctx.lineTo(x2-12*Math.cos(ang+.45),y2-12*Math.sin(ang+.45));ctx.closePath();ctx.fill()}
function drawPipeline(){const {d,i,t}=labels();
  drawArrow(178,238,318,238,'rgba(249,115,22,.44)',6+d*.035);
  drawArrow(502,238,642,238,'rgba(37,99,235,.34)',6+i*.025);
  drawArrow(644,305,180,305,'rgba(22,163,74,.30)',5+t*.035,[8,9]);
  if(d>68&&(i<48||t<42)){drawArrow(460,270,636,390,'rgba(220,38,38,.48)',7,[12,8]);}
}
function card(x,y,w,h,color,title,sub){ctx.fillStyle='rgba(255,255,255,.62)';ctx.strokeStyle=color;ctx.lineWidth=4;roundRect(x,y,w,h,24,true,true);haloText(title,x+w/2,y+38,'900 16px Arial',color);haloText(sub,x+w/2,y+64,'bold 12px Arial','#52677d')}
function drawNodes(){card(62,186,124,104,'#2563eb','Human','owns task');card(310,186,130,104,'#f59e0b','AI draft','fluent output');card(638,186,126,104,'#124e7f','Use','final decision');
  ctx.fillStyle='rgba(220,38,38,.10)';ctx.strokeStyle='rgba(220,38,38,.55)';ctx.lineWidth=4;roundRect(598,362,150,70,22,true,true);haloText('bypass risk',673,393,'900 14px Arial','#b91c1c');haloText('output skips judgment',673,414,'bold 11px Arial','#52677d')}
function drawCheckpoint(){const {i,d,t}=labels();const x=460,y=152,w=164,h=172;ctx.fillStyle='rgba(255,255,255,.52)';ctx.strokeStyle=pulse?'rgba(124,58,237,.9)':'rgba(124,58,237,.48)';ctx.lineWidth=pulse?6:4;roundRect(x,y,w,h,28,true,true);haloText('WAIT checkpoint',x+w/2,y+28,'900 15px Arial','#7c3aed');const rows=[['W','workflow',d<65?'human owns':'AI dominates'],['A','assumptions',i>55?'named':'hidden'],['I','inspection',i<35?'thin':i<70?'partial':'deep'],['T','transfer',t<35?'weak':t<70?'emerging':'strong']];rows.forEach((r,idx)=>{const yy=y+58+idx*26;ctx.fillStyle='rgba(124,58,237,.08)';roundRect(x+18,yy-15,w-36,20,10,true,false);haloText(r[0],x+36,yy,'900 12px Arial','#7c3aed');ctx.textAlign='left';ctx.font='bold 11px Arial';ctx.fillStyle='#52677d';ctx.fillText(r[1]+': '+r[2],x+54,yy+1);});}
function drawMeters(){bar('output quality',quality,70,456,'#2563eb');bar('reliance risk',risk,310,456,'#dc2626');bar('skill transfer',skill,550,456,'#16a34a');haloText(cycle?'Cycle '+cycle:'No cycles yet',746,94,'900 13px Arial',cycle?'#124e7f':'#64748b','right',4)}
function bar(name,val,x,y,c){ctx.fillStyle='#52677d';ctx.font='bold 12px Arial';ctx.textAlign='left';ctx.fillText(name,x,y);ctx.fillStyle='rgba(148,163,184,.22)';roundRect(x,y+10,170,14,7,true,false);ctx.fillStyle=c;roundRect(x,y+10,170*(val/100),14,7,true,false);haloText(Math.round(val)+' / 100',x+85,y+42,'900 13px Arial',c)}
function point(kind,t){if(kind==='task')return {x:110+(350-110)*t,y:238};if(kind==='draft')return {x:370+(542-370)*t,y:238};if(kind==='inspect')return {x:542+(695-542)*t,y:238};if(kind==='return')return {x:660+(124-660)*t,y:305};return {x:542+(675-542)*t,y:270+(395-270)*t}}
function drawParticles(){particles.forEach(p=>{p.age++;let t=p.age/p.max;let pt=point(p.kind,Math.min(1,t));let color=p.kind==='bypass'?'#dc2626':p.kind==='return'?'#16a34a':p.kind==='draft'?'#f59e0b':p.kind==='inspect'?'#7c3aed':'#2563eb';ctx.globalAlpha=1-Math.max(0,(t-.82))*4;ctx.fillStyle=color;ctx.beginPath();ctx.arc(pt.x,pt.y,p.kind==='bypass'?8:6,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1})}
function updateFeedback(){const {d,i,t}=labels();$('qualityMetric').textContent=Math.round(quality)+' / 100';$('riskMetric').textContent=Math.round(risk)+' / 100';$('transferMetric').textContent=Math.round(skill)+' / 100';
  if(!cycle){$('stateName').textContent='WAIT system ready';$('stateText').textContent='Run a cycle to see whether AI strengthens judgment or creates reliance.'}
  else if(risk>68&&skill<45){$('stateName').textContent='Output shortcut';$('stateText').textContent='AI output is bypassing inspection or transfer. The product may improve while judgment weakens.'}
  else if(skill>62&&risk<52){$('stateName').textContent='Judgment extended';$('stateText').textContent='The workflow returns inspected output and transferable skill to the human.'}
  else if(quality>62&&risk>55){$('stateName').textContent='Fluent but fragile';$('stateText').textContent='The output may look strong, but reliance risk remains high.'}
  else{$('stateName').textContent='Mixed AI relationship';$('stateText').textContent='The workflow is useful, but one WAIT checkpoint remains weak.'}
  $('whyList').innerHTML=[`Delegation: ${$('delegationLevel').textContent}.`,`Inspection: ${$('inspectionLevel').textContent}.`,`Transfer: ${$('transferLevel').textContent}.`,`Cycle count: ${cycle}.`].map(x=>`<li>${x}</li>`).join('');
  $('moveText').textContent=risk>68?'Add a required WAIT checkpoint before final use.':skill<45?'Require a brief transfer step: what did the human learn from the AI output?':'Keep the loop: inspect assumptions, verify fit, and return skill to the human.'}
['delegation','inspection','transfer'].forEach(id=>$(id).addEventListener('input',()=>{draw();updateFeedback()}));$('runButton').addEventListener('click',toggle);$('stepButton').addEventListener('click',()=>{if(running){running=false;$('runButton').textContent='Run AI cycle'}step()});$('shortcutButton').addEventListener('click',shortcutMode);$('waitButton').addEventListener('click',waitMode);$('resetButton').addEventListener('click',reset);reset();