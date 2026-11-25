/* BỘ KHUNG DÙNG CHUNG — core/account.js
   Tài khoản Phi Board Games: đăng nhập (Firebase Auth), hồ sơ, bạn bè, thành tích (Firestore),
   danh sách đang online + thông báo + mời chơi (MQTT, không giới hạn số người). */
(function(){
  if (window.PBG) return;
  const BASE=(document.currentScript&&document.currentScript.src||'').replace(/account\.js.*$/,'');
  const FBV='10.12.2', CDN='https://www.gstatic.com/firebasejs/'+FBV+'/';
  const BROKERS=['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt'];
  const TP='phibg/v1/';
  const AV=['🦁','🐯','🦊','🐼','🐨','🐸','🐵','🦉','🐲','🦄','🐙','🐬','🦅','🐺','🐻','🐰','👑','💎','🎲','🃏','⚔️','🛡️','🌟','🔥'];
  const ls={ get:k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set:(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} } };
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=s=>document.querySelector(s);
  const load=src=>new Promise((ok,no)=>{ const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=no; document.head.appendChild(s); });
  const ago=ms=>{ const m=Math.floor(ms/60000); if(m<1) return 'vừa vào'; if(m<60) return m+' phút'; const h=Math.floor(m/60); return h+' giờ '+(m%60)+' phút'; };

  const P={ user:null, prof:null, db:null, auth:null, fbOK:false, online:{}, friends:{}, mq:null, myId:null, since:Date.now(), room:null, gameTitle:null, firstSync:true, playMin:0 };
  window.PBG=P;

  /* ---------- giao diện ---------- */
  const CSS=`
  #pbg-fab{position:fixed;left:10px;bottom:10px;z-index:9000;display:flex;align-items:center;gap:6px;padding:4px 10px 4px 4px;border-radius:999px;cursor:pointer;
    background:linear-gradient(180deg,#5a1830,#2b0b17);border:1.5px solid #c9a24e;color:#f6e3a6;font:bold 13px "Times New Roman",serif;box-shadow:0 4px 12px rgba(0,0,0,.5)}
  #pbg-fab .av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#140609;border:1px solid #c9a24e;font-size:16px;overflow:hidden}
  #pbg-fab .av img,.pbg-av img{width:100%;height:100%;object-fit:cover}
  #pbg-fab .on{display:inline-flex;align-items:center;gap:3px;font-weight:normal;font-size:12px;color:#bdf5c9}
  #pbg-fab .on::before{content:"";width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e}
  #pbg-fab .bd{min-width:16px;height:16px;border-radius:8px;background:#ef4444;color:#fff;font-size:10px;display:none;align-items:center;justify-content:center;padding:0 4px}
  body.ingame #pbg-fab{opacity:.85;transform:scale(.9);transform-origin:left bottom}
  #pbg-dr{position:fixed;top:0;right:0;bottom:0;width:min(360px,94vw);z-index:9500;transform:translateX(105%);transition:transform .25s;display:flex;flex-direction:column;
    background:linear-gradient(180deg,#3b0f1e,#1a0710);border-left:2px solid #c9a24e;box-shadow:-8px 0 30px rgba(0,0,0,.6);color:#f6ead0;font-family:"Times New Roman",serif}
  #pbg-dr.open{transform:none}
  #pbg-dim{position:fixed;inset:0;z-index:9400;background:rgba(0,0,0,.45);display:none}#pbg-dim.open{display:block}
  .pbg-hd{display:flex;align-items:center;gap:10px;padding:14px 14px 10px;border-bottom:1px solid rgba(201,162,78,.5)}
  .pbg-av{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;background:#140609;border:2px solid #c9a24e;overflow:hidden;flex:0 0 auto}
  .pbg-av.sm{width:30px;height:30px;font-size:16px;border-width:1px}
  .pbg-nm{font-weight:bold;font-size:17px;color:#ffe08a}.pbg-sub{font-size:12px;opacity:.75}
  .pbg-x{margin-left:auto;background:none;border:none;color:#f6e3a6;font-size:24px;cursor:pointer}
  .pbg-tabs{display:flex;gap:2px;padding:8px 8px 0}
  .pbg-tabs button{flex:1;padding:7px 2px;border:1px solid rgba(201,162,78,.5);border-bottom:none;border-radius:8px 8px 0 0;background:rgba(0,0,0,.25);color:#e9d9b0;font:bold 13px "Times New Roman",serif;cursor:pointer;position:relative}
  .pbg-tabs button.on{background:#5e1730;color:#ffe08a}
  .pbg-tabs .bd{position:absolute;top:-6px;right:2px;background:#ef4444;color:#fff;border-radius:8px;font-size:10px;padding:0 5px}
  .pbg-body{flex:1;overflow:auto;padding:10px 12px;border-top:1px solid rgba(201,162,78,.5)}
  .pbg-row{display:flex;align-items:center;gap:9px;padding:7px 4px;border-bottom:1px dashed rgba(201,162,78,.25)}
  .pbg-row .i{flex:1;min-width:0}.pbg-row .n{font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pbg-row .s{font-size:12px;opacity:.75}
  .pbg-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;margin-right:4px;box-shadow:0 0 5px #22c55e}
  .pbg-dot.off{background:#777;box-shadow:none}
  .pbg-b{padding:5px 10px;border-radius:8px;border:1px solid #c9a24e;background:linear-gradient(180deg,#6b1a33,#3a0d1c);color:#f6e3a6;font:bold 12.5px "Times New Roman",serif;cursor:pointer;white-space:nowrap}
  .pbg-b.g{background:linear-gradient(180deg,#1f9d5a,#0b5c32)}.pbg-b.y{background:linear-gradient(180deg,#f5c518,#b7791f);color:#3d2a00}
  .pbg-b:disabled{opacity:.5}
  .pbg-h{font-weight:bold;color:#ffe08a;margin:10px 0 4px;font-size:14px}
  .pbg-in{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid #c9a24e;background:#140609;color:#fff;font:15px "Times New Roman",serif;margin:4px 0}
  .pbg-avs{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin:6px 0}
  .pbg-avs button{font-size:20px;padding:3px 0;border-radius:8px;border:1px solid transparent;background:rgba(0,0,0,.3);cursor:pointer}
  .pbg-avs button.on{border-color:#ffe08a;background:#5e1730}
  .pbg-st{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0}
  .pbg-st div{text-align:center;padding:8px 2px;border-radius:10px;background:rgba(0,0,0,.3);border:1px solid rgba(201,162,78,.4)}
  .pbg-st b{display:block;font-size:20px;color:#ffe08a}.pbg-st span{font-size:11.5px;opacity:.8}
  .pbg-empty{opacity:.7;font-size:13.5px;padding:10px 2px;line-height:1.45}
  #pbg-login{position:fixed;inset:0;z-index:9800;background:rgba(10,3,8,.7);display:none;align-items:center;justify-content:center;padding:14px}
  #pbg-login.open{display:flex}
  #pbg-login .box{width:min(380px,100%);max-height:94vh;overflow:auto;padding:22px 22px 18px;border-radius:16px;background:linear-gradient(180deg,#fbf1d6,#e7cf93);color:#3a2410;border:3px solid #b8862b;box-shadow:0 0 0 6px #5e1730,0 0 0 8px #d4a548,0 20px 50px rgba(0,0,0,.7);font-family:"Times New Roman",serif}
  #pbg-login h3{margin:0 0 4px;text-align:center;font-size:24px;color:#5e1730}
  #pbg-login p{margin:4px 0 10px;text-align:center;font-size:14px}
  #pbg-login .pbg-in{background:#fffaf0;color:#3a2410;border-color:#b8862b}
  #pbg-login .gbtn{width:100%;padding:10px;border-radius:10px;border:1px solid #999;background:#fff;color:#222;font:bold 15px Arial,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
  #pbg-login .or{text-align:center;margin:10px 0;font-size:13px;opacity:.7}
  #pbg-login .row2{display:flex;gap:8px;margin-top:6px}#pbg-login .row2 .pbg-b{flex:1;padding:9px}
  #pbg-login .skip{display:block;margin:12px auto 0;background:none;border:none;color:#5e1730;text-decoration:underline;cursor:pointer;font:14px "Times New Roman",serif}
  #pbg-login .err{color:#b91c1c;font-size:13px;text-align:center;min-height:16px}
  #pbg-toasts{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:9900;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none}
  .pbg-t{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:12px;background:linear-gradient(180deg,#4a1426,#250812);border:1.5px solid #c9a24e;color:#f6ead0;font:14px "Times New Roman",serif;box-shadow:0 6px 18px rgba(0,0,0,.55);animation:pbgIn .3s ease-out;max-width:92vw}
  @keyframes pbgIn{from{opacity:0;transform:translateY(-10px)}}
  `;
  function ui(){
    const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
    const d=document.createElement('div'); d.innerHTML=`<div id="pbg-fab" title="Tài khoản · Bạn bè · Đang online"><span class="av">👤</span><span class="nm">Đăng nhập</span><span class="on">0</span><span class="bd"></span></div>
      <div id="pbg-dim"></div><div id="pbg-dr"></div><div id="pbg-login"><div class="box"></div></div><div id="pbg-toasts"></div>`;
    while(d.firstChild) document.body.appendChild(d.firstChild);
    $('#pbg-fab').onclick=()=>P.user?openDr():openLogin();
    $('#pbg-dim').onclick=closeDr;
  }
  function toast(html,ms,btns){ const t=document.createElement('div'); t.className='pbg-t'; t.innerHTML=html; (btns||[]).forEach(b=>{ const e=document.createElement('button'); e.className='pbg-b '+(b.cls||''); e.textContent=b.t; e.onclick=()=>{ t.remove(); b.f&&b.f(); }; t.appendChild(e); }); $('#pbg-toasts').appendChild(t); setTimeout(()=>t.remove(),ms||4500); }
  P.toast=toast;
  function avHTML(a,cls){ return `<span class="pbg-av ${cls||''}">${a&&/^https?:/.test(a)?`<img src="${esc(a)}" alt="">`:esc(a||'👤')}</span>`; }

  /* ---------- đăng nhập ---------- */
  function openLogin(msg){ const b=$('#pbg-login .box');
    if(!P.fbOK){ b.innerHTML=`<h3>Tài khoản</h3><p>Chức năng đăng nhập đang được cài đặt, sẽ có trong ít phút nữa.</p><p>Bạn vẫn chơi bình thường được.</p><button class="skip">Đóng</button>`; b.querySelector('.skip').onclick=closeLogin; $('#pbg-login').classList.add('open'); return; }
    b.innerHTML=`<h3>Phi Board Games</h3><p>Đăng nhập để lưu tên, kết bạn, mời chơi và lưu thành tích.</p>
      <button class="gbtn" data-g><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Đăng nhập bằng Google</button>
      <div class="or">— hoặc dùng email —</div>
      <input class="pbg-in" data-e type="email" placeholder="Email" autocomplete="email">
      <input class="pbg-in" data-p type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" autocomplete="current-password">
      <div class="err">${esc(msg||'')}</div>
      <div class="row2"><button class="pbg-b g" data-li>Đăng nhập</button><button class="pbg-b y" data-su>Tạo tài khoản</button></div>
      <button class="skip">Chơi không cần tài khoản</button>`;
    const err=m=>b.querySelector('.err').textContent=m;
    const em=()=>b.querySelector('[data-e]').value.trim(), pw=()=>b.querySelector('[data-p]').value;
    const fe=e=>{ const c=(e&&e.code)||''; err(c.includes('invalid-credential')||c.includes('wrong-password')||c.includes('user-not-found')?'Sai email hoặc mật khẩu.':c.includes('email-already')?'Email này đã có tài khoản — bấm Đăng nhập.':c.includes('weak-password')?'Mật khẩu cần ít nhất 6 ký tự.':c.includes('invalid-email')?'Email không hợp lệ.':c.includes('popup')?'Cửa sổ đăng nhập bị chặn hoặc đã đóng. Thử lại.':c.includes('unauthorized-domain')?'Tên miền này chưa được cho phép trong Firebase.':'Lỗi: '+(e&&e.message||c)); };
    b.querySelector('[data-g]').onclick=()=>{ const pr=new firebase.auth.GoogleAuthProvider(); P.auth.signInWithPopup(pr).then(closeLogin).catch(e=>{ if((e.code||'').includes('popup-blocked')) P.auth.signInWithRedirect(pr); else fe(e); }); };
    b.querySelector('[data-li]').onclick=()=>P.auth.signInWithEmailAndPassword(em(),pw()).then(closeLogin).catch(fe);
    b.querySelector('[data-su]').onclick=()=>P.auth.createUserWithEmailAndPassword(em(),pw()).then(closeLogin).catch(fe);
    b.querySelector('.skip').onclick=()=>{ ls.set('pbg-skip','1'); closeLogin(); };
    $('#pbg-login').classList.add('open'); }
  function closeLogin(){ $('#pbg-login').classList.remove('open'); }
  P.login=openLogin;

  /* ---------- ngăn kéo: online / bạn bè / thành tích / BXH ---------- */
  let TAB='on';
  function openDr(t){ if(t) TAB=t; $('#pbg-dr').classList.add('open'); $('#pbg-dim').classList.add('open'); drawDr(); }
  function closeDr(){ $('#pbg-dr').classList.remove('open'); $('#pbg-dim').classList.remove('open'); }
  P.open=openDr;
  function incoming(){ return Object.values(P.friends).filter(f=>f.status==='incoming'); }
  function drawDr(){ const d=$('#pbg-dr'); if(!d.classList.contains('open')) return; const pr=P.prof||{};
    const nIn=incoming().length, nOn=Object.keys(P.online).length;
    let body='';
    if(TAB==='on'){ const L=Object.values(P.online).sort((a,b)=>a.since-b.since);
      body=`<div class="pbg-sub">${nOn} người đang online</div>`+(L.length?L.map(o=>{ const me=o.id===P.myId, fr=P.friends[o.uid];
        return `<div class="pbg-row">${avHTML(o.av,'sm')}<div class="i"><div class="n"><span class="pbg-dot"></span>${esc(o.name)}${me?' (bạn)':''}${o.guest?' <small>· khách</small>':''}</div><div class="s">Online ${ago(Date.now()-o.since)}${o.game?' · đang ở '+esc(o.game):' · ở sảnh'}</div></div>
          ${me||o.guest||!P.user?'':fr&&fr.status==='friend'?inviteBtn(o):fr&&fr.status==='outgoing'?'<button class="pbg-b" disabled>Đã gửi</button>':fr&&fr.status==='incoming'?`<button class="pbg-b g" data-acc="${esc(o.uid)}">Đồng ý</button>`:`<button class="pbg-b" data-add="${esc(o.uid)}">Kết bạn</button>`}</div>`; }).join(''):'<div class="pbg-empty">Chưa có ai online.</div>'); }
    else if(TAB==='fr'){ const F=Object.entries(P.friends);
      const inc=F.filter(([,f])=>f.status==='incoming'), fr=F.filter(([,f])=>f.status==='friend'), out=F.filter(([,f])=>f.status==='outgoing');
      const onl=uid=>Object.values(P.online).find(o=>o.uid===uid);
      body=`<div class="pbg-h">Tìm bạn theo tên</div><div style="display:flex;gap:6px"><input class="pbg-in" data-q placeholder="Nhập tên người chơi…"><button class="pbg-b" data-find>Tìm</button></div><div data-res></div>`
       +(inc.length?`<div class="pbg-h">Lời mời kết bạn (${inc.length})</div>`+inc.map(([id,f])=>`<div class="pbg-row">${avHTML(f.av,'sm')}<div class="i"><div class="n">${esc(f.name)}</div></div><button class="pbg-b g" data-acc="${esc(id)}">Đồng ý</button><button class="pbg-b" data-rm="${esc(id)}">Từ chối</button></div>`).join(''):'')
       +`<div class="pbg-h">Bạn bè (${fr.length})</div>`+(fr.length?fr.sort((a,b)=>!!onl(b[0])-!!onl(a[0])).map(([id,f])=>{ const o=onl(id); return `<div class="pbg-row">${avHTML(f.av,'sm')}<div class="i"><div class="n"><span class="pbg-dot ${o?'':'off'}"></span>${esc(f.name)}</div><div class="s">${o?'Online '+ago(Date.now()-o.since)+(o.game?' · '+esc(o.game):''):'Đang offline'}</div></div>${o?inviteBtn(o):''}<button class="pbg-b" data-rm="${esc(id)}" title="Xóa bạn">✕</button></div>`; }).join(''):'<div class="pbg-empty">Chưa có bạn nào. Vào tab Online bấm "Kết bạn", hoặc tìm theo tên ở trên.</div>')
       +(out.length?`<div class="pbg-h">Đã gửi lời mời</div>`+out.map(([id,f])=>`<div class="pbg-row">${avHTML(f.av,'sm')}<div class="i"><div class="n">${esc(f.name)}</div><div class="s">Đang chờ đồng ý</div></div><button class="pbg-b" data-rm="${esc(id)}">Hủy</button></div>`).join(''):''); }
    else if(TAB==='me'){ const s=pr.stats||{}, g=s.games||0, w=s.wins||0, by=pr.byGame||{};
      body=`<div class="pbg-h">Hồ sơ</div><input class="pbg-in" data-nm maxlength="18" value="${esc(pr.name||'')}" placeholder="Tên hiển thị"><div class="pbg-avs">${AV.map(a=>`<button data-av="${a}" class="${pr.avatar===a?'on':''}">${a}</button>`).join('')}${P.user&&P.user.photoURL?`<button data-av="${esc(P.user.photoURL)}" class="${pr.avatar===P.user.photoURL?'on':''}" style="padding:0;overflow:hidden"><img src="${esc(P.user.photoURL)}" style="width:28px;height:28px;border-radius:50%"></button>`:''}</div><button class="pbg-b g" data-save>Lưu hồ sơ</button>
       <div class="pbg-h">Thành tích</div><div class="pbg-st"><div><b>${g}</b><span>Ván đã chơi</span></div><div><b>${w}</b><span>Ván thắng</span></div><div><b>${g?Math.round(w*100/g):0}%</b><span>Tỉ lệ thắng</span></div><div><b>${Math.floor((s.minutes||0)/60)}g ${(s.minutes||0)%60}p</b><span>Thời gian chơi</span></div><div><b>${Object.values(P.friends).filter(f=>f.status==='friend').length}</b><span>Bạn bè</span></div><div><b>${pr.createdAt?new Date(pr.createdAt).toLocaleDateString('vi-VN'):'—'}</b><span>Ngày tham gia</span></div></div>
       ${Object.keys(by).length?`<div class="pbg-h">Theo từng game</div>`+Object.entries(by).map(([k,v])=>`<div class="pbg-row"><div class="i"><div class="n">${esc(v.title||k)}</div></div><div class="s">${v.games||0} ván · thắng ${v.wins||0}</div></div>`).join(''):''}
       <div style="margin-top:14px"><button class="pbg-b" data-out>Đăng xuất</button></div>`; }
    else if(TAB==='top'){ body=`<div class="pbg-h">🏆 Bảng xếp hạng (số ván thắng)</div><div data-top class="pbg-empty">Đang tải…</div>`; }
    d.innerHTML=`<div class="pbg-hd">${avHTML(pr.avatar)}<div><div class="pbg-nm">${esc(pr.name||'Người chơi')}</div><div class="pbg-sub">${esc(P.user&&P.user.email||'')}</div></div><button class="pbg-x">×</button></div>
      <div class="pbg-tabs"><button data-t="on" class="${TAB==='on'?'on':''}">Online (${nOn})</button><button data-t="fr" class="${TAB==='fr'?'on':''}">Bạn bè${nIn?`<span class="bd">${nIn}</span>`:''}</button><button data-t="me" class="${TAB==='me'?'on':''}">Tôi</button><button data-t="top" class="${TAB==='top'?'on':''}">BXH</button></div>
      <div class="pbg-body">${body}</div>`;
    d.querySelector('.pbg-x').onclick=closeDr;
    d.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ TAB=b.dataset.t; drawDr(); });
    d.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addFriend(b.dataset.add));
    d.querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>acceptFriend(b.dataset.acc));
    d.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>removeFriend(b.dataset.rm));
    d.querySelectorAll('[data-inv]').forEach(b=>b.onclick=()=>invite(b.dataset.inv));
    const av=d.querySelectorAll('[data-av]'); av.forEach(b=>b.onclick=()=>{ av.forEach(x=>x.classList.remove('on')); b.classList.add('on'); });
    const sv=d.querySelector('[data-save]'); if(sv) sv.onclick=()=>{ const nm=d.querySelector('[data-nm]').value.trim().slice(0,18); const a=d.querySelector('[data-av].on'); if(!nm) return toast('Hãy nhập tên'); saveProf({name:nm,nameLower:nm.toLowerCase(),avatar:a?a.dataset.av:(pr.avatar||'👤')}).then(()=>toast('✅ Đã lưu hồ sơ')); };
    const out=d.querySelector('[data-out]'); if(out) out.onclick=()=>{ P.auth.signOut(); closeDr(); };
    const fd=d.querySelector('[data-find]'); if(fd) fd.onclick=()=>findUser(d.querySelector('[data-q]').value.trim(),d.querySelector('[data-res]'));
    if(TAB==='top') loadTop(d.querySelector('[data-top]'));
  }
  function inviteBtn(o){ return P.room&&o.id!==P.myId?`<button class="pbg-b y" data-inv="${esc(o.id)}">Mời chơi</button>`:''; }

  /* ---------- Firestore: hồ sơ, bạn bè, thành tích ---------- */
  const uref=uid=>P.db.collection('users').doc(uid);
  function saveProf(o){ if(!P.user) return Promise.resolve(); P.prof=Object.assign(P.prof||{},o); if(o.name) ls.set('bg-name',o.name); publish(); fab(); return uref(P.user.uid).set(o,{merge:true}); }
  function myCard(){ return {name:(P.prof&&P.prof.name)||'Người chơi', av:(P.prof&&P.prof.avatar)||'👤'}; }
  function addFriend(uid){ if(!P.user||uid===P.user.uid) return; const o=Object.values(P.online).find(x=>x.uid===uid)||{}; const f=P.friends[uid];
    if(f&&f.status==='incoming') return acceptFriend(uid);
    const me=myCard(), at=Date.now();
    Promise.all([uref(uid).collection('friends').doc(P.user.uid).set({status:'incoming',name:me.name,av:me.av,at}),uref(P.user.uid).collection('friends').doc(uid).set({status:'outgoing',name:o.name||'Người chơi',av:o.av||'👤',at})])
      .then(()=>{ send(uid,{t:'freq'}); toast('📨 Đã gửi lời mời kết bạn'); }).catch(e=>toast('Không gửi được: '+e.message)); }
  function acceptFriend(uid){ const f=P.friends[uid]||{}; const me=myCard();
    Promise.all([uref(P.user.uid).collection('friends').doc(uid).set({status:'friend',name:f.name||'Người chơi',av:f.av||'👤',at:Date.now()}),uref(uid).collection('friends').doc(P.user.uid).set({status:'friend',name:me.name,av:me.av,at:Date.now()})])
      .then(()=>{ send(uid,{t:'facc'}); toast('🤝 Đã thành bạn bè với '+esc(f.name||'')); }); }
  function removeFriend(uid){ Promise.all([uref(P.user.uid).collection('friends').doc(uid).delete(),uref(uid).collection('friends').doc(P.user.uid).delete()]).catch(()=>{}); }
  function findUser(q,box){ if(!q) return; box.innerHTML='<div class="pbg-empty">Đang tìm…</div>'; const ql=q.toLowerCase();
    uref('x').parent.where('nameLower','>=',ql).where('nameLower','<=',ql+'').limit(10).get().then(s=>{ const L=s.docs.filter(d=>d.id!==P.user.uid);
      box.innerHTML=L.length?L.map(d=>{ const v=d.data(), f=P.friends[d.id]; return `<div class="pbg-row">${avHTML(v.avatar,'sm')}<div class="i"><div class="n">${esc(v.name)}</div></div>${f?`<span class="pbg-sub">${f.status==='friend'?'Bạn bè':f.status==='outgoing'?'Đã gửi':'Chờ bạn đồng ý'}</span>`:`<button class="pbg-b" data-add2="${d.id}" data-n="${esc(v.name)}" data-a="${esc(v.avatar||'')}">Kết bạn</button>`}</div>`; }).join(''):'<div class="pbg-empty">Không tìm thấy ai tên như vậy.</div>';
      box.querySelectorAll('[data-add2]').forEach(b=>b.onclick=()=>{ const me=myCard(), at=Date.now(), uid=b.dataset.add2;
        Promise.all([uref(uid).collection('friends').doc(P.user.uid).set({status:'incoming',name:me.name,av:me.av,at}),uref(P.user.uid).collection('friends').doc(uid).set({status:'outgoing',name:b.dataset.n,av:b.dataset.a||'👤',at})]).then(()=>{ send(uid,{t:'freq'}); toast('📨 Đã gửi lời mời kết bạn'); b.disabled=true; b.textContent='Đã gửi'; }); }); })
      .catch(e=>box.innerHTML='<div class="pbg-empty">Lỗi tìm kiếm: '+esc(e.message)+'</div>'); }
  function loadTop(box){ uref('x').parent.orderBy('stats.wins','desc').limit(20).get().then(s=>{ box.className=''; box.innerHTML=s.docs.length?s.docs.map((d,i)=>{ const v=d.data(), st=v.stats||{}; return `<div class="pbg-row"><b style="width:26px;text-align:center;color:${i<3?'#ffe08a':'#ccc'}">${['🥇','🥈','🥉'][i]||i+1}</b>${avHTML(v.avatar,'sm')}<div class="i"><div class="n">${esc(v.name)}${P.user&&d.id===P.user.uid?' (bạn)':''}</div><div class="s">${st.games||0} ván · ${Math.floor((st.minutes||0)/60)}g${(st.minutes||0)%60}p</div></div><b style="color:#ffe08a">${st.wins||0} 🏆</b></div>`; }).join(''):'<div class="pbg-empty">Chưa có ai trên bảng xếp hạng.</div>'; }).catch(e=>{ box.textContent='Không tải được: '+e.message; }); }
  function addStats(o){ if(!P.user) return; const inc=firebase.firestore.FieldValue.increment, u={stats:{}};
    if(o.games) u.stats.games=inc(o.games); if(o.wins) u.stats.wins=inc(o.wins); if(o.minutes) u.stats.minutes=inc(o.minutes);
    if(o.game){ u.byGame={}; u.byGame[o.game]={title:o.title||o.game,games:inc(o.games||0),wins:inc(o.wins||0)}; }
    uref(P.user.uid).set(u,{merge:true}).catch(()=>{});
    const s=(P.prof.stats=P.prof.stats||{}); s.games=(s.games||0)+(o.games||0); s.wins=(s.wins||0)+(o.wins||0); s.minutes=(s.minutes||0)+(o.minutes||0);
    if(o.game){ const b=(P.prof.byGame=P.prof.byGame||{}); const g=b[o.game]=b[o.game]||{title:o.title,games:0,wins:0}; g.games+=o.games||0; g.wins+=o.wins||0; } }

  /* ---------- online qua MQTT ---------- */
  function presence(){ const me=P.user?myCard():{name:ls.get('bg-name')||'Khách',av:'👤'};
    return JSON.stringify({id:P.myId,uid:P.user?P.user.uid:null,guest:!P.user,name:me.name,av:me.av,since:P.since,game:P.gameTitle||null,ts:Date.now()}); }
  function publish(){ if(P.mq&&P.mq.connected) P.mq.publish(TP+'on/'+P.myId,presence(),{retain:true,qos:0}); }
  function send(uid,msg){ if(!P.mq) return; msg.from=P.myId; msg.fuid=P.user&&P.user.uid; const me=myCard(); msg.name=me.name; msg.av=me.av; P.mq.publish(TP+'u/'+uid,JSON.stringify(msg)); }
  function invite(id){ const o=P.online[id]; if(!o||!P.room) return; const tgt=o.uid||o.id; send(tgt,{t:'inv',title:P.room.title,link:P.room.link,code:P.room.code}); toast('📨 Đã mời '+esc(o.name)+' vào phòng '+esc(P.room.code)); }
  function mqttStart(){ if(P.mq) return; const go=()=>{ let bi=0; const conn=()=>{ const c=mqtt.connect(BROKERS[bi%BROKERS.length],{clientId:'pbg_'+P.myId+'_'+Math.random().toString(36).slice(2,6),clean:true,keepalive:30,reconnectPeriod:5000,connectTimeout:8000,
        will:{topic:TP+'on/'+P.myId,payload:'',retain:true,qos:0}});
      P.mq=c; let ok=false;
      c.on('connect',()=>{ ok=true; c.subscribe(TP+'on/+'); c.subscribe(TP+'u/'+P.myId); if(P.user) c.subscribe(TP+'u/'+P.user.uid); publish(); setTimeout(()=>{ P.firstSync=false; },3500); });
      c.on('message',(t,m)=>onMsg(t,m.toString()));
      c.on('error',()=>{}); setTimeout(()=>{ if(!ok){ try{ c.end(true); }catch(e){} bi++; P.mq=null; conn(); } },9000); };
      conn(); if(P._iv) return; P._iv=1; setInterval(publish,60000); setInterval(()=>{ const now=Date.now(); let ch=false; for(const k in P.online){ if(now-P.online[k].ts>200000){ delete P.online[k]; ch=true; } } if(ch){ fab(); drawDr(); } else drawDr(); },30000);
      addEventListener('pagehide',()=>{ try{ P.mq.publish(TP+'on/'+P.myId,'',{retain:true}); }catch(e){} }); };
    if(window.mqtt) go(); else load('https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js').then(go).catch(()=>{}); }
  function onMsg(t,m){
    if(t.startsWith(TP+'on/')){ const id=t.slice((TP+'on/').length); if(!m){ if(P.online[id]){ delete P.online[id]; fab(); drawDr(); } return; }
      let o; try{ o=JSON.parse(m); }catch(e){ return; } if(Date.now()-o.ts>200000) return;
      // cùng một tài khoản mở nhiều tab: chỉ giữ 1 dòng
      if(o.uid) for(const k in P.online) if(k!==id&&P.online[k].uid===o.uid&&P.online[k].ts<o.ts) delete P.online[k];
      const isNew=!P.online[id]; P.online[id]=o;
      if(isNew&&!P.firstSync&&id!==P.myId&&!(o.uid&&P.user&&o.uid===P.user.uid)){ const fr=o.uid&&P.friends[o.uid]&&P.friends[o.uid].status==='friend'; toast(`${avHTML(o.av,'sm')} <span><b>${esc(o.name)}</b> ${fr?'(bạn bè) ':''}vừa vào${o.game?' '+esc(o.game):' web'}</span>`,3500); if(window.SFX&&SFX.ok&&SFX.ok()) SFX.tone&&SFX.tone(1318,.12,{vol:.06}); }
      fab(); drawDr(); return; }
    let msg; try{ msg=JSON.parse(m); }catch(e){ return; }
    if(msg.t==='inv') toast(`${avHTML(msg.av,'sm')} <span><b>${esc(msg.name)}</b> mời bạn chơi <b>${esc(msg.title||'')}</b> (phòng ${esc(msg.code||'')})</span>`,20000,[{t:'Vào chơi',cls:'g',f:()=>{ location.href=msg.link; if(msg.link&&msg.link.split('#')[0]===location.href.split('#')[0]) location.reload(); }},{t:'Để sau'}]);
    else if(msg.t==='freq') toast(`${avHTML(msg.av,'sm')} <span><b>${esc(msg.name)}</b> gửi lời mời kết bạn</span>`,10000,[{t:'Đồng ý',cls:'g',f:()=>acceptFriend(msg.fuid)},{t:'Xem',f:()=>openDr('fr')}]);
    else if(msg.t==='facc') toast(`🤝 <span><b>${esc(msg.name)}</b> đã đồng ý kết bạn</span>`,5000);
  }

  /* ---------- nút nổi ---------- */
  function fab(){ const f=$('#pbg-fab'); if(!f) return; const pr=P.prof; f.querySelector('.av').innerHTML=pr?(/^https?:/.test(pr.avatar||'')?`<img src="${esc(pr.avatar)}">`:esc(pr.avatar||'👤')):'👤';
    f.querySelector('.nm').textContent=P.user?(pr&&pr.name||'…'):'Đăng nhập'; f.querySelector('.on').textContent=Object.keys(P.online).length;
    const n=incoming().length, bd=f.querySelector('.bd'); bd.textContent=n; bd.style.display=n?'inline-flex':'none'; }

  /* ---------- nối với bàn chơi ---------- */
  let lastPhase=null, minT=null;
  P.onState=function(o){ const room=o.code?{code:o.code,link:o.link,title:o.title}:null; const gt=o.title+(o.code?' · phòng '+o.code:'');
    if(gt!==P.gameTitle||JSON.stringify(room)!==JSON.stringify(P.room)){ P.room=room; P.gameTitle=gt; publish(); }
    const S=o.S; if(!S) return; const ph=S.phase;
    if(ph==='over'&&lastPhase&&lastPhase!=='over'&&o.ME>=0){ const ME=o.ME; const win=S.winner===ME||(Array.isArray(S.winners)&&S.winners.includes(ME))||(S.winner==null&&Array.isArray(S.order)&&S.order[0]===ME);
      addStats({games:1,wins:win?1:0,game:o.id||o.title,title:o.title,minutes:P.playMin}); P.playMin=0; }
    lastPhase=ph;
    if(!minT){ minT=setInterval(()=>{ if(document.body.classList.contains('ingame')&&!document.hidden){ P.playMin++; if(P.playMin>=10){ addStats({minutes:P.playMin}); P.playMin=0; } } },60000); } };
  P.setGame=function(title){ P.gameTitle=title; publish(); };

  /* ---------- khởi động ---------- */
  function start(){ ui();
    P.myId=ls.get('pbg-id')||('g'+Math.random().toString(36).slice(2,10)); ls.set('pbg-id',P.myId); lastId=P.myId;
    if(/\/games\//.test(location.pathname)) P.gameTitle=(document.title||'').split('|')[0].trim()||null;
    mqttStart();
    load(BASE+'fbconfig.js').catch(()=>{}).then(()=>{ const cfg=window.PBG_FB; if(!cfg||!cfg.apiKey){ fab(); return; }
      return load(CDN+'firebase-app-compat.js').then(()=>Promise.all([load(CDN+'firebase-auth-compat.js'),load(CDN+'firebase-firestore-compat.js')])).then(()=>{
        firebase.initializeApp(cfg); P.auth=firebase.auth(); P.db=firebase.firestore(); P.fbOK=true;
        P.auth.onAuthStateChanged(u=>{ P.user=u; P.friends={}; if(P.unsubF){ P.unsubF(); P.unsubF=null; }
          if(!u){ P.prof=null; P.myId=ls.get('pbg-id'); republishId(); fab(); drawDr(); if(!ls.get('pbg-skip')&&!document.body.classList.contains('ingame')) setTimeout(()=>{ if(!P.user) openLogin(); },1200); return; }
          uref(u.uid).get().then(d=>{ let pr=d.exists?d.data():null;
            if(!pr){ const nm=(u.displayName||ls.get('bg-name')||(u.email||'').split('@')[0]||'Người chơi').slice(0,18); pr={name:nm,nameLower:nm.toLowerCase(),avatar:u.photoURL||AV[Math.floor(Math.random()*AV.length)],createdAt:Date.now(),stats:{games:0,wins:0,minutes:0}}; uref(u.uid).set(pr,{merge:true}); toast('🎉 Chào mừng '+esc(nm)+'! Bấm vào tên ở góc dưới để đổi tên, ảnh đại diện.',6000); }
            P.prof=pr; if(pr.name) ls.set('bg-name',pr.name); uref(u.uid).set({lastSeen:Date.now()},{merge:true}); fab(); drawDr(); });
          P.myId=u.uid; republishId();
          P.unsubF=uref(u.uid).collection('friends').onSnapshot(s=>{ P.friends={}; s.forEach(d=>P.friends[d.id]=d.data()); fab(); drawDr(); });
        });
      }).catch(()=>{ fab(); }); });
  }
  let lastId=null;
  function republishId(){ if(lastId===P.myId) return; const old=lastId; lastId=P.myId; if(!P.mq) return; const c=P.mq; P.mq=null;
    try{ if(old&&c.connected) c.publish(TP+'on/'+old,'',{retain:true},()=>{ try{ c.end(true); }catch(e){} }); else c.end(true); }catch(e){} P.online={}; P.firstSync=true; mqttStart(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
