/* ===================== THƯƠNG NHÂN ĐÁ QUÝ ===================== */
// 0 lục bảo, 1 lam ngọc, 2 hồng ngọc, 3 kim cương, 4 hắc ngọc, 5 vàng (đá đa năng)
const DQ_COL=['Lục bảo','Lam ngọc','Hồng ngọc','Kim cương','Hắc ngọc','Vàng'];
const DQ_WIN=15, DQ_MAXTOK=10, DQ_MAXRES=3;
const DQ = (()=>{
  const PAT={1:[[0,[1,1,1,1]],[0,[1,2,1,1]],[0,[2,2,0,1]],[0,[0,1,3,1]],[0,[2,1]],[0,[2,0,2]],[0,[0,3]],[1,[0,0,4]]],
             2:[[1,[2,2,3]],[1,[0,3,2,3]],[2,[1,4,2]],[2,[0,5,3]],[2,[5]],[3,[0,0,6]]],
             3:[[3,[3,3,5,3]],[4,[0,7]],[4,[6,3,0,3]],[5,[7,3]]]};
  const CARDS=[]; // {id,lv,col,pts,cost[5]}
  [1,2,3].forEach(lv=>{ for(let col=0;col<5;col++) PAT[lv].forEach(([pts,amt],k)=>{ const cost=[0,0,0,0,0]; const others=[1,2,3,4].map(d=>(col+d)%5); const rot=(k+col)%4;
    amt.forEach((v,j)=>{ if(v) cost[others[(j+rot)%4]]+=v; }); CARDS.push({id:CARDS.length,lv,col,pts,cost}); }); });
  const NOBLES=[[3,3,3,0,0],[0,3,3,3,0],[0,0,3,3,3],[3,0,0,3,3],[3,3,0,0,3],[4,4,0,0,0],[0,4,4,0,0],[0,0,4,4,0],[0,0,0,4,4],[4,0,0,0,4]].map((req,id)=>({id,req,pts:3}));
  const NOBLE_NAMES=['Elizabeth I','Nữ hoàng Victoria','Catherine Đại đế','Marie Antoinette','Henry VIII','Richard Tim Sư Tử','Napoléon','Louis XIV','Charlemagne','Alexander Đại đế'];
  const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const tokCount=n=>n<=2?4:n===3?5:7;
  function newGame(seats,t){ const n=seats.length, k=tokCount(n);
    const S={seats:seats.map(s=>({name:s.name,bot:!!s.bot,lvl:s.lvl||null,peer:s.peer||null,pid:s.pid||null,color:s.color})),
      bank:[k,k,k,k,k,5], decks:{1:[],2:[],3:[]}, board:{1:[],2:[],3:[]}, nobles:shuffle(NOBLES.map(x=>x.id)).slice(0,n+1),
      P:seats.map(()=>({tok:[0,0,0,0,0,0], bonus:[0,0,0,0,0], cards:[], res:[], nobles:[], pts:0})),
      turn:0, first:0, step:'main', turnAt:t, phase:'play', last:false, log:[], evN:0, ev:null, winner:-1, round:1,
      st:seats.map(()=>({turns:0,take:[0,0,0,0,0,0],takeAct:0,take2:0,ret:[0,0,0,0,0,0],res:0,resDeck:0,buy:[0,0,0,0],buyRes:0,spent:[0,0,0,0,0,0],nob:0,cardPts:0,first15:0,tt:0})), pt:[seats.map(()=>0)], t0:t, tEnd:0, lastAt:t};
    S.first=S.turn=Math.floor(Math.random()*n); CARDS.forEach(c=>S.decks[c.lv].push(c.id)); [1,2,3].forEach(lv=>{ shuffle(S.decks[lv]); for(let i=0;i<4;i++) S.board[lv].push(S.decks[lv].pop()); });
    S.log.unshift('Bắt đầu! Ai đạt '+DQ_WIN+' điểm uy tín trước sẽ kết thúc vòng chơi.'); return S; }
  const tot=a=>a.reduce((s,x)=>s+x,0);
  function payPlan(P,card){ const need=[0,0,0,0,0]; let gold=0; for(let c=0;c<5;c++){ const n=Math.max(0,card.cost[c]-P.bonus[c]); const use=Math.min(n,P.tok[c]); need[c]=use; gold+=n-use; } return gold<=P.tok[5]?{pay:need,gold}:null; }
  function ev(S,o){ if(S.log.length>160) S.log.length=160; S.evN++; S.ev=Object.assign({n:S.evN},o); }
  function refill(S,lv,idx){ const d=S.decks[lv]; if(d.length) S.board[lv][idx]=d.pop(); else S.board[lv][idx]=null; }
  function apply(S,seat,a,t){
    if (!a||S.phase!=='play'||seat!==S.turn) return false; const P=S.P[seat], name=S.seats[seat].name;
    if (S.step==='discard'){ if(a.t!=='ret') return false; const c=a.c; if(!(c>=0&&c<6)||!P.tok[c]) return false; P.tok[c]--; S.bank[c]++; if(S.st) S.st[seat].ret[c]++; S.log.unshift(S.seats[seat].name+' trả 1 '+DQ_COL[c]+'.'); ev(S,{k:'ret',seat,c});
      if (tot(P.tok)<=DQ_MAXTOK) endTurn(S,t); return true; }
    if (a.t==='take'){ const g=a.g||[]; if(!g.length||g.some(c=>!(c>=0&&c<5))) return false;
      if (g.length===2 && g[0]===g[1]){ if(S.bank[g[0]]<4) return false; }
      else { if(new Set(g).size!==g.length||g.length>3||g.some(c=>S.bank[c]<1)) return false;
        const avail=[0,1,2,3,4].filter(c=>S.bank[c]>0).length; if(g.length<Math.min(3,avail)) return false; }
      g.forEach(c=>{ S.bank[c]--; P.tok[c]++; }); if(S.st){ const Q=S.st[seat]; Q.takeAct++; if(g.length===2&&g[0]===g[1]) Q.take2++; g.forEach(c=>Q.take[c]++); } S.log.unshift(name+' lấy '+g.map(c=>DQ_COL[c]).join(', ')+'.'); ev(S,{k:'take',seat,g}); return after(S,seat,t); }
    if (a.t==='reserve'){ if(P.res.length>=DQ_MAXRES) return false; let id;
      if (a.deck){ const d=S.decks[a.deck]; if(!d||!d.length) return false; id=d.pop(); }
      else { const lv=a.lv, i=a.i; if(!S.board[lv]||S.board[lv][i]==null) return false; id=S.board[lv][i]; refill(S,lv,i); }
      P.res.push(id); let g=0; if(S.bank[5]>0){ S.bank[5]--; P.tok[5]++; g=1; } if(S.st){ S.st[seat].res++; if(a.deck) S.st[seat].resDeck++; if(g) S.st[seat].take[5]++; }
      S.log.unshift(name+' giữ chỗ 1 thẻ cấp '+CARDS[id].lv+(g?' và nhận 1 Vàng':'')+'.'); ev(S,{k:'reserve',seat,gold:!!g,id:a.deck?null:id,lv:a.lv,i:a.i,deck:a.deck||0}); return after(S,seat,t); }
    if (a.t==='buy'){ let id, from;
      if (a.res!=null){ id=P.res[a.res]; if(id==null) return false; from='res'; } else { if(!S.board[a.lv]||S.board[a.lv][a.i]==null) return false; id=S.board[a.lv][a.i]; from='board'; }
      const card=CARDS[id], plan=payPlan(P,card); if(!plan) return false;
      for(let c=0;c<5;c++){ P.tok[c]-=plan.pay[c]; S.bank[c]+=plan.pay[c]; } P.tok[5]-=plan.gold; S.bank[5]+=plan.gold;
      if (from==='res') P.res.splice(a.res,1); else refill(S,a.lv,a.i);
      P.cards.push(id); P.bonus[card.col]++; P.pts+=card.pts; if(S.st){ const Q=S.st[seat]; Q.buy[card.lv]++; if(from==='res') Q.buyRes++; for(let c=0;c<5;c++) Q.spent[c]+=plan.pay[c]; Q.spent[5]+=plan.gold; Q.cardPts+=card.pts; }
      S.log.unshift(name+' mua thẻ cấp '+['','I','II','III'][card.lv]+' '+DQ_COL[card.col]+(card.pts?' — ghi +'+card.pts+' điểm (tổng '+P.pts+')':'')+'.'); ev(S,{k:'buy',seat,id,lv:a.lv,i:a.i,res:a.res}); return after(S,seat,t); }
    return false; }
  function after(S,seat,t){ const P=S.P[seat];
    if (tot(P.tok)>DQ_MAXTOK){ S.step='discard'; S.turnAt=t; return true; }
    endTurn(S,t); return true; }
  function endTurn(S,t){ const seat=S.turn, P=S.P[seat], n=S.seats.length;
    const ok=S.nobles.filter(id=>NOBLES[id].req.every((r,c)=>P.bonus[c]>=r));
    if (ok.length){ const id=ok[0]; S.nobles=S.nobles.filter(x=>x!==id); P.nobles.push(id); P.pts+=3; if(S.st) S.st[seat].nob++; S.log.unshift(NOBLE_NAMES[id]+' ghé thăm '+S.seats[seat].name+' (+3 điểm).'); ev(S,{k:'noble',seat,id,from:S.nobles.length}); }
    if (P.pts>=DQ_WIN && !S.last){ S.last=true; S.lastBy=seat; S.log.unshift('⚠️ VÒNG CUỐI: '+S.seats[seat].name+' đạt '+P.pts+' điểm — những người còn lại đi nốt vòng này!'); ev(S,{k:'last',seat,pts:P.pts}); }
    S.step='main'; if(S.st){ const Q=S.st[seat]; Q.turns++; Q.tt+=Math.max(0,t-(S.lastAt||t)); if(!Q.first15&&P.pts>=DQ_WIN) Q.first15=S.round; } S.lastAt=t;
    if (S.pt && (seat+1)%n===(S.first||0)) S.pt.push(S.P.map(q=>q.pts));
    if ((S.last || S.round>=60) && (seat+1)%n===(S.first||0)){ finish(S,t); return; }
    S.turn=(seat+1)%n; if(S.turn===(S.first||0)) S.round++; S.turnAt=t;
    if (!canDoAnything(S,S.turn)){ S.log.unshift(S.seats[S.turn].name+' không còn nước đi, bỏ lượt.'); endTurn(S,t); } }
  function canDoAnything(S,seat){ const P=S.P[seat]; if(P.res.length<DQ_MAXRES) return true; if([0,1,2,3,4].some(c=>S.bank[c]>0)) return true;
    return P.res.some(id=>payPlan(P,CARDS[id])) || [1,2,3].some(lv=>S.board[lv].some(id=>id!=null&&payPlan(P,CARDS[id]))); }
  function finish(S,t){ const order=S.seats.map((_,i)=>i).sort((a,b)=>S.P[b].pts-S.P[a].pts||S.P[a].cards.length-S.P[b].cards.length);
    S.winner=order[0]; S.order=order; S.phase='over'; S.tEnd=t; if(S.pt){ const last=S.pt[S.pt.length-1], cur=S.P.map(q=>q.pts); if(!last||last.join()!==cur.join()) S.pt.push(cur); } S.turn=-1; S.log.unshift(S.seats[S.winner].name+' thắng với '+S.P[S.winner].pts+' điểm uy tín!'); ev(S,{k:'over'}); }
  function tick(){ return false; }
  function whoActs(S){ return S.phase==='play'?[S.turn]:[]; }
  // ---------- bot ----------
  function shortfall(P,card){ let s=0; for(let c=0;c<5;c++) s+=Math.max(0,card.cost[c]-P.bonus[c]-P.tok[c]); return Math.max(0,s-P.tok[5]); }
  function value(S,P,card){ let v=card.pts*3+1; S.nobles.forEach(id=>{ const r=NOBLES[id].req[card.col]; if(r>P.bonus[card.col]) v+=1.2; }); const tc=tot(card.cost.map((x,c)=>Math.max(0,x-P.bonus[c]))); return v/(1+tc*0.45); }
  const rnd=a=>a[Math.floor(Math.random()*a.length)];
  function retLeast(P){ const need=[0,0,0,0,0]; P.res.forEach(id=>CARDS[id].cost.forEach((x,c)=>need[c]+=x)); let best=-1,bv=1e9; for(let c=0;c<5;c++) if(P.tok[c]){ const v=need[c]-P.tok[c]; if(v<bv){bv=v;best=c;} } return {t:'ret',c:best>=0?best:5}; }
  function botEasy(S,seat){ const P=S.P[seat];
    if (S.step==='discard'){ const has=[0,1,2,3,4,5].filter(c=>P.tok[c]); return {t:'ret',c:rnd(has)}; }
    const opts=[]; [1,2,3].forEach(lv=>S.board[lv].forEach((id,i)=>{ if(id!=null) opts.push({id,lv,i}); })); P.res.forEach((id,r)=>opts.push({id,res:r}));
    const buys=opts.filter(o=>payPlan(P,CARDS[o.id]));
    if (buys.length && Math.random()<0.7){ const o=rnd(buys); return o.res!=null?{t:'buy',res:o.res}:{t:'buy',lv:o.lv,i:o.i}; }
    const avail=[0,1,2,3,4].filter(c=>S.bank[c]>0).sort(()=>Math.random()-.5);
    if (avail.length && Math.random()<0.85){ const two=avail.filter(c=>S.bank[c]>=4); if(two.length&&Math.random()<0.25){ const c=rnd(two); return {t:'take',g:[c,c]}; } return {t:'take',g:avail.slice(0,3)}; }
    const board=opts.filter(o=>o.res==null); if (P.res.length<DQ_MAXRES && board.length){ const o=rnd(board); return {t:'reserve',lv:o.lv,i:o.i}; }
    if (avail.length) return {t:'take',g:avail.slice(0,3)}; if (buys.length){ const o=buys[0]; return o.res!=null?{t:'buy',res:o.res}:{t:'buy',lv:o.lv,i:o.i}; }
    if (P.res.length<DQ_MAXRES) for(const lv of [1,2,3]) if(S.decks[lv].length) return {t:'reserve',deck:lv};
    return null; }
  function botMed(S,seat){ const P=S.P[seat];
    if (S.step==='discard') return retLeast(P);
    const opts=[]; [1,2,3].forEach(lv=>S.board[lv].forEach((id,i)=>{ if(id!=null) opts.push({id,lv,i}); })); P.res.forEach((id,r)=>opts.push({id,res:r}));
    const simple=c=>(c.pts*2+1)/(1+tot(c.cost.map((x,k)=>Math.max(0,x-P.bonus[k])))*0.5);
    const buys=opts.filter(o=>payPlan(P,CARDS[o.id])).sort((a,b)=>simple(CARDS[b.id])-simple(CARDS[a.id]));
    if (buys.length && Math.random()<0.8){ const o=buys[Math.random()<0.7?0:Math.floor(Math.random()*buys.length)]; return o.res!=null?{t:'buy',res:o.res}:{t:'buy',lv:o.lv,i:o.i}; }
    // nhắm 1 lá rẻ/đẹp, lấy đá còn thiếu, đôi khi lấy ngẫu nhiên
    const tg=opts.slice().sort((a,b)=>simple(CARDS[b.id])/(1+shortfall(P,CARDS[b.id])*.6)-simple(CARDS[a.id])/(1+shortfall(P,CARDS[a.id])*.6))[Math.random()<0.6?0:1];
    const want=[0,0,0,0,0]; if(tg){ const c=CARDS[tg.id]; for(let j=0;j<5;j++) want[j]=Math.max(0,c.cost[j]-P.bonus[j]-P.tok[j]); }
    const room=DQ_MAXTOK-tot(P.tok);
    const avail=[0,1,2,3,4].filter(c=>S.bank[c]>0).sort((a,b)=>(want[b]-want[a])+(Math.random()-.5)*1.5);
    if (avail.length && room>=1){ if(want[avail[0]]>=2&&S.bank[avail[0]]>=4&&Math.random()<0.3) return {t:'take',g:[avail[0],avail[0]]}; return {t:'take',g:avail.slice(0,3)}; }
    if (P.res.length<DQ_MAXRES && tg && tg.res==null && Math.random()<0.6) return {t:'reserve',lv:tg.lv,i:tg.i};
    if (buys.length){ const o=buys[0]; return o.res!=null?{t:'buy',res:o.res}:{t:'buy',lv:o.lv,i:o.i}; }
    if (avail.length) return {t:'take',g:avail.slice(0,3)};
    if (P.res.length<DQ_MAXRES) for(const lv of [1,2,3]) if(S.decks[lv].length) return {t:'reserve',deck:lv};
    return null; }
  function botAction(S,seat,t){ if(t-S.turnAt<700) return null; const P=S.P[seat]; const L=(S.seats[seat]&&S.seats[seat].lvl)||'hard';
    if (L==='easy'){ const a=botEasy(S,seat); if(a) return a; }
    else if (L==='med'){ const a=botMed(S,seat); if(a) return a; }
    if (S.step==='discard'){ // trả lại đá ít cần nhất
      const need=[0,0,0,0,0]; P.res.forEach(id=>CARDS[id].cost.forEach((x,c)=>need[c]+=x)); let best=-1,bv=1e9; for(let c=0;c<5;c++) if(P.tok[c]){ const v=need[c]-P.tok[c]; if(v<bv){bv=v;best=c;} } return {t:'ret',c:best>=0?best:5}; }
    const opts=[]; [1,2,3].forEach(lv=>S.board[lv].forEach((id,i)=>{ if(id!=null) opts.push({id,lv,i}); })); P.res.forEach((id,r)=>opts.push({id,res:r}));
    const buys=opts.filter(o=>payPlan(P,CARDS[o.id])).map(o=>({o,v:value(S,P,CARDS[o.id])+(o.res!=null?0.6:0)})).sort((a,b)=>b.v-a.v);
    const scored=opts.map(o=>({o,v:value(S,P,CARDS[o.id])/(1+shortfall(P,CARDS[o.id])*0.6)})).sort((a,b)=>b.v-a.v);
    const target=scored[0] && CARDS[scored[0].o.id];
    const room0=DQ_MAXTOK-tot(P.tok);
    if (buys.length && (room0<3 || !target || buys[0].v>=value(S,P,target)*0.55 || CARDS[buys[0].o.id].pts>0)){ const o=buys[0].o; return o.res!=null?{t:'buy',res:o.res}:{t:'buy',lv:o.lv,i:o.i}; }
    // lấy đá theo mục tiêu
    const want=[0,0,0,0,0]; scored.slice(0,3).forEach((s,k)=>{ const c=CARDS[s.o.id]; for(let j=0;j<5;j++) want[j]+=Math.max(0,c.cost[j]-P.bonus[j]-P.tok[j])*(k===0?3:1); });
    const room=DQ_MAXTOK-tot(P.tok);
    const avail=[0,1,2,3,4].filter(c=>S.bank[c]>0).sort((a,b)=>want[b]-want[a]||S.bank[b]-S.bank[a]);
    const top=avail[0];
    if (top!=null && want[top]>=2 && S.bank[top]>=4 && (avail.filter(c=>want[c]>0).length<2 || Math.random()<0.4) && room>=2) return {t:'take',g:[top,top]};
    if (avail.length && room>=1 && Math.max(...want)>0){ return {t:'take',g:avail.slice(0,3)}; }
    if (P.res.length<DQ_MAXRES && target && scored[0].o.res==null) return {t:'reserve',lv:scored[0].o.lv,i:scored[0].o.i};
    if (avail.length) return {t:'take',g:avail.slice(0,3)};
    if (buys.length){ const o=buys[0].o; return o.res!=null?{t:'buy',res:o.res}:{t:'buy',lv:o.lv,i:o.i}; }
    if (P.res.length<DQ_MAXRES) for(const lv of [1,2,3]) if(S.decks[lv].length) return {t:'reserve',deck:lv};
    return null; }
  function timeoutAction(S,seat,t){ return botAction(S,seat,(t||0)+1e9); }
  return {CARDS,NOBLES,NOBLE_NAMES,newGame,apply,tick,whoActs,botAction,timeoutAction,payPlan,tot};
})();
if (typeof module!=='undefined') module.exports=DQ;
