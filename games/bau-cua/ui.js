/* ===================== GIAO DIỆN BẦU CUA ===================== */
const BCART = {
  nai:`<ellipse cx="50" cy="62" rx="15" ry="20" fill="#b9814f"/><path d="M38 50 Q34 30 22 22 M30 34 L20 34 M34 28 L28 18 M62 50 Q66 30 78 22 M70 34 L80 34 M66 28 L72 18" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>
       <ellipse cx="36" cy="54" rx="7" ry="4" fill="#a86b3c" transform="rotate(-30 36 54)"/><ellipse cx="64" cy="54" rx="7" ry="4" fill="#a86b3c" transform="rotate(30 64 54)"/><circle cx="44" cy="60" r="2.6" fill="#222"/><circle cx="56" cy="60" r="2.6" fill="#222"/><ellipse cx="50" cy="78" rx="5" ry="4" fill="#3a2414"/><circle cx="50" cy="66" r="1.6" fill="#fff" opacity=".6"/>`,
  bau:`<path d="M50 14 Q56 10 60 14" stroke="#5b3a1c" stroke-width="4" fill="none"/><path d="M58 14 Q74 6 78 20 Q66 22 58 14Z" fill="#6fbf4a"/><circle cx="50" cy="34" r="12" fill="#7cc25b"/><ellipse cx="50" cy="64" rx="22" ry="24" fill="#5fa83f"/><ellipse cx="42" cy="58" rx="6" ry="10" fill="#fff" opacity=".25"/><circle cx="46" cy="30" r="3.5" fill="#fff" opacity=".3"/>`,
  ga:`<path d="M72 46 Q92 30 86 62 Q80 50 70 58Z" fill="#2f7a4d"/><path d="M74 42 Q96 40 88 70 Q82 56 72 60Z" fill="#e2a12f"/><ellipse cx="54" cy="62" rx="22" ry="18" fill="#f07b2f"/><circle cx="34" cy="40" r="11" fill="#f07b2f"/><path d="M28 30 Q30 22 34 28 Q36 20 40 28 Q44 22 42 32Z" fill="#d42a2a"/><path d="M23 41 L15 44 L23 47Z" fill="#f2c230"/><path d="M27 48 Q25 56 31 52Z" fill="#d42a2a"/><circle cx="32" cy="38" r="2.2" fill="#222"/><path d="M48 78 L46 90 M58 78 L60 90" stroke="#d99a2b" stroke-width="3"/><path d="M44 62 Q56 52 66 64" stroke="#c95a1c" stroke-width="3" fill="none"/>`,
  ca:`<path d="M70 50 L90 34 L86 50 L90 66Z" fill="#1f6fae"/><ellipse cx="46" cy="50" rx="30" ry="18" fill="#3b95d8"/><path d="M40 32 Q50 22 58 34Z" fill="#1f6fae"/><path d="M42 66 Q50 76 56 66Z" fill="#1f6fae"/><circle cx="26" cy="46" r="4" fill="#fff"/><circle cx="25" cy="46" r="2" fill="#222"/><path d="M36 42 Q40 50 36 58" stroke="#1f6fae" stroke-width="2" fill="none"/><path d="M46 44 L52 50 L46 56 M56 44 L62 50 L56 56" stroke="#9fd0f2" stroke-width="2" fill="none"/>`,
  cua:`<path d="M24 58 L10 66 M24 64 L12 76 M30 68 L22 82 M76 58 L90 66 M76 64 L88 76 M70 68 L78 82" stroke="#b52b2b" stroke-width="4" stroke-linecap="round"/><path d="M30 44 Q16 30 22 18 Q30 26 26 30 Q36 30 34 42Z" fill="#d23a3a"/><path d="M70 44 Q84 30 78 18 Q70 26 74 30 Q64 30 66 42Z" fill="#d23a3a"/><ellipse cx="50" cy="58" rx="26" ry="18" fill="#e04848"/><ellipse cx="44" cy="52" rx="10" ry="5" fill="#fff" opacity=".22"/><path d="M42 42 L40 34 M58 42 L60 34" stroke="#b52b2b" stroke-width="3"/><circle cx="40" cy="33" r="3.5" fill="#222"/><circle cx="60" cy="33" r="3.5" fill="#222"/>`,
  tom:`<path d="M30 30 Q8 18 6 6 M34 28 Q20 10 26 4" stroke="#d95b7a" stroke-width="2" fill="none"/><path d="M30 34 Q56 20 72 40 Q84 56 70 72 Q62 80 54 74" fill="none" stroke="#ef7b9a" stroke-width="16" stroke-linecap="round"/><path d="M40 30 Q42 40 38 44 M52 30 Q54 40 50 46 M64 38 Q62 48 58 52 M70 54 Q64 58 62 64" stroke="#d95b7a" stroke-width="2.4" fill="none"/><path d="M54 74 L40 80 L46 68Z" fill="#d95b7a"/><circle cx="30" cy="34" r="3" fill="#222"/>`
};
const BCUI=(()=>{
  let chip=10, root=null, lastPhase='', lastRound=-1;
  const $=s=>document.querySelector(s);
  const art=(i,size)=>`<svg viewBox="0 0 100 100" width="${size||'100%'}" height="${size||'100%'}">${BCART[BC_SYM[i].id]}</svg>`;
  function die(i){ return `<div class="die" style="--c:${BC_SYM[i].col}">${art(i)}</div>`; }
  function render(S, ME, api){
    if(!root){ document.getElementById('tb-game').innerHTML='<div class="bc" id="bc"></div>'; root=$('#bc'); root.addEventListener('click',onClick); }
    const t=api.now(), me=ME>=0;
    const cnt=[0,0,0,0,0,0]; if(S.phase==='show') S.dice.forEach(d=>cnt[d]++);
    const tot=[0,1,2,3,4,5].map(s=>S.bets.reduce((a,b)=>a+b[s],0));
    const left=S.phase==='bet'?Math.max(0,Math.ceil((20000-(t-S.phaseAt))/1000)):0;
    const status = S.phase==='bet' ? (me&&S.ready[ME]?'Đã chốt cược — chờ mọi người':'Đặt cược đi nào!') : S.phase==='roll' ? 'Đang lắc bát…' : 'Mở bát!';
    let h=`<div class="bc-main"><div class="bc-top"><div class="bowlwrap ${S.phase}"><div class="plate"></div><div class="dice">${S.dice&&S.phase==='show'?S.dice.map(die).join(''):'<div class="die q"></div><div class="die q"></div><div class="die q"></div>'}</div><div class="bowl"><span>${S.phase==='roll'?'Lắc…':''}</span></div></div>
      <div class="bc-info"><div class="rnd">Ván ${S.round}</div><div class="st">${status}</div>${S.phase==='bet'?`<div class="cd ${left<=5?'hot':''}"><b>${left}</b> giây</div>`:''}
      <div class="hist">${S.history.slice(0,8).map(r=>`<span>${r.map(d=>`<i style="--c:${BC_SYM[d].col}">${art(d,22)}</i>`).join('')}</span>`).join('')}</div></div></div>
      <div class="board">${BC_SYM.map((s,i)=>{ const mine=me?S.bets[ME][i]:0; const who=S.seats.map((p,j)=>S.bets[j][i]?api.avatar(p.name,j):'').join('');
        return `<button class="tile ${cnt[i]?'win w'+cnt[i]:''} ${S.phase==='show'&&!cnt[i]?'lose':''}" data-s="${i}" style="--c:${s.col}" ${S.phase!=='bet'||!me||S.ready[ME]?'disabled':''}>
          <div class="art">${art(i)}</div><div class="nm">${s.name}</div>${cnt[i]?`<div class="mul">×${cnt[i]}</div>`:''}
          <div class="tot">${tot[i]?tot[i]+' xu':''}</div>${mine?`<div class="mychip">${mine}</div>`:''}<div class="avs">${who}</div></button>`; }).join('')}</div>`;
    if (me){ const placed=S.bets[ME].reduce((a,b)=>a+b,0), dis=S.phase!=='bet'||S.ready[ME];
      h+=`<div class="ctrl"><div class="chips">${BC_CHIPS.map(c=>`<button class="chip ${c===chip?'on':''} c${c}" data-chip="${c}" ${S.coins[ME]<c?'disabled':''}>${c}</button>`).join('')}</div>
        <div class="cbtn"><span class="mc">Xu của bạn: <b>${S.coins[ME]}</b>${placed?` · đang cược ${placed}`:''}</span><button class="tbtn" data-a="undo" ${dis||!placed?'disabled':''}>Huỷ cược</button><button class="tbtn pri" data-a="ready" ${dis?'disabled':''}>Chốt cược</button></div></div>`; }
    h+=`<p class="note">Chơi bằng xu ảo để giải trí, không quy đổi thành tiền.</p></div>`;
    h+=`<aside class="bc-side"><h3>Người chơi</h3>${S.seats.map((p,i)=>{ const d=S.delta&&S.phase==='show'?S.delta[i]:null; const b=S.bets[i].reduce((a,c)=>a+c,0);
        return `<div class="pl ${i===ME?'me':''}">${api.avatar(p.name,i)}<div class="pi"><b>${api.esc(p.name)}</b>${i===ME?' <small>(bạn)</small>':''}${p.bot?' <small>máy</small>':''}<div class="pc2">${S.coins[i]} xu${b&&S.phase!=='show'?` · cược ${b}`:''}</div></div>
          ${d!=null&&d!==0?`<span class="dl ${d>0?'up':'down'}">${d>0?'+':''}${d}</span>`:(S.phase==='bet'?`<span class="rd ${S.ready[i]?'y':''}">${S.ready[i]?'Đã chốt':'Đang cược'}</span>`:'')}</div>`; }).join('')}
      <h3>Diễn biến</h3><div class="lg">${S.log.slice(0,8).map(l=>`<div>${api.esc(l)}</div>`).join('')||'<div>Ván đầu tiên — đặt cược nào!</div>'}</div></aside>`;
    root.innerHTML=h;
    // âm thanh / hiệu ứng theo giai đoạn
    const key=S.round+':'+S.phase;
    if (key!==lastPhase){ lastPhase=key;
      if (S.phase==='roll'){ SFX.clack(6); setTimeout(()=>SFX.clack(5),700); setTimeout(()=>SFX.clack(4),1400); }
      if (S.phase==='show'){ SFX.paper(); setTimeout(()=>SFX.ding(),250);
        if (me && S.delta){ const d=S.delta[ME]; if (d>0){ setTimeout(()=>SFX.reward(),500); api.toast(`Bạn thắng <b>+${d}</b> xu!`, true); const r=$('.board').getBoundingClientRect(); FX.confetti(r.left+r.width/2, r.top+r.height/2, d>=200?110:50); }
          else if (d<0){ api.toast(`Bạn thua ${-d} xu`); SFX.error(); } } }
      if (S.phase==='bet' && S.round>1) SFX.turn();
    }
  }
  function tickView(S,ME,api){ if(!root||S.phase!=='bet') return; const left=Math.max(0,Math.ceil((20000-(api.now()-S.phaseAt))/1000)); const e=root.querySelector('.cd'); if(e){ e.querySelector('b').textContent=left; e.classList.toggle('hot',left<=5); } if(left<=5&&left>0&&left!==tickView.l&&ME>=0&&!S.ready[ME]){ tickView.l=left; SFX.tick(left%2,true); } }
  function onClick(e){ const api=Table.API, S=window.__S; if(!S) return;
    const c=e.target.closest('[data-chip]'); if(c){ chip=+c.dataset.chip; SFX.pop(); render(S,api.me(),api); return; }
    const tl=e.target.closest('.tile'); if(tl && !tl.disabled){ if(S.coins[api.me()]<chip){ api.toast('Không đủ xu'); return; } SFX.flip(); api.act({t:'bet', s:+tl.dataset.s, v:chip}); return; }
    const b=e.target.closest('[data-a]'); if(b && !b.disabled) api.act({t:b.dataset.a});
  }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
