/* ===================== GIAO DIỆN XÌ DÁCH ===================== */
const XDUI=(()=>{
  let root=null, chip=50, last='';
  const $=s=>document.querySelector(s);
  function pos(n, rel){ // người chơi xếp theo vòng cung phía dưới, nhà cái ở trên
    const a = n===1 ? Math.PI/2 : Math.PI*(0.86 - 0.72*rel/(n-1)); return {x:50+44*Math.cos(a), y:46+42*Math.sin(a)}; }
  function render(S,ME,api){
    Cards.css();
    if(!root){ document.getElementById('tb-game').innerHTML='<div class="xd" id="xd"></div>'; root=$('#xd'); root.addEventListener('click',onClick); }
    const n=S.seats.length, t=api.now();
    const order=[...Array(n).keys()].sort((a,b)=>((a-ME+n)%n)-((b-ME+n)%n)); // bạn ở giữa dưới
    const mid=Math.floor((n-1)/2); const relOf={}; order.forEach((s,k)=>{ relOf[s]=(k+mid)%n; });
    const showAll = S.phase==='result' || S.phase==='dealer';
    let h=`<div class="felt tbl"><div class="arc">NHÀ CÁI RÚT ĐẾN 17 · XÌ BÀN TRẢ ×3 · XÌ DÁCH, NGŨ LINH TRẢ ×2</div>
      <div class="dealer"><div class="dl">Nhà cái</div><div class="cards">${S.dealer.map((c,i)=>i===1&&!S.reveal?Cards.back('deal',i):Cards.face(c,S.reveal&&i===1?'flip':'deal',i)).join('')}</div>
      ${S.dealer.length?`<div class="tag info">${S.reveal?XD.label(S.dealer):'?'}</div>`:''}</div>`;
    S.seats.forEach((p,i)=>{ const P=pos(n, relOf[i]), hd=S.hands[i], mine=i===ME, res=S.res&&S.res[i];
      const vis = mine || showAll || XD.kind(hd)==='bust' || ['xiban','xidach'].includes(XD.kind(hd));
      let tag=''; if(res){ tag=`<div class="tag ${res.d>0?'win':res.d<0?'lose':'info'}">${res.d>0?'+':''}${res.d}</div>`; } else if(hd.length && vis) tag=`<div class="tag info">${XD.label(hd)}</div>`;
      const left=S.turn===i?Math.max(0,20-Math.floor((t-S.turnAt)/1000)):null;
      h+=`<div class="seatbox ${S.turn===i?'turn':''} ${S.phase!=='bet'&&!S.bet[i]?'out':''}" style="left:${P.x}%;top:${P.y}%">
        <div class="cards">${hd.map((c,k)=>vis?Cards.face(c,'deal',k):Cards.back('deal',k)).join('')}</div>${tag}
        <div class="nm">${api.avatar(p.name,i)}<b>${api.esc(p.name)}</b>${mine?' (bạn)':''}${left!=null?` <span class="tmr">${left}</span>`:''}</div>
        <div class="sub">${S.coins[i]} xu${S.bet[i]?` · cược ${S.bet[i]}`:''}${S.phase==='bet'?(S.ready[i]?' · sẵn sàng':''):''}</div>
        ${S.bet[i]?`<div class="betc">${Cards.chip(S.bet[i])}</div>`:''}</div>`; });
    const st = S.phase==='bet'?`Đặt cược — còn <b class="cd">${Math.max(0,Math.ceil((XD_BET_MS-(t-S.phaseAt))/1000))}</b> giây`:S.phase==='play'?(S.turn===ME?'Lượt của bạn: Rút thêm hay Dằn?':'Đang chờ '+api.esc(S.seats[S.turn]?S.seats[S.turn].name:'')):S.phase==='dealer'?'Nhà cái đang rút bài…':'Kết quả ván '+S.round;
    h+=`<div class="center"><div class="st">${st}</div></div></div>`;
    if (ME>=0){ const hd=S.hands[ME], v=XD.val(hd), my=S.phase==='play'&&S.turn===ME;
      if (S.phase==='bet') h+=`<div class="ctrl"><div class="chips">${XD_CHIPS.map(c=>`<button class="ch ${c===chip?'on':''}" data-chip="${c}" ${S.coins[ME]<c||S.ready[ME]?'disabled':''}>${Cards.chip(c)}</button>`).join('')}</div>
        <div class="btns"><span>Xu: <b>${S.coins[ME]}</b> · Cược: <b>${S.bet[ME]}</b></span><button class="tbtn" data-a="bet" ${S.ready[ME]||S.coins[ME]<chip?'disabled':''}>Đặt thêm ${chip}</button><button class="tbtn" data-a="clear" ${S.ready[ME]||!S.bet[ME]?'disabled':''}>Huỷ</button><button class="tbtn pri" data-a="ready" ${S.ready[ME]||!S.bet[ME]?'disabled':''}>Chia bài</button><button class="tbtn" data-a="skip" ${S.ready[ME]?'disabled':''}>Ngồi xem ván này</button></div></div>`;
      else h+=`<div class="ctrl"><div class="btns"><span>${hd.length?'Bài của bạn: <b>'+XD.label(hd)+'</b>':'Bạn ngồi xem ván này'}</span>
        <button class="tbtn pri" data-a="hit" ${my&&hd.length<5&&v<=21?'':'disabled'}>Rút thêm</button><button class="tbtn" data-a="stand" ${my&&(v>=16||hd.length>=5)?'':'disabled'}>${v>=16||hd.length>=5?'Dằn':'Dằn (cần đủ 16)'}</button></div></div>`;
    }
    h+=`<div class="xlog">${S.log.slice(0,5).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div><p class="note">Chơi bằng xu ảo để giải trí, không quy đổi thành tiền.</p>`;
    root.innerHTML=h;
    const key=S.round+S.phase+S.turn+S.dealer.length+S.hands.map(x=>x.length).join();
    if(key!==last){ last=key; if(S.phase==='play'||S.phase==='dealer') SFX.flip(); if(S.phase==='play'&&S.turn===ME) SFX.turn();
      if(S.phase==='result'&&S.res&&S.res[ME]){ const d=S.res[ME].d; if(d>0){ SFX.reward(); api.toast('Bạn thắng +'+d+' xu!',true); FX.confetti(innerWidth/2, innerHeight*.6, 60); } else if(d<0){ SFX.error(); api.toast('Bạn thua '+(-d)+' xu'); } else api.toast('Hoà'); } }
  }
  function tickView(S,ME,api){ if(!root) return; const t=api.now(); const c=root.querySelector('.cd'); if(c) c.textContent=Math.max(0,Math.ceil((XD_BET_MS-(t-S.phaseAt))/1000)); const m=root.querySelector('.tmr'); if(m) m.textContent=Math.max(0,20-Math.floor((t-S.turnAt)/1000)); }
  function onClick(e){ const api=Table.API, S=window.__S; if(!S) return; const c=e.target.closest('[data-chip]'); if(c&&!c.disabled){ chip=+c.dataset.chip; SFX.pop(); render(S,api.me(),api); return; }
    const b=e.target.closest('[data-a]'); if(!b||b.disabled) return; const a=b.dataset.a; SFX.pop(); api.act(a==='bet'?{t:'bet',v:chip}:{t:a}); }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
