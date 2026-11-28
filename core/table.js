/* BỘ KHUNG DÙNG CHUNG — core/table.js
   Khung "bàn chơi online" cho các game bài / xúc xắc: menu, chơi với máy, tạo phòng, mời bằng link,
   vào lại phòng, trò chuyện, máy đánh thay người vắng, đồng hồ lượt, đồng bộ trạng thái.
   Game chỉ cần khai báo: newGame, apply, whoActs, botAction, render (và tuỳ chọn tick, timeoutAction).
   Cần nạp trước: mqtt, core/room.js, core/audio.js, core/effects.js */
const Table = (()=>{
  let CFG=null, S=null, ME=-1, MODE='local', ROOM=null, CODE=null, PEERS=[], MYPEER=null, LOBBY=false, OFFSET=0;
  let lastAct={}, seq=0, waiting=false, lastBot=0, savedS=null, annKey='', first={}, chatMine=[], chatSeen=new Set(), chatList=[], chatPrimed=false, unread=0;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=s=>String(s||'').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g,'').trim().slice(0,16);
  const ls={ get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };
  const PID=(()=>{ let v=ls.get('bg-pid'); if(!v){ v='p'+Math.random().toString(36).slice(2,12); ls.set('bg-pid',v); } return v; })();
  const now=()=>Date.now()+OFFSET;
  const COLORS=['#ff5f8f','#8a5cf6','#22b38a','#ff9f43','#3fa9f5','#e84393'];

  /* ---------- Giao diện khung ---------- */
  const CSS=`
  :root{--ink:#1d1b2e;--ink2:#555268;--mute:#8b889c;--line:rgba(120,110,170,.18);--card:#fff;--grad:linear-gradient(90deg,#ff5f8f,#8a5cf6)}
  *{box-sizing:border-box} body{margin:0;font-family:"Times New Roman",Times,serif;font-size:15px;color:var(--ink);background:#fbfaff;min-height:100vh;overflow-x:hidden}
  button,input,select{font-family:inherit;font-size:15px}
  .tb-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .tb-bg i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.5;animation:tbf 24s ease-in-out infinite alternate}
  .tb-bg i:nth-child(1){width:480px;height:480px;left:-120px;top:-140px;background:#ffb5d0}.tb-bg i:nth-child(2){width:460px;height:460px;right:-100px;top:-80px;background:#b9c8ff}
  .tb-bg i:nth-child(3){width:420px;height:420px;left:35%;top:40%;background:#c9f2e1}.tb-bg i:nth-child(4){width:400px;height:400px;right:5%;bottom:-160px;background:#ffe2b3}
  @keyframes tbf{to{transform:translate(50px,40px) scale(1.1)}}
  .tb-top{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;padding:8px 14px;background:rgba(255,255,255,.82);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  .tb-top h1{font-size:19px;margin:0;white-space:nowrap;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
  .tb-top .sp{flex:1}
  .tb-top .code{font-size:14px;color:var(--ink2);white-space:nowrap}.tb-top .code b{letter-spacing:.2em;color:var(--ink)}
  .tbtn{border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:10px;padding:7px 12px;cursor:pointer;white-space:nowrap;transition:transform .12s,box-shadow .2s}
  .tbtn:hover{box-shadow:0 4px 12px rgba(80,60,140,.14)} .tbtn:active{transform:translateY(1px)}
  .tbtn.pri{border:none;color:#fff;background:var(--grad);box-shadow:0 6px 16px rgba(138,92,246,.3)}
  .tbtn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
  .tbtn .bd{display:inline-block;min-width:18px;background:#e11d48;color:#fff;border-radius:9px;font-size:11px;padding:0 4px;margin-left:4px}
  .tb-wrap{position:relative;z-index:1}
  .tb-screen{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 56px);padding:20px}
  .tb-panel{background:rgba(255,255,255,.88);backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:22px;box-shadow:0 14px 40px rgba(80,60,140,.14);padding:24px 26px;width:100%;max-width:460px;position:relative}
  .tb-panel::before{content:"";position:absolute;inset:-2px;border-radius:24px;padding:2px;background:linear-gradient(90deg,#ff5f8f,#ffb547,#3fd1a0,#3fa9f5,#8a5cf6,#ff5f8f);background-size:300% 100%;animation:tbrb 8s linear infinite;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
  @keyframes tbrb{to{background-position:300% 0}}
  .tb-panel h2{margin:0 0 4px;font-size:28px;text-align:center}
  .tb-panel .sub{text-align:center;color:var(--ink2);margin:0 0 16px}
  .tb-panel label{display:block;font-size:13.5px;color:var(--ink2);margin:10px 0 4px}
  .tb-panel input,.tb-panel select{width:100%;border:1px solid #e6e1f5;background:#faf9ff;border-radius:12px;padding:10px 12px;outline:none}
  .tb-panel input:focus{border-color:#8a5cf6;box-shadow:0 0 0 3px rgba(138,92,246,.15)}
  .tb-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.tb-grid .full{grid-column:1/-1}
  .tb-grid .tbtn{padding:11px}
  .tb-or{display:flex;align-items:center;gap:10px;color:var(--mute);font-size:13px;margin:12px 0 0;grid-column:1/-1}.tb-or::before,.tb-or::after{content:"";flex:1;height:1px;background:var(--line)}
  .tb-code{font-size:44px;letter-spacing:.25em;text-align:center;font-weight:bold;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;margin:4px 0}
  .tb-link{font-size:12.5px;word-break:break-all;background:#faf9ff;border:1px dashed #d9d2f0;border-radius:10px;padding:6px 10px;color:var(--ink2)}
  .tb-people{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
  .tb-pp{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:3px 10px 3px 3px;animation:tbpop .4s}
  .av{width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:13px;flex:none}
  @keyframes tbpop{from{transform:scale(.6);opacity:0}}
  .spin{width:34px;height:34px;border:4px solid #ece7fb;border-top-color:#8a5cf6;border-radius:50%;animation:tbsp 1s linear infinite;margin:14px auto}@keyframes tbsp{to{transform:rotate(360deg)}}
  .warn{color:#be123c}
  #tb-game{display:none} body.ingame #tb-game{display:block} body.ingame #tb-screen{display:none}
  .tb-chat{position:fixed;right:12px;bottom:12px;z-index:40;width:310px;max-width:calc(100vw - 24px);background:rgba(255,255,255,.95);border:1px solid var(--line);border-radius:18px;box-shadow:0 14px 40px rgba(80,60,140,.2);display:none;flex-direction:column;overflow:hidden}
  .tb-chat.show{display:flex}
  .tb-chat .hd{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;font-weight:bold;border-bottom:1px solid var(--line)}
  .tb-chat .ls{height:210px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:4px}
  .cm{max-width:90%;background:#f3f0fb;border-radius:12px 12px 12px 3px;padding:3px 9px;align-self:flex-start;line-height:1.3}
  .cm.me{align-self:flex-end;background:#ffe4ee;border-radius:12px 12px 3px 12px}.cm b{font-size:12.5px;margin-right:5px}
  .tb-chat form{display:flex;gap:6px;padding:8px;border-top:1px solid var(--line)}
  .tb-chat input{flex:1;min-width:0;border:1px solid #e6e1f5;border-radius:16px;padding:6px 10px;outline:none}
  .tb-chat .qk{display:flex;flex-wrap:wrap;gap:4px;padding:0 8px 8px}.tb-chat .qk button{border:1px solid var(--line);background:#fff;border-radius:12px;padding:1px 8px;cursor:pointer;font-size:13px}
  .tb-toast{position:fixed;right:16px;top:70px;z-index:60;display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none;max-width:min(420px,70vw)}
  .tb-toast div{background:rgba(29,27,46,.9);color:#fff;padding:8px 16px;border-radius:12px;animation:tbt 3s forwards;font-size:15px;text-align:center}
  .tb-toast div.big{font-size:22px;background:var(--grad);padding:10px 22px}
  @keyframes tbt{0%{opacity:0;transform:translateY(-10px)}10%,85%{opacity:1;transform:none}100%{opacity:0}}
  .tb-modal{position:fixed;inset:0;z-index:70;background:rgba(29,27,46,.35);display:none;align-items:center;justify-content:center;padding:16px}
  .tb-modal.show{display:flex}.tb-modal .tb-panel{max-width:520px;max-height:90vh;overflow:auto;animation:tbpop .3s}
  #fxcanvas{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:65}
  #tmsg{display:none}
  @media (max-width:640px){ .tb-top{flex-wrap:wrap;gap:6px;padding:6px 8px} .tb-top h1{font-size:16px;white-space:normal;flex:1 1 100%;order:5;text-align:center} .tb-top .sp{display:none} .tb-top .tbtn{font-size:13px;padding:6px 9px} .tb-top .code{display:none} }
  /* ===== giao diện quý tộc (đỏ rượu + vàng) cho sảnh, phòng chờ, hộp thoại ===== */
  .tb-panel{background:radial-gradient(ellipse at 50% 0,rgba(255,230,160,.12),transparent 60%),linear-gradient(180deg,#4a1426,#250812)!important;border:1.5px solid #c9a24e!important;color:#f6ead0!important;box-shadow:0 0 0 1px #5e1730,0 20px 50px rgba(0,0,0,.55)!important;font-family:"Times New Roman",serif}
  .tb-panel::before{display:none!important}
  .tb-panel h2{color:#ffe08a!important;letter-spacing:.03em}
  .tb-panel .sub,.tb-panel label,.tb-panel .mute{color:#e9d9b0!important}
  .tb-panel label{font-weight:bold;font-size:14px;margin-top:14px}
  .tb-panel input,.tb-panel select{background:#140609!important;color:#fff!important;border:1px solid #c9a24e!important}
  .tb-panel .tbtn{background:linear-gradient(180deg,#6b1a33,#3a0d1c)!important;color:#f6e3a6!important;border:1px solid #c9a24e!important}
  .tb-panel .tbtn.pri{background:linear-gradient(180deg,#22c55e,#0f7a43)!important;color:#fff!important;border-color:#bbf7d0!important;box-shadow:0 4px 12px rgba(16,122,67,.45)!important}
  .tb-panel .tbtn.sm{padding:4px 9px;font-size:12.5px;border-radius:8px}
  .tb-code{background:linear-gradient(180deg,#fffbe6,#f6d77a 55%,#c99626)!important;-webkit-background-clip:text!important;background-clip:text!important}
  .tb-link{background:rgba(0,0,0,.3)!important;border-color:rgba(201,162,78,.5)!important;color:#e9d9b0!important}
  .tb-screen:has(.tb-lobby) .tb-panel{max-width:560px}
  #tb-code{color:#e9d9b0!important}#tb-code b{color:#ffe08a!important;letter-spacing:.08em}
  .tb-people2{display:flex;flex-direction:column;gap:6px;margin-top:6px}
  .tb-pc{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:12px;background:rgba(0,0,0,.25);border:1px solid rgba(201,162,78,.35);animation:tbpop .4s}
  .tb-pc.me{border-color:#e9c46a;box-shadow:0 0 10px rgba(233,196,106,.35)}
  .tb-pc .av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;flex:0 0 auto;border:1.5px solid #c9a24e;overflow:hidden}
  .tb-pc .av.em{background:#140609;font-size:19px}.tb-pc .av img{width:100%;height:100%;object-fit:cover}
  .tb-pc .nm{flex:1;min-width:0;display:flex;flex-direction:column}.tb-pc .nm b{color:#fff3cf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tb-pc .nm i{font-size:11.5px;color:#ffe08a}
  .tb-pc .ac{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}
  .tb-pc .tag{font-size:12px;padding:3px 8px;border-radius:8px;background:rgba(255,255,255,.08);color:#e9d9b0;white-space:nowrap}.tb-pc .tag.me{background:linear-gradient(180deg,#ffe48a,#c99626);color:#3a2410;font-weight:bold}.tb-pc .tag.fr{color:#86efac}
  .tb-inv{max-height:200px;overflow:auto;border-radius:12px;background:rgba(0,0,0,.2);border:1px solid rgba(201,162,78,.3);padding:4px 8px}
  .tb-lchat{border-radius:12px;background:rgba(0,0,0,.25);border:1px solid rgba(201,162,78,.35);overflow:hidden}
  .tb-lchat .ls{height:150px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:5px}
  .tb-lchat .cm{align-self:flex-start;max-width:85%;padding:5px 10px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(201,162,78,.3);color:#f6ead0;font-size:14px}
  .tb-lchat .cm b{color:#ffe08a;margin-right:5px}.tb-lchat .cm.me{align-self:flex-end;background:linear-gradient(180deg,#7a1f3d,#4a0f24);border-color:#e9c46a}
  .tb-lchat .qk{display:flex;flex-wrap:wrap;gap:4px;padding:0 8px 6px}.tb-lchat .qk button{border:1px solid rgba(201,162,78,.5);background:rgba(0,0,0,.3);color:#f6e3a6;border-radius:12px;padding:2px 9px;cursor:pointer;font:13px "Times New Roman",serif}
  .tb-lchat form{display:flex;gap:6px;padding:6px 8px;border-top:1px solid rgba(201,162,78,.35)}.tb-lchat input{margin:0!important}
  @media (max-width:520px){ .tb-pc{flex-wrap:wrap}.tb-pc .ac{flex:1 1 100%;justify-content:flex-start;padding-left:43px} .tb-code{font-size:36px} }
  
  `;
  function shell(){
    const st=document.createElement('style'); st.textContent=CSS+(CFG.css||''); document.head.appendChild(st);
    document.body.insertAdjacentHTML('afterbegin',`<div class="tb-bg"><i></i><i></i><i></i><i></i></div>
    <header class="tb-top"><a class="tbtn home" href="../../index.html" title="Quay về danh sách các trò chơi">Menu trò chơi</a><h1>${esc(CFG.title)}</h1><span class="sp"></span>
      <span class="code" id="tb-code"></span><button class="tbtn" id="tb-chatbtn" style="display:none">Trò chuyện<span class="bd" id="tb-unread" style="display:none"></span></button>
      <button class="tbtn" id="tb-sound">Âm thanh: bật</button><button class="tbtn" id="tb-rules">Luật chơi</button><button class="tbtn" id="tb-leave" style="display:none">Rời phòng</button></header>
    <div class="tb-wrap"><div id="tb-screen" class="tb-screen"><div class="tb-panel" id="tb-box"></div></div><div id="tb-game"></div></div>
    <div class="tb-chat" id="tb-chat"><div class="hd">Trò chuyện trong phòng <button class="tbtn" id="tb-chatx" style="padding:2px 8px">Đóng</button></div><div class="ls" id="tb-chatls"></div>
      <div class="qk">${(CFG.quick||['Hay quá!','Nhanh lên!','GG','Haha','Đỉnh!','Tiếc quá']).map(q=>`<button data-q="${q}">${q}</button>`).join('')}</div>
      <form id="tb-chatf" autocomplete="off"><input maxlength="80" placeholder="Nhắn cho cả phòng…"><button class="tbtn pri" type="submit">Gửi</button></form></div>
    <div class="tb-toast" id="tb-toast"></div><div class="tb-modal" id="tb-modal"><div class="tb-panel" id="tb-mbox"></div></div><canvas id="fxcanvas"></canvas><div id="tmsg"></div>`);
    try{ FX.setup(); }catch(e){}
    $('#tb-sound').onclick=()=>{ SFX.init(); SFX.on=!SFX.on; $('#tb-sound').textContent='Âm thanh: '+(SFX.on?'bật':'tắt'); };
    $('#tb-rules').onclick=()=>modal('Luật chơi', CFG.rules, [{t:'Đã hiểu',pri:1}]);
    $('#tb-leave').onclick=askLeave;
    $('#tb-chatbtn').onclick=()=>{ $('#tb-chat').classList.toggle('show'); unread=0; renderChat(); };
    $('#tb-chatx').onclick=()=>$('#tb-chat').classList.remove('show');
    $('#tb-chatf').onsubmit=e=>{ e.preventDefault(); const i=$('#tb-chatf input'); if(chatSend(i.value)) i.value=''; };
    $$('.tb-chat .qk button').forEach(b=>b.onclick=()=>chatSend(b.dataset.q));
    document.addEventListener('pointerdown',()=>SFX.init());
  }
  function toast(msg, big){ const d=document.createElement('div'); if(big) d.className='big'; d.innerHTML=msg; $('#tb-toast').appendChild(d); setTimeout(()=>d.remove(),3000); }
  function modal(title, html, btns){
    $('#tb-mbox').innerHTML=`<h2>${title}</h2><div style="line-height:1.5;margin:10px 0">${html}</div><div class="tb-grid"></div>`;
    const g=$('#tb-mbox .tb-grid'); (btns||[]).forEach(b=>{ const e=document.createElement('button'); e.className='tbtn'+(b.pri?' pri':''); e.textContent=b.t; e.onclick=()=>{ closeModal(); b.f&&b.f(); }; g.appendChild(e); });
    $('#tb-modal').classList.add('show');
  }
  function closeModal(){ $('#tb-modal').classList.remove('show'); }
  const inLobby=()=>ROOM&&!document.body.classList.contains('ingame')&&(MODE==='host'?LOBBY:!S)&&document.querySelector('#tb-box .tb-lobby');
  window.addEventListener('pbg-rel',()=>{ if(inLobby()) lobby(); });
  function acct(){ const P=window.PBG; return P&&P.user?{uid:P.user.uid, av:(P.prof&&P.prof.avatar)||null}:{uid:null,av:null}; }
  let lastAcct=''; setInterval(()=>{ const a=acct(), k=a.uid+'|'+a.av; if(k!==lastAcct){ lastAcct=k; if(ROOM) ROOM.presence(a).catch(()=>{}); if(inLobby()) lobby(); } },1500);
  function avHTML(av,name,i){ return av&&/^https?:/.test(av)?`<span class="av im"><img src="${esc(av)}" alt=""></span>`:av?`<span class="av em">${esc(av)}</span>`:avatar(name,i); }
  function box(html){ document.body.classList.remove('ingame'); $('#tb-box').innerHTML=html; }
  function avatar(name,i){ return `<span class="av" style="background:${COLORS[i%COLORS.length]}">${esc((name||'?').charAt(0).toUpperCase())}</span>`; }

  /* ---------- Menu ---------- */
  function lastRoom(){ try{ const v=JSON.parse(ls.get(CFG.prefix+'-last')||'null'); if(v && Date.now()-v.t<6*3600e3) return v; }catch(e){} return null; }
  function saveLast(role){ ls.set(CFG.prefix+'-last', JSON.stringify({code:CODE, role, t:Date.now()})); }
  function myName(){
    const P=window.PBG;
    const accName=P&&P.user&&P.prof&&P.prof.name ? clean(P.prof.name) : '';
    if (accName){ ls.set('bg-name',accName); return accName; }
    return clean(ls.get('bg-name'))||'';
  }
  function menu(){
    MODE='local'; S=null; document.body.classList.remove('online'); setTop();
    const lr=lastRoom(); const bots=CFG.botOptions||[1,2,3];
    box(`<h2>${esc(CFG.title)}</h2><p class="sub">${esc(CFG.tagline||'')}</p>
      <label>Tên của bạn</label><input id="m-name" maxlength="16" value="${esc(myName())}" placeholder="Nhập tên hoặc để trống tự đặt">
      <label>Số máy chơi cùng (khi chơi với máy)</label><select id="m-bots">${bots.map(n=>`<option value="${n}" ${n===(CFG.defaultBots||bots[Math.min(1,bots.length-1)])?'selected':''}>${n} máy</option>`).join('')}</select>${CFG.difficulty?`<label>Độ khó của máy</label><select id="m-diff">${[['easy','Dễ — chơi bừa, không để ý quý tộc'],['med','Trung bình — như người mới chơi'],['hard','Khó — máy chơi giỏi']].map(([v,t])=>`<option value="${v}" ${(ls.get('bg-diff')||'med')===v?'selected':''}>${t}</option>`).join('')}</select>`:''}
      <div class="tb-grid"><button class="tbtn pri full" id="m-local">▶ Chơi ngay với máy</button>
        <div class="tb-or">Chơi online cùng bạn bè</div>
        <button class="tbtn" id="m-create">Tạo phòng</button><button class="tbtn" id="m-join">Vào phòng bằng mã</button>
        ${lr?`<button class="tbtn pri full" id="m-resume">Vào lại phòng ${esc(lr.code)}</button>`:''}</div>`);
    const nm=()=>{
      let v=clean($('#m-name').value) || myName();
      if(!v) v='Khách'+Math.floor(100+Math.random()*900);
      $('#m-name').value=v;
      ls.set('bg-name',v);
      return v;
    };
    $('#m-local').onclick=()=>{ if(!nm()) return; if($('#m-diff')) ls.set('bg-diff',$('#m-diff').value); SFX.init(); const n=+$('#m-bots').value; startGame([{name:myName(),pid:PID}].concat(Array.from({length:n},(_,i)=>({name:(CFG.botNames||['Máy An','Máy Bình','Máy Chi','Máy Dũng','Máy Én'])[i],bot:true}))), 'local'); };
    $('#m-create').onclick=()=>{ if(nm()) createRoom(); };
    $('#m-join').onclick=()=>{ if(nm()) askJoin(''); };
    if (lr) $('#m-resume').onclick=()=>{ if(!nm()) return; lr.role==='host' ? createRoom(lr.code) : joinRoom(lr.code); };
  }
  function askJoin(pre, watch=false){
    box(`<h2>${watch?'Xem phòng':'Vào phòng'}</h2><p class="sub">${watch?'Nhập tên hiển thị và mã phòng muốn theo dõi':'Nhập tên và mã phòng bạn bè gửi'}</p><label>Tên của bạn</label><input id="j-name" maxlength="16" value="${esc(myName())}">
      <label>Mã phòng</label><input id="j-code" maxlength="6" value="${esc(pre)}" style="letter-spacing:.3em;text-transform:uppercase;font-size:20px">
      <div class="tb-grid"><button class="tbtn pri" id="j-go">${watch?'Vào xem':'Vào phòng'}</button><button class="tbtn" id="j-back">Quay lại</button></div>`);
    const go=()=>{ const n=clean($('#j-name').value); if(!n){ toast('Hãy nhập tên'); return; } ls.set('bg-name',n); joinRoom($('#j-code').value, watch); };
    $('#j-go').onclick=go; $('#j-back').onclick=menu; $$('#tb-box input').forEach(i=>i.onkeydown=e=>{ if(e.key==='Enter') go(); });
    setTimeout(()=>{ (pre?$('#j-name'):$('#j-code')).focus(); },50);
  }

  /* ---------- Kết nối phòng ---------- */
  async function api(){
    for(let i=0;i<20 && typeof mqtt==='undefined';i++) await new Promise(r=>setTimeout(r,250));
    if (typeof mqtt==='undefined'){ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/mqtt@5.10.1/dist/mqtt.min.js'; document.head.appendChild(s); for(let i=0;i<30 && typeof mqtt==='undefined';i++) await new Promise(r=>setTimeout(r,250)); }
    return typeof mqtt==='undefined' ? null : PeerRoom;
  }
  function genCode(){ const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<4;i++) s+=A[Math.floor(Math.random()*A.length)]; return s; }
  function fail(msg, retry){ box(`<h2>Chưa kết nối được</h2><p class="warn" style="text-align:center">${msg}</p><div class="tb-grid"><button class="tbtn pri" id="f-r">Thử lại</button><button class="tbtn" id="f-b">Về menu</button></div>`); $('#f-r').onclick=retry; $('#f-b').onclick=menu; }
  async function createRoom(fixed){
    box('<h2>Đang tạo phòng…</h2><div class="spin"></div>');
    const A=await api(); if(!A) return fail('Không tải được phần kết nối. Kiểm tra mạng rồi thử lại.', ()=>createRoom(fixed));
    const code=fixed||genCode(); let r; try{ r=await A.join(CFG.prefix+'-'+code.toLowerCase(),{host:true}); }catch(e){ return fail('Không kết nối được máy chủ phòng chơi.', ()=>createRoom(fixed)); }
    leaveQuiet(); ROOM=r; CODE=code; MODE='host'; LOBBY=true; lastAct={}; resetChat(); saveLast('host'); document.body.classList.add('online');
    r.onPeers(ch=>{ if(ROOM!==r) return; PEERS=ch.peers; const me=PEERS.find(p=>p.sameTab); if(me) MYPEER=me.peer; onHostPeers(); });
    if (fixed && savedS){ S=savedS; savedS=null; LOBBY=false; const mine=S.seats.find(p=>p.pid===PID); if(mine) mine.peer=null; setTimeout(()=>{ if(mine) mine.peer=MYPEER; ME=S.seats.indexOf(mine); commit(); },500); return; }
    r.presence(Object.assign({role:'host', name:myName(), pid:PID, lobby:true},acct())).catch(()=>{});
    lobby();
  }
  async function joinRoom(code, watch=false){
    code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,''); if(code.length<4){ toast('Mã phòng gồm 4 ký tự'); return; }
    box(`<h2>Đang vào phòng ${esc(code)}…</h2><div class="spin"></div>`);
    const A=await api(); if(!A) return fail('Không tải được phần kết nối.', ()=>joinRoom(code, watch));
    let r; try{ r=await A.join(CFG.prefix+'-'+code.toLowerCase(),{host:false}); }catch(e){ return fail('Không vào được phòng '+esc(code)+'. Kiểm tra lại mã và mạng.', ()=>joinRoom(code, watch)); }
    leaveQuiet(); ROOM=r; CODE=code; MODE=watch?'watcher':'client'; S=null; ME=-1; seq=0; resetChat(); if(!watch) saveLast('guest'); document.body.classList.add('online');
    r.onPeers(ch=>{ if(ROOM!==r) return; PEERS=ch.peers; const me=PEERS.find(p=>p.sameTab); if(me) MYPEER=me.peer; MODE==='host'?onHostPeers():onClientPeers(); });
    r.presence(Object.assign({role:watch?'viewer':'guest', name:myName(), pid:PID, act:null},acct())).catch(()=>{});
    if(!S) lobby(); setTimeout(()=>{ if((MODE==='client'||MODE==='watcher') && !hostPeer() && !S) lobby(); },5000);
  }
  function leaveQuiet(){ try{ ROOM && ROOM.leave(); }catch(e){} ROOM=null; PEERS=[]; annKey=''; }
  function askLeave(){
    modal('Rời phòng?', MODE==='host'?'Bạn là <b>chủ phòng</b>. Khi bạn rời, ván tạm dừng cho tới khi bạn bấm <b>Vào lại phòng</b> ở menu.':MODE==='watcher'?'Bạn đang xem với tư cách khán giả, rời phòng sẽ không ảnh hưởng đến người chơi.':'Ghế của bạn vẫn được giữ; vắng quá 15 giây máy sẽ đánh thay. Bấm <b>Vào lại phòng</b> ở menu để quay lại.',
      [{t:'Xác nhận rời phòng',pri:1,f:()=>{ if(MODE==='host' && S && !LOBBY) savedS=S; if(MODE!=='watcher') saveLast(MODE==='host'?'host':'guest'); leaveQuiet(); MODE='local'; S=null; menu(); }},{t:'Ở lại'}]);
  }
  function fresh(peer){ const p=peer&&PEERS.find(q=>q.peer===peer); return !!p && (p.sameTab || Date.now()-p.updatedAt<25000); }
  function hostPeer(){ return PEERS.find(p=>!p.sameTab && p.presence && p.presence.role==='host'); }
  function guests(){ return PEERS.filter(p=>!p.sameTab && p.presence && p.presence.role==='guest' && fresh(p.peer)); }
  function inviteLink(){ return location.origin+location.pathname+'#p-'+CODE; }
  function announce(){
    if (MODE!=='host' || !ROOM || !ROOM.announce) return;
    const names = (!LOBBY && S) ? S.seats.filter(p=>!p.bot && (p.peer===MYPEER || fresh(p.peer))).map(p=>p.name) : [myName(), ...guests().map(g=>clean(g.presence.name))];
    const k=[LOBBY,names.join(',')].join('|'); if(k===annKey) return; annKey=k;
    ROOM.announce({g:CFG.id, t:CFG.title, code:CODE, host:myName(), n:names.length, max:CFG.maxPlayers, open:LOBBY, names:names.slice(0,6)});
  }

  /* ---------- Phòng chờ ---------- */
  function lobby(){ try{ window.PBG&&PBG.onState&&PBG.onState({id:CFG.id,title:CFG.title,code:CODE,link:CODE?inviteLink():null,mode:MODE,S:null,ME:-1}); }catch(e){}
    setTop();
    const A0=acct(), P=window.PBG, pv=pr=>({uid:pr.uid||null,av:pr.av||null});
    const people = MODE==='host' ? [Object.assign({name:myName(),host:1,me:1},A0), ...guests().map(g=>Object.assign({name:clean(g.presence.name)},pv(g.presence)))]
      : (hostPeer()?[Object.assign({name:clean(hostPeer().presence.name),host:1},pv(hostPeer().presence))]:[]).concat(PEERS.filter(p=>p.presence&&p.presence.role==='guest'&&fresh(p.peer)).map(p=>Object.assign({name:clean(p.presence.name),me:p.sameTab},p.sameTab?A0:pv(p.presence))));
    const relBtn=p=>{ if(p.me) return '<span class="tag me">Bạn</span>'; if(!p.uid) return '<span class="tag">Khách</span>'; if(!P||!P.user) return `<button class="tbtn sm" data-plogin>Đăng nhập để kết bạn</button>`;
      const r=P.rel(p.uid); return (r==='friend'?'<span class="tag fr">Bạn bè</span>':r==='outgoing'?'<span class="tag">Đã gửi</span>':r==='incoming'?`<button class="tbtn sm pri" data-pacc="${esc(p.uid)}">Đồng ý kết bạn</button>`:`<button class="tbtn sm" data-padd="${esc(p.uid)}" data-pn="${esc(p.name)}" data-pa="${esc(p.av||'')}">+ Kết bạn</button>`)+`<button class="tbtn sm" data-pprof="${esc(p.uid)}" data-pn="${esc(p.name)}" data-pa="${esc(p.av||'')}">Hồ sơ</button>`; };
    const ppl=people.map((p,i)=>`<div class="tb-pc ${p.me?'me':''}">${avHTML(p.av,p.name,i)}<div class="nm"><b>${esc(p.name)}</b>${p.host?'<i>Chủ phòng</i>':''}</div><div class="ac">${relBtn(p)}</div></div>`).join('');
    const ci=$('#l-chatf input'), cv=ci?ci.value:'', cf=ci&&document.activeElement===ci;
    const chatBlock=`<label>Trò chuyện trong phòng</label><div class="tb-lchat"><div class="ls" id="l-chatls"></div><div class="qk">${['Chào cả nhà!','Sẵn sàng!','Chờ chút nhé','Vào nhanh nào'].map(q=>`<button data-q="${q}">${q}</button>`).join('')}</div><form id="l-chatf" autocomplete="off"><input maxlength="80" placeholder="Nhắn cho cả phòng…"><button class="tbtn pri" type="submit">Gửi</button></form></div>`;
    const inviteBlock=`<label>Mời bạn bè vào phòng</label><div class="tb-inv" id="l-inv"></div>`;
    if (MODE==='host'){
      const free=Math.max(0, CFG.maxPlayers-people.length), def=people.length>=CFG.minPlayers?0:Math.min(free,Math.max(1,CFG.minPlayers-people.length));
      const prev=$('#l-bots')?+$('#l-bots').value:null;
      box(`<div class="tb-lobby"><h2>Phòng chơi</h2><div class="tb-code">${esc(CODE)}</div><p class="sub">Gửi mã phòng hoặc đường dẫn cho bạn bè — họ nhập tên là vào được</p>
        <div class="tb-link">${esc(inviteLink())}</div>
        <label>Người trong phòng (${people.length}/${CFG.maxPlayers})</label><div class="tb-people2">${ppl}</div>
        <label>Thêm máy chơi cùng</label><select id="l-bots">${Array.from({length:free+1},(_,n)=>`<option value="${n}" ${n===(prev!=null&&prev<=free?prev:def)?'selected':''}>${n} máy</option>`).join('')}</select>${CFG.difficulty?`<label>Độ khó của máy</label><select id="l-diff">${[['easy','Dễ — chơi bừa, không để ý quý tộc'],['med','Trung bình — như người mới chơi'],['hard','Khó — máy chơi giỏi']].map(([v,t])=>`<option value="${v}" ${(ls.get('bg-diff')||'med')===v?'selected':''}>${t}</option>`).join('')}</select>`:''}
        <div class="tb-grid"><button class="tbtn" id="l-copy">Sao chép lời mời</button><button class="tbtn pri" id="l-start">Bắt đầu ván</button><button class="tbtn full" id="l-leave">Rời phòng</button></div>${inviteBlock}${chatBlock}</div>`); lobbyBind(cv,cf);
      $('#l-copy').onclick=()=>{ const t=`Vào chơi "${CFG.title}" với mình nhé! Bấm link, nhập tên là vào: ${inviteLink()} (mã phòng ${CODE})`; try{ navigator.clipboard.writeText(t).then(()=>toast('Đã sao chép lời mời'),()=>toast('Mã phòng: '+CODE)); }catch(e){ toast('Mã phòng: '+CODE); } };
      $('#l-start').onclick=hostStart; $('#l-leave').onclick=askLeave;
    } else {
      box(`<div class="tb-lobby"></div><h2>Phòng ${esc(CODE)}</h2>${hostPeer()?`<p class="sub">Đã vào phòng của <b>${esc(clean(hostPeer().presence.name))}</b>. Chờ chủ phòng bắt đầu…</p><div class="spin"></div>`:'<p class="warn" style="text-align:center">Chưa thấy chủ phòng. Kiểm tra lại mã phòng hoặc chờ chủ phòng mở lại.</p>'}
        <label>Người trong phòng</label><div class="tb-people2">${ppl}</div>${inviteBlock}${chatBlock}<div class="tb-grid"><button class="tbtn full" id="l-leave">Rời phòng</button></div>`);
      $('#tb-box').firstElementChild&&$('#tb-box').classList.add('lob'); lobbyBind(cv,cf); $('#l-leave').onclick=askLeave;
    }
  }
  function lobbyBind(cv,cf){ const P=window.PBG, b=$('#tb-box');
    b.querySelectorAll('[data-padd]').forEach(x=>x.onclick=()=>{ P&&P.addFriend(x.dataset.padd,{name:x.dataset.pn,av:x.dataset.pa}); x.disabled=true; x.textContent='Đã gửi'; });
    b.querySelectorAll('[data-pacc]').forEach(x=>x.onclick=()=>{ P&&P.acceptFriend(x.dataset.pacc); x.disabled=true; });
    b.querySelectorAll('[data-pprof]').forEach(x=>x.onclick=()=>P&&P.profile(x.dataset.pprof,{name:x.dataset.pn,av:x.dataset.pa}));
    b.querySelectorAll('[data-plogin]').forEach(x=>x.onclick=()=>P&&P.login());
    const inv=$('#l-inv'); if(inv){ if(P&&P.renderInvite) P.renderInvite(inv); else inv.innerHTML='<div class="mute">Đang tải…</div>'; }
    renderChat(); const f=$('#l-chatf'); if(f){ const i=f.querySelector('input'); if(cv) i.value=cv; if(cf) i.focus({preventScroll:true}); f.onsubmit=e=>{ e.preventDefault(); const v=i.value; i.value=''; if(!chatSend(v)) i.value=v; else { const n=$('#l-chatf input'); if(n){ n.value=''; n.focus({preventScroll:true}); } } }; }
    b.querySelectorAll('.tb-lchat .qk button').forEach(x=>x.onclick=()=>chatSend(x.dataset.q)); }
  function hostStart(){ if($('#l-diff')) ls.set('bg-diff',$('#l-diff').value);
    const gs=guests().slice(0, CFG.maxPlayers-1);
    const seats=[{name:myName(),pid:PID,peer:MYPEER}, ...gs.map(g=>({name:clean(g.presence.name), peer:g.peer, pid:String(g.presence.pid||'').slice(0,20)}))];
    const nb=Math.min(+($('#l-bots')||{value:0}).value, CFG.maxPlayers-seats.length); for(let i=0;i<nb;i++) seats.push({name:(CFG.botNames||['Máy An','Máy Bình','Máy Chi','Máy Dũng','Máy Én'])[i], bot:true});
    if (seats.length<CFG.minPlayers){ toast(`Cần ít nhất ${CFG.minPlayers} người — chờ bạn bè hoặc thêm máy`); return; }
    gs.forEach(g=>lastAct[g.peer]=(g.presence.act&&g.presence.act.n)||0);
    LOBBY=false; startGame(seats,'host');
  }

  /* ---------- Ván chơi ---------- */

  /* ===== Tung xúc xắc chọn thứ tự đi (bật bằng CFG.diceOrder) ===== */
  const DICE_MS=5200; let diceShown='';
  function rollOrder(n){ const R=[...Array(n)].map(()=>[]); const d=()=>1+Math.floor(Math.random()*6);
    const sum=i=>R[i].map(r=>r[0]+r[1]); const cmp=(a,b)=>{ const A=sum(a),B=sum(b); for(let k=0;k<Math.max(A.length,B.length);k++){ const x=A[k]||0,y=B[k]||0; if(x!==y) return y-x; } return 0; };
    let grp=[[...Array(n).keys()]];
    for(let guard=0;guard<20;guard++){ let again=false; const next=[];
      grp.forEach(g=>{ if(g.length<2){ next.push(g); return; } g.forEach(i=>R[i].push([d(),d()])); g.sort(cmp);
        let k=0; while(k<g.length){ let j=k+1; while(j<g.length && cmp(g[k],g[j])===0) j++; const sub=g.slice(k,j); next.push(sub); if(sub.length>1) again=true; k=j; } });
      grp=next; if(!again) break; }
    return {order:grp.flat(), rolls:R}; }
  function newGameDice(seats, t, prev){
    if (!CFG.diceOrder) return CFG.newGame(seats, t, prev);
    const R=rollOrder(seats.length); const ordered=R.order.map(i=>seats[i]);
    const S=CFG.newGame(ordered, t, prev);
    if (typeof S.turn==='number') S.turn=0; if ('first' in S) S.first=0;
    if (Array.isArray(S.log) && typeof S.log[0]==='string' && /đi trước/.test(S.log[0])) S.log[0]=S.log[0].replace(/—\s*[^—]*đi trước\./,'— '+ordered[0].name+' đi trước.');
    S.ordDice={id:t+'-'+Math.random().toString(36).slice(2,7), rows:R.order.map(i=>({name:seats[i].name, color:seats[i].color||'', r:R.rolls[i]}))};
    S.diceUntil=t+DICE_MS; if (typeof S.turnAt==='number') S.turnAt=t+DICE_MS;
    if (Array.isArray(S.log)) S.log.unshift('🎲 Tung xúc xắc chọn lượt: '+S.ordDice.rows.map((x,k)=>(k+1)+'. '+x.name+' ('+x.r.map(a=>a[0]+a[1]).join('→')+')').join(', ')+'.');
    return S; }
  function dieSVG(v,cls){ const P={1:[[50,50]],2:[[28,28],[72,72]],3:[[26,26],[50,50],[74,74]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[26,26],[74,26],[50,50],[26,74],[74,74]],6:[[28,24],[72,24],[28,50],[72,50],[28,76],[72,76]]}[v];
    return `<svg viewBox="0 0 100 100" class="${cls||''}"><rect x="5" y="5" width="90" height="90" rx="20" fill="#fffdf6" stroke="#3a2412" stroke-width="5"/><rect x="11" y="11" width="78" height="30" rx="14" fill="#fff" opacity=".7"/>${P.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="${v===1?'#c62828':'#2b1a0c'}"/>`).join('')}</svg>`; }
  function showDice(S){
    if (!S||!S.ordDice||diceShown===S.ordDice.id) return; diceShown=S.ordDice.id;
    const left=(S.diceUntil||0)-now(); if (left<800) return;
    if (!document.getElementById('dice-css')){ const st=document.createElement('style'); st.id='dice-css'; st.textContent=`
