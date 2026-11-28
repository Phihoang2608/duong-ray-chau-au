/* ===================== GIAO DIỆN BIỂN MUỐI & THUYỀN GIẤY ===================== */
const BMUI=(()=>{
  const A=BMART, $=s=>document.querySelector(s);
  const ORDER=BM_TYPES.map(t=>t.k);
  const sortIds=ids=>ids.slice().sort((a,b)=>ORDER.indexOf(BM.CARDS[a].t)-ORDER.indexOf(BM.CARDS[b].t)||BM.CARDS[a].c-BM.CARDS[b].c||a-b);
  const RULE={cua:'Cặp 2 Cua = 1 điểm. Khi đánh ra: xem một chồng bỏ và lấy 1 lá tùy chọn.',thuyen:'Cặp 2 Thuyền = 1 điểm. Khi đánh ra: được đi thêm một lượt ngay.',ca:'Cặp 2 Cá = 1 điểm. Khi đánh ra: rút lá trên cùng chồng bài.',
    map:'Cá mập + Người bơi = 1 điểm. Khi đánh ra: rút ngẫu nhiên 1 lá trên tay một đối thủ.',boi:'Người bơi + Cá mập = 1 điểm. Khi đánh ra: rút ngẫu nhiên 1 lá trên tay một đối thủ.',
    vo:'Vỏ sò: 1 lá = 0 điểm, 2 lá = 2, 3 lá = 4, 4 lá = 6, 5 lá = 8, 6 lá = 10.',bt:'Bạch tuộc: 1 lá = 0, 2 lá = 3, 3 lá = 6, 4 lá = 9, 5 lá = 12.',cc:'Chim cánh cụt: 1 lá = 1 điểm, 2 lá = 3, 3 lá = 5.',tt:'Thủy thủ: 1 lá = 0 điểm, 2 lá = 5 điểm.',
    hd:'Hải đăng: mỗi lá Thuyền bạn có được +1 điểm.',dc:'Đàn cá: mỗi lá Cá bạn có được +1 điểm.',dcc:'Đàn chim cánh cụt: mỗi lá Chim cánh cụt bạn có được +2 điểm.',tn:'Thuyền trưởng: mỗi lá Thủy thủ bạn có được +3 điểm.',
    tf:'Nàng tiên cá: mỗi nàng cho điểm bằng số lá của màu bạn có nhiều nhất (nàng thứ hai tính màu nhiều thứ hai…). Đủ 4 nàng là thắng ngay!'};
  let crabP=-1, note='', autoKey='', autoT=0, dragT=0, root=null, sel=-1, lastEv=null, ZM=1, lastSec=-1, firstDraw=true, lastTurnMe=false, resShown=-1;
  const PREV={};
  /* ---------- tiện ích ---------- */
  function syncKids(a,b){ const A_=a.childNodes, B=b.childNodes; let i=0;
    for(;i<B.length;i++){ const o=A_[i], n=B[i]; if(!o){ a.appendChild(n.cloneNode(true)); continue; } if(o.isEqualNode(n)) continue;
      if(o.nodeType!==n.nodeType||o.nodeName!==n.nodeName||o.nodeType!==1||o.namespaceURI!==n.namespaceURI||(o.nodeName==='svg')){ a.replaceChild(n.cloneNode(true),o); continue; }
      const oa=o.attributes, na=n.attributes; for(let k=oa.length-1;k>=0;k--){ const at=oa[k]; if(!n.hasAttribute(at.name)) o.removeAttribute(at.name); }
      for(let k=0;k<na.length;k++){ const at=na[k]; if(o.getAttribute(at.name)!==at.value) o.setAttribute(at.name,at.value); }
      syncKids(o,n); }
    while(A_.length>B.length) a.removeChild(a.lastChild); }
  function morph(par,html){ const t=document.createElement('template'); t.innerHTML=html; syncKids(par,t.content); }
  const LITE=()=>document.documentElement.classList.contains('bmlite');
  const _anim=Element.prototype.animate;
  if(!Element.prototype.__bmw){ Element.prototype.__bmw=1; Element.prototype.animate=function(kf,o){ const d=document.documentElement;
    if(d.classList.contains('bmoff')&&this.closest&&this.closest('#bm,.bmfly,.bmpp,.bmgain,.bmsp,body')){ o=typeof o==='number'?1:Object.assign({},o,{duration:1,delay:0}); }
    if(d.classList.contains('bmlite')&&Array.isArray(kf)) kf=kf.map(f=>{ if(!f||f.filter==null) return f; const g=Object.assign({},f); delete g.filter; return g; });
    return _anim.call(this,kf,o); }; }
  const FXN={full:'✨ Hiệu ứng: Đầy đủ',lite:'🌙 Hiệu ứng: Nhẹ',off:'⚡ Hiệu ứng: Tắt'};
  function fxMode(){ let m=null; try{ m=localStorage.getItem('bm-fx'); }catch(e){} if(m&&FXN[m]) return m; return 'lite'; }
  function applyFx(){ const m=fxMode(), d=document.documentElement; d.classList.toggle('bmlite',m!=='full'); d.classList.toggle('bmoff',m==='off'); document.querySelectorAll('[data-tool="fx"]').forEach(b=>{ b.textContent=m==='full'?'✨':m==='lite'?'🌙':'⚡'; b.title=FXN[m]; }); }
  function cycleFx(){ const o=['full','lite','off'], m=o[(o.indexOf(fxMode())+1)%3]; try{ localStorage.setItem('bm-fx',m); }catch(e){} applyFx(); Table.API.toast(FXN[m]); }
  applyFx();
  /* ---------- âm thanh ---------- */
  const SND={ tach(){ if(!SFX.ok||!SFX.ok()) return; SFX.noise(.045,{vol:.38,freq:4200,q:2}); SFX.noise(.035,{vol:.22,freq:1700,q:1,at:.035}); SFX.tone(1900,.03,{type:'triangle',vol:.05,at:.002}); },
    tinh(){ if(!SFX.ok||!SFX.ok()) return; SFX.tone(2093,.45,{vol:.09,attack:.002}); SFX.tone(4186,.2,{vol:.03,attack:.001}); SFX.tone(3136,.35,{vol:.05,at:.06,attack:.002}); },
    pop(){ if(SFX.pop) SFX.pop(); } };
  /* ---------- hiệu ứng bay / nổi ---------- */
  const rectOf=sel=>{ const e=root&&root.querySelector(sel); return e?e.getBoundingClientRect():null; };
  function fly(from,to,html,w,h,delay,done){ if(!from||!to){ done&&done(); return; } const el=document.createElement('div'); el.className='bmfly'; el.innerHTML=html; el.style.setProperty('--cw',w+'px');
    const x0=from.left+from.width/2-w/2, y0=from.top+from.height/2-h/2, x1=to.left+to.width/2-w/2, y1=to.top+to.height/2-h/2;
    Object.assign(el.style,{left:x0+'px',top:y0+'px',width:w+'px',height:h+'px'}); document.body.appendChild(el);
    const mx=(x1-x0)/2, my=(y1-y0)/2-Math.min(120,Math.abs(x1-x0)*.2+40);
    const an=el.animate([{transform:'translate(0,0) scale(1) rotate(0)',opacity:1},{transform:`translate(${mx}px,${my}px) scale(1.15) rotate(${(Math.random()-.5)*24}deg)`,opacity:1,offset:.45},{transform:`translate(${x1-x0}px,${y1-y0}px) scale(.55) rotate(0)`,opacity:.25}],{duration:720,delay:delay||0,easing:'cubic-bezier(.4,.1,.3,1)',fill:'both'});
    if(delay) setTimeout(SND.tach,delay); else SND.tach();
    an.onfinish=()=>{ el.remove(); done&&done(); }; }
  const cw=sel=>{ const e=root&&root.querySelector(sel); return e?e.getBoundingClientRect().width:56; };
  function ptsPop(seat,n,sel){ const e=root&&root.querySelector(`.pl[data-p="${seat}"] ${sel||'.pts'}`); if(!e||n<=0) return; const r=e.getBoundingClientRect(); const b=document.createElement('div'); b.className='bmpp'; b.textContent='+'+n; document.body.appendChild(b);
    b.style.left=(r.left+r.width/2-b.offsetWidth/2)+'px'; b.style.top=(r.top-2)+'px';
    b.animate([{opacity:0,transform:'translateY(8px) scale(.6)'},{opacity:1,transform:'translateY(-10px) scale(1.15)',offset:.25},{opacity:1,transform:'translateY(-16px) scale(1)',offset:.7},{opacity:0,transform:'translateY(-30px)'}],{duration:1300,easing:'ease-out',fill:'both'}).onfinish=()=>b.remove();
    e.animate([{transform:'scale(1)'},{transform:'scale(1.4)',color:'#fff6b0'},{transform:'scale(1)'}],{duration:560,easing:'ease-out'}); SND.tinh(); }
  function banner(cls,title,msg,ms){ const b=document.createElement('div'); b.className='bmban '+cls; b.innerHTML=`<div class="t">${title}</div><div class="m">${msg}</div>`; document.body.appendChild(b); setTimeout(()=>b.classList.add('out'),(ms||2800)); setTimeout(()=>b.remove(),(ms||2800)+600); }
  function sparkle(rect,n,col){ if(!rect||document.documentElement.classList.contains('bmoff')) return; n=LITE()?Math.ceil((n||14)/3):(n||14); for(let i=0;i<n;i++){ const p=document.createElement('div'); p.className='bmsp'; p.style.background=col||'#fff6c8'; p.style.left=(rect.left+rect.width/2)+'px'; p.style.top=(rect.top+rect.height/2)+'px'; document.body.appendChild(p);
      const a=Math.random()*Math.PI*2, d=24+Math.random()*50; p.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(.2)`,opacity:0}],{duration:600+Math.random()*350,easing:'ease-out'}).onfinish=()=>p.remove(); } }
  /* ---------- phóng to lá bài ---------- */
  function zoomCard(id){ let ov=document.getElementById('bmzoom'); if(!ov){ ov=document.createElement('div'); ov.id='bmzoom'; document.body.appendChild(ov); ov.addEventListener('click',()=>ov.classList.remove('on')); }
    const C=BM.CARDS[id]; ov.innerHTML=`<div class="zc" style="--cw:min(62vw,40vh*.714,300px)">${A.card(id)}</div><div class="zi"><h3>${A.TYPEN[C.t]}</h3><span class="zcol"><i style="background:${BM_COL[C.c].h}"></i>Màu ${BM_COL[C.c].n}</span><p>${RULE[C.t]}</p><small>Chạm ra ngoài để đóng</small></div>`; ov.classList.add('on'); }
  /* ---------- lịch sử / luật / công cụ ---------- */
  function showHist(){ const api=Table.API, S=window.__S; if(!S) return; const L=S.log; api.modal('📜 Lịch sử ván chơi',`<div class="bmhist">${L.map((l,i)=>`<div><i>${L.length-i}</i>${api.esc(l)}</div>`).join('')}</div>`,[{t:'Đóng',pri:1}]); }
  function setZ(z){ ZM=Math.max(1,Math.min(2.4,z)); if(Math.abs(ZM-1)<.04) ZM=1; const w=root&&root.querySelector('.bmwrap'); if(w) w.style.zoom=ZM===1?'':ZM; root&&root.classList.toggle('zoomed',ZM>1); }
  (function pinch(){ let d0=0,z0=1; const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
    document.addEventListener('touchstart',e=>{ if(e.touches.length===2&&root&&root.contains(e.target)){ d0=dist(e.touches); z0=ZM; } },{passive:true});
    document.addEventListener('touchmove',e=>{ if(d0&&e.touches.length===2){ e.preventDefault(); setZ(z0*dist(e.touches)/d0); } },{passive:false});
    document.addEventListener('touchend',e=>{ if(e.touches.length<2) d0=0; },{passive:true}); })();
  const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  function fsHelp(){ Table.API.modal('Chơi toàn màn hình','<p>Trình duyệt này không cho bật toàn màn hình trực tiếp.</p><p><b>Cách chơi không còn thanh địa chỉ:</b></p><p>• <b>iPhone (Safari):</b> bấm nút Chia sẻ ⬆️ → <b>Thêm vào MH chính</b>, rồi mở game từ biểu tượng ngoài màn hình chính.</p><p>• <b>Android (Chrome):</b> bấm ⋮ → <b>Thêm vào màn hình chính</b> / <b>Cài đặt ứng dụng</b>.</p><p>• Nếu đang mở trong Zalo / Messenger: bấm ⋮ → <b>Mở bằng trình duyệt</b> trước.</p>',[{t:'Đã hiểu',pri:1}]); }
  function toggleFS(){ const d=document.documentElement; if(isFS()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); return; }
    const rq=d.requestFullscreen||d.webkitRequestFullscreen; if(rq){ try{ const p=rq.call(d,{navigationUI:'hide'}); if(p&&p.catch) p.catch(fsHelp); }catch(e){ fsHelp(); } } else fsHelp(); }
  document.addEventListener('fullscreenchange',()=>{ document.documentElement.classList.toggle('bmfs',isFS()); setTimeout(()=>{ try{ fit(); }catch(e){} },300); });
  /* ---------- tính kích thước để mọi thứ nằm gọn trong 1 màn hình ---------- */
  function fan(el,cwpx){ if(!el) return; const kids=el.children.length; if(kids<2){ el.style.setProperty('--ov','0px'); return; } const W=el.clientWidth; const need=kids*cwpx+(kids-1)*3; el.style.setProperty('--ov',need>W?((need-W)/(kids-1)+3).toFixed(1)+'px':'-3px'); }
  function fit(){ if(!root) return; const m=root.querySelector('.bmmain'); if(!m) return; const land=innerWidth>innerHeight*1.05;
    root.classList.toggle('land',land); root.classList.toggle('port',!land);
    const tools=root.querySelector('.bmtools').offsetHeight; const H=root.clientHeight||innerHeight, Wd=root.clientWidth||innerWidth, avail=H-tools-8;
    const wp=land?Math.max(120,root.querySelector('.bmpl').clientWidth-14):Wd-22;
    let kh=1, kt=1; const hw0=land?Math.min(wp/4.6,avail*.22):Math.min(Wd/4.2,avail*.17), pw0=Math.min((root.querySelector('.bmtab').clientWidth-26)/5.4,land?avail*.24:avail*.1);
    const bad=el=>el&&(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1);
    const hands=()=>[...root.querySelectorAll('.bmhand')];
    for(let i=0;i<45;i++){ const hw=hw0*kh, pw=pw0*kt; root.style.setProperty('--hw',hw.toFixed(1)+'px'); root.style.setProperty('--mw',(hw*.5).toFixed(1)+'px'); root.style.setProperty('--ow',(hw*.46).toFixed(1)+'px'); root.style.setProperty('--pw',pw.toFixed(1)+'px');
      root.classList.toggle('smh',hw<54); root.classList.toggle('smo',hw*.46<40);
      root.querySelectorAll('.bmhand').forEach(e=>fan(e,hw)); root.querySelectorAll('.bmtabl').forEach(e=>fan(e,e.closest('.me')?hw*.5:hw*.46)); root.querySelectorAll('.bmopb').forEach(e=>fan(e,hw*.46));
      const handBad=hands().some(e=>{ const n=e.children.length; if(n<2) return false; const step=(e.clientWidth-hw)/(n-1); return step<hw*.62; });
      const tabBad=bad(root.querySelector('.bmtab'))||bad(root.querySelector('.bmbody'))||bad(root.querySelector('.bmside'))||bad(root.querySelector('.bmstat')), plBad=bad(root.querySelector('.bmpl'))||handBad||bad(m);
      if(!tabBad&&!plBad) break; if(tabBad) kt*=.95; if(plBad) kh*=.95; } }
  addEventListener('resize',()=>{ if(window.__S) render(window.__S,Table.API.me(),Table.API); });
  addEventListener('orientationchange',()=>setTimeout(()=>{ if(window.__S) render(window.__S,Table.API.me(),Table.API); },250));
  /* ---------- dựng giao diện ---------- */
  const card=(id,cls,attr)=>{ const h=A.card(id,cls); return attr?h.replace('<div class="bmc','<div '+attr+' class="bmc'):h; };
  function groupRow(ids,cls){ return sortIds(ids).map(id=>card(id,cls||'')).join(''); }
  function clockHtml(S,api){ const el=Math.min(60,Math.max(0,(api.now()-S.turnAt)/1000)); return `<span class="tmr">${A.clock(el.toFixed(2))}</span>`; }
  function seatOrder(S,ME){ const n=S.seats.length, o=[]; const st=ME>=0?ME:0; for(let k=0;k<n;k++) o.push((st+k)%n); return o; }
  function actKinds(S,ME){ const P=S.P[ME], pr=BM.pairsOf(P), kinds={}; pr.forEach(p=>{ kinds[p.kind]=kinds[p.kind]||p; }); return kinds; }
  const KIND={cua:['🦀','Đôi Cua','xem chồng bỏ, lấy 1 lá'],thuyen:['⛵','Đôi Thuyền','đi thêm lượt'],ca:['🐟','Đôi Cá','rút 1 lá'],ms:['🦈','Cá mập + Người bơi','rút trộm 1 lá']};
  function statusText(S,ME,api){ const my=S.phase==='play'&&S.turn===ME, nm=api.esc(S.seats[S.turn]?S.seats[S.turn].name:''), st=S.step;
    if(S.phase==='over') return S.mermaid?`🧜 <b>${api.esc(S.seats[S.winner].name)}</b> gom đủ 4 nàng tiên cá!`:`🏆 <b>${api.esc(S.seats[S.winner].name)}</b> thắng chung cuộc!`;
    if(st==='roundover') return 'Ván đã kết thúc — xem bảng điểm.';
    const lc=S.call?`<div class="bmlc">⏳ CƠ HỘI CUỐI của <b>${api.esc(S.seats[S.call.by].name)}</b> — còn <b>${S.call.left.length}</b> lượt cuối</div>`:'';
    if(my){ const txt={draw:'<b class="me blink">Đến lượt bạn!</b>',
        keep:sel<0?'<b>1/2</b> Chạm lá để GIỮ':'<b>2/2</b> Kéo lá kia vào chồng bỏ',
        play:BM.pairsOf(S.P[ME]).length?'Đánh cặp hoặc kết thúc':'Không có cặp…',
        crab:crabP<0?'🦀 Chọn 1 chồng bỏ':'🦀 Chọn 1 lá',shark:'🦈 Chạm 1 đối thủ'}[st]; return lc+txt; }
    const who='…';
    return lc+`Chờ <b>${nm}</b>${who}`; }
  function pileHtml(S,p,ME,my){ const d=S.disc[p], top=d.length?d[d.length-1]:null; const go=my&&S.step==='draw'&&top!=null, dropT=my&&S.step==='keep'&&sel>=0;
    return `<div class="pile ${go?'go':''} ${dropT?'drop':''}" data-pile="${p}">${top!=null?card(top,'big'):'<div class="bmc empty"><div class="art"></div></div>'}<small>${(dropT?'Thả vào đây':'Bỏ '+(p+1))+' · '+d.length+' lá'}</small></div>`; }
  function render(S,ME,api){ window.__S=S; document.documentElement.classList.add('bmingame'); applyFx();
    if(!root){ document.getElementById('tb-game').innerHTML='<div id="bm"></div>'; root=$('#bm'); root.addEventListener('click',onClick);
      root.addEventListener('contextmenu',e=>{ const el=e.target.closest('[data-cid]'); if(el){ e.preventDefault(); zoomCard(+el.dataset.cid); } });
      let lp=null; document.addEventListener('touchstart',e=>{ const el=e.target.closest&&e.target.closest('#bm [data-cid]'); if(!el) return; lp=setTimeout(()=>{ lp='done'; zoomCard(+el.dataset.cid); },550); },{passive:true});
      const cancel=()=>{ if(lp&&lp!=='done') clearTimeout(lp); }; document.addEventListener('touchend',e=>{ if(lp==='done') e.preventDefault(); cancel(); lp=null; }); document.addEventListener('touchmove',cancel,{passive:true}); }
    const t=api.now(), my=S.phase==='play'&&S.turn===ME&&S.step!=='roundover';
    if(S.step!=='keep') sel=-1; if(S.step!=='crab') crabP=-1;
    if(lastEv===null) lastEv=S.ev?S.ev.n:0; const ev=S.ev, isNew=ev&&ev.n!==lastEv; const pre={};
    if(isNew){ const k=ev.k;
      if(k==='draw2'||k==='fish'||k==='draw1') pre.deck=rectOf('[data-deck]');
      if(k==='take'||k==='crab') pre.pile=rectOf(`[data-pile="${ev.pile}"] .bmc`)||rectOf(`[data-pile="${ev.pile}"]`);
      if(k==='keep'){ pre.keep=ev.seat===ME?rectOf(`.bmdrawn [data-cid="${ev.id}"]`):rectOf('[data-deck]'); pre.drop=ev.seat===ME?rectOf(`.bmdrawn [data-cid="${ev.drop}"]`):rectOf('[data-deck]'); }
      if(k==='duo') pre.ids=ev.ids.map(id=>ev.seat===ME?rectOf(`.me .bmhand [data-cid="${id}"]`):rectOf(`.pl[data-p="${ev.seat}"] .bmopb`)||rectOf(`.pl[data-p="${ev.seat}"]`));
      if(k==='steal') pre.from=rectOf(`.pl[data-p="${ev.from}"] .bmhand`)||rectOf(`.pl[data-p="${ev.from}"] .bmopb`)||rectOf(`.pl[data-p="${ev.from}"]`); }
    if(isNew){ const e=ev, N=x=>'<b>'+api.esc(S.seats[x].name)+'</b>', k=e.k;
      const T={draw2:()=>N(e.seat)+' rút 2 lá',draw1:()=>N(e.seat)+' rút lá cuối',keep:()=>N(e.seat)+' giữ 1 lá, bỏ 1 lá vào chồng '+(e.pile+1),take:()=>N(e.seat)+' lấy lá chồng bỏ '+(e.pile+1),
        duo:()=>({cua:'🦀 '+N(e.seat)+' đánh đôi Cua: lấy 1 lá chồng bỏ',thuyen:'⛵ '+N(e.seat)+' đánh đôi Thuyền: đi thêm lượt',ca:'🐟 '+N(e.seat)+' đánh đôi Cá: rút thêm 1 lá',ms:'🦈 '+N(e.seat)+' đánh Cá mập + Người bơi: rút trộm'}[e.kind]),
        crab:()=>'🦀 '+N(e.seat)+' lấy lá chồng bỏ '+(e.pile+1),fish:()=>'🐟 '+N(e.seat)+' rút thêm 1 lá',steal:()=>'🦈 '+N(e.seat)+' rút trộm 1 lá của '+N(e.from),
        stop:()=>'🛑 '+N(e.seat)+' hô DỪNG',last:()=>'⏳ '+N(e.seat)+' hô CƠ HỘI CUỐI'}[k]; if(T) note=T(); }
    if(!note) note='Chào mừng! Bạn rút bài để bắt đầu';
    const kinds=my&&S.step==='play'?actKinds(S,ME):{}; const P=ME>=0?S.P[ME]:null, mypts=P?BM.myPts(S,ME):0;
    let h=`<div class="bmwrap"><div class="bmtools"><b class="bmttl">Biển Muối &amp; Thuyền Giấy</b><a href="../../index.html" title="Menu trò chơi">🏠</a>
      <button data-tool="chat" class="bmchatb" style="${api.mode()==='local'?'display:none':''}" title="Trò chuyện trong phòng">💬<i class="bmcu"></i></button>
      <button data-tool="fx" title="Mức hiệu ứng">✨</button><button data-tool="app" data-pbg-app title="Tải app">📲</button><button data-tool="acc" title="Tài khoản · Bạn bè · Online">👤</button><button data-tool="fs" title="Toàn màn hình">⛶</button><button data-hist="1" title="Lịch sử ván">📜</button><button data-tool="snd" title="Âm thanh">${SFX.on===false?'🔇':'🔊'}</button><button data-tool="rules" title="Luật chơi">📖</button><button data-tool="zin" title="Phóng to">＋</button><button data-tool="zout" title="Thu nhỏ">－</button></div>
      <div class="bmmain"><div class="bmnote">${note}</div><div class="bmtab"><div class="bminfo">Ván <b>${S.round}</b> · Đích <b>${S.target}</b> điểm · Chồng bài còn <b>${S.deck.length}</b> lá</div>
      <div class="bmbody"><div class="bmpiles"><div class="pile deck ${my&&S.step==='draw'&&S.deck.length?'go':''}" data-deck="1">${A.back('big')}<small>Bài · ${S.deck.length} lá</small></div>${pileHtml(S,0,ME,my)}${pileHtml(S,1,ME,my)}</div>
      <div class="bmside">${my&&S.step==='keep'?'':`<div class="bmstat">${statusText(S,ME,api)}</div>`}</div></div>${my&&S.step==='keep'?`<div class="bmdrawn bmpick">${S.pend.map((id,i)=>card(id,'big '+(sel===i?'pk':(sel>=0?'dis':'')),`data-pend="${i}"`)).join('')}</div>`:''}`;
    if(my&&S.step==='play'){ h+=`<div class="bmacts">`+Object.keys(kinds).filter(k=>k!=='ms'||BM.victims(S,ME).length).map(k=>`<button class="tbtn gold" data-duo="${k}" title="${KIND[k][2]}">${KIND[k][0]} ${KIND[k][1]}</button>`).join('')
      +`<button class="tbtn pri" data-a="end">Kết thúc lượt</button>`
      +(!S.call?`<button class="tbtn stop" data-a="stop" ${mypts>=BM_MIN_END?'':'disabled'} title="Cần từ ${BM_MIN_END} điểm">🛑 DỪNG</button><button class="tbtn last" data-a="last" ${mypts>=BM_MIN_END?'':'disabled'} title="Cần từ ${BM_MIN_END} điểm">⏳ CƠ HỘI CUỐI</button>`:'')+`</div>`; }
    else if(my&&S.step==='draw') h+=`<div class="bmacts"><button class="tbtn pri bmdrawb" data-a="deck" ${S.deck.length?'':'disabled'}>🂠 Lấy ${S.deck.length>1?'2 lá':'lá cuối'} từ chồng bài</button></div>`;
    else if(my&&S.step==='keep') h+=`<div class="bmacts bmhint"><div class="bmstat">${statusText(S,ME,api)}</div></div>`;
    else h+=`<div class="bmacts bmlog"></div>`;
    h+=`</div>`;
    h+=`<div class="bmpl">`;

    const order=seatOrder(S,ME), victimsOk=my&&S.step==='shark'?BM.victims(S,ME):[];
    order.forEach(i=>{ const p=S.seats[i], Q=S.P[i], mine=i===ME, turn=S.turn===i&&S.phase==='play'&&S.step!=='roundover', show=mine||S.rev[i]||S.step==='roundover'||S.phase==='over';
      const live=mine||show?BM.myPts(S,i):BM.tablePts(S,i);
      h+=`<div class="pl ${mine?'me':'op'} ${turn?'turn':''} ${S.phase==='over'&&S.winner===i?'win':''} ${victimsOk.includes(i)?'tgt':''}" data-p="${i}" ${victimsOk.includes(i)?`data-v="${i}"`:''} style="--pc:${p.color||'#38bdf8'}">
        <div class="ph">${api.avatar(p.name,i)}<b class="pn">${api.esc(p.name)}</b>${mine?'<span class="mebadge">BẠN</span>':''}${turn?`<i class="tbadge">${mine?'Lượt bạn':'Đang đi'}</i>`:''}${S.call&&S.call.by===i&&S.phase==='play'?'<i class="cbadge">CƠ HỘI CUỐI</i>':''}<span class="live" title="${mine||show?'Điểm các lá đang có (tay + bàn)':'Điểm các lá đã đánh ra bàn'}">${mine||show?'Lá':'Bàn'} <b>${live}</b></span><span class="pts" title="Tổng điểm / điểm đích"><b>${Q.pts}</b><small>/${S.target}</small></span>${turn?clockHtml(S,api):''}</div>`;
      if(mine){ h+=`<div class="bmtabl">${groupRow(Q.table,'mini')||'<span class="bmempty">Chưa đánh cặp nào</span>'}</div><div class="bmhand">${groupRow(Q.hand,'')||'<span class="bmempty">Chưa có lá nào trên tay</span>'}</div>`; }
      else { h+=`<div class="bmrow"><div class="bmopb ${show?'':'bk'}" title="Bài trên tay">${show?groupRow(Q.hand,'mini'):Q.hand.map(()=>A.back('mini')).join('')}${show||Q.hand.length?'':'<span class="bmempty">Tay trống</span>'}</div><span class="hcnt" title="Số lá trên tay">${Q.hand.length} lá</span><div class="bmtabl">${groupRow(Q.table,'mini')||'<span class="bmempty">Chưa đánh cặp</span>'}</div></div>`; }
      h+=`</div>`; });
    h+=`</div></div></div>`;
    if(root.firstChild) morph(root,h); else root.innerHTML=h; if(ZM!==1){ const w=root.querySelector('.bmwrap'); if(w) w.style.zoom=ZM; }
    // đồng hồ + kích thước
    fit(); lastSec=-1; syncResult(S,ME,api);
    // chọn lá từ chồng bỏ khi đánh đôi Cua
    let cp=document.getElementById('bmcrab'); if(my&&S.step==='crab'){ if(!cp){ cp=document.createElement('div'); cp.id='bmcrab'; root.appendChild(cp); }
      if(crabP<0) cp.innerHTML=`<div class="cph"><b>🦀 Chọn 1 chồng bỏ để xem</b></div><div class="cpb">`+[0,1].map(p=>`<button class="tbtn pri" data-cp="${p}" ${S.disc[p].length?'':'disabled'}>Chồng bỏ ${p+1}<br><small>${S.disc[p].length} lá</small></button>`).join('')+`</div><button class="tbtn" data-a="skipcrab">Bỏ qua</button>`;
      else cp.innerHTML=`<div class="cph"><b>🦀 Chồng bỏ ${crabP+1} — chọn 1 lá</b></div><div class="cpr"><div class="cpc">${sortIds(S.disc[crabP]).map(id=>card(id,'mini',`data-crab="${id}" data-pile="${crabP}"`)).join('')}</div></div><button class="tbtn" data-a="skipcrab">Bỏ qua</button>`;
      cp.querySelectorAll('.cpc').forEach(c=>{ const k=c.firstChild; const w=k&&k.getBoundingClientRect?k.getBoundingClientRect().width:40; fan(c,w); }); }
    else if(cp) cp.remove();
    // điểm nhảy +N cho điểm lá hiện có
    S.seats.forEach((_,i)=>{ const show=i===ME||S.rev[i]||S.step==='roundover'; const v=show?BM.myPts(S,i):BM.tablePts(S,i); const pv=PREV[i]; if(pv!=null&&v>pv&&S.step!=='roundover') setTimeout(()=>ptsPop(i,v-pv,'.live'),400); PREV[i]=v; });
    if(my&&S.step==='play'){ const can=Object.keys(kinds).filter(k=>k!=='ms'||BM.victims(S,ME).length).length, canStop=!S.call&&mypts>=BM_MIN_END;
      if(!can&&!canStop){ const key=S.round+':'+S.turn+':'+S.turnAt+':'+S.deck.length+':'+P.hand.length; if(autoKey!==key){ autoKey=key; clearTimeout(autoT); autoT=setTimeout(()=>{ const N=window.__S; if(N&&N.phase==='play'&&N.turn===ME&&N.step==='play'&&N.turnAt===S.turnAt&&!BM.pairsOf(N.P[ME]).length) api.act({t:'end'}); },1300); } } }
    if(my&&!lastTurnMe&&!firstDraw&&SFX.turn) SFX.turn(); lastTurnMe=my; firstDraw=false;
    if(isNew){ lastEv=ev.n; runEvent(S,ME,api,ev,pre); } }
  function frameRect(seat,mine){ return rectOf(`.pl[data-p="${seat}"] ${seat===window.__ME?'.bmhand':'.bmopb'}`)||rectOf(`.pl[data-p="${seat}"]`); }
  function runEvent(S,ME,api,ev,pre){ window.__ME=ME; const k=ev.k, tgt=s=>rectOf(`.pl[data-p="${s}"] ${s===ME?'.bmhand':'.bmopb'}`)||rectOf(`.pl[data-p="${s}"]`), w=Math.max(34,cw('[data-deck] .bmc')*.8), h=w*1.4, pw=cw('[data-deck] .bmc');
    if(k==='draw2'||k==='draw1'){ if(ev.seat!==ME){ const to=tgt(ev.seat); fly(pre.deck,to,A.back('x'),w,h,0); if(k==='draw2') fly(pre.deck,to,A.back('x'),w,h,150); } else { SND.tach(); } }
    else if(k==='take'){ const to=tgt(ev.seat); fly(pre.pile,to,A.card(ev.id,'x'),w,h,0); }
    else if(k==='keep'){ const pr=rectOf(`[data-pile="${ev.pile}"]`); if(ev.seat===ME){ fly(pre.keep,tgt(ev.seat),A.card(ev.id,'x'),w,h,0); } else fly(pre.keep,tgt(ev.seat),A.back('x'),w,h,0); fly(pre.drop,pr,A.card(ev.drop,'x'),w,h,200); }
    else if(k==='fish'){ fly(pre.deck,tgt(ev.seat),ev.seat===ME?A.card(ev.id,'x'):A.back('x'),w,h,500); }
    else if(k==='crab'){ fly(pre.pile,tgt(ev.seat),A.card(ev.id,'x'),w,h,0); }
    else if(k==='steal'){ fly(pre.from,tgt(ev.seat),ev.seat===ME||ev.from===ME?A.card(ev.id,'x'):A.back('x'),w,h,300); if(ev.from===ME) api.toast('😱 '+api.esc(S.seats[ev.seat].name)+' rút trộm 1 lá của bạn!'); }
    else if(k==='duo'){ const to=rectOf(`.pl[data-p="${ev.seat}"] .bmtabl`)||rectOf(`.pl[data-p="${ev.seat}"]`); ev.ids.forEach((id,j)=>fly(pre.ids&&pre.ids[j],to,A.card(id,'x'),w,h,j*140));
      const txt={cua:'🦀 Đôi Cua!',thuyen:'⛵ Đôi Thuyền — đi thêm lượt!',ca:'🐟 Đôi Cá — rút thêm 1 lá',ms:'🦈 Cá mập + Người bơi — rút trộm!'}[ev.kind]; api.toast(`<b>${api.esc(S.seats[ev.seat].name)}</b>: ${txt}`); }
    else if(k==='stop'){ banner('stop','🛑 DỪNG!',`<b>${api.esc(S.seats[ev.seat].name)}</b> hô DỪNG với ${ev.pts} điểm — mọi người tính điểm`,2800); if(SFX.horn) SFX.horn(); }
    else if(k==='last'){ banner('last','⏳ CƠ HỘI CUỐI!',`<b>${api.esc(S.seats[ev.seat].name)}</b> đặt cược với ${ev.pts} điểm — mỗi người đi thêm 1 lượt`,3200); if(SFX.ok&&SFX.ok()) [523,659,784,1047].forEach((f,i)=>SFX.tone(f,.35,{vol:.12,at:i*.13,type:'triangle'})); }
    else if(k==='round'){ setTimeout(()=>{ ev.rows.forEach(r=>{ if(r.gain>0) ptsPop(r.seat,r.gain,'.pts'); }); },900); }
    else if(k==='over'){ if(SFX.ding) SFX.ding(); if(S.winner===ME){ if(SFX.reward) SFX.reward(); try{ FX.confetti(innerWidth/2,innerHeight*.45,140); }catch(e){} } }
    else if(k==='turn'||k==='newround'){ /* không cần */ } }
  /* ---------- bảng điểm cuối ván ---------- */
  function breakdown(S,i){ const sc=BM.score(BM.allCards(S.P[i])); const bits=[]; bits.push(['Đôi',sc.duo]); bits.push(['Sưu tầm',sc.col]); bits.push(['Nhân điểm',sc.mul]); if(sc.n.tf) bits.push(['Tiên cá',sc.mer]); return {sc,bits}; }
  function syncResult(S,ME,api){ let ov=document.getElementById('bmres'); const need=(S.step==='roundover'||S.phase==='over')&&S.rres; if(!need){ if(ov) ov.remove(); resShown=-1; return; }
    const key=S.round+':'+S.step+':'+S.phase; if(ov&&ov.dataset.k===key&&ov.dataset.b===String(api.mode())) return; if(ov) ov.remove(); ov=document.createElement('div'); ov.id='bmres'; ov.dataset.k=key; ov.dataset.b=String(api.mode()); const R=S.rres, E=api.esc;
    const why=S.mermaid?`🧜 <b>${E(S.seats[S.winner].name)}</b> gom đủ 4 nàng tiên cá — thắng ngay!`:R.kind==='stop'?`🛑 <b>${E(S.seats[R.caller].name)}</b> hô DỪNG — mọi người tính điểm lá (không có thưởng màu).`:R.kind==='last'?(R.ok?`⏳ <b>${E(S.seats[R.caller].name)}</b> cược thắng: được điểm lá + thưởng màu; người khác chỉ nhận thưởng màu.`:`⏳ <b>${E(S.seats[R.caller].name)}</b> cược thua: chỉ nhận thưởng màu; người khác nhận điểm lá.`):'🃏 Chồng bài đã hết — ván này không ai được điểm.';
    const rows=R.rows.slice().sort((a,b)=>(a.seat===ME?-1:b.seat===ME?1:0));
    const blocks=rows.map(r=>{ const i=r.seat, bd=breakdown(S,i); return `<div class="rb ${S.phase==='over'&&S.winner===i?'win':''}"><div class="rh"><b>${E(S.seats[i].name)}${i===ME?' <span class="mebadge">BẠN</span>':''}</b><span class="rg ${r.gain?'':'z'}">+${r.gain}</span><span class="rt">${S.P[i].pts}/${S.target}</span></div>
      <div class="rc">${groupRow(BM.allCards(S.P[i]),'mini')}</div><div class="rl">${bd.bits.map(([n,v])=>`<span>${n} <b>${v}</b></span>`).join('')}<span class="rs">Lá <b>${r.pts}</b></span><span class="rs">Thưởng màu <b>${r.bonus}</b></span></div></div>`; }).join('');
    let btn=''; if(S.phase==='over') btn=api.mode()!=='client'?'<button class="tbtn pri" data-a="again">Chơi ván mới</button>':'<span>Chờ chủ phòng bắt đầu ván mới</span>'; else btn='<button class="tbtn pri" data-a="next">Ván tiếp theo ▶</button>';
    ov.innerHTML=`<div class="rp"><h3>${S.phase==='over'?'🏆 '+E(S.seats[S.winner].name)+' thắng chung cuộc!':'Kết thúc ván '+S.round}</h3><p class="rw">${why}</p><div class="rbs">${blocks}</div><div class="rbt">${btn}</div></div>`; root.appendChild(ov); ov.querySelectorAll('.rc').forEach(c=>fan(c,Math.min(40,c.clientWidth/10))); fit(); ov.querySelectorAll('.rc').forEach(c=>{ const cwp=c.firstChild?c.firstChild.getBoundingClientRect().width:30; fan(c,cwp); }); }
  /* ---------- nhịp đồng hồ ---------- */
  function tickView(S,ME,api){ if(!root||S.phase!=='play'||S.step==='roundover') return; const left=Math.max(0,60-Math.floor((api.now()-S.turnAt)/1000));
    if(left===lastSec) return; lastSec=left; root.querySelectorAll('.ckt').forEach(e=>e.textContent=left); root.querySelectorAll('.ckw').forEach(w=>w.classList.toggle('low',left<=10));
    if(left<=10&&left>0&&S.turn===ME&&SFX.ok&&SFX.ok()){ SFX.tone(left<=3?1900:1400,.05,{type:'triangle',vol:.12,attack:.001}); SFX.noise(.02,{vol:.15,freq:4000,q:3}); } }
  function syncChatBadge(){ const u=document.getElementById('tb-unread'); const n=u&&u.style.display!=='none'?u.textContent:''; document.querySelectorAll('.bmcu').forEach(e=>{ e.textContent=n; e.style.display=n?'':'none'; }); }
  setInterval(syncChatBadge,700);
  /* ---------- bấm ---------- */
  function onClick(e){ const api=Table.API, S=window.__S, ME=api.me(); if(!S) return; const my=S.phase==='play'&&S.turn===ME; if(Date.now()-dragT<350) return;
    const tl=e.target.closest('[data-tool]'); if(tl){ const k=tl.dataset.tool; if(k==='chat'){ const cb=document.getElementById('tb-chatbtn'); if(cb) cb.click(); } else if(k==='fx') cycleFx(); else if(k==='app'){ window.PBG&&PBG.install(); } else if(k==='acc'){ if(window.PBG) (PBG.user?PBG.open():PBG.login()); } else if(k==='fs') toggleFS(); else if(k==='snd'){ const sb=document.getElementById('tb-sound'); sb&&sb.click(); tl.textContent=SFX.on===false?'🔇':'🔊'; } else if(k==='rules'){ const rb=document.getElementById('tb-rules'); rb&&rb.click(); } else if(k==='zin') setZ(ZM*1.2); else if(k==='zout') setZ(ZM/1.2); return; }
    if(e.target.closest('[data-hist]')){ showHist(); return; }
    const b=e.target.closest('[data-a]'); if(b&&!b.disabled){ SND.pop(); const a=b.dataset.a; if(a==='again'){ api.rematch(); return; } if(a==='skipcrab'){ api.act({t:'skip'}); return; } api.act({t:a}); return; }
    const cpb=e.target.closest('[data-cp]'); if(cpb&&my&&S.step==='crab'){ crabP=+cpb.dataset.cp; SND.pop(); render(S,ME,api); return; }
    const du=e.target.closest('[data-duo]'); if(du&&my){ const pr=actKinds(S,ME)[du.dataset.duo]; if(pr){ SND.pop(); api.act({t:'duo',a:pr.a,b:pr.b}); } return; }
    const cr=e.target.closest('[data-crab]'); if(cr&&my&&S.step==='crab'){ api.act({t:'crab',pile:+cr.dataset.pile,id:+cr.dataset.crab}); return; }
    const vc=e.target.closest('[data-v]'); if(vc&&my&&S.step==='shark'){ api.act({t:'steal',v:+vc.dataset.v}); return; }
    const pd=e.target.closest('[data-pend]'); if(pd&&my&&S.step==='keep'){ sel=+pd.dataset.pend; SND.pop(); render(S,ME,api); return; }
    const pl=e.target.closest('[data-pile]'); if(pl&&!pl.closest('#bmcrab')&&my){ const p=+pl.dataset.pile;
      if(S.step==='draw'){ api.act({t:'take',pile:p}); return; } if(S.step==='keep'){ if(sel<0){ api.toast('Hãy chọn 1 lá để giữ trước'); return; } api.act({t:'keep',i:sel,pile:p}); sel=-1; return; } }
    const dk=e.target.closest('[data-deck]'); if(dk&&my&&S.step==='draw'){ api.act({t:'deck'}); return; }
    const hc=e.target.closest('.me .bmhand [data-cid],.bmopb:not(.bk) [data-cid],.bmtabl [data-cid],.pile .bmc[data-cid],#bmres [data-cid]'); if(hc){ zoomCard(+hc.dataset.cid); return; } }
  /* ---------- kéo lá còn lại vào chồng bỏ ---------- */
  document.addEventListener('dragstart',e=>{ if(e.target.closest&&e.target.closest('#bm')) e.preventDefault(); });
  (function drag(){ let el=null,clone=null,x0=0,y0=0,mv=false,hot=null;
    const pileAt=(x,y)=>{ const l=document.elementsFromPoint(x,y); for(const n of l){ const p=n.closest&&n.closest('#bm [data-pile]'); if(p&&!p.closest('#bmcrab')) return p; } return null; };
    document.addEventListener('pointerdown',e=>{ const S=window.__S, api=Table.API; if(!S||S.phase!=='play'||S.turn!==api.me()||S.step!=='keep'||sel<0) return; const c=e.target.closest&&e.target.closest('#bm [data-pend]'); if(!c||+c.dataset.pend===sel) return; el=c; x0=e.clientX; y0=e.clientY; mv=false; });
    document.addEventListener('pointermove',e=>{ if(!el) return; if(!mv){ if(Math.hypot(e.clientX-x0,e.clientY-y0)<8) return; mv=true; const r=el.getBoundingClientRect(); clone=el.cloneNode(true); clone.classList.add('bmdragc'); clone.style.cssText=`position:fixed;z-index:9995;pointer-events:none;width:${r.width}px;height:${r.height}px;left:${r.left}px;top:${r.top}px;--w:${r.width}px;transform:scale(1.12) rotate(4deg);box-shadow:0 10px 24px rgba(0,0,0,.6)`; document.body.appendChild(clone); el.style.opacity='.3'; }
      e.preventDefault&&e.cancelable&&e.preventDefault(); const r=clone.getBoundingClientRect(); clone.style.left=(e.clientX-r.width/2)+'px'; clone.style.top=(e.clientY-r.height/2)+'px';
      const p=pileAt(e.clientX,e.clientY); if(hot!==p){ hot&&hot.classList.remove('hot'); hot=p; hot&&hot.classList.add('hot'); } },{passive:false});
    const end=e=>{ if(!el) return; const S=window.__S, api=Table.API; if(mv){ dragT=Date.now(); const p=pileAt(e.clientX,e.clientY); if(clone) clone.remove(); el.style.opacity=''; if(hot) hot.classList.remove('hot');
        if(p&&S&&S.step==='keep'&&S.turn===api.me()&&sel>=0){ SND.pop(); const i=sel; sel=-1; api.act({t:'keep',i,pile:+p.dataset.pile}); } else api.toast('Hãy thả lá vào Chồng bỏ 1 hoặc Chồng bỏ 2'); }
      el=null; clone=null; hot=null; mv=false; };
    document.addEventListener('pointerup',end); document.addEventListener('pointercancel',end); })();
  return {render,tickView,fit};
})();
