/* ===================== GIAO DIỆN ĐẢO KHAI HOANG ===================== */
const KHUI=(()=>{
  const PC=['#e11d48','#2563eb','#16a34a','#f8fafc'];
  const A=KHART, R=A.R;
  let lastArgs=null, root=null, prevAw={}, pop=null, mode=null, robH=null, lastEv=null, tg=0, tw=3, og=0, oq=1, ow=3, on=1, ot=-1, dsel=null, DP=[], boardSig='';
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
  let root0chat=null, root0=null;
  function resRow(c){ return c.map((x,r)=>x?`<span class="cr">${[...Array(x)].map(()=>`<svg viewBox="-9 -8 18 16" width="22" height="20">${A.resMini(r,0,0,.8)}</svg>`).join('')}</span>`:'').join(''); }
  function offerBox(S,ME,api){ const o=S.offer; if(!o) return ''; const nm=api.esc(S.seats[o.from].name);
    if (ME===o.from) return `<div class="box ofr"><div class="cth">Yêu cầu của bạn</div><div class="orow"><small>Bạn đưa</small>${resRow(o.give)}</div><div class="orow"><small>Bạn nhận</small>${resRow(o.get)}</div><div class="chint">${o.to>=0?'Chờ '+api.esc(S.seats[o.to].name)+' trả lời…':'Chờ mọi người trả lời…'}</div><button class="tbtn wide" data-a="cancel">Huỷ yêu cầu</button></div>`;
    const mine=ME>=0&&(o.to<0||o.to===ME)&&!o.no.includes(ME);
    if (!mine) return `<div class="box ofr"><div class="cth">${nm} đang yêu cầu đổi</div><div class="orow"><small>Đưa</small>${resRow(o.give)}</div><div class="orow"><small>Lấy</small>${resRow(o.get)}</div></div>`;
    const P=S.P[ME], can=o.get.every((x,i)=>P.res[i]>=x);
    return `<div class="box ofr hot"><div class="cth">${nm} muốn đổi với bạn</div><div class="orow"><small>Bạn nhận</small>${resRow(o.give)}</div><div class="orow"><small>Bạn đưa</small>${resRow(o.get)}</div>${can?'':'<div class="chint">Bạn không đủ lá để đổi</div>'}<div class="obt"><button class="tbtn pri" data-a="yes" ${can?'':'disabled'}>Đồng ý</button><button class="tbtn" data-a="no">Từ chối</button></div></div>`; }

  /* Tự co bố cục ngang cho vừa trọn màn hình: thiết kế ở chiều cao ảo 380px rồi phóng/thu theo màn hình thật */
  function fit(){ if(!root) return; const el=root;
    const land=matchMedia('(orientation:landscape) and (max-height:640px)').matches;
    if(!land){ el.style.cssText=''; return; }
    const hdr=document.querySelector('.tb-top'); const hh=(hdr&&getComputedStyle(hdr).display!=='none')?hdr.offsetHeight:0;
    const vv=window.visualViewport, vh=Math.max(200,(vv?vv.height:innerHeight)-hh), vw=vv?vv.width:innerWidth;
    let s=Math.min(1.4,vh/380); if(vw/s<700) s=vw/700; s=Math.max(.55,s);
    el.style.cssText=`width:${(vw/s).toFixed(1)}px;height:${(vh/s).toFixed(1)}px;transform:scale(${s.toFixed(4)});transform-origin:0 0`; }
  window.addEventListener('resize',()=>requestAnimationFrame(fit)); window.addEventListener('orientationchange',()=>setTimeout(fit,250));
  if(window.visualViewport) window.visualViewport.addEventListener('resize',()=>requestAnimationFrame(fit));
  document.addEventListener('fullscreenchange',()=>setTimeout(fit,100)); document.addEventListener('webkitfullscreenchange',()=>setTimeout(fit,100));
  function render(S,ME,api){
    if(!root){ document.getElementById('tb-game').innerHTML=`<div id="kh"><div class="khwrap"><div class="lft"></div><div class="kbwrap"><div class="frame"><svg id="khs" viewBox="${VB.minX} ${VB.minY} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet"></svg><svg id="khd" viewBox="${VB.minX} ${VB.minY} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet"></svg></div><div class="kst"></div><button class="kfx" type="button" title="Đổi chế độ hiệu ứng"></button><button class="kfs" type="button" title="Toàn màn hình">⛶ Toàn màn hình</button><div class="hov"></div></div><div class="side"><div class="s1"></div><div class="chs"></div><div class="s2"></div></div></div></div>`;
      { const ch=document.getElementById('tb-chat'); if(ch){ root0chat=ch; root0=document.querySelector('#kh .chs'); root0.appendChild(ch); ch.classList.add('show'); } }
      root=$('#kh'); { const fx=root.querySelector('.kfx'); const lab=()=>{ fx.textContent=window.KH_LITE?'🌙 Nhẹ':'✨ Đẹp'; }; lab(); fx.addEventListener('click',e=>{ e.stopPropagation(); const m=KH_FX.toggle(); lab(); boardSig=''; if(lastArgs) render(...lastArgs); if(lastArgs) lastArgs[2].toast(m==='lite'?'Chế độ nhẹ: ít hiệu ứng, mượt trên máy yếu':'Chế độ đẹp: đầy đủ hiệu ứng'); }); } { const fs=root.querySelector('.kfs'); const de=document.documentElement;
        const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
        const sync=()=>{ document.body.classList.toggle('khfs',isFs()); fs.textContent=isFs()?'⛶ Thu nhỏ':'⛶ Toàn màn hình'; };
        document.addEventListener('fullscreenchange',sync); document.addEventListener('webkitfullscreenchange',sync);
        fs.addEventListener('click',async e=>{ e.stopPropagation();
          try{ if(isFs()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); try{screen.orientation.unlock();}catch(_){ } }
            else if(de.requestFullscreen||de.webkitRequestFullscreen){ await (de.requestFullscreen||de.webkitRequestFullscreen).call(de); try{ await screen.orientation.lock('landscape'); }catch(_){ } }
            else if(lastArgs) lastArgs[2].toast('iPhone chưa hỗ trợ nút này: bấm Chia sẻ → Thêm vào Màn hình chính rồi mở game từ biểu tượng để chơi toàn màn hình'); }
          catch(err){ if(lastArgs) lastArgs[2].toast('Trình duyệt không cho bật toàn màn hình'); } }); }
      root.addEventListener('click',onClick); fit(); setTimeout(fit,300); root.addEventListener('change',onChange); }
    lastArgs=[S,ME,api]; const sig=S.hex.map(h=>h.res+'.'+h.num).join()+S.ports.join()+(window.KH_LITE?'L':'F');
    if (sig!==boardSig){ boardSig=sig; root.querySelector('#khs').innerHTML=A.board(S,VB); }
    const t=api.now(), my=S.turn===ME&&S.phase!=='over', P=ME>=0?S.P[ME]:null, main=my&&S.phase==='play'&&S.step==='main'&&!S.offer;
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
    let L=h, HV=''; h='';
    h+=`<div class="pls">${S.seats.map((p,i)=>{ const Q=S.P[i]; const left=S.turn===i&&S.phase!=='over'?Math.max(0,90-Math.floor((t-S.turnAt)/1000)):null;
      return `<div class="pl ${S.turn===i?'turn':''} ${S.winner===i?'win':''}" data-p="${i}" style="--pc:${PC[i]}"><div class="ph"><svg viewBox="-12 -16 24 28" class="pk">${A.house(0,0,PC[i],false,1)}</svg><b>${api.esc(p.name)}</b>${i===ME?' (bạn)':''}<span class="meds">${S.longest===i?`<span class="medal lr" title="Đường dài nhất +2 điểm">${A.medal('road')}</span>`:''}${S.largest===i?`<span class="medal la" title="Quân mạnh nhất +2 điểm">${A.medal('army')}</span>`:''}</span>${left!=null?` <span class="tmr">${left}</span>`:''}<span class="vp">${KH.vp(S,i,i===ME||S.phase==='over')}<small>điểm</small></span></div>
        <div class="pcn"><span title="Nhà"><img src="assets/house-neutral.webp?v=20261128za">${5-Q.towns}</span><span title="Thành phố"><img src="assets/city-neutral.webp?v=20261128za">${4-Q.cities}</span><span title="Đường"><img src="assets/road-neutral.webp?v=20261128za" class="rd">${15-Q.roads}</span></div>
        ${i!==ME&&ME>=0?`<button class="tbtn sm pto" data-a="offerto" data-p="${i}" ${main&&P&&P.res[og]>=oq&&og!==ow?'':'disabled'} title="Gửi: đưa ${oq} ${KH_RES[og]}, lấy ${on} ${KH_RES[ow]}">Yêu cầu đổi</button>`:''}
        <div class="ps"><span title="Tài nguyên"><i>Tài nguyên: </i><u>🎴</u><b class="rn2">${KH.tot(Q.res)}</b></span><span title="Thẻ phát triển"><i>Thẻ PT: </i><u>📜</u>${Q.dev.length+Q.newDev.length}</span><span title="Hiệp sĩ đã dùng"><i>Hiệp sĩ: </i><u>⚔️</u>${Q.knights}</span></div>
        </div>`; }).join('')}</div>`;
    const S1=h; h='';
    { const V='?v=20261128za';
      const cc=c=>c.map((x,r)=>x?`<span class="cr">${[...Array(x)].map(()=>`<svg viewBox="-9 -8 18 16" width="21" height="19">${A.resMini(r,0,0,.8)}</svg>`).join('')}</span>`:'').join('');
      const row=(ic,t,pt,c,att,dis,on)=>`<button class="ctr cbtn ${on?'on':''}" ${att} ${dis?'disabled':''}><span class="cic">${ic}</span><span class="ctx"><b>${t}</b><small>${pt}</small></span><span class="cco">${cc(c)}</span></button>`;
      const okR=main&&P&&(KH.canPay(P,KH_COST.road)||S.free)&&P.roads>0, okT=main&&P&&KH.canPay(P,KH_COST.town)&&P.towns>0, okC=main&&P&&KH.canPay(P,KH_COST.city)&&P.cities>0, okD=main&&P&&KH.canPay(P,KH_COST.dev)&&S.dev.length>0;
      L+=`<div class="box ctab"><div class="cth">Bảng chi phí xây dựng</div>${row(`<img src="assets/road-neutral.webp${V}" class="ci rd">`,'Đường',S.free?`Còn ${S.free} đường miễn phí`:'',KH_COST.road,'data-m="road"',!okR,mode==='road')}${row(`<img src="assets/house-neutral.webp${V}" class="ci">`,'Nhà','+1 điểm',KH_COST.town,'data-m="town"',!okT,mode==='town')}${row(`<img src="assets/city-neutral.webp${V}" class="ci">`,'Thành phố','+2 điểm · nâng từ nhà',KH_COST.city,'data-m="city"',!okC,mode==='city')}${row(`<span class="ci dcs">${A.devBack()}</span>`,'Thẻ phát triển','',KH_COST.dev,'data-a="buydev"',!okD,false)}${my&&S.phase==='play'?'<div class="chint">Bấm vào mục để xây</div>':''}</div>`; }
    if (P){
      HV=`<div class="box hand">${P.res.map((x,r)=>`<div class="rstack ${x?'':'none'}" title="${KH_RES[r]}">${[...Array(Math.max(1,Math.min(x,4)))].map((_,k)=>`<div class="rc" style="--k:${k}">${A.resCard(r)}</div>`).join('')}<b>${x}</b></div>`).join('')}</div>`;
      const cost=c=>c.map((x,r)=>x?`<span class="cr">${[...Array(x)].map(()=>`<svg viewBox="-9 -8 18 16" width="15" height="14">${A.resMini(r,0,0,.8)}</svg>`).join('')}</span>`:'').join('');
      const B=(k,label,c,dis)=>`<button class="tbtn bld ${mode===k?'on':''}" data-m="${k}" ${dis?'disabled':''}><b>${label}</b><span>${cost(c)}</span></button>`;

      const dv={}; P.dev.forEach(d=>dv[d]=(dv[d]||0)+1); const nv={}; P.newDev.forEach(d=>nv[d]=(nv[d]||0)+1);
      const canDev=my&&S.phase==='play'&&!S.devPlayed&&(S.step==='main'||S.step==='roll');
      const devs=Object.keys(KH_DEVN).filter(k=>dv[k]||nv[k]);
      if (devs.length) h+=`<div class="box dv"><div class="dvl">${devs.map(k=>`<div class="dcard ${nv[k]&&!dv[k]?'new':''}">${A.devCard(k)}<b>×${(dv[k]||0)+(nv[k]||0)}</b>
        ${k==='vp'?'<small>+1 điểm ẩn</small>':dv[k]?`<button class="tbtn sm" data-dev="${k}" ${canDev&&(k==='knight'||S.step==='main')?'':'disabled'}>Dùng</button>`:'<small>mới mua</small>'}</div>`).join('')}</div>
        ${dsel?`<div class="dpick">${dsel==='mono'?'Gom loại:':'Nhận 2 lá:'} ${KH_RES.map((nm,r)=>`<button class="tbtn sm" data-pr="${r}">${nm}</button>`).join('')} <button class="tbtn sm" data-a="dcancel">Huỷ</button></div>`:''}</div>`;
      { const rt=KH.rates(S,ME), elig=P.res.map((x,r)=>x>=rt[r]), anyB=main&&elig.some(Boolean);
        if(pop==='bank'&&anyB&&!elig[tg]){ tg=elig.findIndex(Boolean); if(tw===tg) tw=(tg+1)%5; }
        const mini=r=>`<svg viewBox="-9 -8 18 16" width="26" height="24">${A.resMini(r,0,0,.8)}</svg>`;
        const gb=KH_RES.map((nm,r)=>`<button class="rbtn ${tg===r?'sel':''} ${elig[r]&&main?'glow':''}" data-a="bg" data-r="${r}" ${elig[r]&&main?'':'disabled'} title="${nm}">${mini(r)}<b>${rt[r]}</b></button>`).join('');
        const wb=KH_RES.map((nm,r)=>`<button class="rbtn ${tw===r?'sel':''}" data-a="bw" data-r="${r}" ${r===tg?'disabled':''} title="${nm}">${mini(r)}<b>1</b></button>`).join('');
        const okT=main&&elig[tg]&&tg!==tw;
        const opt=(n,sel,not)=>KH_RES.map((x,r)=>`<option value="${r}" ${r===sel?'selected':''} ${r===not?'disabled':''}>${x}</option>`).join(''), qty=(sel)=>[1,2,3,4].map(q=>`<option value="${q}" ${q===sel?'selected':''}>${q}</option>`).join('');
        if(pop==='offer'&&P.res[og]<oq){ if(P.res[og]>0) oq=Math.min(4,P.res[og]); else { const f=P.res.findIndex(x=>x>0); if(f>=0){ og=f; oq=Math.min(oq,P.res[f])||1; } } } if(ow===og) ow=(og+1)%5;
        const others=S.seats.map((x,i)=>i).filter(i=>i!==ME), okO=main&&P.res[og]>=oq&&og!==ow;
        const popH=pop==='bank'?`<div class="box pop"><div class="cth">Đổi với cảng · ngân hàng</div><div class="plb">Đưa (số lá cần có)</div><div class="rrow">${gb}</div><div class="plb">Lấy</div><div class="rrow">${wb}</div><button class="tbtn pri wide" data-a="trade" ${okT?'':'disabled'}>Đổi ${rt[tg]} ${KH_RES[tg]} lấy 1 ${KH_RES[tw]}</button></div>`
          :pop==='offer'?`<div class="box pop ptr"><div class="cth">Yêu cầu đổi với người chơi</div><div class="prow"><span>Đưa</span><select data-s="oq">${qty(oq)}</select><select data-s="og">${opt(0,og,ow)}</select></div><div class="prow"><span>Lấy</span><select data-s="on">${qty(on)}</select><select data-s="ow">${opt(0,ow,og)}</select></div>
          <div class="prow"><span>Cho</span><select data-s="ot"><option value="-1" ${ot<0?'selected':''}>Tất cả</option>${others.map(i=>`<option value="${i}" ${ot===i?'selected':''}>${api.esc(S.seats[i].name)}</option>`).join('')}</select></div>${main?(P.res[og]>=oq?'':'<div class="chint">Bạn chưa đủ lá để đưa</div>'):'<div class="chint">Chỉ gửi được trong lượt của bạn, sau khi đổ xúc xắc</div>'}<button class="tbtn pri wide" data-a="offer" ${okO?'':'disabled'}>Gửi yêu cầu đổi</button></div>`:'';
        HV+=`<div class="tbar">${popH}<button class="bt ${anyB?'ring':''} ${pop==='bank'?'on':''}" data-a="pop" data-k="bank" title="Đổi với cảng / ngân hàng"><img src="assets/boat.webp?v=20261128za" alt=""><small>Đổi cảng</small></button><button class="bt bm ${pop==='offer'?'on':''}" data-a="pop" data-k="offer" title="Chợ: yêu cầu đổi với người chơi"><svg viewBox="0 0 50 50" width="46" height="46" class="mk"><rect x="9" y="19" width="3" height="22" rx="1" fill="#8a5a2c" stroke="#3a210c" stroke-width="1"/><rect x="38" y="19" width="3" height="22" rx="1" fill="#8a5a2c" stroke="#3a210c" stroke-width="1"/><g stroke="#3a210c" stroke-width="1.1" stroke-linejoin="round"><polygon points="10,9 16,9 13.6,20 6.0,20" fill="#e11d48"/><polygon points="16,9 22,9 21.2,20 13.6,20" fill="#fff4d6"/><polygon points="22,9 28,9 28.8,20 21.2,20" fill="#e11d48"/><polygon points="28,9 34,9 36.4,20 28.8,20" fill="#fff4d6"/><polygon points="34,9 40,9 44.0,20 36.4,20" fill="#e11d48"/><circle cx="9.8" cy="20" r="3.8" fill="#e11d48"/><circle cx="17.4" cy="20" r="3.8" fill="#fff4d6"/><circle cx="25.0" cy="20" r="3.8" fill="#e11d48"/><circle cx="32.6" cy="20" r="3.8" fill="#fff4d6"/><circle cx="40.2" cy="20" r="3.8" fill="#e11d48"/></g><rect x="7" y="33" width="36" height="9" rx="2" fill="#b8763a" stroke="#3a210c" stroke-width="1.2"/><rect x="7" y="33" width="36" height="3" rx="1.5" fill="#d99a58"/><circle cx="17" cy="31" r="3.6" fill="#ef4444" stroke="#3a210c" stroke-width="1"/><circle cx="25" cy="30.5" r="3.6" fill="#facc15" stroke="#3a210c" stroke-width="1"/><circle cx="33" cy="31" r="3.6" fill="#4ade80" stroke="#3a210c" stroke-width="1"/></svg><small>Chợ</small></button></div>`; }
      { const mx=Math.max(0,...S.P.map(q=>q.lr)), mk=Math.max(0,...S.P.map(q=>q.knights)); const hd=i=>i>=0?`<span class="hold" style="--pc:${PC[i]}">${api.esc(S.seats[i].name)}</span>`:'<span class="hold none">Chưa ai</span>';
        const slot=(k,cls,own)=>own<0?`<span class="medal ${cls}">${A.medal(k)}</span>`:`<span class="slot"></span>`;
        L+=`<div class="box awp"><div class="cth">Giải thưởng +2 điểm</div>
          <div class="arow">${slot('road','lr',S.longest)}<span class="atx"><b>Đường dài nhất</b><small>Từ 5 đoạn trở lên · cao nhất: ${mx}</small>${hd(S.longest)}</span></div>
          <div class="arow">${slot('army','la',S.largest)}<span class="atx"><b>Quân mạnh nhất</b><small>Từ 3 hiệp sĩ trở lên · cao nhất: ${mk}</small>${hd(S.largest)}</span></div></div>`; }
      L+=`<div class="box"><button class="tbtn pri wide" data-a="end" ${main?'':'disabled'}>Kết thúc lượt</button>${S.phase==='over'&&api.mode()!=='client'?'<button class="tbtn gold wide" data-a="again">Chơi ván mới</button>':''}</div>`; }
    h+=`<div class="xlog">${S.log.slice(0,6).map(l=>`<div>${api.esc(l)}</div>`).join('')}</div>`;
    const preM={lr:rectOf('.medal.lr'),la:rectOf('.medal.la')};
    root.querySelector('.hov').innerHTML=HV; root.querySelector('.lft').innerHTML=L; root.querySelector('.s1').innerHTML=S1; root.querySelector('.s2').innerHTML=h;
    { const keys={lr:S.longest,la:S.largest}; [['lr','road'],['la','army']].forEach(([c,k])=>{ if(prevAw[c]!==undefined&&prevAw[c]!==keys[c]&&keys[c]!==undefined){ const to=rectOf('.medal.'+c); const el=root.querySelector('.medal.'+c); if(el&&to&&preM[c]){ el.style.visibility='hidden'; fly(preM[c],to,A.medal(k),48,48,0); setTimeout(()=>{ el.style.visibility=''; el.classList.add('land'); },1150); } else if(el) el.classList.add('land'); } prevAw[c]=keys[c]; }); }
    if(root0chat){ root0chat.classList.add('show'); let cf=root0chat.querySelector('.cfeed'); if(!cf){ cf=document.createElement('div'); cf.className='cfeed'; const hd=root0chat.querySelector('.hd'); if(hd) hd.after(cf); else root0chat.prepend(cf); }
      const tl=S.log.slice(0,12).filter(l=>/muốn đổi|đổi với|lời mời|yêu cầu đổi|Không ai đồng ý|đủ lá để đổi/.test(l)).slice(0,S.offer?2:3).reverse();
      cf.innerHTML=tl.map(l=>`<div class="tl">${api.esc(l)}</div>`).join('')+offerBox(S,ME,api); }
    if(isNew){ lastEv=ev.n;
      if(ev.k==='roll'){ SFX.clack(3); const sum=ev.d[0]+ev.d[1]; if(sum===7) api.toast('Ra 7! Kẻ cướp xuất hiện');
        if(ev.got){ let k=0; S.hex.forEach((hx,hi)=>{ if(hx.num!==sum||hi===S.robber) return; KH.HEX[hi].v.forEach(v=>{ const o=S.vo[v]; if(!o) return; const from=svgPt(X(KH.HEX[hi].x),X(KH.HEX[hi].y)), to=rectOf(`.pl[data-p="${o.p}"]`); for(let c=0;c<(o.city?2:1);c++) fly(from,to,A.resCard(hx.res),66,50,300+(k++)*120); }); });
          if(ME>=0&&KH.tot(ev.got[ME])) setTimeout(()=>SFX.ding(),900); } }
      else if(ev.k==='award'){ api.toast('<b>'+api.esc(S.seats[ev.seat].name)+'</b> giành '+(ev.a==='road'?'Đường dài nhất':'Quân mạnh nhất')+' (+2 điểm)'); SFX.reward&&SFX.reward(); }
      else if(ev.k==='offer'){ if(ev.seat!==ME&&S.offer&&ME>=0&&(S.offer.to<0||S.offer.to===ME)) { SFX.ding&&SFX.ding(); api.toast(api.esc(S.seats[ev.seat].name)+' muốn đổi tài nguyên — xem ở khung Trò chuyện'); } }
      else if(ev.k==='town'||ev.k==='city'||ev.k==='road'){ SFX.clack(2); if(ev.seat===ME&&ev.k!=='road') SFX.reward(); }
      else if(ev.k==='steal'){ SFX.flip(); fly(pre.vic,rectOf(`.pl[data-p="${ev.seat}"]`),`<div class="khback"></div>`,42,59,350); if(ev.vic===ME) api.toast(api.esc(S.seats[ev.seat].name)+' lấy của bạn 1 '+KH_RES[ev.r]); else if(ev.seat===ME) api.toast('Bạn lấy được 1 '+KH_RES[ev.r],true); }
      else if(ev.k==='buydev'){ SFX.flip(); if(ev.seat===ME){ api.toast('Bạn nhận thẻ: '+KH_DEVN[ev.d],true); fly(rectOf('[data-a="buydev"]'),rectOf('.dv')||rectOf('.hand'),A.devCard(ev.d),56,78,0); } }
      else if(ev.k==='award'){ SFX.ding(); api.toast(api.esc(S.seats[ev.seat].name)+(ev.a==='road'?' giành Đường dài nhất (+2)':' giành Đạo quân mạnh nhất (+2)'),ev.seat===ME); }
      else if(ev.k==='over'){ SFX.ding(); if(S.winner===ME){ SFX.reward(); FX.confetti(innerWidth/2,innerHeight*.4,140); } }
      else if(ev.k==='dev'||ev.k==='trade') SFX.pop();
      if(my && (S.step==='roll'||S.phase==='setup'&&S.step==='town') && ev.k!=='roll' && SFX.hiss) SFX.hiss(); }
  }
  function tickView(S,ME,api){ const el=root&&root.querySelector('.pl.turn .tmr'); if(el) el.textContent=Math.max(0,90-Math.floor((api.now()-S.turnAt)/1000)); }
  function onChange(e){ const s=e.target.dataset.s; if(!s) return; const v=+e.target.value; if(s==='g') tg=v; else if(s==='w') tw=v; else if(s==='og') og=v; else if(s==='oq') oq=v; else if(s==='ow') ow=v; else if(s==='on') on=v; else if(s==='ot') ot=v; render(window.__S,Table.API.me(),Table.API); }
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
    if (a==='pop'){ pop=pop===d.k?null:d.k; rr(); return; }
    if (a==='bg'){ tg=+d.r; if(tw===tg) tw=(tg+1)%5; rr(); return; }
    if (a==='bw'){ tw=+d.r; rr(); return; }
    if (a==='trade'){ api.act({t:'trade',give:tg,get:tw}); pop=null; return; }
    if (a==='offerto'){ const g=[0,0,0,0,0], w=[0,0,0,0,0]; g[og]=oq; w[ow]=on; ot=+d.p; api.act({t:'offer',give:g,get:w,to:ot}); return; }
    if (a==='offer'){ const g=[0,0,0,0,0], w=[0,0,0,0,0]; g[og]=oq; w[ow]=on; api.act({t:'offer',give:g,get:w,to:ot}); pop=null; return; }
    if (a==='yes'||a==='no'){ api.act({t:'answer',ok:a==='yes'}); return; }
    if (a) api.act({t:a}); }
  return { render:(S,ME,api)=>{ window.__S=S; render(S,ME,api); }, tickView };
})();