#dice-ov{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;background:rgba(10,6,2,.72);backdrop-filter:blur(3px);animation:dov .3s both;padding:12px}
@keyframes dov{from{opacity:0}}
#dice-ov .dbox{width:min(480px,100%);max-height:100%;overflow:auto;background:linear-gradient(180deg,#fff7e2,#f1dfb4);border:3px solid #6b4220;border-radius:20px;box-shadow:0 0 0 4px #e8c06a,0 20px 50px rgba(0,0,0,.6);padding:16px 16px 12px;font-family:"Times New Roman",serif;color:#2b1a0c;text-align:center}
#dice-ov h3{margin:0 0 10px;font-size:22px;color:#7a1f10}
#dice-ov .drow{display:flex;align-items:center;gap:10px;padding:7px 10px;margin:6px 0;border-radius:12px;background:#fffdf5;border:1.5px solid #d8b878;transition:transform .45s,background .3s}
#dice-ov .drow .rk{flex:none;width:30px;height:30px;border-radius:50%;background:#bfa678;color:#fff;font-weight:bold;display:flex;align-items:center;justify-content:center;font-size:16px;opacity:0;transform:scale(.3);transition:.35s}
#dice-ov.done .drow .rk{opacity:1;transform:none}
#dice-ov.done .drow.r1{background:#fff2b8;border-color:#e0a62c}#dice-ov.done .drow.r1 .rk{background:#d48a0a}
#dice-ov .drow .nm{flex:1;text-align:left;font-weight:bold;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dice-ov .drow .nm i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;vertical-align:-1px;border:1px solid rgba(0,0,0,.35)}
#dice-ov .dd{display:flex;gap:4px;align-items:center}
#dice-ov .dd svg{width:34px;height:34px}
#dice-ov .rolling .dd svg{animation:dshake .18s infinite alternate}
@keyframes dshake{from{transform:rotate(-14deg) translateY(-2px)}to{transform:rotate(14deg) translateY(2px)}}
#dice-ov .sm{font-weight:bold;min-width:30px;font-size:20px;color:#7a1f10;text-align:right}
#dice-ov .tie{display:block;font-size:11px;line-height:1.1;color:#8a5a2b;font-style:italic;font-weight:normal}
#dice-ov .lbl{font-size:13px;color:#8a5a2b;opacity:0;transition:.3s}
#dice-ov.done .lbl{opacity:1}
#dice-ov .go{margin-top:8px;padding:8px 22px;border-radius:999px;border:2px solid #6b4220;background:linear-gradient(180deg,#ffe9a8,#e0a645);font:bold 16px "Times New Roman",serif;color:#3a1a08;cursor:pointer}
@media (max-height:500px){#dice-ov .dbox{padding:10px}#dice-ov h3{font-size:18px;margin-bottom:4px}#dice-ov .drow{padding:4px 8px;margin:4px 0}#dice-ov .dd svg{width:26px;height:26px}}
`; document.head.appendChild(st); }
    const old=document.getElementById('dice-ov'); if(old) old.remove();
    const rows=S.ordDice.rows; const n=rows.length;
    const shuf=[...Array(n).keys()].sort(()=>Math.random()-.5); // hiện lúc tung theo thứ tự lộn xộn
    const ov=document.createElement('div'); ov.id='dice-ov';
    ov.innerHTML=`<div class="dbox"><h3>🎲 Tung xúc xắc chọn lượt đi</h3><div class="dlist" style="position:relative"></div><div class="lbl">Ai tổng cao nhất đi trước. Bằng điểm thì tung lại.</div><button class="go">Bắt đầu chơi</button></div>`;
    document.body.appendChild(ov);
    const list=ov.querySelector('.dlist');
    rows.forEach((x,k)=>{ const el=document.createElement('div'); el.className='drow rolling'; el.dataset.k=k;
      el.innerHTML=`<span class="rk">${k+1}</span><span class="nm">${esc(x.name)}</span><span class="dd">${dieSVG(1)}${dieSVG(1)}</span><span class="sm">?</span>`;
      list.appendChild(el); });
    const els=[...list.children]; const H=els[0]?els[0].getBoundingClientRect().height+12:52;
    els.forEach((el,k)=>{ el.style.transform=`translateY(${(shuf.indexOf(k)-k)*H}px)`; });
    try{ SFX&&SFX.init&&SFX.init(); }catch(e){}
    let tk=0; const spin=setInterval(()=>{ tk++; els.forEach(el=>{ if(!el.classList.contains('rolling')) return; el.querySelector('.dd').innerHTML=dieSVG(1+Math.floor(Math.random()*6))+dieSVG(1+Math.floor(Math.random()*6)); }); },110);
    els.forEach((el,k)=>{ setTimeout(()=>{ const r=rows[k].r, last=r[r.length-1]; el.classList.remove('rolling'); el.querySelector('.dd').innerHTML=dieSVG(last[0])+dieSVG(last[1]);
      el.querySelector('.sm').innerHTML=r.length>1?`<span class="tie">${r.slice(0,-1).map(a=>a[0]+a[1]).join(' → ')} hòa, tung lại →</span> ${last[0]+last[1]}`:(last[0]+last[1]); }, 900+shuf.indexOf(k)*280); });
    const tDone=900+n*280+250;
    setTimeout(()=>{ clearInterval(spin); els.forEach(el=>{ el.style.transform='translateY(0)'; }); els[0]&&els[0].classList.add('r1');
      els.forEach((el,k)=>{ el.querySelector('.rk').textContent=k+1; el.querySelector('.nm').insertAdjacentHTML('beforeend',` <small style="font-weight:normal;color:#8a5a2b">— đi thứ ${k+1}</small>`); });
      ov.classList.add('done'); }, tDone);
    const close=()=>{ clearInterval(spin); ov.style.transition='opacity .3s'; ov.style.opacity='0'; setTimeout(()=>ov.remove(),300); };
    ov.querySelector('.go').onclick=close; setTimeout(close, Math.max(tDone+1800, left-200));
  }
  function startGame(seats, mode){
    if (CFG.shuffleSeats!==false){ for(let i=seats.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [seats[i],seats[j]]=[seats[j],seats[i]]; } }
    const DL=ls.get('bg-diff')||'med'; seats.forEach(s=>{ if(s.bot&&!s.lvl) s.lvl=DL; });
    MODE=mode; S=newGameDice(seats.map((s,i)=>Object.assign({color:COLORS[i%COLORS.length]},s)), now()); S.v=1; ME=Math.max(0,S.seats.findIndex(p=>!p.bot&&p.pid===PID)); if(S.seats[ME]&&S.seats[ME].bot) ME=S.seats.findIndex(p=>!p.bot);
    if (!CFG.diceOrder && S.seats&&S.seats[0]&&S.seats[0].name&&S.log&&Array.isArray(S.log)) S.log.unshift('Bốc thăm thứ tự: '+S.seats.map(p=>p.name).join(' → ')+'. '+S.seats[S.turn>=0?S.turn:0].name+' đi trước.');
    document.body.classList.add('ingame'); setTop(); commit(); CFG.onStart && CFG.onStart();
  }
  function commit(){ S.v=(S.v||0)+1; if (MODE==='host'){ ROOM.presence(Object.assign({role:'host', name:myName(), pid:PID, lobby:false, st:S, now:Date.now()},acct())).catch(()=>{}); announce(); } draw(); }
  function draw(){ if(!S) return; document.body.classList.add('ingame'); setTop(); CFG.render(S, ME, API); try{ showDice(S); }catch(e){} try{ window.PBG&&PBG.onState&&PBG.onState({id:CFG.id,title:CFG.title,code:CODE,link:CODE?inviteLink():null,mode:MODE,S,ME}); }catch(e){} }
  function act(a){
    SFX.init(); if (!S) return false;
    if (MODE==='watcher'){ toast('Bạn đang ở chế độ xem, không thể thực hiện lượt chơi'); return false; }
    if (MODE==='client'){ if (waiting) return false; seq++; waiting=true; ROOM.presence({act:Object.assign({},a,{n:seq})}).catch(()=>{ waiting=false; }); setTimeout(()=>{ waiting=false; },4000); return true; }
    const ok=CFG.apply(S, ME, a, now()); if (ok) commit(); else SFX.error(); return ok;
  }
  function onHostPeers(){
    chatIngest(); announce();
    if (LOBBY){ lobby(); return; }
    if (!S) return; let ch=false, ack=false;
    guests().forEach(g=>{ first[g.peer]=first[g.peer]||Date.now(); });
    guests().forEach(g=>{ if (S.seats.some(p=>p.peer===g.peer)) return; const pr=g.presence;
      let i=S.seats.findIndex(p=>!p.bot && p.pid && p.pid===pr.pid && p.peer!==MYPEER && (!fresh(p.peer) || (first[g.peer]||0)>(first[p.peer]||0)));
      if (i<0) i=S.seats.findIndex(p=>!p.bot && p.peer!==MYPEER && !fresh(p.peer) && p.name===clean(pr.name));
      if (i>=0){ S.seats[i].peer=g.peer; lastAct[g.peer]=(pr.act&&pr.act.n)||0; toast(esc(S.seats[i].name)+' đã vào lại phòng'); ch=true; } });
    guests().forEach(g=>{ const a=g.presence.act; if(!a||typeof a.n!=='number'||a.n<=(lastAct[g.peer]||0)) return; lastAct[g.peer]=a.n;
      const seat=S.seats.findIndex(p=>p.peer===g.peer); if(seat>=0){ if(CFG.apply(S, seat, a, now())) ch=true; else ack=true; } });
    if (ch||ack) commit(); else draw();
  }
  function onClientPeers(){
    chatIngest(); const h=hostPeer();
    if (!h){ if(!S) lobby(); return; }
    const st=h.presence.st;
    if (st && !h.presence.lobby){
      if (!S || st.v!==S.v){ OFFSET=(+h.presence.now||Date.now())-Date.now(); OFFSET=0; S=st; waiting=false; ME=S.seats.findIndex(p=>p.peer===MYPEER); draw(); }
    } else { S=null; lobby(); }
  }
  /* Máy đánh thay, hết giờ, nhịp game */
  setInterval(()=>{
    if (!S || MODE==='client' || MODE==='watcher') { if(S) CFG.render && CFG.tickView && CFG.tickView(S,ME,API); return; }
    let ch=false; const t=now();
    if (S.diceUntil && t<S.diceUntil){ CFG.tickView && CFG.tickView(S,ME,API); return; }
    if (CFG.tick && CFG.tick(S,t)) ch=true;
    const who=CFG.whoActs(S)||[];
    for (const seat of who){ const p=S.seats[seat]; if(!p) continue;
      const away = MODE==='host' && !p.bot && p.peer!==MYPEER && (!p.peer || !fresh(p.peer));
      if ((p.bot || away) && t-lastBot>(CFG.botDelay||900)){ const a=CFG.botAction(S,seat,t); if(a && CFG.apply(S,seat,a,t)){ ch=true; lastBot=t; break; } }
      else if (CFG.turnLimit && S.turnAt && t-S.turnAt>CFG.turnLimit*1000 && CFG.timeoutAction){ const a=CFG.timeoutAction(S,seat,t); if(a && CFG.apply(S,seat,a,t)){ ch=true; toast(esc(p.name)+' hết giờ — tự động đi'); break; } }
    }
    if (ch) commit(); else CFG.tickView && CFG.tickView(S,ME,API);
  }, 400);

  /* ---------- Trò chuyện ---------- */
  function resetChat(){ chatMine=[]; chatSeen=new Set(); chatList=[]; chatPrimed=false; unread=0; renderChat(); }
  function chatSend(t){ t=String(t||'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,80); if(!t) return false; if(!ROOM){ chatList.push({me:true,name:'Bạn',x:t,t:Date.now()}); chatList=chatList.slice(-60); renderChat(); return true; } chatMine.push({i:Date.now(),x:t}); chatMine=chatMine.slice(-3); ROOM.presence({chat:chatMine}).catch(()=>{}); return true; }
  function chatIngest(){ let fresh=0;
    PEERS.forEach(pe=>{ const arr=pe.presence&&pe.presence.chat; if(!Array.isArray(arr)) return; arr.slice(-3).forEach(m=>{ if(!m||typeof m.x!=='string') return; const k=pe.peer+':'+m.i; if(chatSeen.has(k)) return; chatSeen.add(k);
      chatList.push({me:pe.sameTab, name:clean(pe.presence.name), x:String(m.x).slice(0,80), t:+m.i||Date.now()}); if(!pe.sameTab && chatPrimed){ fresh++; if(!$('#tb-chat').classList.contains('show')) unread++; toast(`<b>${esc(clean(pe.presence.name))}:</b> ${esc(String(m.x).slice(0,80))}`); } }); });
    chatPrimed=true; if(fresh) SFX.chatPing(); chatList.sort((a,b)=>a.t-b.t); chatList=chatList.slice(-60); renderChat(); }
  function renderChat(){ const l2=$('#l-chatls'); if(l2){ l2.innerHTML=chatList.map(m=>`<div class="cm ${m.me?'me':''}"><b>${esc(m.me?'Bạn':m.name)}</b>${esc(m.x)}</div>`).join('')||'<div class="mute" style="text-align:center;margin:auto">Chưa có tin nhắn — chào mọi người đi!</div>'; l2.scrollTop=l2.scrollHeight; } const ls=$('#tb-chatls'); if(!ls) return; ls.innerHTML=chatList.map(m=>`<div class="cm ${m.me?'me':''}"><b>${esc(m.me?'Bạn':m.name)}</b>${esc(m.x)}</div>`).join('')||'<div style="color:#8b889c;text-align:center;margin:auto">Chưa có tin nhắn</div>'; ls.scrollTop=ls.scrollHeight;
    const u=$('#tb-unread'); u.style.display=unread?'':'none'; u.textContent=unread; }
  function setTop(){ const on=MODE!=='local'; $('#tb-chatbtn').style.display=on?'':'none'; $('#tb-leave').style.display=on?'':'none'; $('#tb-code').innerHTML=on&&CODE?`Phòng <b>${esc(CODE)}</b>${MODE==='watcher'?' · Đang xem':''}`:''; if(!on) $('#tb-chat').classList.remove('show'); }

  const API={ act, now, toast, modal, esc, avatar, me:()=>ME, mode:()=>MODE, isMine:seat=>seat===ME, menu, rematch:()=>{ if(MODE==='watcher') return toast('Khán giả không thể yêu cầu chơi lại'); if(MODE==='client') return toast('Chờ chủ phòng bắt đầu ván mới'); const pidMe=S.seats[ME]&&S.seats[ME].pid; S=newGameDice(S.seats, now(), S); if(pidMe){ const k=S.seats.findIndex(p=>!p.bot&&p.pid===pidMe); if(k>=0) ME=k; } commit(); } };
  /* Chủ phòng thoát giữa ván: một người chơi còn lại được chọn ngẫu nhiên (giống nhau trên mọi máy) làm chủ phòng mới */
  let goneSince=0;
  function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
  function becomeHost(){ const mine=S.seats.find(p=>p.pid===PID); MODE='host'; LOBBY=false; lastAct={}; goneSince=0; saveLast('host');
    S.seats.forEach(p=>{ if(p!==mine && !p.bot && !fresh(p.peer)) p.peer=null; });
    guests().forEach(g=>{ lastAct[g.peer]=(g.presence.act&&g.presence.act.n)||0; });
    if(S.turnAt) S.turnAt=now(); ME=S.seats.indexOf(mine);
    ROOM.presence({act:null}).catch(()=>{}); toast('Chủ phòng đã thoát — bạn được chọn làm chủ phòng mới'); commit(); }
  function migrateChk(){
    if(MODE!=='client'||!S||LOBBY||!ROOM||S.phase==='over'||S.winner!=null||ME<0){ goneSince=0; return; }
    const h=hostPeer(); if(h&&fresh(h.peer)&&!h.presence.lobby){ goneSince=0; return; }
    if(typeof ROOM.connected==='function'&&!ROOM.connected()){ goneSince=0; return; }
    if(!goneSince) goneSince=Date.now(); if(Date.now()-goneSince<2500) return;
    const hp=h&&h.peer; const cand=S.seats.filter(p=>!p.bot&&p.pid&&p.peer&&p.peer!==hp&&fresh(p.peer)).map(p=>p.pid).sort(); if(!cand.length) return;
    const pick=cand[hashStr(CODE+':'+cand.join(','))%cand.length]; if(pick===PID) becomeHost(); }
  function dupHostChk(){ if(MODE!=='host'||!ROOM) return; const o=hostPeer(); if(!o||!fresh(o.peer)||o.presence.lobby&&!LOBBY) return; const ov=(o.presence.st&&o.presence.st.v)||0, mv=(S&&S.v)||0; if(LOBBY||ov>mv||(ov===mv&&String(o.presence.pid)<String(PID))){ const code=CODE; leaveQuiet(); MODE='local'; S=null; joinRoom(code); } }
  let offSince=0;
  function rejoinBar(show){ let b=document.getElementById('tb-rj'); if(!show){ if(b) b.remove(); return; } if(b) return;
    if(!document.getElementById('tb-rj-css')){ const st=document.createElement('style'); st.id='tb-rj-css'; st.textContent='#tb-rj{position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:100000;display:flex;align-items:center;gap:10px;max-width:94vw;padding:8px 12px;border-radius:14px;background:linear-gradient(#7a1d1d,#4d0f0f);border:2px solid #ffcf6b;color:#fff;font:700 14px/1.2 inherit;box-shadow:0 6px 18px rgba(0,0,0,.5)}#tb-rj button{border:0;border-radius:10px;padding:8px 12px;font:800 14px inherit;color:#3b1d00;background:linear-gradient(#ffe08a,#f2a81d);cursor:pointer;white-space:nowrap}'; document.head.appendChild(st); }
    b=document.createElement('div'); b.id='tb-rj'; b.innerHTML='<span>Mất kết nối phòng <b>'+esc(CODE||'')+'</b></span><button type="button">Vào lại phòng</button>'; document.body.appendChild(b);
    b.querySelector('button').onclick=()=>{ const code=CODE, host=MODE==='host'; rejoinBar(false); offSince=0; if(host && S && !LOBBY) savedS=S; leaveQuiet(); host?createRoom(code):joinRoom(code); }; }
  function rejoinChk(){ migrateChk(); dupHostChk(); if(!ROOM||MODE==='local'||typeof ROOM.connected!=='function'){ offSince=0; rejoinBar(false); return; } if(ROOM.connected()){ offSince=0; rejoinBar(false); return; } if(!offSince) offSince=Date.now(); if(Date.now()-offSince>=4000) rejoinBar(true); }
  function init(cfg){ CFG=cfg; shell(); setInterval(rejoinChk,1500); if(!window.PBG&&!document.getElementById('pbg-js')){ const a=document.createElement('script'); a.id='pbg-js'; a.src='../../core/account.js'; document.head.appendChild(a); } const h=location.hash||''; const w=h.match(/^#s-([a-z0-9]{4,6})$/i), m=h.match(/^#p-([a-z0-9]{4,6})$/i); if(w){ menu(); askJoin(w[1].toUpperCase(),true); } else if(m){ menu(); askJoin(m[1].toUpperCase()); } else menu(); const g=h.match(/^#go-(create|local|join|rules)$/); if(g){ setTimeout(()=>{ const b={create:'#m-create',local:'#m-local',join:'#m-join'}[g[1]]; if(g[1]==='rules'){ const r=$('#tb-rules'); if(r) r.click(); else modal('Luật chơi',CFG.rules,[{t:'Đã hiểu',pri:1}]); } else if($(b)) $(b).click(); try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} },350); } }
  return { init, API };
})();
