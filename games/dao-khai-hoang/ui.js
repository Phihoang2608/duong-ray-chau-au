/* ===================== GIAO DIỆN ĐẢO KHAI HOANG ===================== */
const KHUI=(()=>{
  const PC=['#e11d48','#2563eb','#16a34a','#f8fafc'];
  const A=KHART, R=A.R;
  let prevRob=-1, f1=v=>Math.round(v*10)/10, lastVp={}, lastArgs=null, root=null, prevAw={}, pop=null, mode=null, robH=null, lastEv=null, tg=0, tw=3, og=0, oq=1, ow=3, on=1, ot=-1, dsel=null, DP=[], boardSig='', sayTxt='', sayUntil=0, sayTm=null, hotH='', dsc=[0,0,0,0,0];
  const KH_TIP={knight:'Hiệp sĩ: dời kẻ cướp sang ô khác và lấy trộm 1 lá của người có nhà ở ô đó. Ai dùng từ 3 hiệp sĩ trở lên và nhiều nhất sẽ nhận Quân đội mạnh nhất (+2 điểm).',vp:'Điểm thưởng: mỗi thẻ được +1 điểm ẩn, không cần dùng. Đủ điểm là thắng.',road:'Làm đường: xây ngay 2 đường miễn phí.',plenty:'Được mùa: lấy 2 tài nguyên bất kỳ từ ngân hàng.',mono:'Độc quyền: chọn 1 loại tài nguyên, mọi người phải đưa bạn toàn bộ số lá loại đó.'};
  const TIP_LR=mx=>`Đường dài nhất (+2 điểm): có chuỗi đường liền nhau dài từ 5 đoạn trở lên và dài hơn mọi người. Hiện cao nhất: ${mx}. Ai vượt qua sẽ lấy giải.`, TIP_LA=mk=>`Quân đội mạnh nhất (+2 điểm): đã dùng từ 3 hiệp sĩ trở lên và nhiều hơn mọi người. Hiện cao nhất: ${mk}. Ai vượt qua sẽ lấy giải.`;
  function zoomInit(){ const frame=root.querySelector('.frame'), svgs=[root.querySelector('#khs'),root.querySelector('#khd')], base=svgs[0]; if(!frame||!base) return;
    const Z={s:1,x:VB.minX,y:VB.minY,moved:false}, ptrs=new Map(); let pinch=null;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const apply=()=>{ const w=VB.w/Z.s, h=VB.h/Z.s; Z.x=w>=VB.w?VB.minX+(VB.w-w)/2:clamp(Z.x,VB.minX,VB.minX+VB.w-w); Z.y=h>=VB.h?VB.minY+(VB.h-h)/2:clamp(Z.y,VB.minY,VB.minY+VB.h-h); const v=Z.x+' '+Z.y+' '+w+' '+h; svgs.forEach(e=>e.setAttribute('viewBox',v)); frame.classList.toggle('zoomed',Z.s>1.02); frame.classList.toggle('zout',Z.s<.98); const rb=root.querySelector('[data-z=reset]'); if(rb){ rb.textContent=Math.round(Z.s*100)+'%'; rb.classList.toggle('on',Math.abs(Z.s-1)>.02); } };
    const toSvg=(cx,cy)=>{ const m=base.getScreenCTM(); if(!m) return {x:Z.x,y:Z.y}; const q=new DOMPoint(cx,cy).matrixTransform(m.inverse()); return {x:q.x,y:q.y}; };
    const zoomAt=(ns,cx,cy)=>{ ns=clamp(ns,.65,4.5); if(Math.abs(ns-1)<.04) ns=1; const p=toSvg(cx,cy), r=Z.s/ns; Z.x=p.x-(p.x-Z.x)*r; Z.y=p.y-(p.y-Z.y)*r; Z.s=ns; apply(); };
    const center=()=>{ const r=frame.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; };
    root.querySelector('.kzm').addEventListener('click',e=>{ const b=e.target.closest('[data-z]'); if(!b) return; e.stopPropagation(); const k=b.dataset.z; if(k==='reset'){ Z.s=1; Z.x=VB.minX; Z.y=VB.minY; apply(); } else { const c=center(); zoomAt(Z.s*(k==='in'?1.5:1/1.5),c[0],c[1]); } });
    frame.addEventListener('pointerdown',e=>{ if(e.isPrimary) ptrs.clear(); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); Z.moved=false; if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,s:Z.s}; Z.moved=true; } });
    frame.addEventListener('pointermove',e=>{ const o=ptrs.get(e.pointerId); if(!o) return;
      if(ptrs.size===2&&pinch){ ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); const [a,b]=[...ptrs.values()], d=Math.hypot(a.x-b.x,a.y-b.y)||1; zoomAt(pinch.s*d/pinch.d,(a.x+b.x)/2,(a.y+b.y)/2); Z.moved=true; return; }
      const dx=e.clientX-o.x, dy=e.clientY-o.y; if(Z.s>1.02&&e.pointerType!=='mouse'||Z.s>1.02&&e.buttons===1){ if(Math.abs(dx)+Math.abs(dy)>0){ const m=base.getScreenCTM(); if(m){ Z.x-=dx/m.a; Z.y-=dy/m.d; apply(); } if(Math.hypot(dx,dy)>0) Z.mv=(Z.mv||0)+Math.hypot(dx,dy); if(Z.mv>14) Z.moved=true; } ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); } });
    const up=e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2) pinch=null; if(!ptrs.size) Z.mv=0; };
    window.addEventListener('pointerup',up,true); window.addEventListener('pointercancel',up,true); frame.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse') up(e); });
    frame.addEventListener('click',e=>{ if(Z.moved){ e.stopPropagation(); e.preventDefault(); Z.moved=false; } },true);
    frame.addEventListener('wheel',e=>{ if(!(e.ctrlKey||e.metaKey||Z.s>1)&&!e.shiftKey) return; e.preventDefault(); zoomAt(Z.s*(e.deltaY<0?1.15:1/1.15),e.clientX,e.clientY); },{passive:false}); }
  function tipInit(){ if(document.getElementById('khtip')) return; const tip=document.createElement('div'); tip.id='khtip'; document.body.appendChild(tip);
    const show=el=>{ tip.textContent=el.dataset.tip; tip.style.display='block'; const r=el.getBoundingClientRect(), tw=tip.offsetWidth, th=tip.offsetHeight; let x=r.left+r.width/2-tw/2; x=Math.max(6,Math.min(innerWidth-tw-6,x)); let y=r.top-th-10; if(y<6) y=r.bottom+10; tip.style.left=x+'px'; tip.style.top=y+'px'; };
    const hide=()=>{ tip.style.display='none'; };
    document.addEventListener('pointerover',e=>{ if(e.pointerType==='mouse'){ const el=e.target.closest&&e.target.closest('[data-tip]'); if(el) show(el); } });
    document.addEventListener('pointerout',e=>{ if(e.pointerType==='mouse'&&e.target.closest&&e.target.closest('[data-tip]')) hide(); });
    document.addEventListener('pointerdown',e=>{ const el=e.target.closest&&e.target.closest('[data-tip]'); if(el) show(el); else hide(); });
    ['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,e=>{ if(e.pointerType!=='mouse') hide(); }));
    document.addEventListener('scroll',hide,true); window.addEventListener('blur',hide);
    document.addEventListener('click',e=>{ if(pop&&!(e.target.closest&&e.target.closest('.pop,#ktrd,[data-k],[data-a="res"],[data-a="pop"],[data-a="offerto"]'))){ pop=null; if(lastArgs) render(...lastArgs); } },true); }
  if(!window.__kbnTap){ window.__kbnTap=1; document.addEventListener('pointerdown',()=>{ document.querySelectorAll('.kbn,.kcong').forEach(e=>e.remove()); },true); }
  function banner(h,cls,ms){ document.querySelectorAll('.kbn').forEach(e=>e.remove()); const b=document.createElement('div'); b.className='kbn '+cls; b.innerHTML=h; document.body.appendChild(b); setTimeout(()=>b.remove(),ms||1300); }
  function say(m){ sayTxt=m; sayUntil=Date.now()+5200; setTimeout(()=>{ if(lastArgs) render(...lastArgs); },0); clearTimeout(sayTm); sayTm=setTimeout(()=>{ if(lastArgs) render(...lastArgs); },5300); }
  const $=s=>document.querySelector(s);
  const VB={minX:-372,minY:-348,w:744,h:696};
  const X=v=>v*R;
  function dynSVG(S,ME,ev){ const H=KH.HEX, V=KH.V, E=KH.E, my=S.turn===ME&&S.phase!=='over'; let s='', robG='';
    if (ev&&ev.k==='roll'){ const sum=ev.d[0]+ev.d[1]; S.hex.forEach((h,i)=>{ if(h.num===sum) s+=`<polygon points="${A.hexPts(X(H[i].x),X(H[i].y),R-3)}" class="hot ${i===S.robber?'blocked':''}"/>`; }); }
    if (my && S.step==='robber' && robH==null) S.hex.forEach((h,i)=>{ if(i!==S.robber) s+=`<polygon points="${A.hexPts(X(H[i].x),X(H[i].y),R-4)}" class="pickh" data-h="${i}"/>`; });
    if (robH!=null) s+=`<polygon points="${A.hexPts(X(H[robH].x),X(H[robH].y),R-4)}" class="pickh on"/>`;
    { const pos=h=>[X(H[h].x)+(S.hex[h].num?R*.34:0),X(H[h].y)+R*.14], np=pos(S.robber), mv=ev&&(ev.k==='robber'||ev.k==='steal')&&prevRob>=0&&prevRob!==S.robber, op=mv?pos(prevRob):np;
      s+=`<polygon points="${A.hexPts(X(H[S.robber].x),X(H[S.robber].y),R-2)}" class="rdim ${mv?'fresh':''}" pointer-events="none"/>`;
      robG=`<g class="${mv?'rjump':''}" pointer-events="none" ${mv?`style="--dx:${f1(op[0]-np[0])}px;--dy:${f1(op[1]-np[1])}px"`:''}>${A.robber(np[0],np[1])}</g>`; prevRob=S.robber; }
    E.forEach((e,i)=>{ const o=S.eo[i]; if(o<0) return; const a=V[e.a], b=V[e.b]; s+=`<g class="${ev&&ev.k==='road'&&ev.e===i?'newp':''}">${A.road(X(a.x),X(a.y),X(b.x),X(b.y),PC[o])}</g>`; });
    if (my){ const wantRoad=(S.phase==='setup'&&S.step==='road')||(S.phase==='play'&&S.step==='main'&&(mode==='road'||S.free>0));
      if (wantRoad) E.forEach((e,i)=>{ if(KH.roadOK(S,ME,i)){ const a=V[e.a], b=V[e.b]; s+=`<line x1="${X(a.x)}" y1="${X(a.y)}" x2="${X(b.x)}" y2="${X(b.y)}" class="spot" data-e="${i}" style="--pc:${PC[ME]}"/><line x1="${f1(X(a.x*.8+b.x*.2))}" y1="${f1(X(a.y*.8+b.y*.2))}" x2="${f1(X(a.x*.2+b.x*.8))}" y2="${f1(X(a.y*.2+b.y*.8))}" class="ehit" data-e="${i}"/>`; } }); }
    V.forEach((v,i)=>{ const o=S.vo[i]; if(!o) return; const fresh=ev&&(ev.k==='town'||ev.k==='city')&&ev.v===i; const canUp=my&&mode==='city'&&o.p===ME&&!o.city;
      s+=`<g class="${fresh?'newp':''}" ${canUp?`data-c="${i}" style="cursor:pointer"`:''}>${A.house(X(v.x),X(v.y),PC[o.p],o.city)}${canUp?`<circle cx="${X(v.x)}" cy="${X(v.y)}" r="18" class="vspot ring"/><circle cx="${X(v.x)}" cy="${X(v.y)}" r="26" class="vhit"/>`:''}</g>`;
      if (fresh) s+=[0,1,2,3,4,5].map(k=>`<circle class="dust" style="--dx:${Math.cos(k)*22}px;--dy:${Math.sin(k)*10}px" cx="${X(v.x)}" cy="${X(v.y)+8}" r="4"/>`).join(''); });
    s+=robG;
    if (my&&S.phase==='play'&&S.step==='main'&&!S.offer&&ME>=0){ const Pm=S.P[ME];
      KH.PORT_E.forEach((e,i)=>{ const E0=E[e]; if(![E0.a,E0.b].some(v=>S.vo[v]&&S.vo[v].p===ME)) return; const t=S.ports[i]; const ok=t>=0?Pm.res[t]>=2:Pm.res.some(x=>x>=3); if(!ok) return;
        const a=V[E0.a], b=V[E0.b], mx=(a.x+b.x)/2, my2=(a.y+b.y)/2, L=Math.hypot(mx,my2), px=(mx+mx/L*1.32)*R, py=(my2+my2/L*1.32)*R, ang=Math.atan2(my2,mx), cx=px+Math.cos(ang)*55, cy=py+Math.sin(ang)*55;
        s+=`<g class="pglow" data-port="${i}" style="cursor:pointer"><circle cx="${f1(cx)}" cy="${f1(cy)}" r="31" class="pgr"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="34" class="pgh"/><g transform="translate(${f1(cx)},${f1(cy+36)})"><rect x="-22" y="-10" width="44" height="20" rx="10" class="pgb"/><text y="5.5" class="pgt">Đổi</text></g></g>`; }); }
    if (my){ const wantTown=(S.phase==='setup'&&S.step==='town')||(S.phase==='play'&&S.step==='main'&&mode==='town');
      if (wantTown) V.forEach((v,i)=>{ if(KH.townOK(S,ME,i)) s+=`<g data-v="${i}" style="cursor:pointer"><circle cx="${X(v.x)}" cy="${X(v.y)}" r="24" class="vhit"/><circle cx="${X(v.x)}" cy="${X(v.y)}" r="9" class="vspot" style="--pc:${PC[ME]}"/></g>`; }); }
    return s; }
  function popNum(rc,res,txt,neg,delay){ if(!rc) return; const b=document.createElement('div'); b.className='kbadge'+(neg?' neg':''); b.innerHTML='<img src="assets/ic-'+res+'.webp?v=2026112823y" alt=""><b>'+txt+'</b>'; Object.assign(b.style,{left:(rc.left+rc.width*.62)+'px',top:(rc.top+rc.height*.45)+'px',animationDelay:(delay||0)+'ms'}); document.body.appendChild(b); setTimeout(()=>b.remove(),2200+(delay||0)); }
  function prodFX(S,sum){ const svg=root.querySelector('#khd'), m=svg&&svg.getScreenCTM(); if(!m) return; const rpx=R*m.a, RC=['#3f9a3f','#e0642b','#a6d84a','#f5c518','#9fb2c6'], ctr=(x,y)=>{ const p=svgPt(x,y); return p?{x:p.left+10,y:p.top+10}:null; }, add=(el,ms)=>{ document.body.appendChild(el); setTimeout(()=>el.remove(),ms); };
    let k=0; S.hex.forEach((hx,hi)=>{ if(hx.num!==sum||hi===S.robber||hx.res>=5) return; const H=KH.HEX[hi], c=ctr(X(H.x),X(H.y)); if(!c) return; const col=RC[hx.res], d=rpx*1.9;
      const g=document.createElement('div'); g.className='kwglow'; Object.assign(g.style,{left:c.x-d/2+'px',top:c.y-d/2+'px',width:d+'px',height:d+'px'}); g.style.setProperty('--wc',col); add(g,3100);
      [0,1,2].forEach(i=>{ const w=document.createElement('div'); w.className='kwave'; Object.assign(w.style,{left:c.x-d/2+'px',top:c.y-d/2+'px',width:d+'px',height:d+'px',animationDelay:(i*.85)+'s'}); w.style.setProperty('--wc',col); add(w,3300); });
      H.v.forEach(v=>{ const o=S.vo[v]; if(!o) return; const n=o.city?2:1, hp=ctr(X(KH.V[v].x),X(KH.V[v].y)-8); if(!hp) return; const pr=rectOf(`.pl[data-p="${o.p}"] .pk`)||rectOf(`.pl[data-p="${o.p}"]`);
        for(let j=0;j<n;j++){ const im=document.createElement('img'); im.src='assets/ic-'+hx.res+'.webp?v=2026112823y'; im.className='kjump'; const w=Math.max(26,rpx*.55); Object.assign(im.style,{left:c.x-w/2+'px',top:c.y-w/2+'px',width:w+'px',height:w+'px'}); document.body.appendChild(im);
          const tx=pr?pr.left+pr.width/2:hp.x, ty=pr?pr.top+pr.height/2:hp.y, dx=tx-c.x, dy=ty-c.y, dly=3000+(k+j)*140, an=im.animate([{transform:'translate(0,0) scale(.4)',opacity:0},{transform:`translate(${dx*.35}px,${dy*.35-rpx*.9}px) scale(1.3)`,opacity:1,offset:.35},{transform:`translate(${dx}px,${dy}px) scale(.55)`,opacity:1,offset:.92},{transform:`translate(${dx}px,${dy}px) scale(.2)`,opacity:0}],{duration:1150,delay:dly,easing:'cubic-bezier(.35,.1,.3,1)',fill:'both'}); an.onfinish=()=>im.remove(); setTimeout(()=>{ const t=root.querySelector(`.pl[data-p="${o.p}"] .pk`); if(t){ t.classList.remove('kpul'); void t.getBoundingClientRect(); t.classList.add('kpul'); setTimeout(()=>t.classList.remove('kpul'),600); } if(j===n-1) popNum(pr,hx.res,'+'+n,false,0); },dly+1000); }
        const b=document.createElement('div'); b.className='kbadge'; b.innerHTML='<img src="assets/ic-'+hx.res+'.webp?v=2026112823y" alt=""><b>+'+n+'</b>'; Object.assign(b.style,{left:hp.x+'px',top:hp.y+'px'}); setTimeout(()=>add(b,1700),3800+k*140);
        k++; }); }); }
  let hideMed=null;
  function congrats(S,ev,ME){ const k=ev.a==='road'?'road':'army', c=ev.a==='road'?'lr':'la', nm=S.seats[ev.seat].name.replace(/[<>&]/g,''), me=ev.seat===ME;
    try{ SFX.fanfare(); }catch(e){}
    const el=document.createElement('div'); el.className='kcong'; el.style.setProperty('--pc',PC[ev.seat]);
    const cols=['#fde047','#f87171','#60a5fa','#4ade80','#fb923c','#f0abfc']; let cf=''; for(let q=0;q<26;q++) cf+=`<i style="left:${Math.random()*100}%;background:${cols[q%6]};animation-delay:${(Math.random()*.5).toFixed(2)}s;animation-duration:${(1.3+Math.random()*.8).toFixed(2)}s;--r:${Math.round(Math.random()*720-360)}deg"></i>`;
    el.innerHTML=`<div class="kcf">${cf}</div><div class="kcb"><div class="kct">Chúc mừng${me?' bạn':''}!</div><div class="kcm">${A.medal(k)}</div><div class="kcn">${me?'Bạn':nm}</div><div class="kcx">giành <b>${ev.a==='road'?'Đường dài nhất':'Quân đội mạnh nhất'}</b></div><div class="kcp">+2 điểm</div></div>`;
    document.body.appendChild(el); setTimeout(()=>el.remove(),2000);
    hideMed={seat:ev.seat,c,until:Date.now()+2800};
    const hide=()=>{ const m=root&&root.querySelector(`.pl[data-p="${ev.seat}"] .medal.${c}`); if(m) m.style.visibility='hidden'; }; hide();
    setTimeout(()=>{ const from=el.querySelector('.kcm img')&&el.querySelector('.kcm').getBoundingClientRect(), to=rectOf(`.pl[data-p="${ev.seat}"] .medal.${c}`); if(from&&to) fly(from,to,A.medal(k),96,96,0); },1450);
    setTimeout(()=>{ const m=root&&root.querySelector(`.pl[data-p="${ev.seat}"] .medal.${c}`); if(m){ m.style.visibility=''; m.classList.add('land'); } const t=root&&root.querySelector(`.pl[data-p="${ev.seat}"] .vtk`); if(t){ t.classList.remove('kpul'); void t.getBoundingClientRect(); t.classList.add('kpul'); setTimeout(()=>t.classList.remove('kpul'),700); } hideMed=null; },2700); }
  function buildTag(S,ev){ let p; if(ev.k==='road'){ const e=KH.E[ev.e], a=KH.V[e.a], b=KH.V[e.b]; p=svgPt(X((a.x+b.x)/2),X((a.y+b.y)/2)); } else { const v=KH.V[ev.v]; p=v&&svgPt(X(v.x),X(v.y)-16); } if(!p) return;
    const el=document.createElement('div'); el.className='kbuild'; el.style.setProperty('--pc',PC[ev.seat]); const nm=S.seats[ev.seat].name; el.innerHTML='<b>'+nm.replace(/[<>&]/g,'')+'</b> '+(ev.k==='road'?'đã xây đường':ev.k==='city'?'đã lên thành phố':'đã xây nhà');
    Object.assign(el.style,{left:(p.left+10)+'px',top:(p.top-14)+'px'}); document.body.appendChild(el); setTimeout(()=>el.remove(),1400); }
  function svgPt(x,y){ const svg=root.querySelector('#khd'); if(!svg) return null; const m=svg.getScreenCTM(); if(!m) return null; return {left:m.a*x+m.c*y+m.e-10,top:m.b*x+m.d*y+m.f-10,width:20,height:20}; }
  function rectOf(sel){ const e=root&&root.querySelector(sel); return e?e.getBoundingClientRect():null; }
  function fly(from,to,html,w,h,delay){ if(!from||!to) return; const el=document.createElement('div'); el.className='khfly'; el.innerHTML=html;
    const x0=from.left+from.width/2-w/2, y0=from.top+from.height/2-h/2, x1=to.left+to.width/2-w/2, y1=to.top+to.height/2-h/2;
    Object.assign(el.style,{left:x0+'px',top:y0+'px',width:w+'px',height:h+'px'}); document.body.appendChild(el);
    el.animate([{transform:'translate(0,0) scale(.3) rotate(-20deg)',opacity:0},{transform:'translate(0,-30px) scale(1.15) rotate(0)',opacity:1,offset:.25},{transform:`translate(${x1-x0}px,${y1-y0}px) scale(.55) rotate(10deg)`,opacity:.3}],{duration:1100,delay:delay||0,easing:'cubic-bezier(.4,.1,.3,1)',fill:'both'}).onfinish=()=>el.remove(); }
  let root0chat=null, root0=null;
  function resRow(c){ return c.map((x,r)=>x?`<span class="cr">${[...Array(x)].map(()=>`<svg viewBox="-9 -8 18 16" width="22" height="20">${A.resMini(r,0,0,.8)}</svg>`).join('')}</span>`:'').join(''); }
  function offerBox(S,ME,api){ hotH=''; const o=S.offer; if(!o) return ''; const nm=api.esc(S.seats[o.from].name);
    if (ME===o.from) return `<div class="box ofr"><div class="cth">Yêu cầu của bạn</div><div class="orow"><small>Bạn đưa</small>${resRow(o.give)}</div><div class="orow"><small>Bạn nhận</small>${resRow(o.get)}</div><div class="chint">${o.to>=0?'Chờ '+api.esc(S.seats[o.to].name)+' trả lời…':'Chờ mọi người trả lời…'}</div><button class="tbtn wide" data-a="cancel">Huỷ yêu cầu</button></div>`;
    const mine=ME>=0&&(o.to<0||o.to===ME)&&!o.no.includes(ME);
    if (!mine) return `<div class="box ofr"><div class="cth">${nm} đang yêu cầu đổi</div><div class="orow"><small>Đưa</small>${resRow(o.give)}</div><div class="orow"><small>Lấy</small>${resRow(o.get)}</div></div>`;
    const P=S.P[ME], can=o.get.every((x,i)=>P.res[i]>=x);
    hotH=`<div class="box ofr hot"><div class="cth">${nm} muốn đổi với bạn</div><div class="orow"><small>Bạn nhận</small>${resRow(o.give)}</div><div class="orow"><small>Bạn đưa</small>${resRow(o.get)}</div>${can?'':'<div class="chint">Bạn không đủ lá để đổi</div>'}<div class="obt"><button class="tbtn pri" data-a="yes" ${can?'':'disabled'}>Đồng ý</button><button class="tbtn" data-a="no">Từ chối</button></div></div>`; return ''; }

  /* Tự co bố cục ngang cho vừa trọn màn hình: thiết kế ở chiều cao ảo 380px rồi phóng/thu theo màn hình thật */
  function fit(){ if(!root) return; const el=root;
    const land=matchMedia('(orientation:landscape) and (max-height:640px)').matches;
    if(!land){ el.style.cssText=''; return; }
    const hdr=document.querySelector('.tb-top'); const hh=(hdr&&getComputedStyle(hdr).display!=='none')?hdr.offsetHeight:0;
    const vv=window.visualViewport, vh=Math.max(200,(vv?vv.height:innerHeight)-hh), vw=vv?vv.width:innerWidth;
    let s=Math.min(1.4,vh/380); if(vw/s<700) s=vw/700; s=Math.max(.55,s);
    el.style.cssText=`width:${(vw/s).toFixed(1)}px;height:${(vh/s).toFixed(1)}px;transform:scale(${s.toFixed(4)});transform-origin:0 0`; }
  window.addEventListener('resize',()=>requestAnimationFrame(fit)); window.addEventListener('orientationchange',()=>setTimeout(fit,250));
  if(window.visualViewport) window.visualViewport.addEventListener('resize',()=>requestAnimationFrame(fit));
  document.addEventListener('fullscreenchange',()=>setTimeout(fit,100)); document.addEventListener('webkitfullscreenchange',()=>setTimeout(fit,100));
  function setH(el,h){ if(el.__h===h) return; el.__h=h; el.innerHTML=h; }
  function patchN(a,b){ const ac=a.childNodes, bc=b.childNodes; let i=0;
    for(;i<bc.length;i++){ const x=ac[i], y=bc[i]; if(!x){ a.appendChild(y.cloneNode(true)); continue; }
      if(x.nodeType!==y.nodeType||x.nodeName!==y.nodeName){ a.replaceChild(y.cloneNode(true),x); continue; }
      if(x.nodeType===3){ if(x.nodeValue!==y.nodeValue) x.nodeValue=y.nodeValue; continue; }
      if(x.nodeType!==1) continue;
      for(const at of [...x.attributes]) if(!y.hasAttribute(at.name)) x.removeAttribute(at.name);
      for(const at of [...y.attributes]) if(x.getAttribute(at.name)!==at.value) x.setAttribute(at.name,at.value);
      if('disabled' in x) x.disabled=y.hasAttribute('disabled');
      patchN(x,y); }
    while(ac.length>bc.length) a.removeChild(a.lastChild); }
  function morph(el,h){ if(el.__h===h) return; if(el.__h==null){ el.__h=h; el.innerHTML=h; return; } el.__h=h; const t=document.createElement('div'); t.innerHTML=h; patchN(el,t); }
  function render(S,ME,api){
    if(!root){ document.getElementById('tb-game').innerHTML=`<div id="kh"><div class="khwrap"><div class="lft"></div><div class="kbwrap"><div class="frame"><svg id="khs" viewBox="${VB.minX} ${VB.minY} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet"></svg><svg id="khd" viewBox="${VB.minX} ${VB.minY} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet"></svg></div><div class="kst"></div><button class="kfx" type="button" title="Đổi chế độ hiệu ứng"></button><button class="kfs" type="button" title="Toàn màn hình" aria-label="Toàn màn hình">⛶</button><div class="kzm"><button type="button" data-z="in" title="Phóng to bản đồ" aria-label="Phóng to">＋</button><button type="button" data-z="out" title="Thu nhỏ bản đồ" aria-label="Thu nhỏ">－</button><button type="button" data-z="reset" title="Về cỡ ban đầu (100%)" aria-label="Về cỡ ban đầu">100%</button></div><div class="hov"></div></div><div class="side"><div class="ofn"></div><div class="s1"></div><div class="chs"></div><div class="s2"></div></div></div></div>`;
      { const ch=document.getElementById('tb-chat'); if(ch){ root0chat=ch; root0=document.querySelector('#kh .chs'); root0.appendChild(ch); ch.classList.add('show'); } }
      root=$('#kh'); { const fx=root.querySelector('.kfx'); const lab=()=>{ fx.textContent=window.KH_LITE?'🌙 Nhẹ':'✨ Đẹp'; }; lab(); fx.addEventListener('click',e=>{ e.stopPropagation(); const m=KH_FX.toggle(); lab(); boardSig=''; if(lastArgs) render(...lastArgs); if(lastArgs) lastArgs[2].toast(m==='lite'?'Chế độ nhẹ: ít hiệu ứng, mượt trên máy yếu':'Chế độ đẹp: đầy đủ hiệu ứng'); }); } { const fs=root.querySelector('.kfs'); const de=document.documentElement;
        const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
        const sync=()=>{ document.body.classList.toggle('khfs',isFs()); fs.textContent=isFs()?'🗗':'⛶'; fs.title=isFs()?'Thu nhỏ':'Toàn màn hình'; };
        document.addEventListener('fullscreenchange',sync); document.addEventListener('webkitfullscreenchange',sync);
        fs.addEventListener('click',async e=>{ e.stopPropagation();
          try{ if(isFs()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); try{screen.orientation.unlock();}catch(_){ } }
            else if(de.requestFullscreen||de.webkitRequestFullscreen){ await (de.requestFullscreen||de.webkitRequestFullscreen).call(de); try{ await screen.orientation.lock('landscape'); }catch(_){ } }
            else if(lastArgs) lastArgs[2].toast('iPhone chưa hỗ trợ nút này: bấm Chia sẻ → Thêm vào Màn hình chính rồi mở game từ biểu tượng để chơi toàn màn hình'); }
          catch(err){ if(lastArgs) lastArgs[2].toast('Trình duyệt không cho bật toàn màn hình'); } }); }
      root.addEventListener('click',onClick); tipInit(); zoomInit(); fit(); setTimeout(fit,300); root.addEventListener('change',onChange); }
    lastArgs=[S,ME,api]; const sig=S.hex.map(h=>h.res+'.'+h.num).join()+S.ports.join()+(window.KH_LITE?'L':'F');
    if (sig!==boardSig){ boardSig=sig; root.querySelector('#khs').innerHTML=A.board(S,VB); }
    if(!window.__khLT) window.__khLT={v:null}; { const nm=S.turn===ME&&S.phase!=='over'&&ME>=0; if(nm&&window.__khLT.v===false&&root){ banner('ĐẾN LƯỢT BẠN!','turn',1450); try{SFX.pop&&SFX.pop();}catch(e){} } window.__khLT.v=nm; }
    const t=api.now(), my=S.turn===ME&&S.phase!=='over', P=ME>=0?S.P[ME]:null, main=my&&S.phase==='play'&&S.step==='main'&&!S.offer;
    if (S.step!=='discard'||!S.disc||S.disc[ME]==null) dsc=[0,0,0,0,0];
    const dNeed=(S.step==='discard'&&S.disc&&S.disc[ME]!=null)?S.disc[ME]:0, dSel=dsc.reduce((a,b)=>a+b,0);
    if (!main) mode=null; if (!(my&&S.step==='robber')) robH=null;
    if (main&&P&&mode){ const C=KH_COST, okm={road:(KH.canPay(P,C.road)||S.free>0)&&P.roads>0, town:KH.canPay(P,C.town)&&P.towns>0, city:KH.canPay(P,C.city)&&P.cities>0}; if(okm[mode]===false) mode=null; }
    if (lastEv===null) lastEv=S.ev?S.ev.n:0; const ev=S.ev, isNew=ev&&ev.n!==lastEv;
    const pre={}; if(isNew&&ev.k==='steal') pre.vic=rectOf(`.pl[data-p="${ev.vic}"]`);
    setH(root.querySelector('#khd'),dynSVG(S,ME,isNew?ev:null));
    let st;
    if (S.phase==='over') st=`<b>${api.esc(S.seats[S.winner].name)}</b> chiến thắng với ${KH.vp(S,S.winner,true)} điểm!`;
    else if (S.phase==='setup') st=my?(S.step==='town'?'Chọn chỗ đặt <b>nhà</b> (chấm sáng)':'Chọn cạnh đặt <b>đường</b> nối với nhà vừa đặt'):'Chờ '+api.esc(S.seats[S.turn].name)+' xếp nhà';
    else if (S.step==='discard') st=(S.disc&&S.disc[ME]!=null)?`Ra 7! Bạn phải bỏ <b>${S.disc[ME]}</b> lá — bấm tài nguyên có vòng đỏ`:`Ra 7! Chờ ${Object.keys(S.disc||{}).map(i=>api.esc(S.seats[i].name)).join(', ')} bỏ bớt lá`;
    else if (S.step==='robber') st=my?(robH!=null?'Chọn người để lấy 1 lá':'Bấm vào ô đất để dời <b>kẻ cướp</b>'):api.esc(S.seats[S.turn].name)+' đang dời kẻ cướp';
    else if (S.step==='roll') st=my?'Đến lượt bạn: <b>đổ xúc xắc</b>':'Chờ '+api.esc(S.seats[S.turn].name)+' đổ xúc xắc';
    else st=my?(S.free?`Xây ${S.free} đường miễn phí`:mode==='road'?'Chọn cạnh để xây đường':mode==='town'?'Chọn chỗ xây nhà':mode==='city'?'Chọn nhà để nâng thành phố':''):api.esc(S.seats[S.turn].name)+' đang xây dựng';
    const cmdTxt=(Date.now()<sayUntil&&sayTxt)?sayTxt:st; setH(root.querySelector('.kst'),cmdTxt);
    let h=`<div class="dice ${isNew&&ev.k==='roll'?'rolling':''}"><span class="dfc" data-a="dstat" title="Bấm để xem thống kê xúc xắc">${S.dice?A.die(S.dice[0])+A.die(S.dice[1],'#fdecc8')+`<b>${S.dice[0]+S.dice[1]}</b>`:'<span>Chưa đổ</span>'}</span><button class="tbtn pri" data-a="roll" ${my&&S.phase==='play'&&S.step==='roll'?'':'disabled'}>Đổ xúc xắc</button></div>`;
    if (robH!=null){ const vs=KH.victims(S,robH,ME); h+=`<div class="box">Lấy 1 lá của: ${vs.map(v=>`<button class="tbtn" data-vic="${v}">${api.esc(S.seats[v].name)}</button>`).join(' ')}</div>`; }
    const h2=h; let L=h.replace('<div class="dice ','<div class="dup dice ').replace('<div class="box">Lấy','<div class="dup box">Lấy'), HV=`<div class="dtop">${h2}</div>`, dvH=''; const L0=L.length; h='';
    h+=`<div class="pls">${S.seats.map((p,i)=>{ const Q=S.P[i]; const left=S.turn===i&&S.phase!=='over'?Math.max(0,60-Math.floor((t-S.turnAt)/1000)):null;
      return `<div class="pl ${S.turn===i?'turn':''} ${S.turn===i&&i===ME&&S.phase!=='over'?'mine':''} ${S.step==='discard'&&S.disc&&S.disc[i]!=null?'mustd':''} ${S.winner===i?'win':''}" data-p="${i}" style="--pc:${PC[i]}"><div class="ph"><svg viewBox="-12 -16 24 28" class="pk">${A.house(0,0,PC[i],false,1)}</svg><b>${api.esc(p.name)}</b>${i===ME?' (bạn)':''}${S.step==='discard'&&S.disc&&S.disc[i]!=null?`<span class="dtag">Bỏ ${S.disc[i]}</span>`:''}${(()=>{const v=KH.vp(S,i,i===ME||S.phase==='over');const up=lastVp[i]!==undefined&&v>lastVp[i];lastVp[i]=v;return `<span class="vp${up?' up':''}" title="Điểm chiến thắng"><span class="vtk${String(v).length>1?' two':''}"><img src="assets/vp-coin.webp?v=2026112823y" alt=""><b>${v}</b></span></span>`;})()}<span class="meds">${S.longest===i?`<span class="medal lr" data-tip="${TIP_LR(Math.max(0,...S.P.map(q=>q.lr)))}">${A.medal('road')}</span>`:''}${S.largest===i?`<span class="medal la" data-tip="${TIP_LA(Math.max(0,...S.P.map(q=>q.knights)))}">${A.medal('army')}</span>`:''}</span>${left!=null?` <span class="tmr"></span>`:''}</div>
        <div class="pcn"><span title="Nhà"><img src="assets/house-neutral.webp?v=2026112823y">${5-Q.towns}</span><span title="Thành phố"><img src="assets/city-neutral.webp?v=2026112823y">${4-Q.cities}</span><span title="Đường"><img src="assets/road-neutral.webp?v=2026112823y" class="rd">${15-Q.roads}</span></div>
        ${i!==ME&&ME>=0?`<button class="tbtn sm pto" data-a="offerto" data-p="${i}" ${main&&P&&KH.tot(P.res)>0?'':'disabled'} title="Mở bảng đổi với người này">Yêu cầu đổi</button>`:''}
        <div class="ps"><span title="Tài nguyên"><i>Tài nguyên: </i><u>🎴</u><b class="rn2">${KH.tot(Q.res)}</b></span><span title="Thẻ phát triển"><i>Thẻ PT: </i><u>📜</u>${Q.dev.length+Q.newDev.length}</span><span title="Hiệp sĩ đã dùng"><i>Hiệp sĩ: </i><u>⚔️</u>${Q.knights}</span></div>
        </div>`; }).join('')}</div>`;
    const S1=h; h='';
    { const V='?v=2026112823y';
      const cc=c=>c.map((x,r)=>x?`<span class="cr">${[...Array(x)].map(()=>`<svg viewBox="-9 -8 18 16" width="21" height="19">${A.resMini(r,0,0,.8)}</svg>`).join('')}</span>`:'').join('');
      const cn=(c,lim)=>{ if(!P) return 0; return Math.min(lim,...c.map((x,r)=>x?Math.floor(P.res[r]/x):1e9)); };
      const row=(ic,t,pt,c,att,dis,on,n)=>`<button class="ctr cbtn ${on?'on':''} ${dis?'':'can'}" ${att} ${dis?'disabled':''}><span class="cic">${ic}${!dis&&n>1?`<i class="cn">x${n}</i>`:''}</span><span class="ctx"><b>${t}</b><small>${pt}</small></span><span class="cco">${cc(c)}</span></button>`;
      const okR=main&&P&&(KH.canPay(P,KH_COST.road)||S.free)&&P.roads>0, okT=main&&P&&KH.canPay(P,KH_COST.town)&&P.towns>0, okC=main&&P&&KH.canPay(P,KH_COST.city)&&P.cities>0, okD=main&&P&&KH.canPay(P,KH_COST.dev)&&S.dev.length>0;
      L+=`<div class="box ctab"><div class="cth">Bảng chi phí xây dựng</div>${row(`<img src="assets/road-neutral.webp${V}" class="ci rd">`,'Đường',S.free?`Còn ${S.free} đường miễn phí`:'',KH_COST.road,'data-m="road"',!okR,mode==='road',S.free>0?S.free:cn(KH_COST.road,P?P.roads:0))}${row(`<img src="assets/house-neutral.webp${V}" class="ci">`,'Nhà','+1 điểm',KH_COST.town,'data-m="town"',!okT,mode==='town',cn(KH_COST.town,P?P.towns:0))}${row(`<img src="assets/city-neutral.webp${V}" class="ci">`,'Thành phố','+2 điểm · nâng từ nhà',KH_COST.city,'data-m="city"',!okC,mode==='city',cn(KH_COST.city,P?P.cities:0))}${row(`<span class="ci dcs">${A.devBack()}</span>`,'Thẻ phát triển','',KH_COST.dev,'data-a="buydev"',!okD,false,cn(KH_COST.dev,S.dev.length))}${my&&S.phase==='play'?'<div class="chint">Bấm vào mục để xây</div>':''}</div>`; }
    if (P){
      HV+=`<div class="box hand">${P.res.map((x,r)=>`<div class="rstack clk ${x?'':'none'} ${dNeed&&x?'dsc':''}" data-a="${dNeed?'dpick':'res'}" data-r="${r}" title="${KH_RES[r]}: ${dNeed?'bấm để chọn bỏ':'bấm để đổi với người chơi khác'}">${[...Array(Math.max(1,Math.min(x,4)))].map((_,k)=>`<div class="rc" style="--k:${k}">${A.resCard(r)}</div>`).join('')}<b>${x}</b>${dsc[r]?`<i class="dsel">−${dsc[r]}</i>`:''}</div>`).join('')}</div>`;
      const cost=c=>c.map((x,r)=>x?`<span class="cr">${[...Array(x)].map(()=>`<svg viewBox="-9 -8 18 16" width="15" height="14">${A.resMini(r,0,0,.8)}</svg>`).join('')}</span>`:'').join('');
      const B=(k,label,c,dis)=>`<button class="tbtn bld ${mode===k?'on':''}" data-m="${k}" ${dis?'disabled':''}><b>${label}</b><span>${cost(c)}</span></button>`;

      const dv={}; P.dev.forEach(d=>dv[d]=(dv[d]||0)+1); const nv={}; P.newDev.forEach(d=>nv[d]=(nv[d]||0)+1);
      const canDev=my&&S.phase==='play'&&!S.devPlayed&&(S.step==='main'||S.step==='roll');
      const devs=Object.keys(KH_DEVN).filter(k=>dv[k]||nv[k]);
      const totD=devs.reduce((s,k)=>s+(dv[k]||0)+(nv[k]||0),0), fD=totD<=3?1:totD<=6?.86:totD<=10?.74:.6;
      dvH=`<div class="box dv"><div class="cth">Thẻ phát triển của bạn${totD?` <span class="dtot">${totD}</span>`:''}</div>${devs.length?'':'<div class="dve">Chưa có</div>'}<div class="dvl2" style="--f:${fD}">${devs.map(k=>{ const nd=dv[k]||0, nn=nv[k]||0, n=nd+nn;
        const cs=[...Array(n)].map((_,q)=>`<div class="dc ${q>=nd?'new':''}" style="--i:${q}">${A.devCard(k)}</div>`).join('');
        const bt=k==='vp'?'<small>+1 điểm ẩn mỗi thẻ</small>':nd?`<button class="tbtn sm" data-dev="${k}" ${canDev&&(k==='knight'||S.step==='main')?'':'disabled'}>Dùng${nn?` (${nd})`:''}</button>${nn?`<small>${nn} mới mua</small>`:''}`:'<small>mới mua</small>';
        return `<div class="dg" style="--n:${n}"><div class="dstk" data-tip="${KH_TIP[k]}">${cs}<b class="dn">×${n}</b></div>${bt}</div>`; }).join('')}</div>
        ${dsel?`<div class="dpick">${dsel==='mono'?'Gom loại:':'Nhận 2 lá:'} ${KH_RES.map((nm,r)=>`<button class="tbtn sm" data-pr="${r}" title="${nm}"><img class="ri" src="assets/ic-${r}.webp?v=2026112823y" alt="${nm}"></button>`).join('')} <button class="tbtn sm" data-a="dcancel">Huỷ</button></div>`:''}</div>`;
      { const rp=KH.rates(S,ME), hasPort=rp.some(x=>x<4), isB=pop==='bank', rt=isB?[4,4,4,4,4]:rp; if(pop==='port'&&!hasPort) pop=null; const elig=P.res.map((x,r)=>x>=rt[r]), anyB=main&&elig.some(Boolean), anyBk=main&&P.res.some(x=>x>=4), anyPt=main&&hasPort&&P.res.some((x,r)=>x>=rp[r]);
        if((pop==='bank'||pop==='port')&&anyB&&!elig[tg]){ tg=elig.findIndex(Boolean); if(tw===tg) tw=(tg+1)%5; }
        const mini=r=>`<svg viewBox="-9 -8 18 16" width="26" height="24">${A.resMini(r,0,0,.8)}</svg>`;
        const gb=KH_RES.map((nm,r)=>`<button class="rbtn ${tg===r?'sel':''} ${elig[r]&&main?'glow':''}" data-a="bg" data-r="${r}" ${elig[r]&&main?'':'disabled'} title="${nm}">${mini(r)}<b>${rt[r]}</b></button>`).join('');
        const wb=KH_RES.map((nm,r)=>`<button class="rbtn ${tw===r?'sel':''}" data-a="bw" data-r="${r}" ${r===tg?'disabled':''} title="${nm}">${mini(r)}<b>1</b></button>`).join('');
        const okT=main&&elig[tg]&&tg!==tw;
        const pk=(act,sel)=>KH_RES.map((nm,r)=>`<button class="rbtn ${sel===r?'sel':''}" data-a="${act}" data-r="${r}" title="${nm}">${mini(r)}</button>`).join(''), opt=(n,sel,not)=>KH_RES.map((x,r)=>`<option value="${r}" ${r===sel?'selected':''} ${r===not?'disabled':''}>${x}</option>`).join(''), qty=(sel)=>[1,2,3,4].map(q=>`<option value="${q}" ${q===sel?'selected':''}>${q}</option>`).join('');
        if(pop==='offer'&&P.res[og]<oq){ if(P.res[og]>0) oq=Math.min(4,P.res[og]); else { const f=P.res.findIndex(x=>x>0); if(f>=0){ og=f; oq=Math.min(oq,P.res[f])||1; } } } if(ow===og) ow=(og+1)%5;
        const others=S.seats.map((x,i)=>i).filter(i=>i!==ME), okO=main&&P.res[og]>=oq&&og!==ow;
        const popH=(pop==='bank'||pop==='port')?`<div class="box pop"><button class="pclose" type="button" data-a="closepop" aria-label="Đóng">×</button><div class="cth">${isB?'Ngân hàng · đổi 4 lấy 1':'Cảng · đổi theo cảng của bạn'}</div><div class="plb">Đưa (số lá cần có)</div><div class="rrow">${gb}</div><div class="plb">Lấy</div><div class="rrow">${wb}</div><button class="tbtn pri wide" data-a="trade" ${okT?'':'disabled'}>Đổi ${rt[tg]} <img class="ri" src="assets/ic-${tg}.webp?v=2026112823y" alt=""> lấy 1 <img class="ri" src="assets/ic-${tw}.webp?v=2026112823y" alt=""></button></div>`
          :'';
                HV+=`<div class="tbar">${popH}<button class="bt bk ${anyBk?'ring':''} ${pop==='bank'?'on':''}" data-a="pop" data-k="bank" title="Ngân hàng: đổi 4 lá cùng loại lấy 1 lá bất kỳ"><img src="assets/bank.webp?v=2026112823y" alt=""><small>Ngân hàng</small></button><button class="bt pt ${anyPt?'ring':''} ${pop==='port'?'on':''}" data-a="pop" data-k="port" ${hasPort?'':'disabled'} title="${hasPort?'Cảng: đổi theo tỉ lệ cảng của bạn':'Cần có nhà hoặc thành phố ở cảng mới đổi được'}"><img src="assets/boat.webp?v=20261128g" alt=""><small>Cảng</small></button><button class="bt bm ${pop==='offer'?'on':''}" data-a="pop" data-k="offer" title="Trao đổi: gửi yêu cầu đổi với người chơi khác"><img src="assets/market.webp?v=2026112823y" alt=""><small>Trao đổi</small></button>${S.undo===ME&&ME>=0&&S.phase!=='over'?'<button class="tbtn kundo" data-a="undo" title="Quay lại nước vừa đi">↩ Hoàn tác</button>':''}${my&&S.phase==='play'&&S.step==='roll'?'<button class="tbtn pri kend rdy kroll" data-a="roll">🎲 Đổ xúc xắc</button>':`<button class="tbtn pri kend ${main?'rdy':''}" data-a="end" ${main?'':'disabled'}>Kết thúc lượt</button>`}</div>`; }
      { const mx=Math.max(0,...S.P.map(q=>q.lr)), mk=Math.max(0,...S.P.map(q=>q.knights)); const hd=i=>i>=0?`<span class="hold" style="--pc:${PC[i]}">${api.esc(S.seats[i].name)}</span>`:'<span class="hold none">Chưa ai</span>';
        const slot=(k,cls,own)=>own<0?`<span class="medal ${cls}">${A.medal(k)}</span>`:`<span class="slot"></span>`;
        L+=`<div class="box awp"><div class="cth">Giải thưởng +2 điểm</div>
          <div class="arow" data-tip="${TIP_LR(mx)}">${slot('road','lr',S.longest)}<span class="atx"><b>Đường dài nhất</b><small>Từ 5 đoạn trở lên · cao nhất: ${mx}</small>${hd(S.longest)}</span></div>
          <div class="arow" data-tip="${TIP_LA(mk)}">${slot('army','la',S.largest)}<span class="atx"><b>Quân đội mạnh nhất</b><small>Từ 3 hiệp sĩ trở lên · cao nhất: ${mk}</small>${hd(S.largest)}</span></div></div>`; }
      if(S.phase==='over'&&api.mode()!=='client') L+=`<div class="box"><button class="tbtn gold wide" data-a="again">Chơi ván mới</button></div>`; }
    h+=`<div class="xlog">${S.log.slice(0,6).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div>`;
    const preM={lr:rectOf('.medal.lr'),la:rectOf('.medal.la')}; const awardEv=isNew&&ev.k==='award';
    L=L.slice(0,L0)+`<div class="cmdb ${cmdTxt?'on':''}"><span>${cmdTxt||''}</span></div>`+(dvH||'')+L.slice(L0);
    setH(root.querySelector('.hov'),HV); setH(root.querySelector('.lft'),L); setH(root.querySelector('.s1'),S1); tickView(S,ME,api); setH(root.querySelector('.s2'),h);
    if(hideMed&&Date.now()<hideMed.until){ const m=root.querySelector(`.pl[data-p="${hideMed.seat}"] .medal.${hideMed.c}`); if(m) m.style.visibility='hidden'; }
    { const keys={lr:S.longest,la:S.largest}; [['lr','road'],['la','army']].forEach(([c,k])=>{ if(!awardEv&&prevAw[c]!==undefined&&prevAw[c]!==keys[c]&&keys[c]!==undefined){ const to=rectOf('.medal.'+c); const el=root.querySelector('.medal.'+c); if(el&&to&&preM[c]){ el.style.visibility='hidden'; fly(preM[c],to,A.medal(k),48,48,0); setTimeout(()=>{ el.style.visibility=''; el.classList.add('land'); },1150); } else if(el) el.classList.add('land'); } prevAw[c]=keys[c]; }); }
    const ofH=offerBox(S,ME,api);
    if(root0chat){ root0chat.classList.add('show'); let cf=root0chat.querySelector('.cfeed'); if(!cf){ cf=document.createElement('div'); cf.className='cfeed'; const hd=root0chat.querySelector('.hd'); if(hd) hd.after(cf); else root0chat.prepend(cf); }
      const tl=S.log.slice(0,12).filter(l=>/muốn đổi|đổi với|lời mời|yêu cầu đổi|Không ai đồng ý|đủ lá để đổi/.test(l)).slice(0,S.offer?2:3).reverse();
      setH(cf,tl.map(l=>`<div class="tl">${api.esc(l)}</div>`).join('')+(S.offer&&!hotH?ofH:'')); }
    const dscH0=dNeed?`<div class="box ofr hot dscp"><div class="cth">Ra 7! Bạn phải bỏ ${dNeed} lá</div><div class="chint">Bạn có ${KH.tot(P.res)} lá, phải bỏ một nửa (làm tròn xuống). Bấm vào tài nguyên có vòng đỏ để chọn lá bỏ.</div><div class="orow"><small>Đã chọn ${dSel}/${dNeed}</small>${dSel?resRow(dsc):'<span class="chint">chưa chọn</span>'}</div><div class="obt"><button class="tbtn" data-a="dclr">Làm lại</button><button class="tbtn" data-a="dauto">Tự chọn</button></div><button class="tbtn pri wide" data-a="ddo" ${dSel===dNeed?'':'disabled'}>Bỏ ${dNeed} lá</button></div>`:'';
    dscModal(S,ME,api,dNeed,P); statModal(S); trdModal(S,ME,api,P,main); vicRender(S,ME,api); setH(root.querySelector('.ofn'),((hotH||ofH)?`<div class="ofnh">${hotH||ofH}</div>`:''));
    if(isNew){ lastEv=ev.n;
      if(ev.k==='roll'){ SFX.clack(3); const sum=ev.d[0]+ev.d[1]; if(sum===7){ banner('<img src="assets/robber.webp?v=2026112823y" alt=""><span>RA SỐ 7!</span>','seven',1750); const ks=ev.disc?Object.keys(ev.disc):[]; say(ks.length?'Ra 7! '+ks.map(i=>'<b>'+api.esc(S.seats[i].name)+'</b>').join(', ')+' có hơn 7 lá, phải bỏ một nửa':'Ra 7! <b>Kẻ cướp</b> xuất hiện'); if(ev.disc&&ev.disc[ME]!=null) SFX.ding&&SFX.ding(); }
        if(ev.got){ prodFX(S,sum); if(ME>=0&&KH.tot(ev.got[ME])) setTimeout(()=>SFX.ding(),3900); } }
      else if(ev.k==='award'){ banner('<span>'+api.esc(S.seats[ev.seat].name)+(ev.a==='road'?' giành ĐƯỜNG DÀI NHẤT!':' giành QUÂN ĐỘI MẠNH NHẤT!')+'</span>','award',1450); setTimeout(()=>congrats(S,ev,ME),1250); }
      else if(ev.k==='nodeal'){ if(ev.seat===ME) say('Không ai đồng ý đổi — bạn có thể đổi loại khác hoặc dùng Ngân hàng'); }
      else if(ev.k==='offer'){ if(ev.seat===ME&&!S.offer) say('Chưa ai có đủ lá để đổi lại với bạn — thử đổi loại khác'); else if(ev.seat===ME) say('Đã gửi yêu cầu đổi, chờ người khác trả lời'); if(ev.seat!==ME&&S.offer&&ME>=0&&(S.offer.to<0||S.offer.to===ME)) { SFX.ding&&SFX.ding(); say(api.esc(S.seats[ev.seat].name)+' muốn đổi tài nguyên — xem ở khung Trò chuyện'); } }
      else if(ev.k==='town'||ev.k==='city'||ev.k==='road'){ SFX.clack(2); if(ev.seat===ME&&ev.k!=='road') SFX.reward(); buildTag(S,ev); }
      else if(ev.k==='discard'){ SFX.pop&&SFX.pop(); ev.res.forEach((x,r)=>{ if(x) popNum(rectOf(`.pl[data-p="${ev.seat}"]`),r,'-'+x,true,r*180); }); if(ev.seat!==ME) say('<b>'+api.esc(S.seats[ev.seat].name)+'</b> đã bỏ '+ev.n+' lá'); }
      else if(ev.k==='steal'){ SFX.flip(); const vr=pre.vic, tr=rectOf(`.pl[data-p="${ev.seat}"]`), T0=650;
        if(ev.r>=0){ fly(vr,tr,`<div class="kstealc">${A.resCard(ev.r)}</div>`,54,72,T0); popNum(vr,ev.r,'-1',true,T0+150); popNum(tr,ev.r,'+1',false,T0+1000);
          setTimeout(()=>{ if(ev.vic===ME) say('<b>'+api.esc(S.seats[ev.seat].name)+'</b> lấy của bạn 1 '+KH_RES[ev.r]); else if(ev.seat===ME) say('Bạn lấy được 1 '+KH_RES[ev.r]+' của <b>'+api.esc(S.seats[ev.vic].name)+'</b>'); else say('<b>'+api.esc(S.seats[ev.seat].name)+'</b> lấy 1 lá của <b>'+api.esc(S.seats[ev.vic].name)+'</b>'); },T0+1150); }
        else say('<b>'+api.esc(S.seats[ev.vic].name)+'</b> không có lá nào để lấy'); }
      else if(ev.k==='buydev'){ SFX.flip(); if(ev.seat===ME){ say('Bạn nhận thẻ: '+KH_DEVN[ev.d],true); fly(rectOf('[data-a="buydev"]'),rectOf('.dv')||rectOf('.hand'),A.devCard(ev.d),56,78,0); } }
      else if(ev.k==='award'){ SFX.ding(); say(api.esc(S.seats[ev.seat].name)+(ev.a==='road'?' giành Đường dài nhất (+2)':' giành Quân đội mạnh nhất (+2)'),ev.seat===ME); }
      else if(ev.k==='over'){ SFX.ding(); if(S.winner===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.4,140); } }
      else if(ev.k==='dev'||ev.k==='trade'){ SFX.pop(); if(ev.k==='dev'){ banner('<div class="kdc">'+A.devCard(ev.d)+'<i class="sp s1">✦</i><i class="sp s2">✦</i><i class="sp s3">✧</i><i class="sp s4">✦</i></div>','devc',2050); say('<b>'+api.esc(S.seats[ev.seat].name)+'</b> dùng thẻ '+KH_DEVN[ev.d]); try{SFX.chime&&SFX.chime();}catch(e){} } }
      if(my && (S.step==='roll'||S.phase==='setup'&&S.step==='town') && ev.k!=='roll' && SFX.hiss) SFX.hiss(); }
  }
  function buildBar(S,ME,P,main){ if(!P||S.phase!=='play'||S.turn!==ME||S.step!=='main'||S.offer) return '';
    const C=KH_COST, V='?v=2026112823y';
    const it=[['road','Đường',main&&(KH.canPay(P,C.road)||S.free>0)&&P.roads>0,'road-neutral.webp','rd'],['town','Nhà',main&&KH.canPay(P,C.town)&&P.towns>0,'house-neutral.webp',''],['city','Thành phố',main&&KH.canPay(P,C.city)&&P.cities>0,'city-neutral.webp',''],['dev','Thẻ PT',main&&KH.canPay(P,C.dev)&&S.dev.length>0,'card-back.webp','cd']];
    return `<div class="xbb">${it.map(([k,t,ok,img,c])=>`<button type="button" class="xbbt ${ok?'can':''} ${mode===k?'on':''}" ${k==='dev'?'data-a="buydev"':`data-m="${k}"`} ${ok?'':'disabled'}><img class="${c}" src="assets/${img}${V}" alt=""><b>${mode===k?'Chọn chỗ':t}</b></button>`).join('')}</div>`; }
  /* ===== Kết thúc ván: bảng chiến thắng + xem lại ván ===== */
  const CN=['red','blue','green','white'];
  let vic=null, vicKey='', vicClosed='', vicAt=0, rev=null, revTab='pl', vicBtn=null;
  function gKey(S){ return (S.t0||0)+'_'+S.winner; }
  function ptsOf(S,i){ let t=0,c=0; S.vo.forEach(o=>{ if(o&&o.p===i){ if(o.city) c++; else t++; } }); const P=S.P[i], vc=P.dev.filter(d=>d==='vp').length+P.newDev.filter(d=>d==='vp').length;
    return {t,c,lr:S.longest===i,la:S.largest===i,vc,tot:KH.vp(S,i,true),roads:S.eo.filter(x=>x===i).length}; }
  function fmtDur(ms){ if(!(ms>0)) return ''; const m=Math.round(ms/60000); return m<1?'dưới 1 phút':m+' phút'; }
  function vicRender(S,ME,api){
    if(S.phase!=='over'||S.winner<0){ [vic,rev,vicBtn].forEach(e=>e&&e.remove()); vic=rev=vicBtn=null; vicAt=0; return; }
    const k=gKey(S); if(k!==vicKey){ vicKey=k; vicAt=Date.now()+1500; setTimeout(()=>{ if(lastArgs) render(...lastArgs); },1550); }
    if(Date.now()<vicAt) return;
    const show=vicClosed!==k;
    if(!vicBtn){ vicBtn=document.createElement('button'); vicBtn.type='button'; vicBtn.id='kvicb'; vicBtn.className='tbtn pri'; vicBtn.textContent='Kết quả ván'; vicBtn.onclick=()=>{ vicClosed=''; render(...lastArgs); }; document.body.appendChild(vicBtn); }
    vicBtn.style.display=show||rev?'none':'';
    if(!show){ if(vic){ vic.remove(); vic=null; } } else {
      if(!vic){ vic=document.createElement('div'); vic.id='kvic'; document.body.appendChild(vic); vic.addEventListener('click',vicClick); }
      const W=S.winner, order=S.seats.map((_,i)=>i).sort((a,b)=>KH.vp(S,b,true)-KH.vp(S,a,true)||(a===W?-1:b===W?1:0));
      const rolls=(S.dr&&S.dr.length)||(S.dh?S.dh.reduce((a,b)=>a+b,0):0), host=api.mode()!=='client'&&api.mode()!=='watcher';
      const rows=order.map((i,n)=>{ const q=ptsOf(S,i); const br=[q.t?q.t+' nhà':'',q.c?q.c+' thành phố':'',q.lr?'đường dài nhất':'',q.la?'quân đội mạnh nhất':'',q.vc?q.vc+' thẻ điểm':''].filter(Boolean).join(' · ');
        return `<div class="vr ${i===W?'w':''}" style="--pc:${PC[i]}"><b class="vk">${n+1}</b><img src="assets/house-${CN[i]||'red'}.webp?v=2026112823y" alt=""><div class="vn"><b>${api.esc(S.seats[i].name)}${i===ME?' (bạn)':''}</b><small>${br||'—'}</small></div><b class="vp">${q.tot}</b></div>`; }).join('');
      setH(vic,`<div class="vpn"><i class="xnl n1"></i><i class="xnl n2"></i><i class="xnl n3"></i><i class="xnl n4"></i>
        <div class="vrib"><span>CHIẾN THẮNG!</span></div>
        <div class="vwin" style="--pc:${PC[W]}"><img class="vh" src="assets/house-${CN[W]||'red'}.webp?v=2026112823y" alt=""><div><div class="vwn">${api.esc(S.seats[W].name)}</div><div class="vws">${W===ME?'Chúc mừng bạn đã chinh phục hòn đảo!':'Chúc mừng '+api.esc(S.seats[W].name)+' đã chinh phục hòn đảo!'}</div></div><div class="vcoin"><img src="assets/vp-coin.webp?v=2026112823y" alt=""><b>${KH.vp(S,W,true)}</b></div></div>
        <div class="vrk">${rows}</div>
        <div class="vmeta">${S.round||1} vòng · ${rolls} lần đổ xúc xắc${S.tEnd&&S.t0?' · '+fmtDur(S.tEnd-S.t0):''}</div>
        <div class="vbt"><button type="button" class="tbtn pri" data-v="again" ${host?'':'disabled'}>${host?'Chơi ván mới':'Chờ chủ phòng mở ván mới'}</button><button type="button" class="tbtn vgr" data-v="review">Xem lại ván</button><button type="button" class="tbtn" data-v="map">Xem bản đồ</button></div></div>`); }
    if(rev) revRender(S,ME,api); }
  function vicClick(e){ const b=e.target.closest('[data-v]'); if(!b||b.disabled) return; const v=b.dataset.v, [S,ME,api]=lastArgs;
    if(v==='again'){ api.rematch(); return; }
    if(v==='map'){ vicClosed=vicKey; render(S,ME,api); return; }
    if(v==='review'){ vicClosed=vicKey; revTab='pl'; rev=document.createElement('div'); rev.id='krev'; document.body.appendChild(rev); rev.addEventListener('click',revClick); render(S,ME,api); } }
  function revClick(e){ const b=e.target.closest('[data-r]'); if(!b) return; const v=b.dataset.r;
    if(v==='close'){ rev.remove(); rev=null; render(...lastArgs); return; }
    if(v==='back'){ rev.remove(); rev=null; vicClosed=''; render(...lastArgs); return; }
    revTab=v; render(...lastArgs); }
  const icR=r=>`<img class="ri" src="assets/ic-${r}.webp?v=2026112823y" alt="${KH_RES[r]}" title="${KH_RES[r]}">`;
  function revRender(S,ME,api){
    const n=S.seats.length, X=Array.isArray(S.sx)?S.sx:S.seats.map(()=>({})), g=(i,k)=>(X[i]&&X[i][k])||0;
    const head=`<tr><th></th>${S.seats.map((p,i)=>`<th style="--pc:${PC[i]}"><img src="assets/house-${CN[i]||'red'}.webp?v=2026112823y" alt=""><b>${api.esc(p.name)}</b>${i===S.winner?'<em>Thắng</em>':''}</th>`).join('')}</tr>`;
    const row=(lab,f,cls)=>`<tr class="${cls||''}"><td>${lab}</td>${S.seats.map((_,i)=>`<td>${f(i)}</td>`).join('')}</tr>`, sec=t=>`<tr class="sec"><td colspan="${n+1}">${t}</td></tr>`;
    const P=i=>ptsOf(S,i);
    let body='';
    if(revTab==='pl'){
      body=`<div class="rtw"><table class="rt">${head}
        ${sec('Điểm')}${row('<b>Tổng điểm</b>',i=>`<b class="big">${P(i).tot}</b>`,'tot')}${row('Nhà',i=>P(i).t)}${row('Thành phố',i=>P(i).c)}${row('Đường đã xây',i=>P(i).roads)}${row('Đường dài nhất',i=>S.P[i].lr+(P(i).lr?' ★':''))}${row('Hiệp sĩ đã dùng',i=>S.P[i].knights+(P(i).la?' ★':''))}${row('Thẻ điểm thưởng',i=>P(i).vc)}
        ${sec('Tài nguyên nhận từ xúc xắc')}${[0,1,2,3,4].map(r=>row(icR(r)+KH_RES[r],i=>(X[i]&&X[i].prod?X[i].prod[r]:0))).join('')}${row('<b>Tổng</b>',i=>`<b>${X[i]&&X[i].prod?X[i].prod.reduce((a,b)=>a+b,0):0}</b>`)}${row('Nhận lúc đặt nhà đầu',i=>g(i,'start'))}
        ${sec('Trao đổi')}${row('Ngân hàng (đưa → nhận)',i=>g(i,'bankG')||g(i,'bankR')?g(i,'bankG')+' → '+g(i,'bankR'):'—')}${row('Cảng (đưa → nhận)',i=>g(i,'portG')||g(i,'portR')?g(i,'portG')+' → '+g(i,'portR'):'—')}${row('Đổi với người chơi',i=>g(i,'trN')?g(i,'trN')+' lần<small>đưa '+g(i,'trG')+', nhận '+g(i,'trR')+'</small>':'—')}
        ${sec('Kẻ cướp và mất bài')}${row('Cướp được',i=>g(i,'stole'))}${row('Bị cướp',i=>g(i,'robbed'))}${row('Bỏ khi ra 7',i=>g(i,'disc'))}${row('Độc quyền gom được',i=>g(i,'monoG'))}${row('Mất vì Độc quyền',i=>g(i,'monoL'))}
        ${sec('Thẻ phát triển và lượt chơi')}${row('Thẻ đã mua',i=>g(i,'devB'))}${row('Thẻ đã dùng',i=>g(i,'devU'))}${row('Được mùa nhận',i=>g(i,'plenty'))}${row('Tài nguyên đã tiêu để xây/mua',i=>g(i,'spent'))}${row('Số lần đổ xúc xắc',i=>g(i,'rolls'))}${row('Đổ ra 7',i=>g(i,'sevens'))}
      </table></div>`; }
    else if(revTab==='dice'){
      const h=Array.isArray(S.dh)?S.dh:Array(13).fill(0), tot=h.reduce((a,b)=>a+b,0), W=[0,0,1,2,3,4,5,6,5,4,3,2,1], mx=Math.max(1,...h.slice(2).map((x,i)=>Math.max(x,tot*W[i+2]/36)));
      const cols=[2,3,4,5,6,7,8,9,10,11,12].map(k=>`<div class="xsc ${k===7?'s7':''}"><i class="xsn">${h[k]}</i><div class="xsb"><span class="xse" style="height:${Math.round(tot*W[k]/36/mx*100)}%"></span><span class="xsv" style="height:${Math.round(h[k]/mx*100)}%"></span></div><b>${k}</b></div>`).join('');
      const seq=(S.dr||[]).map((x,j)=>`<span class="dq ${x===7?'s7':''}"><i>${j+1}</i>${x}</span>`).join('');
      body=`<div class="rsum">Đã đổ <b>${tot}</b> lần · ra 7: <b>${h[7]}</b> lần</div><div class="xsg">${cols}</div><div class="xslg"><span><i class="lv"></i>Số lần đã ra</span><span><i class="le"></i>Mức trung bình theo xác suất</span></div><div class="rlab">Thứ tự các lần đổ</div><div class="dseq">${seq||'<span class="mute">Chưa có</span>'}</div>`; }
    else if(revTab==='map'){
      const a=root&&root.querySelector('#khs'), b=root&&root.querySelector('#khd'), vb=`${VB.minX} ${VB.minY} ${VB.w} ${VB.h}`;
      body=`<div class="rmap"><svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${a?a.innerHTML:''}</svg><svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet" class="top">${b?b.innerHTML.replace(/class="(hot|spot|vspot|vhit|ehit|pickh)[^"]*"/g,'class="hid"'):''}</svg></div><div class="rleg">${S.seats.map((p,i)=>`<span style="--pc:${PC[i]}"><img src="assets/house-${CN[i]||'red'}.webp?v=2026112823y" alt="">${api.esc(p.name)}</span>`).join('')}</div>`; }
    else { const L=S.log.slice().reverse(); body=`<div class="rlog">${L.map((l,j)=>`<div><i>${j+1}</i>${api.esc(l)}</div>`).join('')}</div>`; }
    const tabs=[['pl','Người chơi'],['dice','Xúc xắc'],['map','Bản đồ'],['log','Nhật ký']].map(([k,t])=>`<button type="button" class="rtab ${revTab===k?'on':''}" data-r="${k}">${t}</button>`).join('');
    setH(rev,`<div class="rpn"><i class="xnl n1"></i><i class="xnl n2"></i><i class="xnl n3"></i><i class="xnl n4"></i><div class="rhd"><div class="rtt">Xem lại ván</div><button type="button" class="rx" data-r="close" aria-label="Đóng">×</button></div><div class="rtabs">${tabs}</div><div class="rbody">${body}</div><div class="rft"><button type="button" class="tbtn" data-r="back">Về bảng kết quả</button><button type="button" class="tbtn" data-r="close">Xem bản đồ thật</button></div></div>`);
    if(revTab==='log'){ const lg=rev.querySelector('.rlog'); if(lg&&!lg.__s){ lg.__s=1; } } }
  let TG=[0,0,0,0,0], TW=[0,0,0,0,0], tmod=null;
  function trdModal(S,ME,api,P,main){ if(pop!=='offer'||!P||S.phase==='over'){ if(tmod){ tmod.remove(); tmod=null; } return; }
    if(!tmod){ tmod=document.createElement('div'); tmod.id='ktrd'; document.body.appendChild(tmod); tmod.addEventListener('click',e=>{ if(e.target===tmod){ pop=null; render(...lastArgs); return; } onClick(e); }); }
    TG=TG.map((x,r)=>Math.min(x,P.res[r]));
    const V='?v=2026112823y', sg=TG.reduce((a,b)=>a+b,0), sw=TW.reduce((a,b)=>a+b,0);
    if(ot>=0&&(ot===ME||ot>=S.seats.length)) ot=-1;
    const col=(r,isG)=>{ const v=isG?TG[r]:TW[r], has=P.res[r], o=isG?TW[r]:TG[r], canP=isG?has>v&&v<9:v<9;
      return `<div class="tc ${v?'on':''} ${isG&&!has?'none':''}"><div class="ti"><img src="assets/ic-${r}.webp${V}" alt="">${isG?`<i>${has}</i>`:''}</div><b class="tn">${KH_RES[r]}</b>
        <div class="xstep"><button type="button" class="xpm" data-a="${isG?'tgm':'twm'}" data-r="${r}" ${v?'':'disabled'} aria-label="Bớt">−</button><div class="xdv">${v}</div><button type="button" class="xpm" data-a="${isG?'tgp':'twp'}" data-r="${r}" ${canP?'':'disabled'} aria-label="Thêm">+</button></div></div>`; };
    const fmt=v=>v.map((x,r)=>x?`<span class="tq">${x}<img src="assets/ic-${r}.webp${V}" alt="${KH_RES[r]}"></span>`:'').filter(Boolean).join('<em>+</em>');
    const others=S.seats.map((_,i)=>i).filter(i=>i!==ME), ok=main&&sg>0&&sw>0;
    const tgt=`<button type="button" class="tt ${ot<0?'on':''}" data-a="tgt" data-p="-1">Tất cả</button>`+others.map(i=>`<button type="button" class="tt ${ot===i?'on':''}" data-a="tgt" data-p="${i}" style="--pc:${PC[i]}"><i></i>${api.esc(S.seats[i].name)}</button>`).join('');
    const hint=!main?'Chỉ gửi được trong lượt của bạn, sau khi đổ xúc xắc':!sg?'Chọn lá bạn muốn đưa':!sw?'Chọn lá bạn muốn lấy':'';
    morph(tmod,`<div class="xdp trp"><i class="xnl n1"></i><i class="xnl n2"></i><i class="xnl n3"></i><i class="xnl n4"></i><button type="button" class="tx" data-a="closepop" aria-label="Đóng">×</button>
      <div class="xdt">ĐỔI TÀI NGUYÊN</div>
      <div class="tsec give"><div class="tlab">Bạn đưa</div><div class="tg">${[0,1,2,3,4].map(r=>col(r,true)).join('')}</div></div>
      <div class="tsec get"><div class="tlab">Bạn muốn lấy</div><div class="tg">${[0,1,2,3,4].map(r=>col(r,false)).join('')}</div></div>
      <div class="tsum">${sg||sw?`<span class="tl">Đưa</span>${sg?fmt(TG):'<span class="mute">?</span>'}<b class="ta">⇄</b><span class="tl">Lấy</span>${sw?fmt(TW):'<span class="mute">?</span>'}`:'<span class="mute">Bấm + để chọn số lá mỗi loại</span>'}</div>
      <div class="ttg"><span>Gửi cho:</span>${tgt}</div>
      ${hint?`<div class="thint">${hint}</div>`:''}
      <div class="xdb"><button type="button" class="tbtn" data-a="tclr" ${sg||sw?'':'disabled'}>Làm lại</button><button type="button" class="tbtn pri xdok" data-a="offer" ${ok?'':'disabled'}>Gửi yêu cầu đổi</button></div></div>`); }
  let dmod=null, dstat=false, smod=null;
  function statModal(S){ if(!dstat){ if(smod){ smod.remove(); smod=null; } return; }
    if(!smod){ smod=document.createElement('div'); smod.id='kdst'; document.body.appendChild(smod); smod.addEventListener('click',e=>{ dstat=false; statModal(S); }); }
    const h=Array.isArray(S.dh)?S.dh:Array(13).fill(0), tot=h.reduce((a,b)=>a+b,0), W=[0,0,1,2,3,4,5,6,5,4,3,2,1], mx=Math.max(1,...h.slice(2).map((x,i)=>Math.max(x,tot*W[i+2]/36)));
    const cols=[2,3,4,5,6,7,8,9,10,11,12].map(n=>{ const ex=tot*W[n]/36; return `<div class="xsc ${n===7?'s7':''}"><i class="xsn">${h[n]}</i><div class="xsb"><span class="xse" style="height:${Math.round(ex/mx*100)}%"></span><span class="xsv" style="height:${Math.round(h[n]/mx*100)}%"></span></div><b>${n}</b></div>`; }).join('');
    morph(smod,`<div class="xdp xst"><i class="xnl n1"></i><i class="xnl n2"></i><i class="xnl n3"></i><i class="xnl n4"></i><div class="xstt">Thống kê xúc xắc</div><div class="xsts">Ván này đã đổ <b>${tot}</b> lần</div><div class="xsg">${cols}</div><div class="xslg"><span><i class="lv"></i>Số lần đã ra</span><span><i class="le"></i>Mức trung bình theo xác suất</span></div><div class="xsh">Chạm bất kỳ đâu để đóng</div></div>`); }

  function dscModal(S,ME,api,need,P){ if(!need||!P){ if(dmod){ dmod.remove(); dmod=null; } return; }
    if(!dmod){ dmod=document.createElement('div'); dmod.id='kdsc'; document.body.appendChild(dmod); dmod.addEventListener('click',onClick); }
    const sel=dsc.reduce((a,b)=>a+b,0), V='?v=2026112823y';
    const cols=KH_RES.map((nm,r)=>{ const has=P.res[r], n=dsc[r]; return `<div class="xdc ${n?'pick':''} ${has?'':'none'}"><div class="xdi"><img src="assets/ic-${r}.webp${V}" alt=""><i>${has}</i></div><b class="xdn">${nm}</b>
      <div class="xstep"><button type="button" class="xpm" data-a="dplus" data-r="${r}" ${has>n&&sel<need?'':'disabled'} aria-label="Thêm ${nm}">+</button><div class="xdv">${n}</div><button type="button" class="xpm" data-a="dminus" data-r="${r}" ${n?'':'disabled'} aria-label="Bớt ${nm}">−</button></div></div>`; }).join('');
    morph(dmod,`<div class="xdp"><i class="xnl n1"></i><i class="xnl n2"></i><i class="xnl n3"></i><i class="xnl n4"></i><div class="xdt"><img src="assets/robber.webp${V}" alt="">RA SỐ 7!</div>
      <div class="xds">Bạn có <b>${KH.tot(P.res)}</b> lá — phải bỏ <b>${need}</b> lá</div>
      <div class="xdg">${cols}</div>
      <div class="xdpr"><span style="width:${Math.round(sel/need*100)}%"></span><em>Đã chọn ${sel}/${need}</em></div>
      <div class="xdb"><button type="button" class="tbtn" data-a="dauto">Tự chọn</button><button type="button" class="tbtn" data-a="dclr" ${sel?'':'disabled'}>Làm lại</button><button type="button" class="tbtn pri xdok" data-a="ddo" ${sel===need?'':'disabled'}>Bỏ ${need} lá</button></div></div>`); }
  let lastTk=-1; function tickView(S,ME,api){ const el=root&&root.querySelector('.pl.turn .tmr'); if(!el) return; const l=Math.max(0,60-Math.floor((api.now()-S.turnAt)/1000)); el.textContent=l; const low=l<=10&&l>0; el.classList.toggle('low',low); const pl=el.closest('.pl'); if(pl) pl.classList.toggle('lowt',low); if(low&&l!==lastTk&&S.turn===ME&&S.phase!=='over'){ try{ SFX.tone(l<=3?1500:1100,.09,{type:'square',vol:.16}); }catch(e){} } lastTk=l; }
  function onChange(e){ const s=e.target.dataset.s; if(!s) return; const v=+e.target.value; if(s==='g') tg=v; else if(s==='w') tw=v; else if(s==='og') og=v; else if(s==='oq') oq=v; else if(s==='ow') ow=v; else if(s==='on') on=v; else if(s==='ot') ot=v; render(window.__S,Table.API.me(),Table.API); }
  function onClick(e){ const api=Table.API, S=window.__S, ME=api.me(); if(!S) return; const rr=()=>render(S,ME,api);
    const t=e.target.closest('[data-port],[data-v],[data-e],[data-c],[data-h],[data-vic],[data-m],[data-a],[data-dev],[data-pr]'); if(!t) return; const d=t.dataset;
    if (t.disabled) return;
    if (d.v!=null){ mode=null; api.act({t:'town',v:+d.v}); rr(); return; }
    if (d.e!=null){ api.act({t:'road',e:+d.e}); const S2=window.__S; if(!S2.free) mode=null; render(S2,ME,api); return; }
    if (d.c!=null){ mode=null; api.act({t:'city',v:+d.c}); rr(); return; }
    if (d.vic!=null){ api.act({t:'robber',h:robH,v:+d.vic}); robH=null; return; }
    if (d.port!=null){ const i=+d.port, t=S.ports[i], Pm=S.P[ME]; if(!Pm) return; const rp=KH.rates(S,ME); pop='port'; if(t>=0) tg=t; else { const f=Pm.res.findIndex((x,r)=>x>=rp[r]); if(f>=0) tg=f; } if(tw===tg) tw=(tg+1)%5; rr(); return; }
    if (d.h!=null){ if(!(S.turn===ME&&S.step==='robber')) return; const h=+d.h; if(h===S.robber){ say('Hãy chọn ô khác ô hiện tại'); return; }
      const vs=KH.victims(S,h,ME); if(vs.length>1){ robH=h; rr(); } else api.act({t:'robber',h,v:vs[0]}); return; }
    SFX.pop();
    if (d.m){ mode = mode===d.m?null:d.m; rr(); return; }
    if (d.dev){ if(d.dev==='knight') api.act({t:'knight'}); else if(d.dev==='road') api.act({t:'roaddev'}); else { dsel=d.dev; DP=[]; rr(); } return; }
    if (d.pr!=null){ const r=+d.pr; if(dsel==='mono'){ api.act({t:'mono',r}); dsel=null; } else { DP.push(r); if(DP.length===2){ api.act({t:'plenty',r1:DP[0],r2:DP[1]}); dsel=null; } else say('Đã chọn '+KH_RES[r]+', chọn thêm 1 lá'); } return; }
    const a=d.a; if(a==='dstat'){ dstat=!dstat; rr(); return; }
    if(a==='dplus'||a==='dminus'){ const Pm=ME>=0?S.P[ME]:null, nd=S.disc&&S.disc[ME]; if(!Pm||!nd) return; const r=+d.r, sel=dsc.reduce((x,y)=>x+y,0); if(a==='dplus'){ if(sel>=nd){ say('Đã chọn đủ '+nd+' lá — bấm nút Bỏ lá'); return; } if(dsc[r]>=Pm.res[r]) return; dsc[r]++; } else { if(dsc[r]<=0) return; dsc[r]--; } rr(); return; }
    if(a==='dpick'){ const Pm=ME>=0?S.P[ME]:null, nd=S.disc&&S.disc[ME]; if(!Pm||!nd) return; const r=+d.r, sel=dsc.reduce((x,y)=>x+y,0); if(sel>=nd){ say('Đã chọn đủ '+nd+' lá — bấm Bỏ lá để xác nhận'); return; } if(dsc[r]>=Pm.res[r]) return; dsc[r]++; rr(); return; }
    if(a==='dclr'){ dsc=[0,0,0,0,0]; rr(); return; }
    if(a==='dauto'){ const Pm=S.P[ME], nd=S.disc&&S.disc[ME]; if(Pm&&nd){ dsc=KH.autoLost(Pm,nd); rr(); } return; }
    if(a==='ddo'){ const nd=S.disc&&S.disc[ME]; if(nd&&dsc.reduce((x,y)=>x+y,0)===nd){ api.act({t:'discard',res:dsc.slice()}); dsc=[0,0,0,0,0]; } return; }
    if (a==='closepop'){ pop=null; rr(); return; } if(a==='dcancel'){ dsel=null; rr(); return; } if(a==='again'){ api.rematch(); return; }
    if (a==='res'){ const r=+d.r, Pm=ME>=0?S.P[ME]:null; if(!Pm||Pm.res[r]<1){ say('Bạn chưa có '+KH_RES[r]+' để đổi'); return; } TG=[0,0,0,0,0]; TW=[0,0,0,0,0]; TG[r]=1; pop='offer'; rr(); return; }
    if (a==='pop'){ pop=pop===d.k?null:d.k; if(pop==='offer'){ TG=[0,0,0,0,0]; TW=[0,0,0,0,0]; } rr(); return; }
    if (a==='bg'){ tg=+d.r; if(tw===tg) tw=(tg+1)%5; rr(); return; }
    if (a==='bw'){ tw=+d.r; rr(); return; }
    if (a==='og'){ og=+d.r; if(ow===og) ow=(og+1)%5; rr(); return; }
    if (a==='ow'){ ow=+d.r; if(og===ow) og=(ow+1)%5; rr(); return; }
    if (a==='trade'){ api.act({t:'trade',give:tg,get:tw,bank:pop==='bank'}); pop=null; return; }
    if (a==='offerto'){ ot=+d.p; pop='offer'; rr(); return; }
    if (a==='offer'){ if(!TG.some(x=>x)||!TW.some(x=>x)) return; api.act({t:'offer',give:TG.slice(),get:TW.slice(),to:ot}); TG=[0,0,0,0,0]; TW=[0,0,0,0,0]; pop=null; rr(); return; }
    if (a==='tgp'||a==='tgm'||a==='twp'||a==='twm'){ const r=+d.r, Pm=ME>=0?S.P[ME]:null; if(!Pm) return; const V=a[1]==='g'?TG:TW, O=a[1]==='g'?TW:TG;
      if(a[2]==='p'){ if(a[1]==='g'&&V[r]>=Pm.res[r]) return; if(V[r]>=9) return; if(O[r]) O[r]=0; V[r]++; } else { if(V[r]<=0) return; V[r]--; } rr(); return; }
    if (a==='tgt'){ ot=+d.p; rr(); return; }
    if (a==='tclr'){ TG=[0,0,0,0,0]; TW=[0,0,0,0,0]; rr(); return; }
    if (a==='yes'||a==='no'){ api.act({t:'answer',ok:a==='yes'}); return; }
    if (a) api.act({t:a}); }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
