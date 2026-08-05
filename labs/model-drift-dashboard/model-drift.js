const $=id=>document.getElementById(id);
const canvas=$('driftCanvas'),ctx=canvas.getContext('2d');
let W=820,H=560,round=0,running=false,model=300,reality=300,history=[],visibleGap=0,recalPulse=0,recalPoint=null;
function labels(){const c=+$('change').value,r=+$('rigidity').value,d=+$('delay').value;$('changeLevel').textContent=c<35?'Stable':c<70?'Moderate':'Fast';$('rigidityLevel').textContent=r<35?'Flexible':r<70?'Moderate':'Rigid';$('delayLevel').textContent=d<35?'Quick':d<70?'Partial':'Long';return{c,r,d}}
function reset(){round=0;running=false;model=300;reality=300;visibleGap=0;history=[];recalPulse=0;recalPoint=null;$('runButton').textContent='Run monitor';draw();updateFeedback()}
function pushHistory(gap){history.push({round,model,reality,gap,visible:visibleGap,recal:!!recalPulse});if(history.length>48)history.shift()}
function step(){const{c,r,d}=labels();
  // Reality changes each round. The model only partially updates, so drift should persist unless recalibrated.
  const worldMove=(c/100)*6.6+Math.sin(round*.38)*2.0+(Math.random()-.5)*2.0;
  reality+=worldMove;
  const adaptRate=Math.max(.015,(100-r)/100*.20); // weaker normal learning than v2
  model+=(reality-model)*adaptRate;
  const trueGap=Math.abs(reality-model);
  visibleGap=visibleGap*.80+trueGap*(1-d/135)*.20;
  round++;
  if(recalPulse>0)recalPulse--;
  pushHistory(trueGap);
  draw();updateFeedback()
}
function loop(){if(running){step();setTimeout(loop,560)}}
function toggle(){running=!running;$('runButton').textContent=running?'Pause':'Run monitor';if(running)loop()}
function recalibrate(){running=false;$('runButton').textContent='Run monitor';model=reality;visibleGap=0;round++;const trueGap=0;pushHistory(trueGap);recalPoint={index:history.length-1,model,reality,round};recalPulse=10;draw();updateFeedback()}
function draw(){labels();ctx.clearRect(0,0,W,H);const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.58,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);drawAxes();drawLines();drawGap();drawStatus();drawRecalibration();drawRound()}
function haloText(txt,x,y,font,fill,align='center',w=5){ctx.textAlign=align;ctx.font=font;ctx.lineWidth=w;ctx.strokeStyle='rgba(255,255,255,.86)';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function domain(){let vals=[model,reality,300];history.forEach(p=>{vals.push(p.model,p.reality)});let min=Math.min(...vals),max=Math.max(...vals);let pad=Math.max(24,(max-min)*.18);return{min:min-pad,max:max+pad}}
function yScale(v){const d=domain();const top=112,bottom=414;return bottom-((v-d.min)/(d.max-d.min||1))*(bottom-top)}
function xAt(i){return 78+i*(660/47)}
function currentX(){return history.length?xAt(history.length-1):78}
function drawAxes(){ctx.strokeStyle='rgba(18,78,127,.16)';ctx.lineWidth=1;for(let i=0;i<5;i++){let y=118+i*72;ctx.beginPath();ctx.moveTo(70,y);ctx.lineTo(750,y);ctx.stroke()}haloText('Model versus reality',410,82,'900 22px Georgia','#124e7f');haloText('dynamic scale prevents false visual convergence',410,106,'bold 12px Arial','#52677d')}
function drawLines(){if(history.length<2){drawDot(78,yScale(model),'#2563eb');drawDot(78,yScale(reality),'#f59e0b');return}ctx.lineWidth=4;ctx.strokeStyle='#f59e0b';ctx.beginPath();history.forEach((p,i)=>{const x=xAt(i),y=yScale(p.reality);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.strokeStyle='#2563eb';ctx.lineWidth=4;ctx.beginPath();history.forEach((p,i)=>{const x=xAt(i),y=yScale(p.model);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();const last=history[history.length-1];drawDot(currentX(),yScale(last.reality),'#f59e0b');drawDot(currentX(),yScale(last.model),'#2563eb')}
function drawDot(x,y,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke()}
function drawGap(){if(!history.length)return;const last=history[history.length-1];const x=currentX();const ym=yScale(last.model),yr=yScale(last.reality);if(Math.abs(ym-yr)>18){ctx.strokeStyle='rgba(220,38,38,.72)';ctx.lineWidth=4;ctx.setLineDash([8,7]);ctx.beginPath();ctx.moveTo(x,ym);ctx.lineTo(x,yr);ctx.stroke();ctx.setLineDash([]);haloText('drift gap',x+16,(ym+yr)/2,'900 12px Arial','#b91c1c','left',4)}}
function drawStatus(){const{d}=labels();const x=72,y=362;haloText('Feedback visibility',x,y,'900 13px Arial','#c25009','left',4);bar('visible error',Math.min(100,visibleGap*2.1),x,y+22,'#7c3aed');bar('delay',d,x,y+48,'#64748b')}
function drawRecalibration(){if(!recalPoint)return;const idx=Math.max(0,Math.min(history.length-1,recalPoint.index));const p=history[idx]||history[history.length-1];const x=xAt(idx);const y=yScale(p.reality);const pulse=recalPulse>0?recalPulse:0;ctx.strokeStyle='rgba(22,163,74,.75)';ctx.lineWidth=5;ctx.setLineDash([12,8]);ctx.beginPath();ctx.arc(x,y,44+pulse*3,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);haloText('recalibrated',x+18,y+58,'900 13px Arial','#15803d','left',4)}
function bar(name,val,x,y,c){ctx.fillStyle='#52677d';ctx.font='bold 11px Arial';ctx.textAlign='left';ctx.fillText(name,x,y);ctx.fillStyle='rgba(148,163,184,.22)';roundRect(x+92,y-9,110,10,5,true,false);ctx.fillStyle=c;roundRect(x+92,y-9,110*(val/100),10,5,true,false)}
function drawRound(){haloText(round?'Round '+round:'No rounds yet',748,92,'900 13px Arial',round?'#124e7f':'#64748b','right',4)}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function updateFeedback(){const gap=history.length?history[history.length-1].gap:0;const gapScore=Math.round(Math.min(100,gap*2.1));$('gapMetric').textContent=gapScore+' / 100';const need=gapScore<25?'Low':gapScore<55?'Watch':'High';$('updateMetric').textContent=need;if(!round){$('stateName').textContent='Drift monitor ready';$('stateText').textContent='Step through rounds to watch whether the model stays aligned or lags behind reality.'}else if(need==='Low'){$('stateName').textContent='Model aligned';$('stateText').textContent='The model is close to the current world. If this happened after recalibration, that is intentional.'}else if(need==='Watch'){$('stateName').textContent='Drift emerging';$('stateText').textContent='Reality is moving away from the model. Monitoring should intensify.'}else{$('stateName').textContent='Recalibration needed';$('stateText').textContent='The model is lagging far enough behind reality that trust should be reduced.'}$('whyList').innerHTML=[`Rounds completed: ${round}.`,`World change: ${$('changeLevel').textContent}.`,`Feedback delay: ${$('delayLevel').textContent}.`].map(x=>`<li>${x}</li>`).join('');$('moveText').textContent=need==='High'?'Recalibrate the model before the drift gap becomes a decision failure.':'Name the error threshold that will trigger recalibration.'}
['change','rigidity','delay'].forEach(id=>$(id).addEventListener('input',()=>{draw();updateFeedback()}));$('runButton').addEventListener('click',toggle);$('stepButton').addEventListener('click',()=>{if(running){running=false;$('runButton').textContent='Run monitor'}step()});$('recalibrateButton').addEventListener('click',recalibrate);$('resetButton').addEventListener('click',reset);reset();