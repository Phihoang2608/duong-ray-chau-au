/* BỘ KHUNG DÙNG CHUNG — core/effects.js: pháo giấy, thanh chữ chạy, thẻ bay */
/* ===================== HIỆU ỨNG ===================== */
/* Mức hiệu ứng: 'lite' (mặc định, đơn giản), 'full' (máy mạnh), 'off' (máy yếu) */
const FX_SCOPED=/duong-ray/.test(location.pathname)||!/\/games\//.test(location.pathname);
let FXMODE='lite'; try{ FXMODE=localStorage.getItem(FX_SCOPED?'dr-fx':'pbg-fx')||'lite'; }catch(e){}
if (!['lite','full','off'].includes(FXMODE)) FXMODE='lite';
function applyFxMode(){ const b=document.body; if(!b) return; b.classList.remove('fx-lite','fx-full','fx-off'); b.classList.add('fx-'+FXMODE); }
document.addEventListener('DOMContentLoaded', applyFxMode); if (document.body) applyFxMode();
const FX = {
  parts:[], running:false, cv:null, cx:null,
  setup(){ this.cv=document.getElementById('fxcanvas'); this.cx=this.cv.getContext('2d'); const rs=()=>{ this.cv.width=innerWidth*devicePixelRatio; this.cv.height=innerHeight*devicePixelRatio; }; rs(); addEventListener('resize',rs); },
  loop(){
    if(!this.running) return; const c=this.cx, dpr=devicePixelRatio; c.clearRect(0,0,this.cv.width,this.cv.height);
    const now=performance.now();
    this.parts=this.parts.filter(p=>now-p.t0<p.life);
    for(const p of this.parts){
      const age=(now-p.t0)/p.life; p.vy+=p.g; p.vx*=p.drag; p.vy*=p.drag; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
      c.save(); c.globalAlpha=Math.max(0,1-age*age); c.translate(p.x*dpr,p.y*dpr); c.rotate(p.rot);
      if(p.kind==='spark'){ c.fillStyle=p.color; c.shadowColor=p.color; c.shadowBlur=10*dpr; c.beginPath(); c.arc(0,0,p.size*dpr*(1-age*.6),0,7); c.fill(); }
      else if(p.kind==='star'){ c.fillStyle=p.color; c.beginPath(); for(let i=0;i<10;i++){ const r=(i%2?p.size*.45:p.size)*dpr, a=i*Math.PI/5; c.lineTo(Math.cos(a)*r,Math.sin(a)*r);} c.fill(); }
      else { c.fillStyle=p.color; c.fillRect(-p.size*dpr/2,-p.size*dpr/4,p.size*dpr,p.size*dpr/2); }
      c.restore();
    }
    if(this.parts.length) requestAnimationFrame(()=>this.loop()); else { this.running=false; c.clearRect(0,0,this.cv.width,this.cv.height); }
  },
  add(p){ if (FXMODE==='off') return; if (FXMODE==='lite' && this.parts.length>40) return; if (FXMODE==='lite' && p.kind==='spark') p.kind='conf'; this.parts.push(Object.assign({t0:performance.now(),vr:0,rot:0,drag:.99,g:.15,kind:'conf'},p)); if(!this.running){ this.running=true; requestAnimationFrame(()=>this.loop()); } },
  confetti(x,y,n,colors){ if (FXMODE==='lite') n=Math.ceil(n/3);
    colors=colors||['#ff5f6d','#ffc371','#7bd389','#5aa9ff','#b57bff','#fff4b0'];
    for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, s=3+Math.random()*7; this.add({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-5,size:5+Math.random()*6,color:colors[i%colors.length],life:1600+Math.random()*1200,vr:(Math.random()-.5)*.4,g:.18,drag:.985,kind:Math.random()<.25?'star':'conf'}); }
  },
  firework(x,y,color){ if (FXMODE!=='full') return;
    const cols=[color||'#ffd36b','#fff','#ffb3c1'];
    for(let i=0;i<60;i++){ const a=i/60*Math.PI*2, s=2.5+Math.random()*3.5; this.add({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,size:2+Math.random()*2,color:cols[i%3],life:900+Math.random()*700,g:.05,drag:.97,kind:'spark'}); }
  },
  rain(sec){
    const end=performance.now()+sec*1000; const tick=()=>{ for(let i=0;i<6;i++) this.add({x:Math.random()*innerWidth,y:-20,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,size:6+Math.random()*6,color:['#ff5f6d','#ffc371','#7bd389','#5aa9ff','#b57bff','#ffd700'][Math.floor(Math.random()*6)],life:5000,g:.04,drag:.995,vr:(Math.random()-.5)*.3,kind:Math.random()<.2?'star':'conf'}); if(performance.now()<end) setTimeout(tick,60); };
    tick();
  },
  banner(title, sub, cls, ms){ Ticker.push(title+(sub?' <span class="tsub">— '+sub+'</span>':''), cls||'info'); },
  fly(fromRect, toRect, html, delay){
    if(!fromRect||!toRect||FXMODE==='off') return; const el=document.createElement('div'); el.className='flycard'; el.innerHTML=html;
    const w=fromRect.width||56, h=fromRect.height||80;
    Object.assign(el.style,{left:fromRect.left+'px',top:fromRect.top+'px',width:w+'px',height:h+'px'});
    document.body.appendChild(el);
    const dx=toRect.left+toRect.width/2-(fromRect.left+w/2), dy=toRect.top+toRect.height/2-(fromRect.top+h/2);
    setTimeout(()=>{ el.style.transform=`translate(${dx}px,${dy}px) rotate(${(Math.random()-.5)*40}deg) scale(.55)`; el.style.opacity='.2'; }, 30+(delay||0));
    setTimeout(()=>el.remove(), 900+(delay||0));
  },
  scorePop(rect, txt, color){
    const el=document.createElement('div'); el.className='scorepop'; el.textContent=txt; el.style.setProperty('--c', color);
    el.style.left=(rect.left+rect.width/2)+'px'; el.style.top=(rect.top+rect.height/2)+'px'; document.body.appendChild(el);
    this.confetti(rect.left+rect.width/2, rect.top+rect.height/2, 22, [color,'#ffd36b','#fff']); setTimeout(()=>el.remove(), 1900);
  },
  shake(el){ if(!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),700); },
  svgPoint(x,y){ const svg=document.getElementById('map'); const m=svg.getScreenCTM(); if(!m) return null; const p=svg.createSVGPoint(); p.x=x; p.y=y; const q=p.matrixTransform(m); return {x:q.x,y:q.y}; }
};
function svgEl(tag, attrs){ const e=document.createElementNS('http://www.w3.org/2000/svg',tag); for(const k in attrs) e.setAttribute(k,attrs[k]); return e; }
function routeGeom(r){
  const A=CITIES[r.a], B=CITIES[r.b]; const dx=B.x-A.x, dy=B.y-A.y; const d=Math.hypot(dx,dy);
  const ux=dx/d, uy=dy/d, nx=-uy, ny=ux, off=r.lane*7.5; return {ax:A.x+nx*off, ay:A.y+ny*off, ux, uy, d, ang:Math.atan2(dy,dx)*180/Math.PI};
}
const TRAIN_RUN_MS = 1300;
function trainRun(r, color){ if (FXMODE==='off') return;
  const layer=document.getElementById('fxl'); if(!layer) return;
  const g=routeGeom(r); const loco=svgEl('g',{});
  loco.innerHTML=`<g transform="scale(.9)"><rect x="-14" y="-7" width="20" height="14" rx="6" fill="${color}" stroke="#111" stroke-width="1.4"/><rect x="4" y="-9" width="10" height="18" rx="2" fill="${shade(color,-.3)}" stroke="#111" stroke-width="1.4"/>
    <rect x="-10" y="-12" width="5" height="6" fill="#222"/><path d="M-14,-6 L-21,0 L-14,6Z" fill="#c9a227" stroke="#111"/><circle cx="-16" cy="0" r="2.2" fill="#fff6a0"/><rect x="7" y="-5" width="4" height="4" fill="#ffe9a8"/></g>`;
  layer.appendChild(loco);
  const t0=performance.now(); let lastPuff=0;
  // đầu tàu chạy từ A sang B => đầu hướng về B, hình vẽ đầu tàu hướng -x nên xoay thêm 180
  const step=now=>{
    const k=Math.min(1,(now-t0)/TRAIN_RUN_MS); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; const dist=13+(g.d-26)*e;
    const x=g.ax+g.ux*dist, y=g.ay+g.uy*dist;
    loco.setAttribute('transform',`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(g.ang+180).toFixed(1)})`);
    if(now-lastPuff>70 && k<1){ lastPuff=now; const p=svgEl('circle',{cx:(x-g.ux*6).toFixed(1),cy:(y-g.uy*6-8).toFixed(1),r:4+Math.random()*3,class:'puff'}); layer.appendChild(p); setTimeout(()=>p.remove(),1300); }
    if(k<1) requestAnimationFrame(step); else { loco.style.transition='opacity .5s'; loco.style.opacity='0'; setTimeout(()=>loco.remove(),600); }
  };
  requestAnimationFrame(step);
}
function floatText(x,y,text,color){
  const layer=document.getElementById('fxl'); if(!layer) return;
  const t=svgEl('text',{x,y,'text-anchor':'middle',class:'floattxt',fill:color||'#fff'}); t.textContent=text; layer.appendChild(t); setTimeout(()=>t.remove(),1800);
}
function ringPulse(x,y,color){
  const layer=document.getElementById('fxl'); if(!layer) return;
  for(let i=0;i<3;i++){ const c=svgEl('circle',{cx:x,cy:y,r:10,fill:'none',stroke:color,'stroke-width':4,class:'ring',style:`animation-delay:${i*.25}s`}); layer.appendChild(c); setTimeout(()=>c.remove(),1800); }
}

