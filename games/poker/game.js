/* ===================== POKER TEXAS HOLD'EM ===================== */
const PK_SB=10, PK_BB=20, PK_START=1000, PK_RES_MS=6500;
const PK = {
  CAT:['Mậu thầu','Một đôi','Thú (hai đôi)','Sám cô','Sảnh','Thùng','Cù lũ','Tứ quý','Thùng phá sảnh'],
  eval5(cs){
    const rs=cs.map(c=>c>>2).sort((a,b)=>b-a), ss=cs.map(c=>c&3);
    const flush=ss.every(s=>s===ss[0]); const uniq=[...new Set(rs)];
    let straight=-1; if(uniq.length===5){ if(uniq[0]-uniq[4]===4) straight=uniq[0]; else if(uniq.join()==='12,3,2,1,0') straight=3; }
    const cnt={}; rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);
    const groups=Object.entries(cnt).map(([r,c])=>[c,+r]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
    let cat, tb;
    if (straight>=0 && flush){ cat=8; tb=[straight]; }
    else if (groups[0][0]===4){ cat=7; tb=[groups[0][1],groups[1][1]]; }
    else if (groups[0][0]===3 && groups[1][0]===2){ cat=6; tb=[groups[0][1],groups[1][1]]; }
    else if (flush){ cat=5; tb=rs; }
    else if (straight>=0){ cat=4; tb=[straight]; }
    else if (groups[0][0]===3){ cat=3; tb=groups.map(g=>g[1]); }
    else if (groups[0][0]===2 && groups[1][0]===2){ cat=2; tb=groups.map(g=>g[1]); }
    else if (groups[0][0]===2){ cat=1; tb=groups.map(g=>g[1]); }
    else { cat=0; tb=rs; }
    let v=cat; for(let i=0;i<5;i++) v=v*13+(tb[i]||0); return v;
  },
  best(cards){ let best=-1, bc=null; const n=cards.length;
    for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++)for(let d=c+1;d<n;d++)for(let e=d+1;e<n;e++){ const h=[cards[a],cards[b],cards[c],cards[d],cards[e]]; const v=PK.eval5(h); if(v>best){ best=v; bc=h; } }
    return {v:best, cards:bc, cat:Math.floor(best/Math.pow(13,5))}; },
  newGame(seats,t,prev){ const S={seats:seats.map(s=>({name:s.name,bot:!!s.bot,peer:s.peer||null,pid:s.pid||null,color:s.color})), chips:prev?prev.chips.slice():seats.map(()=>PK_START), btn:prev?prev.btn:-1, handNo:prev?prev.handNo:0, log:[]}; PK.newHand(S,t); return S; },
  nextFrom(S,i,pred){ const n=S.seats.length; for(let k=1;k<=n;k++){ const j=(i+k)%n; if(pred(j)) return j; } return -1; },
  newHand(S,t){
    S.handNo++; const n=S.seats.length;
    S.seats.forEach((p,i)=>{ if(S.chips[i]<=0){ S.chips[i]=PK_START; S.log.unshift(p.name+' mua thêm '+PK_START+' phỉnh.'); } });
    S.inHand=S.seats.map(()=>true); S.folded=S.seats.map(()=>false); S.allin=S.seats.map(()=>false); S.bet=S.seats.map(()=>0); S.contrib=S.seats.map(()=>0); S.acted=S.seats.map(()=>false);
    S.btn=PK.nextFrom(S,S.btn,()=>true); S.deck=Cards.deck(); S.hands=S.seats.map(()=>[S.deck.pop(),S.deck.pop()]); S.board=[]; S.street=0; S.result=null; S.phase='hand'; S.lastAct=null;
    const heads=n===2; const sb=heads?S.btn:PK.nextFrom(S,S.btn,()=>true), bb=PK.nextFrom(S,sb,()=>true);
    PK.put(S,sb,PK_SB); PK.put(S,bb,PK_BB); S.cur=PK_BB; S.minRaise=PK_BB; S.sbSeat=sb; S.bbSeat=bb;
    S.toAct=PK.nextFrom(S,bb,j=>PK.canAct(S,j)); S.turnAt=t; S.phaseAt=t;
    if (S.toAct<0) PK.endStreet(S,t);
  },
  put(S,i,amt){ const a=Math.min(amt,S.chips[i]); S.chips[i]-=a; S.bet[i]+=a; S.contrib[i]+=a; if(S.chips[i]===0) S.allin[i]=true; return a; },
  canAct(S,j){ return !S.folded[j] && !S.allin[j]; },
  live(S){ return S.seats.map((_,i)=>i).filter(i=>!S.folded[i]); },
  pot(S){ return S.contrib.reduce((a,b)=>a+b,0); },
  apply(S,seat,a,t){
    if (S.phase!=='hand' || seat!==S.toAct) return false;
    const need=S.cur-S.bet[seat], name=S.seats[seat].name; let txt;
    if (a.t==='fold'){ S.folded[seat]=true; txt='bỏ bài'; }
    else if (a.t==='check'){ if(need>0) return false; txt='xem (check)'; }
    else if (a.t==='call'){ if(need<=0) return false; const p=PK.put(S,seat,need); txt='theo '+p+(S.allin[seat]?' (tất tay)':''); }
    else if (a.t==='raise'){ let to=Math.floor(+a.to); const max=S.bet[seat]+S.chips[seat]; if(!(to>S.cur)) return false; if(to>max) to=max;
      if (to<S.cur+S.minRaise && to<max) return false;
      const inc=to-S.cur; if(inc>=S.minRaise){ S.minRaise=inc; S.acted=S.acted.map(()=>false); }
      S.cur=Math.max(S.cur,to); PK.put(S,seat,to-S.bet[seat]); txt=(S.allin[seat]?'tất tay ':'tố lên ')+to; }
    else return false;
    S.acted[seat]=true; S.lastAct={seat,txt,k:a.t,n:(S.lastAct?S.lastAct.n:0)+1}; S.log.unshift(name+' '+txt+'.'); if(S.log.length>25) S.log.length=25;
    const live=PK.live(S); if (live.length===1){ PK.award(S,t,[live[0]]); return true; }
    const nx=PK.nextFrom(S,seat,j=>PK.canAct(S,j) && (!S.acted[j] || S.bet[j]<S.cur));
    if (nx<0) PK.endStreet(S,t); else { S.toAct=nx; S.turnAt=t; }
    return true;
  },
  endStreet(S,t){
    const canBet=S.seats.map((_,i)=>i).filter(i=>PK.canAct(S,i));
    S.bet=S.seats.map(()=>0); S.cur=0; S.minRaise=PK_BB; S.acted=S.seats.map(()=>false);
    const runout = canBet.length<=1;
    while (S.street<3){ S.street++; S.deck.pop(); if(S.street===1) S.board.push(S.deck.pop(),S.deck.pop(),S.deck.pop()); else S.board.push(S.deck.pop());
      if (!runout) break; }
    if (S.street>=3 && (runout || S._riverDone)){ PK.showdown(S,t); return; }
    if (S.street===3) S._riverDone=true;
    S.toAct=PK.nextFrom(S,S.btn,j=>PK.canAct(S,j)); S.turnAt=t;
    if (S.toAct<0) PK.showdown(S,t);
  },
  showdown(S,t){ const live=PK.live(S); const vals={}; live.forEach(i=>vals[i]=PK.best(S.hands[i].concat(S.board)));
    S.showVals=vals; PK.award(S,t,null); },
  award(S,t,only){
    const n=S.seats.length, won=S.seats.map(()=>0);
    if (only){ const w=only[0]; won[w]=PK.pot(S); S.chips[w]+=won[w]; S.result={won, byFold:true, desc:{}}; S.log.unshift(S.seats[w].name+' ăn '+won[w]+' (mọi người bỏ bài).'); }
    else {
      const levels=[...new Set(S.contrib.filter(c=>c>0))].sort((a,b)=>a-b); let prev=0;
      levels.forEach(L=>{ const part=S.contrib.reduce((s,c)=>s+Math.max(0,Math.min(c,L)-prev),0); const elig=S.seats.map((_,i)=>i).filter(i=>!S.folded[i]&&S.contrib[i]>=L);
        if (elig.length){ const best=Math.max(...elig.map(i=>S.showVals[i].v)); const ws=elig.filter(i=>S.showVals[i].v===best); const sh=Math.floor(part/ws.length); ws.forEach((w,k)=>{ won[w]+=sh+(k===0?part-sh*ws.length:0); }); }
        else { const back=S.seats.map((_,i)=>i).filter(i=>S.contrib[i]>=L); back.forEach(i=>won[i]+=Math.floor(part/back.length)); }
        prev=L; });
      won.forEach((w,i)=>S.chips[i]+=w);
      const desc={}; Object.keys(S.showVals).forEach(i=>desc[i]=PK.CAT[S.showVals[i].cat]);
      S.result={won, byFold:false, desc, bestCards:Object.fromEntries(Object.entries(S.showVals).map(([i,v])=>[i,v.cards]))};
      S.log.unshift(S.seats.map((p,i)=>won[i]?p.name+' ăn '+won[i]+' ('+desc[i]+')':null).filter(Boolean).join(', ')+'.');
    }
    S.phase='result'; S.phaseAt=t; S.toAct=-1; S._riverDone=false;
  },
  tick(S,t){ if (S.phase==='result' && t-S.phaseAt>PK_RES_MS){ PK.newHand(S,t); return true; } return false; },
  whoActs(S){ return S.phase==='hand'&&S.toAct>=0 ? [S.toAct] : []; },
  equity(S,seat,sims){ const known=S.hands[seat].concat(S.board); const opp=PK.live(S).filter(i=>i!==seat).length; if(!opp) return 1;
    const rest=Array.from({length:52},(_,i)=>i).filter(c=>!known.includes(c)); let win=0;
    for(let k=0;k<sims;k++){ const d=rest.slice(); for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
      let p=0; const board=S.board.concat(d.slice(p,p+5-S.board.length)); p+=5-S.board.length; const me=PK.best(S.hands[seat].concat(board)).v; let ok=1, tie=0;
      for(let o=0;o<opp;o++){ const v=PK.best([d[p++],d[p++]].concat(board)).v; if(v>me){ ok=0; break; } if(v===me) tie++; }
      win+= ok ? 1/(1+tie) : 0; }
    return win/sims; },
  botAction(S,seat,t){
    if (t-S.turnAt<900) return null;
    const need=S.cur-S.bet[seat], pot=PK.pot(S), e=PK.equity(S,seat,S.street===0?60:90), odds=need/(pot+need||1), r=Math.random();
    const raiseTo=f=>({t:'raise', to:Math.max(S.cur+S.minRaise, S.cur+Math.floor(pot*f))});
    const strong = e > (PK.live(S).length>2?0.55:0.68);
    if (need<=0){ if (strong && r<0.75) return raiseTo(0.5+Math.random()*0.5); if (r<0.08) return raiseTo(0.5); return {t:'check'}; }
    if (strong && r<0.45 && S.chips[seat]>need) return raiseTo(0.6+Math.random()*0.6);
    if (e > odds+0.04 || (need<=PK_BB && e>0.2)) return {t:'call'};
    if (r<0.05) return {t:'call'};
    return {t:'fold'};
  },
  timeoutAction(S,seat){ return S.cur-S.bet[seat]>0 ? {t:'fold'} : {t:'check'}; }
};
if (typeof module!=='undefined') module.exports=PK;
