(function(){
 const $=function(id){return document.getElementById(id)};
 const PAL=[['#1e1b4b','#7c3aed'],['#0f172a','#0ea5e9'],['#3b0764','#db2777'],['#052e16','#16a34a'],['#431407','#f97316'],['#172554','#2563eb'],['#4a044e','#c026d3']];
 const OC=['#ef4444','#3b82f6','#22c55e','#f59e0b'];
 const KE={mcq:'🧠',emoji:'🎬',tf:'⚖️',scam:'🚨'};
 const T10={
  Hindi:{q:'सवाल',ans:'सही जवाब',comment:'कमेंट में अपना जवाब लिखो 👇',score:'आपके कितने सही हुए?',hook:'क्या आप बता पाओगे?',
   emojiQ:'ये इमोजी क्या दिखाते हैं?',tf:['सही','गलत'],sc:['स्कैम 🚨','सुरक्षित ✅'],
   pre:function(n){return 'सवाल नंबर '+n+'.'},tfAsk:'सही या गलत?',scIntro:'ये मैसेज आया है.',scAsk:'स्कैम है या सुरक्षित?',
   opt:['ए','बी','सी','डी'],optW:'विकल्प',rank:['5/5 🧠 जीनियस','3-4 👍 बढ़िया','0-2 😅 फिर कोशिश करो'],time:'टाइम अप!'},
  Hinglish:{q:'Sawaal',ans:'Sahi jawab',comment:'Comment me apna jawab likho 👇',score:'Aapke kitne sahi hue?',hook:'Kya aap bata paoge?',
   emojiQ:'Ye emoji kya dikhate hain?',tf:['Sahi','Galat'],sc:['Scam 🚨','Safe ✅'],
   pre:function(n){return 'Sawaal number '+n+'.'},tfAsk:'Sahi ya galat?',scIntro:'Ye message aaya hai.',scAsk:'Scam hai ya safe?',
   opt:['A','B','C','D'],optW:'Option',rank:['5/5 🧠 Genius','3-4 👍 Badhiya','0-2 😅 Phir koshish karo'],time:'TIME UP!'},
  English:{q:'Question',ans:'Correct answer',comment:'Comment your answer 👇',score:'How many did you get right?',hook:'Can you guess?',
   emojiQ:'What do these emojis show?',tf:['True','False'],sc:['Scam 🚨','Safe ✅'],
   pre:function(n){return 'Question '+n+'.'},tfAsk:'True or false?',scIntro:'You got this message.',scAsk:'Is it a scam or safe?',
   opt:['A','B','C','D'],optW:'Option',rank:['5/5 🧠 Genius','3-4 👍 Nice','0-2 😅 Try again'],time:'TIME UP!'}
 };
 let QZ=null,thumbBlob=null;
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
 function strokeLines(g,L,cx,cy,fillC){
  const lh=L.s*1.28,y0=cy-(L.lines.length-1)*lh/2;
  g.lineJoin='round';g.lineWidth=L.s*0.14;g.strokeStyle='#111';
  L.lines.forEach(function(l,i){g.strokeText(l,cx,y0+i*lh);});
  g.fillStyle=fillC;
  L.lines.forEach(function(l,i){g.fillText(l,cx,y0+i*lh)});
 }
 function kText(g,text,cx,cy,maxW,maxH,start,min,weight,hot,base,hotC){
  const f=fit(g,text,maxW,maxH,start,min,weight);
  g.font=weight+' '+f.s+'px sans-serif';
  g.textAlign='left';g.textBaseline='middle';
  const sp=g.measureText(' ').width,lh=f.s*1.28,y0=cy-(f.lines.length-1)*lh/2;
  let wi=0;
  f.lines.forEach(function(line,ri){
   const ws=line.split(' ');
   let lw=0;
   ws.forEach(function(w,i){lw+=g.measureText(w).width+(i?sp:0)});
   let x=cx-lw/2;
   ws.forEach(function(w){
    g.fillStyle=(hot>=0&&wi<=hot)?hotC:base;
    g.fillText(w,x,y0+ri*lh);
    x+=g.measureText(w).width+sp;wi++;
   });
  });
  g.textAlign='center';
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
   buzz:function(t0){tone('sawtooth',170,110,t0,0.3,0.28)},
   whoosh:function(t0){tone('sawtooth',250,1400,t0,0.28,0.1)}
  };
 }
 function quizMusic(ac,dest,base,segs,total,custom){
  const mg=ac.createGain();
  mg.gain.setValueAtTime(0.0001,base);
  mg.connect(dest);mg.connect(ac.destination);
  segs.forEach(function(s){
   const t0=base+s.s/1000;
   if(s.k==='q'){
    mg.gain.linearRampToValueAtTime(0.05,t0+0.2);
    mg.gain.linearRampToValueAtTime(0.05,t0+s.qd/1000);
    mg.gain.linearRampToValueAtTime(0.15,t0+s.qd/1000+0.3);
    mg.gain.linearRampToValueAtTime(0.15,t0+(s.qd+s.td)/1000);
    mg.gain.linearRampToValueAtTime(0.17,t0+(s.qd+s.td)/1000+0.2);
   }else{
    mg.gain.linearRampToValueAtTime(0.16,t0+0.3);
   }
  });
  const secs=total/1000+0.5;
  if(custom){
   const src=ac.createBufferSource();
   src.buffer=custom;src.loop=true;src.connect(mg);
   src.start(base);src.stop(base+secs);
   return;
  }
  const beat=60/124;
  const chords=[[220.0,261.63,329.63],[174.61,220.0,261.63],[261.63,329.63,392.0],[196.0,246.94,293.66]];
  const bass=[110,87.31,130.81,98];
  const nb=ac.createBuffer(1,Math.floor(ac.sampleRate*0.1),ac.sampleRate);
  const nd=nb.getChannelData(0);
  for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  function osc(type,f1,f2,t,d,v){
   const o=ac.createOscillator(),gn=ac.createGain();
   o.type=type;
   o.frequency.setValueAtTime(f1,t);
   if(f2!==f1)o.frequency.exponentialRampToValueAtTime(f2,t+d);
   gn.gain.setValueAtTime(0.0001,t);
   gn.gain.exponentialRampToValueAtTime(v,t+0.01);
   gn.gain.exponentialRampToValueAtTime(0.0001,t+d);
   o.connect(gn);gn.connect(mg);
   o.start(t);o.stop(t+d+0.03);
  }
  function hat(t){
   const s=ac.createBufferSource();s.buffer=nb;
   const f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=7000;
   const gn=ac.createGain();
   gn.gain.setValueAtTime(0.15,t);gn.gain.exponentialRampToValueAtTime(0.0001,t+0.05);
   s.connect(f);f.connect(gn);gn.connect(mg);
   s.start(t);s.stop(t+0.06);
  }
  for(let k=0;k*beat<secs;k++){
   const t=base+k*beat,cs=Math.floor(k/4)%4,ch=chords[cs];
   osc('sine',150,45,t,0.14,0.9);
   hat(t+beat/2);
   osc('triangle',bass[cs],bass[cs],t,beat*0.9,0.5);
   osc('triangle',ch[k%3]*2,ch[k%3]*2,t,0.22,0.25);
   osc('triangle',ch[(k+1)%3]*2,ch[(k+1)%3]*2,t+beat/2,0.22,0.22);
  }
 }
 function bgDraw(g,W,H,idx,t){
  const p=PAL[idx%PAL.length];
  const gr=g.createLinearGradient(0,0,W,H);
  gr.addColorStop(0,p[0]);gr.addColorStop(1,p[1]);
  g.fillStyle=gr;g.fillRect(-20,-20,W+40,H+40);
  g.save();
  g.translate(W/2,H*0.4);g.rotate(t*0.08);
  for(let k=0;k<10;k++){
   g.rotate(Math.PI*2/10);
   g.fillStyle='rgba(255,255,255,0.045)';
   g.beginPath();g.moveTo(0,0);g.lineTo(W*0.95,-W*0.09);g.lineTo(W*0.95,W*0.09);g.closePath();g.fill();
  }
  g.restore();
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
 function layout(W,H,vertical,no){
  const pad=W*0.055;
  if(no===2){
   if(vertical)return {pad:pad,q:{x:pad,y:H*0.15,w:W-2*pad,h:H*0.3},opts:[0,1].map(function(i){return {x:pad,y:H*0.5+i*H*0.17,w:W-2*pad,h:H*0.15}}),foot:H*0.945,hy:H*0.045};
   const gx=W*0.03,ow=(W-2*pad-gx)/2;
   return {pad:pad,q:{x:pad,y:H*0.17,w:W-2*pad,h:H*0.3},opts:[0,1].map(function(i){return {x:pad+i*(ow+gx),y:H*0.52,w:ow,h:H*0.28}}),foot:H*0.955,hy:H*0.04};
  }
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
  g.fillText(KE[qz.kind]||'🧠',0,-m*0.3-Math.abs(Math.sin(lt*4))*m*0.03);
  g.fillStyle='#ffffff';
  const f=fit(g,qz.title,W*0.84,m*0.34,Math.round(m*0.12),30,'900');
  drawLines(g,f,0,m*0.02);
  g.fillStyle='#fde047';
  g.font='800 '+Math.round(m*0.05)+'px sans-serif';
  g.fillText(L.hook+'  •  '+qz.qs.length+' '+L.q+'  •  '+T+' sec',0,m*0.3,W*0.9);
  g.restore();
  g.globalAlpha=1;
 }
 function drawOutro(g,W,H,lt,L,qz,outro){
  bgDraw(g,W,H,3,lt);
  const m=Math.min(W,H),a=cl(lt/0.5);
  g.globalAlpha=a;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#ffffff';
  const f=fit(g,L.score,W*0.84,m*0.2,Math.round(m*0.09),28,'900');
  drawLines(g,f,W/2,H*0.2);
  const cols=['#86efac','#fde047','#fca5a5'];
  L.rank.forEach(function(r,i){
   g.fillStyle=cols[i];
   g.font='800 '+Math.round(m*0.052)+'px sans-serif';
   g.fillText(r,W/2,H*(0.33+i*0.075),W*0.9);
  });
  g.fillStyle='#ffffff';
  const f2=fit(g,outro,W*0.84,m*0.2,Math.round(m*0.055),22,'800');
  drawLines(g,f2,W/2,H*0.6);
  g.font='800 '+Math.round(m*0.06)+'px sans-serif';
  const lbl='👍 Like  🔔 Subscribe',lw=g.measureText(lbl).width+60;
  g.fillStyle='rgba(220,38,38,0.92)';
  rr(g,(W-lw)/2,H*0.72,lw,m*0.12,m*0.06);g.fill();
  g.fillStyle='#fff';g.fillText(lbl,W/2,H*0.72+m*0.06);
  g.globalAlpha=1;
  confetti(g,W,H,lt);
 }
 function qCard(g,qr,m,kind,q,L,hot,qa,qoff){
  g.globalAlpha=qa;
  g.textAlign='center';g.textBaseline='middle';
  const cx=qr.x+qr.w/2,top=qr.y+qoff;
  if(kind==='scam'){
   g.fillStyle='rgba(15,23,42,0.55)';rr(g,qr.x,top,qr.w,qr.h,m*0.04);g.fill();
   g.fillStyle='#e2e8f0';g.font='800 '+Math.round(m*0.034)+'px sans-serif';
   g.fillText('📩 '+(q.from||''),cx,top+m*0.05,qr.w-m*0.06);
   const bx=qr.x+m*0.03,by=top+m*0.1,bw=qr.w-m*0.06,bh=qr.h-m*0.13;
   g.fillStyle='#f1f5f9';rr(g,bx,by,bw,bh,m*0.035);g.fill();
   kText(g,q.q,bx+bw/2,by+bh/2,bw-m*0.06,bh-m*0.04,Math.round(m*0.052),16,'700',hot,'#111827','#b45309');
  }else{
   const qg=g.createLinearGradient(0,top,0,top+qr.h);
   qg.addColorStop(0,'rgba(255,255,255,0.22)');qg.addColorStop(1,'rgba(255,255,255,0.08)');
   g.fillStyle=qg;rr(g,qr.x,top,qr.w,qr.h,m*0.04);g.fill();
   g.lineWidth=3;g.strokeStyle='rgba(255,255,255,0.45)';g.stroke();
   g.shadowColor='rgba(0,0,0,0.45)';g.shadowBlur=8;
   if(kind==='emoji'){
    let s=Math.round(m*0.2);
    g.font=s+'px sans-serif';
    while(g.measureText(q.emoji).width>qr.w*0.86&&s>24){s-=4;g.font=s+'px sans-serif'}
    g.fillStyle='#fff';g.fillText(q.emoji,cx,top+qr.h*0.4);
    kText(g,q.q,cx,top+qr.h*0.82,qr.w-m*0.08,qr.h*0.28,Math.round(m*0.05),16,'800',hot,'#ffffff','#fde047');
   }else{
    kText(g,q.q,cx,top+qr.h/2,qr.w-m*0.08,qr.h-m*0.06,Math.round(m*0.075),22,'800',hot,'#ffffff','#fde047');
   }
   g.shadowBlur=0;
  }
  g.globalAlpha=1;
 }
 function drawQ(g,W,H,sg,lt,q,idx,tot,L,vertical,T,kind){
  const ms=lt*1000;
  const rev=ms>=sg.qd+sg.td;
  const phase=ms<sg.qd?'q':(rev?'r':'t');
  const lr=rev?(ms-sg.qd-sg.td)/1000:0;
  const no=q.opts.length;
  const OCS=kind==='tf'?['#22c55e','#ef4444']:(kind==='scam'?['#ef4444','#22c55e']:OC);
  g.save();
  if(rev&&lr<0.28){
   const sh=10*(1-lr/0.28);
   g.translate((Math.random()-0.5)*sh,(Math.random()-0.5)*sh);
  }
  bgDraw(g,W,H,idx,sg.s/1000+lt);
  const lay=layout(W,H,vertical,no),m=Math.min(W,H),pad=lay.pad;
  let remain=T;
  if(phase==='t')remain=Math.max(0,T-(ms-sg.qd)/1000);
  if(phase==='r')remain=0;
  const low=(phase==='t'&&remain<=2);
  if(phase==='t'){
   g.fillStyle=low?'#ef4444':'#fde047';
   g.fillRect(0,0,W*(remain/T),m*0.012);
  }
  const hh=m*0.085,hy=lay.hy;
  g.fillStyle='rgba(0,0,0,0.35)';rr(g,pad,hy,m*0.36,hh,hh/2);g.fill();
  g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
  g.font='800 '+Math.round(hh*0.5)+'px sans-serif';
  g.fillText(L.q+' '+(idx+1)+'/'+tot,pad+m*0.18,hy+hh/2);
  const emo=phase==='q'?'🧐':(phase==='t'?(low?'😰':'🤔'):'🥳');
  g.font=Math.round(hh*0.95)+'px sans-serif';
  g.fillText(emo,W/2,hy+hh/2+Math.sin(lt*5)*hh*0.08);
  const rcx=W-pad-hh*0.7,rcy=hy+hh/2;
  let pulse=0;
  if(phase==='t'){const fr=remain-Math.floor(remain);pulse=cl((fr-0.8)/0.2)}
  const rad=hh*0.62*(1+0.2*pulse);
  g.lineWidth=rad*0.22;
  g.strokeStyle='rgba(255,255,255,0.25)';
  g.beginPath();g.arc(rcx,rcy,rad,0,7);g.stroke();
  g.strokeStyle=low?'#ef4444':'#fde047';
  g.beginPath();g.arc(rcx,rcy,rad,-Math.PI/2,-Math.PI/2+Math.PI*2*(remain/T));g.stroke();
  g.fillStyle=low?'#fecaca':'#fff';
  g.font='900 '+Math.round(rad*1.0)+'px sans-serif';
  g.fillText(phase==='r'?'✓':String(Math.ceil(remain)),rcx,rcy+1);
  const dy=hy+hh+m*0.02,ds=m*0.035;
  for(let k=0;k<tot;k++){
   g.fillStyle=k<=idx?'#fde047':'rgba(255,255,255,0.3)';
   g.beginPath();g.arc(W/2+(k-(tot-1)/2)*ds,dy,m*0.011,0,7);g.fill();
  }
  const qa=cl(lt/0.4),qoff=(1-qa)*-40;
  const prog=(lt-0.35)/Math.max(0.5,sg.cd);
  let hot=-1;
  if(prog>0&&prog<1)hot=Math.floor(prog*sg.wc)-sg.pre;
  qCard(g,lay.q,m,kind,q,L,hot,qa,qoff);
  const letters=['A','B','C','D'];
  for(let i=0;i<no;i++){
   const r=lay.opts[i],at=sg.qd/1000*(0.4+0.12*i);
   const a=cl((lt-at)/0.35);
   if(a<=0)continue;
   const off=(1-a)*80*(i%2?1:-1);
   const correct=(i===q.ans);
   g.save();
   g.globalAlpha=a*((rev&&!correct)?0.35:1);
   let sc=1;
   if(rev&&correct)sc=1.03+0.02*Math.sin(lr*8);
   g.translate(r.x+off+r.w/2,r.y+r.h/2);g.scale(sc,sc);g.translate(-r.w/2,-r.h/2);
   let fill='rgba(255,255,255,0.16)',stroke=OCS[i];
   if(rev&&correct){fill='rgba(34,197,94,0.92)';stroke='#bbf7d0';g.shadowColor='rgba(134,239,172,0.9)';g.shadowBlur=26}
   g.fillStyle=fill;rr(g,0,0,r.w,r.h,r.h*0.28);g.fill();
   g.shadowBlur=0;
   g.lineWidth=4;g.strokeStyle=stroke;g.stroke();
   g.textBaseline='middle';
   if(no===2){
    const f2=fit(g,q.opts[i],r.w*0.78,r.h*0.7,Math.round(r.h*0.45),20,'900');
    g.textAlign='center';g.fillStyle='#fff';
    drawLines(g,f2,r.w/2,r.h/2);
    if(rev){g.font=Math.round(r.h*0.28)+'px sans-serif';g.fillText(correct?'✅':'❌',r.w-r.h*0.28,r.h*0.25)}
   }else{
    const bs=r.h*0.66;
    g.fillStyle=(rev&&correct)?'#14532d':OCS[i];
    g.beginPath();g.arc(r.h*0.5,r.h/2,bs/2,0,7);g.fill();
    g.fillStyle='#fff';g.textAlign='center';
    g.font='900 '+Math.round(bs*0.6)+'px sans-serif';
    g.fillText(letters[i],r.h*0.5,r.h/2+1);
    const tw=r.w-r.h*1.25-r.h*0.8;
    const f2=fit(g,q.opts[i],tw,r.h*0.8,Math.round(r.h*0.42),16,'700');
    g.textAlign='left';g.fillStyle='#fff';
    const lh=f2.s*1.28,y0=r.h/2-(f2.lines.length-1)*lh/2;
    f2.lines.forEach(function(l,k){g.fillText(l,r.h*1.1,y0+k*lh)});
    if(rev){
     g.textAlign='center';
     g.font=Math.round(r.h*0.5)+'px sans-serif';
     g.fillText(correct?'✅':'❌',r.w-r.h*0.55,r.h/2);
    }
   }
   g.restore();
  }
  g.globalAlpha=1;g.textAlign='center';g.textBaseline='middle';
  if(rev){
   confetti(g,W,H,lr);
   if(lr<0.9){
    const sz=Math.round(m*0.11*(0.7+0.3*cl(lr/0.15)));
    g.save();g.translate(W/2,H*0.5);g.rotate(-0.08);
    g.globalAlpha=cl((0.9-lr)*4);
    g.font='900 '+sz+'px sans-serif';
    g.lineJoin='round';g.lineWidth=sz*0.18;g.strokeStyle='#111';
    g.strokeText(L.time,0,0);g.fillStyle='#fde047';g.fillText(L.time,0,0);
    g.restore();
   }
   const txt='💡 '+L.ans+': '+(no===2?q.opts[q.ans]:letters[q.ans])+(q.fact?'. '+q.fact:'');
   g.fillStyle='#fde047';
   const f3=fit(g,txt,W-2*pad,H*0.075,Math.round(m*0.04),16,'800');
   drawLines(g,f3,W/2,lay.foot);
  }else{
   g.fillStyle='rgba(253,224,71,'+(0.7+0.3*Math.sin(lt*4))+')';
   g.font='800 '+Math.round(m*0.04)+'px sans-serif';
   g.fillText(L.comment,W/2,lay.foot,W-2*pad);
  }
  g.restore();
  if(rev&&lr<0.2){
   g.fillStyle='rgba(255,255,255,'+(0.55*(1-lr/0.2))+')';
   g.fillRect(0,0,W,H);
  }
 }
 function sayParts(kind,n,q,L){
  const pre=L.pre(n);
  let body='';
  if(kind==='tf')body=q.q+' '+L.tfAsk;
  else if(kind==='scam')body=L.scIntro+' '+q.q+' '+L.scAsk;
  else body=q.q+' '+L.optW+' '+L.opt[0]+', '+q.opts[0]+'. '+L.opt[1]+', '+q.opts[1]+'. '+L.opt[2]+', '+q.opts[2]+'. '+L.opt[3]+', '+q.opts[3]+'.';
  return {text:pre+' '+body,pre:pre.split(/\s+/).length};
 }
 function copyText(t){
  try{navigator.clipboard.writeText(t).then(function(){alert('Copy ho gaya!')},function(){fb()})}catch(e){fb()}
  function fb(){
   const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();
   try{document.execCommand('copy');alert('Copy ho gaya!')}catch(e){}
   a.remove();
  }
 }
 function toB64(b){
  return new Promise(function(res,rej){
   const r=new FileReader();
   r.onload=function(){res(String(r.result).split(',')[1])};
   r.onerror=rej;r.readAsDataURL(b);
  });
 }
 function build(){
  const sec=$('create');
  if(!sec||$('quizCard'))return;
  const d=document.createElement('div');
  d.className='card';d.id='quizCard';
  d.innerHTML='<h3>🧠 Quiz Short (timer wala)</h3>'+
  '<p class="muted">AI sawaal banata hai, timer chalta hai, phir sahi jawab ka reveal. Pehle sawaal check kar lo.</p>'+
  '<label for="qzKind">Quiz type</label><select id="qzKind"><option value="mcq">Normal (A B C D)</option><option value="emoji">Emoji se pehchano</option><option value="tf">Sach ya Jhooth</option><option value="scam">Scam ya Safe?</option></select>'+
  '<label for="qzTopic">Topic</label><input id="qzTopic" placeholder="Jaise: India GK, Bollywood films, Indian khana, Bank scam">'+
  '<div class="actions" id="qzChips"></div>'+
  '<label for="qzLang">Language</label><select id="qzLang"><option>Hindi</option><option>Hinglish</option><option>English</option></select>'+
  '<label for="qzN">Kitne sawaal</label><select id="qzN"><option value="3">3</option><option value="5" selected>5</option><option value="7">7</option></select>'+
  '<label for="qzDiff">Mushkil level</label><select id="qzDiff"><option>Aasan</option><option selected>Madhyam</option><option>Mushkil</option></select>'+
  '<label for="qzT">Timer (second)</label><select id="qzT"><option>4</option><option selected>5</option><option>7</option></select>'+
  '<label for="qzFmt">Video size</label><select id="qzFmt"><option value="v">Vertical (Shorts)</option><option value="h">Horizontal (YouTube)</option></select>'+
  '<label for="qzVoice">Awaaz</label><select id="qzVoice"><option>Kore</option><option>Puck</option><option>Charon</option><option>Aoede</option><option>Fenrir</option></select>'+
  '<label for="qzMusicSel">Peeche ki music</label><select id="qzMusicSel"><option value="auto">Built-in (upbeat)</option><option value="file">Meri apni file</option><option value="none">Koi nahi</option></select>'+
  '<input id="qzMusicFile" type="file" accept="audio/*">'+
  '<p class="muted">Apni music sirf royalty-free ho (jaise YouTube Audio Library). Film ke gaane mat lagana, copyright claim aata hai.</p>'+
  '<label for="qzOutro">Aakhri line (optional)</label><input id="qzOutro" placeholder="Jaise: Roz naye quiz ke liye channel subscribe karo">'+
  '<button class="primary" id="qzGen">1. Sawaal banao</button>'+
  '<div id="qzList" class="result muted"></div>'+
  '<button class="primary hidden" id="qzMake">2. 🎬 Video banao</button>'+
  '<div class="actions hidden" id="qzExtra"><button class="secondary" id="qzThumbBtn">🖼️ Thumbnail banao</button><button class="secondary" id="qzMetaBtn">✍️ Title / description banao</button></div>'+
  '<p id="qzStatus" class="muted"></p>'+
  '<canvas id="qzCanvas" class="hidden" style="width:100%;border-radius:12px;background:#000"></canvas>'+
  '<video id="qzPlayer" class="hidden" controls playsinline style="width:100%;border-radius:12px"></video>'+
  '<div id="qzActions" class="actions hidden"><button class="primary" onclick="saveVideoGallery()">Gallery me save karo</button><button class="secondary" onclick="shareVideo()">Share / Send</button></div>'+
  '<canvas id="qzThumb" class="hidden" style="width:100%;border-radius:12px;margin-top:10px"></canvas>'+
  '<div id="qzThumbAct" class="actions hidden"><button class="secondary" id="qzThumbShare">Thumbnail share / save</button></div>'+
  '<div id="qzMeta" class="result muted" style="margin-top:8px"></div>'+
  '<div id="qzMetaAct" class="actions hidden"><button class="secondary" id="qzMetaCopy">Sab copy karo</button></div>';
  sec.insertBefore(d,sec.children[1]||null);
  ['India GK','Bollywood films','Cricket','Science','Indian khana','Bank aur UPI scam','Itihaas'].forEach(function(t){
   const b=document.createElement('button');
   b.className='secondary';b.textContent=t;
   b.onclick=function(){$('qzTopic').value=t};
   $('qzChips').appendChild(b);
  });
  $('qzGen').onclick=genQuiz;
  $('qzMake').onclick=makeVideo;
  $('qzThumbBtn').onclick=makeThumb;
  $('qzMetaBtn').onclick=genMeta;
  $('qzThumbShare').onclick=shareThumb;
  $('qzMetaCopy').onclick=function(){copyText($('qzMeta').textContent)};
 }
 function promptFor(kind,topic,lang,diff,n){
  const base='Language: '+lang+' (if Hindi, write in Devanagari script). Number of items: '+n+'. Never use double quote characters inside any text value. No trailing commas. ';
  if(kind==='emoji')return 'Create emoji puzzles for a YouTube Short quiz. Topic: '+topic+'. '+base+'Difficulty: '+diff+'. Each puzzle shows 2 to 4 emojis that together hint at one answer (a film, food, place or word). The puzzle must be solvable. Return ONLY JSON: {"title":"catchy title under 40 characters","qs":[{"emoji":"emoji string only","opts":["correct answer","wrong answer","wrong answer","wrong answer"],"fact":"short fun fact under 80 characters"}]}. The FIRST option must always be the correct answer. Each option under 28 characters.';
  if(kind==='tf')return 'Create true or false statements for a YouTube Short quiz. Topic: '+topic+'. '+base+'Difficulty: '+diff+'. Use a balanced mix of true and false statements, all factually certain, each under 90 characters. Return ONLY JSON: {"title":"catchy title under 40 characters","qs":[{"s":"statement","t":true,"fact":"short explanation under 80 characters"}]}.';
  if(kind==='scam')return 'Create a Scam or Safe quiz for a YouTube Short, to teach Indian viewers to spot SMS scams. Topic hint: '+topic+'. '+base+'About half the messages are scams (realistic Indian patterns: KYC update, electricity bill cut, prize or lottery, part time job, parcel or customs, fake loan) with obviously fake, non-working links such as kyc-update-now.xyz and no real brand names. The other half are safe messages (normal OTP, bill paid, delivery update) with no links and no request for sensitive information. Each message under 150 characters. Return ONLY JSON: {"title":"catchy title under 40 characters","qs":[{"from":"sender id like VM-ALERTS or a phone number","msg":"sms text","scam":true,"fact":"why it is a scam or safe, under 80 characters"}]}.';
  return 'Create a quiz for a YouTube Short. Topic: '+topic+'. '+base+'Difficulty: '+diff+'. Questions must be factually correct, unambiguous, with exactly one correct answer, interesting, and short (question under 90 characters, each option under 28 characters). Return ONLY JSON: {"title":"catchy title under 40 characters","qs":[{"q":"question","opts":["correct answer","wrong answer","wrong answer","wrong answer"],"fact":"one short interesting fact about the answer, under 80 characters"}]}. The FIRST option must always be the correct answer (the app shuffles later).';
 }
 async function genQuiz(){
  const kind=$('qzKind').value;
  let topic=$('qzTopic').value.trim();
  if(!topic&&kind==='scam')topic='SMS scams';
  if(!topic){alert('Pehle topic likho.');return}
  if(typeof geminiText!=='function'){alert('Gemini ka code nahi mila.');return}
  const st=$('qzStatus');
  st.textContent='Sawaal ban rahe hain...';
  $('qzMake').classList.add('hidden');$('qzExtra').classList.add('hidden');
  try{
   const n=+$('qzN').value,lang=$('qzLang').value,diff=$('qzDiff').value;
   const L=T10[lang]||T10.Hinglish;
   const prompt=promptFor(kind,topic,lang,diff,n);
   let o=null,err=null;
   for(let k=0;k<3&&!o;k++){
    try{
     const raw=await geminiText(prompt,{temperature:0.8,maxOutputTokens:4000,responseMimeType:'application/json'});
     const j=(typeof toonParseJSON==='function')?toonParseJSON(raw):JSON.parse(String(raw).replace(/```json|```/g,'').trim());
     if(j&&Array.isArray(j.qs)&&j.qs.length)o=j;
    }catch(e){err=e}
   }
   if(!o)throw (err||new Error('Sawaal nahi bane, dobara dabao.'));
   let qs=[];
   if(kind==='mcq'||kind==='emoji'){
    qs=o.qs.slice(0,n).filter(function(q){return q&&Array.isArray(q.opts)&&q.opts.length>=4&&(kind==='emoji'?q.emoji:q.q)}).map(function(q){
     const items=q.opts.slice(0,4).map(function(t,i){return {t:String(t),c:i===0}});
     for(let i=3;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      const x=items[i];items[i]=items[j];items[j]=x;
     }
     return {q:kind==='emoji'?L.emojiQ:String(q.q),emoji:String(q.emoji||''),opts:items.map(function(x){return x.t}),ans:items.findIndex(function(x){return x.c}),fact:String(q.fact||'')};
    });
   }else if(kind==='tf'){
    qs=o.qs.slice(0,n).filter(function(q){return q&&q.s}).map(function(q){
     return {q:String(q.s),opts:[L.tf[0],L.tf[1]],ans:(q.t===true||String(q.t).toLowerCase()==='true')?0:1,fact:String(q.fact||'')};
    });
   }else{
    qs=o.qs.slice(0,n).filter(function(q){return q&&q.msg}).map(function(q){
     return {q:String(q.msg),from:String(q.from||'VM-ALERTS'),opts:[L.sc[0],L.sc[1]],ans:(q.scam===true||String(q.scam).toLowerCase()==='true')?0:1,fact:String(q.fact||'')};
    });
   }
   if(!qs.length)throw new Error('Sawaal sahi format me nahi aaye, dobara dabao.');
   QZ={title:String(o.title||'Quiz').slice(0,45),qs:qs,lang:lang,kind:kind,topic:topic};
   let txt=QZ.title+'\n\n';
   qs.forEach(function(q,i){
    if(kind==='emoji')txt+=(i+1)+'. '+q.emoji+'\n';
    else if(kind==='scam')txt+=(i+1)+'. ['+q.from+'] '+q.q+'\n';
    else txt+=(i+1)+'. '+q.q+'\n';
    q.opts.forEach(function(t,k){txt+='   '+'ABCD'[k]+') '+t+(k===q.ans?'  ✅':'')+'\n'});
    txt+='\n';
   });
   $('qzList').textContent=txt+'Galat lage to "Sawaal banao" dobara dabao.';
   $('qzMake').classList.remove('hidden');$('qzExtra').classList.remove('hidden');
   st.textContent='Sawaal taiyar. Check karke Video banao dabao.';
  }catch(e){
   st.textContent='Sawaal nahi bane: '+(e&&e.message||e);
  }
 }
 function makeThumb(){
  if(!QZ){alert('Pehle sawaal banao.');return}
  const L=T10[QZ.lang]||T10.Hinglish;
  const cv=$('qzThumb'),W=1280,H=720;
  cv.width=W;cv.height=H;
  const g=cv.getContext('2d');
  bgDraw(g,W,H,2,3);
  const vg=g.createRadialGradient(W/2,H/2,H*0.4,W/2,H/2,W*0.7);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.45)');
  g.fillStyle=vg;g.fillRect(0,0,W,H);
  g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#dc2626';rr(g,50,40,260,84,42);g.fill();
  g.fillStyle='#fff';g.font='900 52px sans-serif';g.fillText('QUIZ',180,84);
  const f=fit(g,QZ.title,700,330,120,40,'900');
  g.textAlign='center';
  strokeLines(g,f,400,300,'#ffffff');
  g.font='900 56px sans-serif';
  const hk='🔥 '+L.hook,hw=Math.min(720,g.measureText(hk).width+60);
  g.fillStyle='#facc15';rr(g,400-hw/2,500,hw,100,30);g.fill();
  g.fillStyle='#111';g.fillText(hk,400,552,hw-30);
  let big=KE[QZ.kind]||'🧠';
  if(QZ.kind==='emoji'&&QZ.qs[0]&&QZ.qs[0].emoji)big=QZ.qs[0].emoji;
  let s=330;g.font=s+'px sans-serif';
  while(g.measureText(big).width>460&&s>80){s-=10;g.font=s+'px sans-serif'}
  g.fillText(big,1020,330);
  const lab=QZ.kind==='tf'?['✅','❌']:(QZ.kind==='scam'?['🚨','✅']:['A','B','C','D']);
  const colr=QZ.kind==='tf'?['#22c55e','#ef4444']:(QZ.kind==='scam'?['#ef4444','#22c55e']:OC);
  lab.forEach(function(t,i){
   const x=1020+(i-(lab.length-1)/2)*110,y=610;
   g.fillStyle=colr[i];g.beginPath();g.arc(x,y,44,0,7);g.fill();
   g.lineWidth=5;g.strokeStyle='#fff';g.stroke();
   g.fillStyle='#fff';g.font='900 44px sans-serif';g.fillText(t,x,y+2);
  });
  cv.classList.remove('hidden');$('qzThumbAct').classList.remove('hidden');
  cv.toBlob(function(b){thumbBlob=b},'image/png');
  $('qzStatus').textContent='Thumbnail taiyar. Neeche share / save dabao.';
 }
 async function shareThumb(){
  if(!thumbBlob){alert('Thumbnail abhi ban raha hai, ek second baad dobara dabao.');return}
  const name='quiz-thumb-'+Date.now()+'.png';
  const cap=window.Capacitor&&window.Capacitor.Plugins;
  try{
   if(cap&&cap.Filesystem&&cap.Share){
    const data=await toB64(thumbBlob);
    const w=await cap.Filesystem.writeFile({path:name,data:data,directory:'CACHE'});
    await cap.Share.share({title:'Thumbnail',files:[w.uri]});
   }else{
    const url=URL.createObjectURL(thumbBlob),a=document.createElement('a');
    a.href=url;a.download=name;a.click();
    setTimeout(function(){URL.revokeObjectURL(url)},5000);
   }
  }catch(e){
   const m=String(e&&e.message||e);
   if(!/cancel/i.test(m))alert('Share nahi hua: '+m);
  }
 }
 async function genMeta(){
  if(!QZ){alert('Pehle sawaal banao.');return}
  const st=$('qzStatus');
  st.textContent='YouTube text ban raha hai...';
  try{
   const prompt='Write YouTube Shorts metadata for a quiz video. Quiz title: '+QZ.title+'. Topic: '+QZ.topic+'. Quiz type: '+QZ.kind+'. Language: '+QZ.lang+' (Hinglish means Hindi written in Latin letters). Return ONLY JSON: {"titles":["3 catchy click-worthy titles under 60 characters, each ending with #Shorts"],"description":"2 to 3 lines asking viewers to comment their answers and subscribe","hashtags":"10 relevant hashtags separated by spaces, starting with #quiz #shorts","pinned":"one short pinned comment asking viewers to comment their score"}. Never use double quote characters inside values. No trailing commas.';
   let j=null,err=null;
   for(let k=0;k<2&&!j;k++){
    try{
     const raw=await geminiText(prompt,{temperature:0.9,maxOutputTokens:1500,responseMimeType:'application/json'});
     j=(typeof toonParseJSON==='function')?toonParseJSON(raw):JSON.parse(String(raw).replace(/```json|```/g,'').trim());
    }catch(e){err=e}
   }
   if(!j)throw (err||new Error('text nahi bana'));
   let t='TITLES:\n';
   (j.titles||[]).forEach(function(x,i){t+=(i+1)+'. '+x+'\n'});
   t+='\nDESCRIPTION:\n'+(j.description||'')+'\n\n'+(j.hashtags||'')+'\n\nPINNED COMMENT:\n'+(j.pinned||'');
   $('qzMeta').textContent=t;
   $('qzMetaAct').classList.remove('hidden');
   st.textContent='YouTube text taiyar. "Sab copy karo" dabao.';
  }catch(e){
   st.textContent='Text nahi bana: '+(e&&e.message||e);
  }
 }
 async function makeVideo(){
  if(!QZ){alert('Pehle sawaal banao.');return}
  if(typeof vidBusy!=='undefined'&&vidBusy)return;
  if(typeof MediaRecorder==='undefined'){alert('Is phone me video recording support nahi hai.');return}
  if(typeof ttsRetry!=='function'){alert('Awaaz ka code nahi mila.');return}
  const vertical=$('qzFmt').value==='v',W=vertical?720:1280,H=vertical?1280:720;
  const T=+$('qzT').value,voice=$('qzVoice').value,st=$('qzStatus');
  const L=T10[QZ.lang]||T10.Hinglish,kind=QZ.kind;
  const outro=$('qzOutro').value.trim()||L.comment;
  const cv=$('qzCanvas');
  vidBusy=true;
  let ac=null,wake=null,stream=null;
  try{
   ac=new (window.AudioContext||window.webkitAudioContext)();
   await ac.resume();
   const mm=$('qzMusicSel').value;
   let custom=null;
   if(mm==='file'){
    const f=($('qzMusicFile').files||[])[0];
    if(f){
     try{custom=await ac.decodeAudioData(await f.arrayBuffer())}
     catch(e){st.textContent='Music file padh nahi paya, built-in music chalega.'}
    }
   }
   const clips=[],says=[];
   for(let i=0;i<QZ.qs.length;i++){
    const label='Awaaz '+(i+1)+'/'+QZ.qs.length+':';
    st.textContent=label+' ban rahi hai...';
    const sp=sayParts(kind,i+1,QZ.qs[i],L);
    says.push(sp);
    try{
     clips.push(await ttsRetry(sp.text,voice,st,label));
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
    const cd=c?c.samples.length/c.rate:4.5;
    const qd=Math.max(3200,cd*1000+700);
    const s={k:'q',i:i,s:acc,qd:qd,td:T*1000,rd:3200,cd:cd,wc:says[i].text.split(/\s+/).length,pre:says[i].pre};
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
   if(mm!=='none'){try{quizMusic(ac,dest,base,segs,total,custom)}catch(e){}}
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
    for(let k=0;k<T;k++){
     fx.tick(t0+s.qd/1000+k,k>=T-2);
     if(k>=T-2)fx.tick(t0+s.qd/1000+k+0.5,true);
    }
    fx.buzz(t0+(s.qd+s.td)/1000-0.05);
    fx.ding(t0+(s.qd+s.td)/1000+0.15);
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
     else drawQ(g,W,H,sg,lt,QZ.qs[sg.i],sg.i,QZ.qs.length,L,vertical,T,kind);
     const left=sg.d-(e2-sg.s);
     if(sg.k!=='outro'&&left<220){g.fillStyle='rgba(0,0,0,'+(1-left/220)+')';g.fillRect(0,0,W,H)}
     if(sg.k!=='intro'&&lt<0.18){g.fillStyle='rgba(0,0,0,'+(1-lt/0.18)+')';g.fillRect(0,0,W,H)}
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
 try{
  if(typeof TOON_EMO!=='undefined')Object.keys(TOON_EMO).forEach(function(k){TOON_EMO[k].say=''});
 }catch(e){}
 build();
})();