/* ===== Thanh chữ chạy (thay cho chữ to đè lên màn hình) ===== */
const Ticker = {
  q:[], busy:false,
  push(html, cls){ this.q.push({html, cls:cls||'info'}); if (this.q.length>6) this.q.splice(0, this.q.length-6); if(!this.busy) this.next(); },
  next(){
    const box=document.querySelector('#tmsg'); if(!box){ this.q=[]; return; }
    const m=this.q.shift(); if(!m){ this.busy=false; return; } this.busy=true;
    const old=box.querySelector('.tm.cur'); if(old){ old.classList.remove('cur'); old.classList.add('leave'); setTimeout(()=>old.remove(),450); }
    const el=document.createElement('div'); el.className='tm cur '+m.cls; el.innerHTML=`<span class="tmi">${m.html}</span>`; box.appendChild(el);
    box.classList.remove('flash-'+'win','flash-final','flash-me'); void box.offsetWidth; if(['win','final','me'].includes(m.cls)) box.classList.add('flash-'+m.cls);
    let hold=this.q.length ? 1300 : 2200;
    requestAnimationFrame(()=>{ const inner=el.querySelector('.tmi'); const over=inner.scrollWidth-box.clientWidth+30;
      if (over>0){ const dur=Math.max(3, over/60); inner.style.setProperty('--dx', -over+'px'); inner.style.animation=`tscroll ${dur}s linear .8s 1 forwards`; hold=Math.max(hold, dur*1000+1600); }
      setTimeout(()=>this.next(), hold); });
  }
};
