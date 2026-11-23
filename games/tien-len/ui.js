/* ===================== GIAO DIỆN TIẾN LÊN ===================== */
const TLUI = (()=>{
  let sel=new Set(), lastSeq=-1, lastTurnKey='', lastOver=false, root=null;
  const $=s=>document.querySelector(s);
  function cardHTML(c, cls, i){ const red=isRed(c);
    return `<div class="pc ${red?'red':''} ${cls||''}" data-c="${c}" style="${i!=null?`--i:${i}`:''}"><span class="tl">${RANKS[rk(c)]}<br>${SUITS[su(c)]}</span><span class="mid">${SUITS[su(c)]}</span><span class="br">${RANKS[rk(c)]}<br>${SUITS[su(c)]}</span></div>`; }
  function backs(n){ let s=''; for(let i=0;i<Math.min(n,13);i++) s+=`<div class="pc back" style="--i:${i}"></div>`; return s; }
  function posOf(S, seat, me){ const n=S.seats.length, rel=(seat-Math.max(0,me)+n)%n;
    const map={2:['bottom','top'],3:['bottom','right','left'],4:['bottom','right','top','left']}[n]; return map[rel]; }
  function render(S, ME, api){
    if (!root){ document.getElementById('tb-game').innerHTML=`<div class="tl-table" id="tl"></div>`; root=$('#tl'); root.addEventListener('click', onClick); }
    const n=S.seats.length, t=api.now();
    if (S.over) sel.clear();
    if (ME>=0) [...sel].forEach(c=>{ if(!S.hands[ME].includes(c)) sel.delete(c); });
    let html=`<div class="felt"><div class="rim"></div>`;
    S.seats.forEach((p,i)=>{ if(i===ME) return; const pos=posOf(S,i,ME);
      const left=Math.max(0, 30-Math.floor((t-S.turnAt)/1000));
      html+=`<div class="seat ${pos} ${S.turn===i&&!S.over?'turn':''} ${S.passed[i]?'passed':''}" style="--pc:${p.color}">
        <div class="who">${api.avatar(p.name,i)}<div><b>${api.esc(p.name)}</b>${p.bot?' <small>máy</small>':''}<div class="sc">${S.hands[i].length} lá · ${S.scores[i]>=0?'+':''}${S.scores[i]} điểm</div></div>${S.turn===i&&!S.over?`<span class="tm">${left}</span>`:''}</div>
        <div class="fan">${backs(S.hands[i].length)}</div>${S.passed[i]&&!S.over?'<div class="bub">Bỏ lượt</div>':''}</div>`; });
    // giữa bàn
    const L=S.last, fresh=L && L.seq!==lastSeq;
    html+=`<div class="center">`;
    if (S.pile){ const from=posOf(S,S.pile.by,ME);
      html+=`<div class="pile ${fresh&&L.cards?'in-'+from:''}">${S.pile.cards.map((c,i)=>cardHTML(c,'',i)).join('')}</div><div class="plabel">${api.esc(S.seats[S.pile.by].name)} — ${TL.label(S.pile)}</div>`; }
    else if (!S.over) html+=`<div class="plabel big">${S.turn===ME?'Bạn được đánh tự do':api.esc(S.seats[S.turn].name)+' đang ra bài'}</div>`;
    html+=`<div class="round">Ván ${S.round}</div></div>`;
    // tay bài của tôi
    if (ME>=0){ const me=S.seats[ME], hand=S.hands[ME], my=S.turn===ME && !S.over;
      const cb=TL.classify([...sel]), can = my && sel.size && cb && TL.beats(cb,S.pile);
      const left=Math.max(0, 30-Math.floor((t-S.turnAt)/1000));
      html+=`<div class="mine ${my?'turn':''}" style="--pc:${me.color}">
        <div class="mybar"><div class="who">${api.avatar(me.name,ME)}<div><b>${api.esc(me.name)}</b> <small>(bạn)</small><div class="sc">${S.scores[ME]>=0?'+':''}${S.scores[ME]} điểm</div></div></div>
          <div class="hint">${my?(sel.size?(cb?(TL.beats(cb,S.pile)?'<span class="ok">'+TL.label(cb)+'</span>':'<span class="no">'+TL.label(cb)+' — chưa đủ lớn</span>'):'<span class="no">Bộ bài không hợp lệ</span>'):(S.pile?'Chọn bài lớn hơn để chặn, hoặc bỏ lượt':'Lượt của bạn — chọn bài để đánh')):(S.over?'':'Chờ '+api.esc(S.seats[S.turn].name)+'…')}</div>
          ${my?`<span class="tm big ${left<=10?'hot':''}">${left}</span>`:''}</div>
        <div class="hand" style="--n:${hand.length}">${hand.map((c,i)=>cardHTML(c, sel.has(c)?'sel':'', i)).join('')}</div>
        <div class="acts"><button class="tbtn" data-a="hint" ${my?'':'disabled'}>Gợi ý</button><button class="tbtn" data-a="clear" ${sel.size?'':'disabled'}>Bỏ chọn</button>
          <button class="tbtn" data-a="pass" ${my&&S.pile?'':'disabled'}>Bỏ lượt</button><button class="tbtn pri" data-a="play" ${can?'':'disabled'}>Đánh bài</button></div></div>`;
    } else html+=`<div class="mine"><div class="hint">Bạn đang xem ván này.</div></div>`;
    html+=`</div><div class="tlog">${S.log.slice(0,6).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div>`;
    root.innerHTML=html;
    // hiệu ứng & âm thanh
    if (fresh){ lastSeq=L.seq;
      if (L.pass) SFX.pop(); else { SFX.flip(); setTimeout(()=>SFX.flip(),70); if (L.cards.length>=3) setTimeout(()=>SFX.clack(2),120); }
      if (L.chop){ SFX.rumble(); api.toast('CHẶT! '+api.esc(S.seats[L.seat].name)+' — '+TL.label(S.pile), true); const fl=$('.felt'); fl.classList.remove('shake'); void fl.offsetWidth; fl.classList.add('shake'); const r=$('.pile').getBoundingClientRect(); FX.confetti(r.left+r.width/2, r.top+r.height/2, 60); }
    }
    const tk=S.turn+':'+S.seq; if (tk!==lastTurnKey){ lastTurnKey=tk; if (S.turn===ME && !S.over) SFX.turn(); }
    if (S.over && !lastOver){ lastOver=true; setTimeout(()=>endModal(S,ME,api), 700); if (S.winner===ME){ SFX.fanfare(); FX.rain(4); } else SFX.chime(); }
    if (!S.over) lastOver=false;
  }
  function tickView(S, ME, api){ if (!root || S.over) return; const t=api.now(); const left=Math.max(0,30-Math.floor((t-S.turnAt)/1000));
    root.querySelectorAll('.tm').forEach(e=>{ e.textContent=left; e.classList.toggle('hot', left<=10); });
    if (S.turn===ME && left<=10 && left>0 && left!==tickView.l){ tickView.l=left; SFX.tick(left%2, true); } }
  function endModal(S, ME, api){
    const res=S.result.slice().sort((a,b)=>a.pen-b.pen);
    api.modal(S.winner===ME?'Bạn thắng ván này!':api.esc(S.seats[S.winner].name)+' thắng ván!', `<table class="rt"><tr><th>Người chơi</th><th>Còn lại</th><th>Ván này</th><th>Tổng</th></tr>${res.map(r=>`<tr class="${r.i===S.winner?'w':''}"><td>${api.avatar(S.seats[r.i].name,r.i)} ${api.esc(S.seats[r.i].name)}</td><td>${r.i===S.winner?'Hết bài':r.left+' lá'+(r.twos?` (${r.twos} heo)`:'')+(r.cong?' — cóng':'')}</td><td><b>${r.pen<=0?'+':'−'}${Math.abs(r.pen)}</b></td><td>${S.scores[r.i]}</td></tr>`).join('')}</table><p style="font-size:13.5px;color:#555268">Mỗi lá còn lại trừ 1 điểm, mỗi heo (lá 2) còn lại trừ thêm 4, bị cóng (chưa đánh lá nào) trừ gấp đôi.</p>`,
      [{t:api.mode()==='client'?'Chờ ván mới':'Chơi ván tiếp', pri:1, f:()=>api.rematch()},{t:'Xem bàn'}]);
  }
  function onClick(e){
    const api=Table.API; const c=e.target.closest('.mine .pc'); const b=e.target.closest('[data-a]');
    const S=window.__S; if (!S) return; const ME=api.me();
    if (c){ const v=+c.dataset.c; sel.has(v)?sel.delete(v):sel.add(v); SFX.pop(); render(S,ME,api); return; }
    if (!b || b.disabled) return;
    const a=b.dataset.a;
    if (a==='clear'){ sel.clear(); render(S,ME,api); }
    if (a==='pass'){ sel.clear(); api.act({t:'pass'}); }
    if (a==='play'){ const cs=[...sel]; sel.clear(); api.act({t:'play', c:cs}); }
    if (a==='hint'){ const all=TL.combos(S.hands[ME]).filter(x=>TL.beats(x.cb,S.pile)).sort((x,y)=>x.cb.top-y.cb.top);
      if (!all.length){ api.toast('Không có bài nào chặn được — hãy bỏ lượt'); return; }
      const i=(onClick.h=(onClick.h||0)+1)%all.length; sel=new Set(all[i].cards); render(S,ME,api); }
  }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
