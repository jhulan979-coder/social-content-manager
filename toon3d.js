(function(){
 if(typeof THREE==='undefined'){
  window.makeToon3D=function(){alert('3D library load nahi hui. Internet check karo aur app dobara kholo.')};
  return;
 }
 const PI=Math.PI,V3=THREE.Vector3;
 const KC=0x151515;
 let gTex=null;
 function grad(){
  if(!gTex){
   gTex=new THREE.DataTexture(new Uint8Array([80,150,215,255]),4,1,THREE.LuminanceFormat);
   gTex.minFilter=THREE.NearestFilter;
   gTex.magFilter=THREE.NearestFilter;
   gTex.generateMipmaps=false;
   gTex.needsUpdate=true;
  }
  return gTex;
 }
 const outMat=new THREE.MeshBasicMaterial({color:KC,side:THREE.BackSide});
 function tmat(c){return new THREE.MeshToonMaterial({color:c,gradientMap:grad()})}
 function mk(geo,color,o){
  o=o||{};
  const m=new THREE.Mesh(geo,o.basic?new THREE.MeshBasicMaterial({color:color}):tmat(color));
  m.castShadow=!o.noShadow;
  m.receiveShadow=!!o.recv;
  if(o.outline){
   const ol=new THREE.Mesh(geo,outMat);
   ol.scale.setScalar(o.outline);
   m.add(ol);
  }
  return m;
 }
 function sph(r,c,sx,sy,sz,ol){
  const m=mk(new THREE.SphereGeometry(r,20,14),c,{outline:(ol===undefined?1.07:ol)});
  m.scale.set(sx||1,sy||1,sz||1);
  return m;
 }
 function cyl(rt,rb,h,c,seg,ol){
  return mk(new THREE.CylinderGeometry(rt,rb,h,seg||14),c,{outline:(ol===undefined?1.08:ol)});
 }
 function box(w,h,d,c,ol){
  return mk(new THREE.BoxGeometry(w,h,d),c,{outline:ol||0});
 }
 function buildChar(ch){
  const skin=ch.skin,col=ch.color,hat=ch.hat;
  const male=(hat==='turban'||hat==='crown'||hat==='cap'||hat==='none');
  const g=new THREE.Group();
  const root=new THREE.Group();
  g.add(root);
  const legs=[],arms=[],eyes=[],brows=[];
  [-1,1].forEach(sd=>{
   const p=new THREE.Group();
   p.position.set(sd*0.4,1.2,0);
   const l=cyl(0.21,0.21,0.95,'#3b4a7a',12);
   l.position.y=-0.47;
   p.add(l);
   const sh=sph(0.32,'#5b3416',1,0.55,1.4);
   sh.position.set(0,-1.0,0.2);
   p.add(sh);
   root.add(p);
   legs.push(p);
  });
  const body=sph(1,col,1,1.05,0.85);
  body.position.y=1.95;
  root.add(body);
  const belt=mk(new THREE.TorusGeometry(0.92,0.07,8,28),'#3a2410',{outline:0});
  belt.rotation.x=PI/2;
  belt.scale.set(1,0.85,1);
  belt.position.y=1.5;
  root.add(belt);
  const bk=box(0.3,0.26,0.1,'#fbbf24',1.1);
  bk.position.set(0,1.5,0.78);
  root.add(bk);
  [[2.15,0.85],[2.45,0.78],[2.75,0.6]].forEach(q=>{
   const b=sph(0.07,'#fff7d6',1,1,1,0);
   b.position.set(0,q[0],q[1]);
   root.add(b);
  });
  [-1,1].forEach(sd=>{
   const p=new THREE.Group();
   p.position.set(sd*1.02,2.75,0);
   const a=cyl(0.2,0.22,0.9,col,12);
   a.position.y=-0.45;
   p.add(a);
   const h=sph(0.3,'#ffffff');
   h.position.y=-1.0;
   p.add(h);
   const th=sph(0.12,'#ffffff',1,1,1,1.1);
   th.position.set(sd*0.24,-0.92,0.12);
   p.add(th);
   root.add(p);
   arms.push(p);
  });
  const head=new THREE.Group();
  head.position.y=4.0;
  root.add(head);
  head.add(sph(1.35,skin,1.05,0.98,1));
  [-1,1].forEach(sd=>{
   const e=sph(0.3,skin,0.7,1,0.8);
   e.position.set(sd*1.42,0,0);
   head.add(e);
  });
  const nose=sph(0.2,skin,1,0.9,0.9,1.1);
  nose.position.set(0,0,1.28);
  head.add(nose);
  [-1,1].forEach(sd=>{
   const e=new THREE.Group();
   e.position.set(sd*0.5,0.3,1.2);
   e.add(sph(0.38,'#ffffff',0.95,1.2,0.5,1.06));
   const pu=sph(0.17,'#111111',1,1,0.6,0);
   pu.position.set(0,-0.02,0.2);
   e.add(pu);
   const sn=sph(0.06,'#ffffff',1,1,1,0);
   sn.position.set(0.06,0.07,0.34);
   e.add(sn);
   if(!male){
    const ls=box(0.2,0.05,0.05,'#2a1810',0);
    ls.position.set(sd*0.34,0.5,0.2);
    ls.rotation.z=-sd*0.5;
    e.add(ls);
   }
   head.add(e);
   eyes.push(e);
   const br=box(0.62,0.12,0.1,'#2a1810',0);
   br.position.set(sd*0.5,0.8,0.98);
   head.add(br);
   brows.push(br);
  });
  const smile=mk(new THREE.TorusGeometry(0.34,0.06,8,16,PI),'#8a2f2f',{outline:0,noShadow:true});
  smile.rotation.z=PI;
  smile.position.set(0,-0.35,1.24);
  head.add(smile);
  const frown=mk(new THREE.TorusGeometry(0.34,0.06,8,16,PI),'#8a2f2f',{outline:0,noShadow:true});
  frown.position.set(0,-0.62,1.24);
  head.add(frown);
  const openM=sph(0.36,'#5a0f14',1,1,0.35,0);
  openM.position.set(0,-0.62,1.18);
  head.add(openM);
  const tongue=sph(0.2,'#ff7a8a',1,0.5,0.5,0);
  tongue.position.set(0,-0.75,1.22);
  head.add(tongue);
  const teeth=box(0.5,0.1,0.1,'#ffffff',0);
  teeth.position.set(0,-0.45,1.27);
  head.add(teeth);
  if(male&&hat!=='hair'){
   [-1,1].forEach(sd=>{
    const m=sph(0.3,'#2a1810',1,0.4,0.35,0);
    m.position.set(sd*0.22,-0.2,1.3);
    m.rotation.z=sd*0.3;
    head.add(m);
   });
  }
  const hair=function(back){
   const hb=mk(new THREE.SphereGeometry(1.47,22,14,PI*0.9,PI*1.2,0,PI*0.72),'#3a2412',{outline:1.03});
   head.add(hb);
   if(!back){
    const ht=mk(new THREE.SphereGeometry(1.46,22,12,0,PI*2,0,PI*0.28),'#3a2412',{outline:1.03});
    head.add(ht);
   }
  };
  if(hat==='turban'){
   const t1=sph(1.0,'#f5b324',1.3,0.78,1.2);
   t1.position.y=1.15;
   head.add(t1);
   for(let k=0;k<3;k++){
    const r=mk(new THREE.TorusGeometry(1.0-k*0.12,0.07,8,28),'#d9901a',{outline:0});
    r.rotation.x=PI/2-0.15;
    r.position.set(0,0.85+k*0.22,0.05);
    r.scale.set(1.25,1.15,1);
    head.add(r);
   }
   const gem=sph(0.17,'#e11d48');
   gem.position.set(0,1.1,1.25);
   head.add(gem);
   const fe=mk(new THREE.ConeGeometry(0.15,0.9,8),'#f8fafc',{outline:1.1});
   fe.position.set(0.1,1.95,1.0);
   fe.rotation.z=-0.3;
   head.add(fe);
  }else if(hat==='crown'){
   hair(true);
   const c0=cyl(1.0,1.15,0.6,'#fbbf24',16,1.06);
   c0.position.y=1.3;
   head.add(c0);
   for(let k=0;k<6;k++){
    const a=k/6*PI*2;
    const s=mk(new THREE.ConeGeometry(0.2,0.55,8),'#fbbf24',{outline:1.1});
    s.position.set(Math.cos(a)*0.95,1.85,Math.sin(a)*0.95);
    head.add(s);
   }
   const gem=sph(0.13,'#e11d48');
   gem.position.set(0,1.3,1.12);
   head.add(gem);
  }else if(hat==='cap'){
   hair(true);
   const cp=mk(new THREE.SphereGeometry(1.45,20,12,0,PI*2,0,PI/2),col,{outline:1.05});
   cp.position.y=0.05;
   cp.scale.y=0.92;
   head.add(cp);
   const br=box(1.7,0.12,1.1,col,1.1);
   br.position.set(0,0.52,1.38);
   head.add(br);
  }else if(hat==='hair'||hat==='bow'){
   hair(false);
   if(hat==='bow'){
    [-1,1].forEach(sd=>{
     const pg=sph(0.45,'#3a2412',1,1.5,1);
     pg.position.set(sd*1.55,-0.35,-0.2);
     head.add(pg);
    });
    [-1,1].forEach(sd=>{
     const c1=mk(new THREE.ConeGeometry(0.4,0.8,10),'#ec4899',{outline:1.1});
     c1.position.set(0.9+sd*0.5,1.1,0.6);
     c1.rotation.z=sd*PI/2;
     head.add(c1);
    });
    const bb=sph(0.17,'#f9a8d4');
    bb.position.set(0.9,1.1,0.6);
    head.add(bb);
   }
  }else{
   [-0.4,0,0.4].forEach((x,k)=>{
    const tf=mk(new THREE.ConeGeometry(0.16,0.55,8),'#2a1810',{outline:1.1});
    tf.position.set(x,1.5+(k%2)*0.1,0.2);
    tf.rotation.z=-x*0.8;
    head.add(tf);
   });
  }
  g.userData={root:root,legs:legs,arms:arms,body:body,head:head,eyes:eyes,brows:brows,smile:smile,frown:frown,openM:openM,tongue:tongue,teeth:teeth,yaw:0};
  return g;
 }
 function animChar(c,o){
  const U=c.userData,t=o.t,emo=o.emo;
  const sp=Math.sin(t*11);
  const sadE=(emo==='sad'||emo==='angry');
  const oh=(emo==='surprised'||emo==='scared');
  const happy=(emo==='happy'||emo==='laugh');
  U.legs[0].rotation.x=o.walk?sp*0.7:0;
  U.legs[1].rotation.x=o.walk?-sp*0.7:0;
  const L=U.arms[0],R=U.arms[1];
  L.rotation.set(o.walk?-sp*0.7:Math.sin(t*1.5)*0.05,0,-0.22);
  R.rotation.set(o.walk?sp*0.7:Math.sin(t*1.5+1)*0.05,0,0.22);
  if(o.speak){
   L.rotation.set(-1.25+Math.sin(t*6)*0.4*(0.4+o.open),0,-0.2);
   R.rotation.set(0.1,0,0.3+Math.sin(t*3)*0.1);
  }
  if(emo==='angry'&&o.speak)R.rotation.set(-1.4+Math.sin(t*9)*0.2,0,0.1);
  if(emo==='scared'){L.rotation.set(-1.5,0,-0.3);R.rotation.set(-1.5,0,0.3)}
  if(o.jump>0.05){L.rotation.set(0,0,-2.6);R.rotation.set(0,0,2.6)}
  U.root.position.y=(o.walk?Math.abs(sp)*0.18:Math.sin(t*2.4)*0.04)+o.jump;
  U.body.scale.set(1,1.05*(1+0.02*Math.sin(t*2.2)),0.85);
  U.head.rotation.set((o.nod?Math.sin(t*4)*0.08:(o.speak?-0.02+o.open*0.06:0)),0,(o.speak?Math.sin(t*3)*0.06:0)+(emo==='sad'?0.08:0));
  U.head.scale.set(1+o.open*0.03,1-o.open*0.03,1);
  const blink=(t%3.6)<0.13;
  const ev=blink?0.08:(happy?0.5:(oh?1.25:(emo==='angry'?0.78:(emo==='sad'?0.88:1))));
  U.eyes[0].scale.set(1,ev,1);
  U.eyes[1].scale.set(1,ev,1);
  [-1,1].forEach((sd,i)=>{
   const b=U.brows[i];
   let rz=0,y=0.8;
   if(emo==='angry'){rz=sd*0.5;y=0.72}
   else if(emo==='sad'||emo==='scared'){rz=-sd*0.4;y=0.82}
   else if(emo==='surprised'){y=1.0}
   else if(happy){rz=-sd*0.1;y=0.84}
   b.position.y=y;
   b.rotation.z=rz;
  });
  let mo=o.open;
  if(emo==='laugh')mo=Math.max(mo,0.55+0.2*Math.sin(t*14));
  const showOpen=mo>0.12||oh;
  U.openM.visible=showOpen;
  U.tongue.visible=showOpen&&mo>0.25;
  U.teeth.visible=showOpen&&!oh;
  U.smile.visible=!showOpen&&!sadE;
  U.frown.visible=!showOpen&&sadE;
  if(showOpen){
   const small=oh&&mo<=0.12;
   const sy=small?0.9:0.15+mo*0.95;
   U.openM.scale.set(small?0.5:1,sy,0.35);
   U.tongue.position.y=-0.62-0.2*sy;
   U.teeth.position.y=-0.62+0.36*sy-0.05;
  }
 }
 function rnd(seed){let s=seed;return function(){s=(s*9301+49297)%233280;return s/233280}}
 function addTree(g,x,z,sc){
  const tr=cyl(0.28*sc,0.36*sc,2.2*sc,'#7a4a24',8,1.1);
  tr.position.set(x,1.1*sc,z);
  g.add(tr);
  const cols=['#2f8a3a','#3fa047','#58bb5c'];
  [[0,3.0,0,1.5],[-0.9,2.4,0.2,1.1],[0.9,2.5,-0.1,1.15]].forEach((q,i)=>{
   const s=sph(q[3]*sc,cols[i],1,1,1,1.05);
   s.position.set(x+q[0]*sc,q[1]*sc,z+q[2]*sc);
   g.add(s);
  });
 }
 function cloud(sc){
  const g=new THREE.Group();
  [[0,0,0,1.2],[1.3,-0.2,0.2,0.95],[-1.3,-0.1,0,0.9],[0.4,0.55,0,0.9]].forEach(q=>{
   const s=mk(new THREE.SphereGeometry(q[3]*sc,14,10),'#ffffff',{basic:true,noShadow:true});
   s.position.set(q[0]*sc,q[1]*sc,q[2]*sc);
   g.add(s);
  });
  return g;
 }
 function addHouse(g,x,z,wall,roof,sc){
  const w=box(4*sc,3*sc,3.2*sc,wall,1.03);
  w.position.set(x,1.5*sc,z);
  g.add(w);
  const r=mk(new THREE.ConeGeometry(3.4*sc,2.2*sc,4),roof,{outline:1.04});
  r.position.set(x,4.1*sc,z);
  r.rotation.y=PI/4;
  g.add(r);
  const d=box(0.9*sc,1.7*sc,0.1,'#6b3f1d',0);
  d.position.set(x-0.8*sc,0.85*sc,z+1.62*sc);
  g.add(d);
  const wd=mk(new THREE.BoxGeometry(0.9*sc,0.9*sc,0.1),'#bae6fd',{basic:true,noShadow:true});
  wd.position.set(x+0.9*sc,1.8*sc,z+1.62*sc);
  g.add(wd);
 }
 function buildOutdoor(type){
  const g=new THREE.Group();
  const R=rnd(type==='forest'?7:(type==='village'?3:11));
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(160,120),tmat(type==='village'?'#9bd870':'#7bd35a'));
  gr.rotation.x=-PI/2;
  gr.receiveShadow=true;
  g.add(gr);
  [[-34,-50,20,'#5fb24c'],[6,-58,26,'#6bc255'],[40,-48,18,'#57a845']].forEach(h=>{
   const s=sph(h[2],h[3],1.5,0.55,1,0);
   s.position.set(h[0],-2,h[1]);
   s.castShadow=false;
   g.add(s);
  });
  const sun=mk(new THREE.SphereGeometry(3.2,18,12),'#fff2a8',{basic:true,noShadow:true});
  sun.position.set(20,18,-60);
  g.add(sun);
  const clouds=[];
  for(let i=0;i<7;i++){
   const c=cloud(1.5+R()*0.9);
   c.userData.bx=-50+i*16;
   c.position.set(c.userData.bx,14+R()*8,-45-R()*8);
   g.add(c);
   clouds.push(c);
  }
  if(type==='forest'){
   for(let i=0;i<24;i++){
    const x=-32+R()*64,z=-5-R()*30;
    if(Math.abs(x)<5&&z>-10)continue;
    addTree(g,x,z,1+R()*0.7);
   }
  }else if(type==='village'){
   addHouse(g,-9,-12,'#fcd34d','#b45309',1.2);
   addHouse(g,9.5,-14,'#fca5a5','#92400e',1.3);
   addHouse(g,0,-24,'#a5f3fc','#9a3412',1.4);
   const pth=new THREE.Mesh(new THREE.PlaneGeometry(5,60),tmat('#dcc08a'));
   pth.rotation.x=-PI/2;
   pth.position.set(0,0.02,-15);
   pth.receiveShadow=true;
   g.add(pth);
   addTree(g,-16,-8,1.1);
   addTree(g,17,-9,1.2);
  }else{
   ['#ef4444','#f97316','#facc15','#22c55e','#3b82f6','#6366f1','#a855f7'].forEach((c,k)=>{
    const r=mk(new THREE.TorusGeometry(26-k*0.9,0.5,8,40,PI),c,{basic:true,noShadow:true});
    r.position.set(0,-2,-52);
    g.add(r);
   });
  }
  for(let i=0;i<44;i++){
   const f=sph(0.14,['#f472b6','#fde047','#ffffff','#fb923c'][i%4],1,1,1,0);
   f.position.set(-12+R()*24,0.15,-3+R()*8);
   f.castShadow=false;
   g.add(f);
  }
  g.userData.update=function(t){
   clouds.forEach((c,i)=>{c.position.x=((c.userData.bx+t*(0.6+0.25*(i%3))+60)%120)-60});
  };
  return g;
 }
 function buildPalace(){
  const g=new THREE.Group();
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(70,50),tmat('#d8c2a0'));
  fl.rotation.x=-PI/2;fl.receiveShadow=true;g.add(fl);
  const cp=new THREE.Mesh(new THREE.PlaneGeometry(6,40),tmat('#a3162b'));
  cp.rotation.x=-PI/2;cp.position.set(0,0.02,-6);cp.receiveShadow=true;g.add(cp);
  [-3.1,3.1].forEach(x=>{
   const b=new THREE.Mesh(new THREE.PlaneGeometry(0.25,40),new THREE.MeshBasicMaterial({color:'#fbbf24'}));
   b.rotation.x=-PI/2;b.position.set(x,0.03,-6);g.add(b);
  });
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(70,24),tmat('#f0d9a2'));
  wall.position.set(0,12,-9);wall.receiveShadow=true;g.add(wall);
  [-13.5,-9,9,13.5].forEach(x=>{
   const p=cyl(0.75,0.85,11,'#f3e3b8',16,1.04);
   p.position.set(x,5.5,-8);g.add(p);
   const b1=box(2,0.5,2,'#c9962b',1.03);
   b1.position.set(x,0.25,-8);g.add(b1);
   const b2=box(2,0.5,2,'#c9962b',1.03);
   b2.position.set(x,11.2,-8);g.add(b2);
  });
  [-4.6,0,4.6].forEach(x=>{
   const fr=new THREE.Mesh(new THREE.PlaneGeometry(3,5),new THREE.MeshBasicMaterial({color:'#c9962b'}));
   fr.position.set(x,5.8,-8.95);g.add(fr);
   const fa=new THREE.Mesh(new THREE.CircleGeometry(1.5,24,0,PI),new THREE.MeshBasicMaterial({color:'#c9962b'}));
   fa.position.set(x,8.3,-8.95);g.add(fa);
   const w=new THREE.Mesh(new THREE.PlaneGeometry(2.5,4.6),new THREE.MeshBasicMaterial({color:'#a8d4ff'}));
   w.position.set(x,5.8,-8.9);g.add(w);
   const wa=new THREE.Mesh(new THREE.CircleGeometry(1.25,24,0,PI),new THREE.MeshBasicMaterial({color:'#a8d4ff'}));
   wa.position.set(x,8.1,-8.9);g.add(wa);
  });
  [-11.3,11.3].forEach(x=>{
   const d=box(1.3,10,0.5,'#b3123c',0);
   d.position.set(x,5,-7.2);g.add(d);
  });
  const ch=new THREE.Group();
  ch.position.set(0,9,-4);
  const ring=mk(new THREE.TorusGeometry(1.6,0.12,8,24),'#d4a017',{outline:0});
  ring.rotation.x=PI/2;ch.add(ring);
  const cord=cyl(0.05,0.05,6,'#8a6a2a',6,0);
  cord.position.y=3;ch.add(cord);
  const flames=[];
  for(let k=0;k<6;k++){
   const a=k/6*PI*2;
   const f=mk(new THREE.SphereGeometry(0.2,10,8),'#fb923c',{basic:true,noShadow:true});
   f.position.set(Math.cos(a)*1.6,0.35,Math.sin(a)*1.6);
   ch.add(f);flames.push(f);
  }
  g.add(ch);
  const pl=new THREE.PointLight(0xffd9a0,0.5,40);
  pl.position.set(0,8,-3);g.add(pl);
  g.userData.update=function(t){
   flames.forEach((f,i)=>{const s=1+0.25*Math.sin(t*9+i*1.7);f.scale.set(s,s*1.3,s)});
  };
  return g;
 }
 function buildRoom(){
  const g=new THREE.Group();
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(70,50),tmat('#b9772e'));
  fl.rotation.x=-PI/2;fl.receiveShadow=true;g.add(fl);
  for(let k=-8;k<=8;k++){
   const pk=new THREE.Mesh(new THREE.PlaneGeometry(0.06,50),new THREE.MeshBasicMaterial({color:'#8a5a1f'}));
   pk.rotation.x=-PI/2;pk.position.set(k*2,0.02,-5);g.add(pk);
  }
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(70,24),tmat('#f4d58c'));
  wall.position.set(0,12,-8);wall.receiveShadow=true;g.add(wall);
  for(let k=-7;k<=7;k++){
   const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.1,24),tmat('#f8e1a2'));
   sp.position.set(k*2.4,12,-7.99);g.add(sp);
  }
  const bb=box(70,0.9,0.3,'#8a5a1f',0);
  bb.position.set(0,0.45,-7.85);g.add(bb);
  const wf=box(5.4,4.4,0.3,'#8a5a1f',1.03);
  wf.position.set(-4.5,6.4,-7.8);g.add(wf);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(4.6,3.6),new THREE.MeshBasicMaterial({color:'#a8dcff'}));
  gl.position.set(-4.5,6.4,-7.62);g.add(gl);
  const b1=box(0.15,3.6,0.1,'#8a5a1f',0);b1.position.set(-4.5,6.4,-7.58);g.add(b1);
  const b2=box(4.6,0.15,0.1,'#8a5a1f',0);b2.position.set(-4.5,6.4,-7.58);g.add(b2);
  [-8,-1].forEach(x=>{
   const c=box(1.3,5,0.3,'#be123c',0);
   c.position.set(x,6,-7.5);g.add(c);
  });
  const face=mk(new THREE.CylinderGeometry(1.1,1.1,0.2,24),'#ffffff',{outline:1.08});
  face.rotation.x=PI/2;face.position.set(6,7.8,-7.7);g.add(face);
  const hrG=new THREE.Group(),mnG=new THREE.Group();
  hrG.position.set(6,7.8,-7.55);mnG.position.set(6,7.8,-7.52);
  const hh=box(0.14,0.55,0.05,'#111111',0);hh.position.y=0.27;hrG.add(hh);
  const mh=box(0.1,0.85,0.05,'#111111',0);mh.position.y=0.42;mnG.add(mh);
  g.add(hrG);g.add(mnG);
  const sh=box(4.2,0.25,1,'#7c4a1a',1.04);
  sh.position.set(9.5,5.2,-7.2);g.add(sh);
  ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899'].forEach((c,k)=>{
   const bk=box(0.4,0.9+(k%3)*0.2,0.6,c,1.04);
   bk.position.set(8.0+k*0.55,5.2+0.55+(k%3)*0.1,-7.2);g.add(bk);
  });
  const rug=mk(new THREE.CylinderGeometry(5.5,5.5,0.06,32),'#7c3aed',{noShadow:true,recv:true});
  rug.scale.set(1,1,0.55);rug.position.set(0,0.04,1);g.add(rug);
  const rr=mk(new THREE.TorusGeometry(5.3,0.08,6,40),'#fde68a',{basic:true,noShadow:true});
  rr.rotation.x=PI/2;rr.scale.set(1,0.55,1);rr.position.set(0,0.09,1);g.add(rr);
  const lb=cyl(0.1,0.1,3.4,'#5b3a1a',8,0);lb.position.set(-11,1.7,-5.5);g.add(lb);
  const ls=mk(new THREE.CylinderGeometry(0.6,1.1,1.1,16),'#fde68a',{outline:1.05});
  ls.position.set(-11,3.9,-5.5);g.add(ls);
  const pl=new THREE.PointLight(0xffe0a0,0.5,35);
  pl.position.set(-11,4,-5);g.add(pl);
  g.userData.update=function(t){mnG.rotation.z=-t*0.5;hrG.rotation.z=-t*0.04};
  return g;
 }
 function cl01(x){return Math.max(0,Math.min(1,x))}
 window.makeToon3D=async function(){
  if(vidBusy)return;
  const topic=$('toonTopic').value.trim();
  const st=$('toonStatus');
  if(!topic){alert('Pehle kahani ka topic likho.');return}
  const gk=localStorage.getItem('csm_gemini_key');
  if(!gk){alert('Pehle Settings me Gemini key save karo.');show('settings');return}
  if(typeof MediaRecorder==='undefined'){alert('Is phone me video recording support nahi hai.');return}
  const vertical=$('toonFormat').value==='v';
  const W=vertical?540:960,H=vertical?960:540;
  const cv=$('toonCanvas');
  vidBusy=true;
  let ac=null,wake=null,stream=null,renderer=null;
  try{
   st.textContent='Mazedaar kahani likh raha hoon...';
   const story=await toonStory3(topic,$('toonLang').value);
   const defC=['#3b82f6','#ef4444','#10b981'];
   const chars=story.characters.map((c,i)=>({
    name:String(c.name||('Patra '+(i+1))),
    skin:toonColor(c.skin,'#f1c27d'),
    color:toonColor(c.color,defC[i%3]),
    hat:String(c.hat||'none'),
    voice:TOON_VOICES[i%TOON_VOICES.length]
   }));
   const lines=story.lines.map(l=>({
    who:String(l.who||''),
    text:String(l.text||'').trim(),
    bg:String(l.bg||'sky'),
    emo:TOON_EMO[l.emo]?l.emo:'neutral',
    action:String(l.action||'none'),
    prop:String(l.prop||''),
    pop:String(l.pop||'')
   })).filter(l=>l.text);
   if(!lines.length)throw new Error('Kahani khali aayi.');
   const title=String(story.title||'').trim();
   currentScript=(title?title+'\n\n':'')+lines.map(l=>l.who+': '+l.text).join('\n');
   ac=new (window.AudioContext||window.webkitAudioContext)();
   await ac.resume();
   const clips=[];
   for(let i=0;i<lines.length;i++){
    const ch=chars.find(c=>c.name===lines[i].who)||chars[0];
    const label='Awaaz '+(i+1)+'/'+lines.length+':';
    st.textContent=label+' ban rahi hai...';
    try{
     clips.push(await ttsRetry(TOON_EMO[lines[i].emo].say+lines[i].text,ch.voice,st,label));
    }catch(e){
     if(i===0)throw e;
     clips.push(null);
    }
   }
   const aenv=clips.map(toonEnv);
   const durs=clips.map((c,i)=>c?Math.max(2,c.samples.length/c.rate+0.5)*1000:Math.max(2.5,Math.min(8,lines[i].text.split(/\s+/).length*0.45))*1000);
   const total=durs.reduce((x,y)=>x+y,0);
   st.textContent='3D duniya ban rahi hai...';
   const rc=document.createElement('canvas');
   rc.width=W;rc.height=H;
   try{
    renderer=new THREE.WebGLRenderer({canvas:rc,antialias:true,preserveDrawingBuffer:true});
   }catch(e){
    throw new Error('Is phone me 3D (WebGL) chal nahi raha.');
   }
   renderer.setPixelRatio(1);
   renderer.setSize(W,H,false);
   renderer.shadowMap.enabled=true;
   renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   const scene=new THREE.Scene();
   const cam=new THREE.PerspectiveCamera(40,W/H,0.1,200);
   scene.add(new THREE.HemisphereLight(0xffffff,0x8a97a8,0.8));
   const dl=new THREE.DirectionalLight(0xffffff,0.85);
   dl.position.set(6,15,9);
   dl.castShadow=true;
   dl.shadow.mapSize.set(1024,1024);
   const sc2=dl.shadow.camera;
   sc2.left=-15;sc2.right=15;sc2.top=15;sc2.bottom=-15;sc2.near=1;sc2.far=45;
   scene.add(dl);scene.add(dl.target);
   const scn={palace:buildPalace(),room:buildRoom(),forest:buildOutdoor('forest'),village:buildOutdoor('village'),sky:buildOutdoor('sky')};
   Object.keys(scn).forEach(k=>{scn[k].visible=false;scene.add(scn[k])});
   const bgCol={palace:0xf0d9a2,room:0xf4d58c,forest:0x7ec8f5,village:0x86cdf7,sky:0x4f9df0};
   let curEnv=null;
   function setEnv(type){
    const k=scn[type]?type:'sky';
    Object.keys(scn).forEach(n=>{scn[n].visible=(n===k)});
    scene.background=new THREE.Color(bgCol[k]);
    scene.fog=(k==='palace'||k==='room')?null:new THREE.Fog(bgCol[k],35,95);
    curEnv=scn[k];
   }
   setEnv(lines[0].bg);
   const cg=chars.map(c=>{const g=buildChar(c);scene.add(g);return g});
   cv.width=W;cv.height=H;cv.classList.remove('hidden');
   $('toonPlayer').classList.add('hidden');
   $('toonActions').classList.add('hidden');
   const ctx=cv.getContext('2d');
   const dest=ac.createMediaStreamDestination();
   const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
   const mime=types.find(t=>MediaRecorder.isTypeSupported(t))||'';
   stream=cv.captureStream(30);
   dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
   const rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:2500000}:{videoBitsPerSecond:2500000});
   const chunks=[];
   rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
   const done=new Promise(r=>{rec.onstop=r});
   try{wake=await navigator.wakeLock.request('screen')}catch(e){}
   rec.start(500);
   const base=ac.currentTime+0.3;
   const starts=[];
   let acc=0;
   clips.forEach((c,i)=>{
    starts.push(acc);
    if(c){
     const buf=ac.createBuffer(1,c.samples.length,c.rate);
     buf.copyToChannel(c.samples,0);
     const s=ac.createBufferSource();
     s.buffer=buf;
     s.connect(dest);
     s.connect(ac.destination);
     s.start(base+acc/1000);
    }
    acc+=durs[i];
   });
   const fx=toonSfxFns(ac,dest);
   toonMusic(ac,dest,base,total/1000+0.5);
   let pb='';
   lines.forEach((L,i)=>{
    const t0=base+starts[i]/1000;
    if(i>0&&L.bg!==pb)fx.whoosh(Math.max(ac.currentTime,t0-0.08));
    pb=L.bg;
    const key=L.emo==='surprised'?'gasp':L.emo;
    if(fx[key])fx[key](t0+0.02);
    if(L.text.indexOf('!')>=0)fx.boing(t0+0.05);
   });
   const n=chars.length;
   const aspect=W/H;
   const spanX=vertical?5.2:8.2;
   const fitD=Math.max(12,(spanX/2+1.5)/(Math.tan(20*PI/180)*aspect));
   const pos=chars.map((c,k)=>k%2===0?-0.6:1.6);
   cg.forEach((g,k)=>{g.position.set((pos[k]-0.5)*spanX,0,-0.5)});
   let tg=pos.slice();
   let lastI=-1,prevBg='',fade=false,lastEl=0,lastEmit=0,shot='wide',camInit=false;
   const lookV=new V3(0,3.4,0);
   let ps=[];
   function headScreen(k){
    const p=new V3(cg[k].position.x,6.4,cg[k].position.z).project(cam);
    return {x:(p.x*0.5+0.5)*W,y:(-p.y*0.5+0.5)*H};
   }
   await new Promise(resolve=>{
    function frame(){
     const el=(ac.currentTime-base)*1000;
     if(el>=total){resolve();return}
     const e2=Math.max(0,el);
     const dt=Math.min(0.1,Math.max(0,(e2-lastEl)/1000));
     lastEl=e2;
     const t=e2/1000;
     let a2=0,i=0;
     while(i<durs.length-1&&e2>=a2+durs[i]){a2+=durs[i];i++}
     const lt=(e2-a2)/1000;
     const L=lines[i];
     let si=chars.findIndex(c=>c.name===L.who);
     if(si<0)si=0;
     const emoList=TOON_EMO[L.emo].e;
     if(i!==lastI){
      tg=toonTargets(n,si,i);
      const bgCh=(L.bg!==prevBg&&lastI>=0);
      fade=bgCh;
      if(L.bg!==prevBg)setEnv(L.bg);
      prevBg=L.bg;
      lastI=i;
      lastEmit=-9;
      shot=(i===0||bgCh)?'wide':(['angry','surprised','laugh','scared','sad'].indexOf(L.emo)>=0?'close':(i%3===1?'wide':'medium'));
     }
     const mv=[];
     for(let k=0;k<n;k++){
      const d=tg[k]-pos[k];
      const step=0.45*dt;
      if(Math.abs(d)<=step){pos[k]=tg[k];mv[k]=0}
      else{pos[k]+=Math.sign(d)*step;mv[k]=Math.sign(d)}
     }
     if(curEnv&&curEnv.userData.update)curEnv.userData.update(t);
     let q=0;
     for(let k=0;k<n;k++){
      const g=cg[k],sp=(k===si);
      const U=g.userData;
      const tz=sp?0.5:(-0.4-0.5*q);
      if(!sp)q++;
      g.position.z+=(tz-g.position.z)*Math.min(1,dt*3);
      let ty=0;
      if(mv[k]!==0)ty=mv[k]*1.0;
      else if(sp){
       let ox=0,c=0;
       for(let j=0;j<n;j++)if(j!==si){ox+=pos[j];c++}
       ty=((c?ox/c:0.5)-pos[k])*1.2;
      }else ty=(pos[si]-pos[k])*1.2;
      ty=Math.max(-0.9,Math.min(0.9,ty));
      U.yaw+=(ty-U.yaw)*Math.min(1,dt*6);
      let rz=0,py=0,sx=1,sy=1,dxo=0,yawAdd=0;
      const act=L.action;
      if(sp){
       if(act==='fall'){const p=cl01((lt-0.5)/0.35);rz=-p*p*1.45;py=-p*0.3}
       else if(act==='spin'){if(lt<0.9)yawAdd=lt/0.9*PI*4}
       else if(act==='dance'){py=Math.abs(Math.sin(lt*7))*0.8;rz=Math.sin(lt*7)*0.14}
       else if(act==='bonk'){const p=Math.max(0,1-Math.abs(lt-0.45)/0.15);sx=1+0.28*p;sy=1-0.3*p}
       else if(act==='shake'){if(lt<1.4)dxo=Math.sin(lt*45)*0.22}
       else if(act==='grow'){const u=Math.min(1,lt/0.6);sx=sy=1+0.3*u}
       else if(act==='shrink'){const u=Math.min(1,lt/0.6);sx=sy=1-0.3*u}
      }else if((act==='fall'||act==='bonk')&&lt>0.5&&lt<1.3){
       py=Math.abs(Math.sin((lt-0.5)*10))*0.45;
      }
      const jump=(sp&&L.text.indexOf('!')>=0&&lt<0.5)?1.2*Math.sin(PI*lt/0.5):0;
      let open=0;
      if(sp){
       const ae=aenv[i];
       if(ae){const idx=Math.floor(lt*20);open=idx<ae.length?ae[idx]:0}
       else open=0.5+0.5*Math.sin(t*14);
      }
      g.position.x=(pos[k]-0.5)*spanX+dxo;
      g.position.y=py;
      g.rotation.set(0,U.yaw+yawAdd,rz);
      g.scale.set(sx,sy,sx);
      animChar(g,{t:t,walk:mv[k]!==0,speak:sp,open:open,emo:sp?L.emo:'neutral',jump:jump,nod:!sp&&lt>0.8});
     }
     const spW=(pos[si]-0.5)*spanX;
     let dist,cy,ly,fxm;
     if(shot==='wide'){dist=fitD;cy=5.2;ly=3.4;fxm=0.1}
     else if(shot==='medium'){dist=fitD*0.62;cy=4.6;ly=3.9;fxm=0.85}
     else{dist=vertical?9:5.4;cy=4.3;ly=4.1;fxm=0.95}
     const bias=(i%2?1:-1)*(shot==='wide'?0.6:1.6);
     const tp=new V3(spW*fxm+bias+Math.sin(t*0.35)*0.8,cy,dist*0.97+0.5);
     const tl=new V3(spW*fxm,ly,0);
     if(!camInit){cam.position.copy(tp);lookV.copy(tl);camInit=true}
     else{
      const kk=1-Math.exp(-dt*3);
      cam.position.lerp(tp,kk);
      lookV.lerp(tl,kk);
     }
     cam.lookAt(lookV);
     renderer.render(scene,cam);
     ctx.globalAlpha=1;
     ctx.drawImage(rc,0,0,W,H);
     const hs=headScreen(si);
     if(emoList.length&&lt-lastEmit>(L.emo==='laugh'?0.7:99)){
      lastEmit=lt;
      emoList.forEach((em,qq)=>{
       for(let z=0;z<2;z++){
        ps.push({e:em,x:hs.x+(Math.random()-0.5)*W*0.14,y:hs.y-qq*20,vx:(Math.random()-0.5)*40,life:1.8,sz:W*0.075});
       }
      });
     }
     ctx.textAlign='center';ctx.textBaseline='middle';
     for(let z=ps.length-1;z>=0;z--){
      const p=ps[z];
      p.y-=70*dt*(H/960);p.x+=p.vx*dt;p.life-=dt;
      if(p.life<=0){ps.splice(z,1);continue}
      ctx.globalAlpha=Math.min(1,p.life*1.5);
      ctx.font=Math.round(p.sz)+'px sans-serif';
      ctx.fillText(p.e,p.x,p.y);
     }
     ctx.globalAlpha=1;
     const ms=Math.min(W,H);
     if(L.prop&&lt>0.15){
      const sz=Math.max(8,Math.round(ms*0.14*Math.min(1,(lt-0.15)/0.25)));
      ctx.font=sz+'px sans-serif';
      ctx.fillText(L.prop.slice(0,4),hs.x+W*0.16,hs.y+H*0.07+Math.sin(lt*4)*6);
     }
     if(L.action==='bonk'&&lt>0.45&&lt<1.6){
      ctx.font=Math.round(ms*0.06)+'px sans-serif';
      for(let z=0;z<3;z++){
       const a=lt*6+z*2.09;
       ctx.fillText('⭐',hs.x+Math.cos(a)*ms*0.09,hs.y-ms*0.03+Math.sin(a)*ms*0.025);
      }
     }
     if(L.pop&&lt>0.1&&lt<1.4){
      const txt=L.pop.slice(0,10).toUpperCase();
      const p=Math.min(1,(lt-0.1)/0.15);
      const fs=Math.round(ms*0.12*(0.6+0.4*p)*(1+0.08*Math.sin(lt*30)));
      ctx.save();
      ctx.globalAlpha=Math.min(1,(1.4-lt)*3);
      ctx.translate(hs.x-W*0.1,hs.y-H*0.05-lt*20);
      ctx.rotate(-0.15);
      ctx.font='900 '+fs+'px sans-serif';
      ctx.lineJoin='round';ctx.lineWidth=fs*0.22;ctx.strokeStyle='#111';
      ctx.strokeText(txt,0,0);
      ctx.fillStyle='#fde047';ctx.fillText(txt,0,0);
      ctx.restore();
     }
     const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.max(W,H)*0.75);
     vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.38)');
     ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
     if(fade&&lt<0.35){
      ctx.fillStyle='rgba(0,0,0,'+(1-lt/0.35)+')';
      ctx.fillRect(0,0,W,H);
     }
     const sd2=clips[i]?clips[i].samples.length/clips[i].rate:durs[i]/1000;
     toonSub3(ctx,W,H,chars[si].name,L.text,Math.min(1,lt/Math.max(0.5,sd2)));
     const tsize=Math.round(Math.min(W,H)*0.058);
     if(title&&t<2.6){
      ctx.globalAlpha=Math.min(1,(2.6-t)*2);
      ctx.font='800 '+tsize+'px sans-serif';
      const tw=Math.min(W*0.9,ctx.measureText(title).width+50);
      ctx.fillStyle='rgba(0,0,0,0.65)';
      toonRR(ctx,(W-tw)/2,H*0.05,tw,tsize*1.9,24);ctx.fill();
      ctx.fillStyle='#fde047';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(title,W/2,H*0.05+tsize*0.95,W*0.88);
      ctx.globalAlpha=1;
     }
     if(total-e2<2800){
      ctx.font='800 '+tsize+'px sans-serif';
      const lbl='👍 Like  🔔 Subscribe';
      const lw=ctx.measureText(lbl).width+50;
      ctx.fillStyle='rgba(220,38,38,0.9)';
      toonRR(ctx,(W-lw)/2,H*0.05,lw,tsize*1.9,24);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(lbl,W/2,H*0.05+tsize*0.95);
     }
     st.textContent='3D cartoon ban raha hai... '+Math.round(el/total*100)+'% (app band mat karo)';
     requestAnimationFrame(frame);
    }
    frame();
   });
   rec.stop();
   await done;
   const bt=(rec.mimeType||mime||'video/webm').split(';')[0];
   vidExt=bt.indexOf('mp4')>=0?'mp4':'webm';
   vidBlob=new Blob(chunks,{type:bt});
   const pl=$('toonPlayer');
   if(pl.src)URL.revokeObjectURL(pl.src);
   pl.src=URL.createObjectURL(vidBlob);
   pl.classList.remove('hidden');cv.classList.add('hidden');
   $('toonActions').classList.remove('hidden');
   st.textContent='3D cartoon taiyar: '+lines.length+' dialogue, '+Math.round(total/1000)+' second.';
  }catch(e){
   st.textContent='3D cartoon nahi bana: '+(e&&e.message||e);
  }
  if(stream)stream.getTracks().forEach(t=>t.stop());
  if(wake){try{wake.release()}catch(e){}}
  if(ac){try{ac.close()}catch(e){}}
  if(renderer){try{renderer.dispose()}catch(e){}}
  vidBusy=false;
 };
})();
