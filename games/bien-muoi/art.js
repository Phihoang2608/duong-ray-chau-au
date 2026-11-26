/* ===================== HÌNH VẼ — BIỂN MUỐI & THUYỀN GIẤY =====================
   Hình tạm bằng vector tự vẽ (phong cách giấy gấp origami + màu nước). Nếu có ảnh
   assets/cards/<mã>.webp thì ảnh sẽ phủ lên trên hình vector này. */
const BMART=(()=>{
  const W=100,H=140;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // nền: số chẵn = ban ngày sáng, số lẻ = chiều tà ấm
  function bg(day,sand){ const sk=day?['#aee6ff','#e8f8ff']:['#ff9d6c','#ffe2a8'], sea=day?['#3fb7e8','#1c7fc0']:['#e0698a','#7a3f8f'];
    const sun=day?`<circle cx="78" cy="26" r="11" fill="#fff6b0" opacity=".95"/><circle cx="78" cy="26" r="17" fill="#fff6b0" opacity=".3"/>`:`<circle cx="26" cy="64" r="15" fill="#ffd36e"/><circle cx="26" cy="64" r="23" fill="#ffd36e" opacity=".3"/>`;
    const cloud=day?`<g fill="#fff" opacity=".9"><ellipse cx="22" cy="22" rx="12" ry="5"/><ellipse cx="31" cy="19" rx="8" ry="5"/></g>`:`<g fill="#ffd9c0" opacity=".8"><ellipse cx="70" cy="30" rx="15" ry="4"/><ellipse cx="60" cy="27" rx="9" ry="4"/></g>`;
    let s=`<defs><linearGradient id="sk${day}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sk[0]}"/><stop offset="1" stop-color="${sk[1]}"/></linearGradient><linearGradient id="se${day}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sea[0]}"/><stop offset="1" stop-color="${sea[1]}"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#sk${day})"/>${sun}${cloud}<rect y="68" width="${W}" height="${H-68}" fill="url(#se${day})"/>
      <g fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"><path d="M0 78 q8-5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t8 0"/><path d="M-6 96 q8-5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0"/><path d="M0 116 q8-5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t8 0"/></g>`;
    if(sand) s+=`<path d="M0 118 Q30 106 60 114 T100 110 V140 H0Z" fill="${day?'#f6e3b0':'#f2c58e'}"/><path d="M0 126 Q40 118 100 124" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>`;
    return s; }
  const P=(d,f,extra)=>`<path d="${d}" fill="${f}" ${extra||''}/>`;
  const fold=(d)=>`<path d="${d}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width=".8"/>`;
  const ART={
    cua:(g)=>`<g transform="translate(50,84)"><g stroke="#b53a1c" stroke-width="3" stroke-linecap="round" fill="none"><path d="M-14 6 l-14 6 M-13 11 l-13 11 M-9 15 l-9 14 M14 6 l14 6 M13 11 l13 11 M9 15 l9 14"/></g>
      <path d="M-22 -4 Q-34 -22 -22 -26 L-14 -14 Z" fill="#e8553a"/><path d="M22 -4 Q34 -22 22 -26 L14 -14 Z" fill="#e8553a"/><path d="M-30 -22 l8 -6 l2 10 Z M30 -22 l-8 -6 l-2 10 Z" fill="#ff7a55"/>
      <ellipse cx="0" cy="6" rx="24" ry="17" fill="#ff6a45"/><path d="M-24 6 Q0 -6 24 6 Q0 -14 -24 6Z" fill="#ff8a63"/><ellipse cx="0" cy="12" rx="18" ry="9" fill="#e8553a" opacity=".5"/>
      <circle cx="-8" cy="-8" r="4.5" fill="#fff"/><circle cx="8" cy="-8" r="4.5" fill="#fff"/><circle cx="-8" cy="-8" r="2.2" fill="#222"/><circle cx="8" cy="-8" r="2.2" fill="#222"/>${fold('M-24 6 L0 -6 L24 6')}</g>`,
    thuyen:(g)=>`<g transform="translate(50,86)"><path d="M-34 6 L34 6 L22 24 L-22 24 Z" fill="#fffaf0"/><path d="M-34 6 L0 12 L34 6 L22 24 L-22 24 Z" fill="#fff" stroke="#e5d9c0" stroke-width=".8"/><path d="M-34 6 L0 12 L-22 24Z" fill="#f2e6cc"/>
      <path d="M0 -40 L0 10 L-26 4 Z" fill="#ffffff"/><path d="M0 -40 L26 4 L0 10Z" fill="#ffe3d0"/><path d="M0 -32 L16 0 L0 4Z" fill="#ff8a65" opacity=".85"/>${fold('M0 -40 L0 10')}<path d="M0 -40 l9 5 l-9 3Z" fill="#e8553a"/>
      <path d="M-38 28 q9 -6 18 0 t18 0 t18 0 t18 0" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/></g>`,
    ca:(g)=>`<g transform="translate(50,88)"><path d="M26 0 L44 -14 L44 14 Z" fill="#ff9a3c"/><ellipse cx="0" cy="0" rx="30" ry="18" fill="#ffb347"/><path d="M-30 0 Q0 -30 30 0 Q0 -10 -30 0Z" fill="#ffd27a"/>
      <path d="M-10 -16 Q-4 0 -10 16 M2 -17 Q8 0 2 17 M14 -13 Q18 0 14 13" fill="none" stroke="#ff7a1a" stroke-width="3"/><circle cx="-18" cy="-4" r="4.5" fill="#fff"/><circle cx="-19" cy="-4" r="2.2" fill="#222"/><path d="M-30 4 q4 3 8 0" fill="none" stroke="#b5521a" stroke-width="1.6"/>
      <path d="M0 -18 L8 -28 L16 -12Z" fill="#ff9a3c"/></g>`,
    map:(g)=>`<g transform="translate(50,88)"><path d="M-38 6 Q-6 -26 34 -6 L42 -22 L42 20 L34 8 Q-6 28 -38 6Z" fill="#6f8aa6"/><path d="M-38 6 Q-6 14 34 8 Q-6 28 -38 6Z" fill="#e9f0f6"/>
      <path d="M-4 -18 L6 -40 L16 -14Z" fill="#587790"/><path d="M-14 12 L-4 26 L4 12Z" fill="#587790"/><circle cx="-24" cy="-1" r="3.4" fill="#fff"/><circle cx="-24.5" cy="-1" r="1.7" fill="#111"/>
      <path d="M-34 6 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3" fill="none" stroke="#fff" stroke-width="1.6"/></g>`,
    boi:(g)=>`<g transform="translate(50,86)"><path d="M-40 14 q10 -7 20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>
      <path d="M-24 6 Q-6 -8 20 2 L24 12 Q0 18 -24 12Z" fill="#ffd2a8"/><path d="M14 4 q18 -26 30 -20" fill="none" stroke="#ffd2a8" stroke-width="7" stroke-linecap="round"/><path d="M-22 8 q-14 -6 -20 4" fill="none" stroke="#ffd2a8" stroke-width="6" stroke-linecap="round"/>
      <circle cx="-24" cy="-6" r="10" fill="#ffd2a8"/><path d="M-34 -8 Q-24 -24 -14 -8Z" fill="#ff5a7a"/><circle cx="-27" cy="-6" r="1.5" fill="#222"/><path d="M-28 -1 q3 3 6 0" fill="none" stroke="#a33" stroke-width="1.2"/>
      <path d="M-14 12 q8 6 20 2 q8 -2 18 2" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/></g>`,
    vo:(g)=>`<g transform="translate(50,88)"><path d="M-36 14 Q-40 -26 0 -34 Q40 -26 36 14 Q0 28 -36 14Z" fill="#ffb7c9"/><g stroke="#e0829c" stroke-width="2" fill="none"><path d="M0 22 L-28 -8 M0 22 L-14 -24 M0 22 L0 -30 M0 22 L14 -24 M0 22 L28 -8"/></g>
      <path d="M-36 14 Q0 28 36 14 L24 26 Q0 34 -24 26Z" fill="#f08aa8"/><circle cx="0" cy="-4" r="5" fill="#fff" opacity=".9"/><circle cx="-1.5" cy="-5.5" r="2" fill="#fff"/></g>`,
    bt:(g)=>`<g transform="translate(50,84)"><g fill="none" stroke="#a259d9" stroke-width="6" stroke-linecap="round"><path d="M-14 12 Q-26 22 -34 16 Q-40 12 -36 6"/><path d="M-6 16 Q-12 30 -22 30"/><path d="M6 16 Q10 30 22 30"/><path d="M14 12 Q26 22 34 16 Q40 12 36 6"/><path d="M0 18 Q0 32 -6 36"/></g>
      <path d="M-24 8 Q-26 -30 0 -30 Q26 -30 24 8 Q0 18 -24 8Z" fill="#b97af0"/><ellipse cx="-8" cy="-14" rx="6" ry="4" fill="#d9b3ff" opacity=".7"/><circle cx="-9" cy="-2" r="5" fill="#fff"/><circle cx="9" cy="-2" r="5" fill="#fff"/><circle cx="-8" cy="-1" r="2.4" fill="#222"/><circle cx="10" cy="-1" r="2.4" fill="#222"/><path d="M-5 8 q5 4 10 0" fill="none" stroke="#6a2ca0" stroke-width="1.4"/></g>`,
    cc:(g)=>`<g transform="translate(50,88)"><path d="M-16 22 Q-22 -34 0 -36 Q22 -34 16 22Z" fill="#2c3547"/><path d="M-9 20 Q-13 -14 0 -22 Q13 -14 9 20Z" fill="#f4f7fb"/><path d="M-16 -2 Q-30 8 -24 20 Q-16 14 -14 6Z" fill="#232b3b"/><path d="M16 -2 Q30 8 24 20 Q16 14 14 6Z" fill="#232b3b"/>
      <circle cx="-5" cy="-20" r="3.2" fill="#fff"/><circle cx="5" cy="-20" r="3.2" fill="#fff"/><circle cx="-5" cy="-20" r="1.5" fill="#111"/><circle cx="5" cy="-20" r="1.5" fill="#111"/><path d="M-4 -14 L4 -14 L0 -8Z" fill="#ff9a1f"/><path d="M-14 24 q6 -6 12 0 z M2 24 q6 -6 12 0 z" fill="#ff9a1f"/>
      <path d="M-9 -30 q9 -8 18 0" fill="none" stroke="#e8553a" stroke-width="3"/></g>`,
    tt:(g)=>`<g transform="translate(50,86)"><path d="M-18 26 L-14 -8 Q0 -14 14 -8 L18 26Z" fill="#fff"/><g fill="#2a56a6"><rect x="-17" y="-2" width="34" height="4"/><rect x="-17" y="8" width="34" height="4"/><rect x="-17" y="18" width="34" height="4"/></g>
      <circle cx="0" cy="-20" r="11" fill="#ffd2a8"/><path d="M-12 -24 Q0 -42 12 -24Z" fill="#fff"/><rect x="-12" y="-26" width="24" height="5" fill="#2a56a6"/><path d="M-12 -28 Q0 -44 12 -28" fill="none" stroke="#e8e8e8" stroke-width="1"/>
      <circle cx="-4" cy="-19" r="1.5" fill="#222"/><circle cx="4" cy="-19" r="1.5" fill="#222"/><path d="M-4 -13 q4 3 8 0" fill="none" stroke="#a33" stroke-width="1.2"/><path d="M-6 -10 L0 -4 L6 -10Z" fill="#e8553a"/>
      <g transform="translate(22,6)"><circle r="5" fill="none" stroke="#6b4b2a" stroke-width="2"/><path d="M0 -10 L0 12 M-8 8 q8 8 16 0" fill="none" stroke="#6b4b2a" stroke-width="2"/></g></g>`,
    hd:(g)=>`<g transform="translate(50,86)"><path d="M-30 30 Q-20 14 -6 16 L6 16 Q20 14 30 30Z" fill="#8b7a68"/><path d="M-10 16 L-7 -30 L7 -30 L10 16Z" fill="#fff"/><path d="M-9.4 -2 L9 2 L9.6 -8 L-9 -12Z" fill="#e8553a"/><path d="M-8.6 -26 L8 -22 L8.4 -30 L-8 -34Z" fill="#e8553a"/>
      <rect x="-9" y="-40" width="18" height="9" fill="#ffe27a" stroke="#6b4b2a" stroke-width="1.4"/><path d="M-12 -40 L0 -52 L12 -40Z" fill="#2a56a6"/><path d="M10 -36 L48 -48 L48 -26Z" fill="#fff6b0" opacity=".55"/><path d="M-10 -36 L-48 -48 L-48 -26Z" fill="#fff6b0" opacity=".45"/>${fold('M-7 -30 L-10 16')}</g>`,
    dc:(g)=>{ const f=(x,y,s,c)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M10 0 L20 -8 L20 8Z" fill="${c}"/><ellipse cx="0" cy="0" rx="14" ry="8" fill="${c}"/><circle cx="-7" cy="-2" r="2.2" fill="#fff"/><circle cx="-7.4" cy="-2" r="1" fill="#111"/></g>`;
      return `<g transform="translate(50,84)">${f(-14,-22,.8,'#ffb347')}${f(14,-14,.9,'#58c6a4')}${f(-18,0,1,'#ff7a8a')}${f(16,8,.8,'#ffcf4a')}${f(-6,20,.8,'#6fb7ff')}${f(20,26,.7,'#ffb347')}${f(-26,-6,.6,'#58c6a4')}</g>`; },
    dcc:(g)=>{ const p=(x,y,s)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M-9 14 Q-12 -18 0 -20 Q12 -18 9 14Z" fill="#2c3547"/><path d="M-5 12 Q-7 -6 0 -12 Q7 -6 5 12Z" fill="#f4f7fb"/><circle cx="-3" cy="-11" r="2" fill="#fff"/><circle cx="3" cy="-11" r="2" fill="#fff"/><circle cx="-3" cy="-11" r=".9" fill="#111"/><circle cx="3" cy="-11" r=".9" fill="#111"/><path d="M-2.5 -7 L2.5 -7 L0 -3Z" fill="#ff9a1f"/><path d="M-8 16 q4 -4 8 0z M0 16 q4 -4 8 0z" fill="#ff9a1f"/></g>`;
      return `<g transform="translate(50,90)">${p(-22,4,1)}${p(0,-6,1.15)}${p(22,4,1)}${p(-10,22,.8)}${p(12,24,.8)}<path d="M-34 32 Q0 22 34 32 L34 40 L-34 40Z" fill="#eef6fb"/></g>`; },
    tn:(g)=>`<g transform="translate(50,86)"><path d="M-20 28 L-16 -6 Q0 -12 16 -6 L20 28Z" fill="#1f3a6b"/><path d="M-4 -6 L0 6 L4 -6Z" fill="#fff"/><g fill="#f3c542"><circle cx="-8" cy="6" r="1.6"/><circle cx="-8" cy="14" r="1.6"/><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="14" r="1.6"/></g>
      <circle cx="0" cy="-20" r="12" fill="#ffd2a8"/><path d="M-12 -14 Q0 6 12 -14 Q0 -4 -12 -14Z" fill="#e9eef5"/><path d="M-16 -24 L16 -24 L12 -36 Q0 -44 -12 -36Z" fill="#fff"/><rect x="-16" y="-26" width="32" height="6" rx="2" fill="#1f3a6b"/><circle cx="0" cy="-30" r="3" fill="#f3c542"/>
      <circle cx="-4" cy="-19" r="1.6" fill="#222"/><circle cx="4" cy="-19" r="1.6" fill="#222"/><g transform="translate(-26,10)" stroke="#8a5a2a" stroke-width="2.2" fill="none"><circle r="9"/><path d="M0 -13 V13 M-13 0 H13 M-9 -9 L9 9 M9 -9 L-9 9"/></g></g>`,
    tf:(g)=>`<g transform="translate(50,86)"><path d="M-14 8 Q-26 36 0 40 Q26 36 14 8Z" fill="#3ec9b5"/><path d="M-6 36 Q-24 46 -34 34 Q-24 30 -12 32Z M6 36 Q24 46 34 34 Q24 30 12 32Z" fill="#7be0d0"/><g stroke="#2aa595" stroke-width="1" fill="none"><path d="M-8 14 q8 6 16 0 M-9 22 q9 6 18 0 M-8 30 q8 5 16 0"/></g>
      <path d="M-18 -30 Q-30 10 -14 22 Q-8 0 -10 -22Z M18 -30 Q30 10 14 22 Q8 0 10 -22Z" fill="#e8553a"/><path d="M-12 8 L12 8 L10 -14 Q0 -20 -10 -14Z" fill="#ffd2a8"/><circle cx="0" cy="-26" r="11" fill="#ffd2a8"/><path d="M-12 -30 Q0 -44 12 -30 Q0 -34 -12 -30Z" fill="#e8553a"/><circle cx="-4" cy="-25" r="1.5" fill="#222"/><circle cx="4" cy="-25" r="1.5" fill="#222"/><path d="M-3 -20 q3 3 6 0" fill="none" stroke="#c33" stroke-width="1.3"/>
      <circle cx="-7" cy="2" r="4.2" fill="#ffb7c9"/><circle cx="7" cy="2" r="4.2" fill="#ffb7c9"/><path d="M-12 -10 l-6 -8 M12 -10 l6 -8" stroke="#f3c542" stroke-width="2"/><circle cx="0" cy="-38" r="3" fill="#f3c542"/></g>`
  };
  const SAND={cua:1,vo:1,cc:1,tt:1,dcc:1,hd:1};
  function svg(t,id){ const day=id%2===0?1:0, a=ART[t]?ART[t](id):''; return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bg(day,SAND[t])}${a}</svg>`; }
  const TYPEN={}; (typeof BM_TYPES!=='undefined'?BM_TYPES:[]).forEach(T=>TYPEN[T.k]=T.name);
  // lá bài có mặt: khung theo màu, chấm màu ở góc, tên ở dưới (ẩn khi lá nhỏ bằng CSS)
  function card(id,extra){ const C=BM.CARDS[id], col=BM_COL[C.c], t=C.t;
    return `<div class="bmc ${extra||''}" data-cid="${id}" data-t="${t}" style="--cc:${col.h}" title="${esc(TYPEN[t]||t)} · ${esc(col.n)}"><div class="art">${svg(t,id)}<img alt="" loading="lazy" src="assets/cards/${t}.webp" onerror="this.remove()"></div><i class="pip"></i><b class="nm">${esc(TYPEN[t]||t)}</b></div>`; }
  function back(extra){ return `<div class="bmc back ${extra||''}"><div class="art"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14527f"/><stop offset="1" stop-color="#0a2e52"/></linearGradient></defs>
      <rect width="100" height="140" fill="url(#bkg)"/><g fill="none" stroke="#e9c46a" stroke-opacity=".5" stroke-width="1.1">${[0,1,2,3,4,5,6,7,8].map(r=>`<path d="M-6 ${12+r*15} q8-8 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0"/>`).join('')}</g>
      <g transform="translate(50,70)"><path d="M-22 8 L22 8 L14 22 L-14 22Z" fill="#fff6dd"/><path d="M0 -28 L0 6 L-18 2Z" fill="#fff"/><path d="M0 -28 L18 2 L0 6Z" fill="#ffd9a8"/><path d="M-26 26 q6 -5 13 0 t13 0 t13 0 t13 0" fill="none" stroke="#9ad7ff" stroke-width="2"/></g>
      <rect x="4" y="4" width="92" height="132" rx="7" fill="none" stroke="#e9c46a" stroke-width="2"/><rect x="8" y="8" width="84" height="124" rx="5" fill="none" stroke="#e9c46a" stroke-opacity=".5" stroke-width=".8"/>
      <g fill="#e9c46a"><circle cx="12" cy="12" r="2"/><circle cx="88" cy="12" r="2"/><circle cx="12" cy="128" r="2"/><circle cx="88" cy="128" r="2"/></g></svg></div></div>`; }
  function clock(el){ const left=Math.max(0,60-el), R=38, C=(2*Math.PI*R).toFixed(2);
    const ticks=[...Array(60)].map((_,k)=>{ const a=k*6*Math.PI/180, L=k%5?2:4.6, r1=33; return `<line x1="${(50+r1*Math.sin(a)).toFixed(2)}" y1="${(50-r1*Math.cos(a)).toFixed(2)}" x2="${(50+(r1-L)*Math.sin(a)).toFixed(2)}" y2="${(50-(r1-L)*Math.cos(a)).toFixed(2)}" stroke="${k%5?'#c9a55a':'#ffe9a8'}" stroke-width="${k%5?.6:1.3}"/>`; }).join('');
    const pearls=[...Array(24)].map((_,k)=>{ const a=k*15*Math.PI/180; return `<circle cx="${(50+46*Math.sin(a)).toFixed(2)}" cy="${(50-46*Math.cos(a)).toFixed(2)}" r="${k%6?1.1:2}" fill="${k%6?'#fff6d8':'#37c6d6'}"/>`; }).join('');
    return `<svg viewBox="-4 -16 108 120" class="ckw ${left<=10?'low':''}" data-el="${el}"><defs><radialGradient id="ckF" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#1b4f73"/><stop offset=".7" stop-color="#0d2c47"/><stop offset="1" stop-color="#06182a"/></radialGradient>
<linearGradient id="ckG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset=".3" stop-color="#e2b13c"/><stop offset=".55" stop-color="#8a5a12"/><stop offset=".8" stop-color="#f4cf68"/><stop offset="1" stop-color="#6b420b"/></linearGradient></defs>
<path d="M34 -2 L36 -11 L42 -5 L50 -14 L58 -5 L64 -11 L66 -2 Z" fill="url(#ckG)" stroke="#5a3a08" stroke-width=".8"/><circle cx="50" cy="-14" r="2" fill="#37c6d6"/>
<circle cx="50" cy="50" r="49" fill="url(#ckG)" stroke="#4a2e06" stroke-width="1"/>${pearls}<circle cx="50" cy="50" r="43" fill="#0a2236" stroke="#6b420b" stroke-width="1"/>
<circle cx="50" cy="50" r="${R}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="5"/><circle class="ckarc" cx="50" cy="50" r="${R}" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C}" style="--C:${C};animation-delay:-${el}s" transform="rotate(-90 50 50)"/>
<circle cx="50" cy="50" r="35" fill="url(#ckF)" stroke="url(#ckG)" stroke-width="1.5"/>${ticks}
<g class="ckhand" style="animation-delay:-${el}s"><path d="M48.7 50 L49.4 22 L50.6 22 L51.3 50Z" fill="url(#ckG)" stroke="#2a1702" stroke-width=".6"/><circle cx="50" cy="20" r="2.4" fill="none" stroke="#ffe9a8" stroke-width="1"/></g>
<circle cx="50" cy="50" r="3.6" fill="url(#ckG)" stroke="#5a3a08" stroke-width=".5"/>
<g class="ckdig"><rect x="36" y="58" width="28" height="15" rx="7.5" fill="#06182a" stroke="url(#ckG)" stroke-width=".9"/><text x="50" y="69.6" class="ckt">${left}</text></g></svg>`; }
  return {card,back,svg,clock,TYPEN};
})();
