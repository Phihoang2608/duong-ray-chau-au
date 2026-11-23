/* ===================== GIAO DIỆN PHỎM ===================== */
const PHUI=(()=>{
  let root=null, sel=null, mode='meld', lastEv=0, dealt=-1;
  const $=s=>document.querySelector(s);
  function pos(n, rel){ // bạn ở dưới, đối thủ chia đều nửa trên
    if (rel===0) return {x:50,y:86};
    const L={1:[[50,21]],2:[[78,24],[22,24]],3:[[85,42],[50,21],[15,42]]}[n-1]; const p=L[rel-1]; return {x:p[0],y:p[1]}; }
  function sortHand(S,ME){ const H=S.hands[ME].slice(), E=S.eaten[ME];
    if (mode==='rank') return {groups:[H.sort((a,b)=>PH.sortKey(a)-PH.sortKey(b))]};
    const s=PH.solve(H,E); if(!s) return {groups:[H.sort((a,b)=>PH.sortKey(a)-PH.sortKey(b))]};
    return {groups:s.melds.map(m=>m.slice().sort((a,b)=>PH.sortKey(a)-PH.sortKey(b))).concat(s.rest.length?[s.rest]:[]), nm:s.melds.length}; }
  function mini(c,cls){ return Cards.face(c,'mini '+(cls||'')); }
  function render(S,ME,api){
    Cards.css();
    if(!root){ document.getElementById('tb-game').innerHTML='<div id="ph"></div>'; root=$('#ph'); root.addEventListener('click',onClick); }
    const n=S.seats.length, t=api.now(), me=Math.max(0,ME), R=S.res, fresh=S.round!==dealt; dealt=S.round;
    const top = S.phase==='play' ? PH.topDiscard(S) : null;
    let h=`<div class="felt tbl ph"><div class="arc">PHỎM · TÁ LẢ · ${PH_ROUNDS} VÒNG ĐÁNH</div>
      <div class="center"><div class="deckp">${S.deck.length&&!R?Cards.back('')+`<span>${S.deck.length}</span>`:''}</div>
      <div class="st">${R?'Hạ bài — ván '+S.round:(S.turn===ME?(S.step==='draw'?'Đến lượt bạn: <b>Bốc</b> hoặc <b>Ăn</b>':'Chọn 1 lá để <b>Đánh</b>'):'Chờ '+api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')+(S.step==='draw'?' bốc bài':' đánh bài'))}</div></div>`;
    S.seats.forEach((p,i)=>{ const rel=(i-me+n)%n, P=pos(n,rel), mine=i===ME, row=R&&R.rows[i];
      const left=S.turn===i?Math.max(0,30-Math.floor((t-S.turnAt)/1000)):null;
      let inner='';
      if (row){ inner=`<div class="lay">${row.melds.map(m=>`<div class="grp m">${m.map(c=>mini(c,S.eaten[i].includes(c)?'eat':'')).join('')}</div>`).join('')}${row.rest.length?`<div class="grp r">${row.rest.map(c=>mini(c)).join('')}</div>`:''}</div>
        <div class="tag ${row.delta>0?'win':row.delta<0?'lose':'info'}">${row.label}${row.mom||row.label==='Ù!'||row.label==='Đền ù'?'':' · '+row.dead+' điểm'}${row.delta?' · '+(row.delta>0?'+':'')+row.delta:''}</div>`; }
      else if (!mine) inner=`<div class="fan">${S.hands[i].map((_,k)=>Cards.back(fresh?'deal':'',k)).join('')}<span class="cnt">${S.hands[i].length}</span></div>
        ${S.eaten[i].length?`<div class="eaten">${S.eaten[i].map(c=>mini(c,'eat')).join('')}</div>`:''}`;
      const disc=`<div class="disc">${S.discards[i].map((c,k)=>mini(c,c===top&&k===S.discards[i].length-1?'top':'')).join('')}${Array(Math.max(0,PH_ROUNDS-S.dc[i])).fill('<i></i>').join('')}</div>`;
      h+=`<div class="seatbox ${S.turn===i?'turn':''} ${mine?'me':''}" style="left:${P.x}%;top:${P.y}%">${mine&&!row?'':inner}
        <div class="nm">${api.avatar(p.name,i)}<b>${api.esc(p.name)}</b>${mine?' (bạn)':''}${left!=null?` <span class="tmr">${left}</span>`:''}</div>
        <div class="sub">${S.coins[i]} xu</div>${R?'':disc}</div>`; });
    h+=`</div>`;
    if (ME>=0 && !R){ const my=S.phase==='play'&&S.turn===ME, H=S.hands[ME], E=S.eaten[ME], sh=sortHand(S,ME);
      if (sel!=null && !H.includes(sel)) sel=null;
      const canEat = my && S.step==='draw' && top!=null && PH.canEat(H,E,top);
      const okDisc = my && S.step==='discard' && sel!=null && !E.includes(sel) && !!PH.solve(H.filter(x=>x!==sel),E);
      h+=`<div class="myhand">${sh.groups.map((g,gi)=>`<div class="grp ${gi<(sh.nm||0)?'m':''}">${g.map((c,k)=>Cards.face(c,(fresh?'deal ':'')+(c===sel?'sel ':'')+(E.includes(c)?'eat':''),k).replace('class="pc','data-card="'+c+'" class="pc')).join('')}</div>`).join('')}</div>
      <div class="ctrl"><div class="btns"><span>Xu: <b>${S.coins[ME]}</b></span>
        <button class="tbtn pri" data-a="draw" ${my&&S.step==='draw'?'':'disabled'}>Bốc bài</button>
        <button class="tbtn gold" data-a="eat" ${canEat?'':'disabled'}>Ăn${top!=null&&canEat?' '+Cards.name(top):''}</button>
        <button class="tbtn pri" data-a="discard" ${okDisc?'':'disabled'}>Đánh${sel!=null?' '+Cards.name(sel):''}</button>
        <button class="tbtn" data-a="sort">${mode==='meld'?'Xếp theo số':'Xếp theo phỏm'}</button></div></div>`; }
    if (R) h+=`<div class="ctrl"><div class="btns"><span>Ván mới sau <b class="cd">${Math.max(0,Math.ceil((PH_RES_MS-(t-S.phaseAt))/1000))}</b> giây · Xu của bạn: <b>${ME>=0?S.coins[ME]:'-'}</b></span></div></div>`;
    h+=`<div class="xlog">${S.log.slice(0,5).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div><p class="note">Chơi bằng xu ảo để giải trí, không quy đổi thành tiền.</p>`;
    root.innerHTML=h;
    const ev=S.lastEv; if (ev && ev.n!==lastEv){ lastEv=ev.n;
      if (ev.k==='draw') SFX.flip(); else if (ev.k==='discard') SFX.clack(1);
      else if (ev.k==='eat'){ SFX.ding(); if(ev.seat===ME) api.toast('Bạn ăn được '+Cards.name(ev.c)+' (+'+ev.pay+' xu)',true); else if(ev.from===ME) api.toast(api.esc(S.seats[ev.seat].name)+' ăn lá của bạn (−'+ev.pay+' xu)'); }
      else if (ev.k==='u'||ev.k==='end'){ const w=ev.k==='u'?ev.seat:R.rows.findIndex(r=>r.place===1); SFX.ding(); if(w===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.5,90); api.toast(ev.k==='u'?'Bạn Ù!':'Bạn về Nhất!',true); } }
      if (S.phase==='play' && S.turn===ME && S.step==='draw' && SFX.hiss) SFX.hiss(); }
  }
  function tickView(S,ME,api){ const el=root&&root.querySelector('.seatbox.turn .tmr'); if(el) el.textContent=Math.max(0,30-Math.floor((api.now()-S.turnAt)/1000));
    const c=root&&root.querySelector('.cd'); if(c&&S.res) c.textContent=Math.max(0,Math.ceil((PH_RES_MS-(api.now()-S.phaseAt))/1000)); }
  function onClick(e){ const api=Table.API, S=window.__S, ME=api.me();
    const card=e.target.closest('[data-card]'); if(card){ const c=+card.dataset.card;
      if (sel===c && S && S.turn===ME && S.step==='discard'){ tryDiscard(c); return; }
      sel = sel===c?null:c; SFX.pop(); render(S,ME,api); return; }
    const b=e.target.closest('[data-a]'); if(!b||b.disabled) return; SFX.pop(); const a=b.dataset.a;
    if (a==='sort'){ mode=mode==='meld'?'rank':'meld'; render(S,ME,api); return; }
    if (a==='discard'){ tryDiscard(sel); return; }
    api.act({t:a}); }
  function tryDiscard(c){ const api=Table.API, S=window.__S, ME=api.me(); if(c==null) return;
    if (S.eaten[ME].includes(c)) { api.toast('Lá đã ăn phải giữ trong phỏm'); return; }
    if (!PH.solve(S.hands[ME].filter(x=>x!==c),S.eaten[ME])) { api.toast('Đánh lá này sẽ phá phỏm có lá đã ăn'); return; }
    sel=null; api.act({t:'discard',c}); }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
