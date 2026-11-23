/* ===================== GIAO DIỆN THƯƠNG NHÂN ĐÁ QUÝ ===================== */
const DQUI=(()=>{
  const GC=['#16a34a','#2563eb','#dc2626','#f1f5f9','#27272a','#f59e0b'], GD=['#065f2c','#1e3a8a','#7f1d1d','#94a3b8','#000','#92400e'], GL=['#86efac','#93c5fd','#fca5a5','#fff','#71717a','#fde68a'];
  const LVN={1:'Mỏ đá',2:'Xưởng chế tác',3:'Thương điếm'};
  let root=null, sel=[], pick=null, seen=new Set(), lastEv=0, first=true;
  const $=s=>document.querySelector(s);
  function gem(c,sz){ sz=sz||22; const f=GC[c], d=GD[c], l=GL[c];
    const shapes=[ // mỗi loại một kiểu cắt
      `<polygon points="12,1 22,8 18,22 6,22 2,8" fill="${f}" stroke="${d}" stroke-width="1.3"/><polygon points="12,5 18,9 15,18 9,18 6,9" fill="${l}" opacity=".45"/>`,
      `<polygon points="12,1 23,12 12,23 1,12" fill="${f}" stroke="${d}" stroke-width="1.3"/><polygon points="12,5 18,12 12,19 6,12" fill="${l}" opacity=".45"/>`,
      `<polygon points="7,2 17,2 23,9 12,23 1,9" fill="${f}" stroke="${d}" stroke-width="1.3"/><path d="M1 9 L23 9 M7 2 L9 9 L12 23 L15 9 L17 2" fill="none" stroke="${l}" stroke-width="1" opacity=".7"/>`,
      `<polygon points="6,2 18,2 23,8 12,23 1,8" fill="${f}" stroke="${d}" stroke-width="1.3"/><polyline points="1,8 23,8" stroke="${d}" stroke-width="1"/><polyline points="6,2 9,8 12,23 15,8 18,2" fill="none" stroke="${d}" stroke-width=".9" opacity=".7"/>`,
      `<rect x="3" y="3" width="18" height="18" rx="4" transform="rotate(45 12 12)" fill="${f}" stroke="${d}" stroke-width="1.3"/><circle cx="9" cy="9" r="3" fill="${l}" opacity=".6"/>`,
      `<circle cx="12" cy="12" r="10.5" fill="${f}" stroke="${d}" stroke-width="1.3"/><polygon points="12,5 14,10 19,10 15,13 16.5,18 12,15 7.5,18 9,13 5,10 10,10" fill="${l}"/>`];
    return `<svg class="gem" width="${sz}" height="${sz}" viewBox="0 0 24 24">${shapes[c]}</svg>`; }
  function costs(card){ return card.cost.map((v,c)=>v?`<span class="cc" style="--g:${GC[c]};--d:${GD[c]}" ${c===3?'data-w':''}>${v}</span>`:'').join(''); }
  function cardHTML(id, attrs, cls){ const c=DQ.CARDS[id];
    return `<div class="dqc lv${c.lv} col${c.col} ${cls||''}" ${attrs||''}><div class="art"></div><div class="hd">${c.pts?`<b>${c.pts}</b>`:'<i></i>'}${gem(c.col,26)}</div><div class="costs">${costs(c)}</div></div>`; }
  function noble(id,cls){ const N=DQ.NOBLES[id]; return `<div class="dqn ${cls||''}" title="${DQ.NOBLE_NAMES[id]}"><b>3</b><div class="req">${N.req.map((v,c)=>v?`<span class="rq" style="--g:${GC[c]};--d:${GD[c]}" ${c===3?'data-w':''}>${v}</span>`:'').join('')}</div><div class="nn">${DQ.NOBLE_NAMES[id]}</div></div>`; }
  function validTake(S){ if(!sel.length) return false; if(sel.length===2&&sel[0]===sel[1]) return S.bank[sel[0]]>=4; const avail=[0,1,2,3,4].filter(c=>S.bank[c]>0).length; return sel.length===Math.min(3,avail); }
  function render(S,ME,api){
    if(!root){ document.getElementById('tb-game').innerHTML='<div id="dq"></div>'; root=$('#dq'); root.addEventListener('click',onClick); }
    const n=S.seats.length, t=api.now(), my=S.phase==='play'&&S.turn===ME, P=ME>=0?S.P[ME]:null;
    if (!my){ sel=[]; if(pick&&pick.res==null) pick=null; }
    const newIds=[]; [1,2,3].forEach(lv=>S.board[lv].forEach(id=>{ if(id!=null&&!seen.has(id)){ seen.add(id); if(!first) newIds.push(id); } })); first=false;
    let h=`<div class="dqwrap"><div class="dqboard"><div class="nobles">${S.nobles.map(id=>noble(id)).join('')}</div>`;
    [3,2,1].forEach(lv=>{ h+=`<div class="row"><div class="deck lv${lv} ${pick&&pick.deck===lv?'pk':''}" data-deck="${lv}"><span>${LVN[lv]}</span><b>${S.decks[lv].length}</b><em>${'◆'.repeat(lv)}</em></div>`;
      S.board[lv].forEach((id,i)=>{ h+= id==null?'<div class="dqc empty"></div>':cardHTML(id,`data-lv="${lv}" data-i="${i}"`,(newIds.includes(id)?'flip ':'')+(pick&&pick.lv===lv&&pick.i===i?'pk ':'')+(P&&DQ.payPlan(P,DQ.CARDS[id])?'can':'')); });
      h+=`</div>`; });
    h+=`</div><div class="bank"><div class="bt">Ngân khố</div>${S.bank.map((v,c)=>`<div class="tok ${sel.includes(c)?'on':''} ${c===5?'gold':''}" data-tok="${c}" title="${DQ_COL[c]}">${gem(c,30)}<span>${v}</span>${sel.filter(x=>x===c).length>1?'<i>×2</i>':''}</div>`).join('')}
      <button class="tbtn pri" data-a="take" ${my&&S.step==='main'&&validTake(S)?'':'disabled'}>Lấy đá</button>
      <small>Chọn 3 màu khác nhau, hoặc bấm 2 lần 1 màu (còn từ 4 viên) để lấy 2.</small></div>
      <div class="players">${S.seats.map((p,i)=>{ const Q=S.P[i]; return `<div class="pl ${S.turn===i?'turn':''} ${i===ME?'me':''} ${S.phase==='over'&&S.winner===i?'win':''}">
        <div class="ph">${api.avatar(p.name,i)}<b>${api.esc(p.name)}</b>${i===ME?' (bạn)':''}${S.turn===i?` <span class="tmr">${Math.max(0,60-Math.floor((t-S.turnAt)/1000))}</span>`:''}<span class="pts">${Q.pts}</span></div>
        <div class="gr">${[0,1,2,3,4,5].map(c=>`<div class="gc">${c<5?`<span class="bn" style="--g:${GC[c]};--d:${GD[c]}" ${c===3?'data-w':''}>${Q.bonus[c]}</span>`:'<span class="bn ph0"></span>'}<span class="tk" ${i===ME&&S.step==='discard'&&my&&Q.tok[c]?`data-ret="${c}"`:''}>${gem(c,16)}${Q.tok[c]}</span></div>`).join('')}</div>
        <div class="ft">Đá: ${DQ.tot(Q.tok)}/10 · Giữ chỗ: ${Q.res.length}/3${Q.nobles.length?' · Quý tộc: '+Q.nobles.length:''}</div></div>`; }).join('')}</div></div>`;
    // khu vực của bạn
    if (P){ h+=`<div class="mine"><div class="rs"><span class="lb">Thẻ giữ chỗ của bạn</span>${P.res.length?P.res.map((id,r)=>cardHTML(id,`data-res="${r}"`,(pick&&pick.res===r?'pk ':'')+(DQ.payPlan(P,DQ.CARDS[id])?'can':''))).join(''):'<em>Chưa giữ thẻ nào</em>'}</div>`;
      let act='';
      if (S.phase==='over') act=`<b>${api.esc(S.seats[S.winner].name)} thắng với ${S.P[S.winner].pts} điểm!</b> ${api.mode()!=='client'?'<button class="tbtn pri" data-a="again">Chơi ván mới</button>':''}`;
      else if (my && S.step==='discard') act=`<b class="warn">Bạn có ${DQ.tot(P.tok)} viên đá — bấm vào đá của bạn ở bảng bên phải để trả lại ${DQ.tot(P.tok)-10} viên.</b>`;
      else if (pick){ const card=pick.deck?null:DQ.CARDS[pick.res!=null?P.res[pick.res]:S.board[pick.lv][pick.i]]; const plan=card&&DQ.payPlan(P,card);
        act=`<span>${pick.deck?'Giữ chỗ 1 thẻ úp '+LVN[pick.deck]:'Thẻ '+DQ_COL[card.col]+(card.pts?' · '+card.pts+' điểm':'')}</span>
          ${card?`<button class="tbtn pri" data-a="buy" ${my&&plan?'':'disabled'}>Mua${plan?' (trả '+(plan.pay.reduce((a,b)=>a+b,0)+plan.gold)+' đá'+(plan.gold?', '+plan.gold+' vàng':'')+')':' — chưa đủ đá'}</button>`:''}
          ${pick.res==null?`<button class="tbtn gold" data-a="reserve" ${my&&P.res.length<3?'':'disabled'}>Giữ chỗ${S.bank[5]?' + 1 Vàng':''}</button>`:''}<button class="tbtn" data-a="cancel">Đóng</button>`; }
      else act = my?'<span>Đến lượt bạn: chọn đá ở ngân khố, hoặc bấm vào một thẻ để mua / giữ chỗ.</span>':`<span>Đang chờ ${api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')}…</span>`;
      h+=`<div class="act">${act}</div></div>`; }
    h+=`<div class="xlog">${S.log.slice(0,4).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div>`;
    root.innerHTML=h;
    const ev=S.ev; if(ev&&ev.n!==lastEv){ const firstEv=lastEv===0; lastEv=ev.n; if(!firstEv){
      if(ev.k==='take'||ev.k==='ret') SFX.clack(ev.g?ev.g.length:1); else if(ev.k==='buy'){ SFX.flip(); if(ev.seat===ME&&DQ.CARDS[ev.id].pts){ SFX.reward(); api.toast('+'+DQ.CARDS[ev.id].pts+' điểm uy tín',true); } } else if(ev.k==='reserve') SFX.flip();
      else if(ev.k==='noble'){ SFX.ding(); if(ev.seat===ME){ SFX.reward(); api.toast(DQ.NOBLE_NAMES[ev.id]+' ghé thăm bạn: +3 điểm!',true); FX.confetti(innerWidth/2,innerHeight*.4,60); } else api.toast(DQ.NOBLE_NAMES[ev.id]+' ghé thăm '+api.esc(S.seats[ev.seat].name)); }
      else if(ev.k==='over'){ SFX.ding(); if(S.winner===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.45,120); } }
      if (S.phase==='play'&&S.turn===ME&&ev.k!=='ret'&&SFX.hiss) SFX.hiss(); } }
  }
  function tickView(S,ME,api){ const el=root&&root.querySelector('.pl.turn .tmr'); if(el) el.textContent=Math.max(0,60-Math.floor((api.now()-S.turnAt)/1000)); }
  function onClick(e){ const api=Table.API, S=window.__S, ME=api.me(); if(!S) return; const my=S.phase==='play'&&S.turn===ME;
    const tk=e.target.closest('[data-tok]'); if(tk){ if(!my||S.step!=='main') return; const c=+tk.dataset.tok; if(c===5){ api.toast('Vàng chỉ nhận được khi giữ chỗ thẻ'); return; }
      if (sel.length===1&&sel[0]===c){ if(S.bank[c]>=4) sel=[c,c]; else sel=[]; }
      else if (sel.includes(c)) sel=sel.length===2&&sel[0]===sel[1]?[]:sel.filter(x=>x!==c);
      else if (sel.length===2&&sel[0]===sel[1]) sel=[c];
      else if (sel.length<3 && S.bank[c]>0) sel.push(c);
      pick=null; SFX.pop(); render(S,ME,api); return; }
    const rt=e.target.closest('[data-ret]'); if(rt){ api.act({t:'ret',c:+rt.dataset.ret}); return; }
    const cd=e.target.closest('[data-lv],[data-res],[data-deck]'); if(cd){ const d=cd.dataset;
      pick = d.deck?{deck:+d.deck}:d.res!=null?{res:+d.res}:{lv:+d.lv,i:+d.i}; sel=[]; SFX.pop(); render(S,ME,api); return; }
    const b=e.target.closest('[data-a]'); if(!b||b.disabled) return; SFX.pop(); const a=b.dataset.a;
    if (a==='cancel'){ pick=null; render(S,ME,api); return; }
    if (a==='again'){ api.rematch(); return; }
    if (a==='take'){ api.act({t:'take',g:sel.slice()}); sel=[]; return; }
    if (a==='buy'&&pick){ api.act(pick.res!=null?{t:'buy',res:pick.res}:{t:'buy',lv:pick.lv,i:pick.i}); pick=null; return; }
    if (a==='reserve'&&pick){ api.act(pick.deck?{t:'reserve',deck:pick.deck}:{t:'reserve',lv:pick.lv,i:pick.i}); pick=null; return; } }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView, gem, GC };
})();
