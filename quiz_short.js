(function(){
 const $=function(id){return document.getElementById(id)};
 const PAL=[['#1e1b4b','#7c3aed'],['#0f172a','#0ea5e9'],['#3b0764','#db2777'],['#052e16','#16a34a'],['#431407','#f97316'],['#172554','#2563eb'],['#4a044e','#c026d3']];
 const T10={
  Hindi:{q:'सवाल',ans:'सही जवाब',comment:'कमेंट में अपना जवाब लिखो 👇',score:'आपके कितने सही हुए?',
   say:function(n,q){return 'सवाल नंबर '+n+'. '+q.q+' विकल्प A, '+q.opts[0]+'. B, '+q.opts[1]+'. C, '+q.opts[2]+'. D, '+q.opts[3]+'.'}},
  Hinglish:{q:'Sawaal',ans:'Sahi jawab',comment:'Comment me apna jawab likho 👇',score:'Aapke kitne sahi hue?',
   say:function(n,q){return 'Sawaal number '+n+'. '+q.q+' Option A, '+q.opts[0]+'. B, '+q.opts[1]+'. C, '+q.opts[2]+'. D, '+q.opts[3]+'.'}},
  English:{q:'Question',ans:'Correct answer',comment:'Comment your answer 👇',score:'How many did you get right?',
   say:function(n,q){return 'Question '+n+'. '+q.q+' Option A, '+q.opts[0]+'. B, '+q.opts[1]+'. C, '+q.opts[2]+'. D, '+q.opts[3]+'.'}}
 };
 let QZ=null;
 function rr(g,x,y,w,h,r){
  g.beginPath();g.moveTo(x+r,y);
  g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
 }
 function wrap(g,text,maxW){
  const lines=[];let cur='';
  String(text).split(/\s+/).forEach(function(w){
   const t=cur?cur+' '+w:w;
   if(cur&&g.measureText(t).width>maxW){lines.push(cur);cur=w}else cur=t;
  });
  if(cur)lines.push(cur);
  return lines;
 }
 function fit(g,text,maxW,maxH,start,min,weight){
  let s=start,lines;
  while(true){
   g.font=weight+' '+s+'px sans-serif';
   lines=wrap(g,text,maxW);
   if(lines.length*s*1.28<=maxH||s<=min)break;
   s-=2;
  }
  return {s:s,lines:lines};
 }
 function drawLines(g,L,cx,cy){
  const lh=L.s*1.28,y0=cy-(L.lines.length-1)*lh/2;
  L.lines.forEach(function(l,i){g.fillText(l,cx,y0+i*lh)});
 }
 function cl(x){return Math.max(0,Math.min(1,x))}
 function qSfx(ac,dest){
  const out=ac.createGain();out.gain.value=0.4;
  out.connect(dest);out.connect(ac.destination);
  function tone(type,f1,f2,t0,d,v){
   const o=ac.createOscillator(),gn=ac.createGain();
   o.type=type;
   o.frequency.setValueAtTime(f1,t0);
   o.frequency.exponentialRampToValueAtTime(f2,t0+d);
   gn.gain.setValueAtTime(0.0001,t0);
   gn.gain.exponentialRampToValueAtTime(v,t0+0.01);
   gn.gain.exponentialRampToValueAtTime(0.0001,t0+d);
   o.connect(gn);gn.connect(out);
   o.start(t0);o.stop(t0+d+0.05);
  }
  return {
   tick:function(t0,hi){tone('square',hi?1300:850,hi?1300:850,t0,0.07,hi?0.3:0.2)},
   ding:function(t0){tone('sine',880,880,t0,0.25,0.5);tone('sine',1320,1320,t0+0.12,0.4,0.5)},
   whoosh:function(t0){tone('sawtooth',250,1400,t0,0.28,0.1)}
  };
 }
 function bgDraw(g,W,H,idx,t){
  const p=PAL[idx%PAL.length];
  const gr=g.createLinearGradient(0,0,W,H);
  gr.addColorStop(0,p[0]);gr.addColorStop(1,p[1]);
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let k=0;k<9;k++){
   const x=((k*173+t*14*(1+k%3))%(W+200))-100,y=(k*251+Math.sin(t*0.6+k)*40)%H;
   g.fillStyle='rgba(255,255,255,'+(0.04+0.02*(k%3))+')';
   g.beginPath();g.arc(x,y,40+(k%4)*22,0,7);g.fill();
  }
 }
 function confetti(g,W,H,lt){
  const em=['🎉','✨','⭐','🎊'];
  g.textAlign='center';g.textBaseline='middle';
  for(let k=0;k<12;k++){
   const x=(k*97+30)%W,y=((lt*H*0.5+k*H*0.13)%(H*1.1))-H*0.05;
   g.globalAlpha=0.9;
   g.font=Math.round(Math.min(W,H)*0.06)+'px sans-serif';
   g.fillText(em[k%4],x+Math.sin(lt*4+k)*18,y);
  }
  g.globalAlpha=1;
 }
 function layout(W,H,vertical){
  const pad=W*0.055;
  if(vertical){
   const oh=H*0.1,gap=H*0.013,oy=H*0.45;
   return {pad:pad,q:{x:pad,y:H*0.15,w:W-2*pad,h:H*0.27},opts:[0,1,2,3].map(function(i){return {x:pad,y:oy+i*(oh+gap),w:W-2*pad,h:oh}}),foot:H*0.945,hy:H*0.045};
  }
  const gx=W*0.02,ow=(W-2*pad-gx)/2,oh=H*0.2,gy=H*0.03,oy=H*0.48;
  return {pad:pad,q:{x:pad,y:H*0.17,w:W-2*pad,h:H*0.27},opts:[0,1,2,3].map(function(i){return {x:pad+(i%2)*(ow+gx),y:oy+Math.floor(i/2)*(oh+gy),w:ow,h:oh}}),foot:H*0.955,hy:H*0.04};
 }
 function drawIntro(g,W,H,lt,L,qz,T){
  bgDraw(g,W,H,0,lt);
  const m=Math.min(W,H),a=cl(lt/0.5),s=0.6+0.4*a;
  g.save();g.translate(W/2,H/2);g.scale(s,s);g.globalAlpha=a;
  g.textAlign='center';g.textBaseline='middle';
  g.font=Math.round(m*0.22)+'px sans-serif';
  g.fillText('🧠',0,-m*0.3);
  g.fillStyle='#ffffff';
  const f=fit(g,qz.title,W*0.84,m*0.34,Math.round(m*0.12),30,'900');
  drawLines(g,f,0,m*0.02);
  g.fillStyle='#fde047';
  g.font='800 '+Math.round(m*0.05)+'px sans-serif';
  g.fillText(qz.qs.length+' '+L.q+'  •  '+T+' sec  •  '+L.score,0,m*0.3,W*0.9);
  g.restore();
  g.globalAlpha=1;
 }
 function drawOutro(g,W,H,lt,L,qz,outro){
  bgDraw(g,W,H,3,lt);
  const m=Math.min(W,H),a=cl(lt/0.5);
  g.globalAlpha=a;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#ffffff';
  const f=fit(g,L.score,W*0.84,m*0.3,Math.round(m*0.1),28,'900');
  drawLines(g,f,W/2,H*0.36);
  g.fillStyle='#fde047';
  const f2=fit(g,outro,W*0.84,m*0.25,Math.round(m*0.06),22,'800');
  drawLines(g,f2,W/2,H*0.55);
  g.font='800 '+Math.round(m*0.06)+'px sans-serif';
  const lbl='👍 Like  🔔 Subscribe',lw=g.measureText(lbl).width+60;
  g.fillStyle='rgba(220,38,38,0.92)';
  rr(g,(W-lw)/2,H*0.7,lw,m*0.12,m*0.06);g.fill();
  g.fillStyle='#fff';g.fillText(lbl,W/2,H*0.7+m*0.06);
  g.globalAlpha=1;
  confetti(g,W,H,lt);
 }
 function drawQ(g,W,H,sg,lt,q,idx,tot,L,vertical,T,fx){
  bgDraw(g,W,H,idx,sg.s/1000+lt);
  const lay=layout(W,H,vertical),m=Math.min(W,H),pad=lay.pad;
  const phase=lt*1000<sg.qd?'q':(lt*1000<sg.qd+sg.td?'t':'r');
  const hh=m*0.085,hy=lay.hy;
  g.fillStyle='rgba(0,0,0,0.35)';rr(g,pad,hy,m*0.42,hh,hh/2);g.fill();
  g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
  g.font='800 '+Math.round(hh*0.5)+'px sans-serif';
  g.fillText(L.q+' '+(idx+1)+'/'+tot,pad+m*0.21,hy+hh/2);
  const rcx=W-pad-hh*0.7,rcy=hy+hh/2,rad=hh*0.62;
  g.lineWidth=rad*0.22;
  g.strokeStyle='rgba(255,255,255,0.25)';
  g.beginPath();g.arc(rcx,rcy,rad,0,7);g.stroke();
  let remain=T;
  if(phase==='t')remain=Math.max(0,T-(lt*1000-sg.qd)/1000);
  if(phase==='r')remain=0;
  const low=(phase==='t'&&remain<=2);
  g.strokeStyle=low?'#ef4444':'#fde047';
  g.beginPath();g.arc(rcx,rcy,rad,-Math.PI/2,-Math.PI/2+Math.PI*2*(remain/T));g.stroke();
  g.fillStyle=low?'#fecaca':'#fff';
  g.font='900 '+Math.round(rad*1.0)+'px sans-serif';
  g.fillText(phase==='r'?'✓':String(Math.ceil(remain)),rcx,rcy+1);
  const qa=cl(lt/0.4),qr=lay.q;
  g.globalAlpha=qa;
  g.fillStyle='rgba(255,255,255,0.14)';rr(g,qr.x,qr.y+(1-qa)*-40,qr.w,qr.h,m*0.04);g.fill();
  g.lineWidth=3;g.strokeStyle='rgba(255,255,255,0.35)';g.stroke();
  g.fillStyle='#ffffff';
  const f=fit(g,q.q,qr.w-m*0.08,qr.h-m*0.06,Math.round(m*0.075),22,'800');
  drawLines(g,f,qr.x+qr.w/2,qr.y+qr.h/2+(1-qa)*-40);
  g.globalAlpha=1;
  const letters=['A','B','C','D'];
  for(let i=0;i<4;i++){
   const r=lay.opts[i],at=sg.qd/1000*(0.4+0.12*i);
   const a=cl((lt-at)/0.35);
   if(a<=0)continue;
   const off=(1-a)*80*(i%2?1:-1);
   const correct=(i===q.ans);
   g.globalAlpha=a*((phase==='r'&&!correct)?0.35:1);
   const x=r.x+off;
   let fill='rgba(255,255,255,0.18)',stroke='rgba(255,255,255,0.45)';
   if(phase==='r'&&correct){fill='rgba(34,197,94,0.9)';stroke='#bbf7d0'}
   g.fillStyle=fill;rr(g,x,r.y,r.w,r.h,r.h*0.28);g.fill();
   g.lineWidth=3;g.strokeStyle=stroke;g.stroke();
   const bs=r.h*0.62;
   g.fillStyle=(phase==='r'&&correct)?'#14532d':'rgba(255,255,255,0.28)';
   g.beginPath();g.arc(x+r.h*0.5,r.y+r.h/2,bs/2,0,7);g.fill();
   g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
   g.font='900 '+Math.round(bs*0.6)+'px sans-serif';
   g.fillText(letters[i],x+r.h*0.5,r.y+r.h/2+1);
   const tw=r.w-r.h*1.25-(phase==='r'&&correct?r.h*0.8:r.h*0.3);
   const f2=fit(g,q.opts[i],tw,r.h*0.8,Math.round(r.h*0.42),16,'700');
   g.textAlign='left';
   g.fillStyle='#fff';
   const lh=f2.s*1.28,y0=r.y+r.h/2-(f2.lines.length-1)*lh/2;
   f2.lines.forEach(function(l,k){g.fillText(l,x+r.h*1.1,y0+k*lh)});
   if(phase==='r'&&correct){
    g.textAlign='center';
    g.font=Math.round(r.h*0.55)+'px sans-serif';
    g.fillText('✅',x+r.w-r.h*0.55,r.y+r.h/2);
   }
   g.globalAlpha=1;
  }
  g.textAlign='center';g.textBaseline='middle';
  if(phase==='r'){
   confetti(g,W,H,lt-(sg.qd+sg.td)/1000);
   const txt='💡 '+L.ans+': '+letters[q.ans]+(q.fact?'. '+q.fact:'');
   g.fillStyle='#fde047';
   const f3=fit(g,txt,W-2*pad,H*0.075,Math.round(m*0.04),16,'800');
   drawLines(g,f3,W/2,lay.foot);
  }else{
   g.fillStyle='rgba(253,224,71,'+(0.7+0.3*Math.sin(lt*4))+')';
   g.font='800 '+Math.round(m*0.04)+'px sans-serif';
   g.fillText(L.comment,W/2,lay.foot,W-2*pad);
  }
 }
 function build(){
  const sec=$('create');
  if(!sec||$('quizCard'))return;
  const d=document.createElement('div');
  d.className='card';d.id='quizCard';
  d.innerHTML='<h3>🧠 Quiz Short (timer wala)</h3>'+
  '<p class="muted">AI sawaal banata hai, timer chalta hai, phir sahi jawab ka reveal. Pehle sawaal check kar lo.</p>'+
  '<label for="qzTopic">Topic</label><input id="qzTopic" placeholder="Jaise: India GK, Bollywood, Cricket, Science">'+
  '<div class="actions" id="qzChips"></div>'+
  '<label for="qzLang">Language</label><select id="qzLang"><option>Hindi</option><option>Hinglish</option><option>English</option></select>'+
  '<label for="qzN">Kitne sawaal</label><select id="qzN"><option value="3">3</option><option value="5" selected>5</option><option value="7">7</option></select>'+
  '<label for="qzDiff">Mushkil level</label><select id="qzDiff"><option>Aasan</option><option selected>Madhyam</option><option>Mushkil</option></select>'+
  '<label for="qzT">Timer (second)</label><select id="qzT"><option>4</option><option selected>5</option><option>7</option></select>'+
  '<label for="qzFmt">Video size</label><select id="qzFmt"><option value="v">Vertical (Shorts)</option><option value="h">Horizontal (YouTube)</option></select>'+
  '<label for="qzVoice">Awaaz</label><select id="qzVoice"><option>Kore</option><option>Puck</option><option>Charon</option><option>Aoede</option><option>Fenrir</option></select>'+
  '<label for="qzOutro">Aakhri line (optional)</label><input id="qzOutro" placeholder="Jaise: Roz naye quiz ke liye channel subscribe karo">'+
  '<button class="primary" id="qzGen">1. Sawaal banao</button>'+
  '<div id="qzList" class="result muted"></div>'+
  '<button class="primary hidden" id="qzMake">2. 🎬 Video banao</button>'+
  '<p id="qzStatus" class="muted"></p>'+
  '<canvas id="qzCanvas" class="hidden" style="width:100%;border-radius:12px;background:#000"></canvas>'+
  '<video id="qzPlayer" class="hidden" controls playsinline style="width:100%;border-radius:12px"></video>'+
  '<div id="qzActions" class="actions hidden"><button class="primary" onclick="saveVideoGallery()">Gallery me save karo</button><button class="secondary" onclick="shareVideo()">Share / Send</button></div>';
  sec.insertBefore(d,sec.children[1]||null);
  ['India GK','Bollywood','Cricket','Science','Scam se bacho','Khana aur sehat','Itihaas'].forEach(function(t){
   const b=document.createElement('button');
   b.className='secondary';b.textContent=t;
   b.onclick=function(){$('qzTopic').value=t};
   $('qzChips').appendChild(b);
  });
  $('qzGen').onclick=genQuiz;
  $('qzMake').onclick=makeVideo;
 }
 async function genQuiz(){
  const topic=$('qzTopic').value.trim();
  if(!topic){alert('Pehle topic likho.');return}
  if(typeof geminiText!=='function'){alert('Gemini ka code nahi mila.');return}
  const st=$('qzStatus');
  st.textContent='Sawaal ban rahe hain...';
  $('qzMake').classList.add('hidden');
  try{
   const n=+$('qzN').value,lang=$('qzLang').value,diff=$('qzDiff').value;
   const prompt='Create a quiz for a YouTube Short. Topic: '+topic+'. Language: '+lang+' (if Hindi, write in Devanagari script). Difficulty: '+diff+'. Number of questions: '+n+'. Questions must be factually correct, unambiguous, with exactly one correct answer, interesting, and short (question under 90 characters, each option under 28 characters). Return ONLY JSON: {"title":"catchy short title under 40 characters","qs":[{"q":"question","opts":["correct answer","wrong answer","wrong answer","wrong answer"],"fact":"one short interesting fact about the answer, under 80 characters"}]}. IMPORTANT: the FIRST option must always be the correct answer (the app shuffles later). Never use double quote characters inside text. No trailing commas.';
   let o=null,err=null;
   for(let k=0;k<3&&!o;k++){
    try{
     const raw=await geminiText(prompt,{temperature:0.8,maxOutputTokens:4000,responseMimeType:'application/json'});
     const j=(typeof toonParseJSON==='function')?toonParseJSON(raw):JSON.parse(String(raw).replace(/```json|```/g,'').trim());
     if(j&&Array.isArray(j.qs)&&j.qs.length)o=j;
    }catch(e){err=e}
   }
   if(!o)throw (err||new Error('Sawaal nahi bane, dobara dabao.'));
   const qs=o.qs.slice(0,n).filter(function(q){return q&&q.q&&Array.isArray(q.opts)&&q.opts.length>=4}).map(function(q){
    const items=q.opts.slice(0,4).map(function(t,i){return {t:String(t),c:i===0}});
    for(let i=3;i>0;i--){
     const j=Math.floor(Math.random()*(i+1));
     const x=items[i];items[i]=items[j];items[j]=x;
    }
    return {q:String(q.q),opts:items.map(function(x){return x.t}),ans:items.findIndex(function(x){return x.c}),fact:String(q.fact||'')};
   });
   if(!qs.length)throw new Error('Sawaal sahi format me nahi aaye, dobara dabao.');
   QZ={title:String(o.title||'Quiz').slice(0,45),qs:qs,lang:lang};
   let txt=QZ.title+'\n\n';
   qs.forEach(function(q,i){
    txt+=(i+1)+'. '+q.q+'\n';
    q.opts.forEach(function(t,k){txt+='   '+'ABCD'[k]+') '+t+(k===q.ans?'  ✅':'')+'\n'});
    txt+='\n';
   });
   $('qzList').textContent=txt+'Galat lage to "Sawaal banao" dobara dabao.';
   $('qzMake').classList.remove('hidden');
   st.textContent='Sawaal taiyar. Check karke neeche Video banao dabao.';
  }catch(e){
   st.textContent='Sawaal nahi bane: '+(e&&e.message||e);
  }
 }
 async function makeVideo(){
  if(!QZ){alert('Pehle sawaal banao.');return}
  if(typeof vidBusy!=='undefined'&&vidBusy)return;
  if(typeof MediaRecorder==='undefined'){alert('Is phone me video recording support nahi hai.');return}
  if(typeof ttsRetry!=='function'){alert('Awaaz ka code nahi mila.');return}
  const vertical=$('qzFmt').value==='v',W=vertical?720:1280,H=vertical?1280:720;
  const T=+$('qzT').value,voice=$('qzVoice').value,st=$('qzStatus');
  const L=T10[QZ.lang]||T10.Hinglish;
  const outro=$('qzOutro').value.trim()||L.comment;
  const cv=$('qzCanvas');
  vidBusy=true;
  let ac=null,wake=null,stream=null;
  try{
   ac=new (window.AudioContext||window.webkitAudioContext)();
   await ac.resume();
   const clips=[];
   for(let i=0;i<QZ.qs.length;i++){
    const label='Awaaz '+(i+1)+'/'+QZ.qs.length+':';
    st.textContent=label+' ban rahi hai...';
    try{
     clips.push(await ttsRetry('Say in an energetic, friendly quiz host voice: '+L.say(i+1,QZ.qs[i]),voice,st,label));
    }catch(e){
     if(i===0)throw e;
     clips.push(null);
    }
   }
   const segs=[];
   let acc=2600;
   segs.push({k:'intro',s:0,d:2600});
   QZ.qs.forEach(function(q,i){
    const c=clips[i];
    const qd=Math.max(3200,(c?c.samples.length/c.rate*1000:4500)+700);
    const s={k:'q',i:i,s:acc,qd:qd,td:T*1000,rd:3200};
    s.d=s.qd+s.td+s.rd;
    segs.push(s);acc+=s.d;
   });
   segs.push({k:'outro',s:acc,d:3400});
   const total=acc+3400;
   cv.width=W;cv.height=H;cv.classList.remove('hidden');
   $('qzPlayer').classList.add('hidden');$('qzActions').classList.add('hidden');
   const g=cv.getContext('2d');
   const dest=ac.createMediaStreamDestination();
   const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
   const mime=types.find(function(t){return MediaRecorder.isTypeSupported(t)})||'';
   stream=cv.captureStream(30);
   dest.stream.getAudioTracks().forEach(function(t){stream.addTrack(t)});
   const rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:2500000}:{videoBitsPerSecond:2500000});
   const chunks=[];
   rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
   const done=new Promise(function(r){rec.onstop=r});
   try{wake=await navigator.wakeLock.request('screen')}catch(e){}
   rec.start(500);
   const base=ac.currentTime+0.3;
   const fx=qSfx(ac,dest);
   try{if(typeof toonMusic==='function')toonMusic(ac,dest,base,total/1000+0.5)}catch(e){}
   fx.whoosh(base+0.05);
   segs.forEach(function(s){
    if(s.k!=='q')return;
    const t0=base+s.s/1000;
    fx.whoosh(t0);
    const c=clips[s.i];
    if(c){
     const buf=ac.createBuffer(1,c.samples.length,c.rate);
     buf.copyToChannel(c.samples,0);
     const src=ac.createBufferSource();
     src.buffer=buf;src.connect(dest);src.connect(ac.destination);
     src.start(t0+0.35);
    }
    for(let k=0;k<T;k++)fx.tick(t0+s.qd/1000+k,k>=T-2);
    fx.ding(t0+(s.qd+s.td)/1000);
   });
   fx.ding(base+(total-3400)/1000);
   await new Promise(function(resolve){
    function frame(){
     const el=(ac.currentTime-base)*1000;
     if(el>=total){resolve();return}
     const e2=Math.max(0,el);
     let sg=segs[0];
     for(let k=0;k<segs.length;k++){if(e2>=segs[k].s)sg=segs[k]}
     const lt=(e2-sg.s)/1000;
     g.globalAlpha=1;
     if(sg.k==='intro')drawIntro(g,W,H,lt,L,QZ,T);
     else if(sg.k==='outro')drawOutro(g,W,H,lt,L,QZ,outro);
     else drawQ(g,W,H,sg,lt,QZ.qs[sg.i],sg.i,QZ.qs.length,L,vertical,T,fx);
     st.textContent='Quiz video ban rahi hai... '+Math.round(el/total*100)+'% (app band mat karo)';
     requestAnimationFrame(frame);
    }
    frame();
   });
   rec.stop();
   await done;
   const bt=(rec.mimeType||mime||'video/webm').split(';')[0];
   vidExt=bt.indexOf('mp4')>=0?'mp4':'webm';
   vidBlob=new Blob(chunks,{type:bt});
   const pl=$('qzPlayer');
   if(pl.src)URL.revokeObjectURL(pl.src);
   pl.src=URL.createObjectURL(vidBlob);
   pl.classList.remove('hidden');cv.classList.add('hidden');
   $('qzActions').classList.remove('hidden');
   st.textContent='Quiz video taiyar: '+QZ.qs.length+' sawaal, '+Math.round(total/1000)+' second.';
  }catch(e){
   st.textContent='Video nahi bani: '+(e&&e.message||e);
  }
  if(stream)stream.getTracks().forEach(function(t){t.stop()});
  if(wake){try{wake.release()}catch(e){}}
  if(ac){try{ac.close()}catch(e){}}
  vidBusy=false;
 }
 build();
})();
