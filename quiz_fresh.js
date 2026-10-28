(function(){
 if(typeof geminiText!=='function')return;
 const orig=geminiText;
 const KEY='quiz_hist_v2';
 const ANG=[
  'recent years (2015 onwards)',
  'history and old events',
  'surprising and little-known facts',
  'records, numbers and first-ever achievements',
  'famous people and their lesser known facts',
  'places, geography and landmarks',
  'common myths and things most people get wrong',
  'everyday life and things people use daily',
  'rare trivia that still sounds familiar',
  'state-wise and region-wise facts of India',
  'science and nature facts',
  'food, festivals and culture'
 ];
 function load(){try{const h=JSON.parse(localStorage.getItem(KEY));return Array.isArray(h)?h:[]}catch(e){return[]}}
 function store(h){try{localStorage.setItem(KEY,JSON.stringify(h.slice(-400)))}catch(e){}}
 function key(kind,s){
  if(kind==='emoji')return String(s||'').replace(/\s+/g,'');
  return String(s||'').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu,' ').trim().slice(0,90);
 }
 function kindOf(p){
  if(/^Create emoji puzzles/.test(p))return 'emoji';
  if(/^Create true or false/.test(p))return 'tf';
  if(/^Create a Scam or Safe/.test(p))return 'scam';
  if(/^Create a quiz for a YouTube Short/.test(p))return 'mcq';
  return '';
 }
 function textOf(kind,q){
  if(!q)return '';
  if(kind==='emoji')return q.emoji;
  if(kind==='tf')return q.s;
  if(kind==='scam')return q.msg;
  return q.q;
 }
 function similar(a,b){
  if(!a||!b)return false;
  if(a===b)return true;
  if(a.length>=14&&b.length>=14&&(a.indexOf(b)>=0||b.indexOf(a)>=0))return true;
  const A=a.split(' '),B=b.split(' ');
  if(A.length<4||B.length<4)return false;
  const sb=new Set(B);let c=0;
  A.forEach(function(w){if(sb.has(w))c++});
  return c/Math.min(A.length,B.length)>=0.8;
 }
 function isDup(kind,text,list){
  const t=key(kind,text);
  if(!t)return false;
  return list.some(function(x){return similar(x,t)});
 }
 function parse(raw){
  try{
   return (typeof toonParseJSON==='function')?toonParseJSON(raw):JSON.parse(String(raw).replace(/```json|```/g,'').trim());
  }catch(e){return null}
 }
 window.geminiText=async function(prompt,cfg){
  const p0=String(prompt||'');
  const kind=kindOf(p0);
  if(!kind)return orig(prompt,cfg);
  const mT=/Topic(?: hint)?: ([^.]*)\./.exec(p0);
  const topic=(mT?mT[1]:'').trim().toLowerCase();
  const gk=kind+'|'+topic;
  const mN=/Number of (?:questions|items): (\d+)/.exec(p0);
  const need=mN?+mN[1]:5;
  const H=load();
  const mine=H.filter(function(x){return x.g===gk}).map(function(x){return x.t});
  let best=null,bestDup=1e9,lastRaw=null;
  for(let k=0;k<3;k++){
   const ang=ANG[Math.floor(Math.random()*ANG.length)];
   let p=p0+' VARIETY RULES: focus this time on: '+ang+'. Session code '+Math.floor(Math.random()*1000000)+' (use it only to vary the content). Do NOT pick the most obvious or most famous questions; choose less common but still well-known ones.';
   const avoid=mine.slice(-40);
   if(avoid.length)p+=' ALREADY USED (do not repeat or paraphrase any of these): '+avoid.join(' | ')+'.';
   if(k>0)p+=' The previous attempt repeated old content. Make this set completely different.';
   p+=' ALSO add one more top-level field "hook": a very short curiosity line (max 40 characters, no quote characters) in the same language as the questions, that makes people stay and watch, for example a bold claim like "99% log ye galat bolte hain" or a challenge like "Sirf genius 5/5 laayenge". It must be different every time and match the topic.';
   const c=Object.assign({},cfg||{},{temperature:Math.min(1.3,1.0+0.1*k)});
   let raw;
   try{raw=await orig(p,c)}catch(e){if(k===2&&!best)throw e;continue}
   lastRaw=raw;
   const j=parse(raw);
   if(!j||!Array.isArray(j.qs)||!j.qs.length)continue;
   const dups=j.qs.filter(function(q){return isDup(kind,textOf(kind,q),mine)}).length;
   if(dups<bestDup){bestDup=dups;best={j:j}}
   if(dups<=Math.floor(j.qs.length*0.2))break;
  }
  if(!best)return lastRaw;
  const j=best.j;
  const fresh=j.qs.filter(function(q){return !isDup(kind,textOf(kind,q),mine)});
  if(fresh.length>=need)j.qs=fresh;
  const H2=load();
  j.qs.slice(0,need).forEach(function(q){
   const t=key(kind,textOf(kind,q));
   if(t)H2.push({g:gk,k:kind,t:t});
  });
  store(H2);
  return JSON.stringify(j);
 };
 function addUI(){
  const g=document.getElementById('qzGen');
  if(!g||document.getElementById('qzHist'))return !!g;
  const b=document.createElement('button');
  b.id='qzHist';b.className='secondary';
  function upd(){b.textContent='🧹 Purane sawaal bhool jao ('+load().length+' yaad)'}
  upd();
  b.onclick=function(){
   if(confirm('Ab tak yaad rakhe sawaal hata dein? Phir purane sawaal dobara aa sakte hain.')){localStorage.removeItem(KEY);upd()}
  };
  g.parentNode.insertBefore(b,g.nextSibling);
  setInterval(upd,3000);
  return true;
 }
 if(!addUI()){
  let n=0;
  const t=setInterval(function(){if(addUI()||++n>20)clearInterval(t)},500);
 }
})();
