/* ===================== GIAO DIỆN ĐẢO KHAI HOANG ===================== */
const KHUI=(()=>{
  const PC=['#e11d48','#2563eb','#f59e0b','#7c3aed'];
  const RC=['#2f7d32','#c2562b','#8bc34a','#e8b923','#7b8794','#e9d8a6'], RD=['#1b4d1e','#7a2f12','#4f7a1f','#9a7410','#46505c','#b89f64'];
  const R=56; let root=null, mode=null, robH=null, lastEv=0, tg=0, tw=3, dsel=null;
  const $=s=>document.querySelector(s);
  const X=v=>v*R, Y=v=>v*R;
  function hexPts(h){ return [0,1,2,3,4,5].map(k=>{ const a=Math.PI/180*(60*k-90); return (X(h.x)+R*Math.cos(a)).toFixed(1)+','+(Y(h.y)+R*Math.sin(a)).toFixed(1); }).join(' '); }
  function icon(res,x,y){ // hình minh hoạ nhỏ trên ô
    const g=`<g transform="translate(${x.toFixed(1)},${(y-20).toFixed(1)})" opacity=".9">`;
    if(res===0) return g+[[-14,6],[0,-2],[14,6]].map(([a,b])=>`<polygon points="${a},${b-14} ${a-8},${b+4} ${a+8},${b+4}" fill="#14532d"/><polygon points="${a},${b-20} ${a-6},${b-6} ${a+6},${b-6}" fill="#166534"/><rect x="${a-1.5}" y="${b+4}" width="3" height="5" fill="#5b3a1a"/>`).join('')+'</g>';
    if(res===1) return g+[[-12,-6],[2,-6],[-19,1],[-5,1],[9,1],[-12,8],[2,8]].map(([a,b])=>`<rect x="${a}" y="${b}" width="13" height="6" rx="1" fill="#8a2f10" stroke="#f3c6a9" stroke-width=".8"/>`).join('')+'</g>';
    if(res===2) return g+[[-11,0],[10,-4]].map(([a,b])=>`<ellipse cx="${a}" cy="${b}" rx="9" ry="6.5" fill="#fff" stroke="#ccc"/><circle cx="${a+8}" cy="${b-3}" r="3.5" fill="#222"/><rect x="${a-5}" y="${b+5}" width="2" height="4" fill="#222"/><rect x="${a+3}" y="${b+5}" width="2" height="4" fill="#222"/>`).join('')+'</g>';
    if(res===3) return g+[-12,-4,4,12].map(a=>`<line x1="${a}" y1="10" x2="${a+2}" y2="-10" stroke="#8a6508" stroke-width="1.6"/><ellipse cx="${a+2}" cy="-10" rx="3" ry="6" fill="#f5d36b" stroke="#a57c0b" stroke-width=".8"/>`).join('')+'</g>';
    if(res===4) return g+`<polygon points="-20,10 -6,-12 6,10" fill="#4b5563"/><polygon points="-2,10 12,-16 26,10" fill="#374151"/><polygon points="12,-16 7,-7 17,-7" fill="#f8fafc"/><polygon points="-6,-12 -10,-5 -2,-5" fill="#f8fafc"/></g>`;
    return g+`<rect x="-3" y="-12" width="6" height="22" rx="3" fill="#4d7c0f"/><rect x="-11" y="-6" width="5" height="9" rx="2.5" fill="#4d7c0f"/><rect x="6" y="-9" width="5" height="10" rx="2.5" fill="#4d7c0f"/></g>`; }
  function pips(n){ const k=KH.PIPS[n]||0; return Array.from({length:k},(_,i)=>`<circle cx="${(i-(k-1)/2)*4}" cy="9" r="1.4"/>`).join(''); }
  function house(x,y,c,city){ return city
    ? `<g transform="translate(${x},${y})"><path d="M-13,9 L-13,-4 L-5,-11 L3,-4 L3,-1 L13,-1 L13,9Z" fill="${c}" stroke="#111" stroke-width="2"/><rect x="-9" y="1" width="4" height="5" fill="#fff8" /><rect x="6" y="2" width="4" height="4" fill="#fff8"/></g>`
    : `<g transform="translate(${x},${y})"><path d="M-9,8 L-9,-2 L0,-10 L9,-2 L9,8Z" fill="${c}" stroke="#111" stroke-width="2"/><rect x="-2.5" y="1" width="5" height="7" fill="#0006"/></g>`; }
  function boardSVG(S,ME,api){
    const H=KH.HEX, V=KH.V, E=KH.E, my=S.turn===ME&&S.phase!=='over';
    const xs=V.map(v=>X(v.x)), ys=V.map(v=>Y(v.y)); const pad=70; const minX=Math.min(...xs)-pad, minY=Math.min(...ys)-pad, w=Math.max(...xs)-minX+pad, h=Math.max(...ys)-minY+pad;
    let s=`<svg viewBox="${minX} ${minY} ${w} ${h}" class="kb"><defs>${RC.map((c,i)=>`<radialGradient id="kg${i}" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${RD[i]}"/></radialGradient>`).join('')}
      <radialGradient id="sea" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#4fb3d9"/><stop offset="1" stop-color="#1f6fa3"/></radialGradient></defs>
      <rect x="${minX}" y="${minY}" width="${w}" height="${h}" rx="40" fill="url(#sea)"/>
      <g opacity=".25" stroke="#fff" fill="none" stroke-width="1.5">${[0,1,2,3,4,5,6].map(i=>`<path d="M${minX+30+i*90},${minY+20+(i%3)*14} q10,-6 20,0 t20,0"/>`).join('')}</g>
      <polygon points="${(()=>{ const hull=[]; const R2=R*5.3; for(let k=0;k<6;k++){ const a=Math.PI/180*(60*k); hull.push((R2*Math.cos(a)).toFixed(1)+','+(R2*Math.sin(a)).toFixed(1)); } return hull.join(' '); })()}" fill="#e7cf95" stroke="#c8a96a" stroke-width="4" opacity=".9"/>`;
    // cảng
    KH.PORT_E.forEach((e,i)=>{ const E0=E[e], a=V[E0.a], b=V[E0.b]; const mx=(a.x+b.x)/2, my2=(a.y+b.y)/2, L=Math.hypot(mx,my2), px=X(mx+mx/L*0.62), py=Y(my2+my2/L*0.62); const t=S.ports[i];
      s+=`<line x1="${X(a.x)}" y1="${Y(a.y)}" x2="${px}" y2="${py}" stroke="#8b5a2b" stroke-width="4"/><line x1="${X(b.x)}" y1="${Y(b.y)}" x2="${px}" y2="${py}" stroke="#8b5a2b" stroke-width="4"/>
        <circle cx="${px}" cy="${py}" r="17" fill="${t<0?'#fff':RC[t]}" stroke="#5b3a1a" stroke-width="2.5"/><text x="${px}" y="${py+4.5}" class="pt" ${t>=0&&t!==2&&t!==3?'fill="#fff"':''}>${t<0?'3:1':'2:1'}</text>`; });
    // ô đất
    H.forEach((hx,i)=>{ const h=S.hex[i], cx=X(hx.x), cy=Y(hx.y), rob=mode==='robber'||S.step==='robber'&&my;
      s+=`<g class="hx ${rob&&i!==S.robber?'pick':''}" data-h="${i}"><polygon points="${hexPts(hx)}" fill="url(#kg${h.res})" stroke="#f7ecd0" stroke-width="3"/>${icon(h.res,cx,cy)}`;
      if (h.num) s+=`<circle cx="${cx}" cy="${cy+12}" r="15" fill="#fbf3dc" stroke="#8a6b3a" stroke-width="1.5"/><text x="${cx}" y="${cy+17}" class="nm ${h.num===6||h.num===8?'hot':''}">${h.num}</text><g transform="translate(${cx},${cy+12})" fill="${h.num===6||h.num===8?'#c0262d':'#333'}">${pips(h.num)}</g>`;
      if (i===S.robber) s+=`<g transform="translate(${cx+(h.num?20:0)},${cy+4})" class="rob"><ellipse cx="0" cy="14" rx="10" ry="3.5" fill="#0005"/><path d="M-8,13 Q-9,-2 -4,-5 A7,7 0 1 1 4,-5 Q9,-2 8,13Z" fill="#2b2b33" stroke="#000" stroke-width="1.5"/></g>`;
      s+=`</g>`; });
    // đường
    E.forEach((e,i)=>{ const o=S.eo[i]; if(o<0) return; const a=V[e.a], b=V[e.b]; s+=`<line x1="${X(a.x)}" y1="${Y(a.y)}" x2="${X(b.x)}" y2="${Y(b.y)}" stroke="#111" stroke-width="11" stroke-linecap="round"/><line x1="${X(a.x)}" y1="${Y(a.y)}" x2="${X(b.x)}" y2="${Y(b.y)}" stroke="${PC[o]}" stroke-width="7" stroke-linecap="round" class="${S.ev&&S.ev.k==='road'&&S.ev.e===i?'newp':''}"/>`; });
    const P=ME>=0?S.P[ME]:null;
    if (my && P){ const wantRoad = (S.phase==='setup'&&S.step==='road') || (S.phase==='play'&&S.step==='main'&&(mode==='road'||S.free>0));
      if (wantRoad) E.forEach((e,i)=>{ if(KH.roadOK(S,ME,i)){ const a=V[e.a], b=V[e.b]; s+=`<line x1="${X(a.x)}" y1="${Y(a.y)}" x2="${X(b.x)}" y2="${Y(b.y)}" class="spot" data-e="${i}" stroke="${PC[ME]}"/>`; } }); }
    // nhà
    V.forEach((v,i)=>{ const o=S.vo[i]; if(o) s+=`<g class="${S.ev&&(S.ev.k==='town'||S.ev.k==='city')&&S.ev.v===i?'newp':''}" ${my&&mode==='city'&&o.p===ME&&!o.city?`data-c="${i}" style="cursor:pointer"`:''}>${house(X(v.x),Y(v.y),PC[o.p],o.city)}${my&&mode==='city'&&o.p===ME&&!o.city?`<circle cx="${X(v.x)}" cy="${Y(v.y)}" r="16" class="vspot"/>`:''}</g>`; });
    if (my && P){ const wantTown=(S.phase==='setup'&&S.step==='town')||(S.phase==='play'&&S.step==='main'&&mode==='town');
      if (wantTown) V.forEach((v,i)=>{ if(KH.townOK(S,ME,i)) s+=`<circle cx="${X(v.x)}" cy="${Y(v.y)}" r="10" class="vspot" data-v="${i}" style="--pc:${PC[ME]}"/>`; }); }
    return s+'</svg>'; }
  function die(n){ const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[n]||[];
    return `<svg viewBox="-12 -12 24 24" class="die"><rect x="-11" y="-11" width="22" height="22" rx="5" fill="#fff" stroke="#bbb"/>${P.map(([a,b])=>`<circle cx="${a*6}" cy="${b*6}" r="2.2" fill="${n===1?'#c0262d':'#222'}"/>`).join('')}</svg>`; }
  function resIcon(r,sz){ return `<svg viewBox="-24 -32 48 44" width="${sz||30}" height="${(sz||30)*.9}">${icon(r,0,12)}</svg>`; }
  const costTxt=c=>c.map((x,r)=>x?`<span class="cr" style="--rc:${RC[r]}">${x}</span>`:'').join('');
  function render(S,ME,api){
    if(!root){ document.getElementById('tb-game').innerHTML='<div id="kh"></div>'; root=$('#kh'); root.addEventListener('click',onClick); root.addEventListener('change',onChange); }
    const n=S.seats.length, t=api.now(), my=S.turn===ME&&S.phase!=='over', P=ME>=0?S.P[ME]:null, main=my&&S.phase==='play'&&S.step==='main';
    if (!main && mode!=='robber') mode=null; if (!(my&&S.step==='robber')) robH=null;
    let st;
    if (S.phase==='over') st=`<b>${api.esc(S.seats[S.winner].name)}</b> chiến thắng với ${KH.vp(S,S.winner,true)} điểm!`;
    else if (S.phase==='setup') st=my?(S.step==='town'?'Chọn chỗ đặt <b>nhà</b> (chấm sáng)':'Chọn cạnh đặt <b>đường</b> nối với nhà vừa đặt'):'Chờ '+api.esc(S.seats[S.turn].name)+' xếp nhà';
    else if (S.step==='robber') st=my?(robH!=null?'Chọn người để lấy 1 lá':'Bấm vào ô đất để dời <b>kẻ cướp</b>'):api.esc(S.seats[S.turn].name)+' đang dời kẻ cướp';
    else if (S.step==='roll') st=my?'Đến lượt bạn: <b>đổ xúc xắc</b>':'Chờ '+api.esc(S.seats[S.turn].name)+' đổ xúc xắc';
    else st=my?(S.free?`Xây ${S.free} đường miễn phí`:mode==='road'?'Chọn cạnh để xây đường':mode==='town'?'Chọn chỗ xây nhà':mode==='city'?'Chọn nhà để nâng thành phố':'Xây dựng, đổi hàng hoặc kết thúc lượt'):api.esc(S.seats[S.turn].name)+' đang xây dựng';
    let h=`<div class="khwrap"><div class="kbwrap">${boardSVG(S,ME,api)}<div class="kst">${st}</div></div><div class="side">`;
    h+=`<div class="dice">${S.dice?die(S.dice[0])+die(S.dice[1])+`<b>${S.dice[0]+S.dice[1]}</b>`:'<span>Chưa đổ</span>'}<button class="tbtn pri" data-a="roll" ${my&&S.phase==='play'&&S.step==='roll'?'':'disabled'}>Đổ xúc xắc</button></div>`;
    if (robH!=null){ const vs=KH.victims(S,robH,ME); h+=`<div class="box">Lấy 1 lá của: ${vs.map(v=>`<button class="tbtn" data-vic="${v}">${api.esc(S.seats[v].name)}</button>`).join(' ')}</div>`; }
    h+=`<div class="pls">${S.seats.map((p,i)=>{ const Q=S.P[i]; const left=S.turn===i&&S.phase!=='over'?Math.max(0,90-Math.floor((t-S.turnAt)/1000)):null;
      return `<div class="pl ${S.turn===i?'turn':''} ${S.winner===i?'win':''}" style="--pc:${PC[i]}"><div class="ph"><i></i><b>${api.esc(p.name)}</b>${i===ME?' (bạn)':''}${left!=null?` <span class="tmr">${left}</span>`:''}<span class="vp">${KH.vp(S,i,i===ME||S.phase==='over')}</span></div>
        <div class="ps">Lá: ${KH.tot(Q.res)} · Thẻ: ${Q.dev.length+Q.newDev.length} · Hiệp sĩ: ${Q.knights} · Đường: ${Q.lr}${S.longest===i?' <em>Đường dài nhất</em>':''}${S.largest===i?' <em>Quân mạnh nhất</em>':''}</div></div>`; }).join('')}</div>`;
    if (P){
      h+=`<div class="box res">${P.res.map((x,r)=>`<div class="rc" style="--rc:${RC[r]}">${resIcon(r,30)}<b>${x}</b><small>${KH_RES[r]}</small></div>`).join('')}</div>`;
      const B=(k,label,cost,dis)=>`<button class="tbtn bld ${mode===k?'on':''}" data-m="${k}" ${dis?'disabled':''}>${label}<span>${costTxt(cost)}</span></button>`;
      h+=`<div class="box bl">${B('road','Đường',KH_COST.road,!main||!KH.canPay(P,KH_COST.road)&&!S.free||!P.roads)}${B('town','Nhà (1 điểm)',KH_COST.town,!main||!KH.canPay(P,KH_COST.town)||!P.towns)}${B('city','Thành phố (2 điểm)',KH_COST.city,!main||!KH.canPay(P,KH_COST.city)||!P.cities)}
        <button class="tbtn bld" data-a="buydev" ${main&&KH.canPay(P,KH_COST.dev)&&S.dev.length?'':'disabled'}>Thẻ phát triển<span>${costTxt(KH_COST.dev)}</span></button></div>`;
      const dv={}; P.dev.forEach(d=>dv[d]=(dv[d]||0)+1); const nv={}; P.newDev.forEach(d=>nv[d]=(nv[d]||0)+1);
      const canDev=my&&S.phase==='play'&&!S.devPlayed&&(S.step==='main'||S.step==='roll');
      const devs=Object.keys(KH_DEVN).filter(k=>dv[k]||nv[k]);
      if (devs.length) h+=`<div class="box dv">${devs.map(k=>`<div class="dc ${k}"><b>${KH_DEVN[k]}</b> ×${(dv[k]||0)+(nv[k]||0)}${nv[k]?' <small>(mới mua)</small>':''}
        ${k==='vp'?'<small>+1 điểm ẩn</small>':dv[k]?`<button class="tbtn sm" data-dev="${k}" ${canDev&&(k==='knight'||S.step==='main')?'':'disabled'}>Dùng</button>`:''}</div>`).join('')}
        ${dsel?`<div class="dpick">${dsel==='mono'?'Gom loại:':'Nhận 2 lá:'} ${KH_RES.map((nm,r)=>`<button class="tbtn sm" data-pr="${r}">${nm}</button>`).join('')} <button class="tbtn sm" data-a="dcancel">Huỷ</button></div>`:''}</div>`;
      const rt=KH.rates(S,ME);
      h+=`<div class="box tr"><span>Đổi với ngân hàng:</span> đưa <select data-s="g">${KH_RES.map((nm,r)=>`<option value="${r}" ${r===tg?'selected':''}>${rt[r]} ${nm}</option>`).join('')}</select> lấy <select data-s="w">${KH_RES.map((nm,r)=>`<option value="${r}" ${r===tw?'selected':''}>1 ${nm}</option>`).join('')}</select>
        <button class="tbtn" data-a="trade" ${main&&P.res[tg]>=rt[tg]&&tg!==tw?'':'disabled'}>Đổi</button></div>`;
      h+=`<div class="box"><button class="tbtn pri wide" data-a="end" ${main?'':'disabled'}>Kết thúc lượt</button>${S.phase==='over'&&api.mode()!=='client'?'<button class="tbtn gold wide" data-a="again">Chơi ván mới</button>':''}</div>`; }
    h+=`<div class="xlog">${S.log.slice(0,6).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div></div></div>`;
    root.innerHTML=h;
    const ev=S.ev; if(ev&&ev.n!==lastEv){ const f=lastEv===0; lastEv=ev.n; if(!f){
      if(ev.k==='roll'){ SFX.clack(3); const box=root.querySelector('.dice'); if(box) box.classList.add('rolling'); if(ev.got&&ME>=0&&KH.tot(ev.got[ME])){ setTimeout(()=>SFX.ding(),300); } if(ev.d[0]+ev.d[1]===7) api.toast('Ra 7! Kẻ cướp xuất hiện'); }
      else if(ev.k==='town'||ev.k==='city'||ev.k==='road'){ SFX.place?SFX.place():SFX.clack(2); if(ev.seat===ME&&ev.k!=='road'){ SFX.reward(); } }
      else if(ev.k==='steal'){ SFX.flip(); if(ev.vic===ME) api.toast(api.esc(S.seats[ev.seat].name)+' lấy của bạn 1 '+KH_RES[ev.r]); else if(ev.seat===ME) api.toast('Bạn lấy được 1 '+KH_RES[ev.r],true); }
      else if(ev.k==='buydev'){ SFX.flip(); if(ev.seat===ME) api.toast('Bạn nhận thẻ: '+KH_DEVN[ev.d],true); }
      else if(ev.k==='award'){ SFX.ding(); api.toast(api.esc(S.seats[ev.seat].name)+(ev.a==='road'?' giành Đường dài nhất (+2)':' giành Đạo quân mạnh nhất (+2)'),ev.seat===ME); }
      else if(ev.k==='over'){ SFX.ding(); if(S.winner===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.4,140); } }
      else if(ev.k==='dev'||ev.k==='trade') SFX.pop();
      if(my && (S.step==='roll'||S.phase==='setup'&&S.step==='town') && ev.k!=='roll' && SFX.hiss) SFX.hiss(); } }
  }
  function tickView(S,ME,api){ const el=root&&root.querySelector('.pl.turn .tmr'); if(el) el.textContent=Math.max(0,90-Math.floor((api.now()-S.turnAt)/1000)); }
  function onChange(e){ const s=e.target.dataset.s; if(!s) return; if(s==='g') tg=+e.target.value; else tw=+e.target.value; render(window.__S,Table.API.me(),Table.API); }
  function onClick(e){ const api=Table.API, S=window.__S, ME=api.me(); if(!S) return; const rr=()=>render(S,ME,api);
    const t=e.target.closest('[data-v],[data-e],[data-c],[data-h],[data-vic],[data-m],[data-a],[data-dev],[data-pr]'); if(!t) return; const d=t.dataset;
    if (t.disabled) return;
    if (d.v!=null){ api.act({t:'town',v:+d.v}); mode=null; return; }
    if (d.e!=null){ api.act({t:'road',e:+d.e}); if(!S.free) mode=null; return; }
    if (d.c!=null){ api.act({t:'city',v:+d.c}); mode=null; return; }
    if (d.vic!=null){ api.act({t:'robber',h:robH,v:+d.vic}); robH=null; return; }
    if (d.h!=null){ if(!(S.turn===ME&&S.step==='robber')) return; const h=+d.h; if(h===S.robber){ api.toast('Hãy chọn ô khác ô hiện tại'); return; }
      const vs=KH.victims(S,h,ME); if(vs.length>1){ robH=h; rr(); } else api.act({t:'robber',h,v:vs[0]}); return; }
    SFX.pop();
    if (d.m){ mode = mode===d.m?null:d.m; rr(); return; }
    if (d.dev){ if(d.dev==='knight') api.act({t:'knight'}); else if(d.dev==='road') api.act({t:'roaddev'}); else { dsel=d.dev; DP=[]; rr(); } return; }
    if (d.pr!=null){ const r=+d.pr; if(dsel==='mono'){ api.act({t:'mono',r}); dsel=null; } else { DP.push(r); if(DP.length===2){ api.act({t:'plenty',r1:DP[0],r2:DP[1]}); dsel=null; } else api.toast('Đã chọn '+KH_RES[r]+', chọn thêm 1 lá'); } return; }
    const a=d.a; if(a==='dcancel'){ dsel=null; rr(); return; } if(a==='again'){ api.rematch(); return; }
    if (a==='trade'){ api.act({t:'trade',give:tg,get:tw}); return; }
    if (a) api.act({t:a}); }
  let DP=[];
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
