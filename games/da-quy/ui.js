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
  function sparkle(rect,n,col){ if(!rect) return; for(let i=0;i<(n||14);i++){ const p=document.createElement('div'); p.className='dqsp'; p.style.background=col||'#fff6c8'; p.style.left=(rect.left+rect.width/2)+'px'; p.style.top=(rect.top+rect.height/2)+'px'; document.body.appendChild(p);
      const a=Math.random()*Math.PI*2, d=30+Math.random()*60; p.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(.2)`,opacity:0}],{duration:700+Math.random()*400,easing:'ease-out'}).onfinish=()=>p.remove(); } }
  function bump(seat){ return ()=>{ const b=root.querySelector(`.pl[data-p="${seat}"] .bag`); if(b){ b.animate([{transform:'scale(1)'},{transform:'scale(1.25,.85)'},{transform:'scale(.92,1.1)'},{transform:'scale(1)'}],{duration:450}); sparkle(b.getBoundingClientRect(),10); } }; }
  function rectOf(sel){ const e=root&&root.querySelector(sel); return e?e.getBoundingClientRect():null; }
  function fit(){ if(!root) return; const top=root.getBoundingClientRect().top+scrollY; root.style.setProperty('--H',Math.max(560,innerHeight-top-8)+'px'); }
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
  function logH(l,api){ let h=api.esc(l); DQ_COL.forEach((n,c)=>{ h=h.split(n).join(`<span class="lg">${A.gemSVG(c,18,c)}<b class="lg${c}">${n}</b></span>`); }); return h; }
  function showHist(){ const api=Table.API, S=window.__S; if(!S) return; const L=S.log; api.modal('📜 Lịch sử ván chơi', `<div class="dqhist">${L.map((l,i)=>`<div><i>${L.length-i}</i>${logH(l,api)}</div>`).join('')}</div>`, [{t:'Đóng',pri:1}]); }
  function ensureHdr(){ if(document.getElementById('dq-hist')) return; const snd=document.getElementById('tb-sound'); if(!snd) return; const b=document.createElement('button'); b.className='tbtn'; b.id='dq-hist'; b.textContent='📜 Lịch sử'; b.onclick=showHist; snd.parentNode.insertBefore(b,snd); }
  const PREV=[];
  function ting(){ if(!SFX.ok||!SFX.ok()) return; SFX.tone(2093,.45,{vol:.09,attack:.002}); SFX.tone(4186,.2,{vol:.03,attack:.001}); SFX.tone(3136,.35,{vol:.05,at:.06,attack:.002}); }
  function render(S,ME,api){ ensureHdr(); setTimeout(()=>S.P.forEach((q,i)=>PREV[i]=q.pts),0);
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
    let h=`<div class="dqwrap"><div class="dqboard"><div class="nobles">${S.nobles.map(id=>`<div class="dqn" data-nb="${id}" title="${DQ.NOBLE_NAMES[id]}">${A.noble(id)}</div>`).join('')}</div>`;
    [3,2,1].forEach(lv=>{ h+=`<div class="row"><div class="deck ${pick&&pick.deck===lv?'pk':''}" data-deck="${lv}" title="Giữ chỗ 1 thẻ úp">${A.back(lv)}<div class="dl"><b>${S.decks[lv].length}</b><span>${LVN[lv]}</span></div></div>`;
      S.board[lv].forEach((id,i)=>{ h+= id==null?'<div class="dqc empty"></div>':cardEl(id,`data-lv="${lv}" data-i="${i}"`,(newIds.includes(id)?'deal ':'')+(pick&&pick.lv===lv&&pick.i===i?'pk ':'')+(P&&DQ.payPlan(P,DQ.CARDS[id])?'can':'')); });
      h+=`</div>`; });
    const gemTok=c=>`<div class="tok ${sel.includes(c)?'on':''} ${c===5?'gold':''}" data-tok="${c}" title="${DQ_COL[c]}">${A.floatGem(c,S.bank[c])}<span>${S.bank[c]}</span><em class="gn">${GN[c]}</em>${sel.filter(x=>x===c).length>1?'<i>×2</i>':''}</div>`;
    h+=`</div><div class="bank"><div class="bt">Ngân khố</div><div class="gems">${[0,1,2,3,4].map(gemTok).join('')}</div>
      <button class="tbtn pri" data-a="take" ${my&&S.step==='main'&&validTake(S)?'':'disabled'}><span class="gtx">Lấy đá</span></button>
      <small>3 màu khác nhau, hoặc 2 viên cùng màu (còn từ 4).</small>
      <div class="goldbox"><div class="bt">Vàng</div>${gemTok(5)}<small>Nhận khi giữ chỗ thẻ</small></div></div>`;
    let act='';
    if (S.phase==='over') act=`<b class="big">${api.esc(S.seats[S.winner].name)} thắng với ${S.P[S.winner].pts} điểm!</b> ${api.mode()!=='client'?'<button class="tbtn pri" data-a="again">Chơi ván mới</button>':''}`;
    else if (my && S.step==='discard') act=`<b class="warn blink">⚠️ Túi quá tải (${DQ.tot(P.tok)}/10)!</b> <span>Hết lượt phải trả bớt cho còn 10 viên — bấm viên đá đang nhấp nháy trong khung của bạn để trả <b>${DQ.tot(P.tok)-10}</b> viên tùy chọn.</span>`;
    else if (pick) act=`<span>Đã chọn thẻ — bấm <b>Mua</b> hoặc <b>Giữ chỗ</b> ở khung cạnh lá bài.</span>`;
    else act = (!my&&S.phase==='play'&&S.step==='discard')?`<span>⚠️ Túi của ${api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')} quá tải (${DQ.tot(S.P[S.turn].tok)}/10) — đang trả bớt cho còn 10 viên…</span>`:my?'<b class="me blink">Đến lượt bạn!</b> lấy đá ở ngân khố, hoặc bấm 1 lá để mua / giữ chỗ.':`<span>Đang chờ ${api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')}…</span>`;
    h+=`<div class="side"><div class="stat"><div class="sttx">${act}</div></div><div class="players">${S.seats.map((p,i)=>{ const Q=S.P[i], mine=i===ME;
        const rsv=[0,1,2].map(r=>{ const id=Q.res[r]; if(id==null) return '<div class="rslot"></div>';
          return mine?cardEl(id,`data-res="${r}"`,'rcd '+(pick&&pick.res===r?'pk ':'')+(DQ.payPlan(P,DQ.CARDS[id])?'can':'')):`<div class="rcd rb" title="Thẻ giữ chỗ cấp ${DQ.CARDS[id].lv}">${A.back(DQ.CARDS[id].lv)}</div>`; }).join('');
        return `<div class="pl ${S.turn===i&&S.phase==='play'?'turn':''} ${mine?'me':''} ${S.phase==='over'&&S.winner===i?'win':''}" data-p="${i}" style="--pc:${PCOL[i]}">
        ${S.turn===i&&S.phase==='play'?`<i class="tbadge">${mine?'Lượt của bạn':'Đang đi'}</i>`:''}${S.turn===i&&S.step==='discard'&&S.phase==='play'?'<i class="ovl">Quá tải!</i>':''}<div class="bagw ${DQ.tot(Q.tok)>10?'over':''}" title="Túi đá ${PCN[i]}">${A.bag(PCOL[i],DQ.tot(Q.tok))}</div><div class="pcn">
        <div class="ph">${api.avatar(p.name,i)}<b>${api.esc(p.name)}</b>${mine?' <small>(bạn)</small>':''}${S.turn===i&&S.phase==='play'?`<span class="tmr">${clockSVG(Math.min(60,Math.max(0,(t-S.turnAt)/1000)).toFixed(2),0)}<b class="tms">${Math.max(0,60-Math.floor((t-S.turnAt)/1000))}<small>giây</small></b></span>`:''}<span class="pts"><small>điểm</small>${Q.pts}</span></div>
        <div class="gr2"><i class="gl" title="Mỗi thẻ đã mua giảm 1 viên cùng màu khi mua thẻ khác">Thẻ<br>giảm giá</i>${[0,1,2,3,4].map(c=>`<span class="gb ${(WOB[i+'_'+c]||0)>Date.now()?'wob':''}" data-bc="${c}" title="Giảm ${Q.bonus[c]} ${DQ_COL[c]} khi mua thẻ">${A.bonus(c,Q.bonus[c])}</span>`).join('')}<span></span><i class="gl" title="Số đá quý đang có trong túi">Đá<br>đang có</i>${[0,1,2,3,4,5].map(c=>`<span class="tk ${Q.tok[c]?'':'z'}" ${mine&&S.step==='discard'&&my&&Q.tok[c]?`data-ret="${c}"`:''}>${A.gemSVG(c,17,c)}<b>${Q.tok[c]}</b></span>`).join('')}</div>
        ${Q.nobles.length?`<div class="ft">👑 ${Q.nobles.map(id=>DQ.NOBLE_NAMES[id]).join(', ')}</div>`:''}</div>
        <div class="rsvw"><i class="rsvh">Thẻ dự trữ <b>${Q.res.length}/3</b></i><div class="rsv" title="Thẻ giữ chỗ (tối đa 3)">${rsv}</div></div></div>`; }).join('')}</div>
      <div class="xlog"><button class="hbtn" data-hist="1">📜 Lịch sử</button>${S.log.slice(0,4).map(l=>`<div>${logH(l,api)}</div>`).join('')}</div></div></div>`;
    root.innerHTML=h;
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
      else if(ev.k==='over'){ SFX.ding(); if(S.winner===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.45,140); } }
      if (S.phase==='play'&&S.turn===ME&&ev.k!=='ret'&&SFX.hiss) SFX.hiss(); } }
  }
  function onMove(e){ const c=e.target.closest('.dqc:not(.empty),.dqn,.deck'); root.querySelectorAll('.tilt').forEach(x=>{ if(x!==c){ x.classList.remove('tilt'); x.style.transform=''; } });
    if(!c) return; const r=c.getBoundingClientRect(), px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
    c.classList.add('tilt'); c.style.transform=`perspective(600px) rotateY(${px*18}deg) rotateX(${-py*18}deg) translateY(-6px) scale(1.04)`; }
  let lastSec=-1;
  function tickView(S,ME,api){ if(!root||S.phase!=='play') return; const left=Math.max(0,60-Math.floor((api.now()-S.turnAt)/1000));
    root.querySelectorAll('.ckt').forEach(e=>e.textContent=left); root.querySelectorAll('.tms').forEach(e=>{ e.firstChild.textContent=left; e.classList.toggle('low',left<=10); }); root.querySelectorAll('.ckw').forEach(w=>w.classList.toggle('low',left<=10));
    if(left!==lastSec){ lastSec=left; if(left<=10&&left>0&&S.turn===ME&&SFX.ok&&SFX.ok()){ SFX.tone(left<=3?1900:1400,.05,{type:'triangle',vol:.12,attack:.001}); SFX.noise(.02,{vol:.15,freq:4000,q:3}); } } }
  function onClick(e){ const api=Table.API, S=window.__S, ME=api.me(); if(!S) return; const my=S.phase==='play'&&S.turn===ME;
    const tk=e.target.closest('[data-tok]'); if(tk){ if(!my||S.step!=='main') return; const c=+tk.dataset.tok; if(c===5){ api.toast('Vàng chỉ nhận được khi giữ chỗ thẻ'); return; }
      if (sel.length===1&&sel[0]===c){ if(S.bank[c]>=4) sel=[c,c]; else sel=[]; }
      else if (sel.includes(c)) sel=sel.length===2&&sel[0]===sel[1]?[]:sel.filter(x=>x!==c);
      else if (sel.length===2&&sel[0]===sel[1]) sel=[c];
      else if (sel.length<3 && S.bank[c]>0) sel.push(c);
      pick=null; GS.pick(); render(S,ME,api); return; }
    if(e.target.closest('[data-hist]')){ showHist(); return; } const rt=e.target.closest('[data-ret]'); if(rt){ api.act({t:'ret',c:+rt.dataset.ret}); return; }
    const cd=e.target.closest('[data-lv],[data-res],[data-deck]'); if(cd){ const d=cd.dataset;
      const np = d.deck?{deck:+d.deck}:d.res!=null?{res:+d.res}:{lv:+d.lv,i:+d.i};
      if (pick && JSON.stringify(pick)===JSON.stringify(np) && my && !np.deck){ const cid=np.res!=null?S.P[ME].res[np.res]:S.board[np.lv][np.i]; if(DQ.payPlan(S.P[ME],DQ.CARDS[cid])){ api.act(np.res!=null?{t:'buy',res:np.res}:{t:'buy',lv:np.lv,i:np.i}); pick=null; return; } }
      pick=np; sel=[]; SFX.pop(); render(S,ME,api); return; }
    const b=e.target.closest('[data-a]'); if(!b||b.disabled) return; SFX.pop(); const a=b.dataset.a;
    if (a==='cancel'){ pick=null; render(S,ME,api); return; }
    if (a==='again'){ api.rematch(); return; }
    if (a==='take'){ api.act({t:'take',g:sel.slice()}); sel=[]; return; }
    if (a==='buy'&&pick){ api.act(pick.res!=null?{t:'buy',res:pick.res}:{t:'buy',lv:pick.lv,i:pick.i}); pick=null; return; }
    if (a==='reserve'&&pick){ api.act(pick.deck?{t:'reserve',deck:pick.deck}:{t:'reserve',lv:pick.lv,i:pick.i}); pick=null; return; } }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
