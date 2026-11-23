/* ===================== GIAO DIỆN POKER ===================== */
const PKUI=(()=>{
  let root=null, last='', shown=0, dealt=-1, raise=0, lastAct=0, lastStreet=-1;
  const $=s=>document.querySelector(s);
  const STREET=['Trước Flop','Flop','Turn','River'];
  function pos(n, rel){ const a=Math.PI/2 + rel*2*Math.PI/n; return {x:50+44*Math.cos(a), y:53+36*Math.sin(a)}; }
  function render(S,ME,api){
    Cards.css();
    if(!root){ document.getElementById('tb-game').innerHTML='<div id="pk"></div>'; root=$('#pk'); root.addEventListener('click',onClick); root.addEventListener('input',onInput); }
    const n=S.seats.length, t=api.now(), me=Math.max(0,ME), res=S.result, pot=PK.pot(S);
    const fresh = S.handNo!==dealt; dealt=S.handNo; const dc=fresh?'deal':'';
    const best = res&&res.bestCards ? res.bestCards : {};
    const winners = res ? res.won.map((w,i)=>w>0?i:-1).filter(i=>i>=0) : [];
    const hl = new Set(); winners.forEach(w=>(best[w]||[]).forEach(c=>hl.add(c)));
    let h=`<div class="felt tbl pk"><div class="arc">TEXAS HOLD'EM · MÙ ${PK_SB}/${PK_BB}</div>
      <div class="center"><div class="board">${[0,1,2,3,4].map(k=>S.board[k]!=null?Cards.face(S.board[k],(k>=shown?'flip ':'')+(hl.has(S.board[k])?'hl':''),k):'<div class="slot"></div>').join('')}</div>
      <div class="pot">${Cards.chip(pot>=500?500:pot>=100?100:50)}<div>Tổng cược <b>${pot}</b></div></div>
      <div class="st">${res?(winners.map(w=>api.esc(S.seats[w].name)).join(', ')+' thắng'+(res.byFold?'':' · '+res.desc[winners[0]])):(S.toAct===ME?'Đến lượt bạn — '+STREET[S.street]:STREET[S.street]+' · chờ '+api.esc(S.seats[S.toAct]?S.seats[S.toAct].name:''))}</div></div>`;
    S.seats.forEach((p,i)=>{ const P=pos(n,(i-me+n)%n), mine=i===ME, fold=S.folded[i];
      const open = mine || (res && !res.byFold && !fold);
      const left = S.toAct===i ? Math.max(0,30-Math.floor((t-S.turnAt)/1000)) : null;
      const role = i===S.btn?'<span class="role d">D</span>':''; const blind = i===S.sbSeat?'<span class="role">SB</span>':i===S.bbSeat?'<span class="role">BB</span>':'';
      let tag=''; if(res&&res.won[i]) tag=`<div class="tag win">+${res.won[i]}${res.desc[i]?' · '+res.desc[i]:''}</div>`; else if(res&&res.desc[i]) tag=`<div class="tag lose">${res.desc[i]}</div>`;
      else if(fold) tag='<div class="tag lose">Bỏ bài</div>'; else if(S.allin[i]) tag='<div class="tag win">Tất tay</div>'; else if(S.lastAct&&S.lastAct.seat===i) tag=`<div class="tag info">${S.lastAct.txt}</div>`;
      h+=`<div class="seatbox ${S.toAct===i?'turn':''} ${fold?'out':''}" style="left:${P.x}%;top:${P.y}%">
        <div class="cards">${S.hands[i].map((c,k)=>open?Cards.face(c,(hl.has(c)?'hl ':'')+dc,k):Cards.back(dc,k)).join('')}</div>${tag}
        <div class="nm">${api.avatar(p.name,i)}<b>${api.esc(p.name)}</b>${mine?' (bạn)':''}${role}${blind}${left!=null?` <span class="tmr">${left}</span>`:''}</div>
        <div class="sub">${S.chips[i]} phỉnh</div>
        ${S.bet[i]?`<div class="betc">${Cards.chip(S.bet[i]>=500?500:S.bet[i]>=100?100:S.bet[i]>=50?50:10)}<span>${S.bet[i]}</span></div>`:''}</div>`; });
    h+=`</div>`;
    if (ME>=0){ const my=S.phase==='hand'&&S.toAct===ME, need=Math.max(0,S.cur-S.bet[ME]), max=S.bet[ME]+S.chips[ME], min=Math.min(max,S.cur+S.minRaise);
      if (!my) raise=0; if (raise<min||raise>max) raise=min;
      const pre=f=>Math.min(max,Math.max(min,S.cur+Math.floor((pot+need)*f)));
      h+=`<div class="ctrl"><div class="btns"><span>Phỉnh: <b>${S.chips[ME]}</b>${need?` · cần theo <b>${Math.min(need,S.chips[ME])}</b>`:''}</span>
        <button class="tbtn" data-a="fold" ${my?'':'disabled'}>Bỏ bài</button>
        ${need?`<button class="tbtn pri" data-a="call" ${my?'':'disabled'}>Theo ${Math.min(need,S.chips[ME])}</button>`:`<button class="tbtn pri" data-a="check" ${my?'':'disabled'}>Xem (check)</button>`}
        <button class="tbtn gold" data-a="raise" ${my&&max>S.cur?'':'disabled'}>${raise>=max?'Tất tay '+max:(S.cur?'Tố lên ':'Cược ')+raise}</button></div>
        ${my&&max>S.cur?`<div class="btns rz"><input type="range" min="${min}" max="${max}" step="10" value="${raise}" data-r>
          <button class="tbtn sm" data-p="${pre(.5)}">½ hũ</button><button class="tbtn sm" data-p="${pre(1)}">1 hũ</button><button class="tbtn sm" data-p="${max}">Tất tay</button></div>`:''}</div>`; }
    h+=`<div class="xlog">${S.log.slice(0,5).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div><p class="note">Chơi bằng phỉnh ảo để giải trí, không quy đổi thành tiền. Hết phỉnh sẽ được cấp lại ${PK_START}.</p>`;
    root.innerHTML=h; shown=S.board.length;
    const key=S.handNo+'|'+S.street+'|'+(S.lastAct?S.lastAct.n:0)+'|'+S.phase;
    if (key!==last){ last=key;
      if (S.lastAct && S.lastAct.n!==lastAct){ lastAct=S.lastAct.n; const k=S.lastAct.k; if(k==='fold') SFX.flip(); else if(k==='check') SFX.pop(); else SFX.clack(k==='raise'?3:2); }
      if (S.street!==lastStreet){ if(S.street>0) SFX.flip(); lastStreet=S.street; }
      if (S.phase==='hand' && S.toAct===ME) SFX.hiss&&SFX.hiss();
      if (res && winners.includes(ME)){ SFX.reward(); api.toast('Bạn ăn '+res.won[ME]+' phỉnh!',true); FX.confetti(innerWidth/2, innerHeight*.5, 70); } }
  }
  function tickView(S,ME,api){ const el=root&&root.querySelector('.seatbox.turn .tmr'); if(el) el.textContent=Math.max(0,30-Math.floor((api.now()-S.turnAt)/1000)); }
  function onInput(e){ if(e.target.dataset.r!=null){ raise=+e.target.value; const b=root.querySelector('[data-a="raise"]'); const max=+e.target.max; if(b) b.textContent=raise>=max?'Tất tay '+max:'Tố lên '+raise; } }
  function onClick(e){ const api=Table.API; const b=e.target.closest('[data-a],[data-p]'); if(!b||b.disabled) return; SFX.pop();
    if (b.dataset.p){ raise=+b.dataset.p; const r=root.querySelector('[data-r]'); if(r){ r.value=raise; onInput({target:r}); } return; }
    const a=b.dataset.a; if(a==='raise') api.act({t:'raise',to:raise}); else api.act({t:a}); }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
