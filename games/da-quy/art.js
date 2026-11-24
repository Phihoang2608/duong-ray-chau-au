/* ===================== ĐỒ HOẠ THƯƠNG NHÂN ĐÁ QUÝ ===================== */
const DQART=(()=>{
  // ---------- màu ----------
  const PAL=[ // nền, sáng, tối
    ['#11a35c','#a6ffd0','#02331a'], ['#2257e0','#a9c6ff','#06123f'], ['#d8122f','#ffb0bd','#45020d'],
    ['#dfe8f4','#ffffff','#7d8ea8'], ['#26262e','#b9bfd4','#000000'], ['#e9a514','#fff4b0','#6e4200']];
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const mix=(a,b,t)=>{ const A=rgb(a),B=rgb(b); return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join(''); };
  const sh=(c,v)=>{ const p=PAL[c]; v=Math.max(-1,Math.min(1,v)); return v>=0?mix(p[0],p[1],v):mix(p[0],p[2],-v); };
  const f=n=>Math.round(n*100)/100;
  const pts=a=>a.map(p=>f(p[0])+','+f(p[1])).join(' ');
  const rng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const LIGHT=-2.2; // hướng sáng (góc trên trái)
  const tw=(x,y,s,d)=>`<path class="tw" style="animation-delay:${d||0}s;transform-origin:${f(x)}px ${f(y)}px" d="M${f(x)},${f(y-s)} L${f(x+s*.22)},${f(y-s*.22)} L${f(x+s)},${f(y)} L${f(x+s*.22)},${f(y+s*.22)} L${f(x)},${f(y+s)} L${f(x-s*.22)},${f(y+s*.22)} L${f(x-s)},${f(y)} L${f(x-s*.22)},${f(y-s*.22)}Z" fill="#fff"/>`;
  // ---------- ngọc: kiểu giác tròn (brilliant) ----------
  function brilliant(cx,cy,r,c,sx,sy,seed){ sx=sx||1; sy=sy||1; const N=8, R=rng(seed||7), P=(rr,a)=>[cx+Math.cos(a)*rr*sx, cy+Math.sin(a)*rr*sy];
    const A=k=>k*Math.PI*2/N-Math.PI/2, H=Math.PI/N;
    const T=k=>P(r*.52,A(k)+H), S=k=>P(r*.8,A(k)), G=a=>P(r,a);
    const lum=a=>Math.cos(a-LIGHT);
    let s=`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r*sx)}" ry="${f(r*sy)}" fill="${sh(c,-.75)}"/>`;
    const fire=c===3?['#ffe0f6','#d4f6ff','#fff4c9','#e2ffd9']:null;
    for(let k=0;k<N;k++){ const a=A(k), noise=(R()-.5)*.7;
      // mặt diều
      let v=lum(a+H)*.55+noise; s+=`<polygon points="${pts([T(k),S(k),G(a+H),S(k+1)])}" fill="${fire&&k%2?mix(sh(c,v),fire[k%4],.55):sh(c,v)}"/>`;
      // mặt sao
      v=lum(a)*.45+.25+(R()-.5)*.5; s+=`<polygon points="${pts([T(k-1),S(k),T(k)])}" fill="${sh(c,v)}"/>`;
      // mặt viền trên
      v=lum(a-H/2)*.7-.15+(R()-.5)*.6; s+=`<polygon points="${pts([S(k),G(a-H),G(a)])}" fill="${fire&&k%3===0?mix(sh(c,v),fire[(k+1)%4],.5):sh(c,v)}"/>`;
      v=lum(a+H/2)*.7-.15+(R()-.5)*.6; s+=`<polygon points="${pts([S(k),G(a),G(a+H)])}" fill="${sh(c,v)}"/>`; }
    const tb=[]; for(let k=0;k<N;k++) tb.push(T(k));
    s+=`<polygon points="${pts(tb)}" fill="${sh(c,.18)}"/><polygon points="${pts([T(5),T(6),T(7),P(r*.15,-1.2)])}" fill="#fff" opacity=".28"/>`;
    s+=`<g fill="none" stroke="${sh(c,.75)}" stroke-width="${f(r*.025)}" opacity=".55"><polygon points="${pts(tb)}"/>${[...Array(N)].map((_,k)=>`<polyline points="${pts([T(k-1),S(k),T(k)])}"/><polyline points="${pts([S(k),G(A(k)+H),S(k+1)])}"/>`).join('')}</g>`;
    s+=`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r*sx)}" ry="${f(r*sy)}" fill="none" stroke="${sh(c,-.9)}" stroke-width="${f(r*.06)}"/>`;
    s+=`<ellipse cx="${f(cx-r*.3*sx)}" cy="${f(cy-r*.42*sy)}" rx="${f(r*.28*sx)}" ry="${f(r*.12*sy)}" fill="#fff" opacity=".45" transform="rotate(-28 ${f(cx-r*.3*sx)} ${f(cy-r*.42*sy)})"/>`;
    return s+tw(cx-r*.34*sx,cy-r*.38*sy,r*.32,(seed%7)*.4); }
  // ---------- ngọc: giác bậc (lục bảo) ----------
  function stepCut(cx,cy,r,c,seed){ const a=r*.78, b=r, k=r*.3; const oct=s=>[[-a+k,-b],[a-k,-b],[a,-b+k],[a,b-k],[a-k,b],[-a+k,b],[-a,b-k],[-a,-b+k]].map(([x,y])=>[cx+x*s,cy+y*s]);
    const rings=[1,.8,.62,.46]; const nrm=[-Math.PI/2,-Math.PI/4,0,Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI,-3*Math.PI/4];
    let s=''; for(let i=0;i<rings.length-1;i++){ const O=oct(rings[i]), I=oct(rings[i+1]); for(let j=0;j<8;j++){ const v=Math.cos(nrm[j]-LIGHT)*(.7-i*.15)+(i%2?.15:-.15); s+=`<polygon points="${pts([O[j],O[(j+1)%8],I[(j+1)%8],I[j]])}" fill="${sh(c,v)}" stroke="${sh(c,.6)}" stroke-width="${f(r*.02)}" stroke-opacity=".5"/>`; } }
    const T=oct(.46); s+=`<polygon points="${pts(T)}" fill="${sh(c,.05)}"/><polygon points="${pts([[cx-a*.46,cy-b*.1],[cx-a*.1,cy-b*.46],[cx+a*.1,cy-b*.46],[cx-a*.46,cy+b*.15]])}" fill="#fff" opacity=".3"/>`;
    s+=`<polygon points="${pts(oct(1))}" fill="none" stroke="${sh(c,-.9)}" stroke-width="${f(r*.06)}"/>`;
    return s+tw(cx-a*.45,cy-b*.55,r*.33,(seed%5)*.5); }
  // ---------- hắc ngọc (cabochon) ----------
  function cabochon(cx,cy,r,seed){ return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r)}" ry="${f(r*.92)}" fill="url(#dqOnyx)" stroke="#000" stroke-width="${f(r*.06)}"/>
      <ellipse cx="${f(cx)}" cy="${f(cy+r*.1)}" rx="${f(r*.82)}" ry="${f(r*.7)}" fill="none" stroke="#6b6f86" stroke-width="${f(r*.05)}" opacity=".5"/>
      <path d="M${f(cx-r*.62)},${f(cy-r*.18)} Q${f(cx-r*.5)},${f(cy-r*.72)} ${f(cx+r*.1)},${f(cy-r*.74)} Q${f(cx-r*.3)},${f(cy-r*.55)} ${f(cx-r*.62)},${f(cy-r*.18)}Z" fill="#fff" opacity=".75"/>
      <ellipse cx="${f(cx+r*.35)}" cy="${f(cy+r*.45)}" rx="${f(r*.25)}" ry="${f(r*.1)}" fill="#8d93b0" opacity=".45" transform="rotate(-35 ${f(cx+r*.35)} ${f(cy+r*.45)})"/>`+tw(cx-r*.25,cy-r*.55,r*.3,(seed%4)*.6); }
  // ---------- vàng (đồng xu) ----------
  function coin(cx,cy,r,seed){ let s=`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="url(#dqCoin)" stroke="#6e4200" stroke-width="${f(r*.05)}"/>`;
    s+=`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r*.92)}" fill="none" stroke="#7a4a00" stroke-width="${f(r*.1)}" stroke-dasharray="${f(r*.06)} ${f(r*.08)}" opacity=".55"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r*.74)}" fill="none" stroke="#fff3b0" stroke-width="${f(r*.05)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r*.68)}" fill="none" stroke="#9a6400" stroke-width="${f(r*.04)}"/>`;
    const st=[]; for(let i=0;i<10;i++){ const a=i*Math.PI/5-Math.PI/2, rr=i%2?r*.24:r*.55; st.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]); }
    s+=`<polygon points="${pts(st.map(p=>[p[0]+r*.04,p[1]+r*.05]))}" fill="#7a4a00" opacity=".6"/><polygon points="${pts(st)}" fill="url(#dqCoinStar)"/>`;
    return s+`<ellipse cx="${f(cx-r*.35)}" cy="${f(cy-r*.45)}" rx="${f(r*.35)}" ry="${f(r*.14)}" fill="#fff" opacity=".5" transform="rotate(-35 ${f(cx-r*.35)} ${f(cy-r*.45)})"/>`+tw(cx+r*.3,cy-r*.45,r*.28,(seed%3)*.7); }
  function gem(c,cx,cy,r,seed){ seed=seed||c*13+5;
    if(c===0) return stepCut(cx,cy,r,0,seed);
    if(c===1) return brilliant(cx,cy,r,1,.82,1,seed);
    if(c===2) return brilliant(cx,cy,r,2,1,1,seed+3);
    if(c===3) return brilliant(cx,cy,r,3,1,1,seed+9);
    if(c===4) return cabochon(cx,cy,r,seed);
    return coin(cx,cy,r,seed); }
  const gemSVG=(c,sz,seed)=>`<svg class="gemi" viewBox="-12 -12 24 24" width="${sz}" height="${sz}">${gem(c,0,0,10.5,seed)}</svg>`;
  // ---------- defs dùng chung ----------
  function defs(){ let d='<radialGradient id="dqOnyx" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#6a6f86"/><stop offset=".35" stop-color="#22232c"/><stop offset="1" stop-color="#030305"/></radialGradient>';
    d+='<radialGradient id="dqCoin" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff6c2"/><stop offset=".4" stop-color="#f2c230"/><stop offset=".8" stop-color="#c98a06"/><stop offset="1" stop-color="#8a5a00"/></radialGradient>';
    d+='<linearGradient id="dqCoinStar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#f5cf4a"/><stop offset="1" stop-color="#b57a04"/></linearGradient>';
    d+='<linearGradient id="dqGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset=".25" stop-color="#d9a92a"/><stop offset=".5" stop-color="#8a5a06"/><stop offset=".75" stop-color="#f3cf5c"/><stop offset="1" stop-color="#9b6a0c"/></linearGradient>';
    d+='<linearGradient id="dqShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".45" stop-color="#fff" stop-opacity=".0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>';
    d+='<linearGradient id="dqBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf5" stop-opacity=".97"/><stop offset="1" stop-color="#f3e6c4" stop-opacity=".9"/></linearGradient>';
    d+='<radialGradient id="dqMarble" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#efe3cc"/><stop offset="1" stop-color="#d9c6a2"/></radialGradient>';
    d+='<radialGradient id="dqSkin" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffe3c8"/><stop offset=".7" stop-color="#eab78f"/><stop offset="1" stop-color="#c98d64"/></radialGradient>';
    for(let c=0;c<6;c++){ d+=`<radialGradient id="dqChip${c}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="${sh(c,.55)}"/><stop offset=".55" stop-color="${sh(c,0)}"/><stop offset="1" stop-color="${sh(c,-.6)}"/></radialGradient>`;
      d+=`<linearGradient id="dqSky${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(sh(c,c===4?.3:-.2),'#1b1640',.35)}"/><stop offset=".6" stop-color="${mix(sh(c,.45),'#ffd9a0',.35)}"/><stop offset="1" stop-color="${mix(sh(c,.7),'#fff2d6',.5)}"/></linearGradient>`;
      d+=`<linearGradient id="dqCave${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1410"/><stop offset=".55" stop-color="${mix('#4a3324',sh(c,-.3),.35)}"/><stop offset="1" stop-color="${mix('#7a5a3c',sh(c,0),.3)}"/></linearGradient>`;
      d+=`<linearGradient id="dqBon${c}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sh(c,.5)}"/><stop offset=".5" stop-color="${sh(c,0)}"/><stop offset="1" stop-color="${sh(c,-.55)}"/></linearGradient>`; }
    [['#2e8b67','#0c3b2a'],['#c8901e','#5a3a05'],['#3f57c9','#111a55']].forEach(([a,b],i)=>{ d+=`<radialGradient id="dqDeck${i+1}" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`; });
    d+='<pattern id="dqLattice" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="none"/><path d="M0 0 H10 M0 0 V10" stroke="#fff" stroke-opacity=".14" stroke-width="1"/><circle cx="5" cy="5" r=".9" fill="#fff" fill-opacity=".2"/></pattern>';
    d+='<filter id="dqDrop" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.2" stdDeviation="1" flood-opacity=".45"/></filter>';
    d+='<linearGradient id="dqGoldM" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="12" y2="130"><stop offset="0" stop-color="#fff6c4"/><stop offset=".15" stop-color="#e7b733"/><stop offset=".3" stop-color="#8a5a06"/><stop offset=".45" stop-color="#f9dc6e"/><stop offset=".6" stop-color="#b07c0e"/><stop offset=".75" stop-color="#ffeaa0"/><stop offset=".9" stop-color="#9a6a0a"/><stop offset="1" stop-color="#e9c04a"/></linearGradient>';
    d+='<linearGradient id="dqSilverM" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="12" y2="130"><stop offset="0" stop-color="#ffffff"/><stop offset=".15" stop-color="#c3cad4"/><stop offset=".3" stop-color="#6b7480"/><stop offset=".45" stop-color="#eef2f7"/><stop offset=".6" stop-color="#8d96a2"/><stop offset=".75" stop-color="#f7f9fc"/><stop offset=".9" stop-color="#7b8490"/><stop offset="1" stop-color="#d5dbe3"/></linearGradient>';
    d+='<radialGradient id="dqPearl" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f1ece2"/><stop offset="1" stop-color="#c9bfae"/></radialGradient>';
    d+='<radialGradient id="dqOrb" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff6c4"/><stop offset=".35" stop-color="#e9b730"/><stop offset=".8" stop-color="#9a6406"/><stop offset="1" stop-color="#5e3a00"/></radialGradient>';
    d+='<radialGradient id="dqSpot" cx="50%" cy="45%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
    d+='<linearGradient id="dqSweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
    d+='<linearGradient id="dqSatin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf3e6"/><stop offset=".5" stop-color="#e9d9c0"/><stop offset="1" stop-color="#c9b394"/></linearGradient>';
    d+='<linearGradient id="dqWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4f24"/><stop offset="1" stop-color="#4a230c"/></linearGradient>';
    d+='<filter id="dqBlur" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="2"/></filter>';
    d+='<pattern id="dqWeave" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0 L4 4 M4 0 L0 4" stroke="#fff" stroke-opacity=".08" stroke-width=".6"/></pattern>';
    d+='<pattern id="dqDamask" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10 3 Q14 7 10 11 Q6 7 10 3Z M0 13 Q4 17 0 21 M20 13 Q16 17 20 21" fill="#e9c04a" opacity=".14"/><circle cx="10" cy="15" r=".9" fill="#e9c04a" opacity=".22"/></pattern>';
    for(let c=0;c<5;c++){ d+=`<radialGradient id="dqVel1_${c}" cx="55%" cy="45%" r="80%"><stop offset="0" stop-color="${mix('#5a1a24',sh(c,-.2),.4)}"/><stop offset="1" stop-color="${mix('#1a0608',sh(c,-.8),.3)}"/></radialGradient>`;
      d+=`<radialGradient id="dqVel3_${c}" cx="55%" cy="40%" r="80%"><stop offset="0" stop-color="${mix('#3a1660',sh(c,-.1),.45)}"/><stop offset="1" stop-color="${mix('#0c0420',sh(c,-.8),.35)}"/></radialGradient>`;
      d+=`<linearGradient id="dqBand${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix('#fffdf5',sh(c,.6),.3)}"/><stop offset="1" stop-color="${mix('#f3e6c4',sh(c,.2),.35)}"/></linearGradient>`; }
    return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${d}</defs></svg>`; }
  // ---------- tinh thể ----------
  function crystal(x,y,h,w,c,ang){ const t=`rotate(${ang} ${f(x)} ${f(y)})`;
    return `<g transform="${t}"><polygon points="${pts([[x-w,y],[x-w,y-h],[x,y-h-w*1.3],[x,y]])}" fill="${sh(c,.45)}"/><polygon points="${pts([[x,y],[x,y-h-w*1.3],[x+w,y-h],[x+w,y]])}" fill="${sh(c,-.35)}"/><polygon points="${pts([[x-w*.35,y],[x-w*.35,y-h],[x,y-h-w*1.1],[x+w*.2,y-h],[x+w*.2,y]])}" fill="${sh(c,.1)}" opacity=".7"/><line x1="${f(x-w*.6)}" y1="${f(y-h*.2)}" x2="${f(x-w*.6)}" y2="${f(y-h*.85)}" stroke="#fff" stroke-width="${f(w*.25)}" opacity=".55"/></g>`; }
  function cluster(x,y,s,c,R){ let o=''; const n=3+Math.floor(R()*3); const arr=[]; for(let i=0;i<n;i++) arr.push([(R()-.5)*14*s,(6+R()*12)*s,(1.6+R()*1.6)*s,(R()-.5)*60]); arr.sort((a,b)=>b[1]-a[1]); arr.forEach(([dx,h,w,a])=>o+=crystal(x+dx,y,h,w,c,a)); return o; }
  // ---------- cảnh minh hoạ ----------
  function sceneMine(c,R,v){ let s=`<rect x="0" y="0" width="100" height="140" fill="url(#dqCave${c})"/>`;
    s+=`<path d="M0 30 Q20 18 38 28 T70 22 T100 30 L100 0 L0 0Z" fill="#120c09"/>`;
    for(let i=0;i<7;i++){ const x=R()*100,y=40+R()*50; s+=`<polygon points="${pts([[x-12,y+6],[x-6,y-8],[x+5,y-10],[x+13,y+4]])}" fill="${mix('#5a4030','#2a1d15',R())}" opacity=".7"/>`; }
    if(v===0){ // cửa hầm và xe goòng
      s+=`<path d="M28 108 L28 62 Q50 38 72 62 L72 108Z" fill="#080504"/><rect x="24" y="56" width="7" height="54" fill="#7a5230"/><rect x="69" y="56" width="7" height="54" fill="#6a4426"/><rect x="20" y="50" width="60" height="8" rx="1" fill="#8b5e36"/><rect x="20" y="50" width="60" height="2.5" fill="#b98652"/>`;
      s+=`<circle cx="50" cy="70" r="3" fill="#ffd27a"/><circle cx="50" cy="70" r="9" fill="#ffd27a" opacity=".18"/>`;
      s+=`<path d="M18 140 L42 100 M82 140 L58 100" stroke="#9aa0a8" stroke-width="2"/>${[0,1,2,3].map(i=>{ const y=104+i*10, w=18+i*7; return `<rect x="${50-w}" y="${y}" width="${w*2}" height="2.5" fill="#5b3a20"/>`; }).join('')}`;
      s+=`<g transform="translate(50,112)"><polygon points="-20,-14 20,-14 15,6 -15,6" fill="#4a4f57" stroke="#22252a" stroke-width="1"/><polygon points="-20,-14 20,-14 18,-10 -18,-10" fill="#7d848f"/>${[-14,-5,5,14].map(x=>`<circle cx="${x}" cy="-3" r=".9" fill="#a9b0ba"/>`).join('')}`;
      for(let i=0;i<5;i++) s+=gem(c,-13+i*6.5,-15-(i%2)*3,3.6,i*7);
      s+=`<circle cx="-11" cy="8" r="4" fill="#222"/><circle cx="11" cy="8" r="4" fill="#222"/><circle cx="-11" cy="8" r="1.4" fill="#888"/><circle cx="11" cy="8" r="1.4" fill="#888"/></g>`;
      s+=cluster(12,112,1,c,R)+cluster(90,104,.9,c,R); }
    else if(v===1){ // hang tinh thể
      s+=`<ellipse cx="50" cy="96" rx="40" ry="30" fill="#0c0806"/><ellipse cx="50" cy="96" rx="40" ry="30" fill="none" stroke="${sh(c,.2)}" stroke-width="2" opacity=".6"/>`;
      s+=`<ellipse cx="50" cy="96" rx="34" ry="24" fill="${sh(c,-.6)}" opacity=".5"/>`+cluster(50,112,1.6,c,R)+cluster(30,104,1,c,R)+cluster(72,106,1.1,c,R);
      s+=`<ellipse cx="50" cy="96" rx="30" ry="20" fill="${sh(c,.6)}" opacity=".12"/>`; }
    else { // cuốc, đèn và đá
      s+=`<path d="M0 118 Q30 100 55 112 T100 104 L100 140 L0 140Z" fill="#3b2a1e"/>`+cluster(64,116,1.5,c,R)+cluster(86,120,.9,c,R);
      s+=`<g transform="translate(26,96) rotate(-30)"><rect x="-1.6" y="-4" width="3.2" height="34" rx="1" fill="#8b5e36"/><path d="M-16,-2 Q0,-12 16,-2 L14,1 Q0,-7 -14,1Z" fill="#9aa1ab" stroke="#3a3f46" stroke-width=".8"/></g>`;
      s+=`<g transform="translate(18,72)"><line x1="0" y1="-12" x2="0" y2="-6" stroke="#333" stroke-width="1"/><rect x="-5" y="-6" width="10" height="13" rx="2" fill="#2d2d2d"/><rect x="-3.5" y="-4" width="7" height="9" fill="#ffcf6a"/><circle cx="0" cy="1" r="13" fill="#ffcf6a" opacity=".15"/></g>`; }
    return s; }
  function sceneShop(c,R,v){ let s='';
    if(v===0){ // xưởng chế tác
      s+=`<rect width="100" height="140" fill="#5a3a24"/><rect width="100" height="140" fill="url(#dqLattice)" opacity=".25"/>`;
      s+=`<path d="M28 98 L28 52 Q50 26 72 52 L72 98Z" fill="url(#dqSky${c})" stroke="#2b1a0e" stroke-width="3"/><path d="M50 30 V98 M28 70 H72" stroke="#2b1a0e" stroke-width="2"/>`;
      s+=`<circle cx="60" cy="48" r="5" fill="#fff5d0" opacity=".8"/>`;
      s+=`<rect x="0" y="98" width="100" height="42" fill="#7a4e2b"/><rect x="0" y="98" width="100" height="4" fill="#a8743f"/><path d="M0 110 H100 M0 124 H100" stroke="#5e3a1d" stroke-width=".8"/>`;
      s+=`<ellipse cx="50" cy="106" rx="16" ry="5" fill="${sh(c,-.4)}"/><ellipse cx="50" cy="104" rx="15" ry="4.5" fill="#8a1d3a"/>`+gem(c,50,98,9,31);
      s+=`<g transform="translate(78,94) rotate(25)"><circle r="8" fill="#cfe9ff" fill-opacity=".35" stroke="#b5882f" stroke-width="2.2"/><rect x="-1.6" y="8" width="3.2" height="14" rx="1.5" fill="#5b3a1d"/><ellipse cx="-3" cy="-3" rx="3" ry="1.4" fill="#fff" opacity=".7"/></g>`;
      for(let i=0;i<3;i++) s+=gem(c,14+i*8,104+(i%2)*3,3,i*9); }
    else { // thuyền buôn
      s+=`<rect width="100" height="140" fill="url(#dqSky${c})"/><circle cx="74" cy="38" r="10" fill="#fff4d0" opacity=".85"/>`;
      s+=`<path d="M0 98 Q25 92 50 97 T100 95 L100 140 L0 140Z" fill="${mix(sh(c,-.3),'#0b3a5c',.6)}"/>`;
      for(let i=0;i<6;i++){ const y=104+i*6; s+=`<path d="M${R()*30} ${y} q6 -2 12 0 M${50+R()*40} ${y+2} q6 -2 12 0" stroke="#fff" stroke-opacity=".35" fill="none"/>`; }
      s+=`<g transform="translate(50,96)"><path d="M-30,-4 L30,-4 L22,10 L-24,10Z" fill="#5b3418" stroke="#2a170a" stroke-width="1"/><path d="M-30,-4 L30,-4" stroke="#a36a35" stroke-width="2"/>${[-18,-8,2,12].map(x=>`<circle cx="${x}" cy="3" r="1.4" fill="#2a170a"/>`).join('')}
        <line x1="-6" y1="-4" x2="-6" y2="-56" stroke="#3a2412" stroke-width="2"/><line x1="12" y1="-4" x2="12" y2="-40" stroke="#3a2412" stroke-width="1.6"/>
        <path d="M-5,-54 Q10,-42 -5,-10 Z" fill="${sh(c,.55)}" stroke="${sh(c,-.3)}" stroke-width=".8"/><path d="M-7,-52 Q-24,-36 -7,-12 Z" fill="${sh(c,.25)}" stroke="${sh(c,-.3)}" stroke-width=".8"/><path d="M13,-38 Q24,-26 13,-10Z" fill="${sh(c,.4)}"/>
        <path d="M-6,-56 L4,-60 L-6,-63Z" fill="${sh(c,-.1)}"/></g>`; }
    return s; }
  function scenePalace(c,R,v){ let s=`<rect width="100" height="140" fill="url(#dqSky${c})"/>`;
    for(let i=0;i<14;i++) s+=`<circle cx="${f(R()*100)}" cy="${f(R()*40)}" r="${f(R()*.8+.3)}" fill="#fff" opacity="${f(.4+R()*.5)}"/>`;
    s+=`<ellipse cx="50" cy="128" rx="70" ry="22" fill="${mix(sh(c,-.5),'#2a1d33',.4)}"/>`;
    if(v===0){ // cung điện mái vòm
      const W=mix('#f3e6cc',sh(c,.6),.15), D=mix('#c9b48d',sh(c,-.2),.2);
      s+=`<rect x="14" y="76" width="72" height="44" fill="${W}"/><rect x="62" y="76" width="24" height="44" fill="${D}"/>`;
      s+=`<rect x="8" y="58" width="12" height="62" fill="${W}"/><rect x="80" y="58" width="12" height="62" fill="${D}"/><path d="M7 58 Q14 42 21 58Z M79 58 Q86 42 93 58Z" fill="url(#dqGold)"/>`;
      s+=`<path d="M32 76 Q32 46 50 40 Q68 46 68 76Z" fill="url(#dqGold)"/><path d="M50 40 Q60 46 64 76 L68 76 Q68 46 50 40Z" fill="#7a4f06" opacity=".35"/><line x1="50" y1="40" x2="50" y2="28" stroke="#d6a62a" stroke-width="1.5"/><circle cx="50" cy="27" r="2" fill="#ffe27a"/>`;
      s+=`<path d="M50 30 L60 33 L50 36Z" fill="${sh(c,0)}"/>`;
      [22,36,50,64,78].forEach(x=>{ s+=`<path d="M${x-4} 120 V98 Q${x} 92 ${x+4} 98 V120Z" fill="#2a1c12"/><path d="M${x-3} 100 Q${x} 95 ${x+3} 100" stroke="#ffd56a" fill="none" stroke-width=".8"/>`; });
      [24,76].forEach(x=>{ s+=`<rect x="${x-0.6}" y="62" width="1.2" height="16" fill="#3a2412"/><path d="M${x+0.6} 62 h9 l-2 4 l2 4 h-9z" fill="${sh(c,0)}"/>`; });
      s+=`<rect x="34" y="120" width="32" height="4" fill="${D}"/><rect x="30" y="124" width="40" height="4" fill="${W}"/>`;
      s+=gem(c,50,86,6,41); }
    else { // thành phố cảng và ngọn hải đăng
      s+=`<path d="M0 106 Q50 98 100 106 L100 140 L0 140Z" fill="${mix(sh(c,-.4),'#0b2a4c',.5)}"/>`;
      const B=[[6,82,14],[20,70,12],[32,78,10],[64,74,12],[76,66,10],[86,80,12]]; B.forEach(([x,y,w],i)=>{ const col=mix('#efe0c2',sh(c,.4),.2+(i%3)*.1); s+=`<rect x="${x}" y="${y}" width="${w}" height="${106-y}" fill="${col}"/><polygon points="${x-1},${y} ${x+w/2},${y-7} ${x+w+1},${y}" fill="${mix(sh(c,-.2),'#7a2e1a',.5)}"/>${[0,1,2].map(k=>`<rect x="${x+2+(k%2)*(w-6)}" y="${y+5+k*7}" width="2.5" height="3.5" fill="#ffd56a"/>`).join('')}`; });
      s+=`<polygon points="44,106 48,44 54,44 58,106" fill="#f4ecdf"/>${[56,70,84].map(y=>`<polygon points="${44+ (106-y)*0+1},${y} ${57},${y} ${57.3},${y+5} ${45},${y+5}" fill="${sh(c,0)}"/>`).join('')}<rect x="46" y="36" width="10" height="8" fill="#ffe9a0"/><path d="M45 36 L51 28 L57 36Z" fill="#7a2e1a"/>`;
      s+=`<path d="M51 40 L0 22 L0 52Z" fill="#fff8c4" opacity=".18"/><path d="M51 40 L100 26 L100 50Z" fill="#fff8c4" opacity=".12"/>`;
      s+=gem(c,51,40,4,51); }
    return s; }
  // ---------- trang sức ----------
  const G=(c,x,y,r,sx,sy,seed)=>`<g transform="translate(${f(x)},${f(y)}) scale(${sx||1},${sy||1})">${gem(c,0,0,r,seed)}</g>`;
  const pearl=(x,y,r)=>`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#dqPearl)" stroke="#b9ae9a" stroke-width=".3"/>`;
  const shadow=(x,y,w)=>`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w*.22)}" fill="#000" opacity=".45" filter="url(#dqBlur)"/>`;
  const J={
    ring(c,x,y,M){ return shadow(x,y+22,20)+`<ellipse cx="${x}" cy="${y+6}" rx="16" ry="16.5" fill="none" stroke="${M.d}" stroke-width="6"/><ellipse cx="${x}" cy="${y+6}" rx="16" ry="16.5" fill="none" stroke="${M.p}" stroke-width="4.6"/><path d="M${x-14},${y+12} A16 16.5 0 0 0 ${x+8} ${y+21}" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" fill="none"/>
      <path d="M${x-9},${y-8} L${x-6},${y-18} M${x+9},${y-8} L${x+6},${y-18} M${x-3},${y-6} L${x-3},${y-19} M${x+3},${y-6} L${x+3},${y-19}" stroke="${M.p}" stroke-width="2.2"/><path d="M${x-11},${y-7} Q${x},${y-2} ${x+11},${y-7}" stroke="${M.p}" stroke-width="3" fill="none"/>`+G(c,x,y-17,10.5,1,1,7)+G(3,x-14,y-6,3,1,1,3)+G(3,x+14,y-6,3,1,1,4)+`<path d="M${x-8},${y-26} L${x-6},${y-21} M${x+8},${y-26} L${x+6},${y-21}" stroke="${M.p}" stroke-width="2"/>`; },
    earrings(c,x,y,M){ let o=shadow(x,y+26,24); [-13,13].forEach((d,k)=>{ const X=x+d;
      o+=`<path d="M${X},${y-28} q-6,-8 0,-12 q6,-2 6,5" stroke="${M.p}" stroke-width="1.8" fill="none"/>`+G(3,X,y-26,3.4,1,1,k)+`<line x1="${X}" y1="${y-22}" x2="${X}" y2="${y-14}" stroke="${M.p}" stroke-width="1.6"/>${pearl(X,y-15,2.2)}<path d="M${X-6},${y-10} Q${X},${y-15} ${X+6},${y-10} L${X+8},${y+6} Q${X},${y+24} ${X-8},${y+6}Z" fill="${M.p}" stroke="${M.d}" stroke-width=".6"/>`+G(c,X,y+3,7.5,.85,1.35,11+k); }); return o; },
    pendant(c,x,y,M){ return `<path d="M${x-36},${y-44} Q${x},${y+4} ${x+36},${y-44}" stroke="${M.p}" stroke-width="1.6" fill="none" stroke-dasharray="2.2 1.2"/>`+shadow(x,y+28,16)+`<ellipse cx="${x}" cy="${y-17}" rx="3" ry="4" fill="none" stroke="${M.p}" stroke-width="2"/>
      <path d="M${x},${y-14} C${x+17},${y-12} ${x+17},${y+22} ${x},${y+26} C${x-17},${y+22} ${x-17},${y-12} ${x},${y-14}Z" fill="${M.p}" stroke="${M.d}" stroke-width=".8"/>`+G(c,x,y+6,10,.95,1.25,13)+[0,1,2,3,4,5,6,7].map(k=>{ const a=k/8*Math.PI*2; return pearl(x+Math.cos(a)*14,y+6+Math.sin(a)*17,1.5); }).join(''); },
    brooch(c,x,y,M){ let o=shadow(x,y+24,22); for(let k=0;k<8;k++){ const a=k*45; o+=`<ellipse cx="${x}" cy="${y-14}" rx="6" ry="13" fill="${M.p}" stroke="${M.d}" stroke-width=".6" transform="rotate(${a} ${x} ${y})"/><ellipse cx="${x}" cy="${y-15}" rx="2" ry="8" fill="#fff" opacity=".25" transform="rotate(${a} ${x} ${y})"/>`; }
      for(let k=0;k<8;k++){ const a=(k*45+22.5)*Math.PI/180; o+=G(k%2?3:c,x+Math.cos(a)*17,y+Math.sin(a)*17,k%2?2.6:3.4,1,1,k); } return o+`<circle cx="${x}" cy="${y}" r="12.5" fill="${M.d}"/>`+G(c,x,y,11,1,1,17); },
    bracelet(c,x,y,M){ let o=shadow(x,y+18,34)+`<path d="M${x-32},${y} A32 13 0 0 1 ${x+32} ${y}" stroke="${M.d}" stroke-width="8" fill="none"/><path d="M${x-32},${y} A32 13 0 0 1 ${x+32} ${y}" stroke="${M.p}" stroke-width="5" fill="none" opacity=".7"/><path d="M${x-32},${y} A32 13 0 0 0 ${x+32} ${y}" stroke="${M.d}" stroke-width="10" fill="none"/><path d="M${x-32},${y} A32 13 0 0 0 ${x+32} ${y}" stroke="${M.p}" stroke-width="7.5" fill="none"/>`;
      for(let k=0;k<9;k++){ const a=(15+k*18.75)*Math.PI/180; o+=G(k%2?3:c,x+Math.cos(a)*32,y+Math.sin(a)*13,k%2?2.6:4.4,1,.85,k); } return o; },
    necklace(c,x,y,M){ let o=''; const P=t=>[x+(t-.5)*74, y-40+Math.pow(Math.abs(t-.5)*2,1.6)*-0+ (1-Math.pow((t-.5)*2,2))*40]; o+=shadow(x,y+30,26);
      o+=`<path d="M${x-37},${y-40} Q${x},${y+40} ${x+37},${y-40}" stroke="${M.p}" stroke-width="1.6" fill="none"/>`;
      for(let k=1;k<12;k++){ const t=k/12, p=P(t); o+= k%2? pearl(p[0],p[1],2.4) : G(c,p[0],p[1],3.4,1,1,k); }
      return o+`<path d="M${x},${y} L${x},${y+5}" stroke="${M.p}" stroke-width="1.6"/>`+G(3,x,y+2,3,1,1,5)+`<path d="M${x-9},${y+8} L${x+9},${y+8} L${x},${y+30}Z" fill="${M.d}"/>`+G(c,x,y+15,9,1,1.3,21); },
    hairpin(c,x,y,M){ let o=shadow(x,y+30,26)+`<line x1="${x+26}" y1="${y+30}" x2="${x-8}" y2="${y-14}" stroke="${M.d}" stroke-width="4" stroke-linecap="round"/><line x1="${x+26}" y1="${y+30}" x2="${x-8}" y2="${y-14}" stroke="${M.p}" stroke-width="2.6" stroke-linecap="round"/>`;
      const fx=x-12, fy=y-20; [0,1,2].forEach(k=>{ const dx=fx-8+k*8; o+=`<line x1="${dx}" y1="${fy+4}" x2="${dx}" y2="${fy+22+k%2*6}" stroke="${M.p}" stroke-width=".9"/>`+G(k===1?c:3,dx,fy+24+k%2*6,k===1?3.6:2.4,1,1.3,k); });
      for(let k=0;k<5;k++){ const a=(k*72-90)*Math.PI/180; o+=G(c,fx+Math.cos(a)*9,fy+Math.sin(a)*9,5.2,.8,1.2,k+30).replace('scale(','rotate('+(k*72)+') scale('); }
      return o+pearl(fx,fy,4.2)+[0,1,2,3,4].map(k=>{ const a=(k*72-54)*Math.PI/180; return G(3,fx+Math.cos(a)*12,fy+Math.sin(a)*12,1.8,1,1,k); }).join(''); },
    box(c,x,y,M){ let o=shadow(x,y+30,36)+`<path d="M${x-32},${y} L${x-28},${y-32} L${x+28},${y-32} L${x+32},${y}Z" fill="url(#dqWood)" stroke="#2a1306" stroke-width="1"/><path d="M${x-28},${y-2} L${x-25},${y-28} L${x+25},${y-28} L${x+28},${y-2}Z" fill="#7a1430"/><path d="M${x-25},${y-28} L${x+25},${y-28}" stroke="${M.p}" stroke-width="2"/>`;
      o+=`<rect x="${x-34}" y="${y}" width="68" height="28" rx="2" fill="url(#dqWood)" stroke="#2a1306" stroke-width="1"/><rect x="${x-34}" y="${y}" width="68" height="4" fill="#5e0f24"/><rect x="${x-34}" y="${y+24}" width="68" height="4" fill="${M.p}"/><rect x="${x-4}" y="${y+8}" width="8" height="9" rx="1.5" fill="${M.p}" stroke="${M.d}" stroke-width=".5"/><circle cx="${x}" cy="${y+12}" r="1.4" fill="#2a1306"/>`;
      o+=`<path d="M${x-28},${y+1} Q${x-14},${y-12} ${x},${y+1} Q${x+14},${y-12} ${x+28},${y+1}" stroke="#fff" stroke-width="0" fill="none"/>`;
      [-20,-6,8,22].forEach((d,k)=>{ o+= k===1||k===2 ? `<ellipse cx="${x+d}" cy="${y-2}" rx="6" ry="5" fill="none" stroke="${M.p}" stroke-width="2.2"/>`+G(k===1?c:3,x+d,y-8,k===1?4.8:3.4,1,1,k) : G(c,x+d,y-4,4,1,1,k+40); });
      return o+[0,1,2,3,4,5,6].map(k=>pearl(x-26+k*5,y-15-Math.sin(k/6*Math.PI)*7,1.8)).join(''); },
    crown(c,x,y,M){ let o=shadow(x,y+22,34)+`<path d="M${x-26},${y+6} Q${x-24},${y-26} ${x},${y-28} Q${x+24},${y-26} ${x+26},${y+6}Z" fill="#8a1028"/><path d="M${x-14},${y-20} Q${x},${y-30} ${x+14},${y-20}" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none"/>`;
      o+=`<path d="M${x-30},${y+16} L${x-32},${y-14} L${x-20},${y-2} L${x-12},${y-24} L${x-4},${y-6} L${x},${y-30} L${x+4},${y-6} L${x+12},${y-24} L${x+20},${y-2} L${x+32},${y-14} L${x+30},${y+16}Z" fill="${M.p}" stroke="${M.d}" stroke-width="1"/>`;
      [[-32,-14],[-12,-24],[0,-30],[12,-24],[32,-14]].forEach(([a,b])=>o+=pearl(x+a,y+b-1,2.6));
      o+=`<rect x="${x-31}" y="${y+6}" width="62" height="12" rx="2" fill="${M.p}" stroke="${M.d}" stroke-width="1"/><rect x="${x-31}" y="${y+8}" width="62" height="2" fill="#fff" opacity=".35"/>`;
      [-22,-11,11,22].forEach((d,k)=>o+=G(k%2?3:c,x+d,y+12,k%2?2.8:4.2,1,1,k));
      return o+G(c,x,y+11,6.5,1,1,9)+G(c,x,y-12,5,1,1.2,19)+G(3,x-12,y-12,2.4,1,1,3)+G(3,x+12,y-12,2.4,1,1,4)+`<path d="M${x},${y-38} v-8 M${x-3},${y-43} h6" stroke="${M.p}" stroke-width="2.2"/>`; },
    scepter(c,x,y,M){ let o=shadow(x+4,y+38,22)+`<g transform="rotate(-28 ${x} ${y})"><rect x="${x-3}" y="${y-22}" width="6" height="62" rx="2.5" fill="${M.p}" stroke="${M.d}" stroke-width=".8"/><rect x="${x-1.6}" y="${y-22}" width="1.4" height="62" fill="#fff" opacity=".35"/>`;
      [-8,6,20,32].forEach((d,k)=>o+=`<rect x="${x-4.5}" y="${y+d}" width="9" height="3.6" rx="1.5" fill="${M.d}"/>`+G(k%2?c:3,x,y+d+1.8,k%2?2.6:2,1,1,k));
      o+=`<circle cx="${x}" cy="${y+43}" r="4" fill="${M.p}" stroke="${M.d}"/><path d="M${x-9},${y-22} Q${x},${y-30} ${x+9},${y-22} L${x+5},${y-18} L${x-5},${y-18}Z" fill="${M.p}" stroke="${M.d}" stroke-width=".6"/>`;
      o+=[-1,0,1].map(k=>`<path d="M${x+k*7},${y-26} Q${x+k*14},${y-40} ${x+k*4},${y-52}" stroke="${M.p}" stroke-width="2" fill="none"/>`).join('');
      return o+G(c,x,y-36,11,1,1,23)+`<path d="M${x},${y-50} v-9 M${x-3.5},${y-55} h7" stroke="${M.p}" stroke-width="2.2"/></g>`; },
    collar(c,x,y,M){ let o=shadow(x,y+34,30)+`<path d="M${x-36},${y-30} Q${x},${y+22} ${x+36},${y-30} L${x+28},${y-34} Q${x},${y+10} ${x-28},${y-34}Z" fill="${M.p}" stroke="${M.d}" stroke-width="1"/>`;
      for(let k=0;k<9;k++){ const t=k/8, px=x-32+64*t, py=y-32+ (1-Math.pow(2*t-1,2))*38; o+=G(k%2?3:c,px,py-2,k%2?2.4:3.6,1,1,k);
        if(k>0&&k<8&&k%2===0){ o+=`<line x1="${px}" y1="${py+2}" x2="${px}" y2="${py+10}" stroke="${M.p}" stroke-width="1"/>`+G(c,px,py+15,4.6,.85,1.35,k+50); } }
      return o+`<line x1="${x}" y1="${y+8}" x2="${x}" y2="${y+14}" stroke="${M.p}" stroke-width="1.4"/>`+G(c,x,y+24,8,.9,1.35,61); },
    orb(c,x,y,M){ return shadow(x,y+30,24)+`<circle cx="${x}" cy="${y+6}" r="22" fill="url(#dqOrb)" stroke="${M.d}" stroke-width="1"/><path d="M${x-22},${y+6} A22 7 0 0 0 ${x+22} ${y+6}" stroke="${M.d}" stroke-width="5" fill="none"/><path d="M${x-22},${y+6} A22 7 0 0 0 ${x+22} ${y+6}" stroke="${M.p}" stroke-width="3.4" fill="none"/>
      <path d="M${x},${y-16} Q${x-8},${y+6} ${x},${y+28}" stroke="${M.d}" stroke-width="5" fill="none"/><path d="M${x},${y-16} Q${x-8},${y+6} ${x},${y+28}" stroke="${M.p}" stroke-width="3.4" fill="none"/><ellipse cx="${x-9}" cy="${y-5}" rx="7" ry="4" fill="#fff" opacity=".45" transform="rotate(-35 ${x-9} ${y-5})"/>`
      +[-16,-8,8,16].map((d,k)=>G(k%2?3:c,x+d,y+6+Math.sqrt(1-(d/22)**2)*7-.5,k%2?2:3,1,1,k)).join('')+G(c,x-5.5,y+6,4.4,1,1,7)
      +`<rect x="${x-2.4}" y="${y-34}" width="4.8" height="18" fill="${M.p}" stroke="${M.d}" stroke-width=".6"/><rect x="${x-8}" y="${y-29}" width="16" height="4.8" fill="${M.p}" stroke="${M.d}" stroke-width=".6"/>`+G(c,x,y-26.6,3.2,1,1,8); }
  };
  const JT={1:['ring','earrings','pendant','brooch'],2:['bracelet','necklace','hairpin','box'],3:['crown','scepter','collar','orb']};
  const JN={ring:'Nhẫn',earrings:'Bông tai',pendant:'Mặt dây',brooch:'Ghim cài',bracelet:'Vòng tay',necklace:'Dây chuyền',hairpin:'Trâm tóc',box:'Hộp ngọc',crown:'Vương miện',scepter:'Quyền trượng',collar:'Kiềng cổ',orb:'Quả cầu vua'};
  function jewelOf(id){ const C=DQ.CARDS[id]; const same=DQ.CARDS.filter(x=>x.lv===C.lv&&x.col===C.col); const k=same.indexOf(C); return JT[C.lv][k%4]; }
  function jewelName(id){ return JN[jewelOf(id)]+' '+DQ_COL[DQ.CARDS[id].col]; }
  function backdrop(lv,c,R){ let s='';
    if(lv===1){ s+=`<rect width="100" height="140" fill="url(#dqVel1_${c})"/><path d="M0 0 L100 0 L100 140 L0 140Z" fill="url(#dqWeave)" opacity=".35"/>`;
      s+=`<path d="M10 120 Q8 92 30 90 L84 90 Q98 92 96 120 Q94 132 80 132 L24 132 Q12 132 10 120Z" fill="${mix('#4a1020',sh(c,-.5),.35)}"/><path d="M18 96 Q55 86 92 96" stroke="#fff" stroke-opacity=".12" stroke-width="3" fill="none"/>`; }
    else if(lv===2){ s+=`<rect width="100" height="140" fill="url(#dqSatin)"/>`; for(let i=0;i<6;i++){ const x=R()*100; s+=`<path d="M${f(x)} 30 Q${f(x+(R()-.5)*30)} 80 ${f(x+(R()-.5)*20)} 140" stroke="#fff" stroke-opacity=".35" stroke-width="${f(2+R()*4)}" fill="none"/><path d="M${f(x+5)} 30 Q${f(x+(R()-.5)*30)} 80 ${f(x+(R()-.5)*20)} 140" stroke="#8a6a50" stroke-opacity=".12" stroke-width="3" fill="none"/>`; }
      s+=`<rect width="100" height="140" fill="${sh(c,0)}" opacity=".16"/>`; }
    else { s+=`<rect width="100" height="140" fill="url(#dqVel3_${c})"/><rect width="100" height="140" fill="url(#dqDamask)"/>`;
      s+=`<ellipse cx="60" cy="118" rx="34" ry="8" fill="#000" opacity=".35"/><path d="M28 112 L92 112 L88 124 L32 124Z" fill="url(#dqGoldM)"/><ellipse cx="60" cy="112" rx="32" ry="6" fill="${mix('#3b0a1e',sh(c,-.6),.4)}" stroke="url(#dqGoldM)" stroke-width="1.6"/>`; }
    return s+`<ellipse cx="60" cy="74" rx="40" ry="44" fill="url(#dqSpot)"/>`; }
  // ---------- ngọc nổi trong ngân khố ----------
  let fgN=0;
  function outline(c,r){ if(c===0){ const a=r*.78,b=r,k=r*.3; return `<polygon points="${pts([[-a+k,-b],[a-k,-b],[a,-b+k],[a,b-k],[a-k,b],[-a+k,b],[-a,b-k],[-a,-b+k]])}"/>`; } if(c===1) return `<ellipse rx="${f(r*.82)}" ry="${r}"/>`; if(c===4) return `<ellipse rx="${r}" ry="${f(r*.92)}"/>`; return `<circle r="${r}"/>`; }
  function floatGem(c,n){ const id='dqfg'+(fgN++); let s=`<svg viewBox="-20 -22 40 46" class="fgem"><defs><clipPath id="${id}">${outline(c,13)}</clipPath></defs>`;
    if(!n) return s+`<g opacity=".25">${outline(c,13).replace('/>',' fill="none" stroke="#fff" stroke-dasharray="2 2"/>')}</g></svg>`;
    s+=`<ellipse class="fsh" cx="0" cy="19" rx="11" ry="2.6" fill="#000" opacity=".45"/>`;
    s+=`<g class="fl" style="animation-delay:${-c*.7}s">`;
    if(n>2) s+=`<g opacity=".85">${G(c,-9,6,8,1,1,c+70)}</g>`; if(n>1) s+=`<g opacity=".9">${G(c,9,7,8,1,1,c+80)}</g>`;
    s+=gem(c,0,0,13,c*5+1)+`<g clip-path="url(#${id})"><rect class="sweep" x="-30" y="-20" width="12" height="40" fill="url(#dqSweep)" transform="skewX(-20)" style="animation-delay:${c*.9}s"/></g>`;
    s+=tw(9,-10,4,c*.5)+tw(-10,4,3,c*.5+1.3)+tw(4,9,2.5,c*.5+2.1)+`</g></svg>`; return s; }
  // ---------- thẻ ----------
  const cache={};
  function card(id){ if(cache[id]) return cache[id]; const C=DQ.CARDS[id], c=C.col, R=rng(id*97+13), lv=C.lv;
    const M=lv===1?{p:'url(#dqSilverM)',d:'#5d6470'}:{p:'url(#dqGoldM)',d:'#6e4200'};
    const art=backdrop(lv,c,R)+J[jewelOf(id)](c,60,76,M)+[0,1,2,3].map(k=>tw(36+R()*50,44+R()*60,2.5+R()*2.5,R()*3)).join('');
    const cid='dqcl'+id, nm=jewelName(id);
    let s=`<svg viewBox="0 0 100 140" class="cs"><defs><clipPath id="${cid}"><rect x="3" y="3" width="94" height="134" rx="7"/></clipPath></defs>`;
    s+=`<rect x="0" y="0" width="100" height="140" rx="9" fill="url(#dqGold)"/><g clip-path="url(#${cid})">${art}`;
    s+=`<rect x="3" y="3" width="94" height="31" fill="url(#dqBand${c})"/><path d="M3 34 H97" stroke="url(#dqGold)" stroke-width="2"/><path d="M3 36 H97" stroke="#000" stroke-opacity=".25" stroke-width="1"/>`;
    s+=`<path d="M27 123 H97 V136 H27 L31 129.5Z" fill="${mix(sh(c,-.55),'#1a0f05',.35)}" opacity=".92"/><path d="M27 123 H97" stroke="url(#dqGold)" stroke-width="1"/><text x="63" y="132.4" class="jn" ${nm.length>17?'textLength="62" lengthAdjust="spacingAndGlyphs"':''}>${nm}</text>`;
    s+=`<rect x="-60" y="0" width="80" height="140" fill="url(#dqShine)" class="shine"/></g>`;
    s+=`<rect x="5.5" y="5.5" width="89" height="129" rx="6" fill="none" stroke="#fff4c8" stroke-opacity=".55" stroke-width=".8"/>`;
    if(C.pts) s+=`<text x="14" y="28" class="pt">${C.pts}</text>`;
    s+=`<g filter="url(#dqDrop)">${gem(c,82,18.5,11.5,c*5+1)}</g>`;
    const cs=C.cost.map((v,k)=>[k,v]).filter(x=>x[1]); cs.forEach(([k,v],i)=>{ const y=111-i*20;
      s+=`<g filter="url(#dqDrop)">${gem(k,13,y,8.5,k*5+1)}</g><circle cx="21.5" cy="${y+6.5}" r="6.4" fill="#1d140a" stroke="url(#dqGold)" stroke-width="1"/><text x="21.5" y="${y+9.9}" class="cq">${v}</text>`; });
    s+=`</svg>`;
    return cache[id]=s; }
  function back(lv){ return `<svg viewBox="0 0 100 140" class="cs"><rect width="100" height="140" rx="9" fill="url(#dqGold)"/><rect x="3" y="3" width="94" height="134" rx="7" fill="url(#dqDeck${lv})"/><rect x="3" y="3" width="94" height="134" rx="7" fill="url(#dqLattice)"/>
    <rect x="9" y="9" width="82" height="122" rx="5" fill="none" stroke="url(#dqGold)" stroke-width="1.5"/><circle cx="50" cy="56" r="25" fill="#00000040" stroke="url(#dqGold)" stroke-width="2"/>
    ${lv===1?gem(0,50,56,13,3):lv===2?gem(2,50,56,13,5):gem(3,50,56,13,9)}${[...Array(lv)].map((_,i)=>`<path d="M${50+(i-(lv-1)/2)*12} 84 l4 5 l-4 5 l-4 -5z" fill="url(#dqGold)"/>`).join('')}</svg>`; }
  // ---------- quý tộc ----------
  const ncache={};
  function noble(id){ if(ncache[id]) return ncache[id]; const N=DQ.NOBLES[id], R=rng(id*31+7); const req=N.req.map((v,k)=>[k,v]).filter(x=>x[1]); const c1=req[0][0], c2=req[req.length-1][0];
    const hats=['crown','hat','turban','tiara','crown','hat','tiara','turban','hat','crown']; const hat=hats[id]; const fem=[1,2,5,9,6].includes(id); const beard=!fem&&id%2===0;
    const hair=['#3b2416','#1c1410','#7a4a22','#c9a26b','#4a2e1c'][id%5]; const nid='dqnc'+id;
    let s=`<svg viewBox="0 0 100 100" class="ns"><defs><clipPath id="${nid}"><path d="M30 92 L30 30 Q30 8 60 8 Q90 8 90 30 L90 92Z"/></clipPath></defs>`;
    s+=`<rect width="100" height="100" rx="8" fill="url(#dqGold)"/><rect x="3" y="3" width="94" height="94" rx="6" fill="url(#dqMarble)"/>`;
    for(let i=0;i<4;i++){ s+=`<path d="M${f(R()*100)} 3 Q${f(R()*100)} ${f(40+R()*30)} ${f(R()*100)} 97" stroke="#b9a37a" stroke-opacity=".28" fill="none" stroke-width=".7"/>`; }
    s+=`<g clip-path="url(#${nid})"><rect x="30" y="8" width="60" height="84" fill="url(#dqSky${c2})"/>`;
    s+=`<path d="M32 92 Q34 70 60 66 Q86 70 88 92Z" fill="${sh(c1,-.1)}"/><path d="M60 66 Q86 70 88 92 L72 92 Q72 74 60 66Z" fill="${sh(c1,-.5)}" opacity=".6"/>`;
    s+=`<path d="M46 70 Q60 82 74 70 L70 66 Q60 74 50 66Z" fill="#fff" opacity=".9"/>${[48,53,58,63,68,73].map(x=>`<circle cx="${x}" cy="${70+Math.abs(x-60)*-.1+2}" r="2.2" fill="#fff"/>`).join('')}`;
    s+=gem(c2,60,78,4.5,id+40);
    if(fem) s+=`<path d="M44 48 Q42 72 52 72 L68 72 Q78 72 76 48 Q76 30 60 30 Q44 30 44 48Z" fill="${hair}"/>`;
    s+=`<rect x="56" y="54" width="8" height="10" fill="#d9a27a"/><ellipse cx="60" cy="46" rx="11" ry="13" fill="url(#dqSkin)"/>`;
    s+=`<circle cx="56" cy="45" r="1.2" fill="#2a1a10"/><circle cx="64" cy="45" r="1.2" fill="#2a1a10"/><path d="M57 52 Q60 54 63 52" stroke="#a34b3a" stroke-width="1" fill="none"/><ellipse cx="54.5" cy="49" rx="2" ry="1.2" fill="#f08c8c" opacity=".4"/><ellipse cx="65.5" cy="49" rx="2" ry="1.2" fill="#f08c8c" opacity=".4"/>`;
    if(!fem) s+=`<path d="M49 42 Q50 31 60 31 Q70 31 71 42 Q68 36 60 36 Q52 36 49 42Z" fill="${hair}"/>`;
    if(beard) s+=`<path d="M50 48 Q51 62 60 62 Q69 62 70 48 Q66 56 60 56 Q54 56 50 48Z" fill="${hair}"/>`;
    if(hat==='crown') s+=`<path d="M49 34 L50 22 L55 28 L60 19 L65 28 L70 22 L71 34Z" fill="url(#dqGold)" stroke="#6e4200" stroke-width=".6"/>${gem(c1,60,29,2.6,id)}`;
    if(hat==='tiara') s+=`<path d="M50 36 Q60 24 70 36" stroke="url(#dqGold)" stroke-width="3" fill="none"/>${gem(c1,60,29,3,id)}`;
    if(hat==='hat') s+=`<ellipse cx="60" cy="34" rx="17" ry="4" fill="${sh(c2,-.6)}"/><path d="M50 34 Q50 20 60 20 Q70 20 70 34Z" fill="${sh(c2,-.4)}"/><path d="M68 26 Q84 14 80 34" stroke="#fff" stroke-width="2.5" fill="none"/>${gem(c1,60,30,2.4,id)}`;
    if(hat==='turban') s+=`<path d="M47 38 Q46 18 60 18 Q74 18 73 38 Q66 32 60 32 Q54 32 47 38Z" fill="${sh(c1,.35)}"/><path d="M50 30 Q60 22 70 30" stroke="${sh(c1,-.2)}" stroke-width="1.4" fill="none"/>${gem(c2,60,26,3,id)}`;
    s+=`</g><path d="M30 92 L30 30 Q30 8 60 8 Q90 8 90 30 L90 92Z" fill="none" stroke="url(#dqGold)" stroke-width="2.5"/>`;
    s+=`<path d="M6 6 H24 V22 Q24 30 15 33 Q6 30 6 22Z" fill="url(#dqGold)"/><text x="15" y="26" class="npt">3</text>`;
    req.forEach(([k,v],i)=>{ const y=40+i*19; s+=`<g filter="url(#dqDrop)"><rect x="7" y="${y}" width="16" height="17" rx="2.5" fill="url(#dqBon${k})" stroke="${sh(k,-.8)}" stroke-width=".8"/></g><text x="15" y="${y+13}" class="cn ${k===3?'dk':''}" style="font-size:12px">${v}</text>`; });
    s+=`<path d="M28 88 H92 L88 93 L92 98 H28 L32 93Z" fill="${mix(sh(c1,-.3),'#5a1020',.4)}"/></svg>`;
    return ncache[id]=s; }
  // ---------- phỉnh đá ----------
  function chip(c,n){ const L=Math.min(Math.max(n,0),5); let s=`<svg viewBox="-34 -46 68 86" class="chip">`;
    if(!n) return s+`<ellipse cx="0" cy="16" rx="27" ry="21" fill="none" stroke="#ffffff55" stroke-width="2" stroke-dasharray="4 3"/></svg>`;
    s+=`<ellipse cx="2" cy="${22}" rx="29" ry="19" fill="#000" opacity=".35"/>`;
    for(let i=0;i<L;i++){ const y=16-i*6; const top=i===L-1;
      s+=`<path d="M-28 ${y} v5 a28 21 0 0 0 56 0 v-5" fill="${sh(c,-.55)}"/>`;
      for(let k=0;k<6;k++){ const a1=Math.PI*(k+.5)/6-.13, a2=a1+.26, P=a=>[28*Math.cos(a),y+21*Math.sin(a)]; const p1=P(a1),p2=P(a2); s+=`<polygon points="${f(p1[0])},${f(p1[1])} ${f(p2[0])},${f(p2[1])} ${f(p2[0])},${f(p2[1]+5)} ${f(p1[0])},${f(p1[1]+5)}" fill="#fff" opacity=".85"/>`; }
      s+=`<ellipse cx="0" cy="${y}" rx="28" ry="21" fill="url(#dqChip${c})" stroke="${sh(c,-.75)}" stroke-width="1"/>`;
      if(top){ s+=`<ellipse cx="0" cy="${y}" rx="24" ry="17.5" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="3.2" stroke-dasharray="6 6.6"/><ellipse cx="0" cy="${y}" rx="17" ry="12.5" fill="${sh(c,-.35)}" stroke="${sh(c,.5)}" stroke-width="1"/>`;
        s+=`<g transform="translate(0,${y}) scale(1,.82)">${gem(c,0,0,11.5,c*3+i)}</g><ellipse cx="-12" cy="${y-11}" rx="9" ry="3" fill="#fff" opacity=".35" transform="rotate(-18 -12 ${y-11})"/>`; } }
    return s+'</svg>'; }
  // ---------- thẻ thưởng nhỏ trong bảng người chơi ----------
  function bonus(c,n){ return `<svg viewBox="0 0 30 40" class="bon"><rect x="1" y="1" width="28" height="38" rx="4" fill="url(#dqBon${c})" stroke="${sh(c,-.8)}" stroke-width="1"/><rect x="3" y="3" width="24" height="34" rx="3" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width=".8"/>${gem(c,15,13,7.5,c)}<text x="15" y="35" class="cn ${c===3?'dk':''}" style="font-size:13px">${n}</text></svg>`; }
  return {defs,gem,gemSVG,card,back,noble,chip,bonus,sh,PAL,floatGem,jewelName};
})();
