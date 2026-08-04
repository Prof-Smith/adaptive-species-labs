const $=id=>document.getElementById(id);const canvas=$('forecastCanvas'),ctx=canvas.getContext('2d');let W=820,H=560,t=0,running=false,points=[],breakPoint=null,forced=false,ecosystemVisible=false;function labels(){const s=+$('signal').value,v=+$('volatility').value,sh=+$('shift').value;$('signalLevel').textContent=s<35?'Noisy':s<70?'Mixed':'Clear';$('volatilityLevel').textContent=v<35?'Low':v<70?'Moderate':'High';$('shiftLevel').textContent=sh<30?'None':sh<70?'Possible':'Strong';return{s,v,sh}}function forecastY(x){return 315-0.12*x+18*Math.sin(x/125)}function bandWidth(){const {v,s}=labels();return 28+v*.82+(100-s)*.22}function realityY(x){const {s,v,sh}=labels();let base=forecastY(x);let noise=Math.sin(x*.09+t*.31)*(5+v*.16)+Math.cos(x*.031)*(3+v*.10);let start=370-sh*1.8;let drift=x>start?(x-start)*(sh/100)*.55:0;if(forced&&x>250)drift+=(x-250)*.70;return base+noise+drift}function reset(){t=0;points=[];breakPoint=null;forced=false;running=false;$('runButton').textContent='Run forecast';draw();updateFeedback()}function step(){const x=70+t*14;if(x>760){running=false;$('runButton').textContent='Run forecast';return}const y=realityY(x);points.push({x,y});const f=forecastY(x),bw=bandWidth();if(!breakPoint&&Math.abs(y-f)>bw){breakPoint={x,y}}t++;draw();updateFeedback()}function loop(){if(running){step();setTimeout(loop,95)}}function toggle(){running=!running;$('runButton').textContent=running?'Pause':'Run forecast';if(running)loop()}function forceShift(){forced=true;for(let i=0;i<12;i++)step()}function draw(){labels();ctx.clearRect(0,0,W,H);const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.6,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);drawAxes();drawBand();drawForecast();drawReality();drawBreak();drawUpdateGate();if(ecosystemVisible)drawModelEcosystem()}function drawAxes(){ctx.strokeStyle='rgba(18,78,127,.18)';ctx.lineWidth=1;for(let i=0;i<6;i++){let y=92+i*68;ctx.beginPath();ctx.moveTo(58,y);ctx.lineTo(760,y);ctx.stroke()}ctx.fillStyle='#52677d';ctx.font='bold 12px Arial';ctx.fillText('past pattern',70,78);ctx.fillText('future test',615,78)}function drawBand(){const bw=bandWidth();ctx.beginPath();for(let x=70;x<=760;x+=10){let y=forecastY(x)-bw;if(x===70)ctx.moveTo(x,y);else ctx.lineTo(x,y)}for(let x=760;x>=70;x-=10){let y=forecastY(x)+bw;ctx.lineTo(x,y)}ctx.closePath();ctx.fillStyle='rgba(6,182,212,.18)';ctx.fill();ctx.strokeStyle='rgba(6,182,212,.45)';ctx.lineWidth=2;ctx.stroke()}function drawForecast(){ctx.strokeStyle='#2563eb';ctx.lineWidth=4;ctx.beginPath();for(let x=70;x<=760;x+=10){let y=forecastY(x);if(x===70)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();ctx.fillStyle='#2563eb';ctx.font='bold 12px Arial';ctx.fillText('old forecast',602,forecastY(602)-18)}function drawReality(){if(points.length<2)return;for(let i=1;i<points.length;i++){const p=points[i-1],q=points[i];ctx.strokeStyle=`rgba(249,115,22,${0.30+i/points.length*.70})`;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}const last=points[points.length-1];ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.arc(last.x,last.y,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke()}function drawBreak(){if(!breakPoint)return;ctx.strokeStyle='rgba(220,38,38,.65)';ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(breakPoint.x,84);ctx.lineTo(breakPoint.x,470);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(breakPoint.x,breakPoint.y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#7f1d1d';ctx.font='bold 12px Arial';ctx.fillText('break point',breakPoint.x+14,breakPoint.y-12)}function drawUpdateGate(){const gx=650,gy=442;ctx.fillStyle=breakPoint?'rgba(22,163,74,.16)':'rgba(255,255,255,.40)';ctx.strokeStyle=breakPoint?'rgba(22,163,74,.75)':'rgba(148,163,184,.55)';ctx.lineWidth=3;roundRect(gx-92,gy-36,184,72,22,true,true);ctx.textAlign='center';ctx.fillStyle=breakPoint?'#15803d':'#64748b';ctx.font='900 18px Georgia';ctx.fillText(breakPoint?'Update needed':'Monitor',gx,gy-4);ctx.font='bold 12px Arial';ctx.fillText(breakPoint?'old pattern no longer enough':'inside useful band',gx,gy+18);ctx.textAlign='left'}function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,v))}
function modelScores(){
  const {s,v,sh}=labels();
  let lastRatio=0;
  if(points.length){
    const last=points[points.length-1];
    lastRatio=Math.abs(last.y-forecastY(last.x))/Math.max(1,bandWidth());
  }
  const breakBonus=breakPoint?1:0;
  const trend=clamp(72+s*.18-v*.10-sh*.42-(breakBonus*18));
  const mean=clamp(76+s*.10-v*.12-Math.max(0,sh-32)*.35-(breakBonus*8));
  const adaptive=clamp(34+s*.08+v*.10+sh*.48+(breakBonus*24)+lastRatio*8);
  return [
    {name:'Trend model',score:trend,color:'#2563eb',note:'extends the old direction'},
    {name:'Mean-reversion',score:mean,color:'#f59e0b',note:'expects return to baseline'},
    {name:'Adaptive model',score:adaptive,color:'#7c3aed',note:'updates after a break'}
  ];
}
function drawModelEcosystem(){
  const x=92,y=112,w=276,h=140;
  ctx.save();
  ctx.fillStyle='rgba(255,255,255,.76)';
  ctx.strokeStyle='rgba(219,234,254,.95)';
  ctx.lineWidth=2;
  roundRect(x,y,w,h,22,true,true);
  ctx.fillStyle='#c25009';
  ctx.font='900 13px Arial';
  ctx.textAlign='left';
  ctx.fillText('Model ecosystem',x+18,y+29);
  ctx.fillStyle='#52677d';
  ctx.font='bold 11px Arial';
  ctx.fillText('model trust shifts as the world changes',x+18,y+47);
  const scores=modelScores();
  scores.forEach((m,i)=>{
    const yy=y+70+i*25;
    ctx.fillStyle='#344b63';
    ctx.font='bold 11px Arial';
    ctx.fillText(m.name,x+18,yy);
    ctx.fillStyle='rgba(148,163,184,.22)';
    roundRect(x+120,yy-10,118,10,5,true,false);
    ctx.fillStyle=m.color;
    roundRect(x+120,yy-10,118*(m.score/100),10,5,true,false);
    ctx.fillStyle='#52677d';
    ctx.font='bold 10px Arial';
    ctx.fillText(Math.round(m.score),x+246,yy);
  });
  ctx.restore();
}
function updateFeedback(){const {s,v,sh}=labels();let stress='—',need='—';if(points.length){const last=points[points.length-1];const diff=Math.abs(last.y-forecastY(last.x));const ratio=diff/bandWidth();stress=ratio<.65?'Low':ratio<1?'Moderate':'High';need=breakPoint?'High':'Watch';}$('stressMetric').textContent=stress;$('updateMetric').textContent=need;if(!points.length){$('stateName').textContent='Forecast ready';$('stateText').textContent='Run the forecast to see whether reality remains inside the old uncertainty band or breaks away.'}else if(!breakPoint){$('stateName').textContent='Forecast still useful';$('stateText').textContent='Reality is still inside the useful uncertainty band. The forecast should be monitored, not abandoned.'}else{$('stateName').textContent='Regime break detected';$('stateText').textContent='Reality has moved outside the useful forecast band. The old pattern is no longer enough.'}$('whyList').innerHTML=[`Signal clarity: ${$('signalLevel').textContent}.`,`Volatility: ${$('volatilityLevel').textContent}.`,`Regime change: ${$('shiftLevel').textContent}.`, ecosystemVisible?'Model ecosystem is visible.':'Model ecosystem is hidden.'].map(x=>`<li>${x}</li>`).join('');$('moveTitle').textContent=breakPoint?'Protective move':'Protective move';$('moveText').textContent=breakPoint?'Update the model and explain what changed before making the next forecast.':'Prewrite the condition that would trigger an update.'}['signal','volatility','shift'].forEach(id=>$(id).addEventListener('input',()=>{draw();updateFeedback()}));$('runButton').addEventListener('click',toggle);$('stepButton').addEventListener('click',step);$('shockButton').addEventListener('click',forceShift);$('ecosystemButton').addEventListener('click',()=>{ecosystemVisible=!ecosystemVisible;$('ecosystemButton').textContent=ecosystemVisible?'Hide model ecosystem':'Show model ecosystem';draw();updateFeedback()});$('resetButton').addEventListener('click',reset);reset();