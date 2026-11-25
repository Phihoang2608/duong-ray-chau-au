global.Cards=require('../../core/cards.js'); const DQ=require('./game.js');
for(let g=0;g<100;g++){ let t=0; const n=2+g%3; const S=DQ.newGame(Array.from({length:n},(_,i)=>({name:'B'+i,bot:true})),t);
 for(let i=0;i<5000&&S.phase==='play';i++){ t+=1000; const s=S.turn; const a=DQ.botAction(S,s,t); DQ.apply(S,s,a,t); if(i>4980) console.log(s,S.step,JSON.stringify(a),S.P[s].tok.join(''),S.P[s].res.length,S.bank.join(''),S.P.map(p=>p.pts).join()); }
 if(S.phase!=='over'){ break; } }
