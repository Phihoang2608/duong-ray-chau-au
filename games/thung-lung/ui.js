/* ===================== THUNG LŨNG HÒA SẮC — GIAO DIỆN ===================== */
const TLUI=(()=>{
  const A=TLART, $=s=>document.querySelector(s);
  let curApi=null, root=null, selT=0, selCard=null, lastKey='';
  const TN=TL_TN;
  function hint(S,ME,my){
    if(S.phase==='over') return '🏆 '+S.seats[S.winner].name+' thắng!';
    if(!my) return 'Chờ <b>'+S.seats[S.turn].name+'</b>…';
    return {take:'<b>Lượt bạn!</b> Chọn 1 nhóm đất bên dưới để lấy',
      place:'Chạm 1 mảnh đất, rồi chạm ô sáng để đặt',
      animal:selCard!=null?'Chạm ô sáng để đặt <b>'+TL.A[selCard].name+'</b>':'Nhận 1 thẻ con vật, hoặc đặt con vật vào ô sáng. Xong thì <b>Kết thúc lượt</b>'}[S.step]||''; }
  function render(S,ME,api){
    if(!root){ document.getElementById('tb-game').innerHTML='<div class="thl" id="thl"></div>'; root=$('#thl'); root.addEventListener('click',e=>onClick(e)); }
    window.__TS=S; curApi=api; const my=S.phase==='play'&&S.turn===ME, P=ME>=0?S.P[ME]:null, esc=api.esc;
    const key=S.turns+':'+S.step+':'+S.turn; if(key!==lastKey){ lastKey=key; selT=0; selCard=null; }
    if(S.step!=='place') selT=0; if(selT>=S.tray.length) selT=Math.max(0,S.tray.length-1);
    // ô sáng
    const hl={}; if(my&&P){ if(S.step==='place'&&S.tray.length) TL.legal(P.board,S.tray[selT]).forEach(k=>hl[k]=1);
      else if(S.step==='animal'){ (selCard!=null?[selCard]:P.hand).forEach(id=>TL.spots(P,id).forEach(k=>hl[k]=1)); } }
    const sc=S.P.map(p=>TL.score(p));
    let h=`<div class="thl-note">${esc(S.log[0]||'')}</div><div class="thl-body">`;
    // chợ đất
    h+=`<section class="mk"><div class="slots">${S.slots.map((s,i)=>`<div class="slot ${my&&S.step==='take'&&s.length?'go':''}" data-slot="${i}"><div class="tk">${s.map(t=>A.token(t,34,1)).join('')}</div>${my&&S.step==='take'&&s.length?'<button class="tb gold" data-slot="'+i+'">Lấy</button>':'<span class="ph">&nbsp;</span>'}</div>`).join('')}</div>`;
    h+=`<div class="arow">${S.row.map(id=>`<div class="ac">${A.card(TL.A[id],{cls:'sm'})}${my&&S.step==='animal'&&TL.canCard(S,P)?`<button class="tb gold" data-card="${id}">Lấy thẻ</button>`:'<span class="ph">&nbsp;</span>'}</div>`).join('')}</div></section>`;
    // thung lũng của tôi
    if(P){ h+=`<section class="mine ${my?'turn':''}"><div class="mh"><b>${esc(S.seats[ME].name)}</b><span class="sc">${sc[ME].total} điểm</span><small>Đất ${sc[ME].terrain} · Vật ${sc[ME].animals}</small></div>
      <div class="hint">${hint(S,ME,my)}</div><div class="bd">${A.boardSvg(P.board,{s:40,hl})}</div>`;
      if(my&&S.step==='place') h+=`<div class="tray">${S.tray.map((t,i)=>`<div class="tr ${i===selT?'on':''}" data-tray="${i}">${A.token(t,56,1)}<small>${TN[t]}</small></div>`).join('')}</div>`;
      if(my&&S.step==='animal') h+=`<div class="acts"><button class="tb pri" data-end="1">Kết thúc lượt</button></div>`;
      h+=`<div class="hand">${P.hand.length?P.hand.map(id=>{ const can=my&&S.step==='animal'&&TL.spots(P,id).length>0; return A.card(TL.A[id],{cubes:P.cubes[id]||0,cls:(can?'can ':'')+(selCard===id?'sel':''),attr:`data-hand="${id}"`}); }).join(''):'<span class="mute">Chưa có thẻ con vật — lấy thẻ ở hàng trên mỗi lượt</span>'}</div></section>`; }
    // đối thủ
    h+=`<section class="opps">${S.seats.map((p,i)=>i===ME?'':`<div class="op ${S.turn===i&&S.phase==='play'?'turn':''}"><div class="mh"><b>${esc(p.name)}</b><span class="sc">${sc[i].total}</span></div>${A.boardSvg(S.P[i].board,{s:20,mini:1})}<div class="oh">${S.P[i].hand.map(id=>`<span class="oa" title="${TL.A[id].name}">${A.animal(TL.A[id].k,26)}<i>${S.P[i].cubes[id]||0}/${TL.A[id].s.length}</i></span>`).join('')}</div></div>`).join('')}</section></div>`;
    if(S.phase==='over'){ h+=`<div class="thl-res"><div class="rp"><h3>🏆 ${esc(S.seats[S.winner].name)} thắng!</h3>${S.seats.map((p,i)=>({p,i,s:sc[i]})).sort((a,b)=>b.s.total-a.s.total).map(r=>`<div class="rr ${r.i===S.winner?'w':''}"><b>${esc(r.p.name)}</b><span>${r.s.total}</span><small>Rừng ${r.s.t.rung} · Núi ${r.s.t.nui} · Đồng ${r.s.t.dong} · Nhà ${r.s.t.nha} · Hồ ${r.s.t.ho} · Vật ${r.s.animals}</small></div>`).join('')}${api.mode()!=='client'?'<button class="tb pri" data-again="1">Chơi ván mới</button>':'<p class="mute">Chờ chủ phòng bắt đầu ván mới</p>'}</div></div>`; }
    root.innerHTML=h;
  }
  function onClick(e){ const api=curApi, S=window.__TS, ME=api.me(); if(!S) return; const my=S.phase==='play'&&S.turn===ME, P=S.P[ME];
    if(e.target.closest('[data-again]')){ api.rematch(); return; }
    if(!my) return;
    let el;
    if((el=e.target.closest('button[data-slot]'))&&S.step==='take'){ api.act({t:'take',slot:+el.dataset.slot}); return; }
    if((el=e.target.closest('.slot[data-slot]'))&&S.step==='take'){ api.act({t:'take',slot:+el.dataset.slot}); return; }
    if((el=e.target.closest('[data-card]'))&&S.step==='animal'){ api.act({t:'card',id:+el.dataset.card}); return; }
    if(e.target.closest('[data-end]')){ api.act({t:'end'}); return; }
    if((el=e.target.closest('[data-tray]'))&&S.step==='place'){ selT=+el.dataset.tray; render(S,ME,api); return; }
    if((el=e.target.closest('[data-hand]'))&&S.step==='animal'){ const id=+el.dataset.hand; if(!TL.spots(P,id).length){ api.toast('Chưa có ô nào hợp cho '+TL.A[id].name); return; } selCard=selCard===id?null:id; render(S,ME,api); return; }
    if((el=e.target.closest('.mine [data-hex]'))){ const k=el.dataset.hex;
      if(S.step==='place'){ if(selT<S.tray.length&&TL.canPlace(P.board,k,S.tray[selT])) api.act({t:'place',i:selT,hex:k}); else api.toast('Không đặt được vào ô này'); return; }
      if(S.step==='animal'){ const c=selCard!=null?(TL.spots(P,selCard).indexOf(k)>=0?[selCard]:[]):P.hand.filter(id=>TL.spots(P,id).indexOf(k)>=0);
        if(c.length===1){ api.act({t:'cube',id:c[0],hex:k}); selCard=null; } else if(c.length>1) api.toast('Chạm thẻ con vật muốn đặt trước'); else api.toast('Con vật chưa hợp ô này'); return; } } }
  return {render,tickView(){}};
})();
