/* ===================== TÚ LƠ KHƠ — TIẾN LÊN MIỀN NAM ===================== */
const RANKS=['3','4','5','6','7','8','9','10','J','Q','K','A','2'], SUITS=['♠','♣','♦','♥'];
const rk=c=>c>>2, su=c=>c&3, isRed=c=>su(c)>=2;
const cardName=c=>RANKS[rk(c)]+SUITS[su(c)];
const TL = {
  shuffle(a,r){ r=r||Math.random; for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; },
  classify(cards){
    const c=cards.slice().sort((a,b)=>a-b), n=c.length; if(!n) return null;
    const rs=c.map(rk), top=c[n-1];
    if (n===1) return {type:'single',n,top};
    if (rs.every(r=>r===rs[0])) return {type:['','','pair','triple','quad'][n],n,top};
    if (n>=3 && rs[n-1]<12 && rs.every((r,i)=>i===0||r===rs[i-1]+1)) return {type:'straight',n,top};
    if (n>=6 && n%2===0 && rs[n-1]<12){ let ok=true; for(let i=0;i<n;i+=2){ if(rs[i]!==rs[i+1] || (i>0 && rs[i]!==rs[i-2]+1)) ok=false; } if(ok) return {type:'dseq',n,top}; }
    return null;
  },
  beats(a,b){
    if (!b) return true; if (!a) return false;
    if (a.type===b.type && a.n===b.n && a.top>b.top) return true;
    const two=rk(b.top)===12;
    if (b.type==='single' && two) return a.type==='quad' || (a.type==='dseq' && a.n>=6);
    if (b.type==='pair' && two) return a.type==='quad' || (a.type==='dseq' && a.n>=8);
    if (b.type==='dseq' && b.n===6) return a.type==='quad' || (a.type==='dseq' && a.n>=8);
    if (b.type==='quad') return a.type==='dseq' && a.n>=8;
    return false;
  },
  label(cb){ const r=RANKS[rk(cb.top)];
    return {single:'Lá '+cardName(cb.top), pair:'Đôi '+r, triple:'Sám cô '+r, quad:'Tứ quý '+r, straight:'Sảnh '+cb.n+' lá đến '+r, dseq:(cb.n/2)+' đôi thông'}[cb.type]; },
  combos(hand){
    const h=hand.slice().sort((a,b)=>a-b), by={}; h.forEach(c=>(by[rk(c)]=by[rk(c)]||[]).push(c));
    const out=[]; h.forEach(c=>out.push([c]));
    Object.values(by).forEach(g=>{ for(let k=2;k<=g.length;k++){ if(k===2){ for(let i=0;i<g.length;i++) for(let j=i+1;j<g.length;j++) out.push([g[i],g[j]]); } else out.push(g.slice(g.length-k)); } });
    const ranks=Object.keys(by).map(Number).filter(r=>r<12).sort((a,b)=>a-b);
    for (let i=0;i<ranks.length;i++){ let j=i; while(j+1<ranks.length && ranks[j+1]===ranks[j]+1) j++;
      for (let s=i;s<=j;s++) for (let e=s+2;e<=j;e++){ const seq=ranks.slice(s,e+1); const base=seq.slice(0,-1).map(r=>by[r][0]); by[seq[seq.length-1]].forEach(tc=>out.push(base.concat([tc]))); }
      for (let s=i;s<=j;s++) for (let e=s+2;e<=j;e++){ const seq=ranks.slice(s,e+1); if(seq.every(r=>by[r].length>=2)) out.push([].concat(...seq.map(r=>by[r].slice(-2)))); } }
    return out.map(cs=>({cards:cs, cb:TL.classify(cs)})).filter(x=>x.cb);
  },
  newGame(seats, t, prev){
    const n=seats.length, deck=TL.shuffle(Array.from({length:52},(_,i)=>i)), hands=seats.map((_,i)=>deck.slice(i*13,i*13+13).sort((a,b)=>a-b));
    let lead = prev && prev.winner!=null ? prev.winner : hands.findIndex(h=>h.includes(Math.min(...[].concat(...hands))));
    return { seats:seats.map(s=>({name:s.name,bot:!!s.bot,peer:s.peer||null,pid:s.pid||null,color:s.color})), hands, turn:lead, pile:null, passed:Array(n).fill(false),
      last:null, over:false, winner:null, result:null, scores:prev?prev.scores.slice():Array(n).fill(0), round:prev?prev.round+1:1, turnAt:t, seq:0, log:[`Ván ${prev?prev.round+1:1} bắt đầu. ${seats[lead].name} đánh trước.`] };
  },
  nextTurn(S,t){
    const n=S.seats.length;
    for (let k=1;k<=n;k++){ const j=(S.turn+k)%n;
      if (S.pile && j===S.pile.by){ S.pile=null; S.passed=Array(n).fill(false); S.turn=j; S.log.unshift(`${S.seats[j].name} được đánh vòng mới.`); break; }
      if (!S.passed[j]){ S.turn=j; break; } }
    S.turnAt=t;
  },
  apply(S, seat, a, t){
    if (a.t==='next') return false;
    if (S.over || seat!==S.turn) return false;
    if (a.t==='pass'){ if(!S.pile) return false; S.passed[seat]=true; S.seq++; S.last={seat,pass:true,seq:S.seq}; S.log.unshift(`${S.seats[seat].name} bỏ lượt.`); TL.nextTurn(S,t); return true; }
    if (a.t==='play'){
      const cs=(a.c||[]).map(Number), hand=S.hands[seat];
      if (!cs.length || new Set(cs).size!==cs.length || !cs.every(c=>hand.includes(c))) return false;
      const cb=TL.classify(cs); if(!cb || !TL.beats(cb, S.pile)) return false;
      const chop = S.pile && cb.type!==S.pile.type && (cb.type==='quad'||cb.type==='dseq');
      S.hands[seat]=hand.filter(c=>!cs.includes(c));
      S.pile=Object.assign({cards:cs.slice().sort((a,b)=>a-b), by:seat}, cb); S.seq++;
      S.last={seat, cards:S.pile.cards, label:TL.label(cb), chop, seq:S.seq};
      S.log.unshift(`${S.seats[seat].name}: ${TL.label(cb)}${chop?' — CHẶT!':''}`); if(S.log.length>30) S.log.length=30;
      if (!S.hands[seat].length){ TL.finish(S, seat); return true; }
      TL.nextTurn(S,t); return true;
    }
    return false;
  },
  finish(S, w){
    S.over=true; S.winner=w; let gain=0;
    const res=S.seats.map((p,i)=>{ if(i===w) return {i,left:0,pen:0}; const h=S.hands[i]; const twos=h.filter(c=>rk(c)===12).length;
      let pen=h.length + twos*4; if (h.length===13) pen*=2; gain+=pen; return {i,left:h.length,twos,pen,cong:h.length===13}; });
    res[w].pen=-gain; res.forEach(r=>S.scores[r.i]-=r.pen);
    S.result=res; S.log.unshift(`${S.seats[w].name} hết bài — thắng ván!`);
  },
  whoActs(S){ return S.over ? [] : [S.turn]; },
  botAction(S, seat){
    const hand=S.hands[seat], all=TL.combos(hand), n=S.seats.length;
    const nextLeft = S.hands[(seat+1)%n].length, danger = S.seats.some((_,i)=>i!==seat && S.hands[i].length<=2);
    if (!S.pile){
      const low=hand[0];
      const withLow=all.filter(x=>x.cards.includes(low) && !x.cards.some(c=>rk(c)===12) && x.cb.type!=='quad');
      withLow.sort((a,b)=>b.cards.length-a.cards.length || a.cb.top-b.cb.top);
      let pick=withLow[0] || all.sort((a,b)=>a.cb.top-b.cb.top)[0];
      if (danger && pick.cb.type==='single' && hand.length>1){ const big=all.filter(x=>x.cb.type!=='single').sort((a,b)=>b.cards.length-a.cards.length)[0]; if(big) pick=big; else pick={cards:[hand[hand.length-1]]}; }
      return {t:'play', c:pick.cards};
    }
    let ok=all.filter(x=>TL.beats(x.cb,S.pile));
    const isBomb=x=>x.cb.type==='quad'||x.cb.type==='dseq';
    if (!(rk(S.pile.top)===12 || danger)) ok=ok.filter(x=>!isBomb(x));
    if (!danger && hand.length>4) ok=ok.filter(x=>!x.cards.some(c=>rk(c)===12) || Math.random()<.25);
    if (!ok.length) return {t:'pass'};
    ok.sort((a,b)=>a.cb.top-b.cb.top);
    if (ok.some(x=>x.cards.length===hand.length)) return {t:'play', c:ok.find(x=>x.cards.length===hand.length).cards};
    return {t:'play', c:ok[0].cards};
  },
  timeoutAction(S, seat){ return S.pile ? {t:'pass'} : {t:'play', c:[S.hands[seat][0]]}; }
};
if (typeof module!=='undefined') module.exports=TL;
