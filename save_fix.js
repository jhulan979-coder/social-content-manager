async function fixMp4(blob){
 try{
  if(!blob||blob.size<2000||blob.size>4000000000)return blob;
  const A=async function(a,b){return new Uint8Array(await blob.slice(a,b).arrayBuffer())};
  const TD=function(u,s,e){let o='';for(let i=s;i<e;i++)o+=String.fromCharCode(u[i]);return o};
  const V=function(u){return new DataView(u.buffer,u.byteOffset,u.byteLength)};
  const kids=function(u,s,e){
   const o=[],d=V(u);let p=s;
   while(p+8<=e){
    let size=d.getUint32(p),h=8;const t=TD(u,p+4,p+8);
    if(size===1){size=Number(d.getBigUint64(p+8));h=16}else if(size===0)size=e-p;
    if(size<h||p+size>e)break;
    o.push({t:t,s:p,e:p+size,b:p+h});p+=size;
   }
   return o;
  };
  const u32=function(){const a=arguments,o=new Uint8Array(a.length*4),d=V(o);for(let i=0;i<a.length;i++)d.setUint32(i*4,a[i]>>>0);return o};
  const mk=function(type){
   let len=8;const parts=[];
   for(let i=1;i<arguments.length;i++){if(arguments[i]){parts.push(arguments[i]);len+=arguments[i].length}}
   const o=new Uint8Array(len);V(o).setUint32(0,len);
   for(let i=0;i<4;i++)o[4+i]=type.charCodeAt(i);
   let q=8;parts.forEach(function(p){o.set(p,q);q+=p.length});
   return o;
  };
  const fb=function(type,ver,flags){
   const rest=Array.prototype.slice.call(arguments,3);
   return mk.apply(null,[type,u32(((ver<<24)|flags)>>>0)].concat(rest));
  };
  const cp=function(u,x){return u.slice(x.s,x.e)};
  function putDur(u,x,off32,off64,val){
   const o=cp(u,x),d=V(o),ver=o[x.b-x.s];
   if(ver===1){d.setUint32(x.b-x.s+off64,Math.floor(val/4294967296));d.setUint32(x.b-x.s+off64+4,val>>>0)}
   else d.setUint32(x.b-x.s+off32,val>>>0);
   return o;
  }
  const ts1=function(u,x){return V(u).getUint32(x.b+4+(u[x.b]===1?16:8))};

  let p=0,moov=null;const moofs=[];
  while(p+8<=blob.size){
   const h=V(await A(p,Math.min(p+16,blob.size)));
   let size=h.getUint32(0),hl=8;
   const hu=await A(p+4,p+8),t=TD(hu,0,4);
   if(size===1){size=Number(h.getBigUint64(8));hl=16}else if(size===0)size=blob.size-p;
   if(size<hl)return blob;
   if(t==='moov')moov=await A(p,p+size);
   if(t==='moof')moofs.push({s:p,u:await A(p,p+size)});
   p+=size;
  }
  if(!moov||!moofs.length)return blob;
  const mk0=kids(moov,8,moov.length);
  const mvex=mk0.find(function(x){return x.t==='mvex'});
  if(!mvex)return blob;
  const mvhd=mk0.find(function(x){return x.t==='mvhd'});
  const movTs=ts1(moov,mvhd);
  const info={};
  mk0.filter(function(x){return x.t==='trak'}).forEach(function(tr){
   const k=kids(moov,tr.b,tr.e);
   const tkhd=k.find(function(x){return x.t==='tkhd'});
   const mdia=k.find(function(x){return x.t==='mdia'});
   const mk1=kids(moov,mdia.b,mdia.e);
   const mdhd=mk1.find(function(x){return x.t==='mdhd'});
   const hdlr=mk1.find(function(x){return x.t==='hdlr'});
   const minf=mk1.find(function(x){return x.t==='minf'});
   const mk2=kids(moov,minf.b,minf.e);
   const stbl=mk2.find(function(x){return x.t==='stbl'});
   const stsd=kids(moov,stbl.b,stbl.e).find(function(x){return x.t==='stsd'});
   const hdr=mk2.find(function(x){return x.t!=='dinf'&&x.t!=='stbl'});
   const dinf=mk2.find(function(x){return x.t==='dinf'});
   const id=V(moov).getUint32(tkhd.b+4+(moov[tkhd.b]===1?16:8));
   info[id]={tkhd:tkhd,mdhd:mdhd,hdlr:hdlr,hdr:hdr,dinf:dinf,stsd:stsd,
    kind:TD(moov,hdlr.b+8,hdlr.b+12),ts:ts1(moov,mdhd),
    dur:[],size:[],sync:[],cto:[],chunks:[],first:null,fr:[]};
  });
  const order=[];
  moofs.forEach(function(m){
   const u=m.u,d=V(u);
   kids(u,8,u.length).filter(function(x){return x.t==='traf'}).forEach(function(tf){
    const k=kids(u,tf.b,tf.e);
    const th=k.find(function(x){return x.t==='tfhd'});
    const fl=(u[th.b+1]<<16)|(u[th.b+2]<<8)|u[th.b+3];
    const id=d.getUint32(th.b+4);
    const T=info[id];if(!T)return;
    let q=th.b+8,base=m.s,dd=0,ds=0,df=0;
    if(fl&1){base=Number(d.getBigUint64(q));q+=8}
    if(fl&2)q+=4;
    if(fl&8){dd=d.getUint32(q);q+=4}
    if(fl&16){ds=d.getUint32(q);q+=4}
    if(fl&32){df=d.getUint32(q);q+=4}
    const td=k.find(function(x){return x.t==='tfdt'});
    let tv=null;
    if(td){
     tv=u[td.b]===1?Number(d.getBigUint64(td.b+4)):d.getUint32(td.b+4);
     if(T.first===null)T.first=tv;
    }
    T.fr.push({i:T.dur.length,t:tv});
    let cursor=base;
    k.filter(function(x){return x.t==='trun'}).forEach(function(tr){
     const ver=u[tr.b],f=(u[tr.b+1]<<16)|(u[tr.b+2]<<8)|u[tr.b+3];
     const cnt=d.getUint32(tr.b+4);
     let r=tr.b+8,off=cursor,ff=null;
     if(f&1){off=base+d.getInt32(r);r+=4}
     if(f&4){ff=d.getUint32(r);r+=4}
     let bytes=0;
     for(let i=0;i<cnt;i++){
      let du=dd,sz=ds,fg=df,co=0;
      if(f&0x100){du=d.getUint32(r);r+=4}
      if(f&0x200){sz=d.getUint32(r);r+=4}
      if(f&0x400){fg=d.getUint32(r);r+=4}else if(i===0&&ff!==null)fg=ff;
      if(f&0x800){co=ver===1?d.getInt32(r):d.getUint32(r);r+=4}
      T.dur.push(du);T.size.push(sz);T.sync.push((fg&0x10000)?0:1);T.cto.push(co);
      bytes+=sz;
     }
     T.chunks.push(cnt);
     order.push({id:id,off:off,len:bytes});
     cursor=off+bytes;
    });
   });
  });
  Object.keys(info).forEach(function(id){
   const T=info[id];
   for(let k=0;k+1<T.fr.length;k++){
    const a=T.fr[k],b=T.fr[k+1];
    if(a.t===null||b.t===null||b.i<=a.i)continue;
    let S=0;for(let i=a.i;i<b.i;i++)S+=T.dur[i];
    const diff=(b.t-a.t)-S;
    if(diff!==0&&T.dur[b.i-1]+diff>0)T.dur[b.i-1]+=diff;
   }
  });
  const ids=Object.keys(info);
  let total=0;order.forEach(function(o){total+=o.len});
  if(!total||total>4000000000)return blob;
  const ftyp=mk('ftyp',new Uint8Array([105,115,111,109]),u32(512),new Uint8Array([105,115,111,109,105,115,111,50,97,118,99,49,109,112,52,49]));
  function build(base){
   let pos=base;const offs={};
   ids.forEach(function(id){offs[id]=[]});
   order.forEach(function(o){offs[o.id].push(pos);pos+=o.len});
   let maxDur=0;
   const traks=ids.map(function(id){
    const T=info[id];
    let sum=0;T.dur.forEach(function(x){sum+=x});
    const mdur=Math.round(sum/T.ts*movTs);
    if(mdur>maxDur)maxDur=mdur;
    const n=T.dur.length;
    const sttsE=[];
    for(let i=0;i<n;){let j=i;while(j<n&&T.dur[j]===T.dur[i])j++;sttsE.push(j-i,T.dur[i]);i=j}
    const parts=[cp(moov,T.stsd),fb.apply(null,['stts',0,0,u32(sttsE.length/2),u32.apply(null,sttsE)])];
    if(T.cto.some(function(x){return x!==0})){
     const neg=T.cto.some(function(x){return x<0});
     const ce=[];
     for(let i=0;i<n;){let j=i;while(j<n&&T.cto[j]===T.cto[i])j++;ce.push(j-i,T.cto[i]);i=j}
     parts.push(fb('ctts',neg?1:0,0,u32(ce.length/2),u32.apply(null,ce)));
    }
    if(T.kind==='vide'&&T.sync.some(function(x){return !x})){
     const ss=[];T.sync.forEach(function(x,i){if(x)ss.push(i+1)});
     parts.push(fb('stss',0,0,u32(ss.length),u32.apply(null,ss)));
    }
    const sc=[];let last=-1;
    T.chunks.forEach(function(c,i){if(c!==last){sc.push(i+1,c,1);last=c}});
    parts.push(fb('stsc',0,0,u32(sc.length/3),u32.apply(null,sc)));
    parts.push(fb('stsz',0,0,u32(0,n),u32.apply(null,T.size)));
    parts.push(fb('stco',0,0,u32(offs[id].length),u32.apply(null,offs[id])));
    const stbl=mk.apply(null,['stbl'].concat(parts));
    const minf=mk('minf',cp(moov,T.hdr),cp(moov,T.dinf),stbl);
    const mdhd=putDur(moov,T.mdhd,16,24,sum);
    const mdia=mk('mdia',mdhd,cp(moov,T.hdlr),minf);
    const tk=putDur(moov,T.tkhd,20,28,mdur);
    let edts=null;
    if(T.first>0){
     const gap=Math.round(T.first/T.ts*movTs);
     edts=mk('edts',fb('elst',0,0,u32(2),u32(gap,0xFFFFFFFF,0x10000),u32(mdur,0,0x10000)));
    }
    return mk('trak',tk,edts,mdia);
   });
   const mv=putDur(moov,mvhd,16,24,maxDur);
   return mk.apply(null,['moov',mv].concat(traks));
  }
  const m1=build(0);
  const base=ftyp.length+m1.length+8;
  const m2=build(base);
  const mh=new Uint8Array(8);V(mh).setUint32(0,total+8);
  mh.set([109,100,97,116],4);
  const parts=[ftyp,m2,mh];
  order.forEach(function(o){parts.push(blob.slice(o.off,o.off+o.len))});
  return new Blob(parts,{type:'video/mp4'});
 }catch(e){return blob}
                         }
