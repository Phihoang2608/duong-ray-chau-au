/* ===================== BIỂN MUỐI & THUYỀN GIẤY — LUẬT CHƠI + MÁY ===================== */
// Bộ 58 lá. Loại lá (mã ngắn):
//  Cặp đôi : cua(9) thuyen(8) ca(7) map(5, cá mập) boi(5, người bơi)
//  Sưu tầm : vo(6, vỏ sò) bt(5, bạch tuộc) cc(3, chim cánh cụt) tt(2, thủy thủ)
//  Nhân điểm: hd(hải đăng) dc(đàn cá) dcc(đàn chim cánh cụt) tn(thuyền trưởng)
//  Nàng tiên cá: tf(4)
const BM_TYPES=[
  {k:'cua',n:9,name:'Cua',grp:'duo'},{k:'thuyen',n:8,name:'Thuyền',grp:'duo'},{k:'ca',n:7,name:'Cá',grp:'duo'},
  {k:'map',n:5,name:'Cá mập',grp:'duo'},{k:'boi',n:5,name:'Người bơi',grp:'duo'},
  {k:'vo',n:6,name:'Vỏ sò',grp:'col'},{k:'bt',n:5,name:'Bạch tuộc',grp:'col'},{k:'cc',n:3,name:'Chim cánh cụt',grp:'col'},{k:'tt',n:2,name:'Thủy thủ',grp:'col'},
  {k:'hd',n:1,name:'Hải đăng',grp:'mul'},{k:'dc',n:1,name:'Đàn cá',grp:'mul'},{k:'dcc',n:1,name:'Đàn chim cánh cụt',grp:'mul'},{k:'tn',n:1,name:'Thuyền trưởng',grp:'mul'},
  {k:'tf',n:4,name:'Nàng tiên cá',grp:'mer'}];
// 10 màu: 9 màu cho 54 lá thường, màu thứ 10 (trắng ngọc trai) dành cho nàng tiên cá
const BM_COL=[{n:'Lam',h:'#3468e2'},{n:'Đỏ',h:'#e23e3e'},{n:'Đen than',h:'#3e4656'},{n:'Vàng',h:'#f7d642'},{n:'Xanh lá',h:'#46be6e'},
  {n:'Tím',h:'#966ce8'},{n:'Nâu',h:'#96623c'},{n:'Cam',h:'#ff8c1e'},{n:'Hồng',h:'#f484be'},{n:'Trắng ngọc trai',h:'#f8fafc'}];
