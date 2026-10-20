(function(){
 if(typeof THREE==='undefined')return;
 const V3=THREE.Vector3;
 const PAT=['medium','close','wide','ots','close','low','medium','reaction'];
 const tgtCol=new THREE.Color();
 let lastKey='';
 window.toonCamPro=function(tp,tl,o){
  const cam=o.cam,t=o.t,lt=o.lt,i=o.i,si=o.si,cg=o.cg;
  const spk=cg[si]?cg[si].position:new V3(0,0,0);
  let lis=null,ld=1e9;
  for(let k=0;k<cg.length;k++){
   if(k===si)continue;
   const d=Math.abs(cg[k].position.x-spk.x);
   if(d<ld){ld=d;lis=cg[k].position}
  }
  const segLen=2.4;
  const seg=Math.floor(lt/segLen);
  const strong=(['angry','surprised','laugh','scared','sad'].indexOf(o.emo)>=0);
  let type;
  if(o.shot==='wide'&&seg===0&&lt<1.6)type='wide';
  else{
   type=PAT[(i*3+seg)%PAT.length];
   if(strong&&seg===0)type=(o.emo==='sad')?'high':((o.emo==='angry'||o.emo==='laugh')?'low':'close');
  }
  if(type==='reaction'&&!lis)type='medium';
  if(type==='ots'&&!lis)type='close';
  const key=i+'_'+seg;
  const cut=(key!==lastKey);
  lastKey=key;
  const v=o.vertical,D=o.fitD;
  const push=1-0.07*Math.min(1,(lt-seg*segLen)/segLen);
  const sx=spk.x,sz=spk.z;
  let px,py,pz,lx,ly,lz;
  if(type==='wide'){
   px=sx*0.1+Math.sin(t*0.3)*3.5;py=5.2;pz=D*0.95*push+0.5;lx=sx*0.1;ly=3.4;lz=0;
  }else if(type==='medium'){
   px=sx*0.85+(i%2?1:-1)*1.8;py=4.4;pz=D*0.58*push;lx=sx;ly=3.9;lz=0;
  }else if(type==='close'){
   px=sx+(seg%2?1:-1)*1.2;py=4.7;pz=Math.max(v?7.5:5.5,D*0.36)*push;lx=sx;ly=4.6;lz=sz;
  }else if(type==='low'){
   px=sx+(i%2?1:-1)*1.5;py=1.4;pz=D*0.42*push;lx=sx;ly=4.2;lz=sz;
  }else if(type==='high'){
   px=sx+1.0;py=9.0;pz=D*0.5*push;lx=sx;ly=2.9;lz=sz;
  }else if(type==='ots'){
   const dir=(sx>=lis.x)?1:-1;
   px=lis.x-dir*2.6;py=5.4;pz=D*0.5*push;lx=sx;ly=4.2;lz=sz;
  }else{
   px=lis.x+(i%2?1:-1)*1.0;py=4.7;pz=Math.max(v?7.5:5.5,D*0.36)*push;lx=lis.x;ly=4.6;lz=lis.z;
  }
  const hx=Math.sin(t*1.7)*0.07+Math.sin(t*2.9+1)*0.04,hy=Math.sin(t*2.3+2)*0.05;
  tp.set(px+hx,py+hy,pz);
  tl.set(lx+hx*0.5,ly+hy*0.5,lz);
  let tilt=0;
  if(o.emo==='scared'||(o.emo==='angry'&&type==='low'))tilt=0.1;
  const ct=cam.userData.tilt||0;
  cam.userData.tilt=ct+(tilt-ct)*0.15;
  cam.up.set(Math.sin(cam.userData.tilt),Math.cos(cam.userData.tilt),0);
  let fov=40;
  if(o.emo==='surprised'&&lt<0.7)fov=40+22*Math.sin(lt/0.7*3.14159);
  if(Math.abs(cam.fov-fov)>0.05){cam.fov=fov;cam.updateProjectionMatrix()}
  if(o.dl){
   const tc=o.emo==='angry'?0xff8a7a:(o.emo==='sad'?0x9ab8ff:(o.emo==='scared'?0xb7a6ff:((o.emo==='laugh'||o.emo==='happy')?0xfff0c8:0xffffff)));
   tgtCol.setHex(tc);o.dl.color.lerp(tgtCol,0.08);
   const ti=(o.emo==='sad'||o.emo==='scared')?0.6:0.95;
   o.dl.intensity+=(ti-o.dl.intensity)*0.08;
  }
  if(cut&&o.snap)o.snap(tp,tl);
 };
})();
