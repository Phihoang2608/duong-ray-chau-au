/* ===================== BẦU CUA TÔM CÁ ===================== */
const BC_SYM=[{id:'nai',name:'Nai',col:'#a86b3c'},{id:'bau',name:'Bầu',col:'#4f9a3a'},{id:'ga',name:'Gà',col:'#e2572f'},{id:'ca',name:'Cá',col:'#2f86c9'},{id:'cua',name:'Cua',col:'#d23a3a'},{id:'tom',name:'Tôm',col:'#ef7b9a'}];
const BC_CHIPS=[10,50,100,500];
const BET_MS=20000, ROLL_MS=2600, SHOW_MS=5200, START=1000;
const BC = {
  newGame(seats, t, prev){
    const S={ seats:seats.map(s=>({name:s.name,bot:!!s.bot,peer:s.peer||null,pid:s.pid||null,color:s.color})), coins:prev?prev.coins.slice():seats.map(()=>START),
      round:0, history:prev?prev.history.slice(0,12):[], log:[] };
    BC.newRound(S,t); return S;
  },
  newRound(S,t){
    S.round++; S.phase='bet'; S.phaseAt=t; S.bets=S.seats.map(()=>[0,0,0,0,0,0]); S.ready=S.seats.map(()=>false); S.dice=null; S.delta=null;
    S.seats.forEach((p,i)=>{ if (S.coins[i]<10){ S.coins[i]+=500; S.log.unshift(`${p.name} được tiếp tế 500 xu.`); } });
  },
  apply(S, seat, a, t){
    if (S.phase!=='bet' || seat<0 || S.ready[seat]) return false;
    if (a.t==='bet'){ const s=+a.s, v=+a.v; if(!(s>=0&&s<6) || !BC_CHIPS.includes(v) || S.coins[seat]<v) return false;
      S.coins[seat]-=v; S.bets[seat][s]+=v; return true; }
    if (a.t==='undo'){ const sum=S.bets[seat].reduce((x,y)=>x+y,0); if(!sum) return false; S.coins[seat]+=sum; S.bets[seat]=[0,0,0,0,0,0]; return true; }
    if (a.t==='ready'){ S.ready[seat]=true; return true; }
    return false;
  },
  tick(S,t){
    if (S.phase==='bet'){
      const allReady=S.ready.every(Boolean);
      if ((allReady && t-S.phaseAt>1500) || t-S.phaseAt>BET_MS){ S.phase='roll'; S.phaseAt=t; S.dice=[0,0,0].map(()=>Math.floor(Math.random()*6)); S.ready=S.ready.map(()=>true); return true; }
    } else if (S.phase==='roll' && t-S.phaseAt>ROLL_MS){
      S.phase='show'; S.phaseAt=t; const cnt=[0,0,0,0,0,0]; S.dice.forEach(d=>cnt[d]++);
      S.delta=S.seats.map((_,i)=>{ let d=0; S.bets[i].forEach((b,s)=>{ if(!b) return; if(cnt[s]) { S.coins[i]+=b+b*cnt[s]; d+=b*cnt[s]; } else d-=b; }); return d; });
      S.history.unshift(S.dice.slice()); if (S.history.length>12) S.history.length=12;
      const best=S.delta.reduce((m,d,i)=>d>S.delta[m]?i:m,0);
      S.log.unshift(`Ván ${S.round}: ${S.dice.map(d=>BC_SYM[d].name).join(' – ')}${S.delta[best]>0?` · ${S.seats[best].name} thắng ${S.delta[best]} xu`:''}`); if(S.log.length>20) S.log.length=20;
      return true;
    } else if (S.phase==='show' && t-S.phaseAt>SHOW_MS){ BC.newRound(S,t); return true; }
    return false;
  },
  whoActs(S){ return S.phase==='bet' ? S.seats.map((_,i)=>i).filter(i=>!S.ready[i]) : []; },
  botAction(S, seat, t){
    if (!S.seats[seat].bot) return {t:'ready'};
    if (t-S.phaseAt<1500+seat*500) return null;
    const placed=S.bets[seat].reduce((x,y)=>x+y,0), budget=Math.max(10, Math.floor(S.coins[seat]*0.06+placed));
    if (placed>=budget || S.coins[seat]<10 || Math.random()<0.25*(placed>0)) return {t:'ready'};
    const chips=BC_CHIPS.filter(c=>c<=S.coins[seat] && c<=Math.max(10,budget-placed)); if(!chips.length) return {t:'ready'};
    return {t:'bet', s:Math.floor(Math.random()*6), v:chips[Math.floor(Math.random()*chips.length)]};
  }
};
if (typeof module!=='undefined') module.exports=BC;
