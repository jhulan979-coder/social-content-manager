(function(){
 var $=function(id){return document.getElementById(id)};
 var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
 var VOICES=['Kore','Puck','Charon','Aoede','Fenrir'];
 var EMO=['👨','🧑','👩','🧔','👵','👦','🐯','🤖'];
 var LANGS=['Hinglish','Hindi','English'];
 var PAL=[['#1e1b4b','#7c3aed'],['#0f172a','#0ea5e9'],['#3b0764','#db2777'],['#052e16','#16a34a'],['#431407','#f97316'],['#172554','#2563eb'],['#4a044e','#c026d3']];
 function opts(arr,sel){return arr.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+x+'</option>'}).join('')}
 function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
 function ld(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
 function parseJ(raw){
  if(typeof toonParseJSON==='function')return toonParseJSON(raw);
  var s=String(raw||'').replace(/```json|```/g,'').trim();
  var a=s.indexOf('{'),b=s.lastIndexOf('}');
  if(a>=0&&b>a)s=s.slice(a,b+1);
  return JSON.parse(s);
 }
 async function gj(prompt,cfg){
  if(typeof geminiText!=='function')throw new Error('Gemini ka code nahi mila.');
  var err=null;
  for(var k=0;k<3;k++){
   try{
    var c=Object.assign({temperature:Math.min(1.3,0.8+0.1*k),maxOutputTokens:4000,responseMimeType:'application/json'},cfg||{});
    var raw=await geminiText(prompt,c);
    return parseJ(raw);
   }catch(e){err=e}
  }
  throw err||new Error('AI jawab nahi de paaya');
 }
 function copyT(t){
  function fb(){
   var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();
   try{document.execCommand('copy');alert('Copy ho gaya!')}catch(e){}
   a.remove();
  }
  try{navigator.clipboard.writeText(t).then(function(){alert('Copy ho gaya!')},function(){fb()})}catch(e){fb()}
 }
 function langRule(l){return 'Language: '+l+' (if Hindi, write in Devanagari script; Hinglish means Hindi written in Latin letters).'}
 function mkCard(id,title,html){
  var d=document.createElement('div');
  d.className='card';d.id=id;
  d.innerHTML='<h3>'+title+'</h3>'+html;
  return d;
 }

 /* ---------- 1. Live trend radar ---------- */
 function labKey(){
  try{
   var re=/AIza[0-9A-Za-z_\-]{30,}/;
   for(var i=0;i<localStorage.length;i++){
    var v=localStorage.getItem(localStorage.key(i))||'';
    var m=re.exec(v);
    if(m)return m[0];
   }
  }catch(e){}
  return '';
 }
 async function labSearch(prompt){
  var key=labKey();
  if(!key){
   key=(window.prompt('Live search ke liye Gemini API key paste karo (sirf ek baar):')||'').trim();
   if(!key)throw new Error('API key nahi mili.');
   try{localStorage.setItem('lab_key',key)}catch(e){}
  }
  var url='https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
  var res=await fetch(url,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},
   body:JSON.stringify({contents:[{parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.6,maxOutputTokens:8000}})});
  var d=await res.json().catch(function(){return null});
  if(!res.ok||!d){
   var m=(d&&d.error&&d.error.message)?d.error.message:('Error '+res.status);
   var e=new Error(m);e.status=res.status;throw e;
  }
  var c=d.candidates&&d.candidates[0];
  var parts=(c&&c.content&&c.content.parts)||[];
  var text=parts.map(function(p){return p.text||''}).join('');
  var gm=c&&c.groundingMetadata;
  var ch=(gm&&gm.groundingChunks)||[];
  var src=[];
  ch.forEach(function(x){var t=x.web&&x.web.title;if(t&&src.indexOf(t)<0)src.push(t)});
  if(!text)throw new Error('AI ne koi jawab nahi diya');
  return {text:text,sources:src.slice(0,5)};
 }
 function trendPrompt(niche,lang,n,live){
  var today=new Date().toISOString().slice(0,10);
  return (live?'Use Google Search to find what is trending TODAY ('+today+') in India for this niche: '+niche+'. Look at news, YouTube and social media. ':'Suggest topics that are likely to be popular right now in India for this niche: '+niche+'. ')+
   'Return ONLY valid JSON: {"ideas":[{"topic":"short topic under 60 characters","why":"why it is trending, one sentence under 120 characters","hook":"viral hook line under 50 characters","title":"YouTube Shorts title under 60 characters","angle":"video format and angle in one short sentence"}]}. '+
   'Number of ideas: '+n+'. '+langRule(lang)+' Never use double quote characters inside values. No trailing commas.';
 }
 function renderTrend(r){
  var box=$('trOut');
  if(!r||!r.ideas||!r.ideas.length){box.innerHTML='';return}
  var h='<p class="muted">'+(r.live?'🔎 Google Search se live':'⚠️ Live search nahi chala, ye AI ka andaza hai')+(r.when?' • '+esc(r.when):'')+'</p>';
  r.ideas.forEach(function(x,i){
   h+='<div class="result" style="margin-top:8px"><b>'+esc(x.topic)+'</b><br><span class="muted">'+esc(x.why)+'</span><br>'+
    '🔥 <b>'+esc(x.hook)+'</b><br>🎬 '+esc(x.title)+'<br><span class="muted">'+esc(x.angle)+'</span>'+
    '<div class="actions"><button class="secondary" data-trc="'+i+'">📋 Copy</button><button class="secondary" data-trd="'+i+'">🎭 Is par baatcheet video</button></div></div>';
  });
  if(r.sources&&r.sources.length)h+='<p class="muted" style="margin-top:8px">Sources: '+r.sources.map(esc).join(', ')+'</p>';
  box.innerHTML=h;
  Array.prototype.forEach.call(box.querySelectorAll('[data-trc]'),function(b){
   b.onclick=function(){var x=r.ideas[+b.getAttribute('data-trc')];copyT(x.topic+'\n'+x.hook+'\n'+x.title+'\n'+x.angle)};
  });
  Array.prototype.forEach.call(box.querySelectorAll('[data-trd]'),function(b){
   b.onclick=function(){
    var x=r.ideas[+b.getAttribute('data-trd')];
    var t=$('dlgTopic');if(t)t.value=x.topic+' - '+x.angle;
    var c=$('dlgCard');if(c&&c.scrollIntoView)c.scrollIntoView({behavior:'smooth'});
   };
  });
 }
 async function runTrend(){
  var niche=$('trNiche').value.trim()||'general India trending topics';
  var lang=$('trLang').value,n=+$('trN').value,st=$('trSt');
  $('trGo').disabled=true;
  st.textContent='Search ho raha hai...';
  var res=null;
  try{
   try{
    var r=await labSearch(trendPrompt(niche,lang,n,true));
    var j=parseJ(r.text);
    if(!j||!Array.isArray(j.ideas)||!j.ideas.length)throw new Error('format');
    res={live:true,ideas:j.ideas.slice(0,n),sources:r.sources};
   }catch(e1){
    st.textContent='Live search nahi chala, AI se andaza le raha hoon...';
    var j2=await gj(trendPrompt(niche,lang,n,false),{temperature:0.9});
    if(!j2||!Array.isArray(j2.ideas)||!j2.ideas.length)throw e1;
    res={live:false,ideas:j2.ideas.slice(0,n),sources:[]};
   }
   res.when=new Date().toLocaleString();
   sv('lab_trend',res);
   renderTrend(res);
   st.textContent=res.live?'Taiyar. Idea chuno ya copy karo.':'Taiyar (andaza). Live search ke liye key ya limit check karo.';
  }catch(e){
   st.textContent='Nahi bana: '+(e&&e.message||e);
  }
  $('trGo').disabled=false;
 }

 /* ---------- 2. Channel coach ---------- */
 function renderCoach(r){
  var box=$('chOut');
  if(!r){box.innerHTML='';return}
  function ul(a){return '<ul>'+(a||[]).map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'}
  var h='<div class="result"><b>Haalat</b><br>'+esc(r.summary)+'</div>'+
   '<div class="result" style="margin-top:8px"><b>❌ Ye cheezein rok rahi hain</b>'+ul(r.problems)+'</div>'+
   '<div class="result" style="margin-top:8px"><b>✅ Ye achha chal raha hai</b>'+ul(r.working)+'</div>'+
   '<div class="result" style="margin-top:8px"><b>🎬 Agle video ke idea</b>'+(r.ideas||[]).map(function(x,i){return '<p>'+(i+1)+'. <b>'+esc(x.title)+'</b><br>🔥 '+esc(x.hook)+'</p>'}).join('')+'</div>'+
   '<div class="result" style="margin-top:8px"><b>🧪 Is hafte ke 3 experiment</b>'+ul(r.experiments)+'</div>'+
   '<div class="result" style="margin-top:8px"><b>🕒 Upload ka plan</b><br>'+esc(r.schedule)+'</div>'+
   '<div class="actions"><button class="secondary" id="chCopy">📋 Sab copy karo</button></div>';
  box.innerHTML=h;
  $('chCopy').onclick=function(){
   copyT('HAALAT\n'+r.summary+'\n\nRUKAWAT\n- '+(r.problems||[]).join('\n- ')+'\n\nACHHA\n- '+(r.working||[]).join('\n- ')+'\n\nIDEA\n'+(r.ideas||[]).map(function(x,i){return (i+1)+'. '+x.title+' | '+x.hook}).join('\n')+'\n\nEXPERIMENT\n- '+(r.experiments||[]).join('\n- ')+'\n\nPLAN\n'+r.schedule);
  };
 }
 async function runCoach(){
  var stats=$('chStats').value.trim(),st=$('chSt');
  if(stats.length<20){alert('Pehle apne YouTube Studio ke numbers paste karo (views, CTR, watch time, top videos).');return}
  var niche=$('chNiche').value.trim()||'general',lang=$('chLang').value;
  $('chGo').disabled=true;st.textContent='Channel ka hisaab ho raha hai...';
  try{
   var p='You are an expert YouTube Shorts growth coach for Indian creators. Niche: '+niche+'. Here are the creator\'s analytics, pasted in any format:\n'+stats.slice(0,6000)+'\n\n'+
    'Diagnose honestly using only these numbers. Do not invent numbers. Return ONLY valid JSON: {"summary":"2 sentences under 220 characters","problems":["3 specific problems, each under 140 characters"],"working":["2 things that work, each under 120 characters"],"ideas":[{"title":"title under 60 characters","hook":"hook under 50 characters"}],"experiments":["3 small experiments for this week, each under 140 characters"],"schedule":"one sentence about posting frequency and time"}. Give exactly 8 ideas. '+
    langRule(lang)+' Never use double quote characters inside values. No trailing commas.';
   var j=await gj(p,{temperature:0.7,maxOutputTokens:4000});
   if(!j||!j.summary)throw new Error('Jawab adhoora aaya, dobara dabao.');
   sv('lab_coach',j);renderCoach(j);st.textContent='Taiyar.';
  }catch(e){st.textContent='Nahi bana: '+(e&&e.message||e)}
  $('chGo').disabled=false;
 }

 /* ---------- 3. Comment replies ---------- */
 function renderComments(r){
  var box=$('cmOut');
  if(!r||!r.items){box.innerHTML='';return}
  var ic={praise:'💛',question:'❓',hate:'🚫',spam:'🗑️',other:'💬'};
  box.innerHTML=r.items.map(function(x,i){
   var skip=(x.action==='ignore'||x.action==='hide');
   return '<div class="result" style="margin-top:8px"><span class="muted">'+(ic[x.type]||'💬')+' '+esc(x.type)+'</span><br>'+esc(x.c)+'<br>'+
    (skip?'<b>'+(x.action==='hide'?'Hide / report karo':'Jawab mat do')+'</b>':'↪️ <b>'+esc(x.reply)+'</b><div class="actions"><button class="secondary" data-cmc="'+i+'">📋 Copy jawab</button></div>')+'</div>';
  }).join('');
  Array.prototype.forEach.call(box.querySelectorAll('[data-cmc]'),function(b){
   b.onclick=function(){copyT(r.items[+b.getAttribute('data-cmc')].reply)};
  });
 }
 async function runComments(){
  var lines=$('cmIn').value.split('\n').map(function(s){return s.trim()}).filter(Boolean).slice(0,20),st=$('cmSt');
  if(!lines.length){alert('Pehle comments paste karo (ek line me ek comment).');return}
  var tone=$('cmTone').value,lang=$('cmLang').value,ch=$('cmCh').value.trim();
  $('cmGo').disabled=true;st.textContent='Jawab ban rahe hain...';
  try{
   var p='You manage comments for a YouTube channel'+(ch?' called '+ch:'')+'. Tone of replies: '+tone+'. For each numbered comment write a short reply under 120 characters in the same language style as the comment. Classify each comment type as one of: praise, question, hate, spam, other. For hate or spam set action to hide or ignore and leave reply empty. Otherwise action is reply. Never promise anything, never share personal info, never argue. '+
    langRule(lang)+' Comments:\n'+lines.map(function(x,i){return (i+1)+'. '+x}).join('\n')+
    '\nReturn ONLY valid JSON: {"items":[{"c":"original comment","type":"praise","reply":"text","action":"reply"}]} with exactly '+lines.length+' items in the same order. Never use double quote characters inside values. No trailing commas.';
   var j=await gj(p,{temperature:0.7,maxOutputTokens:4000});
   if(!j||!Array.isArray(j.items)||!j.items.length)throw new Error('Jawab adhoora aaya, dobara dabao.');
   for(var i=0;i<j.items.length;i++){if(!j.items[i].c)j.items[i].c=lines[i]||''}
   sv('lab_comments',j);renderComments(j);st.textContent='Taiyar. Copy karke YouTube me paste karo.';
  }catch(e){st.textContent='Nahi bana: '+(e&&e.message||e)}
  $('cmGo').disabled=false;
 }

 /* ---------- 4. Two-voice dialogue video ---------- */
 var DLG=null;
 function rr(g,x,y,w,h,r){
  g.beginPath();g.moveTo(x+r,y);
  g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
 }
 function wrap(g,text,maxW){
  var lines=[],cur='';
  String(text).split(/\s+/).forEach(function(w){
   var t=cur?cur+' '+w:w;
   if(cur&&g.measureText(t).width>maxW){lines.push(cur);cur=w}else cur=t;
  });
  if(cur)lines.push(cur);
  return lines;
 }
 function fit(g,text,maxW,maxH,start,min,weight){
  var s=start,lines;
  while(true){
   g.font=weight+' '+s+'px sans-serif';
   lines=wrap(g,text,maxW);
   if(lines.length*s*1.28<=maxH||s<=min)break;
   s-=2;
  }
  return {s:s,lines:lines};
 }
 function drawLines(g,L,cx,cy){
  var lh=L.s*1.28,y0=cy-(L.lines.length-1)*lh/2;
  L.lines.forEach(function(l,i){g.fillText(l,cx,y0+i*lh)});
 }
 function kText(g,text,cx,cy,maxW,maxH,start,min,hot,base,hotC){
  var f=fit(g,text,maxW,maxH,start,min,'800');
  g.font='800 '+f.s+'px sans-serif';
  g.textAlign='left';g.textBaseline='middle';
  var sp=g.measureText(' ').width,lh=f.s*1.28,y0=cy-(f.lines.length-1)*lh/2,wi=0;
  f.lines.forEach(function(line,ri){
   var ws=line.split(' '),lw=0;
   ws.forEach(function(w,i){lw+=g.measureText(w).width+(i?sp:0)});
   var x=cx-lw/2;
   ws.forEach(function(w){
    g.fillStyle=(hot>=0&&wi<=hot)?hotC:base;
    g.fillText(w,x,y0+ri*lh);
    x+=g.measureText(w).width+sp;wi++;
   });
  });
  g.textAlign='center';
 }
 function cl(x){return Math.max(0,Math.min(1,x))}
 function bgDraw(g,W,H,idx,t){
  var p=PAL[idx%PAL.length];
  var gr=g.createLinearGradient(0,0,W,H);
  gr.addColorStop(0,p[0]);gr.addColorStop(1,p[1]);
  g.fillStyle=gr;g.fillRect(-20,-20,W+40,H+40);
  g.save();g.translate(W/2,H*0.35);g.rotate(t*0.07);
  for(var k=0;k<10;k++){
   g.rotate(Math.PI*2/10);
   g.fillStyle='rgba(255,255,255,0.045)';
   g.beginPath();g.moveTo(0,0);g.lineTo(W*0.95,-W*0.09);g.lineTo(W*0.95,W*0.09);g.closePath();g.fill();
  }
  g.restore();
 }
 function envOf(c){
  if(!c)return [];
  var w=Math.max(1,Math.floor(c.rate/60)),n=Math.ceil(c.samples.length/w),e=new Array(n),mx=1e-6,i,j;
  for(i=0;i<n;i++){
   var s=0,cnt=0,end=Math.min(c.samples.length,(i+1)*w);
   for(j=i*w;j<end;j++){s+=c.samples[j]*c.samples[j];cnt++}
   e[i]=Math.sqrt(s/Math.max(1,cnt));
   if(e[i]>mx)mx=e[i];
  }
  for(i=0;i<n;i++)e[i]=Math.min(1,e[i]/mx);
  return e;
 }
 function drawChar(g,x,y,R,emoji,name,active,amp,lt,ring){
  g.save();
  g.translate(x,y);
  var sc=active?1.08+0.1*amp:0.9;
  g.scale(sc,sc);
  if(active)g.rotate(Math.sin(lt*13)*0.05*amp);
  g.globalAlpha=active?1:0.55;
  g.fillStyle='rgba(255,255,255,0.18)';
  g.beginPath();g.arc(0,0,R,0,7);g.fill();
  g.lineWidth=active?8:3;g.strokeStyle=active?ring:'rgba(255,255,255,0.35)';
  if(active){g.shadowColor=ring;g.shadowBlur=24}
  g.stroke();
  g.shadowBlur=0;
  g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#fff';
  g.font=Math.round(R*1.3)+'px sans-serif';
  g.fillText(emoji,0,R*0.06);
  g.restore();
  g.globalAlpha=1;
  g.font='800 '+Math.round(R*0.3)+'px sans-serif';
  var tw=g.measureText(name).width+R*0.5;
  g.fillStyle=active?ring:'rgba(0,0,0,0.4)';
  rr(g,x-tw/2,y+R*1.22*sc,tw,R*0.45,R*0.22);g.fill();
  g.fillStyle=active?'#111':'#fff';
  g.textAlign='center';g.textBaseline='middle';
  g.fillText(name,x,y+R*1.22*sc+R*0.23);
 }
 function drawIntro(g,W,H,lt,D){
  bgDraw(g,W,H,D.pal,lt);
  var m=Math.min(W,H),a=cl(lt/0.4),s=0.6+0.4*a;
  g.save();g.translate(W/2,H/2);g.scale(s,s);g.globalAlpha=a;
  g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#fff';
  g.font=Math.round(m*0.2)+'px sans-serif';
  g.fillText('🎭',0,-m*0.3-Math.abs(Math.sin(lt*4))*m*0.03);
  var f=fit(g,D.title,W*0.84,m*0.3,Math.round(m*0.1),28,'900');
  g.fillStyle='#fff';
  drawLines(g,f,0,-m*0.02);
  var hk=D.hook||'';
  if(hk){
   var hf=fit(g,hk,W*0.76,m*0.22,Math.round(m*0.07),20,'900');
   var hh=hf.lines.length*hf.s*1.28+m*0.07,hy=m*0.27;
   g.save();g.translate(0,hy);
   var pz=1+0.03*Math.sin(lt*8);g.scale(pz,pz);
   g.fillStyle='#dc2626';rr(g,-W*0.43,-hh/2,W*0.86,hh,m*0.04);g.fill();
   g.lineWidth=4;g.strokeStyle='#fde047';g.stroke();
   g.fillStyle='#fff';drawLines(g,hf,0,0);
   g.restore();
  }
  g.restore();g.globalAlpha=1;
 }
 function drawOutro(g,W,H,lt,D){
  bgDraw(g,W,H,D.pal,lt+3);
  var m=Math.min(W,H),a=cl(lt/0.4);
  g.globalAlpha=a;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#fde047';
  var f=fit(g,D.outro,W*0.84,m*0.3,Math.round(m*0.075),22,'900');
  drawLines(g,f,W/2,H*0.4);
  g.font='800 '+Math.round(m*0.06)+'px sans-serif';
  var lbl='👍 Like  🔔 Subscribe',lw=g.measureText(lbl).width+60;
  g.fillStyle='rgba(220,38,38,0.92)';
  rr(g,(W-lw)/2,H*0.58,lw,m*0.12,m*0.06);g.fill();
  g.fillStyle='#fff';g.fillText(lbl,W/2,H*0.58+m*0.06);
  g.globalAlpha=1;
 }
 function drawLineSeg(g,W,H,lt,sg,D){
  var m=Math.min(W,H),vert=H>W;
  bgDraw(g,W,H,D.pal,sg.s/1000+lt);
  var sp=sg.who==='B'?1:0;
  var cy=vert?H*0.67:H*0.72,R=vert?W*0.15:H*0.15;
  var cx=[W*0.27,W*0.73];
  var bx=W*0.07,bw=W*0.86,by=vert?H*0.09:H*0.07,bh=vert?H*0.34:H*0.4;
  var n=D.lines.length,ds=m*0.035,dy=vert?H*0.05:H*0.035;
  for(var k=0;k<n;k++){
   g.fillStyle=k<=sg.i?'#fde047':'rgba(255,255,255,0.3)';
   g.beginPath();g.arc(W/2+(k-(n-1)/2)*ds,dy,m*0.01,0,7);g.fill();
  }
  var pop=cl(lt/0.25),ps=0.9+0.1*pop;
  g.save();
  g.translate(W/2,by+bh/2);g.scale(ps,ps);g.translate(-W/2,-(by+bh/2));
  g.globalAlpha=pop;
  g.fillStyle='rgba(255,255,255,0.96)';
  rr(g,bx,by,bw,bh,m*0.05);g.fill();
  var tx=cx[sp],ty=by+bh;
  g.beginPath();g.moveTo(tx-m*0.045,ty-2);g.lineTo(tx+m*0.045,ty-2);g.lineTo(tx,ty+m*0.065);g.closePath();g.fill();
  var at=lt-0.15,prog=cl(at/Math.max(0.5,sg.cd));
  var hot=(at>0&&at<sg.cd+0.2)?Math.floor(prog*sg.wc)-1:-1;
  if(at>=sg.cd+0.2)hot=sg.wc;
  g.textAlign='center';g.textBaseline='middle';
  kText(g,sg.text,bx+bw/2,by+bh/2,bw-m*0.09,bh-m*0.08,Math.round(m*0.075),22,hot,'#111827','#dc2626');
  g.restore();
  g.globalAlpha=1;
  var amp=0;
  if(sg.env&&at>=0){amp=sg.env[Math.floor(at*60)]||0}
  drawChar(g,cx[0],cy,R,D.a.emoji,D.a.name,sp===0,sp===0?amp:0,lt,'#fde047');
  drawChar(g,cx[1],cy,R,D.b.emoji,D.b.name,sp===1,sp===1?amp:0,lt,'#60a5fa');
 }
 function bed(ac,dest,base,total){
  var mg=ac.createGain();mg.gain.value=0.05;
  mg.connect(dest);mg.connect(ac.destination);
  var ch=[[220,277.18,329.63],[174.61,220,261.63],[196,246.94,293.66],[164.81,207.65,246.94]];
  var step=2.4,secs=total/1000+0.5;
  for(var k=0;k*step<secs;k++){
   var t=base+k*step,c=ch[k%4];
   for(var i=0;i<3;i++){
    var o=ac.createOscillator(),gn=ac.createGain();
    o.type='sine';o.frequency.value=c[i];
    gn.gain.setValueAtTime(0.0001,t);
    gn.gain.linearRampToValueAtTime(0.6,t+0.5);
    gn.gain.linearRampToValueAtTime(0.0001,t+step+0.3);
    o.connect(gn);gn.connect(mg);
    o.start(t);o.stop(t+step+0.35);
   }
  }
 }
 var STY={'Funny (hasi-mazaak)':'funny, witty, light-hearted with a surprising twist','Gyan (kaam ki jaankari)':'educational, simple explanations with one amazing fact','Scam se bachao':'awareness about online scams, one person falls for a trick and the other explains how to stay safe','Kahani (story)':'a tiny story with a beginning, a problem and a twist ending'};
 async function genDialogue(){
  var topic=$('dlgTopic').value.trim(),st=$('dlgSt');
  if(!topic){alert('Pehle topic likho.');return}
  var lang=$('dlgLang').value,n=+$('dlgN').value,style=STY[$('dlgStyle').value]||'funny';
  var an=$('dlgAName').value.trim()||'Raju',bn=$('dlgBName').value.trim()||'Meena';
  $('dlgGo').disabled=true;$('dlgMake').classList.add('hidden');
  st.textContent='Baatcheet likhi ja rahi hai...';
  try{
   var p='Create a short two-person conversation for a YouTube Short. Topic: '+topic+'. Style: '+style+'. '+langRule(lang)+' Character A is '+an+'. Character B is '+bn+'. Number of lines: '+n+'. Rules: line 1 is spoken by A and must be a strong hook that makes viewers curious. Speakers must mostly alternate. Each line is under 110 characters, natural spoken language, no emojis, no stage directions. The last line is a punchline or a clear takeaway. Never use double quote characters inside text values, use single quotes. No trailing commas. Return ONLY valid JSON: {"title":"catchy title under 40 characters","hook":"short on-screen hook under 40 characters","lines":[{"who":"A","text":"..."}]}';
   var j=await gj(p,{temperature:1.0,maxOutputTokens:4000});
   var ls=(j&&Array.isArray(j.lines)?j.lines:[]).filter(function(x){return x&&String(x.text||'').trim()}).slice(0,16).map(function(x){return {who:String(x.who||'A').toUpperCase()==='B'?'B':'A',text:String(x.text).trim().slice(0,140)}});
   if(ls.length<4)throw new Error('Baatcheet adhoori aayi, dobara dabao.');
   DLG={title:String(j.title||topic).slice(0,45),hook:String(j.hook||'').replace(/["“”]/g,'').slice(0,48),lines:ls,lang:lang};
   var txt=DLG.title+'\n\n';
   ls.forEach(function(x,i){txt+=(i+1)+'. '+(x.who==='A'?an:bn)+': '+x.text+'\n'});
   $('dlgList').textContent=txt;
   $('dlgMake').classList.remove('hidden');
   st.textContent='Baatcheet taiyar. Check karke Video banao dabao.';
  }catch(e){st.textContent='Nahi bani: '+(e&&e.message||e)}
  $('dlgGo').disabled=false;
 }
 async function makeDialogueVideo(){
  if(!DLG){alert('Pehle baatcheet banao.');return}
  if(typeof vidBusy!=='undefined'&&vidBusy)return;
  if(typeof MediaRecorder==='undefined'){alert('Is phone me video recording support nahi hai.');return}
  if(typeof ttsRetry!=='function'){alert('Awaaz ka code nahi mila.');return}
  var vertical=$('dlgFmt').value==='v',W=vertical?720:1280,H=vertical?1280:720;
  var st=$('dlgSt'),cv=$('dlgCanvas');
  var D={title:DLG.title,hook:DLG.hook,lines:DLG.lines,pal:Math.floor(Math.random()*PAL.length),
   a:{name:$('dlgAName').value.trim()||'Raju',emoji:$('dlgAEmoji').value,voice:$('dlgAVoice').value},
   b:{name:$('dlgBName').value.trim()||'Meena',emoji:$('dlgBEmoji').value,voice:$('dlgBVoice').value},
   outro:$('dlgOutro').value.trim()||'Aisi aur videos ke liye subscribe karo'};
  var music=$('dlgMusic').value==='on';
  vidBusy=true;
  var ac=null,wake=null,stream=null;
  try{
   ac=new (window.AudioContext||window.webkitAudioContext)();
   await ac.resume();
   var clips=[],hookClip=null;
   if(D.hook){
    try{st.textContent='Hook ki awaaz ban rahi hai...';hookClip=await ttsRetry(D.hook,D.a.voice,st,'Hook:')}catch(e0){hookClip=null}
   }
   for(var i=0;i<D.lines.length;i++){
    var label='Awaaz '+(i+1)+'/'+D.lines.length+':';
    st.textContent=label+' ban rahi hai...';
    var ln=D.lines[i];
    try{clips.push(await ttsRetry(ln.text,ln.who==='B'?D.b.voice:D.a.voice,st,label))}
    catch(e1){if(i===0&&!hookClip)throw e1;clips.push(null)}
   }
   var segs=[],introMs=Math.max(3200,hookClip?Math.round(hookClip.samples.length/hookClip.rate*1000)+900:0),acc=introMs;
   segs.push({k:'intro',s:0,d:introMs});
   D.lines.forEach(function(ln,i){
    var c=clips[i],cd=c?c.samples.length/c.rate:3;
    var d=Math.max(1800,Math.round(cd*1000)+500);
    segs.push({k:'l',i:i,s:acc,d:d,cd:cd,who:ln.who,text:ln.text,wc:ln.text.split(/\s+/).length,env:envOf(c)});
    acc+=d;
   });
   segs.push({k:'outro',s:acc,d:3000});
   var total=acc+3000;
   cv.width=W;cv.height=H;cv.classList.remove('hidden');
   $('dlgPlayer').classList.add('hidden');$('dlgActions').classList.add('hidden');
   var g=cv.getContext('2d');
   var dest=ac.createMediaStreamDestination();
   var types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
   var mime=types.find(function(t){return MediaRecorder.isTypeSupported(t)})||'';
   stream=cv.captureStream(30);
   dest.stream.getAudioTracks().forEach(function(t){stream.addTrack(t)});
   var rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:2500000}:{videoBitsPerSecond:2500000});
   var chunks=[];
   rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
   var done=new Promise(function(r){rec.onstop=r});
   try{wake=await navigator.wakeLock.request('screen')}catch(e2){}
   rec.start(500);
   var base=ac.currentTime+0.3;
   if(music)bed(ac,dest,base,total);
   function play(c,t){
    if(!c)return;
    var buf=ac.createBuffer(1,c.samples.length,c.rate);
    buf.copyToChannel(c.samples,0);
    var src=ac.createBufferSource();
    src.buffer=buf;src.connect(dest);src.connect(ac.destination);
    src.start(t);
   }
   if(hookClip)play(hookClip,base+0.5);
   segs.forEach(function(s){if(s.k==='l')play(clips[s.i],base+s.s/1000+0.15)});
   await new Promise(function(resolve){
    function frame(){
     var el=(ac.currentTime-base)*1000;
     if(el>=total){resolve();return}
     var e2=Math.max(0,el),sg=segs[0];
     for(var k=0;k<segs.length;k++){if(e2>=segs[k].s)sg=segs[k]}
     var lt=(e2-sg.s)/1000;
     g.globalAlpha=1;
     if(sg.k==='intro')drawIntro(g,W,H,lt,D);
     else if(sg.k==='outro')drawOutro(g,W,H,lt,D);
     else drawLineSeg(g,W,H,lt,sg,D);
     var left=sg.d-(e2-sg.s);
     if(sg.k!=='outro'&&left<200){g.fillStyle='rgba(0,0,0,'+(0.25*(1-left/200))+')';g.fillRect(0,0,W,H)}
     st.textContent='Video ban rahi hai... '+Math.round(el/total*100)+'% (app band mat karo)';
     requestAnimationFrame(frame);
    }
    frame();
   });
   rec.stop();await done;
   var bt=(rec.mimeType||mime||'video/webm').split(';')[0];
   vidExt=bt.indexOf('mp4')>=0?'mp4':'webm';
   vidBlob=new Blob(chunks,{type:bt});
   var pl=$('dlgPlayer');
   if(pl.src)URL.revokeObjectURL(pl.src);
   pl.src=URL.createObjectURL(vidBlob);
   pl.classList.remove('hidden');cv.classList.add('hidden');
   $('dlgActions').classList.remove('hidden');
   st.textContent='Video taiyar: '+D.lines.length+' lines, '+Math.round(total/1000)+' second. Neeche save ya share karo.';
  }catch(e){
   st.textContent='Video nahi bani: '+(e&&e.message||e);
  }
  if(stream)stream.getTracks().forEach(function(t){t.stop()});
  if(wake){try{wake.release()}catch(e3){}}
  if(ac){try{ac.close()}catch(e4){}}
  vidBusy=false;
 }

 /* ---------- build UI ---------- */
 function build(){
  var sec=$('create');
  if(!sec||$('trCard'))return;
  var cards=[];
  cards.push(mkCard('trCard','🔥 Trend radar (aaj kya viral hai)',
   '<p class="muted">Google Search se dekhta hai ki aaj India me tumhare niche me kya chal raha hai, phir hook aur title ke idea deta hai.</p>'+
   '<label for="trNiche">Niche</label><input id="trNiche" placeholder="Jaise: cricket, jobs, bank scam, khana">'+
   '<label for="trLang">Language</label><select id="trLang">'+opts(LANGS,'Hinglish')+'</select>'+
   '<label for="trN">Kitne idea</label><select id="trN"><option>5</option><option selected>8</option></select>'+
   '<button class="primary" id="trGo">Aaj ke trend dhundo</button>'+
   '<p id="trSt" class="muted"></p><div id="trOut"></div>'));
  cards.push(mkCard('chCard','📈 Channel coach',
   '<p class="muted">YouTube Studio ke numbers (views, CTR, watch time, top videos) kisi bhi format me paste karo. AI sirf unhi numbers se batata hai ki kya sudharna hai.</p>'+
   '<label for="chNiche">Niche</label><input id="chNiche" placeholder="Jaise: quiz shorts">'+
   '<label for="chLang">Language</label><select id="chLang">'+opts(LANGS,'Hinglish')+'</select>'+
   '<label for="chStats">Tumhare numbers</label><textarea id="chStats" rows="6" placeholder="Last 28 din: views 12,400, subscribers +85, avg view duration 0:18, CTR 4.1%...\nTop video: ... 5,200 views, 62% swiped away"></textarea>'+
   '<button class="primary" id="chGo">Channel ka hisaab karo</button>'+
   '<p id="chSt" class="muted"></p><div id="chOut"></div>'));
  cards.push(mkCard('cmCard','💬 Comment reply AI',
   '<p class="muted">Comments paste karo (ek line me ek, zyada se zyada 20). AI jawab likhta hai, aur hate ya spam ko ignore ya hide karne ko kehta hai.</p>'+
   '<label for="cmCh">Channel ka naam (optional)</label><input id="cmCh" placeholder="Jaise: Quiz Shorts">'+
   '<label for="cmTone">Jawab ka andaaz</label><select id="cmTone"><option>Dost jaisa</option><option>Funny</option><option>Professional</option></select>'+
   '<label for="cmLang">Language</label><select id="cmLang">'+opts(LANGS,'Hinglish')+'</select>'+
   '<label for="cmIn">Comments</label><textarea id="cmIn" rows="6" placeholder="Bhai answer B hai?\nNice video\n..."></textarea>'+
   '<button class="primary" id="cmGo">Jawab banao</button>'+
   '<p id="cmSt" class="muted"></p><div id="cmOut"></div>'));
  cards.push(mkCard('dlgCard','🎭 Do awaaz wala baatcheet video',
   '<p class="muted">Do kirdaar, do alag awaaz. AI baatcheet likhta hai, bolwata hai, aur video banata hai (bolte waqt kirdaar hilta hai, shabd chamakte hain).</p>'+
   '<label for="dlgTopic">Topic</label><input id="dlgTopic" placeholder="Jaise: OTP scam se kaise bachein">'+
   '<label for="dlgStyle">Andaaz</label><select id="dlgStyle">'+opts(Object.keys(STY),'Funny (hasi-mazaak)')+'</select>'+
   '<label for="dlgLang">Language</label><select id="dlgLang">'+opts(LANGS,'Hinglish')+'</select>'+
   '<label for="dlgN">Kitni lines</label><select id="dlgN"><option>6</option><option selected>8</option><option>12</option></select>'+
   '<label for="dlgAName">Kirdaar A (naam, chehra, awaaz)</label><input id="dlgAName" value="Raju"><select id="dlgAEmoji">'+opts(EMO,'👨')+'</select><select id="dlgAVoice">'+opts(VOICES,'Puck')+'</select>'+
   '<label for="dlgBName">Kirdaar B (naam, chehra, awaaz)</label><input id="dlgBName" value="Meena"><select id="dlgBEmoji">'+opts(EMO,'👩')+'</select><select id="dlgBVoice">'+opts(VOICES,'Kore')+'</select>'+
   '<label for="dlgFmt">Video size</label><select id="dlgFmt"><option value="v">Vertical (Shorts)</option><option value="h">Horizontal (YouTube)</option></select>'+
   '<label for="dlgMusic">Halki music</label><select id="dlgMusic"><option value="on">Chalu</option><option value="off">Band</option></select>'+
   '<label for="dlgOutro">Aakhri line (optional)</label><input id="dlgOutro" placeholder="Jaise: Roz aisi videos ke liye subscribe karo">'+
   '<button class="primary" id="dlgGo">1. Baatcheet likho</button>'+
   '<div id="dlgList" class="result muted" style="white-space:pre-wrap"></div>'+
   '<button class="primary hidden" id="dlgMake">2. 🎬 Video banao</button>'+
   '<p id="dlgSt" class="muted"></p>'+
   '<canvas id="dlgCanvas" class="hidden" style="width:100%;border-radius:12px;background:#000"></canvas>'+
   '<video id="dlgPlayer" class="hidden" controls playsinline style="width:100%;border-radius:12px;background:#000"></video>'+
   '<div class="actions hidden" id="dlgActions"><button class="primary" onclick="saveVideoGallery()">Gallery me save karo</button><button class="secondary" onclick="shareVideo()">Share / Send</button></div>'));
  var q=$('quizCard'),ref=q?q.nextSibling:(sec.children[1]||null);
  cards.forEach(function(c){sec.insertBefore(c,ref)});
  $('trGo').onclick=runTrend;
  $('chGo').onclick=runCoach;
  $('cmGo').onclick=runComments;
  $('dlgGo').onclick=genDialogue;
  $('dlgMake').onclick=makeDialogueVideo;
  var t=ld('lab_trend');if(t)renderTrend(t);
  var c=ld('lab_coach');if(c)renderCoach(c);
  var m=ld('lab_comments');if(m)renderComments(m);
 }
 build();
 if(!$('trCard')){
  var n=0,tm=setInterval(function(){build();if($('trCard')||++n>20)clearInterval(tm)},500);
 }
})();
