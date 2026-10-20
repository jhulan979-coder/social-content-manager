(function(){
 if(typeof THREE==='undefined')return;
 const PI=Math.PI;
 window.toonDecor3D=function(scn,scene){
  const mats={};
  function mat(c){return mats[c]||(mats[c]=new THREE.MeshToonMaterial({color:c}))}
  function mesh(geo,c){return new THREE.Mesh(geo,mat(c))}
  function hook(env,fn){
   const old=env.userData.update;
   env.userData.update=function(t){if(old)old(t);fn(t)};
  }
  const R=(function(s){return function(){s=(s*9301+49297)%233280;return s/233280}})(5);
  function motes(env,n,x0,x1,y1,z0,z1,col){
   const arr=[];
   for(let k=0;k<n;k++){
    const s=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,5),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.7}));
    s.userData={x:x0+R()*(x1-x0),y:R()*y1,z:z0+R()*(z1-z0),sp:0.2+R()*0.4,ph:R()*6};
    env.add(s);arr.push(s);
   }
   hook(env,function(t){
    arr.forEach(s=>{const d=s.userData;s.position.set(d.x+Math.sin(t*0.5+d.ph)*0.6,(d.y+t*d.sp)%y1,d.z)});
   });
  }
  ['forest','village','sky'].forEach(function(type){
   const env=scn[type];if(!env)return;
   const bf=[];
   for(let k=0;k<6;k++){
    const g=new THREE.Group();
    const col=[0xff8ad1,0xffd34d,0x7ad7ff,0xff9a52][k%4];
    const w1=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.4),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));
    const w2=w1.clone();
    w1.position.x=-0.25;w2.position.x=0.25;
    const p1=new THREE.Group();p1.add(w1);
    const p2=new THREE.Group();p2.add(w2);
    g.add(p1);g.add(p2);
    g.userData={cx:-9+R()*18,cy:1.6+R()*2.4,cz:-1-R()*8,r:1.5+R()*2,sp:0.4+R()*0.5,ph:R()*6,p1:p1,p2:p2};
    env.add(g);bf.push(g);
   }
   hook(env,function(t){
    bf.forEach(g=>{
     const d=g.userData,a=t*d.sp+d.ph;
     g.position.set(d.cx+Math.cos(a)*d.r,d.cy+Math.sin(t*1.7+d.ph)*0.5,d.cz+Math.sin(a)*d.r*0.6);
     g.rotation.y=-a+PI;
     const f=Math.sin(t*18+d.ph)*0.9;
     d.p1.rotation.y=-f;d.p2.rotation.y=f;
    });
   });
   const bd=[];
   for(let k=0;k<4;k++){
    const g=new THREE.Group();
    const a=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.06,0.25),new THREE.MeshBasicMaterial({color:0x2b3a4a}));
    const b=a.clone();
    a.position.x=-0.45;b.position.x=0.45;
    const pa=new THREE.Group();pa.add(a);
    const pb=new THREE.Group();pb.add(b);
    g.add(pa);g.add(pb);
    g.userData={y:12+R()*5,z:-30-R()*10,sp:3+R()*2,ph:R()*60,pa:pa,pb:pb};
    env.add(g);bd.push(g);
   }
   hook(env,function(t){
    bd.forEach(g=>{
     const d=g.userData;
     g.position.set(((t*d.sp+d.ph)%90)-45,d.y+Math.sin(t*2+d.ph)*0.5,d.z);
     const f=Math.sin(t*9+d.ph)*0.6;
     d.pa.rotation.z=f;d.pb.rotation.z=-f;
    });
   });
   motes(env,14,-14,14,8,-8,3,0xfff2a0);
   if(type==='forest'){
    const lv=[];
    for(let k=0;k<12;k++){
     const l=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.2),new THREE.MeshBasicMaterial({color:[0xd97706,0x65a30d,0xb45309][k%3],side:THREE.DoubleSide}));
     l.userData={x:-14+R()*28,z:-2-R()*14,sp:0.8+R()*0.6,ph:R()*6};
     env.add(l);lv.push(l);
    }
    hook(env,function(t){
     lv.forEach(l=>{
      const d=l.userData;
      l.position.set(d.x+Math.sin(t*1.3+d.ph)*1.2,10-((t*d.sp+d.ph)%10),d.z);
      l.rotation.set(t*2+d.ph,t*1.5,0);
     });
    });
    for(let k=0;k<7;k++){
     const g=new THREE.Group();
     const st=mesh(new THREE.CylinderGeometry(0.12,0.16,0.4,8),0xf5e9d0);st.position.y=0.2;g.add(st);
     const cap=mesh(new THREE.SphereGeometry(0.34,12,8,0,PI*2,0,PI/2),0xe53935);cap.position.y=0.4;g.add(cap);
     g.position.set(-8+R()*16,0,2+R()*5);g.scale.setScalar(0.8+R()*0.8);
     env.add(g);
    }
   }
   if(type==='village'){
    const wm=new THREE.Group();wm.position.set(-20,0,-26);
    const tw=mesh(new THREE.CylinderGeometry(1.2,2,8,12),0xe8d9b8);tw.position.y=4;wm.add(tw);
    const rf=mesh(new THREE.ConeGeometry(1.8,2,12),0xb45309);rf.position.y=9;wm.add(rf);
    const hub=new THREE.Group();hub.position.set(0,8,1.6);wm.add(hub);
    for(let k=0;k<4;k++){
     const b=mesh(new THREE.BoxGeometry(0.5,5,0.1),0xfaf3e0);b.position.y=2.5;
     const pv=new THREE.Group();pv.rotation.z=k*PI/2;pv.add(b);hub.add(pv);
    }
    env.add(wm);
    hook(env,function(t){hub.rotation.z=t*0.8});
    for(let k=0;k<3;k++){
     const h=mesh(new THREE.ConeGeometry(1.2,1.8,10),0xe3b341);
     h.position.set(10+k*2.4,0.9,-4-k);env.add(h);
    }
   }
   if(type==='sky'){
    const bl=new THREE.Group();
    const ball=mesh(new THREE.SphereGeometry(2.2,16,12),0xef4444);ball.scale.y=1.2;bl.add(ball);
    const stripe=mesh(new THREE.TorusGeometry(2.2,0.15,6,24),0xfde047);stripe.rotation.x=PI/2;bl.add(stripe);
    const bk=mesh(new THREE.BoxGeometry(1,0.7,1),0x8a5a2b);bk.position.y=-3.6;bl.add(bk);
    bl.position.set(14,10,-22);env.add(bl);
    hook(env,function(t){bl.position.y=10+Math.sin(t*0.6)*0.8;bl.rotation.z=Math.sin(t*0.4)*0.05});
   }
  });
  if(scn.palace){
   const env=scn.palace;
   const th=new THREE.Group();th.position.set(0,0,-6.2);
   const s1=mesh(new THREE.BoxGeometry(5,0.5,3),0xb91c1c);s1.position.y=0.25;th.add(s1);
   const s2=mesh(new THREE.BoxGeometry(3.6,0.5,2.2),0x991b1b);s2.position.set(0,0.75,-0.2);th.add(s2);
   const seat=mesh(new THREE.BoxGeometry(1.7,0.6,1.5),0xf2b632);seat.position.set(0,1.3,-0.4);th.add(seat);
   const back=mesh(new THREE.BoxGeometry(1.7,2.6,0.3),0xf2b632);back.position.set(0,2.8,-1.1);th.add(back);
   const top=mesh(new THREE.SphereGeometry(0.35,10,8),0xe11d48);top.position.set(0,4.3,-1.1);th.add(top);
   env.add(th);
   motes(env,18,-12,12,10,-6,3,0xfff0c0);
  }
  if(scn.room){
   const env=scn.room;
   const pot=mesh(new THREE.CylinderGeometry(0.6,0.45,0.9,12),0xb45309);pot.position.set(-10,0.45,-4);env.add(pot);
   for(let k=0;k<5;k++){
    const lf=mesh(new THREE.SphereGeometry(0.5,10,8),0x22c55e);
    lf.scale.set(0.5,1.3,0.5);lf.position.set(-10+(k-2)*0.35,1.7,-4);lf.rotation.z=(k-2)*0.25;env.add(lf);
   }
   const tb=mesh(new THREE.CylinderGeometry(1.4,1.4,0.15,16),0x8a5a1f);tb.position.set(10,1.5,-3);env.add(tb);
   const tg=mesh(new THREE.CylinderGeometry(0.12,0.12,1.5,8),0x6b3f1d);tg.position.set(10,0.75,-3);env.add(tg);
   const cup=mesh(new THREE.CylinderGeometry(0.28,0.22,0.35,10),0xffffff);cup.position.set(10,1.75,-3);env.add(cup);
   motes(env,14,-12,12,9,-6,3,0xfff0c0);
  }
 };

 window.toonStory3=async function(topic,lang){
  const prompt='Write a genuinely funny, fast slapstick cartoon story for a YouTube Shorts video. Topic: '+topic+'. Language: '+lang+' (if Hindi, write in Devanagari script). Use 2 or 3 characters with very different personalities. Quick witty dialogue, exaggerated reactions, physical comedy, a surprising twist near the end and a one-line funny moral. The first line must be a strong hook. Use at least 3 different locations (bg). Every line must be short and punchy. Return ONLY valid JSON in this exact shape: {"title":"...","characters":[{"name":"...","skin":"#f1c27d","color":"#3b82f6","hat":"none"}],"lines":[{"who":"exact character name","text":"one or two short sentences","bg":"palace","emo":"happy","action":"none","prop":"","pop":""}]}. hat must be one of: none, turban, crown, cap, hair, bow. bg must be one of: palace, forest, village, room, sky. emo must be one of: happy, angry, surprised, sad, laugh, scared, neutral. action must be one of: none, fall, spin, dance, bonk, shake, grow, shrink. prop is ONE emoji the speaker holds or an empty string. pop is a short comic sound word in English capitals like BONK!, POW!, OOPS!, HA HA!, BOOM! or an empty string. Use action, prop or pop in about half of the lines. Give 12 to 14 lines, each under 90 characters. Character names must be short. Never use double quote characters inside any text value (use single quotes instead). No trailing commas. Keep the JSON compact.';
  let j=null,lastErr=null;
  for(let k=0;k<3&&!j;k++){
   try{
    const raw=await geminiText(prompt,{temperature:k?0.7:1,maxOutputTokens:5000,responseMimeType:'application/json'});
    const o=toonParseJSON(raw);
    if(o&&o.characters&&o.characters.length&&o.lines&&o.lines.length)j=o;
    else lastErr=new Error('kahani adhuri aayi');
   }catch(e){lastErr=e}
  }
  if(!j)throw new Error('Kahani ka format theek nahi aaya, dobara dabao. ('+(lastErr&&lastErr.message||'')+')');
  j.characters=j.characters.slice(0,3);
  j.lines=j.lines.filter(l=>l&&String(l.text||'').trim()).slice(0,14);
  if(!j.lines.length)throw new Error('Kahani khali aayi.');
  window.__toon=window.__toon||{};
  window.__toon.raw=j.lines;
  return j;
 };
})();
