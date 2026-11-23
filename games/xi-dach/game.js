/* ===================== XÌ DÁCH ===================== */
const XD_BET_MS=15000, XD_RES_MS=6000, XD_CHIPS=[10,50,100,500];
const XD = {
  val(h){ // A: 2 lá tính 11 hoặc 10 (hoặc 1); từ 3 lá tính 10 hoặc 1
    let base=0, aces=0; h.forEach(c=>{ const r=c>>2; if(r===12) aces++; else base+= r>=8?10:r+2; });
    let opts=[base]; for(let i=0;i<aces;i++){ const add=h.length<=2?[1,10,11]:[1,10]; const n=[]; opts.forEach(o=>add.forEach(a=>n.push(o+a))); opts=[...new Set(n)]; }
    const ok=opts.filter(v=>v<=21); return ok.length?Math.max(...ok):Math.min(...opts);
  },
  kind(h){ if(h.length===2){ const a=h.filter(c=>(c>>2)===12).length, t=h.filter(c=>(c>>2)>=8&&(c>>2)<=11).length; if(a===2) return 'xiban'; if(a===1&&t===1) return 'xidach'; }
    const v=XD.val(h); if(v>21) return 'bust'; if(h.length===5) return 'ngulinh'; return 'normal'; },
  label(h){ const k=XD.kind(h), v=XD.val(h); return {xiban:'Xì bàn',xidach:'Xì dách',ngulinh:'Ngũ linh',bust:'Quắc ('+v+')',normal:v+' điểm'}[k]; },
  rankOf(h){ return {xiban:5,xidach:4,ngulinh:3,normal:2,bust:0}[XD.kind(h)]; },
  newGame(seats,t,prev){ const S={seats:seats.map(s=>({name:s.name,bot:!!s.bot,peer:s.peer||null,pid:s.pid||null,color:s.color})), coins:prev?prev.coins.slice():seats.map(()=>1000), round:0, log:[]}; XD.newRound(S,t); return S; },
  newRound(S,t){ S.round++; S.phase='bet'; S.phaseAt=t; S.bet=S.seats.map(()=>0); S.ready=S.seats.map(()=>false); S.hands=S.seats.map(()=>[]); S.done=S.seats.map(()=>false); S.dealer=[]; S.res=null; S.turn=-1; S.reveal=false;
    S.seats.forEach((p,i)=>{ if(S.coins[i]<10){ S.coins[i]+=500; S.log.unshift(p.name+' được tiếp tế 500 xu.'); } }); },
  draw(S){ if(!S.deck.length) S.deck=Cards.deck(); return S.deck.pop(); },
  deal(S,t){ S.deck=Cards.deck(); const act=S.seats.map((_,i)=>i).filter(i=>S.bet[i]>0);
    for(let k=0;k<2;k++){ act.forEach(i=>S.hands[i].push(XD.draw(S))); S.dealer.push(XD.draw(S)); }
    S.phase='play'; S.phaseAt=t; S.turnAt=t; S.dealt=t;
    const dk=XD.kind(S.dealer); if(dk==='xiban'||dk==='xidach'){ S.reveal=true; S.log.unshift('Nhà cái có '+XD.label(S.dealer)+'!'); XD.settle(S,t); return; }
    S.turn=act.find(i=>!['xiban','xidach'].includes(XD.kind(S.hands[i]))); act.forEach(i=>{ if(['xiban','xidach'].includes(XD.kind(S.hands[i]))) S.done[i]=true; });
    if (S.turn==null) { S.phase='dealer'; S.phaseAt=t; S.reveal=true; } },
  nextTurn(S,t){ S.done[S.turn]=true; const n=S.seats.length; let nx=null; for(let k=1;k<n;k++){ const j=(S.turn+k)%n; if(j<=S.turn) break; if(S.bet[j]>0&&!S.done[j]){ nx=j; break; } }
    if(nx==null){ S.turn=-1; S.phase='dealer'; S.phaseAt=t; S.reveal=true; } else { S.turn=nx; S.turnAt=t; } },
  settle(S,t){ const dr=XD.rankOf(S.dealer), dv=XD.val(S.dealer); S.res=S.seats.map((_,i)=>{ if(!S.bet[i]) return null; const h=S.hands[i], pr=XD.rankOf(h), pv=XD.val(h), b=S.bet[i]; let m;
      if(pr===0) m=-1; else if(pr>=3 || dr>=3){ if(pr>dr) m=({5:3,4:2,3:2}[pr]||1); else if(pr<dr) m=-({5:3,4:2,3:2}[dr]||1); else m=0; }
      else if(dr===0) m=1; else m= pv>dv?1:pv<dv?-1:0;
      const d=m*b; S.coins[i]+=b+d; return {d, m}; });
    S.phase='result'; S.phaseAt=t; S.turn=-1;
    const w=S.res.map((r,i)=>r&&r.d>0?S.seats[i].name+' +'+r.d:null).filter(Boolean); S.log.unshift(`Ván ${S.round}: nhà cái ${XD.label(S.dealer)}${w.length?' · thắng: '+w.join(', '):''}`); if(S.log.length>20) S.log.length=20; },
  apply(S,seat,a,t){
    if (S.phase==='bet'){ if(S.ready[seat]) return false;
      if(a.t==='bet'){ const v=+a.v; if(!XD_CHIPS.includes(v)||S.coins[seat]<v) return false; S.coins[seat]-=v; S.bet[seat]+=v; return true; }
      if(a.t==='clear'){ if(!S.bet[seat]) return false; S.coins[seat]+=S.bet[seat]; S.bet[seat]=0; return true; }
      if(a.t==='ready'){ if(!S.bet[seat]) return false; S.ready[seat]=true; return true; }
      if(a.t==='skip'){ S.ready[seat]=true; return true; }
      return false; }
    if (S.phase==='play' && seat===S.turn){ const h=S.hands[seat], v=XD.val(h);
      if(a.t==='hit'){ if(h.length>=5||v>21) return false; h.push(XD.draw(S)); S.turnAt=t; const k=XD.kind(h); if(k==='bust'||k==='ngulinh'||XD.val(h)===21) XD.nextTurn(S,t); return true; }
      if(a.t==='stand'){ if(v<16 && h.length<5) return false; XD.nextTurn(S,t); return true; } }
    return false; },
  tick(S,t){
    if (S.phase==='bet'){ const any=S.bet.some(b=>b>0), all=S.seats.every((_,i)=>S.ready[i]||S.seats[i].bot&&false);
      if ((S.ready.every(Boolean) && any && t-S.phaseAt>1200) || t-S.phaseAt>XD_BET_MS){ if(!any){ S.phaseAt=t; S.ready=S.ready.map(()=>false); return true; } XD.deal(S,t); return true; } }
    if (S.phase==='dealer' && t-S.phaseAt>900){ if(XD.val(S.dealer)<17 && S.dealer.length<5 && XD.seats_alive(S)){ S.dealer.push(XD.draw(S)); S.phaseAt=t; return true; } XD.settle(S,t); return true; }
    if (S.phase==='result' && t-S.phaseAt>XD_RES_MS){ XD.newRound(S,t); return true; }
    return false; },
  seats_alive(S){ return S.seats.some((_,i)=>S.bet[i]&&XD.kind(S.hands[i])!=='bust'); },
  whoActs(S){ if(S.phase==='bet') return S.seats.map((_,i)=>i).filter(i=>!S.ready[i]); if(S.phase==='play') return [S.turn]; return []; },
  botAction(S,seat,t){
    if (S.phase==='bet'){ if(!S.seats[seat].bot) return {t:'skip'}; if(t-S.phaseAt<1200+seat*400) return null; if(!S.bet[seat]){ const c=[10,50,100].filter(v=>v<=S.coins[seat]); return c.length?{t:'bet',v:c[Math.floor(Math.random()*c.length)]}:{t:'skip'}; } return {t:'ready'}; }
    if (t-S.turnAt<900) return null; const v=XD.val(S.hands[seat]); return (v<16 || (v===16&&Math.random()<.5)) && S.hands[seat].length<5 ? {t:'hit'} : {t:'stand'}; },
  timeoutAction(S,seat){ if(S.phase!=='play') return null; return XD.val(S.hands[seat])<16?{t:'hit'}:{t:'stand'}; }
};
if (typeof module!=='undefined') module.exports=XD;
