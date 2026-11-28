/* ===================== THUNG LŨNG HÒA SẮC — HÌNH VẼ (SVG, phong cách giấy cắt) ===================== */
const TLART=(()=>{
  const COL={rung:['#43a35a','#2d7a41','#7fd08f'],nui:['#8f8aaf','#6a6590','#c4c0dc'],dong:['#f3cb4f','#d2a228','#ffe790'],nha:['#e5654a','#b9452c','#f59a80'],ho:['#3f93dc','#2b6db0','#86c6f5']};
  const S3=Math.sqrt(3);
  const hexPts=(cx,cy,r)=>[0,1,2,3,4,5].map(i=>{ const a=(60*i)*Math.PI/180; return (cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1); }).join(' ');
  /* biểu tượng từng loại đất, vẽ quanh (0,0), bán kính ~44 */
  function glyph(t){ const c=COL[t];
    if(t==='rung') return `<rect x="-3" y="14" width="6" height="11" fill="#7a5230"/><polygon points="0,-30 -17,-6 17,-6" fill="${c[2]}"/><polygon points="0,-30 0,-6 17,-6" fill="#5cbb70"/><polygon points="0,-14 -22,16 22,16" fill="#2f8a47"/><polygon points="0,-14 0,16 22,16" fill="#236b37"/>`;
    if(t==='nui') return `<polygon points="-30,22 -10,-14 8,10 16,-4 32,22" fill="${c[1]}"/><polygon points="-10,-14 -30,22 -8,22" fill="${c[0]}"/><polygon points="-10,-14 -17,-1 -10,3 -3,-1" fill="#fff"/><polygon points="16,-4 10,6 16,10 22,6" fill="#e9e7f6"/><polygon points="8,10 16,-4 32,22 8,22" fill="#554f7e"/>`;
    if(t==='dong') return [-15,-5,5,15].map((x,i)=>`<line x1="${x}" y1="24" x2="${x+(i-1.5)*2}" y2="-14" stroke="#a97a14" stroke-width="2.4"/>`+[0,1,2,3].map(j=>`<ellipse cx="${x+(i-1.5)*2+(j%2?4:-4)}" cy="${-8+j*7}" rx="3.6" ry="6" transform="rotate(${j%2?30:-30} ${x+(i-1.5)*2+(j%2?4:-4)} ${-8+j*7})" fill="${j%2?'#fff0b0':'#fff7d0'}"/>`).join('')).join('');
    if(t==='nha') return `<rect x="-19" y="-2" width="38" height="25" fill="#fff1de"/><polygon points="0,-24 -26,-2 26,-2" fill="${c[1]}"/><polygon points="0,-24 26,-2 0,-2" fill="#8f3320"/><rect x="-5" y="9" width="10" height="14" fill="${c[1]}"/><rect x="-16" y="3" width="8" height="8" fill="#9fd4f5"/><rect x="8" y="3" width="8" height="8" fill="#9fd4f5"/>`;
    return [-12,0,12].map(y=>`<path d="M-26 ${y} q6.5 -9 13 0 t13 0 t13 0 t13 0" fill="none" stroke="#fff" stroke-opacity="${y?0.75:1}" stroke-width="4" stroke-linecap="round" transform="translate(0 ${y===0?2:0})"/>`).join('');
  }
  /* ---- token 3D (ảnh) — thêm ?art=old vào địa chỉ để quay lại hình lục giác cũ ---- */
  const NEWART=!/[?&]art=old/.test(location.search);
  const IMGN={rung:3,nui:3,dong:1,nha:1,ho:1};
  const K=1.3, UW=512, TIER=102.4; // ảnh rộng 512px; mỗi tầng cao 102.4px ảnh; tâm thân token ở y=217
  const tkImg=(t,h)=>{ h=Math.min(h||1,IMGN[t]); return 'assets/tk-'+t+'-'+h+'.webp'; };
  const tkGeom=(r,h)=>{ const E=r*K, k=E/384; h=Math.min(h||1,3); return {k, w:UW*k, ht:(217+(h-1)*TIER)*k, tier:TIER*k, tf:(217-166)*k}; };
  function discImg(t,cx,cy,r,h){ h=Math.min(h||1,IMGN[t]); const g=tkGeom(r,h), hh=(h===1?435:h===2?538:640)*g.k;
    return `<image href="${tkImg(t,h)}" x="${(cx-g.w/2).toFixed(1)}" y="${(cy-g.ht).toFixed(1)}" width="${g.w.toFixed(1)}" height="${hh.toFixed(1)}"/>`; }
  /* một đĩa đất (cao h) tại tâm (cx,cy) bán kính r */
  function discOld(t,cx,cy,r,h){ h=h||1; const c=COL[t]; let s='';
    for(let i=0;i<h;i++){ const y=cy-i*r*.22; s+=`<polygon points="${hexPts(cx,y+r*.2,r)}" fill="${c[1]}"/><polygon points="${hexPts(cx,y,r)}" fill="${c[0]}" stroke="${c[2]}" stroke-width="${(r*.05).toFixed(1)}"/>`; }
    const y=cy-(h-1)*r*.22; s+=`<g transform="translate(${cx} ${y}) scale(${(r/46).toFixed(3)})">${glyph(t)}</g>`; return s; }
  const disc=(t,cx,cy,r,h)=>NEWART?discImg(t,cx,cy,r,h):discOld(t,cx,cy,r,h);
  const token=(t,px,h)=>NEWART?`<svg viewBox="-56 -52 112 112" width="${px}" height="${px}" aria-hidden="true">${discImg(t,0,0,40,h)}</svg>`:`<svg viewBox="-52 -56 104 112" width="${px}" height="${px*1.08}" aria-hidden="true">${discOld(t,0,0,46,h)}</svg>`;
  /* ----- con vật (viewBox 0 0 100 100) ----- */
  const P=(pts,f,x)=>`<polygon points="${pts}" fill="${f}"${x||''}/>`, C=(cx,cy,r,f,x)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${x||''}/>`;
  const eye=(x,y,r)=>C(x,y,r||2.6,'#2b2118');
  const SH='<ellipse cx="50" cy="90" rx="30" ry="5" fill="#000" opacity=".16"/>';
  const AN={
   ech:()=>SH+P('22,72 30,50 50,42 70,50 78,72 62,86 38,86','#5fbf5f')+P('30,50 50,42 50,64 22,72','#7ad67a')+P('38,86 62,86 70,70 50,66 30,70','#dff3b8')+P('22,72 8,86 26,88 34,78','#4ea84e')+P('78,72 92,86 74,88 66,78','#4ea84e')+C(35,42,9,'#7ad67a')+C(65,42,9,'#7ad67a')+C(35,42,5.5,'#fff')+C(65,42,5.5,'#fff')+eye(36,43)+eye(64,43)+'<path d="M36 62 q14 9 28 0" stroke="#2f7a2f" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
   vit:()=>SH+P('18,68 34,52 62,50 80,62 74,82 40,88 20,82','#fff6d8')+P('34,52 62,50 56,66 18,68','#fff')+P('40,64 62,62 58,78 38,76','#e6d4a4')+C(68,38,14,'#3f9e55')+P('64,28 80,34 72,50 60,46','#58b46c')+P('80,34 94,40 80,46','#f2a33a')+eye(70,36)+'<path d="M10 90 q10 -6 20 0 t20 0 t20 0 t20 0" stroke="#7ec0f2" stroke-width="3" fill="none" stroke-linecap="round"/>',
   rua:()=>SH+P('18,70 28,46 50,36 72,46 82,70','#4f9d6b')+P('28,46 50,36 50,70 18,70','#62b87f')+P('50,36 72,46 82,70 50,70','#3d8658')+P('38,52 50,46 62,52 62,62 50,68 38,62','#2f6e47',' opacity=".55"')+P('18,70 82,70 76,78 24,78','#d9c48a')+P('30,78 28,90 42,90 42,78','#b9d27a')+P('58,78 58,90 72,90 70,78','#b9d27a')+C(88,62,9,'#c6dc8c')+eye(91,60,2)+P('18,70 8,78 20,76','#b9d27a'),
   co:()=>SH+P('30,60 58,46 70,62 52,80 32,74','#f4f6fb')+P('30,60 52,62 38,76','#dce3f2')+P('58,46 62,22 70,24 68,50','#f4f6fb')+C(68,20,8,'#fff')+P('73,17 96,22 73,26','#f2a33a')+eye(69,19,2)+'<path d="M44 78 L44 96 M54 80 L56 96" stroke="#f2a33a" stroke-width="3.2" stroke-linecap="round"/><path d="M68 15 q4 -8 8 -4" stroke="#2b2118" stroke-width="2.4" fill="none"/>',
   tho:()=>SH+P('26,86 22,64 38,50 64,54 78,72 72,86','#f4ebe0')+P('38,50 64,54 50,70 22,64','#fff')+P('38,48 34,12 46,14 50,46','#f4ebe0')+P('38,44 39,22 44,23 45,44','#f6b3c0')+P('52,48 58,10 69,16 62,52','#f4ebe0')+P('56,44 60,22 65,24 61,46','#f6b3c0')+C(50,56,16,'#fff')+eye(43,54)+eye(58,54)+P('47,62 53,62 50,66','#f08aa0')+C(78,78,7,'#fff'),
   cuu:()=>SH+[[30,62,16],[50,54,18],[70,62,16],[42,74,14],[62,74,14]].map((c,i)=>C(c[0],c[1],c[2],i%2?'#f1f1f4':'#fff',' stroke="#d3d3dc" stroke-width="1.4"')).join('')+P('68,50 86,46 90,62 76,70','#5a4a42')+P('68,50 60,42 72,44','#5a4a42')+P('34,84 34,94 40,94 40,84','#5a4a42')+P('62,84 62,94 68,94 68,84','#5a4a42')+eye(80,56,2.2),
   nai:()=>SH+P('24,60 62,56 70,76 28,78','#c98a52')+P('24,60 62,56 46,68','#dba06a')+P('62,56 70,30 82,34 76,62','#c98a52')+P('70,30 88,28 92,42 76,44','#d9a066')+'<path d="M76 28 L72 8 M74 18 L64 14 M82 26 L90 8 M86 16 L94 14" stroke="#8a5a2f" stroke-width="3" stroke-linecap="round" fill="none"/>'+eye(82,34,2)+'<path d="M32 78 L32 94 M42 78 L42 94 M58 76 L58 94 M66 76 L68 94" stroke="#8a5a2f" stroke-width="3.4" stroke-linecap="round"/>'+C(40,66,2,'#fff')+C(50,64,2,'#fff')+C(34,70,2,'#fff')+P('24,60 14,56 26,68','#fff'),
   cu:()=>SH+P('28,40 72,40 78,70 64,88 36,88 22,70','#9b7653')+P('28,40 50,40 50,88 36,88 22,70','#ad8862')+P('40,60 60,60 62,84 38,84','#ead6ab')+P('28,40 24,22 42,36','#7d5c3c')+P('72,40 76,22 58,36','#7d5c3c')+C(39,48,11,'#fff3c4','stroke="#f2a33a" stroke-width="2"')+C(61,48,11,'#fff3c4','stroke="#f2a33a" stroke-width="2"')+C(39,48,5,'#2b2118')+C(61,48,5,'#2b2118')+P('46,56 54,56 50,66','#f2a33a')+'<path d="M12 92 L88 92" stroke="#7a5230" stroke-width="4" stroke-linecap="round"/>',
   soc:()=>SH+P('36,52 58,54 62,82 40,88 32,72','#c97a3c')+P('40,62 54,62 54,84 40,84','#f4d9ae')+P('58,78 84,68 92,38 74,26 80,50 62,58','#e08c4a')+P('74,26 92,38 84,50','#f2a96c')+C(46,42,13,'#c97a3c')+P('36,34 38,22 46,30','#a85e2a')+P('52,30 58,22 58,34','#a85e2a')+eye(42,41,2.4)+C(40,47,2.4,'#2b2118')+C(24,80,5,'#8a5a2f'),
   gau:()=>SH+P('20,92 26,74 74,74 80,92','#6c4e32')+C(50,50,27,'#7a5a3c')+C(28,28,10,'#7a5a3c')+C(72,28,10,'#7a5a3c')+C(28,28,5,'#c9a47a')+C(72,28,5,'#c9a47a')+'<ellipse cx="50" cy="60" rx="14" ry="11" fill="#dcbc8c"/>'+P('44,56 56,56 50,63','#2b2118')+eye(39,44,2.8)+eye(61,44,2.8),
   de:()=>SH+P('24,62 62,56 70,76 28,80','#f6f6fa')+P('24,62 62,56 46,70','#e4e6f0')+P('62,56 72,32 84,36 80,52 70,66','#f6f6fa')+P('72,32 88,34 90,44 78,46','#fff')+P('78,46 80,60 74,52','#d9dbe6')+P('76,34 68,14 76,14 84,32','#4a4a5e')+'<path d="M32 80 L32 94 M42 80 L42 94 M58 76 L58 94 M66 78 L68 94" stroke="#4a4a5e" stroke-width="3.4" stroke-linecap="round"/>'+eye(82,38,2)+'<polygon points="10,94 30,66 50,94" fill="#b9b6d4" opacity=".6"/>',
   bang:()=>SH+P('50,52 6,34 12,62 30,68 44,66','#7a5230')+P('50,52 94,34 88,62 70,68 56,66','#6a4528')+P('6,34 28,46 12,62','#93653a')+P('94,34 72,46 88,62','#855530')+P('42,46 58,46 60,78 50,90 40,78','#5a3a20')+P('44,30 56,30 58,46 42,46','#fff')+P('50,40 58,48 44,48','#f2c94c')+P('40,78 60,78 56,94 44,94','#f4efe4')+eye(47,37,2)+eye(54,37,2),
   cao:()=>SH+P('50,88 20,50 22,20 40,36 60,36 78,20 80,50','#e87d2f')+P('20,50 22,20 40,36 50,62','#f29a56')+P('50,88 28,60 50,66 72,60','#fff')+P('24,26 34,38 26,44','#4a2c18')+P('76,26 66,38 74,44','#4a2c18')+P('45,78 55,78 50,86','#2b2118')+'<path d="M34 48 l10 4 M66 48 l-10 4" stroke="#2b2118" stroke-width="3" stroke-linecap="round"/>',
   meo:()=>SH+P('24,50 28,18 44,34 56,34 72,18 76,50 70,78 50,88 30,78','#9aa3b2')+P('24,50 28,18 44,34 50,62','#adb5c4')+P('28,24 36,34 30,40','#f2a8b8')+P('72,24 64,34 70,40','#f2a8b8')+'<ellipse cx="38" cy="52" rx="6" ry="7" fill="#9be07a"/><ellipse cx="62" cy="52" rx="6" ry="7" fill="#9be07a"/><ellipse cx="38" cy="52" rx="2" ry="6" fill="#2b2118"/><ellipse cx="62" cy="52" rx="2" ry="6" fill="#2b2118"/>'+P('46,64 54,64 50,69','#f08aa0')+'<path d="M26 66 l16 2 M26 72 l16 -2 M74 66 l-16 2 M74 72 l-16 -2 M50 69 v6" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M44 28 l2 8 M56 28 l-2 8" stroke="#6f7888" stroke-width="3"/>'};
  const animal=(k,px)=>`<svg viewBox="0 0 100 100" width="${px}" height="${px}" aria-hidden="true">${AN[k]()}</svg>`;
  /* ----- bảng lục giác ----- */
  const TINT={rung:'#d6f0c8',nui:'#e0e3ea',dong:'#fff0af',nha:'#fad6cd',ho:'#cde8fa'};
  const escx=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function boardSvg(B,o){ o=o||{}; const s=o.s||40, pad=s*.5, mini=!!o.mini;
    const m=NEWART?s*.6:0, rb=NEWART&&!mini&&o.name!=null?s*1.15:0, dy0=NEWART?s*.6:0;   // m: lề khung gỗ, rb: chiều cao thanh tên
    const W0=s*8+pad*2, H0=s*S3*5+pad*2, W=W0+m*2, H=H0+dy0+m*2+rb;
    const ox=pad+s+m, oy=pad+s*S3*.5+dy0+m+rb;
    const hl=o.hl||{}, cubeSz=s*1.05; let g='', up='';
    if(NEWART){ const fb=s*.38, rr=s*1.7;
      g+=`<rect x="${(fb*.2).toFixed(1)}" y="${(rb*.5+fb*.2).toFixed(1)}" width="${(W-fb*.4).toFixed(1)}" height="${(H-rb*.5-fb*.4).toFixed(1)}" rx="${rr.toFixed(1)}" fill="#b07d50"/><rect x="${fb.toFixed(1)}" y="${(rb*.5+fb).toFixed(1)}" width="${(W-fb*2).toFixed(1)}" height="${(H-rb*.5-fb*2).toFixed(1)}" rx="${(rr-fb*.8).toFixed(1)}" fill="#f0d5a0"/>`;
      if(!mini) [[1,1],[W-1,1],[1,H-1],[W-1,H-1]].forEach(c=>{ const cx=c[0]<W/2?fb+s*.55:W-fb-s*.55, cy=c[1]<H/2?rb*.5+fb+s*.55:H-fb-s*.55; g+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(s*.13).toFixed(1)}" fill="#966640"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(s*.07).toFixed(1)}" fill="#d6aa78"/>`; });
      if(rb){ const nm=escx(o.name), fz=s*.5, w=Math.min(W*.8,Math.max(s*5,nm.length*fz*.62+s*1.6)), x0=(W-w)/2;
        g+=`<rect x="${(x0+2).toFixed(1)}" y="${(s*.1+4).toFixed(1)}" width="${w.toFixed(1)}" height="${(rb*.9).toFixed(1)}" rx="${(rb*.45).toFixed(1)}" fill="#785029"/><rect x="${x0.toFixed(1)}" y="${(s*.1).toFixed(1)}" width="${w.toFixed(1)}" height="${(rb*.9).toFixed(1)}" rx="${(rb*.45).toFixed(1)}" fill="#fce296" stroke="#b07d50" stroke-width="${(s*.1).toFixed(1)}"/><text x="${(W/2).toFixed(1)}" y="${(s*.1+rb*.45+fz*.36).toFixed(1)}" text-anchor="middle" font-size="${fz.toFixed(1)}" font-weight="700" fill="#603c1e" font-family="system-ui,Arial,sans-serif">${nm}</text>`; } }
    TL.KEYS.forEach(k=>{ const [q,r]=k.split(',').map(Number), x=ox+s*1.5*q, y=oy+s*S3*(r+q/2), c=B[k]; const cl=hl[k]?' hl':'';
      const base=hl[k]?'#fff3c8':(NEWART&&c?TINT[c.t]:'#eadcb8'), edge=NEWART&&c&&!hl[k]?'#c9b48a':'#c9b48a';
      g+=`<g class="hx${cl}" data-hex="${k}"><polygon points="${hexPts(x,y+s*.1,s-1)}" fill="${edge}"/><polygon points="${hexPts(x,y,s-1)}" fill="${base}" stroke="${hl[k]?'#ffb703':'#cdb78a'}" stroke-width="${hl[k]?3.2:1.2}"/>`;
      let top='';
      if(c){ top+=disc(c.t,x,y,s*.86,c.h);
        if(c.cube!=null){ const gm=NEWART?tkGeom(s*.86,Math.min(c.h,IMGN[c.t])):null, cy2=NEWART?(y-gm.ht+gm.tf-cubeSz*.72):(y-cubeSz*.86);
          top+=`<g transform="translate(${x-cubeSz/2} ${cy2})"><rect x="${cubeSz*.08}" y="${cubeSz*.08}" width="${cubeSz*.84}" height="${cubeSz*.84}" rx="${cubeSz*.2}" fill="#fff" stroke="#8a5a2f" stroke-width="2"/>${animal(TL.A[c.cube].k,cubeSz).replace('<svg ','<svg x="0" y="0" ')}</g>`; } }
      if(hl[k]) top+=`<polygon points="${hexPts(x,y,s*.5)}" fill="#ffb703" opacity=".25"/>`;
      if(NEWART){ g+='</g>'; up+=`<g class="hx${cl}" data-hex="${k}" data-y="${y}">${top}</g>`; } else { g+=top+'</g>'; } });
    if(NEWART){ const arr=up.split('<g class="hx').filter(Boolean).map(x=>'<g class="hx'+x).sort((a,b)=>(+/data-y="([\d.]+)"/.exec(a)[1])-(+/data-y="([\d.]+)"/.exec(b)[1])); g+=arr.join(''); }
    return `<svg class="thb" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`; }
  /* ----- thẻ con vật ----- */
  const cond=a=>{ let s=`<span class="cd on">${token(a.on,26,1)}${a.h>1?`<b class="hh">▲${a.h}</b>`:''}</span>`; const ks=Object.keys(a.adj);
    if(ks.length){ s+='<span class="pl">+</span>'; ks.forEach(t=>{ s+=`<span class="cd">${token(t,22,1)}<b>×${a.adj[t]}</b></span>`; }); } return s; };
  function card(a,o){ o=o||{}; const n=o.cubes||0;
    return `<div class="tha ${o.cls||''}" ${o.attr||''}><div class="im">${animal(a.k,64)}</div><div class="nm">${a.name}</div><div class="cds">${cond(a)}</div><div class="sl">${a.s.map((v,i)=>`<i class="${i<n?'on':''}">${v}</i>`).join('')}</div></div>`; }
  return {COL,token,disc,glyph,animal,boardSvg,card,hexPts,S3};
})();
