/* BỘ KHUNG DÙNG CHUNG — core/cards.js
   Bộ bài 52 lá, vẽ lá bài, bàn nỉ, xếp ghế quanh bàn, phỉnh (chip). Dùng cho các game bài.
   Mã lá: c = 0..51, hạng r = c>>2 (0='2' … 8='10', 9='J', 10='Q', 11='K', 12='A'), chất s = c&3 (♠ ♣ ♦ ♥) */
const Cards = (()=>{
  const RL=['2','3','4','5','6','7','8','9','10','J','Q','K','A'], SU=['♠','♣','♦','♥'];
  const r=c=>c>>2, s=c=>c&3, red=c=>(c&3)>=2, name=c=>RL[c>>2]+SU[c&3];
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function deck(){ return shuffle(Array.from({length:52},(_,i)=>i)); }
  function face(c, cls, i){ const L=RL[r(c)], S=SU[s(c)], court=r(c)>=9&&r(c)<=11;
    return `<div class="pc ${red(c)?'red':''} ${court?'court':''} ${cls||''}" data-c="${c}" ${i!=null?`style="--i:${i}"`:''}><span class="tl">${L}<br>${S}</span><span class="mid">${court?`<b>${L}</b>`:''}${S}</span><span class="br">${L}<br>${S}</span></div>`; }
  function back(cls, i){ return `<div class="pc back ${cls||''}" ${i!=null?`style="--i:${i}"`:''}></div>`; }
  function chip(v){ const col=v>=500?'#e11d48':v>=100?'#8a5cf6':v>=50?'#22b38a':'#3fa9f5'; return `<span class="chip" style="--cc:${col}">${v}</span>`; }
  // vị trí ghế quanh bàn hình bầu dục: ghế 0 (bạn) ở dưới giữa
  function seatXY(n, rel){ const a=Math.PI/2 + rel*2*Math.PI/n; return {x:50+45*Math.cos(a), y:53+35*Math.sin(a)}; }
  const CSS=`
  .pc{--cw:clamp(44px,5.4vw,72px);width:var(--cw);height:calc(var(--cw)*1.42);border-radius:8px;background:linear-gradient(160deg,#fff,#f4f1ea);border:1px solid #cfc8b8;box-shadow:0 3px 8px rgba(0,0,0,.25);position:relative;color:#1b1b1b;flex:none;user-select:none;transition:transform .18s,box-shadow .18s}
  .pc.red{color:#c8283a}
  .pc .tl,.pc .br{position:absolute;font-size:calc(var(--cw)*.22);line-height:1;font-weight:bold;text-align:center}
  .pc .tl{left:5px;top:5px}.pc .br{right:5px;bottom:5px;transform:rotate(180deg)}
  .pc .mid{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:calc(var(--cw)*.5)}
  .pc.court .mid{flex-direction:column;font-size:calc(var(--cw)*.3);background:linear-gradient(135deg,rgba(255,211,107,.25),rgba(138,92,246,.12));margin:16% 18%;border-radius:4px;border:1px solid rgba(0,0,0,.12)}
  .pc.court .mid b{font-size:calc(var(--cw)*.36)}
  .pc.back{background:repeating-linear-gradient(45deg,#ff7aa8 0 6px,#ff5f8f 6px 12px);border:3px solid #fff}
  .pc.back::after{content:"";position:absolute;inset:5px;border-radius:4px;border:1.5px solid rgba(255,255,255,.7);background:linear-gradient(135deg,rgba(138,92,246,.55),rgba(255,95,143,.2))}
  .pc.deal{animation:cdeal .45s cubic-bezier(.2,1.3,.4,1) both;animation-delay:calc(var(--i,0)*90ms)}
  @keyframes cdeal{from{transform:translateY(-140px) rotate(-25deg) scale(.6);opacity:0}}
  .pc.flip{animation:cflip .5s both}@keyframes cflip{0%{transform:rotateY(90deg)}100%{transform:none}}
  .pc.dim{filter:brightness(.6)}.pc.hl{box-shadow:0 0 0 3px #ffd36b,0 0 18px rgba(255,211,107,.8)}
  .felt{position:relative;border-radius:999px;background:radial-gradient(ellipse at 50% 40%,#2f9e77 0%,#1f7a5c 55%,#155a44 100%);box-shadow:inset 0 0 60px rgba(0,0,0,.35),0 0 0 14px #6b3f22,0 0 0 18px #8a5530,0 22px 50px rgba(30,20,10,.35)}
  .chip{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 4px;border-radius:50%;background:var(--cc);color:#fff;font-weight:bold;font-size:12px;border:3px dashed rgba(255,255,255,.8);box-shadow:0 3px 6px rgba(0,0,0,.3)}
  .seatbox{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;color:#fff;text-align:center;min-width:110px}
  .seatbox .nm{display:flex;align-items:center;gap:6px;background:rgba(0,0,0,.35);padding:3px 10px 3px 3px;border-radius:20px;border:2px solid transparent;font-size:14px;white-space:nowrap}
  .seatbox.turn .nm{border-color:#ffd36b;box-shadow:0 0 16px rgba(255,211,107,.8);animation:sbp 1.3s infinite}@keyframes sbp{50%{box-shadow:0 0 5px rgba(255,211,107,.4)}}
  .seatbox .sub{font-size:12.5px;background:rgba(0,0,0,.28);border-radius:10px;padding:0 8px}
  .seatbox .cards{display:flex;gap:3px}.seatbox .cards .pc{--cw:clamp(34px,3.6vw,50px)}
  .seatbox .tag{font-size:12.5px;font-weight:bold;border-radius:10px;padding:1px 9px;background:#fff;color:#1d1b2e}
  .seatbox .tag.win{background:#fde047}.seatbox .tag.lose{background:#fecaca}.seatbox .tag.info{background:#e0e7ff}
  .seatbox.out{opacity:.5}
  `;
  let injected=false; function css(){ if(injected) return; injected=true; const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st); }
  return { RL, SU, r, s, red, name, shuffle, deck, face, back, chip, seatXY, css };
})();
if (typeof module!=='undefined') module.exports=Cards;
