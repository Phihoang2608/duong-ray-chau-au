/* ===================== GIAO DIỆN ĐẢO KHAI HOANG ===================== */
const KHUI=(()=>{
  const PC=['#e11d48','#2563eb','#f59e0b','#f8fafc'];
  const A=KHART, R=A.R;
  let root=null, mode=null, robH=null, lastEv=null, tg=0, tw=3, dsel=null, DP=[], boardSig='';
  const $=s=>document.querySelector(s);
  const VB={minX:-372,minY:-348,w:744,h:696};
  const X=v=>v*R;
  function dynSVG(S,ME,ev){ const H=KH.HEX, V=KH.V, E=KH.E, my=S.turn===ME&&S.phase!=='over'; let s='';
    if (ev&&ev.k==='roll'){ const sum=ev.d[0]+ev.d[1]; S.hex.forEach((h,i)=>{ if(h.num===sum) s+=`<polygon points="${A.hexPts(X(H[i].x),X(H[i].y),R-3)}" class="hot ${i===S.robber?'blocked':''}"/>`; }); }
    if (my && S.step==='robber' && robH==null) S.hex.forEach((h,i)=>{ if(i!==S.robber) s+=`<polygon points="${A.hexPts(X(H[i].x),X(H[i].y),R-4)}" class="pickh" data-h="${i}"/>`; });
    if (robH!=null) s+=`<polygon points="${A.hexPts(X(H[robH].x),X(H[robH].y),R-4)}" class="pickh on"/>`;
    E.forEach((e,i)=>{ const o=S.eo[i]; if(o<0) return; const a=V[e.a], b=V[e.b]; s+=`<g class="${ev&&ev.k==='road'&&ev.e===i?'newp':''}">${A.road(X(a.x),X(a.y),X(b.x),X(b.y),PC[o])}</g>`; });
    if (my){ const wantRoad=(S.phase==='setup'&&S.step==='road')||(S.phase==='play'&&S.step==='main'&&(mode==='road'||S.free>0));
      if (wantRoad) E.forEach((e,i)=>{ if(KH.roadOK(S,ME,i)){ const a=V[e.a], b=V[e.b]; s+=`<line x1="${X(a.x)}" y1="${X(a.y)}" x2="${X(b.x)}" y2="${X(b.y)}" class="spot" data-e="${i}" style="--pc:${PC[ME]}"/>`; } }); }
    V.forEach((v,i)=>{ const o=S.vo[i]; if(!o) return; const fresh=ev&&(ev.k==='town'||ev.k==='city')&&ev.v===i; const canUp=my&&mode==='city'&&o.p===ME&&!o.city;
      s+=`<g class="${fresh?'newp':''}" ${canUp?`data-c="${i}" style="cursor:pointer"`:''}>${A.house(X(v.x),X(v.y),PC[o.p],o.city)}${canUp?`<circle cx="${X(v.x)}" cy="${X(v.y)}" r="18" class="vspot ring"/>`:''}</g>`;
      if (fresh) s+=[0,1,2,3,4,5].map(k=>`<circle class="dust" style="--dx:${Math.cos(k)*22}px;--dy:${Math.sin(k)*10}px" cx="${X(v.x)}" cy="${X(v.y)+8}" r="4"/>`).join(''); });
    const rh=H[S.robber]; s+=`<g class="${ev&&(ev.k==='robber'||ev.k==='steal')?'drop':''}">${A.robber(X(rh.x)+(S.hex[S.robber].num?24:0),X(rh.y)-4)}</g>`;
    if (my){ const wantTown=(S.phase==='setup'&&S.step==='town')||(S.phase==='play'&&S.step==='main'&&mode==='town');
      if (wantTown) V.forEach((v,i)=>{ if(KH.townOK(S,ME,i)) s+=`<circle cx="${X(v.x)}" cy="${X(v.y)}" r="9" class="vspot" data-v="${i}" style="--pc:${PC[ME]}"/>`; }); }
    return s; }
  function svgPt(x,y){ const svg=root.querySelector('#khd'); if(!svg) return null; const m=svg.getScreenCTM(); if(!m) return null; return {left:m.a*x+m.c*y+m.e-10,top:m.b*x+m.d*y+m.f-10,width:20,height:20}; }
  function rectOf(sel){ const e=root&&root.querySelector(sel); return e?e.getBoundingClientRect():null; }
  function fly(from,to,html,w,h,delay){ if(!from||!to) return; const el=document.createElement('div'); el.className='khfly'; el.innerHTML=html;
    const x0=from.left+from.width/2-w/2, y0=from.top+from.height/2-h/2, x1=to.left+to.width/2-w/2, y1=to.top+to.height/2-h/2;
    Object.assign(el.style,{left:x0+'px',top:y0+'px',width:w+'px',height:h+'px'}); document.body.appendChild(el);
    el.animate([{transform:'translate(0,0) scale(.3) rotate(-20deg)',opacity:0},{transform:'translate(0,-30px) scale(1.15) rotate(0)',opacity:1,offset:.25},{transform:`translate(${x1-x0}px,${y1-y0}px) scale(.55) rotate(10deg)`,opacity:.3}],{duration:1100,delay:delay||0,easing:'cubic-bezier(.4,.1,.3,1)',fill:'both'}).onfinish=()=>el.remove(); }
  function render(S,ME,api){
    if(!root){ document.getElementById('tb-game').innerHTML=`<div id="kh"><div class="khwrap"><div class="kbwrap"><div class="frame"><svg id="khs" viewBox="${VB.minX} ${VB.minY} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet"></svg><svg id="khd" viewBox="${VB.minX} ${VB.minY} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet"></svg></div><div class="kst"></div></div><div class="side"></div></div></div>`;
      root=$('#kh'); root.addEventListener('click',onClick); root.addEventListener('change',onChange); }
    const sig=S.hex.map(h=>h.res+'.'+h.num).join()+S.ports.join();
    if (sig!==boardSig){ boardSig=sig; root.querySelector('#khs').innerHTML=A.board(S,VB); }
    const t=api.now(), my=S.turn===ME&&S.phase!=='over', P=ME>=0?S.P[ME]:null, main=my&&S.phase==='play'&&S.step==='main';
    if (!main) mode=null; if (!(my&&S.step==='robber')) robH=null;
    if (lastEv===null) lastEv=S.ev?S.ev.n:0; const ev=S.ev, isNew=ev&&ev.n!==lastEv;
    const pre={}; if(isNew&&ev.k==='steal') pre.vic=rectOf(`.pl[data-p="${ev.vic}"]`);
    root.querySelector('#khd').innerHTML=dynSVG(S,ME,isNew?ev:null);
    let st;
    if (S.phase==='over') st=`<b>${api.esc(S.seats[S.winner].name)}</b> chiến thắng với ${KH.vp(S,S.winner,true)} điểm!`;
    else if (S.phase==='setup') st=my?(S.step==='town'?'Chọn chỗ đặt <b>nhà</b> (chấm sáng)':'Chọn cạnh đặt <b>đường</b> nối với nhà vừa đặt'):'Chờ '+api.esc(S.seats[S.turn].name)+' xếp nhà';
    else if (S.step==='robber') st=my?(robH!=null?'Chọn người để lấy 1 lá':'Bấm vào ô đất để dời <b>kẻ cướp</b>'):api.esc(S.seats[S.turn].name)+' đang dời kẻ cướp';
    else if (S.step==='roll') st=my?'Đến lượt bạn: <b>đổ xúc xắc</b>':'Chờ '+api.esc(S.seats[S.turn].name)+' đổ xúc xắc';
    else st=my?(S.free?`Xây ${S.free} đường miễn phí`:mode==='road'?'Chọn cạnh để xây đường':mode==='town'?'Chọn chỗ xây nhà':mode==='city'?'Chọn nhà để nâng thành phố':'Xây dựng, đổi hàng hoặc kết thúc lượt'):api.esc(S.seats[S.turn].name)+' đang xây dựng';
    root.querySelector('.kst').innerHTML=st;
    let h=`<div class="dice ${isNew&&ev.k==='roll'?'rolling':''}">${S.dice?A.die(S.dice[0])+A.die(S.dice[1],'#fdecc8')+`<b>${S.dice[0]+S.dice[1]}</b>`:'<span>Chưa đổ</span>'}<button class="tbtn pri" data-a="roll" ${my&&S.phase==='play'&&S.step==='roll'?'':'disabled'}>Đổ xúc xắc</button></div>`;
    if (robH!=null){ const vs=KH.victims(S,robH,ME); h+=`<div class="box">Lấy 1 lá của: ${vs.map(v=>`<button class="tbtn" data-vic="${v}">${api.esc(S.seats[v].name)}</button>`).join(' ')}</div>`; }
    h+=`<div class="pls">${S.seats.map((p,i)=>{ const Q=S.P[i]; const left=S.turn===i&&S.phase!=='over'?Math.max(0,90-Math.floor((t-S.turnAt)/1000)):null;
      return `<div class="pl ${S.turn===i?'turn':''} ${S.winner===i?'win':''}" data-p="${i}" style="--pc:${PC[i]}"><div class="ph"><svg viewBox="-12 -16 24 28" class="pk">${A.house(0,0,PC[i],false)}</svg><b>${api.esc(p.name)}</b>${i===ME?' (bạn)':''}${left!=null?` <span class="tmr">${left}</span>`:''}<span class="vp">${KH.vp(S,i,i===ME||S.phase==='over')}<small>điểm</small></span></div>
        <div class="ps"><span>Lá: ${KH.tot(Q.res)}</span><span>Thẻ: ${Q.dev.length+Q.newDev.length}</span><span>Hiệp sĩ: ${Q.knights}</span><span>Đường: ${Q.lr}</span></div>
        ${S.longest===i||S.largest===i?`<div class="aw">${S.longest===i?'<em>Đường dài nhất +2</em>':''}${S.largest===i?'<em>Quân mạnh nhất +2</em>':''}</div>`:''}</div>`; }).join('')}</div>`;
    if (P){
      h+=`<div class="box hand">${P.res.map((x,r)=>`<div class="rstack ${x?'':'none'}" title="${KH_RES[r]}">${[...Array(Math.max(1,Math.min(x,4)))].map((_,k)=>`<div class="rc" style="--k:${k}">${A.resCard(r)}</div>`).join('')}<b>${x}</b></div>`).join('')}</div>`;
      const cost=c=>c.map((x,r)=>x?`<span class="cr">${[...Array(x)].map(()=>`<svg viewBox="-9 -8 18 16" width="15" height="14">${A.resMini(r,0,0,.8)}</svg>`).join('')}</span>`:'').join('');
      const B=(k,label,c,dis)=>`<button class="tbtn bld ${mode===k?'on':''}" data-m="${k}" ${dis?'disabled':''}><b>${label}</b><span>${cost(c)}</span></button>`;
      h+=`<div class="box bl">${B('road','Đường',KH_COST.road,!main||!KH.canPay(P,KH_COST.road)&&!S.free||!P.roads)}${B('town','Nhà · 1 điểm',KH_COST.town,!main||!KH.canPay(P,KH_COST.town)||!P.towns)}${B('city','Thành phố · 2 điểm',KH_COST.city,!main||!KH.canPay(P,KH_COST.city)||!P.cities)}
        <button class="tbtn bld" data-a="buydev" ${main&&KH.canPay(P,KH_COST.dev)&&S.dev.length?'':'disabled'}><b>Thẻ phát triển</b><span>${cost(KH_COST.dev)}</span></button></div>`;
      const dv={}; P.dev.forEach(d=>dv[d]=(dv[d]||0)+1); const nv={}; P.newDev.forEach(d=>nv[d]=(nv[d]||0)+1);
      const canDev=my&&S.phase==='play'&&!S.devPlayed&&(S.step==='main'||S.step==='roll');
      const devs=Object.keys(KH_DEVN).filter(k=>dv[k]||nv[k]);
      if (devs.length) h+=`<div class="box dv"><div class="dvl">${devs.map(k=>`<div class="dcard ${nv[k]&&!dv[k]?'new':''}">${A.devCard(k)}<b>×${(dv[k]||0)+(nv[k]||0)}</b>
        ${k==='vp'?'<small>+1 điểm ẩn</small>':dv[k]?`<button class="tbtn sm" data-dev="${k}" ${canDev&&(k==='knight'||S.step==='main')?'':'disabled'}>Dùng</button>`:'<small>mới mua</small>'}</div>`).join('')}</div>
        ${dsel?`<div class="dpick">${dsel==='mono'?'Gom loại:':'Nhận 2 lá:'} ${KH_RES.map((nm,r)=>`<button class="tbtn sm" data-pr="${r}">${nm}</button>`).join('')} <button class="tbtn sm" data-a="dcancel">Huỷ</button></div>`:''}</div>`;
      const rt=KH.rates(S,ME);
      h+=`<div class="box tr"><span>Đổi với ngân hàng:</span> đưa <select data-s="g">${KH_RES.map((nm,r)=>`<option value="${r}" ${r===tg?'selected':''}>${rt[r]} ${nm}</option>`).join('')}</select> lấy <select data-s="w">${KH_RES.map((nm,r)=>`<option value="${r}" ${r===tw?'selected':''}>1 ${nm}</option>`).join('')}</select>
        <button class="tbtn" data-a="trade" ${main&&P.res[tg]>=rt[tg]&&tg!==tw?'':'disabled'}>Đổi</button></div>`;
      h+=`<div class="box"><button class="tbtn pri wide" data-a="end" ${main?'':'disabled'}>Kết thúc lượt</button>${S.phase==='over'&&api.mode()!=='client'?'<button class="tbtn gold wide" data-a="again">Chơi ván mới</button>':''}</div>`; }
    h+=`<div class="xlog">${S.log.slice(0,6).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div>`;
    root.querySelector('.side').innerHTML=h;
    if(isNew){ lastEv=ev.n;
      if(ev.k==='roll'){ SFX.clack(3); const sum=ev.d[0]+ev.d[1]; if(sum===7) api.toast('Ra 7! Kẻ cướp xuất hiện');
        if(ev.got){ let k=0; S.hex.forEach((hx,hi)=>{ if(hx.num!==sum||hi===S.robber) return; KH.HEX[hi].v.forEach(v=>{ const o=S.vo[v]; if(!o) return; const from=svgPt(X(KH.HEX[hi].x),X(KH.HEX[hi].y)), to=rectOf(`.pl[data-p="${o.p}"]`); for(let c=0;c<(o.city?2:1);c++) fly(from,to,A.resCard(hx.res),66,50,300+(k++)*120); }); });
          if(ME>=0&&KH.tot(ev.got[ME])) setTimeout(()=>SFX.ding(),900); } }
      else if(ev.k==='town'||ev.k==='city'||ev.k==='road'){ SFX.clack(2); if(ev.seat===ME&&ev.k!=='road') SFX.reward(); }
      else if(ev.k==='steal'){ SFX.flip(); fly(pre.vic,rectOf(`.pl[data-p="${ev.seat}"]`),`<div class="khback"></div>`,42,59,350); if(ev.vic===ME) api.toast(api.esc(S.seats[ev.seat].name)+' lấy của bạn 1 '+KH_RES[ev.r]); else if(ev.seat===ME) api.toast('Bạn lấy được 1 '+KH_RES[ev.r],true); }
      else if(ev.k==='buydev'){ SFX.flip(); if(ev.seat===ME){ api.toast('Bạn nhận thẻ: '+KH_DEVN[ev.d],true); fly(rectOf('[data-a="buydev"]'),rectOf('.dv')||rectOf('.hand'),A.devCard(ev.d),56,78,0); } }
      else if(ev.k==='award'){ SFX.ding(); api.toast(api.esc(S.seats[ev.seat].name)+(ev.a==='road'?' giành Đường dài nhất (+2)':' giành Đạo quân mạnh nhất (+2)'),ev.seat===ME); }
      else if(ev.k==='over'){ SFX.ding(); if(S.winner===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.4,140); } }
      else if(ev.k==='dev'||ev.k==='trade') SFX.pop();
      if(my && (S.step==='roll'||S.phase==='setup'&&S.step==='town') && ev.k!=='roll' && SFX.hiss) SFX.hiss(); }
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
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