(function(){
 const CH=786432;
 const $=function(id){return document.getElementById(id)};
 let tb=null;
 function toast(t){
  if(!tb){
   tb=document.createElement('div');
   tb.style.cssText='position:fixed;left:10px;right:10px;bottom:84px;z-index:99990;background:#111;color:#fff;border:1px solid #6d28d9;border-radius:12px;padding:10px;text-align:center;font:14px sans-serif;display:none';
   document.body.appendChild(tb);
  }
  if(!t){tb.style.display='none';return}
  tb.textContent=t;tb.style.display='block';
 }
 function b64(part){
  return new Promise(function(res,rej){
   const r=new FileReader();
   r.onload=function(){res(String(r.result).split(',')[1])};
   r.onerror=function(){rej(new Error('file padh nahi payi'))};
   r.readAsDataURL(part);
  });
 }
 async function writeChunked(blob,name,cap,label){
  let off=0,uri='';
  while(off<blob.size){
   const data=await b64(blob.slice(off,off+CH));
   if(off===0){
    const w=await cap.Filesystem.writeFile({path:name,data:data,directory:'CACHE'});
    uri=w.uri;
   }else{
    await cap.Filesystem.appendFile({path:name,data:data,directory:'CACHE'});
   }
   off+=CH;
   toast(label+' '+Math.min(100,Math.round(off/blob.size*100))+'%');
  }
  return uri;
 }
 function plugins(){return window.Capacitor&&window.Capacitor.Plugins}
 window.saveVideoGallery=async function(){
  if(typeof vidBlob==='undefined'||!vidBlob){alert('Pehle video banao.');return}
  const cap=plugins();
  if(!cap||!cap.Filesystem||!cap.VideoSaver){alert('Ye sirf app ke andar chalta hai. Share / Send use karo.');return}
  const blob=vidBlob,ext=vidExt;
  const name='creator-video-'+Date.now()+'.'+ext;
  try{
   const fixed=ext==='mp4'?await fixMp4(blob):blob;
   const uri=await writeChunked(fixed,name,cap,'Save ho rahi hai...');
   await cap.VideoSaver.save({path:uri,name:name,mime:ext==='mp4'?'video/mp4':'video/webm'});
   try{await cap.Filesystem.deleteFile({path:name,directory:'CACHE'})}catch(e){}
   toast('');
   alert('Video gallery me save ho gayi (Movies / CreatorStudio).');
  }catch(e){
   toast('');
   alert('Save nahi hua: '+(e&&e.message||e));
  }
 };
 window.shareVideo=async function(){
  if(typeof vidBlob==='undefined'||!vidBlob){alert('Pehle video banao.');return}
  const cap=plugins();
  const blob=vidBlob,ext=vidExt;
  const name='creator-video-'+Date.now()+'.'+ext;
  try{
   if(cap&&cap.Filesystem&&cap.Share){
    const fixed=ext==='mp4'?await fixMp4(blob):blob;
    const uri=await writeChunked(fixed,name,cap,'Taiyar ho rahi hai...');
    toast('');
    await cap.Share.share({title:'Creator Studio video',files:[uri]});
   }else{
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;a.click();
    setTimeout(function(){URL.revokeObjectURL(url)},5000);
   }
  }catch(e){
   toast('');
   const m=String(e&&e.message||e);
   if(!/cancel/i.test(m))alert('Share nahi hua: '+m);
  }
 };
 function idb(){
  return new Promise(function(res,rej){
   const r=indexedDB.open('csm_rec',1);
   r.onupgradeneeded=function(){r.result.createObjectStore('v')};
   r.onsuccess=function(){res(r.result)};
   r.onerror=function(){rej(r.error)};
  });
 }
 async function putLast(b,e){
  try{
   const d=await idb();
   await new Promise(function(res,rej){
    const tx=d.transaction('v','readwrite');
    tx.objectStore('v').put({b:b,e:e,t:Date.now()},'last');
    tx.oncomplete=res;tx.onerror=function(){rej(tx.error)};
   });
   showBtn();
  }catch(x){}
 }
 async function getLast(){
  try{
   const d=await idb();
   return await new Promise(function(res,rej){
    const q=d.transaction('v','readonly').objectStore('v').get('last');
    q.onsuccess=function(){res(q.result)};q.onerror=function(){rej(q.error)};
   });
  }catch(x){return null}
 }
 async function delLast(){
  try{
   const d=await idb();
   await new Promise(function(res,rej){
    const tx=d.transaction('v','readwrite');
    tx.objectStore('v').delete('last');
    tx.oncomplete=res;tx.onerror=function(){rej(tx.error)};
   });
  }catch(x){}
 }
 let btn=null;
 async function showBtn(){
  const r=await getLast();
  if(!r)return;
  if(!btn){
   btn=document.createElement('button');
   btn.style.cssText='position:fixed;right:10px;bottom:84px;z-index:9990;border:0;border-radius:24px;padding:11px 14px;background:#7c3aed;color:#fff;font:700 14px sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.5)';
   btn.onclick=openRec;
   document.body.appendChild(btn);
  }
  btn.textContent='🔁 Pichli video ('+Math.round(r.b.size/1048576)+' MB)';
  btn.style.display='block';
 }
 async function openRec(){
  const r=await getLast();
  if(!r){if(btn)btn.style.display='none';return}
  seen=r.b;vidBlob=r.b;vidExt=r.e;
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:99995;background:rgba(0,0,0,.92);overflow:auto;padding:14px;color:#fff;font:15px sans-serif';
  const v=document.createElement('video');
  v.controls=true;v.playsInline=true;v.style.cssText='width:100%;max-height:60vh;border-radius:12px;background:#000';
  const url=URL.createObjectURL(r.b);
  v.src=url;
  ov.appendChild(v);
  function mkB(t,fn,pri){
   const b=document.createElement('button');
   b.textContent=t;
   b.style.cssText='display:block;width:100%;margin:8px 0;padding:13px;border:0;border-radius:11px;font:700 15px sans-serif;color:#fff;background:'+(pri?'#9333ea':'#2b1d44');
   b.onclick=fn;ov.appendChild(b);
  }
  mkB('Gallery me save karo',function(){window.saveVideoGallery()},true);
  mkB('Share / Send',function(){window.shareVideo()});
  mkB('Ye video hata do',async function(){await delLast();if(btn)btn.style.display='none';URL.revokeObjectURL(url);ov.remove()});
  mkB('Band karo',function(){URL.revokeObjectURL(url);ov.remove()});
  document.body.appendChild(ov);
 }
 let seen=null;
 setInterval(function(){
  try{
   if(typeof vidBlob!=='undefined'&&vidBlob&&vidBlob!==seen){
    seen=vidBlob;
    putLast(vidBlob,vidExt);
   }
  }catch(e){}
 },2500);
 showBtn();
})();
