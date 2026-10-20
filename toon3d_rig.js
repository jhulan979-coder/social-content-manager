(function(){
 if(typeof THREE==='undefined')return;
 const PI=Math.PI,V3=THREE.Vector3;
 const $=function(id){return document.getElementById(id)};
 let models=[];
 function setStatus(t){const e=$('rigStatus');if(e)e.textContent=t}
 function idb(){
  return new Promise(function(res,rej){
   const r=indexedDB.open('toonrig',1);
   r.onupgradeneeded=function(){r.result.createObjectStore('m')};
   r.onsuccess=function(){res(r.result)};
   r.onerror=function(){rej(r.error)};
  });
 }
 async function idbSet(k,v){
  const d=await idb();
  return new Promise(function(res,rej){
   const tx=d.transaction('m','readwrite');
   tx.objectStore('m').put(v,k);
   tx.oncomplete=function(){res()};
   tx.onerror=function(){rej(tx.error)};
  });
 }
 async function idbGet(k){
  const d=await idb();
  return new Promise(function(res,rej){
   const q=d.transaction('m','readonly').objectStore('m').get(k);
   q.onsuccess=function(){res(q.result)};
   q.onerror=function(){rej(q.error)};
  });
 }
 async function idbDel(k){
  const d=await idb();
  return new Promise(function(res,rej){
   const tx=d.transaction('m','readwrite');
   tx.objectStore('m').delete(k);
   tx.oncomplete=function(){res()};
   tx.onerror=function(){rej(tx.error)};
  });
 }
 function parseBuf(buf){
  return new Promise(function(res,rej){
   try{new THREE.GLTFLoader().parse(buf,'',res,rej)}catch(e){rej(e)}
  });
 }
 async function loadModels(){
  if(!THREE.GLTFLoader||!THREE.SkeletonUtils){setStatus('3D loader load nahi hua. Internet check karo aur app dobara kholo.');return}
  let bufs=[];
  try{bufs=(await idbGet('models'))||[]}catch(e){}
  const out=[];
  for(let i=0;i<bufs.length;i++){
   try{out.push(await parseBuf(bufs[i]))}catch(e){}
  }
  models=out;
  if(!out.length){setStatus(bufs.length?'Model padh nahi paya. Koi aur .glb try karo.':'Abhi koi model nahi chuna.');return}
  const names=(out[0].animations||[]).map(function(a){return a.name}).slice(0,10).join(', ');
  setStatus(out.length+' model taiyar. Pehle model ki animations: '+(names||'koi nahi (patra T-pose me khada rahega)'));
 }
 function rigOn(){const e=$('rigOn');return e?e.checked:true}
 function rigFlip(){const e=$('rigFlip');return e?e.checked:false}
 function hashN(s){let h=0;String(s).split('').forEach(function(c){h=(h*31+c.charCodeAt(0))>>>0});return h}
 function M(c){return new THREE.MeshStandardMaterial({color:c,roughness:0.55,metalness:0.2})}
 function mkHat(hat,col){
  const g=new THREE.Group();
  if(hat==='crown'){
   g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.46,0.3,16),M('#f2b632')));
   for(let k=0;k<6;k++){
    const a=k/6*PI*2;
    const c=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.3,8),M('#f2b632'));
    c.position.set(Math.cos(a)*0.4,0.28,Math.sin(a)*0.4);g.add(c);
   }
   return g;
  }
  if(hat==='turban'){
   const d=new THREE.Mesh(new THREE.SphereGeometry(0.55,16,12),M('#f5b324'));
   d.scale.set(1.15,0.7,1.1);d.position.y=0.15;g.add(d);
   const t=new THREE.Mesh(new THREE.SphereGeometry(0.3,12,10),M('#ffc83d'));
   t.position.y=0.5;g.add(t);
   const m=new THREE.Mesh(new THREE.SphereGeometry(0.09,10,8),M('#e11d48'));
   m.position.set(0,0.2,0.55);g.add(m);
   return g;
  }
  if(hat==='cap'){
   const c=new THREE.Mesh(new THREE.SphereGeometry(0.5,16,10,0,PI*2,0,PI*0.5),M(col||'#3b82f6'));
   c.position.y=0.05;g.add(c);
   return g;
  }
  if(hat==='bow'){
   [-1,1].forEach(function(sd){
    const c=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.34,10),M('#ec4899'));
    c.rotation.z=sd*PI/2;c.position.set(0.3+sd*0.17,0.45,0.15);g.add(c);
   });
   return g;
  }
  return null;
 }
 function buildRig(ch){
  const gl=models[hashN(ch.name)%models.length];
  const model=THREE.SkeletonUtils.clone(gl.scene);
  const g=new THREE.Group(),root=new THREE.Group(),holder=new THREE.Group();
  g.add(root);root.add(holder);holder.add(model);
  holder.rotation.y=rigFlip()?PI:0;
  const tint=new THREE.Color(ch.color||'#3b82f6');
  model.traverse(function(m){
   if(m.isMesh){
    m.castShadow=true;m.frustumCulled=false;
    const arr=Array.isArray(m.material)?m.material:[m.material];
    const nm=arr.map(function(mt){
     const c=mt.clone();
     if(c.color){
      const h={};c.color.getHSL(h);
      const skinLike=(h.h>0.02&&h.h<0.11&&h.s>0.25&&h.l>0.35);
      if(!skinLike&&h.l>0.15&&h.l<0.9)c.color.lerp(tint,0.5);
     }
     return c;
    });
    m.material=Array.isArray(m.material)?nm:nm[0];
   }
  });
  model.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model);
  const size=new V3();box.getSize(size);
  model.scale.multiplyScalar(5.6/(size.y||1));
  model.updateMatrixWorld(true);
  box.setFromObject(model);
  const ctr=new V3();box.getCenter(ctr);
  model.position.x-=ctr.x;model.position.z-=ctr.z;model.position.y-=box.min.y;
  model.updateMatrixWorld(true);
  const mixer=new THREE.AnimationMixer(model);
  const clips=gl.animations||[];
  const pick=function(res){
   for(let i=0;i<res.length;i++){
    const c=clips.find(function(x){return res[i].test(x.name)});
    if(c)return c;
   }
   return null;
  };
  const roles={
   idle:pick([/idle/i,/stand/i,/breath/i])||clips[0]||null,
   walk:pick([/walk/i,/run/i,/jog/i]),
   talk:pick([/talk/i,/wave/i,/gestur/i,/work/i,/punch/i,/yes/i,/dance/i]),
   jump:pick([/jump/i])
  };
  const acts={};
  Object.keys(roles).forEach(function(k){if(roles[k])acts[k]=mixer.clipAction(roles[k])});
  let head=null,jaw=null;const morphs=[];
  model.traverse(function(o){
   if(o.isBone){
    const n=o.name||'';
    if(!head&&/head/i.test(n)&&!/top|end|tip/i.test(n))head=o;
    if(!jaw&&/jaw/i.test(n))jaw=o;
   }
   if(o.morphTargetDictionary){
    Object.keys(o.morphTargetDictionary).forEach(function(k){
     if(/mouthopen|jawopen|viseme_aa|^aa$|mouth_open/i.test(k))morphs.push({m:o,i:o.morphTargetDictionary[k]});
    });
   }
  });
  let headAnim=false;
  if(head){
   headAnim=clips.some(function(cl){return cl.tracks.some(function(tr){return tr.name.indexOf(head.name+'.')===0})});
   const hat=mkHat(ch.hat,ch.color);
   if(hat){
    const ws=new V3();head.getWorldScale(ws);
    const s=ws.y||1;
    hat.scale.setScalar(1/s);
    hat.position.set(0,0.8/s,0);
    head.add(hat);
   }
  }
  g.userData={adv:true,rig:true,yaw:0,root:root,holder:holder,mixer:mixer,acts:acts,cur:'',curA:null,head:head,jaw:jaw,morphs:morphs,headAnim:headAnim,hb:head?{x:head.rotation.x,z:head.rotation.z}:null,jb:jaw?jaw.rotation.x:0,lt:null};
  return g;
 }
 function rigAnim(c,o){
  const U=c.userData,t=o.t;
  const dt=Math.min(0.1,Math.max(0,t-(U.lt==null?t:U.lt)));
  U.lt=t;
  let want='idle';
  if(o.jump>0.05&&U.acts.jump)want='jump';
  else if(o.walk&&U.acts.walk)want='walk';
  else if(o.speak&&U.acts.talk)want='talk';
  if(!U.acts[want])want='idle';
  if(U.cur!==want){
   const nx=U.acts[want];
   if(nx){
    nx.reset().fadeIn(0.2).play();
    if(U.curA&&U.curA!==nx)U.curA.fadeOut(0.2);
    U.curA=nx;
   }
   U.cur=want;
  }
  U.mixer.update(dt);
  const op=o.open||0;
  if(U.head){
   const dx=o.nod?Math.sin(t*4)*0.08:(o.speak?-0.04+op*0.1:0);
   const dz=o.speak?Math.sin(t*3)*0.05:0;
   if(U.headAnim){U.head.rotation.x+=dx;U.head.rotation.z+=dz}
   else{U.head.rotation.x=U.hb.x+dx;U.head.rotation.z=U.hb.z+dz}
  }
  if(U.jaw)U.jaw.rotation.x=U.jb+op*0.35;
  U.morphs.forEach(function(m){m.m.morphTargetInfluences[m.i]=op});
  U.root.position.y=U.acts.jump?0:(o.jump||0);
  if(!U.acts.walk&&o.walk)U.root.position.y+=Math.abs(Math.sin(t*11))*0.18;
 }
 const prevB=window.toonBuild3D,prevA=window.toonAnim3D;
 window.toonBuild3D=function(ch){
  if(rigOn()&&models.length){
   try{return buildRig(ch)}catch(e){}
  }
  if(prevB)return prevB(ch);
  throw new Error('no builder');
 };
 window.toonAnim3D=function(c,o){
  if(c.userData&&c.userData.rig){rigAnim(c,o);return}
  if(prevA)prevA(c,o);
 };
 const sv=$('rigSave'),cl=$('rigClear'),ro=$('rigOn'),rf=$('rigFlip');
 if(ro){ro.checked=localStorage.getItem('rig_on')!=='0';ro.onchange=function(){localStorage.setItem('rig_on',ro.checked?'1':'0')}}
 if(rf){rf.checked=localStorage.getItem('rig_flip')==='1';rf.onchange=function(){localStorage.setItem('rig_flip',rf.checked?'1':'0')}}
 if(sv)sv.onclick=async function(){
  const files=Array.from(($('rigFiles')||{}).files||[]).slice(0,3);
  if(!files.length){setStatus('Pehle .glb file chuno.');return}
  setStatus('Save ho raha hai...');
  try{
   const bufs=[];
   for(let i=0;i<files.length;i++){
    if(!/\.glb$/i.test(files[i].name)){setStatus('"'+files[i].name+'" .glb nahi hai. Ek hi .glb file chahiye.');return}
    bufs.push(await files[i].arrayBuffer());
   }
   await idbSet('models',bufs);
   await loadModels();
  }catch(e){setStatus('Save nahi hua: '+(e&&e.message||e))}
 };
 if(cl)cl.onclick=async function(){
  try{await idbDel('models')}catch(e){}
  models=[];setStatus('Models hata diye. Ab purane patra chalenge.');
 };
 loadModels();
})();
