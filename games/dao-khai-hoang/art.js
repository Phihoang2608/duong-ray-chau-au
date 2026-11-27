/* ===================== ĐỒ HOẠ ĐẢO KHAI HOANG ===================== */
const KHART=(()=>{
  const R=56;
  const f=n=>Math.round(n*10)/10;
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const mix=(a,b,t)=>{ const A=rgb(a),B=rgb(b); return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join(''); };
  const rng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const hexPts=(cx,cy,r)=>[0,1,2,3,4,5].map(k=>{ const a=Math.PI/180*(60*k-90); return f(cx+r*Math.cos(a))+','+f(cy+r*Math.sin(a)); }).join(' ');
  const inHex=(x,y,r)=>{ x=Math.abs(x); y=Math.abs(y); return x<=r*.866 && y<=r-x*.577; };
  function scatter(R0,n,r,minD){ const out=[]; let tries=0; while(out.length<n&&tries<600){ tries++; const x=(R0()*2-1)*r, y=(R0()*2-1)*r; if(!inHex(x,y,r*.92)) continue; if(out.some(p=>Math.hypot(p[0]-x,p[1]-y)<minD)) continue; out.push([x,y]); } return out.sort((a,b)=>a[1]-b[1]); }
  // ---------- chi tiết địa hình ----------
  function pine(x,y,s,R0){ const g=mix('#3c9a3a','#2c7d2e',R0()), d=mix('#174a1c','#0f3a16',R0());
    let o=`<ellipse cx="${f(x+4*s)}" cy="${f(y+1.5*s)}" rx="${f(8*s)}" ry="${f(2.6*s)}" fill="#0b2a0e" opacity=".45"/><rect x="${f(x-1.2*s)}" y="${f(y-3*s)}" width="${f(2.4*s)}" height="${f(4*s)}" fill="#5b3a1d"/>`;
    [[0,8,7],[-6,6.4,5.6],[-11.5,4.8,4.2]].forEach(([dy,w,h])=>{ const yb=y-3*s+dy*s, yt=yb-h*s*1.55; o+=`<polygon points="${f(x-w*s)},${f(yb)} ${f(x)},${f(yt)} ${f(x)},${f(yb+1.2*s)}" fill="${g}"/><polygon points="${f(x)},${f(yt)} ${f(x+w*s)},${f(yb)} ${f(x)},${f(yb+1.2*s)}" fill="${d}"/>`; });
    return o+`<line x1="${f(x-2.5*s)}" y1="${f(y-10*s)}" x2="${f(x-.5*s)}" y2="${f(y-14*s)}" stroke="#7fd36b" stroke-width="${f(.7*s)}" opacity=".6"/>`; }
  function oak(x,y,s,R0){ return `<ellipse cx="${f(x+4*s)}" cy="${f(y+1.5*s)}" rx="${f(9*s)}" ry="${f(2.8*s)}" fill="#0b2a0e" opacity=".45"/><rect x="${f(x-1.4*s)}" y="${f(y-6*s)}" width="${f(2.8*s)}" height="${f(7*s)}" fill="#5b3a1d"/>
      <circle cx="${f(x+2*s)}" cy="${f(y-10*s)}" r="${f(6.5*s)}" fill="#1f5e22"/><circle cx="${f(x-3*s)}" cy="${f(y-11*s)}" r="${f(5.5*s)}" fill="#2f7d2e"/><circle cx="${f(x)}" cy="${f(y-15*s)}" r="${f(5.5*s)}" fill="#3a9238"/><circle cx="${f(x-2*s)}" cy="${f(y-16*s)}" r="${f(2.4*s)}" fill="#6cc25a" opacity=".7"/>`; }
  function sheep(x,y,s,flip){ const k=flip?-1:1; let o=`<g transform="translate(${f(x)},${f(y)}) scale(${f(k*s)},${f(s)})"><ellipse cx="2" cy="7" rx="10" ry="2.6" fill="#16400f" opacity=".35"/>`;
    o+=`<rect x="-6" y="1" width="1.8" height="6" fill="#2a2a2a"/><rect x="-2" y="2" width="1.8" height="5.5" fill="#1f1f1f"/><rect x="3" y="2" width="1.8" height="5.5" fill="#2a2a2a"/><rect x="6.5" y="1" width="1.8" height="6" fill="#1f1f1f"/>`;
    [[-5,0],[-1,-2],[3,-1],[7,0],[-3,2],[2,2.5],[6,2]].forEach(([a,b])=>o+=`<circle cx="${a+.8}" cy="${b+.8}" r="3.9" fill="#b9b4a6"/>`);
    [[-5,0],[-1,-2],[3,-1],[7,0],[-3,2],[2,2.5],[6,2]].forEach(([a,b])=>o+=`<circle cx="${a}" cy="${b}" r="3.6" fill="#fbf8ef"/>`);
    o+=`<circle cx="-2" cy="-3" r="1.6" fill="#fff"/><ellipse cx="-10" cy="-1" rx="3.2" ry="2.6" fill="#2b2622"/><ellipse cx="-11" cy="-3.2" rx="1.4" ry=".8" fill="#2b2622" transform="rotate(-30 -11 -3.2)"/><circle cx="-11" cy="-1.4" r=".55" fill="#fff"/></g>`; return o; }
  function bricks(x,y,s){ let o=`<ellipse cx="${f(x+3*s)}" cy="${f(y+3*s)}" rx="${f(14*s)}" ry="${f(4*s)}" fill="#3b1405" opacity=".4"/>`; const W=7*s,H=3.2*s,D=3*s;
    for(let L=0;L<3;L++) for(let i=0;i<3-L;i++){ const bx=x-10*s+i*W+L*W*.5, by=y-L*H;
      o+=`<polygon points="${f(bx)},${f(by)} ${f(bx+W)},${f(by)} ${f(bx+W+D)},${f(by-D*.8)} ${f(bx+D)},${f(by-D*.8)}" fill="#e98a5e" stroke="#7a2a0c" stroke-width=".4"/><rect x="${f(bx)}" y="${f(by)}" width="${f(W)}" height="${f(H)}" fill="#c4542a" stroke="#7a2a0c" stroke-width=".4"/><polygon points="${f(bx+W)},${f(by)} ${f(bx+W+D)},${f(by-D*.8)} ${f(bx+W+D)},${f(by-D*.8+H)} ${f(bx+W)},${f(by+H)}" fill="#8e3414"/>`; }
    return o; }
  function peak(x,y,w,h,R0,snow){ const sk=(R0()-.5)*w*.3, tx=x+sk; let o=`<polygon points="${f(x-w)},${f(y)} ${f(tx)},${f(y-h)} ${f(tx+w*.08)},${f(y)}" fill="${mix('#9ba5b0','#b8c1ca',R0())}"/><polygon points="${f(tx)},${f(y-h)} ${f(x+w)},${f(y)} ${f(tx+w*.08)},${f(y)}" fill="${mix('#4a535d','#3a424b',R0())}"/>`;
    o+=`<path d="M${f(tx)},${f(y-h)} L${f(tx-w*.2)},${f(y-h*.55)} L${f(tx-w*.05)},${f(y-h*.35)}" stroke="#6f7881" stroke-width=".8" fill="none"/>`;
    if(snow){ const sh=h*.32; o+=`<polygon points="${f(tx)},${f(y-h)} ${f(tx-w*sh/h)},${f(y-h+sh)} ${f(tx-w*.12)},${f(y-h+sh*.8)} ${f(tx-w*.02)},${f(y-h+sh*1.1)} ${f(tx+w*.05)},${f(y-h+sh*.85)}" fill="#fbfdff"/><polygon points="${f(tx)},${f(y-h)} ${f(tx+w*.05)},${f(y-h+sh*.85)} ${f(tx+w*.18)},${f(y-h+sh*.95)} ${f(tx+w*sh/h)},${f(y-h+sh)}" fill="#c9d6e6"/>`; }
    return o; }
  function cactus(x,y,s){ return `<ellipse cx="${f(x+4*s)}" cy="${f(y+1*s)}" rx="${f(7*s)}" ry="${f(2*s)}" fill="#8a6a30" opacity=".45"/><rect x="${f(x-2.5*s)}" y="${f(y-18*s)}" width="${f(5*s)}" height="${f(19*s)}" rx="${f(2.5*s)}" fill="url(#khCac)"/><path d="M${f(x-2.5*s)},${f(y-8*s)} h${f(-4*s)} a${f(2*s)},${f(2*s)} 0 0 1 ${f(-2*s)},${f(-2*s)} v${f(-6*s)}" stroke="url(#khCac)" stroke-width="${f(3.4*s)}" fill="none" stroke-linecap="round"/><path d="M${f(x+2.5*s)},${f(y-11*s)} h${f(3.5*s)} a${f(2*s)},${f(2*s)} 0 0 0 ${f(2*s)},${f(-2*s)} v${f(-4*s)}" stroke="url(#khCac)" stroke-width="${f(3.2*s)}" fill="none" stroke-linecap="round"/><line x1="${f(x)}" y1="${f(y-17*s)}" x2="${f(x)}" y2="${f(y)}" stroke="#2f5e14" stroke-width="${f(.6*s)}"/><circle cx="${f(x)}" cy="${f(y-18.5*s)}" r="${f(1.3*s)}" fill="#f472b6"/>`; }
  function rock(x,y,s,c){ c=c||'#8c8577'; return `<ellipse cx="${f(x+2*s)}" cy="${f(y+1*s)}" rx="${f(6*s)}" ry="${f(1.8*s)}" fill="#000" opacity=".25"/><polygon points="${f(x-5*s)},${f(y)} ${f(x-3*s)},${f(y-4*s)} ${f(x+1*s)},${f(y-5*s)} ${f(x+5*s)},${f(y-1*s)} ${f(x+4*s)},${f(y+.5*s)}" fill="${c}"/><polygon points="${f(x+1*s)},${f(y-5*s)} ${f(x+5*s)},${f(y-1*s)} ${f(x+4*s)},${f(y+.5*s)} ${f(x+.5*s)},${f(y)}" fill="${mix(c,'#000000',.35)}"/>`; }
  function terrain(res,cx,cy,i){ const R0=rng(i*977+res*31+5); let o='';
    const r=R+2;
    if(res===0){ o+=`<polygon points="${hexPts(cx,cy,r)}" fill="url(#khT0)"/>`;
      for(let k=0;k<14;k++){ const p=scatter(R0,1,R,0)[0]; if(p) o+=`<ellipse cx="${f(cx+p[0])}" cy="${f(cy+p[1])}" rx="${f(4+R0()*6)}" ry="${f(2+R0()*3)}" fill="#174b18" opacity=".35"/>`; }
      scatter(R0,19,R*.98,12).forEach(([x,y])=>{ o+= R0()<.2? oak(cx+x,cy+y+6,.72+R0()*.2,R0) : pine(cx+x,cy+y+6,.75+R0()*.3,R0); }); }
    else if(res===1){ o+=`<polygon points="${hexPts(cx,cy,r)}" fill="url(#khT1)"/>`;
      [[-28,-26,30],[18,-30,26],[-6,6,34],[28,10,24],[-30,24,22]].forEach(([x,y,w])=>{ o+=`<ellipse cx="${f(cx+x)}" cy="${f(cy+y)}" rx="${w}" ry="${f(w*.42)}" fill="#b8562b"/><ellipse cx="${f(cx+x-w*.15)}" cy="${f(cy+y-w*.12)}" rx="${f(w*.75)}" ry="${f(w*.25)}" fill="#d9794a" opacity=".8"/><path d="M${f(cx+x-w*.8)},${f(cy+y+w*.1)} q${f(w*.4)},-4 ${f(w*.8)},0" stroke="#8f3a15" stroke-width="1" fill="none"/>`; });
      o+=`<ellipse cx="${f(cx+14)}" cy="${f(cy+30)}" rx="13" ry="5.5" fill="#6e2c10"/><ellipse cx="${f(cx+14)}" cy="${f(cy+29)}" rx="10" ry="3.8" fill="#a04a20"/>`;
      o+=`<g><path d="M${f(cx-30)},${f(cy-6)} q0,-16 12,-16 q12,0 12,16Z" fill="#9a4b2a" stroke="#5c2510" stroke-width="1"/><path d="M${f(cx-22)},${f(cy-6)} q0,-7 4,-7 q4,0 4,7Z" fill="#2a0e04"/><circle cx="${f(cx-18)}" cy="${f(cy-9)}" r="2.5" fill="#ff9a3c" opacity=".8"/><rect x="${f(cx-12)}" y="${f(cy-30)}" width="4" height="10" fill="#7a3519"/>
        ${[0,1,2].map(k=>`<circle class="smoke" style="animation-delay:${k*1.1}s" cx="${f(cx-10)}" cy="${f(cy-33)}" r="3" fill="#ddd" opacity=".7"/>`).join('')}</g>`;
      o+=bricks(cx+6,cy-12,1)+bricks(cx+30,cy+2,.75)+bricks(cx-20,cy+24,.7); }
    else if(res===2){ o+=`<polygon points="${hexPts(cx,cy,r)}" fill="url(#khT2)"/><polygon points="${hexPts(cx,cy,r)}" fill="url(#khGrass)"/>`;
      o+=`<ellipse cx="${f(cx+22)}" cy="${f(cy-22)}" rx="13" ry="6" fill="#4aa8d8"/><ellipse cx="${f(cx+20)}" cy="${f(cy-23.5)}" rx="8" ry="2.5" fill="#bde6fa" opacity=".8"/><ellipse cx="${f(cx+22)}" cy="${f(cy-22)}" rx="13" ry="6" fill="none" stroke="#2d7f3a" stroke-width="1.5"/>`;
      o+=`<path d="M${f(cx-44)},${f(cy+6)} Q${f(cx-10)},${f(cy-10)} ${f(cx+40)},${f(cy+22)}" stroke="#7a5230" stroke-width="2" fill="none"/><path d="M${f(cx-44)},${f(cy+11)} Q${f(cx-10)},${f(cy-5)} ${f(cx+40)},${f(cy+27)}" stroke="#7a5230" stroke-width="1.6" fill="none"/>`;
      for(let k=0;k<7;k++){ const t=k/6, px=cx-44+84*t, py=cy+6+(t<.4? -16*t*2.5*.4: -6+28*(t-.4)/.6)*1; o+=`<rect x="${f(px-1.2)}" y="${f(py-3)}" width="2.4" height="11" fill="#5b3a1d"/>`; }
      for(let k=0;k<26;k++){ const p=scatter(R0,1,R*.95,0)[0]; if(p) o+=`<circle cx="${f(cx+p[0])}" cy="${f(cy+p[1])}" r="1.1" fill="${['#fff','#fde047','#f9a8d4'][k%3]}"/>`; }
      scatter(R0,4,R*.8,20).forEach(([x,y],k)=>{ o+=sheep(cx+x,cy+y+4,.85+R0()*.2,k%2); }); }
    else if(res===3){ o+=`<polygon points="${hexPts(cx,cy,r)}" fill="url(#khT3)"/><polygon points="${hexPts(cx,cy,r)}" fill="url(#khWheat)"/>`;
      o+=`<path d="M${f(cx-60)},${f(cy+4)} L${f(cx+60)},${f(cy-14)}" stroke="#8a6a1c" stroke-width="2.5" opacity=".6"/>`;
      for(let k=0;k<26;k++){ const p=scatter(R0,1,R*.95,0)[0]; if(p){ const x=cx+p[0], y=cy+p[1]; o+=`<line x1="${f(x)}" y1="${f(y+5)}" x2="${f(x+1)}" y2="${f(y-3)}" stroke="#a37a12" stroke-width=".8"/><ellipse cx="${f(x+1)}" cy="${f(y-4)}" rx="1.4" ry="3" fill="#f7d65a" stroke="#b68b12" stroke-width=".4"/>`; } }
      o+=`<g><ellipse cx="${f(cx-22)}" cy="${f(cy+26)}" rx="12" ry="3.4" fill="#5a4210" opacity=".35"/><path d="M${f(cx-34)},${f(cy+25)} Q${f(cx-33)},${f(cy+8)} ${f(cx-23)},${f(cy+8)} Q${f(cx-12)},${f(cy+8)} ${f(cx-11)},${f(cy+25)}Z" fill="url(#khHay)"/><path d="M${f(cx-31)},${f(cy+18)} Q${f(cx-23)},${f(cy+14)} ${f(cx-14)},${f(cy+18)}" stroke="#b68b12" stroke-width="1" fill="none"/></g>`;
      o+=`<g transform="translate(${f(cx+22)},${f(cy-6)})"><ellipse cx="3" cy="17" rx="10" ry="3" fill="#5a4210" opacity=".4"/><polygon points="-6,16 6,16 4,-8 -4,-8" fill="#f1e4c8" stroke="#8a6a3a" stroke-width=".8"/><polygon points="2,16 6,16 4,-8 1,-8" fill="#cbb994"/><polygon points="-6,-8 6,-8 0,-15" fill="#a8432a"/><rect x="-1.6" y="7" width="3.2" height="9" fill="#5b3a1d"/>
        <g class="mill"><rect x="-1" y="-24" width="2" height="22" fill="#6b4a2a"/><rect x="-1" y="-24" width="2" height="22" fill="#6b4a2a" transform="rotate(90 0 -13)"/><rect x="0" y="-24" width="5" height="10" fill="#f8f2e2" stroke="#6b4a2a" stroke-width=".5"/><rect x="-5" y="-12" width="5" height="10" fill="#f8f2e2" stroke="#6b4a2a" stroke-width=".5"/><rect x="-12" y="-18" width="10" height="5" fill="#f8f2e2" stroke="#6b4a2a" stroke-width=".5"/><rect x="1" y="-13" width="10" height="5" fill="#f8f2e2" stroke="#6b4a2a" stroke-width=".5"/></g><circle cx="0" cy="-13" r="1.8" fill="#3a2412"/></g>`; }
    else if(res===4){ o+=`<polygon points="${hexPts(cx,cy,r)}" fill="url(#khT4)"/>`;
      o+=peak(cx-24,cy+4,26,48,R0,true)+peak(cx+20,cy-2,30,58,R0,true)+peak(cx-2,cy+20,22,34,R0,false)+peak(cx+34,cy+26,18,28,R0,false)+peak(cx-36,cy+30,16,22,R0,false);
      o+=rock(cx-14,cy+40,1.1)+rock(cx+10,cy+38,.9,'#7a7f88');
      for(let k=0;k<7;k++){ const p=scatter(R0,1,R*.8,0)[0]; if(p){ const x=cx+p[0], y=cy+p[1]+8; o+=`<polygon points="${f(x)},${f(y-3)} ${f(x+2)},${f(y)} ${f(x)},${f(y+3)} ${f(x-2)},${f(y)}" fill="${k%2?'#9fd8ff':'#e2e8f0'}"/><circle class="glint" style="animation-delay:${f(R0()*3)}s" cx="${f(x)}" cy="${f(y)}" r="2.6" fill="#fff"/>`; } }
      o+=`<g transform="translate(${f(cx+2)},${f(cy+44)})"><path d="M-7,-6 L7,-6 L5,2 L-5,2Z" fill="#555c66" stroke="#222" stroke-width=".6"/><circle cx="-3" cy="-7" r="2" fill="#9aa3ad"/><circle cx="1" cy="-8" r="2.2" fill="#7f8893"/><circle cx="4" cy="-6.5" r="1.8" fill="#b8c1ca"/><circle cx="-3.5" cy="3" r="1.8" fill="#222"/><circle cx="3.5" cy="3" r="1.8" fill="#222"/></g>`; }
    else { o+=`<polygon points="${hexPts(cx,cy,r)}" fill="url(#khT5)"/>`;
      [[-10,-28,48],[6,0,60],[-14,28,46]].forEach(([x,y,w])=>{ o+=`<path d="M${f(cx+x-w)},${f(cy+y+8)} Q${f(cx+x-w*.3)},${f(cy+y-8)} ${f(cx+x+w*.2)},${f(cy+y)} Q${f(cx+x+w*.6)},${f(cy+y+6)} ${f(cx+x+w)},${f(cy+y+2)}" stroke="#fff4d6" stroke-width="2" fill="none" opacity=".75"/><path d="M${f(cx+x-w)},${f(cy+y+10)} Q${f(cx+x-w*.3)},${f(cy+y-6)} ${f(cx+x+w*.2)},${f(cy+y+2)} L${f(cx+x+w*.2)},${f(cy+y+12)}Z" fill="#c29a55" opacity=".3"/>`; });
      o+=cactus(cx-24,cy+16,1)+cactus(cx+26,cy-12,.8)+rock(cx+18,cy+30,1,'#b59a6a')+rock(cx-30,cy-18,.8,'#a68a5c');
      o+=`<g transform="translate(${f(cx+4)},${f(cy+36)})" opacity=".8"><path d="M-6,0 Q-6,-5 0,-5 Q6,-5 6,0 L4,2 L-4,2Z" fill="#f4efe2"/><circle cx="-2.4" cy="-2" r="1.2" fill="#3a2a10"/><circle cx="2.4" cy="-2" r="1.2" fill="#3a2a10"/></g>`; }
    return o; }
  // ---------- defs ----------
  function defs(){ let d='';
    const T=[['#4f8f33','#1d4d19'],['#d5774a','#8a3514'],['#9ed36a','#4e8f2a'],['#f2d061','#c08f1a'],['#a8b1ba','#5a636d'],['#f3dca4','#c9a362']];
    T.forEach(([a,b],i)=>d+=`<radialGradient id="khT${i}" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`);
    d+='<pattern id="khGrass" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M1 7 l1 -4 M2 7 l2 -3 M5 4 l1 -3 M6 4 l-1 -3" stroke="#3f7f22" stroke-width=".7" opacity=".55"/></pattern>';
    d+='<pattern id="khWheat" width="12" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><rect width="12" height="3.5" fill="#e9be3c" opacity=".35"/><path d="M0 3.5 H12" stroke="#b08414" stroke-width=".6" opacity=".6"/></pattern>';
    d+='<linearGradient id="khHay" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe58a"/><stop offset="1" stop-color="#c79616"/></linearGradient>';
    d+='<linearGradient id="khCac" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7cc04a"/><stop offset=".5" stop-color="#4c8f26"/><stop offset="1" stop-color="#2d5e14"/></linearGradient>';
    d+='<linearGradient id="khBevel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>';
    d+='<radialGradient id="khToken" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".65" stop-color="#f2e3bf"/><stop offset="1" stop-color="#d4b77f"/></radialGradient>';
    d+='<radialGradient id="khSea" cx="50%" cy="50%" r="62%"><stop offset="0" stop-color="#63d6ea"/><stop offset=".5" stop-color="#2fb6dc"/><stop offset="1" stop-color="#1a86bb"/></radialGradient>';
    d+='<radialGradient id="khSand" cx="50%" cy="50%" r="60%"><stop offset=".8" stop-color="#f3dcaa"/><stop offset="1" stop-color="#e0bb78"/></radialGradient>';
    d+='<radialGradient id="khRob" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#7a7f8c"/><stop offset=".45" stop-color="#2c2e36"/><stop offset="1" stop-color="#050507"/></radialGradient>';
    d+='<linearGradient id="khHull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a0612c"/><stop offset="1" stop-color="#4a2a10"/></linearGradient>';
    d+='<filter id="khNoise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25"/></filter>';
    d+='<filter id="khSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>';
    d+='<filter id="khGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    d+='<pattern id="khWave" width="60" height="34" patternUnits="userSpaceOnUse"><path d="M0 8 q7.5 -7 15 0 t15 0 t15 0 t15 0" stroke="#fff" stroke-opacity=".5" fill="none" stroke-width="2" stroke-linecap="round"/><path d="M-8 26 q7.5 -6 15 0 t15 0 t15 0 t15 0 t15 0" stroke="#bff0ff" stroke-opacity=".4" fill="none" stroke-width="1.6" stroke-linecap="round"/><circle cx="44" cy="18" r="1.6" fill="#fff" opacity=".6"/><circle cx="12" cy="20" r="1.2" fill="#fff" opacity=".5"/></pattern>';
    return d; }
  // ---------- tài nguyên nhỏ (biểu tượng) ----------
  function resMini(r,x,y,s){ s=s||1; const g=`<g transform="translate(${f(x)},${f(y)}) scale(${s})">`;
    if(r===0) return g+`<rect x="-8" y="-1" width="16" height="5" rx="2.5" fill="#8b5a2b"/><rect x="-6" y="-5" width="13" height="5" rx="2.5" fill="#a0693a"/><circle cx="8" cy="1.5" r="2.5" fill="#e8c48a" stroke="#6b3f18" stroke-width=".8"/><circle cx="7" cy="-2.5" r="2.5" fill="#e8c48a" stroke="#6b3f18" stroke-width=".8"/></g>`;
    if(r===1) return g+`<rect x="-8" y="-1" width="7" height="4" fill="#c4542a" stroke="#7a2a0c" stroke-width=".5"/><rect x="0" y="-1" width="7" height="4" fill="#b94b22" stroke="#7a2a0c" stroke-width=".5"/><rect x="-4" y="-5" width="7" height="4" fill="#d6643a" stroke="#7a2a0c" stroke-width=".5"/></g>`;
    if(r===2) return g+sheep(0,-1,.6,0)+'</g>';
    if(r===3) return g+[-3,0,3].map(a=>`<line x1="${a*.4}" y1="6" x2="${a}" y2="-4" stroke="#a37a12" stroke-width="1"/><ellipse cx="${a}" cy="-5" rx="1.6" ry="3.4" fill="#f5cf4a" stroke="#a37a12" stroke-width=".5"/>`).join('')+`<rect x="-3" y="1" width="6" height="1.6" fill="#7a4a10"/></g>`;
    if(r===4) return g+`<polygon points="-7,4 -5,-2 0,-5 4,-2 7,4" fill="#8a929c"/><polygon points="0,-5 4,-2 7,4 1,4" fill="#4e5660"/><polygon points="-2,0 0,-2 2,0 0,2" fill="#cfe8ff"/></g>`;
    return g+'</g>'; }
  // ---------- cảng ----------
  function port(px,py,ax,ay,bx,by,t,ang){ let o='';
    [[ax,ay],[bx,by]].forEach(([x,y])=>{ const L=Math.hypot(px-x,py-y), ux=(px-x)/L, uy=(py-y)/L; const nx=-uy*3.2, ny=ux*3.2;
      o+=`<polygon points="${f(x+nx)},${f(y+ny)} ${f(px+nx*.6)},${f(py+ny*.6)} ${f(px-nx*.6)},${f(py-ny*.6)} ${f(x-nx)},${f(y-ny)}" fill="#d9b27a" stroke="#8a5a2c" stroke-width="1.4"/>`;
      for(let k=1;k<6;k++){ const q=k/6; o+=`<line x1="${f(x+(px-x)*q+nx)}" y1="${f(y+(py-y)*q+ny)}" x2="${f(x+(px-x)*q-nx)}" y2="${f(y+(py-y)*q-ny)}" stroke="#8a5a2c" stroke-width="1"/>`; } });
    o+=`<g transform="translate(${f(px)},${f(py)}) scale(1.25)"><path d="M-25 10 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0" stroke="#fff" stroke-width="2.4" fill="none" opacity=".9"/><path d="M-20 14 q5 -3 10 0 t10 0 t10 0 t10 0" stroke="#bff3fb" stroke-width="1.6" fill="none" opacity=".8"/><g class="boat"><image href="assets/boat.webp?v=20261128f" x="-20" y="-36.8" width="40" height="47.7" preserveAspectRatio="none"/></g></g>`;
    const bx2=px+Math.cos(ang)*42, by2=py+Math.sin(ang)*42;
    o+=`<g transform="translate(${f(bx2)},${f(by2)})"><circle r="15.5" fill="#f7ebcd" stroke="#9a6b36" stroke-width="2.4"/><circle r="12.5" fill="none" stroke="#c9a26a" stroke-width=".9"/>${t>=0?resMini(t,0,-4,.75):''}<text y="${t>=0?9:5}" class="pt">${t<0?'3:1':'2:1'}</text></g>`;
    return o; }
  // ---------- quân cờ ----------
  function shade(c,v){ return v>0?mix(c,'#ffffff',v):mix(c,'#000000',-v); }
  const HSPR={'#e11d48':'red','#2563eb':'blue','#16a34a':'green','#f8fafc':'white'};
  function house(x,y,c,city,z){ z=z||1.28; const n=HSPR[c]||'red', u=`assets/house-${n}.webp?v=20261128f`;
    if(city){ const cu=`assets/city-${n}.webp?v=20261128f`; return `<g transform="translate(${f(x)},${f(y)}) scale(${z})"><ellipse cx="0" cy="12" rx="19" ry="5.5" fill="#6b4423" opacity=".38"/><image href="${cu}" x="-19" y="-24" width="38" height="38" preserveAspectRatio="none"/></g>`; }
    return `<g transform="translate(${f(x)},${f(y)}) scale(${z})"><ellipse cx="0" cy="10" rx="12" ry="3.6" fill="#6b4423" opacity=".35"/><image href="${u}" x="-12" y="-15.4" width="24" height="25.4" preserveAspectRatio="none"/></g>`; }
  function road(ax,ay,bx,by,c){ const n=HSPR[c]||'red', mx=(ax+bx)/2, my=(ay+by)/2; let ang=Math.atan2(by-ay,bx-ax)*180/Math.PI; if(ang>90) ang-=180; if(ang<-90) ang+=180;
    const L=Math.hypot(bx-ax,by-ay), w=Math.min(L-18,40), h=w*170/360;
    return `<g transform="translate(${f(mx)},${f(my)}) rotate(${f(ang)})"><rect x="${f(-w/2+3)}" y="${f(-h/2+4)}" width="${f(w-6)}" height="${f(h-4)}" rx="4" fill="#6b4423" opacity=".35"/><image href="assets/road-${n}.webp?v=20261128f" x="${f(-w/2)}" y="${f(-h/2-1)}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="none"/></g>`; }
  function robber(x,y){ return `<g transform="translate(${f(x)},${f(y)})" class="robber"><ellipse cx="2" cy="15" rx="11" ry="4" fill="#000" opacity=".45"/><path d="M-9,14 Q-11,6 -5,0 Q-8,-4 -6,-8 A7,7 0 1 1 6,-8 Q8,-4 5,0 Q11,6 9,14Z" fill="url(#khRob)" stroke="#000" stroke-width="1.2"/><ellipse cx="-3" cy="-10" rx="2.6" ry="3.6" fill="#fff" opacity=".35"/><ellipse cx="-5" cy="6" rx="2" ry="5" fill="#fff" opacity=".18"/><rect x="-9" y="12" width="18" height="3" rx="1.5" fill="#111"/></g>`; }
  function token(x,y,n){ const hot=n===6||n===8, k=KH.PIPS[n]||0;
    return `<g class="tok"><ellipse cx="${f(x+2)}" cy="${f(y+5)}" rx="17" ry="7" fill="#000" opacity=".35"/><circle cx="${f(x)}" cy="${f(y+2.5)}" r="16.5" fill="#8a6636"/><circle cx="${f(x)}" cy="${f(y)}" r="16" fill="url(#khToken)" stroke="#8a6636" stroke-width="2.2"/><circle cx="${f(x)}" cy="${f(y)}" r="13" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".9"/>
      <text x="${f(x+.6)}" y="${f(y+5.6)}" class="nm sh">${n}</text><text x="${f(x)}" y="${f(y+5)}" class="nm ${hot?'hot':''}">${n}</text>${Array.from({length:k},(_,i)=>`<circle cx="${f(x+(i-(k-1)/2)*3.6)}" cy="${f(y+10)}" r="1.25" fill="${hot?'#b91c1c':'#3a2a14'}"/>`).join('')}</g>`; }
  // ---------- toàn bàn cờ tĩnh ----------
  function board(S,box){ const H=KH.HEX, V=KH.V, E=KH.E; const {minX,minY,w,h}=box;
    let s=`<defs>${defs()}${H.map((hx,i)=>`<clipPath id="khc${i}"><polygon points="${hexPts(hx.x*R,hx.y*R,R)}"/></clipPath>`).join('')}<clipPath id="khIsl"><polygon points="${island()}"/></clipPath></defs>`;
    s+=`<rect x="${minX-500}" y="${minY-200}" width="${w+1000}" height="${h+400}" fill="#22b9e6"/><image href="assets/sea.webp?v=20261128f" x="${minX-500}" y="${minY-200}" width="${w+1000}" height="${h+400}" preserveAspectRatio="xMidYMid slice"/>`;
    { const Ri=4.3*R, kh=Ri/496.5, kv=.866*Ri/407.5, W=1254*kh, Hh=1254*kv; // đảo nền: lót cát + vành bãi cát vẽ sẵn
      s+=`<polygon points="${island(4.35/4.85)}" fill="#e9bf7c"/><image href="assets/island-ring.webp?v=20261128f" x="${f(-626.5*kh)}" y="${f(-615.5*kv)}" width="${f(W)}" height="${f(Hh)}" preserveAspectRatio="none"/>`; }
    s+=`<polygon points="${island(4.35/4.85)}" fill="#e9bf7c" opacity="0" clip-path="url(#khIsl)"/>`;
    const leaf=(x,y,r,c)=>`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" stroke="#1f4a14" stroke-width="2.2"/><circle cx="${f(x-r*.3)}" cy="${f(y-r*.3)}" r="${f(r*.45)}" fill="#b6e66a" opacity=".55"/>`;
    const fol=(x,y,sg)=>`<g>`+`<path d="M${f(x)} ${f(y+70)} q${f(sg*-30)} ${f(-40)} ${f(sg*-90)} ${f(-70)}" stroke="#5a3a1c" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M${f(x)} ${f(y+70)} q${f(sg*-30)} ${f(-40)} ${f(sg*-90)} ${f(-70)}" stroke="#8a5a2c" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`+[[-20,28,26,'#4fa83a'],[-58,6,24,'#5fba44'],[-30,-6,22,'#3f9632'],[-78,34,20,'#4fa83a'],[4,-4,20,'#5fba44'],[-46,50,18,'#3f9632']].map(([dx,dy,r,c])=>leaf(x+sg*dx,y+dy,r,c)).join('')+`</g>`;
    // cảng
    KH.PORT_E.forEach((e,i)=>{ const E0=E[e], a=V[E0.a], b=V[E0.b]; const mx=(a.x+b.x)/2, my=(a.y+b.y)/2, L=Math.hypot(mx,my); const px=(mx+mx/L*1.32)*R, py=(my+my/L*1.32)*R; s+=port(px,py,a.x*R,a.y*R,b.x*R,b.y*R,S.ports[i],Math.atan2(my,mx)); });
    // ô đất (đế 3D + hình)
    H.forEach((hx,i)=>{ const cx=hx.x*R, cy=hx.y*R; s+=`<polygon points="${hexPts(cx,cy+6,R-1)}" fill="#d2b27a"/><polygon points="${hexPts(cx+2,cy+9,R)}" fill="#7a5a2a" opacity=".18" filter="url(#khSoft)"/>`; });
    H.forEach((hx,i)=>{ const cx=hx.x*R, cy=hx.y*R, hd=S.hex[i];
      const HI=(window.KH_IMGS||{}).hex||[]; s+=`<g clip-path="url(#khc${i})">${HI.includes(hd.res)?`${hd.res<=5?`<image href="assets/hex-${hd.res}.webp?v=20261128f" x="${f(cx-R*.9)}" y="${f(cy-R*1.04)}" width="${f(R*1.8)}" height="${f(R*2.08)}" preserveAspectRatio="none"/>`:`<image href="assets/hex-${hd.res}.webp?v=20261128f" x="${f(cx-R*1.1)}" y="${f(cy-R*1.1)}" width="${f(R*2.2)}" height="${f(R*2.2)}" preserveAspectRatio="xMidYMid slice"/>`}`:terrain(hd.res,cx,cy,i)}<rect x="${f(cx-R)}" y="${f(cy-R)}" width="${2*R}" height="${2*R}" filter="url(#khNoise)" opacity=".07"/></g>`;
      s+=`<polygon points="${hexPts(cx,cy,R-1)}" fill="none" stroke="#d9bb82" stroke-width="3.4" stroke-linejoin="round"/><polygon points="${hexPts(cx,cy,R-4.5)}" fill="none" stroke="#b58b52" stroke-opacity=".45" stroke-width="1.3"/><polygon points="${hexPts(cx,cy,R)}" fill="none" stroke="#f3e2bb" stroke-width="1.6"/>`;
      });
    H.forEach((hx,i)=>{ const hd=S.hex[i]; if(hd.num) s+=token(hx.x*R,hx.y*R+8,hd.num); });
    return s; }
  function island(k){ k=k||1; const p=[]; const R2=R*4.85*k; for(let i=0;i<6;i++){ const a=Math.PI/180*(60*i); p.push(f(R2*Math.cos(a))+','+f(R2*Math.sin(a))); } return p.join(' '); }
  // ---------- xúc xắc ----------
  function die(n,c){ const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[n]||[];
    c=c||'#fbfaf6'; return `<svg viewBox="-16 -16 34 34" class="die"><rect x="-12" y="-11" width="26" height="26" rx="6" fill="#00000055"/><rect x="-13" y="-13" width="26" height="26" rx="6" fill="${shade(c,-.25)}"/><rect x="-13" y="-14" width="25" height="25" rx="6" fill="${c}"/><path d="M-11,-8 Q-11,-12 -7,-12 L7,-12" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/><rect x="-13" y="-14" width="25" height="25" rx="6" fill="none" stroke="#00000030"/>
      ${P.map(([a,b])=>`<circle cx="${a*6.5-.5}" cy="${b*6.5-1.5}" r="2.6" fill="${n===1?'#c0262d':'#1d1b22'}"/><circle cx="${a*6.5-1.1}" cy="${b*6.5-2.2}" r=".8" fill="#fff" opacity=".5"/>`).join('')}</svg>`; }
  // ---------- lá bài tài nguyên ----------
  const RC=['#2f7d32','#c2562b','#7cb342','#e0a91c','#6b7682'], RN=['Gỗ','Gạch','Cừu','Lúa','Đá'];
  const ccache={};
  function resCard(r){ if(ccache['r'+r]) return ccache['r'+r]; const id='khrc'+r, nm=RN[r].toUpperCase();
    const s=`<svg viewBox="0 0 100 76" class="rcard"><defs>
      <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98a52"/><stop offset=".45" stop-color="#a8642f"/><stop offset="1" stop-color="#7d4520"/></linearGradient></defs>
      <image href="assets/res-${r}.webp?v=20261128f" x="1" y="10" width="98" height="65" preserveAspectRatio="none"/>
      <g class="plank" transform="scale(1,.88)"><path d="M13 3.5 L16 1.5 H84 L87 3.5 L89 5.5 V17.5 L87 19.5 L84 21.5 H16 L13 19.5 L11 17.5 V5.5Z" fill="#1b0f06" transform="translate(0,1.2)" opacity=".55"/>
      <path d="M13 3 L16 1 H84 L87 3 L89 5 V17 L87 19 L84 21 H16 L13 19 L11 17 V5Z" fill="url(#${id}w)" stroke="#1b0f06" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M15 5 H55 M60 4.6 H84 M16 11 H40 M47 10.6 H70 M74 11 H86 M15 17.6 H48 M56 17.4 H84" stroke="#6b3a17" stroke-width=".7" stroke-linecap="round" fill="none" opacity=".7"/>
      <path d="M15 3.4 H84" stroke="#e8b27a" stroke-width=".9" stroke-linecap="round" opacity=".8"/>
      <circle cx="17" cy="11" r="2.1" fill="#4b4752" stroke="#1b0f06" stroke-width=".8"/><path d="M15.7 12.2 L18.3 9.8" stroke="#1b0f06" stroke-width=".7"/>
      <circle cx="83" cy="11" r="2.1" fill="#4b4752" stroke="#1b0f06" stroke-width=".8"/><path d="M81.7 12.2 L84.3 9.8" stroke="#1b0f06" stroke-width=".7"/>
      <text x="50" y="${nm.length>4?15.6:16.4}" class="rn" style="font-size:${nm.length>4?12.5:14.5}px">${nm}</text></g></svg>`;
    return ccache['r'+r]=s; }
  const DV={knight:['Hiệp sĩ','#7c2d12'],road:['Làm đường','#1e3a8a'],plenty:['Được mùa','#166534'],mono:['Độc quyền','#6b21a8'],vp:['Điểm thưởng','#a16207']};
  function devCard(k){ if(ccache[k]) return ccache[k]; const [nm,c]=DV[k]; let a='';
    if(k==='knight') a=`<rect width="70" height="70" fill="#d8c8a8"/><circle cx="35" cy="34" r="26" fill="#efe3c8"/><path d="M22 20 L48 58" stroke="#9aa3ad" stroke-width="4"/><path d="M45 54 l6 6 M43 57 l6 -6" stroke="#5b3a1d" stroke-width="3"/><path d="M20 30 Q20 52 35 60 Q50 52 50 30 L35 24Z" fill="${c}" stroke="#2a1006" stroke-width="1.5"/><path d="M35 28 V56 M24 38 H46" stroke="#fde68a" stroke-width="3"/><path d="M27 14 Q35 4 43 14 L43 20 L27 20Z" fill="#9aa3ad" stroke="#333"/><path d="M35 4 Q44 -2 48 8" stroke="#dc2626" stroke-width="3" fill="none"/>`;
    if(k==='road') a=`<rect width="70" height="70" fill="#9fd8f0"/><path d="M0 34 Q35 26 70 34 V70 H0Z" fill="#7cb342"/><path d="M28 70 Q34 50 36 34 Q38 50 46 70Z" fill="#c9a26b"/><path d="M36 40 V68" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 3"/><rect x="50" y="34" width="2" height="16" fill="#5b3a1d"/><path d="M52 36 h12 l3 3 l-3 3 h-12z" fill="#f4e4bc" stroke="#5b3a1d" stroke-width=".8"/>`+house(18,46,'#e11d48',false);
    if(k==='plenty') a=`<rect width="70" height="70" fill="#f5e7c4"/><path d="M10 26 Q30 20 50 40 Q58 50 54 60 Q40 44 14 40Z" fill="#c2873a" stroke="#6b3f18"/><circle cx="44" cy="52" r="5" fill="#dc2626"/><circle cx="52" cy="46" r="4.5" fill="#f59e0b"/><circle cx="40" cy="44" r="4" fill="#84cc16"/>`+resMini(3,30,52,1.4)+resMini(0,54,60,1);
    if(k==='mono') a=`<rect width="70" height="70" fill="#ede0f7"/><rect x="34" y="14" width="2.5" height="42" fill="#6b4a1a"/><rect x="24" y="56" width="22" height="4" rx="2" fill="#6b4a1a"/><path d="M14 22 H56" stroke="#a16207" stroke-width="2.5"/><path d="M14 22 L8 36 H20Z M56 22 L50 36 H62Z" fill="none" stroke="#6b4a1a"/><path d="M6 36 Q14 44 22 36Z M48 36 Q56 44 64 36Z" fill="#e0a91c"/>`+[0,1,2].map(i=>`<ellipse cx="56" cy="${33-i*3}" rx="5" ry="1.8" fill="#fde047" stroke="#a16207" stroke-width=".6"/>`).join('');
    if(k==='vp') a=`<rect width="70" height="70" fill="#fdf2d0"/><polygon points="10,26 35,12 60,26" fill="#e7d3a8" stroke="#7a5a2a"/>`+[14,24,34,44,54].map(x=>`<rect x="${x-2.5}" y="27" width="5" height="28" fill="#f8efdc" stroke="#b8a070" stroke-width=".6"/>`).join('')+`<rect x="8" y="55" width="54" height="5" fill="#e7d3a8" stroke="#7a5a2a"/><path d="M20 66 Q35 74 50 66" stroke="#4d7c0f" stroke-width="2" fill="none"/><text x="35" y="44" class="rn" style="font-size:12px;fill:#a16207">+1</text>`;
    const id='khdc'+k;
    const s=`<svg viewBox="0 0 70 98" class="rcard"><defs><clipPath id="${id}"><rect x="5" y="5" width="60" height="64" rx="4"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c,.35)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shade(c,-.4)}"/></linearGradient></defs>
      <rect width="70" height="98" rx="7" fill="url(#${id}g)"/><rect x="2.5" y="2.5" width="65" height="93" rx="5.5" fill="#fbf4e2"/><g clip-path="url(#${id})">${((window.KH_IMGS||{}).dev||[]).includes(k)?`<image href="assets/dev-${k}.webp" x="5" y="5" width="60" height="64" preserveAspectRatio="xMidYMid slice"/>`:`<g transform="translate(5,5) scale(.857,.914)">${a}</g>`}</g><rect x="5" y="5" width="60" height="64" rx="4" fill="none" stroke="${shade(c,-.3)}" stroke-width="1.2"/>
      <path d="M6 74 H64 L60 82 L64 90 H6 L10 82Z" fill="url(#${id}g)"/><text x="35" y="86" class="rn" style="font-size:9.5px">${nm}</text></svg>`;
    return ccache[k]=s; }
  return {R,board,house,road,robber,die,resCard,devCard,resMini,hexPts,shade,RC};
})();
