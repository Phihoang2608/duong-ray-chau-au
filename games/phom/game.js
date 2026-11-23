/* ===================== PHỎM (TÁ LẢ) ===================== */
const PH_UNIT=20, PH_START=1000, PH_RES_MS=9000, PH_ROUNDS=4;
const PH = {
  num(c){ const r=c>>2; return r===12?1:r+2; },          // A=1, 2..10, J=11, Q=12, K=13
  pts(c){ return PH.num(c); },
  sortKey(c){ return PH.num(c)*4+(c&3); },
  // mọi phỏm có thể tạo từ bộ bài
  melds(cards){
    const out=[]; const byNum={}; cards.forEach(c=>{ (byNum[PH.num(c)]=byNum[PH.num(c)]||[]).push(c); });
    Object.values(byNum).forEach(g=>{ if(g.length>=3){ if(g.length===3) out.push(g.slice()); else { out.push(g.slice()); for(let i=0;i<4;i++) out.push(g.filter((_,k)=>k!==i)); } } });
    for (let s=0;s<4;s++){ const has={}; cards.filter(c=>(c&3)===s).forEach(c=>has[PH.num(c)]=c);
      for (let a=1;a<=11;a++){ if(!(a in has)) continue; const run=[has[a]]; for(let b=a+1;b<=13&&(b in has);b++){ run.push(has[b]); if(run.length>=3) out.push(run.slice()); } } }
    return out;
  },
  // chọn phỏm rời nhau, mỗi phỏm chứa tối đa 1 lá ăn, mọi lá ăn phải nằm trong phỏm; tối thiểu điểm rác
  solve(cards, eaten){
    eaten=eaten||[]; const all=PH.melds(cards).filter(m=>m.filter(c=>eaten.includes(c)).length<=1);
    let best=null;
    const total=cards.reduce((s,c)=>s+PH.pts(c),0);
    function dfs(i, used, chosen, meldPts){
      if (eaten.every(e=>used.has(e))){ const dead=total-meldPts, cnt=cards.length-used.size;
        if(!best || dead<best.dead || (dead===best.dead && cnt<best.cnt)) best={melds:chosen.map(m=>m.slice()), dead, cnt}; }
      for (let k=i;k<all.length;k++){ const m=all[k]; if(m.some(c=>used.has(c))) continue;
        m.forEach(c=>used.add(c)); chosen.push(m); dfs(k+1, used, chosen, meldPts+m.reduce((s,c)=>s+PH.pts(c),0)); chosen.pop(); m.forEach(c=>used.delete(c)); }
    }
    dfs(0,new Set(),[],0);
    if (!best) return null;
    const inM=new Set(best.melds.flat()); best.rest=cards.filter(c=>!inM.has(c)).sort((a,b)=>PH.sortKey(a)-PH.sortKey(b)); return best;
  },
  canEat(hand, eaten, c){ return !!PH.solve(hand.concat([c]), eaten.concat([c])); },
  isU(hand, eaten){ // 10 lá: bỏ 1 lá thì 9 lá còn lại đều nằm trong phỏm
    for (const x of hand){ if (eaten.includes(x)) continue; const rest=hand.filter(c=>c!==x); const s=PH.solve(rest,eaten); if (s && s.cnt===0) return x; } return null; },
  newGame(seats,t,prev){
    const S={seats:seats.map(s=>({name:s.name,bot:!!s.bot,peer:s.peer||null,pid:s.pid||null,color:s.color})), coins:prev?prev.coins.slice():seats.map(()=>PH_START), round:prev?prev.round:0, start:prev?prev.nextStart:0, log:prev?prev.log.slice(0,8):[]};
    PH.deal(S,t); return S; },
  deal(S,t){
    const n=S.seats.length; S.round++; S.coins=S.coins.map(c=>c<=0?PH_START:c);
    S.deck=Cards.deck(); S.hands=S.seats.map((_,i)=>{ const h=[]; for(let k=0;k<(i===S.start?10:9);k++) h.push(S.deck.pop()); return h; });
    S.eaten=S.seats.map(()=>[]); S.discards=S.seats.map(()=>[]); S.dc=S.seats.map(()=>0); S.turn=S.start; S.step='discard'; S.phase='play'; S.res=null; S.turnAt=t; S.lastEv=null; S.evN=(S.evN||0)+1;
    S.log.unshift('Ván '+S.round+': '+S.seats[S.start].name+' đánh trước (10 lá).');
    const u=PH.isU(S.hands[S.start],[]); if(u!=null) PH.finishU(S,S.start,t,'ù tròn');
  },
  prevSeat(S,i){ const n=S.seats.length; return (i-1+n)%n; },
  topDiscard(S){ const p=S.discards[PH.prevSeat(S,S.turn)]; return p.length?p[p.length-1]:null; },
  ev(S,o){ S.evN++; S.lastEv=Object.assign({n:S.evN},o); },
  apply(S,seat,a,t){
    if (S.phase!=='play'||seat!==S.turn) return false;
    const n=S.seats.length, name=S.seats[seat].name, H=S.hands[seat];
    if (a.t==='draw'){ if(S.step!=='draw'||!S.deck.length) return false; const c=S.deck.pop(); H.push(c); S.step='discard'; S.turnAt=t; PH.ev(S,{k:'draw',seat});
      const u=PH.isU(H,S.eaten[seat]); if(u!=null){ PH.finishU(S,seat,t,'ù'); } return true; }
    if (a.t==='eat'){ if(S.step!=='draw') return false; const from=PH.prevSeat(S,seat), c=PH.topDiscard(S); if(c==null||!PH.canEat(H,S.eaten[seat],c)) return false;
      S.discards[from].pop(); H.push(c); S.eaten[seat].push(c);
      const last = S.dc[seat]===PH_ROUNDS-1; const pay=PH_UNIT*(last?4:1); PH.pay(S,from,seat,pay);
      S.log.unshift(name+' ăn '+Cards.name(c)+' của '+S.seats[from].name+(last?' (ăn chốt)':'')+' · +'+pay+' xu.'); S.step='discard'; S.turnAt=t; PH.ev(S,{k:'eat',seat,from,c,pay});
      const u=PH.isU(H,S.eaten[seat]); if(u!=null){ PH.finishU(S,seat,t,'ù'); } return true; }
    if (a.t==='discard'){ if(S.step!=='discard') return false; const c=a.c; const i=H.indexOf(c); if(i<0||S.eaten[seat].includes(c)) return false;
      const test=H.filter(x=>x!==c); if(!PH.solve(test,S.eaten[seat])) return false; // không được phá phỏm có lá ăn
      H.splice(i,1); S.discards[seat].push(c); S.dc[seat]++; PH.ev(S,{k:'discard',seat,c});
      const nx=(seat+1)%n;
      if (S.dc.every(d=>d>=PH_ROUNDS)){ PH.finish(S,t); return true; }
      S.turn=nx; S.step='draw'; S.turnAt=t; return true; }
    return false;
  },
  pay(S,from,to,amt){ const a=Math.min(amt,Math.max(0,S.coins[from])); S.coins[from]-=a; S.coins[to]+=a; return a; },
  finishU(S,seat,t,how){
    const n=S.seats.length, H=S.hands[seat], x=PH.isU(H,S.eaten[seat]); const keep=H.filter(c=>c!==x); const sol=PH.solve(keep,S.eaten[seat]);
    const res=S.seats.map((_,i)=>({melds:[],rest:S.hands[i].slice().sort((a,b)=>PH.sortKey(a)-PH.sortKey(b)),dead:0,place:2,delta:0,label:''}));
    res[seat]={melds:sol.melds,rest:[],dead:0,place:1,delta:0,label:'Ù!'};
    S.seats.forEach((_,i)=>{ if(i!==seat){ const p=PH.pay(S,i,seat,PH_UNIT*5); res[i].delta-=p; res[seat].delta+=p; res[i].label='Đền ù'; } });
    S.log.unshift(S.seats[seat].name+' '+how.toUpperCase()+'! Mỗi người trả '+PH_UNIT*5+' xu.');
    S.res={rows:res, u:seat}; S.phase='result'; S.phaseAt=t; S.turn=-1; S.nextStart=seat; PH.ev(S,{k:'u',seat});
  },
  finish(S,t){
    const n=S.seats.length;
    const rows=S.seats.map((_,i)=>{ const s=PH.solve(S.hands[i],S.eaten[i])||{melds:[],rest:S.hands[i],dead:S.hands[i].reduce((a,c)=>a+PH.pts(c),0)}; return {melds:s.melds,rest:s.rest,dead:s.dead,mom:!s.melds.length,delta:0}; });
    const order=S.seats.map((_,i)=>i).sort((a,b)=>(rows[a].mom-rows[b].mom)||(rows[a].dead-rows[b].dead)||(((a-S.start+n)%n)-((b-S.start+n)%n)));
    const w=order[0]; const NAMES=['Nhất','Nhì','Ba','Bét'];
    order.forEach((i,k)=>{ rows[i].place=k+1; rows[i].label=rows[i].mom?'Móm':(k===0?'Nhất':k===n-1?'Bét':NAMES[k]);
      if(k>0){ const mult=rows[i].mom?4:k; const p=PH.pay(S,i,w,PH_UNIT*mult); rows[i].delta-=p; rows[w].delta+=p; } });
    S.log.unshift('Hạ bài: '+order.map(i=>S.seats[i].name+' '+rows[i].label+(rows[i].mom?'':' ('+rows[i].dead+' điểm)')).join(', ')+'.');
    S.res={rows}; S.phase='result'; S.phaseAt=t; S.turn=-1; S.nextStart=w; PH.ev(S,{k:'end'});
  },
  tick(S,t){ if (S.phase==='result' && t-S.phaseAt>PH_RES_MS){ S.start=S.nextStart; PH.deal(S,t); return true; } return false; },
  whoActs(S){ return S.phase==='play' ? [S.turn] : []; },
  // bot: chọn lá đánh sao cho rác còn lại ít điểm nhất; ưu tiên không cho người sau ăn
  bestDiscard(S,seat){ const H=S.hands[seat], E=S.eaten[seat], n=S.seats.length, nx=(seat+1)%n; let best=null;
    H.forEach(c=>{ if(E.includes(c)) return; const rest=H.filter(x=>x!==c); const s=PH.solve(rest,E); if(!s) return;
      const danger = S.seats[nx] && PH.canEat(S.hands[nx],S.eaten[nx],c) ? 3 : 0;
      const sc = s.dead + danger - PH.pts(c)*0.02 + (PH.melds(rest).length? -0.5:0);
      if(!best||sc<best.sc) best={c,sc}; });
    return best?best.c:H.find(c=>!E.includes(c)); },
  botAction(S,seat,t){
    if (t-S.turnAt<800) return null;
    if (S.step==='draw'){ const c=PH.topDiscard(S); if(c!=null && PH.canEat(S.hands[seat],S.eaten[seat],c)) return {t:'eat'}; return {t:'draw'}; }
    return {t:'discard', c:PH.bestDiscard(S,seat)};
  },
  timeoutAction(S,seat){ return S.step==='draw'?{t:'draw'}:{t:'discard',c:PH.bestDiscard(S,seat)}; }
};
if (typeof module!=='undefined') module.exports=PH;
