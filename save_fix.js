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
   const uri=await writeChunked(blob,name,cap,'Save ho rahi hai...');
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
    const uri=await writeChunked(blob,name,cap,'Taiyar ho rahi hai...');
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
