/* ===================== THUNG LŨNG HÒA SẮC — LUẬT CHƠI + MÁY ===================== */
// Mỗi người có một thung lũng 23 ô lục giác. Lấy 3 mảnh đất từ chợ, đặt vào thung lũng,
// rồi chăm sóc các con vật: đặt vật vào đúng chỗ để ghi điểm.
const TL_TER=['rung','nui','dong','nha','ho'];
const TL_TN={rung:'Rừng',nui:'Núi',dong:'Đồng',nha:'Nhà',ho:'Hồ'};
const TL_ANIMALS=[
 {id:0,k:'ech',name:'Ếch',on:'ho',h:1,adj:{rung:1},s:[2,4,7]},
 {id:1,k:'vit',name:'Vịt',on:'ho',h:1,adj:{ho:2},s:[3,6,10]},
 {id:2,k:'rua',name:'Rùa',on:'ho',h:1,adj:{dong:1,rung:1},s:[3,6,10]},
 {id:3,k:'co',name:'Cò',on:'dong',h:1,adj:{ho:1},s:[2,4,7]},
 {id:4,k:'tho',name:'Thỏ',on:'dong',h:1,adj:{rung:2},s:[3,6,10]},
 {id:5,k:'cuu',name:'Cừu',on:'dong',h:1,adj:{nui:1,dong:1},s:[3,6,10]},
 {id:6,k:'nai',name:'Nai',on:'rung',h:2,adj:{rung:1},s:[3,6,10]},
 {id:7,k:'cu',name:'Cú',on:'rung',h:3,adj:{},s:[4,8,13]},
 {id:8,k:'soc',name:'Sóc',on:'rung',h:1,adj:{rung:2},s:[2,4,7]},
 {id:9,k:'gau',name:'Gấu',on:'rung',h:1,adj:{nui:1,ho:1},s:[3,6,10]},
 {id:10,k:'de',name:'Dê núi',on:'nui',h:2,adj:{},s:[3,6,10]},
 {id:11,k:'bang',name:'Đại bàng',on:'nui',h:3,adj:{},s:[4,8,13]},
 {id:12,k:'cao',name:'Cáo',on:'rung',h:1,adj:{dong:1,nha:1},s:[3,6,10]},
 {id:13,k:'meo',name:'Mèo',on:'nha',h:1,adj:{dong:1},s:[2,4,7]}];
