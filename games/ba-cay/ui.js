/* ===================== GIAO DIỆN BA CÂY ===================== */
const BCYUI=(()=>{
  let root=null, last='';
  const $=s=>document.querySelector(s);
  function render(S,ME,api){
    Cards.css();
    if(!root){ document.getElementById('tb-game').innerHTML='<div id="b3"></div>'; root=$('#b3'); root.addEventListener('click',onClick); }
    const n=S.seats.length, t=api.now(), me=Math.max(0,ME);
    let h=`<div class="felt tbl"><div class="arc">BA TIÊN LỚN NHẤT · RÔ &gt; CƠ &gt; BÍCH &gt; NHÉP</div>
      <div class="center"><div class="pot">${Cards.chip(S.ante)}<div><b>${S.pot}</b> xu trên bàn</div></div>
      <div class="st">${S.phase==='look'?`Lật bài — còn <b class="cd">${Math.max(0,Math.ceil((BCY_LOOK_MS-(t-S.phaseAt))/1000))}</b> giây`:'Ván '+S.round+': '+api.esc(S.seats[S.res.w].name)+' thắng!'}</div></div>`;
    S.seats.forEach((p,i)=>{ const P=Cards.seatXY(n,(i-me+n)%n), open=S.open[i], win=S.res&&S.res.w===i;
      h+=`<div class="seatbox ${win?'turn':''}" style="left:${P.x}%;top:${P.y}%">
        <div class="cards">${S.hands[i].map((c,k)=>open?Cards.face(c,(S.phase==='show'?'flip':'deal')+(win?' hl':''),k):Cards.back('deal',k)).join('')}</div>
        ${open?`<div class="tag ${win?'win':'info'}">${BCY.label(S.hands[i])}</div>`:''}
        <div class="nm">${api.avatar(p.name,i)}<b>${api.esc(p.name)}</b>${i===ME?' (bạn)':''}</div><div class="sub">${S.coins[i]} xu</div></div>`; });
    h+=`</div>`;
    if (ME>=0) h+=`<div class="ctrl"><div class="btns"><span>Xu của bạn: <b>${S.coins[ME]}</b></span><button class="tbtn pri" data-a="open" ${S.phase==='look'&&!S.open[ME]?'':'disabled'}>Lật bài</button>
      ${ME===0&&api.mode()!=='client'?`<span>Mức cược:</span>${BCY_ANTES.map(v=>`<button class="tbtn ${v===S.ante?'pri':''}" data-ante="${v}" ${S.phase==='look'?'disabled':''}>${v}</button>`).join('')}`:''}</div></div>`;
    h+=`<div class="xlog">${S.log.slice(0,5).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div><p class="note">Chơi bằng xu ảo để giải trí, không quy đổi thành tiền.</p>`;
    root.innerHTML=h;
    const key=S.round+S.phase+S.open.join();
    if(key!==last){ const prevRound=last.split(/[a-z]/)[0]; last=key; SFX.flip();
      if(S.phase==='look'&&String(S.round)!==prevRound){ SFX.clack(3); }
      if(S.phase==='show'){ setTimeout(()=>SFX.ding(),200); if(S.res.w===ME){ SFX.reward(); api.toast('Bạn ăn cả bàn: +'+S.res.pot+' xu!',true); FX.confetti(innerWidth/2, innerHeight*.55, 80); } } }
  }
  function tickView(S,ME,api){ const c=root&&root.querySelector('.cd'); if(c) c.textContent=Math.max(0,Math.ceil((BCY_LOOK_MS-(api.now()-S.phaseAt))/1000)); }
  function onClick(e){ const api=Table.API; const b=e.target.closest('[data-a],[data-ante]'); if(!b||b.disabled) return; SFX.pop();
    if(b.dataset.ante) api.act({t:'ante',v:+b.dataset.ante}); else api.act({t:b.dataset.a}); }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
