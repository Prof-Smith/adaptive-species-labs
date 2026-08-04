const $=id=>document.getElementById(id);const canvas=$('storyCanvas'),ctx=canvas.getContext('2d');let W=820,H=560,clues=[],running=false,tick=0,missingVisible=false;function rand(a,b){return a+Math.random()*(b-a)}function labels(){const p=+$('pressure').value,q=+$('quality').value,c=+$('contradiction').value;$('pressureLevel').textContent=p<35?'Loose':p<70?'Strong':'Intense';$('qualityLevel').textContent=q<35?'Thin':q<70?'Mixed':'Strong';$('contradictionLevel').textContent=c<35?'Hidden':c<70?'Partial':'Visible';return{p,q,c}}function createClues(){const types=['confirm','confirm','confirm','ambig','ambig','ambig','contra','contra','missing','missing'];clues=types.map((type,i)=>({id:i,type,x:rand(90,W-120),y:rand(90,H-130),vx:rand(-.5,.5),vy:rand(-.5,.5),r:type==='missing'?9:11,pull:0}));missingVisible=false;tick=0;draw();updateFeedback()}function core(){return{x:W*.60,y:H*.43}}function step(){const {p,q,c}=labels();const k=core();for(const clue of clues){let visible=clue.type!=='missing'||missingVisible;if(!visible)continue;let pull=(p/100)*.045;if(clue.type==='confirm')pull*=1.25;if(clue.type==='ambig')pull*=1.05;if(clue.type==='contra')pull*=Math.max(.08,1-c/80);if(clue.type==='missing')pull*=0.18;let dx=k.x-clue.x,dy=k.y-clue.y,d=Math.hypot(dx,dy)||1;clue.vx+=dx/d*pull;clue.vy+=dy/d*pull;if(clue.type==='contra'&&c>55){clue.vx-=dx/d*(c/100)*.055;clue.vy-=dy/d*(c/100)*.055}clue.vx*=.95;clue.vy*=.95;clue.x+=clue.vx;clue.y+=clue.vy;clue.x=Math.max(36,Math.min(W-36,clue.x));clue.y=Math.max(56,Math.min(H-96,clue.y));clue.pull=Math.max(0,1-d/360)}tick++;draw();updateFeedback()}function loop(){if(running){step();setTimeout(loop,75)}}function draw(){
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#eef8ff');
  bg.addColorStop(.55,'#fff8eb');
  bg.addColorStop(1,'#fff2dd');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,W,H);

  const k=core();
  const {p,q,c}=labels();
  const ring=74+p*1.72;

  // Story pull field: wider, more atmospheric, and responsive to coherence pressure.
  const grad=ctx.createRadialGradient(k.x,k.y,10,k.x,k.y,ring);
  grad.addColorStop(0,`rgba(124,58,237,${0.24+p/420})`);
  grad.addColorStop(.42,`rgba(249,115,22,${0.13+p/620})`);
  grad.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=grad;
  ctx.beginPath();
  ctx.arc(k.x,k.y,ring,0,Math.PI*2);
  ctx.fill();

  // Animated coherence ring.
  ctx.setLineDash([10,10]);
  ctx.strokeStyle='rgba(124,58,237,.44)';
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.arc(k.x,k.y,78+Math.sin(tick/8)*5+p*.25,0,Math.PI*2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Invisible story core background: only a light outline remains so the pull field is not hidden.
  ctx.strokeStyle='rgba(219,234,254,.95)';
  ctx.lineWidth=2;
  roundRect(k.x-86,k.y-54,172,108,24,false,true);
  ctx.textAlign='center';
  ctx.font='900 22px Georgia';
  ctx.lineWidth=5;
  ctx.strokeStyle='rgba(255,255,255,.82)';
  ctx.strokeText('Story core',k.x,k.y-8);
  ctx.fillStyle='#124e7f';
  ctx.fillText('Story core',k.x,k.y-8);
  ctx.font='bold 12px Arial';
  ctx.lineWidth=4;
  ctx.strokeStyle='rgba(255,255,255,.76)';
  ctx.strokeText('coherence pulls clues inward',k.x,k.y+18);
  ctx.fillStyle='#52677d';
  ctx.fillText('coherence pulls clues inward',k.x,k.y+18);

  // Draw connections first, so clue nodes and labels sit above them.
  for(const clue of clues){
    const visible=clue.type!=='missing'||missingVisible;
    if(!visible) continue;
    const dist=Math.hypot(clue.x-k.x,clue.y-k.y);
    ctx.strokeStyle=`rgba(18,78,127,${.05+clue.pull*.18})`;
    ctx.lineWidth=1+clue.pull*1.35;
    ctx.beginPath();
    ctx.moveTo(clue.x,clue.y);
    ctx.lineTo(k.x,k.y);
    ctx.stroke();
  }

  for(const clue of clues){
    const visible=clue.type!=='missing'||missingVisible;
    ctx.globalAlpha=visible?1:.18;
    const color=clue.type==='confirm'?'#16a34a':clue.type==='ambig'?'#f59e0b':clue.type==='contra'?'#dc2626':'#94a3b8';
    const label=clue.type==='confirm'?'confirming':clue.type==='ambig'?'ambiguous':clue.type==='contra'?'contradiction':'missing';
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.arc(clue.x,clue.y,clue.r,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle='#fff';
    ctx.lineWidth=4;
    ctx.stroke();
    // Small label backplate keeps text readable but does not dominate.
    ctx.font='bold 10.5px Arial';
    ctx.textAlign='left';
    const tx=clue.x+15, ty=clue.y+4;
    const w=ctx.measureText(label).width+9;
    ctx.fillStyle='rgba(255,255,255,.62)';
    roundRect(tx-3,ty-13,w,18,8,true,false);
    ctx.fillStyle='#344b63';
    ctx.fillText(label,tx,ty);
    ctx.globalAlpha=1;
  }

  // Contradiction check shield becomes visible only when contradiction visibility is high.
  if(c>55){
    ctx.strokeStyle='rgba(220,38,38,.55)';
    ctx.lineWidth=4;
    ctx.setLineDash([12,10]);
    ctx.beginPath();
    ctx.arc(k.x,k.y,125+Math.sin(tick/4)*4,0,Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,.70)';
    roundRect(k.x-82,k.y+90,164,24,12,true,false);
    ctx.fillStyle='#7f1d1d';
    ctx.font='bold 12px Arial';
    ctx.textAlign='center';
    ctx.fillText('contradiction check active',k.x,k.y+106);
  }

  // Enlarged and wrapped map reading rule box.
  ctx.fillStyle='rgba(255,255,255,.80)';
  ctx.strokeStyle='#dbeafe';
  ctx.lineWidth=2;
  roundRect(42,72,262,84,18,true,true);
  ctx.fillStyle='#c25009';
  ctx.font='900 13px Arial';
  ctx.textAlign='left';
  ctx.fillText('Map reading rule',60,101);
  ctx.fillStyle='#52677d';
  ctx.font='bold 12px Arial';
  ctx.fillText('Closer to core = absorbed',60,123);
  ctx.fillText('by the story',60,141);
}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}function updateFeedback(){const {p,q,c}=labels();const visible=clues.filter(x=>x.type!=='missing'||missingVisible);const absorbed=visible.filter(x=>Math.hypot(x.x-core().x,x.y-core().y)<95).length;const contradictions=visible.filter(x=>x.type==='contra'&&Math.hypot(x.x-core().x,x.y-core().y)>120).length;const coverage=Math.round(Math.min(100,(q*.62+c*.28+(missingVisible?10:0))));const trap=Math.round(Math.max(0,Math.min(100,p*.72+(100-q)*.35+(100-c)*.45-(missingVisible?8:0))));$('trapMetric').textContent=trap<35?'Low':trap<68?'Moderate':'High';$('coverageMetric').textContent=coverage+' / 100';if(trap<35){$('stateName').textContent='Story is disciplined';$('stateText').textContent='The story is organizing evidence without overwhelming contradiction checks.';$('moveTitle').textContent='Protective move';$('moveText').textContent='Keep the story, but continue naming what remains outside it.'}else if(trap<68){$('stateName').textContent='Useful story, watch the pull';$('stateText').textContent='The story is becoming coherent, but some clues may be absorbed too quickly.';$('moveTitle').textContent='Protective move';$('moveText').textContent='Ask which clue most resists the story.'}else{$('stateName').textContent='Narrative trap risk';$('stateText').textContent='Coherence is outrunning evidence coverage and contradiction visibility.';$('moveTitle').textContent='Protective move';$('moveText').textContent='Force the story to explain the strongest contradiction before trusting it.'}$('whyList').innerHTML=[`Clues absorbed by the story core: ${absorbed}.`,`Visible contradictions resisting the story: ${contradictions}.`,`Missing evidence is ${missingVisible?'visible':'still hidden'}.`].map(x=>`<li>${x}</li>`).join('')}function build(){running=!running;$('buildButton').textContent=running?'Pause story':'Build story';if(running)loop()}function reveal(){missingVisible=true;draw();updateFeedback()}function stress(){running=false;$('buildButton').textContent='Build story';$('pressure').value=88;$('quality').value=28;$('contradiction').value=18;labels();for(let i=0;i<18;i++)step();updateFeedback()}function reset(){running=false;$('buildButton').textContent='Build story';createClues();}['pressure','quality','contradiction'].forEach(id=>$(id).addEventListener('input',()=>{labels();draw();updateFeedback()}));$('buildButton').addEventListener('click',build);$('revealButton').addEventListener('click',reveal);$('stressButton').addEventListener('click',stress);$('resetButton').addEventListener('click',reset);createClues();labels();updateFeedback();