const TL=(()=>{
  const KEYS=[]; [[0,4],[0,3],[-1,3],[-1,2],[-2,2]].forEach((rg,q)=>{ for(let r=(q===0?0:rg[0]);r<=rg[1];r++) KEYS.push(q+','+r); });
  const DIR=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]], NB={};
  KEYS.forEach(k=>{ const [q,r]=k.split(',').map(Number); NB[k]=DIR.map(d=>(q+d[0])+','+(r+d[1])).filter(x=>KEYS.indexOf(x)>=0); });
  const TREE=[0,1,3,7], LAKE=[0,0,2,5,8,11,15], ST={rung:1,nui:1}, A={}; TL_ANIMALS.forEach(a=>A[a.id]=a);
  const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const emptyBoard=()=>{ const b={}; KEYS.forEach(k=>b[k]=null); return b; };
  const canPlace=(B,k,t)=>{ const c=B[k]; if(!c) return true; if(c.cube!=null) return false; return !!ST[t]&&c.t===t&&c.h<3; };
  const legal=(B,t)=>KEYS.filter(k=>canPlace(B,k,t));
  const emptyCount=B=>KEYS.filter(k=>!B[k]).length;
  // ---- điểm địa hình ----
  function terrain(B){ const o={rung:0,nui:0,dong:0,nha:0,ho:0}, seen={};
    KEYS.forEach(k=>{ const c=B[k]; if(!c) return;
      if(c.t==='rung') o.rung+=TREE[c.h];
      else if(c.t==='nui'){ if(NB[k].some(x=>B[x]&&B[x].t==='nui')) o.nui+=TREE[c.h]; }
      else if(c.t==='nha'){ const s={}; NB[k].forEach(x=>{ if(B[x]) s[B[x].t]=1; }); if(Object.keys(s).length>=3) o.nha+=5; } });
    let best=0; KEYS.forEach(k=>{ const c=B[k]; if(!c||seen[k]) return; if(c.t!=='dong'&&c.t!=='ho') return; const t=c.t; let n=0; const st=[k]; seen[k]=1;
      while(st.length){ const x=st.pop(); n++; NB[x].forEach(y=>{ if(!seen[y]&&B[y]&&B[y].t===t){ seen[y]=1; st.push(y); } }); }
      if(t==='dong'&&n>=2) o.dong+=5; if(t==='ho') best=Math.max(best,n); });
    o.ho=LAKE[Math.min(6,best)]; return o; }
  const tsum=o=>o.rung+o.nui+o.dong+o.nha+o.ho;
  // ---- con vật ----
  function topAt(B,k){ return B[k]?B[k].t:null; }
  function okSpot(B,k,a){ const c=B[k]; if(!c||c.cube!=null||c.t!==a.on||c.h<a.h) return false;
    for(const t in a.adj){ let n=0; NB[k].forEach(x=>{ if(B[x]&&B[x].t===t) n++; }); if(n<a.adj[t]) return false; } return true; }
  const spots=(P,id)=>{ const a=A[id]; if((P.cubes[id]||0)>=a.s.length) return []; return KEYS.filter(k=>okSpot(P.board,k,a)); };
  const animalPts=P=>P.hand.reduce((s,id)=>{ const a=A[id],n=P.cubes[id]||0; for(let i=0;i<n;i++) s+=a.s[i]; return s; },0);
  function score(P){ const t=terrain(P.board), an=animalPts(P); return {t,terrain:tsum(t),animals:an,total:tsum(t)+an}; }
  // ---- khởi tạo ----
  function newGame(seats,t){
    const bag=[]; TL_TER.forEach(x=>{ for(let i=0;i<20;i++) bag.push(x); }); shuffle(bag);
    const S={seats:seats.map(s=>({name:s.name,bot:!!s.bot,lvl:s.lvl||null,peer:s.peer||null,pid:s.pid||null,color:s.color})),
      P:seats.map(()=>({board:emptyBoard(),hand:[],cubes:{}})), bag, slots:[[],[],[],[]], row:[], adeck:shuffle(TL_ANIMALS.map(a=>a.id)),
      turn:0, first:0, step:'take', tray:[], took:false, phase:'play', winner:-1, last:false, round:1, log:[], turnAt:t, turns:0};
    S.first=S.turn=Math.floor(Math.random()*seats.length);
    for(let i=0;i<4;i++) refill(S,i); while(S.row.length<4&&S.adeck.length) S.row.push(S.adeck.pop());
    S.log.unshift('Bắt đầu! '+S.seats[S.turn].name+' đi trước.'); return S; }
  function refill(S,i){ while(S.slots[i].length<3&&S.bag.length) S.slots[i].push(S.bag.pop()); }
  const nm=(S,i)=>S.seats[i].name;
  const canCard=(S,P)=>!S.took&&P.hand.length<4&&S.row.length>0;
  const anyCube=P=>P.hand.some(id=>spots(P,id).length>0);
  // ---- hết lượt ----
  function endTurn(S,t){ const P=S.P[S.turn];
    if(!S.last&&(emptyCount(P.board)<=1||S.bag.length<3)) { S.last=true; S.log.unshift('Thung lũng của '+nm(S,S.turn)+' sắp kín — đây là vòng cuối!'); }
    const n=S.seats.length, nxt=(S.turn+1)%n;
    if(S.last&&nxt===S.first){ finish(S); return; }
    S.turn=nxt; S.step='take'; S.tray=[]; S.took=false; S.turnAt=t; S.turns++; if(nxt===S.first) S.round++; }
  function finish(S){ let w=0,b=-1; S.P.forEach((P,i)=>{ const s=score(P).total; if(s>b){ b=s; w=i; } });
    S.phase='over'; S.winner=w; S.step='over'; S.log.unshift('🏆 '+nm(S,w)+' thắng với '+b+' điểm!'); }
  function afterPlace(S,t){ const P=S.P[S.turn]; if(S.tray.length) { const left=S.tray.filter(x=>legal(P.board,x).length); if(!left.length){ S.tray=[]; } else return; }
    S.step='animal'; if(!canCard(S,P)&&!anyCube(P)) endTurn(S,t); }
  function afterAnimal(S,t){ const P=S.P[S.turn]; if(!canCard(S,P)&&!anyCube(P)) endTurn(S,t); }
  // ---- hành động ----
  function apply(S,seat,a,t){
    if(!S||S.phase!=='play'||!a||seat!==S.turn) return false; const P=S.P[seat], who=nm(S,seat);
    switch(a.t){
      case 'take': if(S.step!=='take') return false; { const i=a.slot; if(!(i>=0&&i<4)||!S.slots[i].length) return false;
        S.tray=S.slots[i].slice(); S.slots[i]=[]; refill(S,i); S.step='place'; S.log.unshift(who+' lấy '+S.tray.map(x=>TL_TN[x]).join(', ')+'.'); afterPlaceCheck(S,t); return true; }
      case 'place': if(S.step!=='place') return false; { const i=a.i, k=a.hex; if(!(i>=0&&i<S.tray.length)||!(k in P.board)) return false; const ty=S.tray[i]; if(!canPlace(P.board,k,ty)) return false;
        const c=P.board[k]; if(c) c.h++; else P.board[k]={t:ty,h:1,cube:null}; S.tray.splice(i,1); afterPlace(S,t); return true; }
      case 'card': if(S.step!=='animal'||!canCard(S,P)) return false; { const j=S.row.indexOf(a.id); if(j<0) return false; S.row.splice(j,1); P.hand.push(a.id); S.took=true;
        if(S.adeck.length) S.row.push(S.adeck.pop()); S.log.unshift(who+' nhận thẻ '+A[a.id].name+'.'); afterAnimal(S,t); return true; }
      case 'cube': if(S.step!=='animal'||P.hand.indexOf(a.id)<0) return false; { if(spots(P,a.id).indexOf(a.hex)<0) return false; P.board[a.hex].cube=a.id; P.cubes[a.id]=(P.cubes[a.id]||0)+1;
        const ad=A[a.id], n=P.cubes[a.id]; S.log.unshift(who+' đặt '+ad.name+' (+'+ad.s[n-1]+').'); afterAnimal(S,t); return true; }
      case 'end': if(S.step!=='animal') return false; endTurn(S,t); return true; }
    return false; }
  function afterPlaceCheck(S,t){ const P=S.P[S.turn]; if(!S.tray.some(x=>legal(P.board,x).length)){ S.tray=[]; afterPlace(S,t); } }
  const whoActs=S=>S.phase==='play'?[S.turn]:[];
  const tick=()=>false;
  // ---- máy chơi ----
  function evalBoard(P){ const sc=score(P); let pot=0; P.hand.forEach(id=>{ const a=A[id]; if((P.cubes[id]||0)>=a.s.length) return; if(spots(P,id).length) pot+=3; else pot+=KEYS.filter(k=>P.board[k]&&P.board[k].t===a.on&&!P.board[k].cube).length*0.3; });
    return sc.total+pot; }
  function placeBest(P,tray,lvl){ let best=null,bv=-1e9; const E=Math.random()<(lvl==='easy'?0.45:lvl==='hard'?0:0.12);
    tray.forEach((ty,i)=>{ legal(P.board,ty).forEach(k=>{ let v; if(E) v=Math.random(); else { const B=P.board, old=B[k], c=old?{t:old.t,h:old.h,cube:old.cube}:null; B[k]=old?{t:old.t,h:old.h+1,cube:old.cube}:{t:ty,h:1,cube:null}; v=evalBoard(P)+(old?0.2:0.1); B[k]=old; }
      if(v>bv){ bv=v; best={i,hex:k}; } }); }); return best; }
  function botAction(S,seat,t){ if(S.phase!=='play'||S.turn!==seat) return null; const P=S.P[seat], lvl=S.seats[seat].lvl||'med';
    if(S.step==='take'){ let bs=0,bv=-1e9; for(let i=0;i<4;i++){ if(S.slots[i].length<1) continue; const sim=JSON.parse(JSON.stringify(P)); let tray=S.slots[i].slice(), v=0;
        while(tray.length){ const b=placeBest(sim,tray,lvl==='easy'?'easy':'hard'); if(!b) break; const ty=tray[b.i], c=sim.board[b.hex]; if(c) c.h++; else sim.board[b.hex]={t:ty,h:1,cube:null}; tray.splice(b.i,1); }
        v=evalBoard(sim)+Math.random()*(lvl==='easy'?6:0.5); if(v>bv){ bv=v; bs=i; } } return {t:'take',slot:bs}; }
    if(S.step==='place'){ const b=placeBest(P,S.tray,lvl); return b?{t:'place',i:b.i,hex:b.hex}:{t:'end'}; }
    if(S.step==='animal'){ for(const id of P.hand){ const sp=spots(P,id); if(sp.length){ return {t:'cube',id,hex:sp[Math.floor(Math.random()*sp.length)]}; } }
      if(canCard(S,P)){ let bid=S.row[0],bv=-1; S.row.forEach(id=>{ const a=A[id]; const v=KEYS.filter(k=>P.board[k]&&P.board[k].t===a.on).length+(Object.keys(a.adj).length?0:1)+Math.random(); if(v>bv){ bv=v; bid=id; } }); return {t:'card',id:bid}; }
      return {t:'end'}; }
    return null; }
  function timeoutAction(S,seat,t){ return botAction(S,seat,t)||{t:'end'}; }
  return {KEYS,NB,A,legal,canPlace,spots,score,terrain,newGame,apply,whoActs,tick,botAction,timeoutAction,canCard,anyCube,emptyCount,okSpot,TREE,LAKE};
})();