const BM_COLN=[9,9,8,8,6,4,4,3,3];
const BM_WHITE=9;
const BM_WIN={2:40,3:35,4:30};
const BM_MIN_END=7;
const BM = (()=>{
  // ---- Bộ bài cố định (mọi máy dựng giống hệt nhau) ----
  const CARDS=[]; // {id,t,c}
  (function(){ let seed=20260611; const rnd=()=>{ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
    const cols=[]; BM_COLN.forEach((n,c)=>{ for(let i=0;i<n;i++) cols.push(c); });
    for(let i=cols.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [cols[i],cols[j]]=[cols[j],cols[i]]; }
    let ci=0; BM_TYPES.forEach(T=>{ for(let i=0;i<T.n;i++) CARDS.push({id:CARDS.length,t:T.k,c:T.k==='tf'?BM_WHITE:cols[ci++]}); }); })();
  const TYPE={}; BM_TYPES.forEach(T=>TYPE[T.k]=T);
  const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const tOf=id=>CARDS[id].t;
  const SH=[0,0,2,4,6,8,10], OC=[0,0,3,6,9,12], PG=[0,1,3,5], SA=[0,0,5];

  // ---- Tính điểm một tập lá ----
  function count(ids){ const n={}; BM_TYPES.forEach(T=>n[T.k]=0); ids.forEach(id=>n[CARDS[id].t]++); return n; }
  function colCount(ids){ const c=Array(10).fill(0); ids.forEach(id=>c[CARDS[id].c]++); return c; }
  function score(ids){ const n=count(ids), cc=colCount(ids);
    const duo=Math.floor(n.cua/2)+Math.floor(n.thuyen/2)+Math.floor(n.ca/2)+Math.min(n.map,n.boi);
    const col=SH[Math.min(6,n.vo)]+OC[Math.min(5,n.bt)]+PG[Math.min(3,n.cc)]+SA[Math.min(2,n.tt)];
    const mul=(n.hd?n.thuyen:0)+(n.dc?n.ca:0)+(n.dcc?2*n.cc:0)+(n.tn?3*n.tt:0);
    const sorted=cc.slice().sort((a,b)=>b-a); let mer=0; for(let i=0;i<Math.min(n.tf,4);i++) mer+=sorted[i];
    return {pts:duo+col+mul+mer, duo, col, mul, mer, bonus:sorted[0], n}; }
  const rawPts=ids=>score(ids).pts;
  const allCards=(P)=>P.hand.concat(P.table);
  const myPts=(S,i)=>score(allCards(S.P[i])).pts;
  const tablePts=(S,i)=>score(S.P[i].table).pts;

  // ---- Khởi tạo ----
  function newRound(S,starter,t){
    const deck=shuffle(CARDS.map(c=>c.id)); S.disc=[[deck.pop()],[deck.pop()]]; S.deck=deck;
    S.P.forEach(p=>{ p.hand=[]; p.table=[]; p.rd=0; });
    S.turn=S.first=starter; S.step='draw'; S.pend=[]; S.call=null; S.rev=S.seats.map(()=>false); S.rres=null; S.turnAt=t; S.crab=null; S.round=(S.round||0)+1; S.extra=0; S.chain=0;
    S.log.unshift('🌊 Ván '+S.round+' bắt đầu — '+S.seats[starter].name+' đi trước.'); }
  function newGame(seats,t,prev){
    const n=seats.length;
    const S={seats:seats.map(s=>({name:s.name,bot:!!s.bot,lvl:s.lvl||null,peer:s.peer||null,pid:s.pid||null,color:s.color})),
      P:seats.map(()=>({hand:[],table:[],pts:0,rd:0})), deck:[], disc:[[],[]], turn:0, first:0, step:'draw', pend:[], phase:'play', winner:-1,
      round:0, target:BM_WIN[n]||30, call:null, rev:[], rres:null, crab:null, log:[], evN:0, ev:null, turnAt:t, hist:[]};
    S.log.unshift('Bắt đầu! Ai đạt '+S.target+' điểm sau một ván sẽ thắng chung cuộc.');
    newRound(S,Math.floor(Math.random()*n),t); return S; }

  const ev=(S,o)=>{ S.evN=(S.evN||0)+1; S.ev=Object.assign({n:S.evN},o); };
  const nm=(S,i)=>S.seats[i].name;
  const cname=id=>TYPE[CARDS[id].t].name+' '+BM_COL[CARDS[id].c].n.toLowerCase();
  const nextSeat=(S,i)=>(i+1)%S.seats.length;
  const victims=(S,me)=>S.seats.map((_,i)=>i).filter(i=>i!==me&&S.P[i].hand.length>0&&!S.rev[i]);

  function checkMermaid(S,seat){ const n=allCards(S.P[seat]).filter(id=>CARDS[id].t==='tf').length;
    if(n>=4){ S.phase='over'; S.winner=seat; S.step='over'; S.mermaid=true; S.log.unshift('🧜 '+nm(S,seat)+' gom đủ 4 nàng tiên cá — thắng ngay!'); ev(S,{k:'over',seat,mermaid:true}); return true; } return false; }

  function giveHand(S,seat,id){ S.P[seat].hand.push(id); return checkMermaid(S,seat); }

  // ---- Kết thúc ván ----
  function bonusOf(S,i){ return score(allCards(S.P[i])).bonus; }
  function finishRound(S,kind,caller,t){
    const n=S.seats.length, rows=S.seats.map((_,i)=>({seat:i,pts:myPts(S,i),bonus:bonusOf(S,i),gain:0}));
    let ok=null;
    if(kind==='stop'){ rows.forEach(r=>r.gain=r.pts); }
    else if(kind==='last'){ const best=Math.max(...rows.filter(r=>r.seat!==caller).map(r=>r.pts)); ok=rows[caller].pts>=best;
      rows.forEach(r=>{ if(r.seat===caller) r.gain=ok?r.pts+r.bonus:r.bonus; else r.gain=ok?r.bonus:r.pts; }); }
    rows.forEach(r=>{ S.P[r.seat].pts+=r.gain; S.P[r.seat].rd=r.gain; });
    S.rres={kind,caller,ok,rows,mer:false};
    if(kind==='stop') S.log.unshift('🛑 DỪNG! Mọi người tính điểm: '+rows.map(r=>nm(S,r.seat)+' +'+r.gain).join(', '));
    else if(kind==='last') S.log.unshift('⏳ '+nm(S,caller)+(ok?' đặt cược thành công':' đặt cược thất bại')+': '+rows.map(r=>nm(S,r.seat)+' +'+r.gain).join(', '));
    else S.log.unshift('🃏 Chồng bài đã hết — ván này không ai được điểm.');
    ev(S,{k:'round',kind,caller,ok,rows});
    // kiểm tra thắng chung cuộc
    const top=Math.max(...S.P.map(p=>p.pts));
    if(kind!=='empty'&&top>=S.target){ let w=-1; S.P.forEach((p,i)=>{ if(p.pts===top&&(w<0||p.rd>S.P[w].rd)) w=i; });
      S.winner=w; S.phase='over'; S.step='over'; S.log.unshift('🏆 '+nm(S,w)+' thắng chung cuộc với '+S.P[w].pts+' điểm!'); S.rres.final=true; ev(S,{k:'over',seat:w,rows}); }
    else { S.step='roundover'; S.nextStarter=kind==='empty'?nextSeat(S,S.turn):nextSeat(S,caller==null?S.turn:caller); S.turnAt=t; }
  }

  // ---- Kết thúc lượt (không hô dừng) ----
  function endTurn(S,t){
    const cur=S.turn;
    if(S.deck.length===0){ S.log.unshift('Chồng bài đã hết ở cuối lượt của '+nm(S,cur)+'.'); finishRound(S,'empty',null,t); return; }
    if(S.call){ S.rev[cur]=true; const i=S.call.left.indexOf(cur); if(i>=0) S.call.left.splice(i,1);
      if(!S.call.left.length){ S.turn=S.call.by; finishRound(S,'last',S.call.by,t); return; }
      S.turn=S.call.left[0]; }
    else S.turn=nextSeat(S,cur);
    S.step='draw'; S.pend=[]; S.turnAt=t; S.extra=0; ev(S,{k:'turn',seat:S.turn}); }

  function sameDuo(a,b){ if(a===b) return null; const x=tOf(a), y=tOf(b);
    if(x===y&&(x==='cua'||x==='thuyen'||x==='ca')) return x;
    if((x==='map'&&y==='boi')||(x==='boi'&&y==='map')) return 'ms'; return null; }

  // ---- Áp dụng hành động ----
  function apply(S,seat,a,t){
    if(!S||S.phase!=='play'||!a) return false;
    if(a.t==='next'){ if(S.step!=='roundover') return false; newRound(S,S.nextStarter,t); ev(S,{k:'newround'}); return true; }
    if(seat!==S.turn) return false;
    const P=S.P[seat], who=nm(S,seat);
    switch(S.step){
      case 'draw':
        if(a.t==='deck'){ if(!S.deck.length) return false;
          if(S.deck.length===1){ const id=S.deck.pop(); S.log.unshift(who+' rút lá cuối của chồng bài.'); ev(S,{k:'draw1',seat,id}); if(giveHand(S,seat,id)) return true; S.step='play'; return true; }
          S.pend=[S.deck.pop(),S.deck.pop()]; S.step='keep'; S.log.unshift(who+' rút 2 lá từ chồng bài.'); ev(S,{k:'draw2',seat,ids:S.pend.slice()}); return true; }
        if(a.t==='take'){ const p=a.pile; if(p!==0&&p!==1) return false; if(!S.disc[p].length) return false; const id=S.disc[p].pop();
          S.log.unshift(who+' lấy '+cname(id)+' từ chồng bỏ '+(p+1)+'.'); ev(S,{k:'take',seat,pile:p,id}); if(giveHand(S,seat,id)) return true; S.step='play'; return true; }
        return false;
      case 'keep':
        if(a.t==='keep'){ const i=a.i, p=a.pile; if((i!==0&&i!==1)||(p!==0&&p!==1)) return false; const keep=S.pend[i], drop=S.pend[1-i];
          S.disc[p].push(drop); S.pend=[]; S.log.unshift(who+' giữ 1 lá, bỏ '+cname(drop)+' lên chồng '+(p+1)+'.'); ev(S,{k:'keep',seat,id:keep,drop,pile:p}); if(giveHand(S,seat,keep)) return true; S.step='play'; return true; }
        return false;
      case 'play':
        if(a.t==='duo'){ if(!P.hand.includes(a.a)||!P.hand.includes(a.b)) return false; const kind=sameDuo(a.a,a.b); if(!kind) return false;
          if(kind==='ms'&&!victims(S,seat).length) return false;
          P.hand=P.hand.filter(x=>x!==a.a&&x!==a.b); P.table.push(a.a,a.b);
          ev(S,{k:'duo',seat,kind,ids:[a.a,a.b]});
          if(kind==='cua'){ S.log.unshift(who+' đánh đôi Cua: xem một chồng bỏ và lấy 1 lá.'); if(S.disc[0].length||S.disc[1].length){ S.step='crab'; } }
          else if(kind==='thuyen'){ S.log.unshift(who+' đánh đôi Thuyền: được đi thêm lượt!'); S.step='draw'; S.pend=[]; S.turnAt=t; S.extra=(S.extra||0)+1; }
          else if(kind==='ca'){ S.log.unshift(who+' đánh đôi Cá: rút thêm lá trên cùng chồng bài.'); if(S.deck.length){ const id=S.deck.pop(); ev(S,{k:'fish',seat,id}); giveHand(S,seat,id); } }
          else { S.log.unshift(who+' đánh Cá mập + Người bơi: rút ngẫu nhiên 1 lá của đối thủ.'); const v=victims(S,seat); if(v.length===1){ doSteal(S,seat,v[0]); } else { S.step='shark'; } }
          return true; }
        if(a.t==='end'){ endTurn(S,t); return true; }
        if(a.t==='stop'||a.t==='last'){ if(S.call) return false; if(myPts(S,seat)<BM_MIN_END) return false;
          S.rev[seat]=true; ev(S,{k:a.t,seat,pts:myPts(S,seat)});
          if(a.t==='stop'){ S.log.unshift('🛑 '+who+' hô DỪNG với '+myPts(S,seat)+' điểm!'); finishRound(S,'stop',seat,t); return true; }
          S.call={by:seat,left:S.seats.map((_,i)=>i).filter(i=>i!==seat).sort((x,y)=>((x-seat+S.seats.length)%S.seats.length)-((y-seat+S.seats.length)%S.seats.length))};
          S.log.unshift('⏳ '+who+' hô CƠ HỘI CUỐI với '+myPts(S,seat)+' điểm! Mỗi người đi thêm 1 lượt.');
          S.turn=S.call.left[0]; S.step='draw'; S.pend=[]; S.turnAt=t; return true; }
        return false;
      case 'crab':
        if(a.t==='crab'){ const p=a.pile; if(p!==0&&p!==1) return false; const k=S.disc[p].indexOf(a.id); if(k<0) return false; S.disc[p].splice(k,1);
          S.log.unshift(who+' lấy '+cname(a.id)+' từ chồng bỏ '+(p+1)+' nhờ đôi Cua.'); ev(S,{k:'crab',seat,pile:p,id:a.id}); S.step='play'; giveHand(S,seat,a.id); return true; }
        if(a.t==='skip'){ S.step='play'; return true; }
        return false;
      case 'shark':
        if(a.t==='steal'){ if(!victims(S,seat).includes(a.v)) return false; doSteal(S,seat,a.v); return true; }
        return false;
    }
    return false; }
  function doSteal(S,seat,v){ const h=S.P[v].hand, k=Math.floor(Math.random()*h.length), id=h.splice(k,1)[0];
    S.log.unshift(nm(S,seat)+' rút trộm 1 lá của '+nm(S,v)+'.'); ev(S,{k:'steal',seat,from:v,id}); S.step='play'; giveHand(S,seat,id); }

  function tick(S,t){ if(S.phase==='play'&&S.step==='roundover'&&t-S.turnAt>25000){ if(S.seats.every(p=>p.bot)||true){ newRound(S,S.nextStarter,t); ev(S,{k:'newround'}); return true; } } return false; }
  function whoActs(S){ if(S.phase!=='play'||S.step==='roundover') return []; return [S.turn]; }

  // ---- Máy chơi ----
  const unseenCounts=(S,seat)=>{ const seen=new Set(S.P[seat].hand.concat(S.P[seat].table)); S.P.forEach((p,i)=>{ if(i!==seat) p.table.forEach(id=>seen.add(id)); }); S.disc.forEach(d=>d.forEach(id=>seen.add(id))); S.rev.forEach((r,i)=>{ if(r&&i!==seat) S.P[i].hand.forEach(id=>seen.add(id)); });
    return CARDS.filter(c=>!seen.has(c.id)).map(c=>c.id); };
  // giá trị tiềm năng của một tập lá (cho máy Trung bình / Khó)
  function phi(ids,unseen,deep){ const s=score(ids), n=s.n; let v=s.pts + 0.28*s.bonus;
    // lá lẻ của cặp đôi có thể thành cặp
    ['cua','thuyen','ca'].forEach(k=>{ if(n[k]%2===1) v+=0.35; }); if(Math.min(n.map,n.boi)<Math.max(n.map,n.boi)&&(n.map||n.boi)) v+=0.3;
    if(deep&&unseen&&unseen.length){ // kỳ vọng thêm khi rút một lá nữa
      const cnt={}; unseen.forEach(id=>{ const k=CARDS[id].t; cnt[k]=(cnt[k]||0)+1; }); let e=0; for(const k in cnt){ const add=ids.concat([unseen.find(id=>CARDS[id].t===k)]); e+=cnt[k]/unseen.length*(score(add).pts-s.pts); } v+=0.55*e; }
    return v; }
  function pickKeep(S,seat,lvl){ const P=S.P[seat], base=allCards(P), un=lvl==='hard'?unseenCounts(S,seat):null;
    const vals=S.pend.map(id=>phi(base.concat([id]),un,lvl==='hard')); return vals[0]>=vals[1]?0:1; }
  function chooseDraw(S,seat,lvl){ const P=S.P[seat], base=allCards(P);
    if(lvl==='easy'){ const piles=[0,1].filter(p=>S.disc[p].length); if(!S.deck.length) return {t:'take',pile:piles[0]}; if(piles.length&&Math.random()<.35) return {t:'take',pile:piles[Math.floor(Math.random()*piles.length)]}; return {t:'deck'}; }
    const un=lvl==='hard'?unseenCounts(S,seat):null; const cur=phi(base,un,lvl==='hard');
    let best=null,bv=-1e9; [0,1].forEach(p=>{ if(!S.disc[p].length) return; const id=S.disc[p][S.disc[p].length-1]; const v=phi(base.concat([id]),un,lvl==='hard')-cur; if(v>bv){ bv=v; best={t:'take',pile:p}; } });
    if(!S.deck.length) return best||{t:'take',pile:S.disc[0].length?0:1};
    // kỳ vọng khi rút 2 giữ 1
    let ev2=0; const pool=un&&un.length>=2?un:CARDS.map(c=>c.id).filter(id=>!base.includes(id)); const N=lvl==='hard'?14:8;
    for(let i=0;i<N;i++){ const a=pool[Math.floor(Math.random()*pool.length)], b=pool[Math.floor(Math.random()*pool.length)]; ev2+=Math.max(phi(base.concat([a]),un,false),phi(base.concat([b]),un,false))-phi(base,un,false); }
    ev2/=N; if(lvl==='medium') ev2+=0.25; else ev2+=0.15;
    return (best&&bv>ev2+0.05)?best:{t:'deck'}; }
  function pairsOf(P){ const h=P.hand, out=[]; const used=new Set();
    for(let i=0;i<h.length;i++) for(let j=i+1;j<h.length;j++){ if(used.has(h[i])||used.has(h[j])) continue; const k=sameDuo(h[i],h[j]); if(k){ out.push({a:h[i],b:h[j],kind:k}); used.add(h[i]); used.add(h[j]); } }
    return out; }
  function botAction(S,seat,t){ if(S.phase!=='play'||S.turn!==seat) return null; const lvl=S.seats[seat].lvl||'med'; const L=lvl==='hard'?'hard':(lvl==='easy'?'easy':'medium'); const P=S.P[seat];
    switch(S.step){
      case 'draw': return chooseDraw(S,seat,L);
      case 'keep': { const i=L==='easy'?Math.floor(Math.random()*2):pickKeep(S,seat,L); const drop=S.pend[1-i]; let pile=Math.floor(Math.random()*2);
        if(L!=='easy'){ if(!S.disc[0].length) pile=0; else if(!S.disc[1].length) pile=1;
          else if(L==='hard'){ const val=id=>{ let m=0; S.P.forEach((q,j)=>{ if(j!==seat) m=Math.max(m,phi(q.table.concat([id]),null,false)-phi(q.table,null,false)); }); return m; };
            const t0=S.disc[0][S.disc[0].length-1], t1=S.disc[1][S.disc[1].length-1]; pile=val(t0)>=val(t1)?0:1; } }
        return {t:'keep',i,pile}; }
      case 'play': {
        const pr=pairsOf(P);
        if(pr.length&&(L!=='easy'||Math.random()<.6)){ const order=['thuyen','ms','cua','ca']; pr.sort((x,y)=>order.indexOf(x.kind)-order.indexOf(y.kind)); const pick=L==='easy'?pr[Math.floor(Math.random()*pr.length)]:pr.find(p=>p.kind!=='ms'||victims(S,seat).length)||null;
          if(pick&&!(pick.kind==='ms'&&!victims(S,seat).length)) return {t:'duo',a:pick.a,b:pick.b}; }
        const pts=myPts(S,seat);
        if(!S.call&&pts>=BM_MIN_END) { const d=decideEnd(S,seat,L,pts); if(d) return {t:d}; }
        return {t:'end'}; }
      case 'crab': { const cand=[]; [0,1].forEach(p=>S.disc[p].forEach(id=>cand.push({p,id}))); if(!cand.length) return {t:'skip'};
        if(L==='easy'){ const c=cand[Math.floor(Math.random()*cand.length)]; return {t:'crab',pile:c.p,id:c.id}; }
        const base=allCards(P), un=L==='hard'?unseenCounts(S,seat):null; let b=null,bv=-1e9; cand.forEach(c=>{ const v=phi(base.concat([c.id]),un,L==='hard'); if(v>bv){ bv=v; b=c; } }); return {t:'crab',pile:b.p,id:b.id}; }
      case 'shark': { const v=victims(S,seat); if(!v.length) return null; let w=v[Math.floor(Math.random()*v.length)]; if(L==='hard') w=v.slice().sort((a,b)=>S.P[b].hand.length-S.P[a].hand.length||myPts(S,b)-myPts(S,a))[0]; return {t:'steal',v:w}; }
    }
    return null; }
  // Quyết định kết thúc ván: 'stop' | 'last' | null (đi tiếp)
  function decideEnd(S,seat,L,pts){
    if(L==='easy'){ const r=Math.random(); return r<.45?'stop':r<.6?'last':null; }
    const bonus=score(allCards(S.P[seat])).bonus;
    if(L==='medium'){ if(pts>=11&&Math.random()<.5) return 'last'; return Math.random()<.8?'stop':null; }
    // Khó: ước lượng đối thủ từ lá đã lật trên bàn + số lá trên tay
    let worst=0; S.P.forEach((q,i)=>{ if(i===seat) return; const est=score(q.table).pts+q.hand.length*0.75; worst=Math.max(worst,est); });
    const margin=pts-worst; const deckLow=S.deck.length<=3;
    if(deckLow) return 'stop';
    const target=S.target, ahead=S.P[seat].pts+pts>=target; // thắng luôn nếu dừng
    if(ahead&&margin>=0) return margin>=2?'last':'stop';
    if(margin>=3.5&&pts>=8) return 'last';
    if(margin>=1.5&&pts>=8&&bonus>=4) return 'last';
    if(pts>=9||margin<1) return 'stop';
    return pts>=8?'stop':null; }
  function timeoutAction(S,seat,t){ if(S.step==='roundover') return {t:'next'}; const b=botAction(S,seat,t); if(b&&b.t==='stop'||b&&b.t==='last') return {t:'end'}; return b||{t:'end'}; }

  return {CARDS,TYPE,newGame,apply,tick,whoActs,botAction,timeoutAction,score,myPts,tablePts,victims,sameDuo,pairsOf,allCards,cname,newRound,unseenCounts};
})();
if(typeof module!=='undefined') module.exports={BM,BM_TYPES,BM_COL,BM_WIN};
