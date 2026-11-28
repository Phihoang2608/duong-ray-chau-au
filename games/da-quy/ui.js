/* ===================== GIAO DIỆN THƯƠNG NHÂN ĐÁ QUÝ ===================== */
const DQUI=(()=>{
  const LVN={1:'Trang sức nhỏ',2:'Đồ quý',3:'Báu vật'};
  const PCOL=['#8b3dd9','#e0631a','#0e8fa8','#d6336c'], PCN=['Tím','Cam','Ngọc lam','Hồng'];
  const GN=['Lục bảo','Lam ngọc','Hồng ngọc','Kim cương','Hắc ngọc','Vàng'];
  let root=null, sel=[], pick=null, seen=new Set(), lastEv=null, first=true;
  const $=s=>document.querySelector(s);
  const A=DQART;
  function validTake(S){ if(!sel.length) return false; if(sel.length===2&&sel[0]===sel[1]) return S.bank[sel[0]]>=4; const avail=[0,1,2,3,4].filter(c=>S.bank[c]>0).length; return sel.length===Math.min(3,avail); }
  function cardEl(id, attrs, cls){ return `<div class="dqc ${cls||''}" data-cid="${id}" ${attrs||''}>${A.card(id)}</div>`; }
  // phóng to lá bài / quý tộc: chuột phải hoặc giữ lâu (điện thoại)
  function zoomEl(el){ let ov=document.getElementById('dqzoom'); if(!ov){ ov=document.createElement('div'); ov.id='dqzoom'; document.body.appendChild(ov); ov.addEventListener('click',()=>ov.classList.remove('on')); }
    if(el.dataset.cid!=null){ const id=+el.dataset.cid, C=DQ.CARDS[id];
      ov.innerHTML=`<div class="zc">${A.card(id)}</div><div class="zi"><b>${A.jewelName(id)}</b><span>Cấp ${['','I','II','III'][C.lv]} · ${C.pts?C.pts+' điểm':'0 điểm'} · thưởng ${DQ_COL[C.col]}</span><small>Bấm ra ngoài để đóng</small></div>`; }
    else if(el.dataset.nb!=null){ const id=+el.dataset.nb;
      ov.innerHTML=`<div class="zn">${A.noble(id)}</div><div class="zi"><b>${DQ.NOBLE_NAMES[id]}</b><span>Quý tộc · 3 điểm · ghé thăm khi đủ thẻ thưởng</span><small>Bấm ra ngoài để đóng</small></div>`; }
    else return; ov.classList.add('on'); }
  // ---------- hiệu ứng bay ----------
  function morph(par,html){ const t=document.createElement('template'); t.innerHTML=html; syncKids(par,t.content); }
  function syncKids(a,b){ const A=a.childNodes, B=b.childNodes; let i=0;
    for(;i<B.length;i++){ const o=A[i], n=B[i]; if(!o){ a.appendChild(n.cloneNode(true)); continue; }
      if(o.isEqualNode(n)) continue;
      if(o.nodeType!==n.nodeType||o.nodeName!==n.nodeName||o.nodeType!==1||(o.namespaceURI!==n.namespaceURI)||o.nodeName==='svg'&&o.childNodes.length!==n.childNodes.length){ a.replaceChild(n.cloneNode(true),o); continue; }
      if(o.nodeType===3){ o.nodeValue=n.nodeValue; continue; }
      const oa=o.attributes, na=n.attributes; for(let k=oa.length-1;k>=0;k--){ const at=oa[k]; if(!n.hasAttribute(at.name)) o.removeAttribute(at.name); }
      for(let k=0;k<na.length;k++){ const at=na[k]; if(o.getAttribute(at.name)!==at.value) o.setAttribute(at.name,at.value); }
      syncKids(o,n); }
    while(A.length>B.length) a.removeChild(a.lastChild); }
  const LITE=()=>document.documentElement.classList.contains('dqlite');
  const _anim=Element.prototype.animate; if(!Element.prototype.__dqw){ Element.prototype.__dqw=1; Element.prototype.animate=function(kf,o){ if(document.documentElement.classList.contains('dqoff')&&this.closest&&this.closest('#dq,.dqfly,.dqbp,.dqpp,.dqgain,.dqsp,body')){ o=typeof o==='number'?1:Object.assign({},o,{duration:1,delay:0}); } return _anim.call(this,liteKF(kf),o); }; }
  function liteKF(kf){ return LITE()&&Array.isArray(kf)?kf.map(f=>{ if(!f||f.filter==null) return f; const g=Object.assign({},f); delete g.filter; return g; }):kf; }
  function fly(from, to, html, w, h, delay, done){ if(!from||!to) return; const el=document.createElement('div'); el.className='dqfly'; el.innerHTML=html;
    const x0=from.left+from.width/2-w/2, y0=from.top+from.height/2-h/2, x1=to.left+to.width/2-w/2, y1=to.top+to.height/2-h/2;
    Object.assign(el.style,{left:x0+'px',top:y0+'px',width:w+'px',height:h+'px'}); document.body.appendChild(el);
    const mx=(x1-x0)/2, my=(y1-y0)/2-Math.min(160,Math.abs(x1-x0)*.25+60);
    const an=el.animate([{transform:'translate(0,0) scale(1) rotate(0)',opacity:1},{transform:`translate(${mx}px,${my}px) scale(1.25) rotate(${(Math.random()-.5)*30}deg)`,opacity:1,offset:.45},{transform:`translate(${x1-x0}px,${y1-y0}px) scale(.45) rotate(0)`,opacity:.2}],{duration:850,delay:delay||0,easing:'cubic-bezier(.4,.1,.3,1)',fill:'both'});
    an.onfinish=()=>{ el.remove(); done&&done(); }; }
  function bagPop(seat,list,delay){ setTimeout(()=>{ const bg=root&&root.querySelector(`.pl[data-p="${seat}"] .bag`); if(!bg) return; const r=bg.getBoundingClientRect();
      const box=document.createElement('div'); box.className='dqbp'; box.innerHTML=list.map(x=>`<span>${x.n>0?'+':''}${x.n}${A.gemSVG(x.c,16,x.c)}</span>`).join('');
      document.body.appendChild(box); const bw=box.offsetWidth, bh=box.offsetHeight; box.style.left=Math.max(4,r.left+r.width/2-bw/2)+'px'; box.style.top=(r.top+r.height*.35-bh)+'px';
      box.animate([{opacity:0,transform:'translateY(6px) scale(.8)'},{opacity:1,transform:'translateY(-14px) scale(1)',offset:.18},{opacity:1,transform:'translateY(-22px)',offset:.75},{opacity:0,transform:'translateY(-34px)'}],{duration:2000,easing:'ease-out',fill:'both'}).onfinish=()=>box.remove(); },delay||0); }
  const WOB={};
  const landQ=()=>{ try{ document.documentElement.classList.toggle('dqland',matchMedia('(orientation:landscape) and (max-height:500px)').matches); }catch(e){} }; landQ(); addEventListener('resize',landQ);
  const FXN={full:'✨ Hiệu ứng: Đầy đủ',lite:'🌙 Hiệu ứng: Nhẹ',off:'⚡ Hiệu ứng: Tắt'};
  function fxMode(){ let m=null; try{ m=localStorage.getItem('dq-fx'); }catch(e){} if(m&&FXN[m]) return m; return 'lite'; }
  function applyFx(){ const m=fxMode(), d=document.documentElement; d.classList.toggle('dqlite',m!=='full'); d.classList.toggle('dqoff',m==='off');
    const b=document.getElementById('dq-fx'); if(b) b.textContent=FXN[m]; document.querySelectorAll('[data-tool=fx]').forEach(x=>x.textContent=m==='full'?'✨':m==='lite'?'🌙':'⚡'); }
  function cycleFx(){ const m=fxMode(), n=m==='full'?'lite':m==='lite'?'off':'full'; try{ localStorage.setItem('dq-fx',n); }catch(e){} applyFx(); Table.API.toast(FXN[n]+(n==='full'?' — đẹp nhất':n==='lite'?' — tắt ánh sáng nặng, vẫn có chuyển động':' — không chuyển động, mượt nhất cho máy yếu')); }
  applyFx();
  function buyFly(from,seat,id,done,fromRes){ const pl=root&&root.querySelector(`.pl[data-p="${seat}"]`); if(!from||!pl) return; const C=DQ.CARDS[id];
    const wob=()=>{ WOB[seat+'_'+C.col]=Date.now()+900; const t2=root.querySelector(`.pl[data-p="${seat}"] [data-bc="${C.col}"]`); if(t2){ t2.classList.remove('wob'); void t2.offsetWidth; t2.classList.add('wob'); t2.animate([{transform:'rotate(0) scale(1)'},{transform:'rotate(-14deg) scale(1.2)'},{transform:'rotate(12deg) scale(1.2)'},{transform:'rotate(-9deg) scale(1.12)'},{transform:'rotate(6deg) scale(1.06)'},{transform:'rotate(0) scale(1)'}],{duration:700,easing:'ease-out'}); sparkle(t2.getBoundingClientRect(),12,A.PAL[C.col][1]); } };
    let w=from.width, h=from.height; if(fromRes&&(w<60)){ w=60; h=84; }
    const el=document.createElement('div'); el.className='dqfly'; el.innerHTML=A.card(id); Object.assign(el.style,{left:(from.left+from.width/2-w/2)+'px',top:(from.top+from.height/2-h/2)+'px',width:w+'px',height:h+'px',zIndex:9999}); document.body.appendChild(el);
    const glow='brightness(1.2) drop-shadow(0 0 16px #ffe27a)';
    if(fromRes){ ting(); const rr=el.getBoundingClientRect(); sparkle(rr,18,'#fff6c8'); setTimeout(()=>sparkle(rr,14,A.PAL[C.col][1]),350);
      el.animate([{transform:'scale(1) rotate(0)',opacity:1,filter:'brightness(1)'},{transform:'scale(1.8) rotate(180deg)',opacity:1,filter:glow,offset:.3},{transform:'scale(1.6) rotate(540deg)',opacity:.75,filter:glow,offset:.65},{transform:'scale(.3) rotate(900deg)',opacity:0,filter:'brightness(2)'}],{duration:1500,easing:'ease-in-out',fill:'both'}).onfinish=()=>{ el.remove(); wob(); done&&done(); }; return; }
    const tg=pl.querySelector(`[data-bc="${C.col}"]`)||pl, to=tg.getBoundingClientRect();
    const dx=to.left+to.width/2-(from.left+from.width/2), dy=to.top+to.height/2-(from.top+from.height/2), sc=Math.max(.15,to.height/h);
    el.animate([{transform:'translate(0,0) scale(1) rotate(0)',filter:'brightness(1)'},{transform:'translate(0,-10px) scale(1.3) rotate(0)',filter:glow,offset:.25},{transform:'translate(0,-10px) scale(1.3) rotate(0)',filter:glow,offset:.4},{transform:`translate(${dx*.5}px,${dy*.5-40}px) scale(.8) rotate(360deg)`,filter:glow,offset:.72},{transform:`translate(${dx}px,${dy}px) scale(${sc}) rotate(720deg)`,filter:'brightness(1)',opacity:.6}],{duration:1400,easing:'cubic-bezier(.45,.05,.3,1)',fill:'both'}).onfinish=()=>{ el.remove(); wob(); done&&done(); }; }
  function ptsPop(seat,n){ const e=root&&root.querySelector(`.pl[data-p="${seat}"] .pts`); if(!e) return; const r=e.getBoundingClientRect(); const b=document.createElement('div'); b.className='dqpp'; b.textContent='+'+n; document.body.appendChild(b);
    b.style.left=(r.left+r.width/2-b.offsetWidth/2)+'px'; b.style.top=(r.top-4)+'px'; b.animate([{opacity:0,transform:'translateY(8px) scale(.6)'},{opacity:1,transform:'translateY(-10px) scale(1.15)',offset:.25},{opacity:1,transform:'translateY(-16px) scale(1)',offset:.7},{opacity:0,transform:'translateY(-30px)'}],{duration:1400,easing:'ease-out',fill:'both'}).onfinish=()=>b.remove();
    e.animate([{transform:'scale(1)'},{transform:'scale(1.45)',color:'#fff6b0'},{transform:'scale(1)'}],{duration:600,easing:'ease-out'}); ting(); }
  function gain(seat,items,delay){ setTimeout(()=>{ const pl=root&&root.querySelector(`.pl[data-p="${seat}"]`); if(!pl) return; const r=pl.getBoundingClientRect();
      const box=document.createElement('div'); box.className='dqgain'; box.innerHTML=items.map(it=>`<div class="gi ${it.cls||''}">${it.icon||''}<b>${it.t}</b></div>`).join('');
      document.body.appendChild(box); const bw=box.offsetWidth, bh=box.offsetHeight;
      let x=r.left-bw-10; if(x<6) x=Math.min(innerWidth-bw-6,r.right+10); box.style.left=x+'px'; box.style.top=Math.max(6,Math.min(innerHeight-bh-6,r.top+r.height/2-bh/2))+'px';
      box.animate([{opacity:0,transform:'translateX(12px) scale(.85)'},{opacity:1,transform:'translateX(0) scale(1)',offset:.12},{opacity:1,transform:'translateY(0)',offset:.8},{opacity:0,transform:'translateY(-26px)'}],{duration:2600,easing:'ease-out',fill:'both'}).onfinish=()=>box.remove(); },delay||0); }
  function showCard(seat,id,delay,items){ setTimeout(()=>{ const pl=root&&root.querySelector(`.pl[data-p="${seat}"]`); if(!pl) return; const r=pl.getBoundingClientRect();
      const el=document.createElement('div'); el.className='dqshow'; el.innerHTML=`<div class="sc">${A.card(id)}</div>`+(items?`<div class="dqgain in">${items.map(it=>`<div class="gi ${it.cls||''}">${it.icon||''}<b>${it.t}</b></div>`).join('')}</div>`:''); document.body.appendChild(el); const w=el.offsetWidth,h=el.offsetHeight;
      let x=r.left-w-14; if(x<6) x=Math.min(innerWidth-w-6,r.right+14); el.style.left=x+'px'; el.style.top=Math.max(6,Math.min(innerHeight-h-6,r.top+r.height/2-h/2))+'px';
      el.animate([{opacity:0,transform:'scale(.6) rotate(-6deg)'},{opacity:1,transform:'scale(1.04) rotate(0)',offset:.12},{opacity:1,transform:'scale(1)',offset:.2},{opacity:1,transform:'scale(1)',offset:.85},{opacity:0,transform:'translate(40px,0) scale(.5)'}],{duration:2600,easing:'ease-out',fill:'both'}).onfinish=()=>el.remove(); },delay||0); }
  function sparkle(rect,n,col){ if(!rect||document.documentElement.classList.contains('dqoff')) return; n=n||14; if(LITE()) n=Math.ceil(n/3); for(let i=0;i<n;i++){ const p=document.createElement('div'); p.className='dqsp'; p.style.background=col||'#fff6c8'; p.style.left=(rect.left+rect.width/2)+'px'; p.style.top=(rect.top+rect.height/2)+'px'; document.body.appendChild(p);
      const a=Math.random()*Math.PI*2, d=30+Math.random()*60; p.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(.2)`,opacity:0}],{duration:700+Math.random()*400,easing:'ease-out'}).onfinish=()=>p.remove(); } }
  function bump(seat){ return ()=>{ const b=root.querySelector(`.pl[data-p="${seat}"] .bag`); if(b){ b.animate([{transform:'scale(1)'},{transform:'scale(1.25,.85)'},{transform:'scale(.92,1.1)'},{transform:'scale(1)'}],{duration:450}); sparkle(b.getBoundingClientRect(),10); } }; }
  function rectOf(sel){ const e=root&&root.querySelector(sel); return e?e.getBoundingClientRect():null; }
  function fit(){ if(!root) return; const top=root.getBoundingClientRect().top+scrollY; root.style.setProperty('--H',Math.max(560,innerHeight-top-8)+'px'); root.style.setProperty('--HL',Math.max(240,innerHeight-top-4)+'px'); }
  addEventListener('resize',()=>{ if(window.__S) render(window.__S,Table.API.me(),Table.API); });
  const GS={buf:{},ld:false,
    load(){ if(this.ld||!SFX.ctx) return; this.ld=true; ['chip-lay-1','chip-lay-2','chip-lay-3','chips-collide-1','chips-collide-2','chips-collide-3','chips-collide-4','glass_002','glass_003'].forEach(n=>fetch('assets/sfx/'+n+'.mp3').then(r=>r.arrayBuffer()).then(a=>SFX.ctx.decodeAudioData(a)).then(b=>this.buf[n]=b).catch(()=>{})); },
    play(n,vol,at,rate){ if(!SFX.ok||!SFX.ok()) return false; const b=this.buf[n]; if(!b) return false; const c=SFX.ctx,s=c.createBufferSource(),g=c.createGain(); s.buffer=b; s.playbackRate.value=rate||1; g.gain.value=vol; s.connect(g); g.connect(SFX.master); s.start(c.currentTime+(at||0)); return true; },
    pick(){ this.load(); const r=.95+Math.random()*.12; if(!this.play('chip-lay-'+(1+Math.floor(Math.random()*3)),.75,0,r)) SFX.stone(0,.8); else this.play('glass_00'+(2+Math.floor(Math.random()*2)),.12,0,1.3); },
    take(n){ this.load(); for(let i=0;i<n;i++){ const at=i*.17, r=.93+Math.random()*.14; if(!this.play('chips-collide-'+(1+Math.floor(Math.random()*4)),.8,at,r)){ SFX.clack(n); return; } this.play('glass_00'+(2+(i%2)),.14,at+.02,1.2+Math.random()*.2); } } };
  document.addEventListener('pointerdown',()=>{ SFX.init&&SFX.init(); setTimeout(()=>GS.load(),50); },{once:true});
  function clockSVG(el,big){ const left=Math.max(0,60-el), R=40, C=(2*Math.PI*R).toFixed(2);
    const ticks=[...Array(60)].map((_,k)=>{ const a=k*6*Math.PI/180, L=k%5?2.2:5, r1=34, r2=r1-L; return `<line x1="${(50+r1*Math.sin(a)).toFixed(2)}" y1="${(50-r1*Math.cos(a)).toFixed(2)}" x2="${(50+r2*Math.sin(a)).toFixed(2)}" y2="${(50-r2*Math.cos(a)).toFixed(2)}" stroke="${k%5?'#c9a55a':'#ffe9a8'}" stroke-width="${k%5?.6:1.4}"/>`; }).join('');
    const rn=[60,50,40,30,20,10].map((t,k)=>{ const a=k*60*Math.PI/180; return `<text x="${(50+24.5*Math.sin(a)).toFixed(1)}" y="${(50-24.5*Math.cos(a)+2.6).toFixed(1)}" class="ckn">${t}</text>`; }).join('');
    const pearls=[...Array(24)].map((_,k)=>{ const a=k*15*Math.PI/180; return `<circle cx="${(50+46.5*Math.sin(a)).toFixed(2)}" cy="${(50-46.5*Math.cos(a)).toFixed(2)}" r="${k%6?1.1:2}" fill="${k%6?'#fff6d8':'#e0115f'}" stroke="${k%6?'none':'#ffd9e6'}" stroke-width=".4"/>`; }).join('');
    return `<svg viewBox="-4 -19 108 123" class="ckw ${big?'big':''} ${left<=10?'low':''}" data-el="${el}">
<defs><radialGradient id="ckF" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#4a1630"/><stop offset=".7" stop-color="#22091a"/><stop offset="1" stop-color="#0d0309"/></radialGradient>
<linearGradient id="ckG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset=".3" stop-color="#e2b13c"/><stop offset=".55" stop-color="#8a5a12"/><stop offset=".8" stop-color="#f4cf68"/><stop offset="1" stop-color="#6b420b"/></linearGradient>
<radialGradient id="ckRb" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffc2d6"/><stop offset=".45" stop-color="#e0115f"/><stop offset="1" stop-color="#5c0020"/></radialGradient></defs>
<g class="ckcrown"><path d="M34 -2 L36 -12 L42 -5 L50 -15 L58 -5 L64 -12 L66 -2 Z" fill="url(#ckG)" stroke="#5a3a08" stroke-width=".8"/><rect x="33" y="-3" width="34" height="4" rx="1.5" fill="url(#ckG)" stroke="#5a3a08" stroke-width=".6"/><circle cx="50" cy="-15" r="2.2" fill="url(#ckRb)"/><circle cx="36" cy="-12" r="1.5" fill="#7dd3fc"/><circle cx="64" cy="-12" r="1.5" fill="#7dd3fc"/><circle cx="50" cy="-1" r="1.6" fill="#34d399"/></g>
<path d="M6 76 Q-2 92 14 98 Q10 88 18 84 Z M94 76 Q102 92 86 98 Q90 88 82 84 Z" fill="url(#ckG)" stroke="#5a3a08" stroke-width=".6"/>
<circle cx="50" cy="50" r="49" fill="url(#ckG)" stroke="#4a2e06" stroke-width="1"/>${pearls}
<circle cx="50" cy="50" r="44" fill="#1a0610" stroke="#6b420b" stroke-width="1"/>
<circle cx="50" cy="50" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/>
<circle class="ckarc" cx="50" cy="50" r="${R}" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C}" style="--C:${C};animation-delay:-${el}s" transform="rotate(-90 50 50)"/>
<circle cx="50" cy="50" r="36.5" fill="url(#ckF)" stroke="url(#ckG)" stroke-width="1.6"/>
<g opacity=".25" stroke="#e2b13c" stroke-width=".5" fill="none"><path d="M50 18 Q60 34 50 50 Q40 34 50 18Z M82 50 Q66 60 50 50 Q66 40 82 50Z M50 82 Q40 66 50 50 Q60 66 50 82Z M18 50 Q34 40 50 50 Q34 60 18 50Z"/></g>
${ticks}${rn}
<g class="ckhand" style="animation-delay:-${el}s"><path d="M48.6 50 L49.3 24 L50.7 24 L51.4 50 Z" fill="url(#ckG)" stroke="#2a1702" stroke-width=".7"/><path d="M50 12 Q46.5 18 48.3 23 Q45 20 43 22.5 Q46.5 25.5 50 28.5 Q53.5 25.5 57 22.5 Q55 20 51.7 23 Q53.5 18 50 12Z" fill="url(#ckG)" stroke="#2a1702" stroke-width=".6"/><circle cx="50" cy="36" r="2.6" fill="none" stroke="#ffe9a8" stroke-width="1.1"/><path d="M48.8 50 L46.5 60 Q50 63 53.5 60 L51.2 50Z" fill="url(#ckG)" stroke="#2a1702" stroke-width=".6"/><circle cx="50" cy="59" r="1.6" fill="url(#ckRb)"/></g>
<circle cx="50" cy="50" r="4.2" fill="url(#ckG)" stroke="#5a3a08" stroke-width=".5"/><circle cx="50" cy="50" r="2.6" fill="url(#ckRb)"/><circle cx="49.2" cy="49.2" r=".8" fill="#fff"/>
<g class="ckdig"><rect x="36" y="58" width="28" height="15" rx="7.5" fill="#0d0309" stroke="url(#ckG)" stroke-width=".9"/><text x="50" y="69.6" class="ckt">${left}</text></g>
</svg>`; }
  function lastBanner(S,ev,ME){ const n=S.seats.length, left=((S.first||0)-1-ev.seat+2*n)%n, nm=S.seats[ev.seat].name;
    const b=document.createElement('div'); b.className='dqlast';
    b.innerHTML=`<div class="t">⚜ VÒNG CUỐI ⚜</div><div class="m"><b>${Table.API.esc(nm)}</b> đã đạt <b>${ev.pts} điểm</b>!</div><div class="s">${left>0?`Còn <b>${left}</b> lượt nữa — mọi người đi nốt vòng này rồi kết thúc.`:'Đây là lượt cuối cùng — tính điểm ngay!'}</div>`;
    document.body.appendChild(b); setTimeout(()=>b.classList.add('out'),3600); setTimeout(()=>b.remove(),4200);
    if(SFX.ok&&SFX.ok()){ [523,659,784,1047].forEach((f,i)=>SFX.tone(f,.35,{vol:.12,at:i*.13,type:'triangle'})); } }
  function logH(l,api){ let h=api.esc(l); DQ_COL.forEach((n,c)=>{ h=h.split(n).join(`<span class="lg">${A.gemSVG(c,18,c)}<b class="lg${c}">${n}</b></span>`); }); return h; }
  function showHist(){ const api=Table.API, S=window.__S; if(!S) return; const L=S.log; api.modal('📜 Lịch sử ván chơi', `<div class="dqhist">${L.map((l,i)=>`<div><i>${L.length-i}</i>${logH(l,api)}</div>`).join('')}</div>`, [{t:'Đóng',pri:1}]); }

  /* ===================== TỔNG KẾT VÁN: bảng xếp hạng + xem lại chi tiết ===================== */
  let VSHOWN='', ME_=0;
  const GEMN=['Lục bảo','Lam ngọc','Hồng ngọc','Kim cương','Hắc ngọc','Vàng'];
  function fmtT(ms){ ms=Math.max(0,ms|0); const s=Math.round(ms/1000), m=Math.floor(s/60); return m? m+' phút '+(s%60)+' giây' : s+' giây'; }
  function dqvCSS(){ if(document.getElementById('dqv-css')) return; const st=document.createElement('style'); st.id='dqv-css'; st.textContent=`
#dqv,#dqr{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(18,4,10,.72);backdrop-filter:blur(3px);animation:dqvIn .35s both}
@keyframes dqvIn{from{opacity:0}}
.dqvp{position:relative;width:min(560px,100%);max-height:100%;overflow:auto;border-radius:20px;padding:20px 20px 16px;color:#fbe9c8;
  background:linear-gradient(170deg,rgba(122,26,54,.95),rgba(70,9,31,.97) 75%),url(assets/damask.svg) center/110px repeat,#5a0f25;
  border:2px solid #d9b25a;box-shadow:inset 0 0 0 5px rgba(0,0,0,.25),inset 0 0 0 6px rgba(246,214,128,.4),0 24px 60px rgba(0,0,0,.7);animation:dqvPop .5s cubic-bezier(.2,1.4,.4,1) both}
@keyframes dqvPop{from{transform:scale(.7) translateY(30px);opacity:0}}
.dqvp h2{margin:0;text-align:center;font-size:34px;color:#f6d680;text-shadow:0 3px 0 #2a0610,0 0 18px rgba(246,214,128,.35)}
.dqvp .crown{text-align:center;font-size:44px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5))}
.dqvp .wsub{text-align:center;margin:4px 0 12px;font-style:italic;color:#f3dcb4}
.dqvp .rk{display:flex;align-items:center;gap:10px;margin:7px 0;padding:8px 12px;border-radius:14px;background:rgba(0,0,0,.25);border:1px solid rgba(217,178,90,.45)}
.dqvp .rk.w{background:linear-gradient(90deg,rgba(246,214,128,.35),rgba(246,214,128,.08));border-color:#f6d680;box-shadow:0 0 18px rgba(246,214,128,.25)}
.dqvp .rk .n{flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;background:#3a0a18;border:2px solid #d9b25a;color:#f6d680}
.dqvp .rk.w .n{background:linear-gradient(180deg,#fbe7a8,#c9922e);color:#3a1a08}
.dqvp .rk .nm{flex:1;font-weight:bold;font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dqvp .rk .nm small{display:block;font-weight:normal;font-size:12.5px;color:#e9cf98}
.dqvp .rk .p{font-size:26px;font-weight:bold;color:#f6d680;min-width:44px;text-align:right}
.dqvp .rk .p small{font-size:12px;color:#e9cf98;font-weight:normal}
.dqvp .bts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px}
.dqvp .bts button{font:bold 15.5px "Times New Roman",serif;padding:9px 18px;border-radius:999px;cursor:pointer;color:#fbe9b8;background:linear-gradient(180deg,#8b2340,#5a0f25);border:1.5px solid #d9b25a}
.dqvp .bts button.pri{background:linear-gradient(180deg,#fbe7a8,#e3b553 55%,#b98522);color:#3a1a08;border-color:#7a5310;box-shadow:inset 0 1px 0 #fff6cf,0 3px 0 #4a2a0c}
.dqvp .x{position:absolute;right:10px;top:8px;width:34px;height:34px;border-radius:50%;border:1.5px solid #d9b25a;background:#3a0a18;color:#f6d680;font-size:18px;cursor:pointer}
#dqr .dqvp{width:min(980px,100%);height:min(720px,100%);display:flex;flex-direction:column;padding:16px}
#dqr h2{font-size:26px}
.dqtabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:10px 0}
.dqtabs button{font:bold 14.5px "Times New Roman",serif;padding:6px 14px;border-radius:999px;cursor:pointer;color:#fbe9b8;background:rgba(0,0,0,.25);border:1.5px solid rgba(217,178,90,.6)}
.dqtabs button.on{background:linear-gradient(180deg,#fbe7a8,#e3b553 55%,#b98522);color:#3a1a08;border-color:#7a5310}
.dqbody{flex:1;overflow:auto;background:#fbf3df;color:#2b2116;border-radius:12px;padding:12px;border:2px solid #b98a3a}
.dqbody table{width:100%;border-collapse:separate;border-spacing:0;font-size:14.5px}
.dqbody th{position:sticky;top:-12px;background:#7a1a36;color:#f6d680;padding:7px 8px;text-align:center;font-weight:bold}
.dqbody th:first-child,.dqbody td:first-child{text-align:left}
.dqbody td{padding:6px 8px;border-top:1px solid #ead2a2;text-align:center}
.dqbody tr:nth-child(even) td{background:#f6ead0}
.dqbody .sec{font-weight:bold;color:#7a1a36;background:#f3e3bf!important;text-align:left!important}
.dqbody .gm{display:inline-flex;align-items:center;gap:2px;margin:0 3px}
.dqbody .gm svg{width:18px;height:18px;vertical-align:middle}
.dqbody .who{font-weight:bold}
.dqbody .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:0}
.dqbody .lg svg{width:16px;height:16px;vertical-align:-3px}
.dqhrow{display:flex;gap:6px;padding:4px 2px;border-bottom:1px dashed #e0c896;font-size:14.5px}
.dqhrow i{flex:none;width:32px;color:#8a6a3a;font-style:normal;text-align:right}
.dqpl{margin:0 0 14px}
.dqpl h4{margin:0 0 6px;font-size:17px;color:#7a1a36}
.dqcards{display:flex;flex-wrap:wrap;gap:6px}
.dqcards .c{width:66px;height:92px;border-radius:6px;overflow:hidden;box-shadow:0 2px 5px rgba(0,0,0,.35);background:#5a0f25}
.dqcards .c svg{width:100%;height:100%;display:block}
.dqcards .nb{width:70px;height:70px}
.dqchart{width:100%;height:auto;background:#fffaf0;border-radius:10px;border:1px solid #e0c896}
.dqleg{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:6px;font-weight:bold}
.dqbody td:first-child{min-width:120px}
@media (max-width:600px){.dqbody td:first-child{min-width:96px}.dqbody .gm svg{width:14px;height:14px}.dqbody .gm{margin:0 1px}.dqvp h2{font-size:27px}.dqvp .rk .p{font-size:22px}.dqbody{padding:8px}.dqbody table{font-size:13px}.dqbody td,.dqbody th{padding:5px 4px}.dqcards .c{width:52px;height:72px}}
`; document.head.appendChild(st); }
  function showVictory(S,ME,api,force){ if(!S||S.phase!=='over') return; dqvCSS(); const old=document.getElementById('dqv'); if(old) old.remove();
    const order=S.order||S.seats.map((_,i)=>i).sort((a,b)=>S.P[b].pts-S.P[a].pts); const w=S.winner, esc=api.esc;
    const rows=order.map((i,k)=>{ const P=S.P[i]; return `<div class="rk ${i===w?'w':''}"><span class="n">${k+1}</span><span class="nm">${esc(S.seats[i].name)}${i===ME?' (bạn)':''}<small>${P.cards.length} thẻ · ${P.nobles.length} quý tộc${P.res.length?' · '+P.res.length+' thẻ giữ chỗ':''}</small></span><span class="p">${P.pts}<small> điểm</small></span></div>`; }).join('');
    const dur=S.tEnd&&S.t0?fmtT(S.tEnd-S.t0):'';
    const v=document.createElement('div'); v.id='dqv';
    v.innerHTML=`<div class="dqvp"><button class="x" data-v="close" title="Đóng">✕</button><div class="crown">👑</div><h2>${w===ME?'Chúc mừng bạn!':esc(S.seats[w].name)+' chiến thắng!'}</h2>
      <p class="wsub">${w===ME?'Bạn':esc(S.seats[w].name)} trở thành thương nhân đá quý danh tiếng nhất với ${S.P[w].pts} điểm uy tín${dur?' · ván dài '+dur:''}${S.round?' · '+S.round+' vòng':''}.</p>
      ${rows}<div class="bts">${api.mode()!=='client'?'<button class="pri" data-v="again">▶ Chơi ván mới</button>':''}<button data-v="review">📊 Kết quả ván</button><button data-v="close">Xem bàn chơi</button></div></div>`;
    document.body.appendChild(v);
    v.addEventListener('click',e=>{ const b=e.target.closest('[data-v]'); if(!b){ if(e.target===v) v.remove(); return; } const k=b.dataset.v; v.remove(); if(k==='again') api.rematch(); else if(k==='review') showReview(S,api); });
  }
  function gm(c,n){ return `<span class="gm">${A.gemSVG(c,18,c)}${n}</span>`; }
  function showReview(S,api){ if(!S) return; dqvCSS(); const old=document.getElementById('dqr'); if(old) old.remove(); const esc=api.esc, n=S.seats.length;
    const order=S.order||S.seats.map((_,i)=>i); const COL=['#c0392b','#2e86de','#27ae60','#e67e22','#8e44ad'];
    const st=S.st||S.seats.map(()=>null);
    const nm=i=>`<span class="who"><span class="dot" style="background:${COL[i%5]}"></span>${esc(S.seats[i].name)}</span>`;
    const tot=a=>a.reduce((s,x)=>s+x,0);
    function tabPlayers(){ const row=(lbl,f)=>`<tr><td>${lbl}</td>${order.map(i=>`<td>${st[i]?f(st[i],S.P[i],i):'–'}</td>`).join('')}</tr>`;
      return `<table><tr><th>Chỉ số</th>${order.map(i=>`<th>${esc(S.seats[i].name)}</th>`).join('')}</tr>
      <tr><td class="sec" colspan="${n+1}">Kết quả</td></tr>
      ${row('Hạng',(q,P,i)=>'#'+(order.indexOf(i)+1))}${row('Điểm uy tín',(q,P)=>'<b>'+P.pts+'</b>')}${row('Điểm từ thẻ',(q)=>q.cardPts)}${row('Điểm từ quý tộc',(q,P)=>P.nobles.length*3)}
      ${row('Vòng đạt 15 điểm',q=>q.first15||'–')}
      <tr><td class="sec" colspan="${n+1}">Hành động</td></tr>
      ${row('Số lượt đã đi',q=>q.turns)}${row('Lần lấy đá',q=>q.takeAct)}${row('Lần lấy 2 viên cùng màu',q=>q.take2)}${row('Thẻ giữ chỗ',q=>q.res+(q.resDeck?' ('+q.resDeck+' úp)':''))}
      ${row('Thời gian suy nghĩ',q=>fmtT(q.tt))}
      <tr><td class="sec" colspan="${n+1}">Thẻ đã mua</td></tr>
      ${row('Tổng số thẻ',(q,P)=>'<b>'+P.cards.length+'</b>')}${row('Cấp I',q=>q.buy[1])}${row('Cấp II',q=>q.buy[2])}${row('Cấp III',q=>q.buy[3])}${row('Mua từ thẻ giữ chỗ',q=>q.buyRes)}
      ${row('Thẻ giảm giá theo màu',(q,P)=>P.bonus.map((b,c)=>b?gm(c,b):'').join('')||'–')}
      <tr><td class="sec" colspan="${n+1}">Đá quý</td></tr>
      ${row('Tổng đá đã lấy',q=>'<b>'+tot(q.take)+'</b>')}${row('Đá đã lấy theo màu',q=>q.take.map((x,c)=>x?gm(c,x):'').join('')||'–')}
      ${row('Đá đã trả để mua thẻ',q=>q.spent.map((x,c)=>x?gm(c,x):'').join('')||'–')}${row('Vàng đã dùng',q=>q.spent[5])}
      ${row('Đá phải bỏ vì quá 10',q=>tot(q.ret))}${row('Đá còn cuối ván',(q,P)=>tot(P.tok))}
      </table>`; }
    function tabChart(){ const pt=S.pt||[]; if(pt.length<2) return '<p>Chưa đủ dữ liệu để vẽ biểu đồ.</p>';
      const nar=innerWidth<600, W=nar?520:900,H=nar?520:380,L=nar?34:44,B=34,T=16,Rr=nar?10:16, mx=Math.max(15,...pt.flat()), R=pt.length-1;
      const X=k=>L+(W-L-Rr)*k/R, Y=v=>H-B-(H-B-T)*v/mx;
      let s=`<svg class="dqchart" viewBox="0 0 ${W} ${H}">`;
      for(let v=0;v<=mx;v+=5){ s+=`<line x1="${L}" x2="${W-Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v===15?'#c0392b':'#e8d6b0'}" stroke-width="${v===15?2:1}" ${v===15?'stroke-dasharray="6 4"':''}/><text x="${L-8}" y="${Y(v)+5}" text-anchor="end" font-size="14" fill="#7a5a2b">${v}</text>`; }
      s+=`<text x="${W-Rr}" y="${Y(15)-6}" text-anchor="end" font-size="13" fill="#c0392b" font-weight="bold">Mốc 15 điểm</text>`;
      const step=Math.max(1,Math.ceil(R/12)); for(let k=0;k<=R;k+=step) s+=`<text x="${X(k)}" y="${H-10}" text-anchor="middle" font-size="13" fill="#7a5a2b">${k}</text>`;
      s+=`<text x="${W/2}" y="${H}" text-anchor="middle" font-size="12" fill="#7a5a2b">Vòng chơi</text>`;
      S.seats.forEach((_,i)=>{ s+=`<polyline fill="none" stroke="${COL[i%5]}" stroke-width="3.5" stroke-linejoin="round" points="${pt.map((r,k)=>X(k)+','+Y(r[i])).join(' ')}"/><circle cx="${X(R)}" cy="${Y(pt[R][i])}" r="5" fill="${COL[i%5]}"/>`; });
      s+='</svg>'; return s+`<div class="dqleg">${S.seats.map((_,i)=>nm(i)+' '+S.P[i].pts).join('')}</div>`; }
    function tabCards(){ return order.map(i=>{ const P=S.P[i]; return `<div class="dqpl"><h4>${nm(i)} — ${P.cards.length} thẻ, ${P.nobles.length} quý tộc</h4><div class="dqcards">${P.nobles.map(id=>`<div class="c nb">${A.noble(id)}</div>`).join('')}${P.cards.slice().sort((a,b)=>DQ.CARDS[a].col-DQ.CARDS[b].col||DQ.CARDS[b].pts-DQ.CARDS[a].pts).map(id=>`<div class="c">${A.card(id)}</div>`).join('')||'<i>Chưa mua thẻ nào</i>'}</div></div>`; }).join(''); }
    function tabLog(){ const L=S.log; return L.map((l,k)=>`<div class="dqhrow"><i>${L.length-k}</i><span>${logH(l,api)}</span></div>`).join(''); }
    const TABS=[['p','Người chơi',tabPlayers],['c','Diễn biến điểm',tabChart],['k','Thẻ & quý tộc',tabCards],['l','Nhật ký',tabLog]];
    const r=document.createElement('div'); r.id='dqr';
    r.innerHTML=`<div class="dqvp"><button class="x" data-v="close">✕</button><h2>📊 Kết quả ván</h2>
      <p class="wsub" style="margin:2px 0 0">${S.winner>=0?esc(S.seats[S.winner].name)+' thắng · ':''}${S.round||''} vòng${S.tEnd&&S.t0?' · '+fmtT(S.tEnd-S.t0):''}</p>
      <div class="dqtabs">${TABS.map((t,k)=>`<button data-t="${t[0]}" class="${k?'':'on'}">${t[1]}</button>`).join('')}</div><div class="dqbody">${TABS[0][2]()}</div>
      <div class="bts" style="margin-top:10px">${S.phase==='over'&&api.mode()!=='client'?'<button class="pri" data-v="again">▶ Chơi ván mới</button>':''}<button data-v="close">Đóng</button></div></div>`;
    document.body.appendChild(r);
    r.addEventListener('click',e=>{ const t=e.target.closest('[data-t]'); if(t){ r.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('on',b===t)); r.querySelector('.dqbody').innerHTML=TABS.find(x=>x[0]===t.dataset.t)[2](); r.querySelector('.dqbody').scrollTop=0; return; }
      const b=e.target.closest('[data-v]'); if(!b){ if(e.target===r) r.remove(); return; } r.remove(); if(b.dataset.v==='again') api.rematch(); });
  }
  function checkVictory(S,ME,api){ ME_=ME; if(S.phase!=='over'){ VSHOWN=''; ['dqv','dqr'].forEach(id=>{ const e=document.getElementById(id); if(e&&S.phase==='play'&&e.id==='dqv') e.remove(); }); return; }
    const key=(S.t0||0)+':'+S.winner; if(VSHOWN===key) return; VSHOWN=key; setTimeout(()=>showVictory(window.__S||S,ME,api),1800); }
  let ZM=1;
  function setZ(z){ ZM=Math.max(1,Math.min(2.6,z)); if(Math.abs(ZM-1)<.04) ZM=1; const w=root&&root.querySelector('.dqwrap'); if(w) w.style.zoom=ZM===1?'':ZM; root&&root.classList.toggle('zoomed',ZM>1); }
  (function pinch(){ let d0=0,z0=1; const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
    document.addEventListener('touchstart',e=>{ if(e.touches.length===2&&root&&root.contains(e.target)){ d0=dist(e.touches); z0=ZM; } },{passive:true});
    document.addEventListener('touchmove',e=>{ if(d0&&e.touches.length===2){ e.preventDefault(); setZ(z0*dist(e.touches)/d0); } },{passive:false});
    document.addEventListener('touchend',e=>{ if(e.touches.length<2) d0=0; },{passive:true}); })();
  function isFS(){ return !!(document.fullscreenElement||document.webkitFullscreenElement); }
  function toggleFS(){ const d=document.documentElement, api=Table.API;
    if(isFS()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); return; }
    const rq=d.requestFullscreen||d.webkitRequestFullscreen;
    if(rq){ try{ const p=rq.call(d,{navigationUI:'hide'}); if(p&&p.catch) p.catch(()=>fsHelp()); }catch(e){ fsHelp(); } } else fsHelp(); }
  function fsHelp(){ Table.API.modal('Chơi toàn màn hình', '<p>Trình duyệt này không cho bật toàn màn hình trực tiếp.</p><p><b>Cách chơi không còn thanh địa chỉ:</b></p><p>• <b>iPhone (Safari):</b> bấm nút Chia sẻ ⬆️ → <b>Thêm vào MH chính</b>, rồi mở game từ biểu tượng ngoài màn hình chính.</p><p>• <b>Android (Chrome):</b> bấm ⋮ → <b>Thêm vào màn hình chính</b> / <b>Cài đặt ứng dụng</b>.</p><p>• Nếu đang mở trong Zalo / Messenger: bấm ⋮ → <b>Mở bằng trình duyệt</b> trước.</p>', [{t:'Đã hiểu',pri:1}]); }
  document.addEventListener('fullscreenchange',()=>{ document.documentElement.classList.toggle('dqfs',isFS()); const b=document.getElementById('dq-fs'); if(b) b.textContent=isFS()?'⛶ Thoát toàn màn hình':'⛶ Toàn màn hình'; setTimeout(()=>{ try{ fit(); }catch(e){} },300); });
  function ensureHdr(){ if(document.getElementById('dq-hist')) return; const snd=document.getElementById('tb-sound'); if(!snd) return; const b=document.createElement('button'); b.className='tbtn'; b.id='dq-hist'; b.textContent='📜 Lịch sử'; b.onclick=showHist; snd.parentNode.insertBefore(b,snd); const fx=document.createElement('button'); fx.className='tbtn'; fx.id='dq-fx'; fx.textContent=FXN[fxMode()]; fx.onclick=cycleFx; snd.parentNode.insertBefore(fx,b); const ap=document.createElement('button'); ap.className='tbtn'; ap.id='dq-app'; ap.setAttribute('data-pbg-app',''); ap.textContent='📲 Tải app'; ap.onclick=()=>window.PBG&&PBG.install(); snd.parentNode.insertBefore(ap,b); const ac=document.createElement('button'); ac.className='tbtn'; ac.id='dq-acc'; ac.textContent='👤 Tài khoản'; ac.onclick=()=>{ if(window.PBG) (PBG.user?PBG.open():PBG.login()); }; snd.parentNode.insertBefore(ac,b); const f=document.createElement('button'); f.className='tbtn'; f.id='dq-fs'; f.textContent='⛶ Toàn màn hình'; f.onclick=toggleFS; snd.parentNode.insertBefore(f,b); }
  const PREV=[];
  function ting(){ if(!SFX.ok||!SFX.ok()) return; SFX.tone(2093,.45,{vol:.09,attack:.002}); SFX.tone(4186,.2,{vol:.03,attack:.001}); SFX.tone(3136,.35,{vol:.05,at:.06,attack:.002}); }
  function render(S,ME,api){ ensureHdr(); document.documentElement.classList.add('dqingame'); setTimeout(()=>S.P.forEach((q,i)=>PREV[i]=q.pts),0);
    if(!root){ document.getElementById('tb-game').innerHTML=A.defs()+'<div id="dq"></div>'; root=$('#dq'); root.addEventListener('click',onClick); root.addEventListener('mousemove',onMove);
      root.addEventListener('contextmenu',e=>{ const el=e.target.closest('[data-cid],[data-nb]'); if(el){ e.preventDefault(); zoomEl(el); } });
      let lp=null; root.addEventListener('touchstart',e=>{ const el=e.target.closest('[data-cid],[data-nb]'); if(!el) return; lp=setTimeout(()=>{ lp='done'; zoomEl(el); },550); },{passive:true});
      const cancel=()=>{ if(lp&&lp!=='done') clearTimeout(lp); }; root.addEventListener('touchend',e=>{ if(lp==='done'){ e.preventDefault(); } cancel(); lp=null; }); root.addEventListener('touchmove',cancel,{passive:true}); }
    fit(); const t=api.now(), my=S.phase==='play'&&S.turn===ME, P=ME>=0?S.P[ME]:null;
    if (!my){ sel=[]; if(pick&&pick.res==null) pick=null; }
    if(lastEv===null) lastEv=S.ev?S.ev.n:0; const ev=S.ev, isNew=ev&&ev.n!==lastEv; const pre={};
    if (isNew){ if(ev.k==='take') pre.tok=ev.g.map(c=>rectOf(`[data-tok="${c}"]`));
      if (ev.k==='ret') pre.from=rectOf(`.pl[data-p="${ev.seat}"] .bag`);
      if (ev.k==='buy'||ev.k==='reserve') pre.card = ev.res!=null ? (ev.seat===ME?rectOf(`[data-res="${ev.res}"]`):rectOf(`.pl[data-p="${ev.seat}"] .rsv`)) : ev.deck ? rectOf(`[data-deck="${ev.deck}"]`) : rectOf(`[data-lv="${ev.lv}"][data-i="${ev.i}"]`);
      if (ev.k==='noble') pre.nob=rectOf(`[data-nb="${ev.id}"]`); }
    const newIds=[]; [1,2,3].forEach(lv=>S.board[lv].forEach(id=>{ if(id!=null&&!seen.has(id)){ seen.add(id); if(!first) newIds.push(id); } })); first=false;
    let h=`<div class="dqtools"><b class="dqttl">Thương Nhân Đá Quý</b><a href="../../index.html" title="Menu trò chơi">🏠</a><button data-tool="chat" class="dqchatb" title="Trò chuyện trong phòng">💬<i class="dqcu"></i></button><button data-tool="fx" title="Đổi mức hiệu ứng (Đầy đủ / Nhẹ / Tắt)">${fxMode()==='full'?'✨':fxMode()==='lite'?'🌙':'⚡'}</button><button data-tool="app" data-pbg-app title="Tải game thành app">📲</button><button data-tool="acc" title="Tài khoản · Bạn bè · Online">👤</button><button data-tool="fs" title="Toàn màn hình">⛶</button><button data-hist="1" title="Lịch sử">📜</button><button data-tool="snd" title="Âm thanh">${SFX.on===false?'🔇':'🔊'}</button><button data-tool="rules" title="Luật chơi">📖</button><button data-tool="zin" title="Phóng to">＋</button><button data-tool="zout" title="Thu nhỏ">－</button></div><div class="dqwrap"><div class="dqboard"><div class="nobles">${S.nobles.map(id=>`<div class="dqn" data-nb="${id}" title="${DQ.NOBLE_NAMES[id]}">${A.noble(id)}</div>`).join('')}</div>`;
    [3,2,1].forEach(lv=>{ h+=`<div class="row"><div class="deck ${pick&&pick.deck===lv?'pk':''} ${S.decks[lv].length?'':'empty'}" data-deck="${lv}" title="Giữ chỗ 1 thẻ úp">${A.back(lv)}${S.decks[lv].length<5?`<div class="dlow">${S.decks[lv].length?'còn '+S.decks[lv].length:'hết'}</div>`:''}</div>`;
      S.board[lv].forEach((id,i)=>{ h+= id==null?'<div class="dqc empty"></div>':cardEl(id,`data-lv="${lv}" data-i="${i}"`,(newIds.includes(id)?'deal ':'')+(pick&&pick.lv===lv&&pick.i===i?'pk ':'')+(P&&DQ.payPlan(P,DQ.CARDS[id])?'can':'')); });
      h+=`</div>`; });
    const gemTok=c=>`<div class="tok ${sel.includes(c)?'on':''} ${c===5?'gold':''}" data-tok="${c}" title="${DQ_COL[c]}">${A.floatGem(c,S.bank[c])}<span>${S.bank[c]}</span><em class="gn">${GN[c]}</em>${sel.filter(x=>x===c).length>1?'<i>×2</i>':''}</div>`;
    const selDots=sel.length?`<div class="sel-dots">${sel.map(c=>A.gemSVG(c,18,c)).join('')}<button type="button" class="sel-clr" data-a="clrsel" title="Bỏ chọn">✕</button></div>`:'';
    h+=`</div><div class="bank"><div class="bt">Ngân khố</div><div class="gems">${[0,1,2,3,4].map(gemTok).join('')}</div>
      ${selDots}
      <button class="tbtn pri" data-a="take" ${my&&S.step==='main'&&validTake(S)?'':'disabled'}><span class="gtx">Lấy đá${sel.length?' ('+sel.length+')':''}</span></button>
      <small>3 màu khác nhau, hoặc 2 viên cùng màu (còn từ 4).</small>
      <div class="goldbox"><div class="bt">Vàng</div>${gemTok(5)}<small>Nhận khi giữ chỗ thẻ</small></div></div>`;
    let act='';
    if (S.phase==='over') act=`<b class="big">${api.esc(S.seats[S.winner].name)} thắng với ${S.P[S.winner].pts} điểm!</b> ${api.mode()!=='client'?'<button class="tbtn pri" data-a="again">Chơi ván mới</button>':''} <button class="tbtn" data-a="review">📊 Kết quả ván</button> <button class="tbtn" data-a="victory">🏆 Bảng xếp hạng</button>`;
    else if (my && S.step==='discard') act=`<b class="warn blink">⚠️ Túi quá tải (${DQ.tot(P.tok)}/10)!</b> <span>Hết lượt phải trả bớt cho còn 10 viên — bấm viên đá đang nhấp nháy trong khung của bạn để trả <b>${DQ.tot(P.tok)-10}</b> viên tùy chọn.</span>`;
    else if (pick) act=`<span>Đã chọn thẻ — bấm <b>Mua</b> hoặc <b>Giữ chỗ</b> ở khung cạnh lá bài.</span>`;
    else act = (!my&&S.phase==='play'&&S.step==='discard')?`<span>⚠️ Túi của ${api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')} quá tải (${DQ.tot(S.P[S.turn].tok)}/10) — đang trả bớt cho còn 10 viên…</span>`:my?'<b class="me blink">Đến lượt bạn!</b> lấy đá ở ngân khố, hoặc bấm 1 lá để mua / giữ chỗ.':`<span>Đang chờ ${api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')}…</span>`;
    const lastTxt=S.last&&S.phase==='play'?`<div class="lastbar">⚜ VÒNG CUỐI — ${((S.first||0)-1-S.turn+2*S.seats.length)%S.seats.length>0?`còn <b>${((S.first||0)-1-S.turn+2*S.seats.length)%S.seats.length}</b> lượt nữa sau lượt này`:'<b>lượt cuối cùng</b>'} ⚜</div>`:'';
    h+=`<div class="side">${lastTxt}<div class="stat"><div class="sttx">${act}</div></div><div class="players">${S.seats.map((p,i)=>{ const Q=S.P[i], mine=i===ME;
        const rsv=[0,1,2].map(r=>{ const id=Q.res[r]; if(id==null) return '<div class="rslot"></div>';
          return mine?cardEl(id,`data-res="${r}"`,'rcd '+(pick&&pick.res===r?'pk ':'')+(DQ.payPlan(P,DQ.CARDS[id])?'can':'')):`<div class="rcd rb" title="Thẻ giữ chỗ cấp ${DQ.CARDS[id].lv}">${A.back(DQ.CARDS[id].lv)}</div>`; }).join('');
        return `<div class="pl ${S.turn===i&&S.phase==='play'?'turn':''} ${mine?'me':''} ${S.phase==='over'&&S.winner===i?'win':''}" data-p="${i}" style="--pc:${PCOL[i]}">
        ${S.turn===i&&S.phase==='play'?`<i class="tbadge">${mine?'Lượt của bạn':'Đang đi'}</i>`:''}${S.turn===i&&S.step==='discard'&&S.phase==='play'?'<i class="ovl">Quá tải!</i>':''}<div class="bagw ${DQ.tot(Q.tok)>10?'over':''}" title="Túi đá ${PCN[i]}">${A.bag(PCOL[i],DQ.tot(Q.tok))}</div><div class="pcn">
        <div class="ph">${api.avatar(p.name,i)}<b>${api.esc(p.name)}</b>${mine?'<span class="mebadge">BẠN</span>':''}${S.turn===i&&S.phase==='play'?`<span class="tmr">${clockSVG(Math.min(60,Math.max(0,(t-S.turnAt)/1000)).toFixed(2),0)}<b class="tms">${Math.max(0,60-Math.floor((t-S.turnAt)/1000))}<small>giây</small></b></span>`:''}<span class="pts" title="${Q.pts} điểm uy tín"><b>${Q.pts}</b></span></div>
        <div class="gr3"><div class="g3row g3tok"><i class="g3l" data-s="Đá" title="Số đá quý đang có trong túi">Đá đang có</i><div class="g3c">${[0,1,2,3,4,5].map(c=>`<span class="gtk ${Q.tok[c]?'':'z'}" ${mine&&S.step==='discard'&&my&&Q.tok[c]?`data-ret="${c}"`:''} title="${Q.tok[c]} ${DQ_COL[c]}">${A.gemSVG(c,26,c)}<b>${Q.tok[c]}</b></span>`).join('')}</div></div><div class="g3row g3bon"><i class="g3l" data-s="Giảm" title="Mỗi thẻ đã mua giảm 1 viên cùng màu khi mua thẻ khác">Thẻ giảm giá</i><div class="g3c">${[0,1,2,3,4].map(c=>`<span class="gb ${(WOB[i+'_'+c]||0)>Date.now()?'wob':''}" data-bc="${c}" title="Giảm ${Q.bonus[c]} ${DQ_COL[c]} khi mua thẻ"><span class="sq sq${c} ${Q.bonus[c]?'':'z'}">${Q.bonus[c]}</span></span>`).join('')}<span class="gb gbx"></span></div></div>${mine&&my&&S.step==='discard'?`<div class="retcap">👆 Túi quá tải — bấm vào viên đá có <b>vòng đỏ</b> để trả lại · còn phải trả <b>${DQ.tot(Q.tok)-10}</b> viên</div>`:''}</div>
        ${Q.nobles.length?`<div class="ft">👑 ${Q.nobles.map(id=>DQ.NOBLE_NAMES[id]).join(', ')}</div>`:''}</div>
        <div class="rsvw"><i class="rsvh">Thẻ dự trữ <b>${Q.res.length}/3</b></i><div class="rsv" title="Thẻ giữ chỗ (tối đa 3)">${rsv}</div></div></div>`; }).join('')}</div>
      <div class="xlog"><button class="hbtn" data-hist="1">📜 Lịch sử</button>${S.log.slice(0,4).map(l=>`<div>${logH(l,api)}</div>`).join('')}</div></div></div>`;
    if(root.firstChild) morph(root,h); else root.innerHTML=h; if(ZM!==1){ const w=root.querySelector('.dqwrap'); if(w&&w.style.zoom!=String(ZM)) w.style.zoom=ZM; }
    // khung mua / giữ chỗ nổi ngay cạnh lá bài được chọn
    if (P && pick && S.phase==='play' && !(my&&S.step==='discard')){ const cid=pick.deck?null:(pick.res!=null?P.res[pick.res]:S.board[pick.lv][pick.i]); const card=cid!=null?DQ.CARDS[cid]:null; const plan=card&&DQ.payPlan(P,card);
      const need=card?card.cost.map((v,c)=>Math.max(0,v-P.bonus[c]-P.tok[c])):null; const lack=need?Math.max(0,need.reduce((a,b)=>a+b,0)-P.tok[5]):0;
      const pop=document.createElement('div'); pop.className='dqpop';
      pop.innerHTML=`<b>${pick.deck?'Thẻ úp · '+LVN[pick.deck]:A.jewelName(cid)+(card.pts?' · '+card.pts+' điểm':'')}</b>
        ${card?(plan?`<div class="pay">Trả: ${plan.pay.map((v,c)=>v?`<span>${A.gemSVG(c,18,c)}${v}</span>`:'').join('')}${plan.gold?`<span>${A.gemSVG(5,18,5)}${plan.gold}</span>`:''}${plan.pay.every(v=>!v)&&!plan.gold?'<span>miễn phí</span>':''}</div>`:`<div class="pay warn">Còn thiếu ${lack} viên: ${need.map((v,c)=>v?`<span>${A.gemSVG(c,16,c)}${v}</span>`:'').join('')}</div>`):''}
        ${!my?'<div class="pay">Chưa đến lượt bạn</div>':''}
        <div class="pb">${card?`<button class="tbtn pri" data-a="buy" ${my&&plan?'':'disabled'}><span class="gtx">Mua thẻ</span></button>`:''}${pick.res==null?`<button class="tbtn gold" data-a="reserve" ${my&&P.res.length<3?'':'disabled'}><span class="gtx">Giữ chỗ${S.bank[5]?' + 1 Vàng':''}</span></button>`:''}<button class="tbtn" data-a="cancel"><span class="gtx">Đóng</span></button></div>
        ${pick.res==null&&P.res.length>=3?'<div class="pay warn">Đã giữ đủ 3 thẻ</div>':''}`;
      root.appendChild(pop);
      const el=root.querySelector(pick.deck?`[data-deck="${pick.deck}"]`:pick.res!=null?`[data-res="${pick.res}"]`:`[data-lv="${pick.lv}"][data-i="${pick.i}"]`);
      if(el){ const r=el.getBoundingClientRect(), pr=pop.getBoundingClientRect(), W=innerWidth, H=innerHeight;
        let x=r.right+10, y=r.top+r.height/2-pr.height/2; if(x+pr.width>W-6) x=r.left-pr.width-10; if(x<6) x=Math.max(6,Math.min(W-pr.width-6,r.left+r.width/2-pr.width/2));
        if(pick.res!=null){ x=Math.max(6,Math.min(W-pr.width-6,r.right-pr.width)); y=r.bottom+8; } y=Math.max(6,Math.min(H-pr.height-6,y)); pop.style.left=x+'px'; pop.style.top=y+'px'; } }
    if(isNew){ lastEv=ev.n; {
      const target=rectOf(`.pl[data-p="${ev.seat}"]`);
      if(ev.k==='take'){ const bg=rectOf(`.pl[data-p="${ev.seat}"] .bag`); ev.g.forEach((c,k)=>fly(pre.tok&&pre.tok[k],bg,A.gemSVG(c,46,c),46,46,k*120,k===ev.g.length-1?bump(ev.seat):null)); GS.take(ev.g.length);
        const cnt={}; ev.g.forEach(c=>cnt[c]=(cnt[c]||0)+1); bagPop(ev.seat,Object.keys(cnt).map(c=>({c:+c,n:cnt[c]})),550); }
      else if(ev.k==='ret'){ fly(pre.from,rectOf(`[data-tok="${ev.c}"]`),A.gemSVG(ev.c,40,ev.c),40,40,0); GS.take(1); bagPop(ev.seat,[{c:ev.c,n:-1}],0); }
      else if(ev.k==='buy'){ const C=DQ.CARDS[ev.id], sd=ev.seat; SFX.flip(); buyFly(pre.card,sd,ev.id,()=>{ SFX.stone&&SFX.stone(0,.6); if(C.pts) setTimeout(()=>ptsPop(sd,C.pts),150); },ev.res!=null); if(sd===ME&&C.pts) setTimeout(()=>api.toast('+'+C.pts+' điểm uy tín',true),1300); }
      else if(ev.k==='reserve'){ fly(pre.card, rectOf(`.pl[data-p="${ev.seat}"] .rsv`), ev.id!=null?A.card(ev.id):A.back(ev.deck||1),110,154,0); gain(ev.seat,[{t:'Giữ chỗ thẻ cấp '+['','I','II','III'][ev.lv||DQ.CARDS[ev.id]?.lv||ev.deck],cls:'cd'}],850); if(ev.gold!==false) bagPop(ev.seat,[{c:5,n:1}],700); setTimeout(()=>fly(rectOf('[data-tok="5"]'),rectOf(`.pl[data-p="${ev.seat}"] .bag`),A.gemSVG(5,40,5),40,40,0,bump(ev.seat)),250); SFX.flip(); }
      else if(ev.k==='noble'){ fly(pre.nob,target,A.noble(ev.id),96,96,0,()=>sparkle(target,26,'#ffe27a')); gain(ev.seat,[{t:DQ.NOBLE_NAMES[ev.id]+' ghé thăm',cls:'cd'},],800); setTimeout(()=>ptsPop(ev.seat,3),900); if(ev.seat===ME){ api.toast(DQ.NOBLE_NAMES[ev.id]+' ghé thăm bạn: +3 điểm!',true); FX.confetti(innerWidth/2,innerHeight*.4,60); } else api.toast(DQ.NOBLE_NAMES[ev.id]+' ghé thăm '+api.esc(S.seats[ev.seat].name)); }
      else if(ev.k==='last'){ setTimeout(()=>lastBanner(S,ev,ME),900); }
      else if(ev.k==='over'){ SFX.ding(); if(S.winner===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.45,140); } }
      if (S.phase==='play'&&S.turn===ME&&ev.k!=='ret'&&SFX.hiss) SFX.hiss(); } }
  }
  function onMove(e){ const c=e.target.closest('.dqc:not(.empty),.dqn,.deck'); root.querySelectorAll('.tilt').forEach(x=>{ if(x!==c){ x.classList.remove('tilt'); x.style.transform=''; } });
    if(!c) return; const r=c.getBoundingClientRect(), px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
    c.classList.add('tilt'); c.style.transform=`perspective(600px) rotateY(${px*18}deg) rotateX(${-py*18}deg) translateY(-6px) scale(1.04)`; }
  let lastSec=-1;
  function syncChatBadge(){ const u=document.getElementById('tb-unread'); const n=u&&u.style.display!=='none'?u.textContent:''; document.querySelectorAll('.dqcu').forEach(e=>{ e.textContent=n; e.style.display=n?'':'none'; }); }
  setInterval(syncChatBadge,700);
  function tickView(S,ME,api){ if(!root||S.phase!=='play') return; const left=Math.max(0,60-Math.floor((api.now()-S.turnAt)/1000));
    if(left===lastSec&&!S.__dirty) return; root.querySelectorAll('.ckt').forEach(e=>e.textContent=left); root.querySelectorAll('.tms').forEach(e=>{ e.firstChild.textContent=left; e.classList.toggle('low',left<=10); }); root.querySelectorAll('.ckw').forEach(w=>w.classList.toggle('low',left<=10));
    if(left!==lastSec){ lastSec=left; if(left<=10&&left>0&&S.turn===ME&&SFX.ok&&SFX.ok()){ SFX.tone(left<=3?1900:1400,.05,{type:'triangle',vol:.12,attack:.001}); SFX.noise(.02,{vol:.15,freq:4000,q:3}); } } }
  function onClick(e){ const api=Table.API, S=window.__S, ME=api.me(); if(!S) return; const my=S.phase==='play'&&S.turn===ME;
    const tk=e.target.closest('[data-tok]'); if(tk){ if(!my||S.step!=='main') return; const c=+tk.dataset.tok; if(c===5){ api.toast('Vàng chỉ nhận được khi giữ chỗ thẻ'); return; }
      if (sel.length===1&&sel[0]===c){ if(S.bank[c]>=4) sel=[c,c]; else sel=[]; }
      else if (sel.includes(c)) sel=sel.length===2&&sel[0]===sel[1]?[]:sel.filter(x=>x!==c);
      else if (sel.length===2&&sel[0]===sel[1]) sel=[c];
      else if (sel.length<3 && S.bank[c]>0) sel.push(c);
      pick=null; GS.pick(); render(S,ME,api); return; }
    if(e.target.closest('[data-hist]')){ showHist(); return; } const tl=e.target.closest('[data-tool]'); if(tl){ const k=tl.dataset.tool; if(k==='chat'){ const cb=document.getElementById('tb-chatbtn'); if(cb) cb.click(); } else if(k==='fx'){ cycleFx(); } else if(k==='app'){ window.PBG&&PBG.install(); } else if(k==='acc'){ if(window.PBG) (PBG.user?PBG.open():PBG.login()); } else if(k==='fs') toggleFS(); else if(k==='snd'){ const sb=document.getElementById('tb-sound'); sb&&sb.click(); tl.textContent=SFX.on===false?'🔇':'🔊'; } else if(k==='rules'){ const rb=document.getElementById('tb-rules'); rb&&rb.click(); } else if(k==='zin') setZ(ZM*1.2); else if(k==='zout') setZ(ZM/1.2); return; } const rt=e.target.closest('[data-ret]'); if(rt){ api.act({t:'ret',c:+rt.dataset.ret}); return; }
    const cd=e.target.closest('[data-lv],[data-res],[data-deck]'); if(cd){ const d=cd.dataset;
      const np = d.deck?{deck:+d.deck}:d.res!=null?{res:+d.res}:{lv:+d.lv,i:+d.i};
      const isTouch = matchMedia('(pointer:coarse)').matches;
      if (!isTouch && pick && JSON.stringify(pick)===JSON.stringify(np) && my && !np.deck){ const cid=np.res!=null?S.P[ME].res[np.res]:S.board[np.lv][np.i]; if(DQ.payPlan(S.P[ME],DQ.CARDS[cid])){ api.act(np.res!=null?{t:'buy',res:np.res}:{t:'buy',lv:np.lv,i:np.i}); pick=null; return; } }
      pick = (pick && JSON.stringify(pick)===JSON.stringify(np)) ? null : np;
      sel=[]; SFX.pop(); render(S,ME,api); return; }
    const b=e.target.closest('[data-a]'); if(!b||b.disabled) return; SFX.pop(); const a=b.dataset.a;
    if (a==='clrsel'){ sel=[]; render(S,ME,api); return; }
    if (a==='cancel'){ pick=null; render(S,ME,api); return; }
    if (a==='again'){ api.rematch(); return; }
    if (a==='review'){ showReview(window.__S,api); return; }
    if (a==='victory'){ showVictory(window.__S,ME_,api,true); return; }
    if (a==='take'){ api.act({t:'take',g:sel.slice()}); sel=[]; return; }
    if (a==='buy'&&pick){ api.act(pick.res!=null?{t:'buy',res:pick.res}:{t:'buy',lv:pick.lv,i:pick.i}); pick=null; return; }
    if (a==='reserve'&&pick){ api.act(pick.deck?{t:'reserve',deck:pick.deck}:{t:'reserve',lv:pick.lv,i:pick.i}); pick=null; return; } }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); try{ checkVictory(S,ME,api); }catch(e){ console.error(e); } }, tickView };
})();
