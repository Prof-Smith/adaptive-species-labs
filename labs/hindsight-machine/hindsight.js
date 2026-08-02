const canvas=document.getElementById('hindsightCanvas');
const ctx=canvas.getContext('2d');
const ids=['process','outcome','surprise','narrative','accountability','baserate'];
let showAlt=false;
function v(id){return parseInt(document.getElementById(id).value,10)}
function labels(){ids.forEach(id=>document.getElementById(id+'Label').textContent=document.getElementById(id).value)}
function calc(){
  const process=v('process'), outcome=v('outcome'), surprise=v('surprise'), narrative=v('narrative'), account=v('accountability'), base=v('baserate');
  const pull=Math.round(.34*surprise+.30*narrative+.22*Math.abs(outcome-50)+.14*(100-base));
  const learning=Math.round(process*.35+base*.25+account*.25+(100-pull)*.15);
  const risk=Math.round(pull*.55+(100-learning)*.45);
  return {process,outcome,surprise,narrative,account,base,pull:Math.min(100,Math.max(0,pull)),learning:Math.min(100,Math.max(0,learning)),risk:Math.min(100,Math.max(0,risk))};
}
function level(x){return x<40?'Low':x<70?'Watch':'High'}
function lesson(c){
  if(c.pull>70&&c.outcome<45)return 'Danger: a bad ending is making the decision look more foolish than the pre-outcome evidence may justify.';
  if(c.pull>70&&c.outcome>55)return 'Danger: a good ending is making the decision look wiser than the pre-outcome evidence may justify.';
  if(c.learning>70)return 'Useful learning: the outcome is being integrated without erasing uncertainty.';
  return 'Mixed learning: separate what the process showed from what the outcome revealed.';
}
function corrective(c){
  if(c.base<45)return 'What were the base rates or comparison cases before this outcome occurred?';
  if(c.narrative>65)return 'What simpler story is being imposed after the fact?';
  if(c.account<45)return 'What review process would protect the team from blame or victory laps?';
  return 'What would you write in a decision journal before knowing the outcome?';
}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function draw(){
  labels(); const c=calc();
  ctx.clearRect(0,0,720,520);
  const grad=ctx.createLinearGradient(0,0,720,520); grad.addColorStop(0,'#eef5ff'); grad.addColorStop(1,'#fff8ed'); ctx.fillStyle=grad; ctx.fillRect(0,0,720,520);
  ctx.strokeStyle='#dbeafe'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(110,260); ctx.lineTo(360,260); ctx.lineTo(610,260); ctx.stroke();
  function node(x,y,r,color,label,sub){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText(label,x,y-2);ctx.font='12px Arial';ctx.fillText(sub,x,y+18)}
  node(110,260,54,'#2563eb','Before','uncertainty');
  node(360,260,54,c.outcome>=50?'#16a34a':'#dc2626','Outcome',c.outcome>=50?'good':'bad');
  node(610,260,54,'#c55a11','Story','afterward');
  ctx.globalAlpha=.22; ctx.fillStyle='#c55a11'; ctx.beginPath(); ctx.ellipse(430,260,70+c.pull*1.45,55+c.pull*.65,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  ctx.fillStyle='#102a43'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.fillText('Outcome shadow',360,96); ctx.font='13px Arial'; ctx.fillText('larger shadow = stronger hindsight distortion',360,118);
  const bars=[['Process evidence',70,c.process,'#2563eb'],['Outcome valence',270,c.outcome,c.outcome>=50?'#16a34a':'#dc2626'],['Hindsight pull',470,c.pull,'#c55a11']];
  bars.forEach(([lab,x,val,col])=>{ctx.fillStyle='#1f2937';ctx.textAlign='left';ctx.font='bold 13px Arial';ctx.fillText(lab,x,360);ctx.fillStyle=col;ctx.fillRect(x,370,180*val/100,18);ctx.strokeStyle=col;ctx.strokeRect(x,370,180,18)});
  if(showAlt){[['Good outcome','praise story'],['Bad outcome','blame story'],['Near miss','uncertainty'],['Delayed result','unclear lesson']].forEach((a,i)=>{let x=120+i*150,y=455;ctx.fillStyle=i%2?'#fef2f2':'#ecfdf5';ctx.strokeStyle='#d7dce2';rr(x-58,y-34,116,68,14);ctx.fill();ctx.stroke();ctx.fillStyle='#1f2937';ctx.textAlign='center';ctx.font='bold 12px Arial';ctx.fillText(a[0],x,y-4);ctx.font='11px Arial';ctx.fillText(a[1],x,y+14)})}
  document.getElementById('pullMetric').textContent=c.pull;
  document.getElementById('learningMetric').textContent=c.learning;
  document.getElementById('riskMetric').textContent=level(c.risk);
  document.getElementById('lessonText').textContent=lesson(c);
  document.getElementById('lessonFill').style.width=c.risk+'%';
  document.getElementById('correctiveText').textContent=corrective(c);
  document.getElementById('alternateList').innerHTML=showAlt?'<div class="alternate-item active"><b>Alternate histories revealed.</b><p class="small">The same process could receive different stories under different outcomes.</p></div>':'';
}
ids.forEach(id=>document.getElementById(id).addEventListener('input',draw));
document.getElementById('alternateBtn').onclick=()=>{showAlt=!showAlt;draw()};
document.getElementById('stormBtn').onclick=()=>{let s={process:65,outcome:20,surprise:90,narrative:88,accountability:35,baserate:25};ids.forEach(id=>document.getElementById(id).value=s[id]);showAlt=true;draw()};
document.getElementById('resetBtn').onclick=()=>{let r={process:65,outcome:35,surprise:70,narrative:65,accountability:45,baserate:35};ids.forEach(id=>document.getElementById(id).value=r[id]);showAlt=false;draw()};
draw();
