/* BỘ KHUNG DÙNG CHUNG — core/room.js
   ===================== PHÒNG ONLINE KHÔNG CẦN ĐĂNG NHẬP (qua máy chủ trung gian MQTT công cộng) =====================
   Giả lập các hàm của "room" (join, presence, onPeers, peers, leave) để phần còn lại của game dùng chung.
   Mỗi người đăng trạng thái của mình lên 1 kênh riêng (giữ lại trên máy chủ), ai cũng nghe được mọi kênh trong phòng.
   Không nối thẳng máy với máy nên mạng 4G hay Wi-Fi đều vào được; tạm thoát ra Zalo rồi quay lại vẫn tự nối lại. */
const BROKERS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
const PeerRoom = {
  join(name, opts){
    return new Promise((resolve, reject)=>{
      if (typeof mqtt==='undefined') return reject(new Error('Chưa tải được thư viện kết nối'));
      const base = 'duongraychauau/v3/' + name + '/p/';
      const myId = 'u' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      const S = { members:{}, ts:{}, handlers:[], last:[], me:{}, done:false, clients:[], hb:null };
      const emit = ()=>{
        const now = Date.now();
        Object.keys(S.members).forEach(id=>{ if (id!==myId && now-(S.ts[id]||0) > 40000){ delete S.members[id]; delete S.ts[id]; } });
        S.members[myId] = S.me;
        S.last = Object.keys(S.members).map(id=>Object.freeze({ peer:id, presence:S.members[id]||{}, sameTab:id===myId, isMe:id===myId, kind:'viewer', by:null, guest:false, updatedAt:S.ts[id]||now }));
        S.handlers.forEach(h=>{ try{ h({peers:S.last, joined:[], left:[], updated:[]}); }catch(e){ console.error(e); } });
      };
      // Gửi lên MỌI máy chủ đang nối được: chỉ cần 2 người chung 1 máy chủ là thấy nhau
      const pub = ()=>{ const msg=JSON.stringify(Object.assign({}, S.me, {_ts:Date.now()})); S.clients.forEach(c=>{ if (c.connected) c.publish(base+myId, msg, {retain:true, qos:0}); }); };
      // Thông báo phòng đang mở lên sảnh chính (giữ lại trên máy chủ, tự hết hạn nếu không làm mới)
      S.annTopic = 'duongraychauau/v3hub/rooms/' + name;
      const pubAnn = ()=>{ const msg = S.ann ? JSON.stringify(Object.assign({}, S.ann, {_ts:Date.now()})) : ''; S.clients.forEach(c=>{ if (c.connected) c.publish(S.annTopic, msg, {retain:true, qos:0}); }); };
      let pubT=null; const pubSoon = ()=>{ if (pubT) return; pubT=setTimeout(()=>{ pubT=null; pub(); }, 50); };
      const api = {
        name,
        presence: async (patch)=>{
          const me = Object.assign({}, S.me);
          for (const k in patch){ if (patch[k]===null) delete me[k]; else me[k]=JSON.parse(JSON.stringify(patch[k])); }
          S.me = me; pubSoon(); emit();
        },
        onPeers(h){ S.handlers.push(h); setTimeout(emit, 0); return ()=>{ S.handlers=S.handlers.filter(x=>x!==h); }; },
        peers(){ return S.last; },
        connected(){ return S.clients.some(c=>c.connected); },
        announce(obj){ S.ann = obj; pubAnn(); },
        leave: async ()=>{ clearInterval(S.hb); S.clients.forEach(c=>{ try{ c.publish(base+myId, '', {retain:true}); if (S.annTopic) c.publish(S.annTopic, '', {retain:true}); c.end(false); }catch(e){} }); }
      };
      const onMsg = (topic, buf)=>{
        const id = topic.slice(base.length); if (!id || id===myId) return;
        const txt = buf ? buf.toString() : '';
        if (!txt){ delete S.members[id]; delete S.ts[id]; emit(); return; }
        try{ const p=JSON.parse(txt); if (!p || typeof p!=='object') return; const t=+p._ts||0;
          if (Date.now()-t > 40000 || t < (S.ts[id]||0)) return; delete p._ts; S.members[id]=p; S.ts[id]=t; emit(); }catch(e){}
      };
      BROKERS.forEach((url,i)=>{
        let c; try{ c = mqtt.connect(url, { clientId:myId+'_'+i, clean:true, keepalive:30, reconnectPeriod:3000, connectTimeout:7000,
          will:{ topic:base+myId, payload:'', retain:true, qos:0 } }); }catch(e){ return; }
        S.clients.push(c);
        c.on('connect', ()=>{
          c.subscribe(base+'+', {qos:0}, err=>{
            if (err) return; pub();
            if (!S.done){ S.done=true; S.hb=setInterval(()=>{ pub(); if (S.ann) pubAnn(); emit(); }, 10000); setTimeout(()=>{ resolve(api); emit(); }, 700); }
          });
        });
        c.on('message', onMsg); c.on('error', ()=>{});
      });
      setTimeout(()=>{ if (!S.done){ S.done=true; S.clients.forEach(c=>{ try{ c.end(true); }catch(e){} }); reject(new Error('Không kết nối được máy chủ')); } }, 15000);
      document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) S.clients.forEach(c=>{ if (!c.connected){ try{ c.reconnect(); }catch(e){} } }); });
    });
  }
};
