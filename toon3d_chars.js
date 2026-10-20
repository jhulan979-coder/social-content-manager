(function(){
 if(typeof THREE==='undefined')return;
 const PI=Math.PI,V2=THREE.Vector2,V3=THREE.Vector3;
 let gt=null;
 function grad(){
  if(!gt){
   gt=new THREE.DataTexture(new Uint8Array([85,150,210,255]),4,1,THREE.LuminanceFormat);
   gt.minFilter=THREE.NearestFilter;gt.magFilter=THREE.NearestFilter;
   gt.generateMipmaps=false;gt.needsUpdate=true;
  }
  return gt;
 }
 const outMat=new THREE.MeshBasicMaterial({color:0x141414,side:THREE.BackSide});
 function shade(c,f){
  const a=new THREE.Color(c),b=new THREE.Color(f<0?0x000000:0xffffff);
  return a.lerp(b,Math.abs(f));
 }
 function tm(c,o){
  return new THREE.MeshToonMaterial({color:c,gradientMap:grad(),emissive:(o&&o.em)||0x000000,emissiveIntensity:(o&&o.ei)||0});
 }
 function mk(geo,c,o){
  o=o||{};
  const m=new THREE.Mesh(geo,tm(c,o));
  m.castShadow=!!o.cs;
  if(o.ol){const l=new THREE.Mesh(geo,outMat);l.scale.setScalar(o.ol);m.add(l)}
  return m;
 }
 function sp(r,c,sx,sy,sz,ol,o){
  const m=mk(new THREE.SphereGeometry(r,18,12),c,Object.assign({ol:ol||0},o||{}));
  m.scale.set(sx||1,sy||1,sz||1);
  return m;
 }
 function cyl(rt,rb,h,c,ol,o){
  return mk(new THREE.CylinderGeometry(rt,rb,h,14),c,Object.assign({ol:ol||0},o||{}));
 }
 function bx(w,h,d,c,o){return mk(new THREE.BoxGeometry(w,h,d),c,o)}
 function tube(pts,rad,c,o){
  const cv=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p[0],p[1],p[2])));
  return mk(new THREE.TubeGeometry(cv,14,rad,6,false),c,o);
 }
 function add(par,m,x,y,z){m.position.set(x,y,z);par.add(m);return m}

 window.toonBuild3D=function(ch){
  const skin=ch.skin,col=ch.color,hat=ch.hat;
  const fem=(hat==='bow'||hat==='hair');
  const HC='#2a1810',GOLD='#f2b632',GO={em:0x4a3000,ei:0.6};
  const g=new THREE.Group(),root=new THREE.Group();
  g.add(root);
  const U={adv:true,yaw:0,root:root,legs:[],arms:[],elbows:[],lids:[],brows:[],cheeks:[],sway:[],irises:[],ph:0};
  let hh=0;
  String(ch.name||'x').split('').forEach(c=>{hh=(hh*31+c.charCodeAt(0))%997});
  U.ph=hh/100;
  g.userData=U;

  [-1,1].forEach(sd=>{
   const hip=new THREE.Group();hip.position.set(sd*0.38,1.62,0);
   add(hip,cyl(0.26,0.21,1.2,fem?shade(col,0.05):'#ece4cf',1.07,{cs:1}),0,-0.58,0);
   add(hip,sp(0.34,'#6a3a1c',0.95,0.6,1.5,1.07,{cs:1}),0,-1.45,0.22);
   root.add(hip);U.legs.push(hip);
  });

  const prof=[[0.98,-0.95],[0.94,-0.6],[0.8,-0.05],[0.82,0.5],[0.98,0.8],[0.78,0.92],[0.36,0.95]].map(p=>new V2(p[0],p[1]));
  const body=mk(new THREE.LatheGeometry(prof,28),col,{ol:1.04,cs:1});
  body.scale.set(1,1,0.78);add(root,body,0,2.4,0);U.body=body;
  const sash=mk(new THREE.TorusGeometry(0.89,0.09,8,30),GOLD,GO);
  sash.rotation.x=PI/2;sash.scale.set(1,0.8,1);add(root,sash,0,2.08,0);
  [[3.05,0.74],[2.78,0.68],[2.52,0.67]].forEach(q=>add(root,sp(0.075,GOLD,1,1,0.7,0,GO),0,q[0],q[1]));
  add(root,cyl(0.36,0.4,0.5,shade(skin,-0.12),0),0,3.5,0);

  if(hat==='crown'){
   const nk=mk(new THREE.TorusGeometry(0.58,0.07,8,26),GOLD,GO);
   nk.rotation.x=PI/2;nk.scale.set(1,0.85,1);add(root,nk,0,3.28,0);
   add(root,sp(0.14,'#e11d48',1,1,0.8,0,{em:0x5a0010,ei:0.6}),0,2.95,0.72);
   const cape=bx(1.9,2.3,0.1,'#b3123c',{cs:1});
   add(root,cape,0,2.4,-0.78);cape.rotation.x=0.06;
   U.sway.push({o:cape,ax:'x',base:0.06,amp:0.06,sp:2.6,ph:0});
  }else if(fem){
   const nk=mk(new THREE.TorusGeometry(0.55,0.05,8,26),GOLD,GO);
   nk.rotation.x=PI/2;nk.scale.set(1,0.85,1);add(root,nk,0,3.25,0);
   add(root,sp(0.1,'#ec4899',1,1,0.8,0,GO),0,2.98,0.7);
  }else{
   const sc=mk(new THREE.TorusGeometry(0.5,0.15,8,24),shade(col,0.55),{});
   sc.rotation.x=PI/2;sc.scale.set(1,0.85,1);add(root,sc,0,3.38,0);
  }

  [-1,1].forEach(sd=>{
   const sh=new THREE.Group();sh.position.set(sd*1.0,3.05,0);
   add(sh,sp(0.26,col,1,1,1,1.07,{cs:1}),0,0,0);
   add(sh,cyl(0.2,0.17,0.85,col,1.08,{cs:1}),0,-0.42,0);
   const el=new THREE.Group();el.position.y=-0.85;sh.add(el);
   add(el,cyl(0.17,0.15,0.72,col,1.08),0,-0.36,0);
   add(el,cyl(0.21,0.2,0.2,shade(col,0.3),1.1),0,-0.7,0);
   if(fem){const bg=mk(new THREE.TorusGeometry(0.2,0.04,6,16),GOLD,GO);bg.rotation.x=PI/2;add(el,bg,0,-0.82,0)}
   const hand=new THREE.Group();hand.position.y=-0.92;el.add(hand);
   add(hand,sp(0.22,skin,1,1.1,0.8,1.08),0,0,0);
   add(hand,sp(0.09,skin,1,1.3,1,1.1),sd*0.2,0.03,0.1);
   add(hand,sp(0.2,skin,1,0.9,0.7,1.06),0,-0.2,0.02);
   root.add(sh);U.arms.push(sh);U.elbows.push(el);
  });

  const head=new THREE.Group();head.position.y=4.55;root.add(head);U.head=head;
  add(head,sp(1.12,skin,1.1,1,1,1.045,{cs:1}),0,0,0);
  add(head,sp(0.82,skin,1.05,0.8,0.95,1.04,{cs:1}),0,-0.5,0.12);
  [-1,1].forEach(sd=>{
   add(head,sp(0.25,skin,0.55,1,0.9,1.1),sd*1.18,0.05,-0.05);
   add(head,sp(0.13,shade(skin,-0.2),0.4,0.8,0.7,0),sd*1.24,0.05,0);
   if(fem)add(head,sp(0.09,GOLD,1,1,1,0,GO),sd*1.22,-0.3,0);
  });
  add(head,sp(0.16,skin,1,0.95,0.9,1.08),0,-0.12,1.06);

  [-1,1].forEach(sd=>{
   const eg=new THREE.Group();eg.position.set(sd*0.44,0.14,0.98);head.add(eg);
   add(eg,sp(0.31,'#ffffff',0.92,1.18,0.55,1.05),0,0,0);
   const irg=new THREE.Group();eg.add(irg);
   add(irg,sp(0.19,fem?'#4a2e18':'#3b2412',1,1,0.4,0),0,-0.01,0.14);
   add(irg,sp(0.1,'#0a0a0a',1,1,0.4,0),0,-0.01,0.18);
   U.irises.push(irg);
   add(eg,sp(0.06,'#ffffff',1,1,0.5,0),0.07,0.08,0.22);
   add(eg,sp(0.03,'#ffffff',1,1,0.5,0),-0.06,-0.06,0.22);
   if(fem)add(eg,tube([[-0.3,0.08,0.12],[0,0.3,0.17],[0.3,0.08,0.12]],0.035,'#1a1008'),0,0,0.04);
   const lg=new THREE.Group();eg.add(lg);
   const lid=mk(new THREE.SphereGeometry(0.34,18,10,0,PI*2,0,PI/2),skin);
   lid.scale.set(1,1.25,0.95);lg.add(lid);
   U.lids.push(lg);
   const br=tube([[-0.28,-0.03,0],[0,0.05,0.05],[0.28,-0.03,0]],0.06,fem?'#3a2414':'#2a1810');
   add(head,br,sd*0.44,0.66,0.84);U.brows.push(br);
   const ck=sp(0.2,'#ff7b9c',1,0.7,0.25,0);
   ck.material=new THREE.MeshBasicMaterial({color:0xff7b9c,transparent:true,opacity:0.4});
   add(head,ck,sd*0.7,-0.28,0.87);U.cheeks.push(ck);
  });

  U.smile=tube([[-0.36,0.07,0],[-0.18,-0.03,0.03],[0,-0.07,0.04],[0.18,-0.03,0.03],[0.36,0.07,0]],0.045,'#7a2326');
  add(head,U.smile,0,-0.54,1.0);
  U.frown=tube([[-0.3,-0.05,0],[-0.15,0.03,0.03],[0,0.06,0.04],[0.15,0.03,0.03],[0.3,-0.05,0]],0.045,'#7a2326');
  add(head,U.frown,0,-0.64,1.0);U.frown.visible=false;
  U.openM=sp(0.4,'#4a0d12',0.85,1,0.35,0);add(head,U.openM,0,-0.7,0.88);U.openM.visible=false;
  U.tongue=sp(0.2,'#ff7a8a',1,0.5,0.4,0);add(head,U.tongue,0,-0.85,1.0);U.tongue.visible=false;
  U.teeth=bx(0.55,0.12,0.08,'#fffdf5');add(head,U.teeth,0,-0.56,1.03);U.teeth.visible=false;

  if(!fem){
   const mu=new THREE.Group();add(head,mu,0,-0.3,1.12);
   [-1,1].forEach(sd=>mu.add(tube([[0,0,0.02],[sd*0.28,-0.03,-0.03],[sd*0.55,0.09,-0.12]],0.08,HC)));
   U.must=mu;
  }

  const hairShell=function(len,rot,y){
   const h=mk(new THREE.SphereGeometry(1.2,22,14,0,PI*2,0,PI*len),HC,{ol:1.03,cs:1});
   h.rotation.x=rot;add(head,h,0,y,-0.05);return h;
  };
  const sideHair=function(){
   [-1,1].forEach(sd=>add(head,sp(0.3,HC,0.6,1.2,0.7,0),sd*1.0,0.25,0.15));
  };

  if(fem){
   add(head,sp(1.15,HC,1.05,1.0,0.9,1.03,{cs:1}),0,0,-0.4);
   hairShell(0.27,-0.3,0.05);
   [-1,1].forEach(sd=>add(head,sp(0.4,HC,0.7,1.7,0.8,1.04),sd*1.1,-0.5,0));
   const bd=new THREE.Group();bd.position.set(0,0.2,-1.05);head.add(bd);
   for(let k=0;k<6;k++)add(bd,sp(0.3-0.03*k,HC,1,1.1,1,1.05),0,-0.1-k*0.45,-0.05-k*0.03);
   U.sway.push({o:bd,ax:'x',base:0,amp:0.12,sp:3,ph:0.5});
   add(head,sp(0.07,'#e11d48',1,1,0.5,0),0,0.38,1.07);
   if(hat==='bow'){
    [-1,1].forEach(sd=>{
     const c1=mk(new THREE.ConeGeometry(0.4,0.8,10),'#ec4899',{ol:1.1});
     c1.rotation.z=sd*PI/2;add(head,c1,0.95+sd*0.45,1.0,0.5);
    });
    add(head,sp(0.17,'#f9a8d4',1,1,1,0),0.95,1.0,0.5);
   }
  }else if(hat==='turban'){
   add(head,sp(1.0,'#f5b324',1.22,0.58,1.15,1.04,{cs:1}),0,1.28,0);
   add(head,sp(0.55,'#ffc83d',1,1,1,1.05,{cs:1}),0,1.78,0);
   for(let k=0;k<3;k++){
    const r=mk(new THREE.TorusGeometry(1.02-k*0.06,0.11,8,30),k%2?'#e09a14':'#ffc83d',{ol:1.06,cs:1});
    r.rotation.x=PI/2+0.18;r.scale.set(1.2,1.1,1);add(head,r,0,0.95+k*0.2,0);
   }
   add(head,sp(0.16,'#e11d48',1,1,0.8,0,{em:0x5a0010,ei:0.6}),0,1.02,1.22);
   const fe=new THREE.Group();add(head,fe,0.35,1.95,0.7);
   fe.add(mk(new THREE.ConeGeometry(0.14,1.0,8),'#f8fafc',{ol:1.1}));
   fe.rotation.z=-0.4;
   U.sway.push({o:fe,ax:'z',base:-0.4,amp:0.15,sp:3.2,ph:1});
   sideHair();
  }else if(hat==='crown'){
   hairShell(0.3,-0.3,0.04);
   const cb=cyl(0.84,0.92,0.42,GOLD,1.06,Object.assign({cs:1},GO));
   cb.rotation.x=-0.12;add(head,cb,0,0.9,-0.02);
   for(let k=0;k<7;k++){
    const a=k/7*PI*2;
    const s=mk(new THREE.ConeGeometry(0.17,0.55,8),GOLD,Object.assign({ol:1.1},GO));
    add(head,s,Math.cos(a)*0.85,1.35,Math.sin(a)*0.85-0.02);
   }
   add(head,sp(0.14,'#e11d48',1,1,0.8,0,{em:0x5a0010,ei:0.7}),0,0.92,0.93);
  }else if(hat==='cap'){
   const cp=mk(new THREE.SphereGeometry(1.22,22,14,0,PI*2,0,PI*0.34),col,{ol:1.04,cs:1});
   cp.rotation.x=-0.2;add(head,cp,0,0.04,-0.05);
   const bd2=mk(new THREE.TorusGeometry(0.98,0.07,8,26),shade(col,-0.3),{});
   bd2.rotation.x=PI/2-0.2;add(head,bd2,0,0.72,0);
   sideHair();
  }else{
   hairShell(0.3,-0.3,0.04);
   sideHair();
   [-0.4,0,0.4].forEach((x,k)=>{
    const tf=mk(new THREE.ConeGeometry(0.16,0.55,8),HC,{ol:1.1});
    tf.rotation.z=-x*0.8;add(head,tf,x,1.2+(k%2)*0.08,0.15);
   });
  }
  return g;
 };

 window.toonAnim3D=function(c,o){
  const U=c.userData,t=o.t,emo=o.emo||'neutral',ph=U.ph||0;
  const happy=(emo==='happy'||emo==='laugh');
  const sp=Math.sin(t*11),op0=o.open||0;
  U.legs[0].rotation.x=o.walk?sp*0.75:0;
  U.legs[1].rotation.x=o.walk?-sp*0.75:0;
  const L=U.arms[0],R=U.arms[1],EL=U.elbows[0],ER=U.elbows[1];
  let lx=o.walk?-sp*0.7:Math.sin(t*1.3+ph)*0.06;
  let rx=o.walk?sp*0.7:Math.sin(t*1.3+ph+1)*0.06;
  let lz=-0.18,rz=0.18,le=o.walk?-0.45:-0.15,re=o.walk?-0.45:-0.15;
  if(o.speak){
   const g1=Math.sin(t*2.1+ph);
   lx=-0.8+Math.sin(t*6)*0.35*(0.4+op0)+g1*0.2;le=-1.0+Math.sin(t*5)*0.4;
   rx=g1>0.3?-0.7:0.1;re=g1>0.3?-0.9:-0.2;rz=0.3+Math.sin(t*3)*0.1;
  }
  if(emo==='angry'&&o.speak){rx=-1.1;re=-1.2+Math.sin(t*9)*0.2}
  if(emo==='scared'){lx=-1.3;rx=-1.3;le=-0.6;re=-0.6}
  if(o.jump>0.05){lx=0;rx=0;lz=-2.5;rz=2.5;le=0;re=0}
  L.rotation.set(lx,0,lz);R.rotation.set(rx,0,rz);
  EL.rotation.x=le;ER.rotation.x=re;
  U.body.scale.set(1,1+0.018*Math.sin(t*2.2+ph),0.78);
  U.root.position.y=(o.walk?Math.abs(sp)*0.18:Math.sin(t*2.4+ph)*0.04)+(o.jump||0);
  U.root.rotation.z=o.walk?Math.sin(t*5.5)*0.04:Math.sin(t*0.8+ph)*0.025;
  U.root.rotation.y=o.speak?Math.sin(t*1.7+ph)*0.08:0;
  const H=U.head;
  H.rotation.x=o.nod?Math.sin(t*4)*0.07:(o.speak?-0.03+op0*0.07:0.02*Math.sin(t*1.3+ph));
  H.rotation.z=(o.speak?Math.sin(t*3)*0.05:0)+(emo==='sad'?0.08:0);
  H.rotation.y=o.speak?Math.sin(t*2)*0.12:Math.sin(t*0.6+ph)*0.08;
  H.position.y=4.55+(o.speak?op0*0.03:0);

  const blink=(t%3.6)<0.13;
  let a=-1.1,slant=0;
  if(emo==='angry'){a=-0.6;slant=0.38}
  else if(emo==='sad'){a=-0.7;slant=-0.32}
  else if(emo==='surprised'||emo==='scared')a=-1.55;
  else if(happy)a=0.3;
  if(blink)a=1.3;
  U.lids.forEach((lg,i)=>{lg.rotation.x=a;lg.rotation.z=(i?1:-1)*slant});
  const sx=Math.sin(t*0.9+ph)*0.6+Math.sin(t*2.3+ph*2)*0.4,sy=Math.sin(t*1.1+ph)*0.3;
  U.irises.forEach(ir=>{ir.position.x=sx*0.05;ir.position.y=-0.01+sy*0.04});
  U.brows.forEach((b,i)=>{
   const sd=i?1:-1;let rz2=0,y=0.66;
   if(emo==='angry'){rz2=sd*0.5;y=0.58}
   else if(emo==='sad'||emo==='scared'){rz2=-sd*0.42;y=0.7}
   else if(emo==='surprised'){y=0.84}
   else if(happy){rz2=-sd*0.12;y=0.7}
   if(o.speak)y+=Math.abs(Math.sin(t*4))*0.04;
   b.position.y=y;b.rotation.z=rz2;
  });
  U.cheeks.forEach(k=>k.scale.set(happy?1.25:1,happy?0.9:0.7,0.25));

  let op=op0;
  if(emo==='laugh')op=Math.max(op,0.5+0.25*Math.sin(t*14));
  const oh=(emo==='surprised'||emo==='scared');
  const show=op>0.1||oh;
  const sadM=(emo==='sad'||emo==='angry');
  U.openM.visible=show;
  U.tongue.visible=show&&op>0.3;
  U.teeth.visible=show&&!oh;
  U.smile.visible=!show&&!sadM;
  U.frown.visible=!show&&sadM;
  if(show){
   const small=oh&&op<=0.1;
   const h=small?0.28:0.1+0.62*op;
   const ytop=-0.5;
   U.openM.position.y=ytop-h/2;
   U.openM.scale.set(small?0.38:0.9-0.25*Math.min(1,op),h/0.8,0.35);
   U.tongue.position.y=ytop-h+0.12;
   U.teeth.position.y=ytop-0.05;
  }
  if(U.must){U.must.scale.y=1+op0*0.2;U.must.position.y=-0.3+op0*0.03}
  U.sway.forEach(s=>{s.o.rotation[s.ax]=s.base+Math.sin(t*s.sp+s.ph)*s.amp*(o.walk?2:1)});
 };
})();
