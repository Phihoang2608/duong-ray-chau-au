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
  function logH(l,api){ let h=api.esc(l); DQ_COL.forEach((n,c)=>{ h=h.split(n).join(`<span class="lg">${A.gemSVG(c,18,c)}<b class="lg${c}">${n}</b></span>`); }); return h; }
  function showHist(){ const api=Table.API, S=window.__S; if(!S) return; const L=S.log; api.modal('📜 Lịch sử ván chơi', `<div class="dqhist">${L.map((l,i)=>`<div><i>${L.length-i}</i>${logH(l,api)}</div>`).join('')}</div>`, [{t:'Đóng',pri:1}]); }
  function ensureHdr(){ if(document.getElementById('dq-hist')) return; const snd=document.getElementById('tb-sound'); if(!snd) return; const b=document.createElement('button'); b.className='tbtn'; b.id='dq-hist'; b.textContent='📜 Lịch sử'; b.onclick=showHist; snd.parentNode.insertBefore(b,snd); }
  const PREV=[];
  function ting(){ if(!SFX.ok||!SFX.ok()) return; [[1568,0],[2093,.09],[3136,.18]].forEach(([f,a])=>{ SFX.tone(f,.9,{vol:.16,at:a,attack:.003}); SFX.tone(f*2.01,.35,{vol:.04,at:a,attack:.002}); }); }
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
      <button class="tbtn pri" data-a="take" ${my&&S.step==='main'&&validTake(S)?'':'disabled'}>Lấy đá${sel.length?' ('+sel.length+')':''}</button>
      <small>3 màu khác nhau, hoặc 2 viên cùng màu (còn từ 4).</small>
      <div class="goldbox"><div class="bt">Vàng</div>${gemTok(5)}<small>Nhận khi giữ chỗ thẻ</small></div></div>`;
    let act='';
    if (S.phase==='over') act=`<b class="big">${api.esc(S.seats[S.winner].name)} thắng với ${S.P[S.winner].pts} điểm!</b> ${api.mode()!=='client'?'<button class="tbtn pri" data-a="again">Chơi ván mới</button>':''}`;
    else if (my && S.step==='discard') act=`<b class="warn blink">⚠️ Túi quá tải (${DQ.tot(P.tok)}/10)!</b> <span>Hết lượt phải trả bớt cho còn 10 viên — bấm viên đá đang nhấp nháy trong khung của bạn để trả <b>${DQ.tot(P.tok)-10}</b> viên tùy chọn.</span>`;
    else if (pick) act=`<span>Đã chọn thẻ — bấm <b>Mua</b> hoặc <b>Giữ chỗ</b> ở khung cạnh lá bài.</span>`;
    else act = (!my&&S.phase==='play'&&S.step==='discard')?`<span>⚠️ Túi của ${api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')} quá tải (${DQ.tot(S.P[S.turn].tok)}/10) — đang trả bớt cho còn 10 viên…</span>`:my?'<b class="me blink">Đến lượt bạn!</b> lấy đá ở ngân khố, hoặc bấm 1 lá để mua / giữ chỗ.':`<span>Đang chờ ${api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')}…</span>`;
    h+=`<div class="side"><div class="stat">${act}</div><div class="players">${S.seats.map((p,i)=>{ const Q=S.P[i], mine=i===ME;
        const rsv=[0,1,2].map(r=>{ const id=Q.res[r]; if(id==null) return '<div class="rslot"></div>';
          return mine?cardEl(id,`data-res="${r}"`,'rcd '+(pick&&pick.res===r?'pk ':'')+(DQ.payPlan(P,DQ.CARDS[id])?'can':'')):`<div class="rcd rb" title="Thẻ giữ chỗ cấp ${DQ.CARDS[id].lv}">${A.back(DQ.CARDS[id].lv)}</div>`; }).join('');
        return `<div class="pl ${S.turn===i&&S.phase==='play'?'turn':''} ${mine?'me':''} ${S.phase==='over'&&S.winner===i?'win':''}" data-p="${i}" style="--pc:${PCOL[i]}">
        ${S.turn===i&&S.phase==='play'?`<i class="tbadge">${mine?'Lượt của bạn':'Đang đi'}</i>`:''}${S.turn===i&&S.step==='discard'&&S.phase==='play'?'<i class="ovl">Quá tải!</i>':''}<div class="bagw ${DQ.tot(Q.tok)>10?'over':''}" title="Túi đá ${PCN[i]}">${A.bag(PCOL[i],DQ.tot(Q.tok))}</div><div class="pcn">
        <div class="ph">${api.avatar(p.name,i)}<b>${api.esc(p.name)}</b>${mine?' <small>(bạn)</small>':''}${S.turn===i?` <span class="tmr">${Math.max(0,60-Math.floor((t-S.turnAt)/1000))}</span>`:''}<span class="pts ${(PREV[i]!=null&&Q.pts>PREV[i])?'up':''}"><small>điểm</small>${Q.pts}</span></div>
        <div class="gr">${[0,1,2,3,4,5].map(c=>`<div class="gc">${c<5?A.bonus(c,Q.bonus[c]):'<div class="bon gph"></div>'}<span class="tk ${Q.tok[c]?'':'z'}" ${mine&&S.step==='discard'&&my&&Q.tok[c]?`data-ret="${c}"`:''}>${A.gemSVG(c,17,c)}<b>${Q.tok[c]}</b></span></div>`).join('')}</div>
        ${Q.nobles.length?`<div class="ft">👑 ${Q.nobles.map(id=>DQ.NOBLE_NAMES[id]).join(', ')}</div>`:''}</div>
        <div class="rsv" title="Thẻ giữ chỗ (tối đa 3)">${rsv}</div></div>`; }).join('')}</div>
      <div class="xlog"><button class="hbtn" data-hist="1">📜 Lịch sử</button>${S.log.slice(0,4).map(l=>`<div>${logH(l,api)}</div>`).join('')}</div></div></div>`;
    root.innerHTML=h;
    // khung mua / giữ chỗ nổi ngay cạnh lá bài được chọn
    if (P && pick && S.phase==='play' && !(my&&S.step==='discard')){ const cid=pick.deck?null:(pick.res!=null?P.res[pick.res]:S.board[pick.lv][pick.i]); const card=cid!=null?DQ.CARDS[cid]:null; const plan=card&&DQ.payPlan(P,card);
      const need=card?card.cost.map((v,c)=>Math.max(0,v-P.bonus[c]-P.tok[c])):null; const lack=need?Math.max(0,need.reduce((a,b)=>a+b,0)-P.tok[5]):0;
      const pop=document.createElement('div'); pop.className='dqpop';
      pop.innerHTML=`<b>${pick.deck?'Thẻ úp · '+LVN[pick.deck]:A.jewelName(cid)+(card.pts?' · '+card.pts+' điểm':'')}</b>
        ${card?(plan?`<div class="pay">Trả: ${plan.pay.map((v,c)=>v?`<span>${A.gemSVG(c,18,c)}${v}</span>`:'').join('')}${plan.gold?`<span>${A.gemSVG(5,18,5)}${plan.gold}</span>`:''}${plan.pay.every(v=>!v)&&!plan.gold?'<span>miễn phí</span>':''}</div>`:`<div class="pay warn">Còn thiếu ${lack} viên: ${need.map((v,c)=>v?`<span>${A.gemSVG(c,16,c)}${v}</span>`:'').join('')}</div>`):''}
        ${!my?'<div class="pay">Chưa đến lượt bạn</div>':''}
        <div class="pb">${card?`<button class="tbtn pri" data-a="buy" ${my&&plan?'':'disabled'}>Mua thẻ</button>`:''}${pick.res==null?`<button class="tbtn gold" data-a="reserve" ${my&&P.res.length<3?'':'disabled'}>Giữ chỗ${S.bank[5]?' + 1 Vàng':''}</button>`:''}<button class="tbtn" data-a="cancel">Đóng</button></div>
        ${pick.res==null&&P.res.length>=3?'<div class="pay warn">Đã giữ đủ 3 thẻ</div>':''}`;
      root.appendChild(pop);
      const el=root.querySelector(pick.deck?`[data-deck="${pick.deck}"]`:pick.res!=null?`[data-res="${pick.res}"]`:`[data-lv="${pick.lv}"][data-i="${pick.i}"]`);
      if(el){ const r=el.getBoundingClientRect(), pr=pop.getBoundingClientRect(), W=innerWidth, H=innerHeight;
        let x=r.right+10, y=r.top+r.height/2-pr.height/2; if(x+pr.width>W-6) x=r.left-pr.width-10; if(x<6) x=Math.max(6,Math.min(W-pr.width-6,r.left+r.width/2-pr.width/2));
        if(pick.res!=null){ x=Math.max(6,Math.min(W-pr.width-6,r.right-pr.width)); y=r.bottom+8; } y=Math.max(6,Math.min(H-pr.height-6,y)); pop.style.left=x+'px'; pop.style.top=y+'px'; } }
    if(isNew){ lastEv=ev.n; {
      const target=rectOf(`.pl[data-p="${ev.seat}"]`);
      if(ev.k==='take'){ const bg=rectOf(`.pl[data-p="${ev.seat}"] .bag`); ev.g.forEach((c,k)=>fly(pre.tok&&pre.tok[k],bg,A.gemSVG(c,46,c),46,46,k*120,k===ev.g.length-1?bump(ev.seat):null)); GS.take(ev.g.length);
        const cnt={}; ev.g.forEach(c=>cnt[c]=(cnt[c]||0)+1); gain(ev.seat,Object.keys(cnt).map(c=>({icon:A.gemSVG(+c,24,+c),t:'+'+cnt[c]+' '+DQ_COL[c]})),700); }
      else if(ev.k==='ret'){ fly(pre.from,rectOf(`[data-tok="${ev.c}"]`),A.gemSVG(ev.c,40,ev.c),40,40,0); GS.take(1); }
      else if(ev.k==='buy'){ { const C=DQ.CARDS[ev.id]; fly(pre.card,target,A.card(ev.id),130,182,0,()=>sparkle(target,16,A.PAL[C.col][1])); showCard(ev.seat,ev.id,750,[{t:'+1 thẻ cấp '+['','I','II','III'][C.lv],cls:'cd'},{icon:A.gemSVG(C.col,24,C.col),t:'+1 thưởng '+DQ_COL[C.col]}].concat(C.pts?[{t:'+'+C.pts+' điểm',cls:'pt'}]:[])); } SFX.flip(); if(DQ.CARDS[ev.id].pts) setTimeout(ting,650); if(ev.seat===ME&&DQ.CARDS[ev.id].pts){ api.toast('+'+DQ.CARDS[ev.id].pts+' điểm uy tín',true); } }
      else if(ev.k==='reserve'){ fly(pre.card, rectOf(`.pl[data-p="${ev.seat}"] .rsv`), ev.id!=null?A.card(ev.id):A.back(ev.deck||1),110,154,0); if(ev.id!=null&&ev.seat===ME) showCard(ev.seat,ev.id,750); gain(ev.seat,[{t:'Giữ chỗ thẻ cấp '+['','I','II','III'][ev.lv||DQ.CARDS[ev.id]?.lv||ev.deck],cls:'cd'}].concat(S.P[ev.seat]?[{icon:A.gemSVG(5,24,5),t:'+1 Vàng'}]:[]),850); setTimeout(()=>fly(rectOf('[data-tok="5"]'),rectOf(`.pl[data-p="${ev.seat}"] .bag`),A.gemSVG(5,40,5),40,40,0,bump(ev.seat)),250); SFX.flip(); }
      else if(ev.k==='noble'){ fly(pre.nob,target,A.noble(ev.id),96,96,0,()=>sparkle(target,26,'#ffe27a')); gain(ev.seat,[{t:DQ.NOBLE_NAMES[ev.id]+' ghé thăm',cls:'cd'},{t:'+3 điểm',cls:'pt'}],800); setTimeout(ting,700); if(ev.seat===ME){ api.toast(DQ.NOBLE_NAMES[ev.id]+' ghé thăm bạn: +3 điểm!',true); FX.confetti(innerWidth/2,innerHeight*.4,60); } else api.toast(DQ.NOBLE_NAMES[ev.id]+' ghé thăm '+api.esc(S.seats[ev.seat].name)); }
      else if(ev.k==='over'){ SFX.ding(); if(S.winner===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.45,140); } }
      if (S.phase==='play'&&S.turn===ME&&ev.k!=='ret'&&SFX.hiss) SFX.hiss(); } }
  }
  function onMove(e){ const c=e.target.closest('.dqc:not(.empty),.dqn,.deck'); root.querySelectorAll('.tilt').forEach(x=>{ if(x!==c){ x.classList.remove('tilt'); x.style.transform=''; } });
    if(!c) return; const r=c.getBoundingClientRect(), px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
    c.classList.add('tilt'); c.style.transform=`perspective(600px) rotateY(${px*18}deg) rotateX(${-py*18}deg) translateY(-6px) scale(1.04)`; }
  function tickView(S,ME,api){ const el=root&&root.querySelector('.pl.turn .tmr'); if(el) el.textContent=Math.max(0,60-Math.floor((api.now()-S.turnAt)/1000)); }
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
