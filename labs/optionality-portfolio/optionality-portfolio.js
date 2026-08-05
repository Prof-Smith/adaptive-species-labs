const $=id=>document.getElementById(id);
const setText=(id,txt)=>{const el=$(id);if(el)el.textContent=txt};
const canvas=$('optionCanvas'),ctx=canvas.getContext('2d');
let W=820,H=560,round=0,running=false,options=[],reserve=72,renewPulse=0,renewTarget=null,decisionMoment=false;
function effectivePressure(){
  const base=+$('commitment').value;
  const time=round*2.05;
  const surge=Math.max(0,round-12)**2*.62;
  return Math.min(100,base+time+surge)
}
function labels(){
  const u=+$('uncertainty').value,c=+$('cost').value,m=+$('commitment').value,ep=effectivePressure();
  setText('uncertaintyLevel',u<35?'Low':u<70?'High':'Very high');
  setText('costLevel',c<35?'Low':c<70?'Moderate':'High');
  setText('commitmentLevel',m<35?'Patient':m<70?'Rising':'Urgent');
  setText('deadlineLevel',ep<55?'Early':ep<82?'Rising':'Forcing');
  return{u,c,m,ep}
}
function reset(){
  round=0;running=false;reserve=72;renewPulse=0;renewTarget=null;decisionMoment=false;
  options=[{name:'A',x:210,y:218,life:86,value:55},{name:'B',x:350,y:306,life:76,value:72},{name:'C',x:495,y:222,life:70,value:66},{name:'D',x:602,y:338,life:62,value:48}];
  $('runButton').textContent='Run rounds';draw();updateFeedback()
}
function viableOptions(){return options.filter(o=>o.life>=28)}
function liveOptions(){return options.filter(o=>o.life>8)}
function step(){
  const {u,c,ep}=labels();
  if(decisionMoment){draw();updateFeedback();return}
  round++;
  options.forEach(o=>{
    const decay=1.45+c*.023+ep*.022;
    const learning=u*.027+Math.sin((round+o.value)*.13)*.95;
    o.life=Math.max(0,Math.min(100,o.life-decay+learning));
  });
  const alive=liveOptions().length;
  const targetReserve=Math.max(0,Math.min(100,alive*21+u*.14-c*.15-ep*.12));
  reserve=Math.max(0,Math.min(100,reserve*.88+targetReserve*.12));
  if(ep>=96||round>=22){decisionMoment=true;running=false;$('runButton').textContent='Run rounds';reserve=Math.min(reserve,viableOptions().length>=2?42:18)}
  if(renewPulse>0)renewPulse--;
  draw();updateFeedback()
}
function loop(){if(running){step();setTimeout(loop,620)}}
function toggle(){if(decisionMoment)return;running=!running;$('runButton').textContent=running?'Pause':'Run rounds';if(running)loop()}
function renew(){
  if(decisionMoment)return;
  running=false;$('runButton').textContent='Run rounds';
  let target=options.slice().sort((a,b)=>a.life-b.life)[0];
  target.life=Math.min(100,target.life+28);reserve=Math.max(0,reserve-5);renewPulse=8;renewTarget=target.name;step()
}
function draw(){
  labels();ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.58,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  drawField();drawThermometer();drawOptions();drawReserve();drawRound();if(decisionMoment)drawDecisionMoment()
}
function haloText(txt,x,y,font,fill,align='center',w=5){ctx.textAlign=align;ctx.font=font;ctx.lineWidth=w;ctx.strokeStyle='rgba(255,255,255,.88)';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function drawField(){
  const g=ctx.createRadialGradient(410,250,20,410,250,330);g.addColorStop(0,'rgba(37,99,235,.10)');g.addColorStop(.58,'rgba(22,163,74,.10)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(410,250,330,0,Math.PI*2);ctx.fill();
  haloText('Option field',410,82,'900 22px Georgia','#124e7f');haloText('the deadline tests whether useful options remain',410,106,'bold 12px Arial','#52677d')
}
function drawThermometer(){
  const ep=effectivePressure();const x=690,top=138,bottom=380,h=bottom-top,fill=h*(ep/100);
  ctx.strokeStyle='rgba(148,163,184,.35)';ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();
  const hot=ep>=88;ctx.strokeStyle=hot?'rgba(220,38,38,.80)':'rgba(249,115,22,.72)';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(x,bottom);ctx.lineTo(x,bottom-fill);ctx.stroke();
  ctx.fillStyle=hot?'rgba(220,38,38,.18)':'rgba(249,115,22,.15)';ctx.beginPath();ctx.arc(x,bottom+18,28+ep*.05,0,Math.PI*2);ctx.fill();
  haloText('commitment',x,top-24,'900 13px Arial',hot?'#b91c1c':'#c25009');haloText(Math.round(ep)+' / 100',x,top-6,'bold 12px Arial','#52677d')
}
function drawOptions(){
  const viable=viableOptions().map(o=>o.name);
  options.forEach(o=>{const alive=o.life>8;const viableNow=o.life>=28;const c=alive?'#16a34a':'#64748b';const r=18+o.life*.13;ctx.fillStyle=`rgba(${alive?'22,163,74':'100,116,139'},.14)`;ctx.beginPath();ctx.arc(o.x,o.y,r+16,0,Math.PI*2);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(o.x,o.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=decisionMoment&&viableNow?'#f59e0b':'#fff';ctx.lineWidth=decisionMoment&&viableNow?6:4;ctx.stroke();haloText('Option '+o.name,o.x,o.y-r-14,'900 12px Arial',alive?'#15803d':'#64748b');haloText(decisionMoment&&viableNow?'viable':'life '+Math.round(o.life),o.x,o.y+r+18,'bold 11px Arial',alive?'#15803d':'#64748b');if(renewPulse>0&&renewTarget===o.name){ctx.strokeStyle='rgba(37,99,235,.72)';ctx.lineWidth=4;ctx.setLineDash([8,7]);ctx.beginPath();ctx.arc(o.x,o.y,r+26,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}})
}
function drawReserve(){
  const x=72,y=350,w=300,h=72;haloText('option reserve',x,y-9,'900 13px Arial','#c25009','left',4);ctx.fillStyle='rgba(255,255,255,.50)';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(37,99,235,.18)';ctx.fillRect(x,y+h-reserve/100*h,w,h*reserve/100);ctx.strokeStyle=reserve<25?'#dc2626':'#2563eb';ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);haloText(Math.round(reserve)+' / 100',x+w/2,y+46,'900 18px Georgia',reserve<25?'#b91c1c':'#124e7f')
}
function drawDecisionMoment(){
  const count=viableOptions().length;
  const title=count>=2?'option set survives':'single-path exposure';
  const sub=count>=2?'commitment arrived, but multiple viable moves remain':'commitment arrived with too few viable options';
  haloText(title,410,435,'900 16px Arial',count>=2?'#15803d':'#b91c1c');haloText(sub,410,456,'bold 12px Arial','#52677d')
}
function drawRound(){haloText(round?'Round '+round:'No rounds yet',748,92,'900 13px Arial',round?'#124e7f':'#64748b','right',4)}
function updateFeedback(){
  const alive=liveOptions().length,viable=viableOptions().length,ep=Math.round(effectivePressure());
  const risk=decisionMoment?(viable>=2?'Portfolio':'Forced'):alive<=1?'High':alive===2?'Moderate':'Low';
  $('reserveMetric').textContent=Math.round(reserve)+' / 100';$('riskMetric').textContent=risk;
  if(!round){$('stateName').textContent='Portfolio ready';$('stateText').textContent='Step through rounds to see whether the system keeps useful options alive or commits too early.'}
  else if(decisionMoment&&viable>=2){$('stateName').textContent='Optionality paid off';$('stateText').textContent='Commitment pressure arrived, but the system preserved multiple viable choices.'}
  else if(decisionMoment){$('stateName').textContent='Decision forced';$('stateText').textContent='Commitment pressure arrived with too few viable options remaining.'}
  else if(risk==='Low'){$('stateName').textContent='Optionality preserved';$('stateText').textContent='Several useful paths remain open while the system continues learning.'}
  else if(risk==='Moderate'){$('stateName').textContent='Options narrowing';$('stateText').textContent='The system still has choices, but flexibility is shrinking.'}
  else{$('stateName').textContent='Single-path risk';$('stateText').textContent='Too many options have expired. The system is becoming fragile if conditions change.'}
  $('whyList').innerHTML=[`Rounds completed: ${round}.`,`Live options: ${alive} of ${options.length}.`,`Viable at deadline: ${viable}.`,`Thermometer pressure: ${ep} / 100.`].map(x=>`<li>${x}</li>`).join('');
  $('moveText').textContent=decisionMoment&&viable>=2?'The deadline arrived, but optionality preserved choice. Discuss which viable path fits the revealed environment.':decisionMoment?'The deadline arrived with too little optionality. Discuss what should have been renewed earlier.':'Keep preserving low-cost options while uncertainty remains high, but watch the thermometer.'
}
['uncertainty','cost','commitment'].forEach(id=>$(id).addEventListener('input',()=>{draw();updateFeedback()}));$('runButton').addEventListener('click',toggle);$('stepButton').addEventListener('click',()=>{if(running){running=false;$('runButton').textContent='Run rounds'}step()});$('renewButton').addEventListener('click',renew);$('resetButton').addEventListener('click',reset);reset();