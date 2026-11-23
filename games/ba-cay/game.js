/* ===================== BA CÂY ===================== */
const BCY_LOOK_MS=12000, BCY_RES_MS=6500, BCY_ANTES=[20,50,100,200];
const BCY = {
  pts(c){ const r=c>>2; return r===12?1:(r>=8?0:r+2)%10; },             // A=1, 2..9, 10/J/Q/K = 0
  isFace(c){ const r=c>>2; return r>=9&&r<=11; },
  SUITW:[1,0,3,2],                                                         // so chất: Rô > Cơ > Bích > Nhép
  strength(h){ if(h.every(BCY.isFace)) return 100+BCY.top(h)/100; return h.reduce((a,c)=>a+BCY.pts(c),0)%10 + BCY.top(h)/100; },
  top(h){ return Math.max(...h.map(c=>BCY.SUITW[c&3]*13 + ((c>>2)===12?13:(c>>2)+1))); },
  label(h){ if(h.every(BCY.isFace)) return 'Ba tiên'; const p=h.reduce((a,c)=>a+BCY.pts(c),0)%10; return p===0?'Bù (0 nút)':p+' nút'; },
  newGame(seats,t,prev){ const S={seats:seats.map(s=>({name:s.name,bot:!!s.bot,peer:s.peer||null,pid:s.pid||null,color:s.color})), coins:prev?prev.coins.slice():seats.map(()=>1000), round:0, ante:prev?prev.ante:50, log:[]}; BCY.newRound(S,t); return S; },
  newRound(S,t){ S.round++; S.seats.forEach((p,i)=>{ if(S.coins[i]<S.ante){ S.coins[i]+=500; S.log.unshift(p.name+' được tiếp tế 500 xu.'); } });
    const d=Cards.deck(); S.hands=S.seats.map((_,i)=>[d.pop(),d.pop(),d.pop()]); S.open=S.seats.map(()=>false); S.pot=0;
    S.seats.forEach((_,i)=>{ S.coins[i]-=S.ante; S.pot+=S.ante; }); S.phase='look'; S.phaseAt=t; S.res=null; },
  apply(S,seat,a,t){
    if (a.t==='open' && S.phase==='look' && !S.open[seat]){ S.open[seat]=true; return true; }
    if (a.t==='ante' && seat===0 && S.phase!=='look' && BCY_ANTES.includes(+a.v)){ S.ante=+a.v; return true; }
    return false; },
  tick(S,t){
    if (S.phase==='look' && ((S.open.every(Boolean)&&t-S.phaseAt>1500) || t-S.phaseAt>BCY_LOOK_MS)){
      S.open=S.open.map(()=>true); const st=S.hands.map(BCY.strength); const w=st.indexOf(Math.max(...st));
      S.coins[w]+=S.pot; S.res={w, pot:S.pot}; S.phase='show'; S.phaseAt=t;
      S.log.unshift(`Ván ${S.round}: ${S.seats[w].name} thắng ${S.pot} xu với ${BCY.label(S.hands[w])}`); if(S.log.length>20) S.log.length=20; return true; }
    if (S.phase==='show' && t-S.phaseAt>BCY_RES_MS){ BCY.newRound(S,t); return true; }
    return false; },
  whoActs(S){ return S.phase==='look' ? S.seats.map((_,i)=>i).filter(i=>!S.open[i]) : []; },
  botAction(S,seat,t){ if(!S.seats[seat].bot) return null; return t-S.phaseAt>2000+seat*700 ? {t:'open'} : null; }
};
if (typeof module!=='undefined') module.exports=BCY;
