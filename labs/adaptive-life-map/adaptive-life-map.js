const $=id=>document.getElementById(id);
const canvas=$('lifeCanvas'),ctx=canvas.getContext('2d');
let running=false,cycle=0,stress=0,pulse=0,capacities=[];
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,x))}
function labels(){
  const v=+$('volatility').value,d=+$('discipline').value,r=+$('renewal').value;
  $('volatilityLevel').textContent=v<35?'Stable':v<70?'Moderate':'Volatile';
  $('disciplineLevel').textContent=d<35?'Loose':d<70?'Developing':'Structured';
  $('renewalLevel').textContent=r<35?'Drained':r<70?'Limited':'Resilient';
  return{v,d,r}
}
function reset(){running=false;cycle=0;stress=0;pulse=0;capacities=[];$('runButton').textContent='Run loop';draw();updateFeedback()}
function compute(){
  const {v,d,r}=labels();
  const sense=clamp(58+(100-v)*.18+d*.12+Math.random()*5-stress*.12);
  const decide=clamp(30+d*.64-sense*.03+Math.random()*5-stress*.08);
  const act=clamp(48+d*.25+(100-v)*.08+Math.random()*7-stress*.10);
  const learn=clamp(38+d*.22+sense*.20+Math.random()*6-stress*.07);
  const renew=clamp(20+r*.70+learn*.08+Math.random()*5-stress*.16);
  // Lowered top of loop so the visual no longer collides with the title and subtitle.
  capacities=[
    {name:'Sense',value:sense,color:'#2563eb',x:410,y:158,labelX:410,labelY:106},
    {name:'Decide',value:decide,color:'#7c3aed',x:610,y:282,labelX:672,labelY:282},
    {name:'Act',value:act,color:'#f59e0b',x:535,y:438,labelX:535,labelY:510},
    {name:'Learn',value:learn,color:'#16a34a',x:285,y:438,labelX:285,labelY:510},
    {name:'Renew',value:renew,color:'#b7791f',x:210,y:282,labelX:144,labelY:282}
  ];
}
function step(){cycle++;stress=clamp(stress*.72 + (+$('volatility').value)*.10);compute();pulse=8;draw();updateFeedback()}
function loop(){if(running){step();setTimeout(loop,760)}}
function toggle(){running=!running;$('runButton').textContent=running?'Pause':'Run loop';if(running)loop()}
function stressTest(){running=false;$('runButton').textContent='Run loop';stress=clamp(stress+42);step()}
function balance(){running=false;$('runButton').textContent='Run loop';$('discipline').value=72;$('renewal').value=72;stress=clamp(stress-20);step()}
function haloText(txt,x,y,font,fill,align='center',w=5){ctx.textAlign=align;ctx.font=font;ctx.lineWidth=w;ctx.strokeStyle='rgba(255,255,255,.95)';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y)}
function draw(){labels();ctx.clearRect(0,0,820,560);const bg=ctx.createLinearGradient(0,0,820,560);bg.addColorStop(0,'#eef8ff');bg.addColorStop(.58,'#fff8eb');bg.addColorStop(1,'#fff2dd');ctx.fillStyle=bg;ctx.fillRect(0,0,820,560);drawBackground();if(!capacities.length)compute();drawLoop();drawStress();drawCenter()}
function drawBackground(){
  haloText('Adaptive life map',410,42,'900 23px Georgia','#124e7f');
  haloText('Sense → decide → act → learn → renew',410,70,'bold 13px Arial','#52677d');
  haloText(cycle?'Cycle '+cycle:'No cycles yet',746,72,'900 13px Arial',cycle?'#124e7f':'#64748b','right')
}
function drawLoop(){
  for(let i=0;i<capacities.length;i++){
    const a=capacities[i],b=capacities[(i+1)%capacities.length];
    const avg=(a.value+b.value)/2;
    ctx.strokeStyle=avg<45?'rgba(220,38,38,.46)':avg<65?'rgba(245,158,11,.55)':'rgba(22,163,74,.62)';
    ctx.lineWidth=3.5+avg*.05;
    ctx.setLineDash(avg<45?[10,8]:[]);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
  }
  capacities.forEach(drawCapacity);
}
function drawCapacity(c){
  // Use the outer color for the capacity and a bright inner disk for number legibility.
  const r=24+c.value*.16;
  ctx.fillStyle=c.color.replace(')',',.14)').replace('rgb','rgba');
  ctx.beginPath();ctx.arc(c.x,c.y,r+13,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=c.color;
  ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke();
  // Inner disk keeps the number readable even when the outer color is bright.
  ctx.fillStyle='rgba(255,255,255,.92)';
  ctx.beginPath();ctx.arc(c.x,c.y,22,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(18,78,127,.18)';ctx.lineWidth=2;ctx.stroke();
  haloText(String(Math.round(c.value)),c.x,c.y+6,'900 18px Arial',c.color,'center',2);
  haloText(c.name,c.labelX,c.labelY,'900 15px Arial',c.color);
}
function drawStress(){
  if(stress<8)return;
  ctx.strokeStyle='rgba(220,38,38,.58)';ctx.lineWidth=4;ctx.setLineDash([12,9]);
  ctx.beginPath();ctx.arc(410,300,92+stress*1.35+(pulse>0?pulse*1.7:0),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  haloText('stress field',410,535,'900 13px Arial','#b91c1c')
}
function drawCenter(){
  const avg=capacities.reduce((s,c)=>s+c.value,0)/capacities.length;
  const weak=capacities.slice().sort((a,b)=>a.value-b.value)[0];
  ctx.fillStyle='rgba(255,255,255,.76)';ctx.strokeStyle='rgba(219,234,254,.95)';ctx.lineWidth=2;roundRect(318,258,184,82,20,true,true);
  haloText('system capacity',410,285,'900 13px Arial','#124e7f');
  haloText(Math.round(avg)+' / 100',410,312,'900 20px Georgia',avg<48?'#b91c1c':'#15803d');
  haloText('weakest: '+weak.name,410,333,'bold 11px Arial','#52677d')
}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function updateFeedback(){
  const avg=capacities.length?capacities.reduce((s,c)=>s+c.value,0)/capacities.length:0;
  const weak=capacities.length?capacities.slice().sort((a,b)=>a.value-b.value)[0]:{name:'—',value:0};
  const frag=clamp(100-avg+stress*.30);
  $('capacityMetric').textContent=cycle?Math.round(avg)+' / 100':'—';
  $('fragilityMetric').textContent=cycle?Math.round(frag)+' / 100':'—';
  $('weakMetric').textContent=cycle?weak.name:'—';
  if(!cycle){$('stateName').textContent='System ready';$('stateText').textContent='Run the loop to see which capacity carries the most strain.'}
  else if(frag>65){$('stateName').textContent='Fragility visible';$('stateText').textContent='The loop is not closing reliably under stress.'}
  else if(weak.value<48){$('stateName').textContent='Weak loop exposed';$('stateText').textContent=`The ${weak.name.toLowerCase()} capacity is limiting the system.`}
  else{$('stateName').textContent='Adaptive loop functioning';$('stateText').textContent='The system is sensing, acting, learning, and renewing enough to stay adaptive.'}
  $('whyList').innerHTML=[`Environmental change: ${$('volatilityLevel').textContent}.`,`Decision discipline: ${$('disciplineLevel').textContent}.`,`Renewal capacity: ${$('renewalLevel').textContent}.`,`Cycle count: ${cycle}.`].map(x=>`<li>${x}</li>`).join('');
  $('moveText').textContent=weak.name==='Renew'?'Build recovery capacity before the next stress cycle.':weak.name==='Sense'?'Improve contact with reality: evidence, dissent, and feedback.':weak.name==='Decide'?'Add a decision rule, threshold, or review ritual.':weak.name==='Act'?'Choose a small move that keeps feedback alive.':weak.name==='Learn'?'Create an after-action review before the next round.':'Run a cycle, then choose one loop to strengthen.'
}
['volatility','discipline','renewal'].forEach(id=>$(id).addEventListener('input',()=>{compute();draw();updateFeedback()}));
$('runButton').addEventListener('click',toggle);
$('stepButton').addEventListener('click',()=>{if(running){running=false;$('runButton').textContent='Run loop'}step()});
$('stressButton').addEventListener('click',stressTest);
$('balanceButton').addEventListener('click',balance);
$('resetButton').addEventListener('click',reset);
reset();