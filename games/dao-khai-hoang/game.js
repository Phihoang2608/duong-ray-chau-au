/* ===================== ĐẢO KHAI HOANG ===================== */
// tài nguyên: 0 Gỗ, 1 Gạch, 2 Cừu, 3 Lúa, 4 Đá ; 5 = sa mạc
const KH_RES=['Gỗ','Gạch','Cừu','Lúa','Đá'], KH_WIN=10;
const KH_COST={road:[1,1,0,0,0], town:[1,1,1,1,0], city:[0,0,0,2,3], dev:[0,0,1,1,1]};
const KH_DEVN={knight:'Hiệp sĩ', vp:'Điểm thưởng', road:'Làm đường', plenty:'Được mùa', mono:'Độc quyền'};
const KH = (()=>{
  // ---------- địa hình cố định ----------
  const HEX=[]; for(let q=-2;q<=2;q++) for(let r=-2;r<=2;r++){ const s=-q-r; if(Math.abs(s)<=2) HEX.push({q,r,x:Math.sqrt(3)*(q+r/2), y:1.5*r}); }
  HEX.sort((a,b)=>a.y-b.y||a.x-b.x);
  const V=[], vKey={}, E=[], eKey={};
  HEX.forEach((h,hi)=>{ h.v=[]; for(let k=0;k<6;k++){ const a=Math.PI/180*(60*k-90); const x=h.x+Math.cos(a), y=h.y+Math.sin(a); const key=Math.round(x*100)+','+Math.round(y*100);
      if(vKey[key]==null){ vKey[key]=V.length; V.push({x,y,hex:[],adj:[],e:[]}); } const vi=vKey[key]; V[vi].hex.push(hi); h.v.push(vi); }
    for(let k=0;k<6;k++){ const a=h.v[k], b=h.v[(k+1)%6]; const key=Math.min(a,b)+'-'+Math.max(a,b);
      if(eKey[key]==null){ eKey[key]=E.length; E.push({a:Math.min(a,b),b:Math.max(a,b),hex:[]}); V[a].adj.push(b); V[b].adj.push(a); V[a].e.push(eKey[key]); V[b].e.push(eKey[key]); } E[eKey[key]].hex.push(hi); } });
  // cảng: 9 cạnh ven biển chia đều quanh đảo
  const coast=E.map((e,i)=>i).filter(i=>E[i].hex.length===1).sort((i,j)=>{ const ang=k=>{ const e=E[k]; return Math.atan2((V[e.a].y+V[e.b].y)/2,(V[e.a].x+V[e.b].x)/2); }; return ang(i)-ang(j); });
  const PORT_E=[0,1,2,3,4,5,6,7,8].map(i=>coast[Math.floor(i*coast.length/9+1)%coast.length]);
  const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const PIPS={2:1,3:2,4:3,5:4,6:5,8:5,9:4,10:3,11:2,12:1};
  const tot=a=>a.reduce((s,x)=>s+x,0);
  function makeBoard(){
    for(let tries=0;tries<500;tries++){
      const res=shuffle([0,0,0,0,1,1,1,2,2,2,2,3,3,3,3,4,4,4,5]); const nums=shuffle([2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12]); let k=0;
      const hex=res.map(r=>({res:r,num:r===5?0:nums[k++]}));
      const hot=hex.map((h,i)=>h.num===6||h.num===8?i:-1).filter(i=>i>=0);
      const bad=hot.some(i=>hot.some(j=>j!==i && HEX[i].v.filter(v=>HEX[j].v.includes(v)).length>=2));
      if(!bad) return hex; } }
  function newGame(seats,t){ UND=null;
    const n=seats.length, hex=makeBoard();
    const ports=shuffle([-1,-1,-1,-1,0,1,2,3,4]); // -1 = 3:1
    const dev=shuffle([].concat(Array(14).fill('knight'),Array(5).fill('vp'),Array(2).fill('road'),Array(2).fill('plenty'),Array(2).fill('mono')));
    const S={seats:seats.map(s=>({name:s.name,bot:!!s.bot,peer:s.peer||null,pid:s.pid||null,color:s.color})),
      hex, robber:hex.findIndex(h=>h.res===5), ports, vo:V.map(()=>null), eo:E.map(()=>-1), dev,
      P:seats.map(()=>({res:[0,0,0,0,0], dev:[], newDev:[], knights:0, roads:15, towns:5, cities:4, vp:0, lr:0})),
      phase:'setup', setupStep:0, setupV:-1, turn:0, step:'town', dice:null, rolled:false, devPlayed:false, free:0, largest:-1, longest:-1,
      turnAt:t, log:[], evN:0, ev:null, winner:-1, round:1};
    S.order=[...Array(n).keys()].concat([...Array(n).keys()].reverse());
    S.log.unshift('Xếp nhà đầu tiên: mỗi người đặt 1 nhà và 1 đường, rồi đi ngược lại lần hai.');
    return S; }
  function ev(S,o){ S.evN++; S.ev=Object.assign({n:S.evN},o); }
  const canPay=(P,c)=>c.every((x,i)=>P.res[i]>=x);
  const pay=(P,c)=>c.forEach((x,i)=>P.res[i]-=x);
  function townFree(S,v){ return S.vo[v]==null && V[v].adj.every(u=>S.vo[u]==null); }
  function townOK(S,p,v){ if(!townFree(S,v)) return false; if(S.phase==='setup') return true; return V[v].e.some(e=>S.eo[e]===p); }
  function roadOK(S,p,e){ if(S.eo[e]!==-1) return false; const E0=E[e];
    if (S.phase==='setup') return E0.a===S.setupV||E0.b===S.setupV;
    return [E0.a,E0.b].some(v=>{ const o=S.vo[v]; if(o&&o.p===p) return true; if(o&&o.p!==p) return false; return V[v].e.some(x=>x!==e&&S.eo[x]===p); }); }
  function rates(S,p){ const r=[4,4,4,4,4]; PORT_E.forEach((e,i)=>{ const E0=E[e]; if([E0.a,E0.b].some(v=>S.vo[v]&&S.vo[v].p===p)){ const t=S.ports[i]; if(t<0) for(let k=0;k<5;k++) r[k]=Math.min(r[k],3); else r[t]=2; } }); return r; }
  function longestFor(S,p){ let best=0; const own=E.map((_,i)=>S.eo[i]===p);
    function dfs(v,used,len){ best=Math.max(best,len); const o=S.vo[v]; if(len>0&&o&&o.p!==p) return;
      V[v].e.forEach(e=>{ if(!own[e]||used.has(e)) return; used.add(e); const E0=E[e]; dfs(E0.a===v?E0.b:E0.a,used,len+1); used.delete(e); }); }
    E.forEach((e,i)=>{ if(own[i]){ dfs(e.a,new Set(),0); dfs(e.b,new Set(),0); } }); return best; }
  function updateAwards(S){ const n=S.seats.length;
    S.P.forEach((P,i)=>P.lr=longestFor(S,i));
    const cur=S.longest; let best=cur>=0?S.P[cur].lr:4, who=cur; if(cur>=0&&S.P[cur].lr<5){ who=-1; best=4; }
    S.P.forEach((P,i)=>{ if(P.lr>best){ best=P.lr; who=i; } });
    if (who!==cur && who>=0){ S.log.unshift(S.seats[who].name+' giành Đường dài nhất ('+best+' đoạn).'); ev(S,{k:'award',seat:who,a:'road'}); } S.longest=who;
    const ca=S.largest; let kb=ca>=0?S.P[ca].knights:2, kw=ca; S.P.forEach((P,i)=>{ if(P.knights>kb){ kb=P.knights; kw=i; } });
    if (kw!==ca){ S.log.unshift(S.seats[kw].name+' giành Quân đội mạnh nhất ('+kb+' hiệp sĩ).'); ev(S,{k:'award',seat:kw,a:'army'}); } S.largest=kw; }
  function vp(S,i,hidden){ const P=S.P[i]; let v=0; S.vo.forEach(o=>{ if(o&&o.p===i) v+=o.city?2:1; }); if(S.longest===i) v+=2; if(S.largest===i) v+=2; if(hidden) v+=P.dev.filter(d=>d==='vp').length+P.newDev.filter(d=>d==='vp').length; return v; }
  function checkWin(S,t){ const i=S.turn; if(vp(S,i,true)>=KH_WIN){ S.phase='over'; S.winner=i; S.log.unshift(S.seats[i].name+' đạt '+vp(S,i,true)+' điểm và chiến thắng!'); ev(S,{k:'over'}); return true; } return false; }
  function produce(S,num){ const got=S.seats.map(()=>[0,0,0,0,0]);
    S.hex.forEach((h,hi)=>{ if(h.num!==num||hi===S.robber) return; HEX[hi].v.forEach(v=>{ const o=S.vo[v]; if(o){ got[o.p][h.res]+=o.city?2:1; } }); });
    got.forEach((g,i)=>g.forEach((x,r)=>S.P[i].res[r]+=x)); return got; }
  function stealFrom(S,thief,victim){ const P=S.P[victim]; const pool=[]; P.res.forEach((x,r)=>{ for(let k=0;k<x;k++) pool.push(r); }); if(!pool.length) return -1; const r=pool[Math.floor(Math.random()*pool.length)]; P.res[r]--; S.P[thief].res[r]++; return r; }
  function victims(S,hexI,me){ return [...new Set(HEX[hexI].v.map(v=>S.vo[v]).filter(o=>o&&o.p!==me).map(o=>o.p))].filter(p=>tot(S.P[p].res)>0); }
  function autoLost(P,n){ const r2=P.res.slice(), lost=[0,0,0,0,0]; while(n-->0){ let m=0; for(let r=1;r<5;r++) if(r2[r]>r2[m]) m=r; if(r2[m]<=0) break; r2[m]--; lost[m]++; } return lost; }
  function startDiscard(S,t){ const d={}; S.P.forEach((P,i)=>{ const c=tot(P.res); if(c>7) d[i]=Math.floor(c/2); }); return d; }
  function discardAct(S,seat,a,t){ if(S.step!=='discard'||!S.disc||S.disc[seat]==null) return false; const P=S.P[seat], n=S.disc[seat], v=a.res;
    if(!Array.isArray(v)||v.length!==5||!v.every((x,r)=>Number.isInteger(x)&&x>=0&&x<=P.res[r])||v.reduce((s,x)=>s+x,0)!==n) return false;
    v.forEach((x,r)=>{ P.res[r]-=x; }); delete S.disc[seat];
    S.log.unshift(S.seats[seat].name+' bỏ '+n+' lá: '+v.map((x,r)=>x?x+' '+KH_RES[r]:'').filter(Boolean).join(', ')+'.'); ev(S,{k:'discard',seat,res:v,n});
    if(!Object.keys(S.disc).length){ S.disc=null; S.step='robber'; S.log.unshift(S.seats[S.turn].name+' dời kẻ cướp.'); } S.turnAt=t; return true; }
  // ---------- đổi với người chơi ----------
  function vecOK(v){ return Array.isArray(v)&&v.length===5&&v.every(x=>Number.isInteger(x)&&x>=0&&x<=9)&&v.reduce((s,x)=>s+x,0)>0; }
  function fmtV(v){ return v.map((c,r)=>c?c+' '+KH_RES[r]:'').filter(Boolean).join(' + '); }
  function offerSeats(S,o){ return S.seats.map((_,i)=>i).filter(i=>i!==o.from&&(o.to<0||o.to===i)); }
  function pending(S){ const o=S.offer; return o?offerSeats(S,o).filter(i=>!o.no.includes(i)):[]; }
  function answer(S,seat,ok,t){ const o=S.offer; if(!o||seat===o.from||(o.to>=0&&o.to!==seat)||o.no.includes(seat)) return false;
    const Q=S.P[seat], P=S.P[o.from];
    if (ok){ if(!o.get.every((x,i)=>Q.res[i]>=x)||!o.give.every((x,i)=>P.res[i]>=x)) return false;
      o.give.forEach((x,i)=>{ P.res[i]-=x; Q.res[i]+=x; }); o.get.forEach((x,i)=>{ Q.res[i]-=x; P.res[i]+=x; });
      S.log.unshift(S.seats[o.from].name+' đổi với '+S.seats[seat].name+': '+fmtV(o.give)+' ⇄ '+fmtV(o.get)+'.'); S.offer=null; S.turnAt=t; ev(S,{k:'trade',seat:o.from}); return true; }
    o.no.push(seat); if(!pending(S).length){ S.log.unshift('Không ai đồng ý đổi với '+S.seats[o.from].name+'.'); S.offer=null; S.turnAt=t; } return true; }
  function apply0(S,seat,a,t){
    if (!a||S.phase==='over') return false;
    if (a.t==='answer') return answer(S,seat,!!a.ok,t);
    if (a.t==='discard') return discardAct(S,seat,a,t);
    if (S.step==='discard') return false;
    if (seat!==S.turn) return false; const P=S.P[seat], name=S.seats[seat].name;
    if (S.offer){ if(a.t==='cancel'){ S.log.unshift(name+' huỷ yêu cầu đổi.'); S.offer=null; S.turnAt=t; return true; } return false; }
    if (a.t==='offer'){ if(S.phase!=='play'||S.step!=='main') return false; const g=a.give, w=a.get; if(!vecOK(g)||!vecOK(w)) return false;
      for(let i=0;i<5;i++){ if((g[i]&&w[i])||P.res[i]<g[i]) return false; }
      const to=Number.isInteger(a.to)&&a.to>=0&&a.to<S.seats.length&&a.to!==seat?a.to:-1; const o={from:seat,give:g,get:w,to,no:[],at:t};
      o.no=offerSeats(S,o).filter(i=>!w.every((x,r)=>S.P[i].res[r]>=x)); const txt=name+' muốn đổi: đưa '+fmtV(g)+', lấy '+fmtV(w)+(to>=0?' (với '+S.seats[to].name+')':'')+'.';
      if(!pending({...S,offer:o}).length){ S.log.unshift(txt,'Chưa ai đủ lá để đổi lại với '+name+'.'); ev(S,{k:'offer',seat}); return true; }
      S.offer=o; S.turnAt=t; S.log.unshift(name+' muốn đổi: đưa '+fmtV(g)+', lấy '+fmtV(w)+(to>=0?' (với '+S.seats[to].name+')':'')+'.'); ev(S,{k:'offer',seat}); return true; }
    if (S.phase==='setup'){
      if (S.step==='town' && a.t==='town'){ if(!(a.v>=0&&a.v<V.length)||!townOK(S,seat,a.v)) return false; S.vo[a.v]={p:seat,city:false}; P.towns--; S.setupV=a.v; S.step='road';
        if (S.setupStep>=S.seats.length){ V[a.v].hex.forEach(hi=>{ const r=S.hex[hi].res; if(r<5) P.res[r]++; }); }
        ev(S,{k:'town',seat,v:a.v}); S.turnAt=t; return true; }
      if (S.step==='road' && a.t==='road'){ if(!(a.e>=0&&a.e<E.length)||!roadOK(S,seat,a.e)) return false; S.eo[a.e]=seat; P.roads--; ev(S,{k:'road',seat,e:a.e}); updateAwards(S);
        S.setupStep++; if (S.setupStep>=S.order.length){ S.phase='play'; S.turn=0; S.step='roll'; S.log.unshift('Bắt đầu! '+S.seats[0].name+' đổ xúc xắc trước.'); }
        else { S.turn=S.order[S.setupStep]; S.step='town'; } S.setupV=-1; S.turnAt=t; return true; }
      return false; }
    // ----- trong ván -----
    if (S.step==='robber'){ if(a.t!=='robber'||!(a.h>=0&&a.h<19)||a.h===S.robber) return false; S.robber=a.h;
      const vs=victims(S,a.h,seat); let msg=name+' dời kẻ cướp'; if(vs.length){ const vic=a.v!=null&&vs.includes(a.v)?a.v:vs[Math.floor(Math.random()*vs.length)]; const r=stealFrom(S,seat,vic); msg+=' và lấy 1 lá của '+S.seats[vic].name; ev(S,{k:'steal',seat,vic,r}); } else ev(S,{k:'robber',seat});
      S.log.unshift(msg+'.'); S.step=S.rolled?'main':'roll'; S.turnAt=t; return true; }
    if (a.t==='roll'){ if(S.step!=='roll') return false; const d=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)], s=d[0]+d[1]; S.dice=d; S.rolled=true;
      if (s===7){ const dd=startDiscard(S,t), ks=Object.keys(dd).map(Number); if(ks.length){ S.disc=dd; S.step='discard'; S.log.unshift(name+' đổ ra 7 — '+ks.map(i=>S.seats[i].name+' (bỏ '+dd[i]+')').join(', ')+' có hơn 7 lá phải bỏ một nửa.'); } else { S.step='robber'; S.log.unshift(name+' đổ ra 7 — dời kẻ cướp!'); } ev(S,{k:'roll',seat,d,disc:ks.length?dd:null}); }
      else { const got=produce(S,s); S.step='main'; const g=got.map((x,i)=>tot(x)?S.seats[i].name+' +'+x.map((c,r)=>c?c+' '+KH_RES[r]:'').filter(Boolean).join(', '):'').filter(Boolean); S.log.unshift(name+' đổ '+s+'. '+(g.length?g.join(' · '):'Không ai nhận được gì.')); ev(S,{k:'roll',seat,d,got}); }
      S.turnAt=t; return true; }
    if (a.t==='knight'){ if(S.devPlayed||(S.step!=='roll'&&S.step!=='main')) return false; const i=P.dev.indexOf('knight'); if(i<0) return false; P.dev.splice(i,1); P.knights++; S.devPlayed=true; S.step='robber'; updateAwards(S); S.log.unshift(name+' dùng Hiệp sĩ.'); ev(S,{k:'dev',seat,d:'knight'}); if(checkWin(S,t)) return true; S.turnAt=t; return true; }
    if (S.step!=='main') return false;
    if (a.t==='road'){ if(!(a.e>=0&&a.e<E.length)||!roadOK(S,seat,a.e)||P.roads<=0) return false; if(S.free>0) S.free--; else { if(!canPay(P,KH_COST.road)) return false; pay(P,KH_COST.road); }
      S.eo[a.e]=seat; P.roads--; updateAwards(S); ev(S,{k:'road',seat,e:a.e}); checkWin(S,t); return true; }
    if (a.t==='town'){ if(!(a.v>=0&&a.v<V.length)||!townOK(S,seat,a.v)||P.towns<=0||!canPay(P,KH_COST.town)) return false; pay(P,KH_COST.town); S.vo[a.v]={p:seat,city:false}; P.towns--; updateAwards(S); S.log.unshift(name+' xây nhà mới.'); ev(S,{k:'town',seat,v:a.v}); checkWin(S,t); return true; }
    if (a.t==='city'){ const o=S.vo[a.v]; if(!o||o.p!==seat||o.city||P.cities<=0||!canPay(P,KH_COST.city)) return false; pay(P,KH_COST.city); o.city=true; P.cities--; P.towns++; S.log.unshift(name+' nâng cấp lên thành phố.'); ev(S,{k:'city',seat,v:a.v}); checkWin(S,t); return true; }
    if (a.t==='buydev'){ if(!S.dev.length||!canPay(P,KH_COST.dev)) return false; pay(P,KH_COST.dev); const d=S.dev.pop(); P.newDev.push(d); S.log.unshift(name+' mua 1 thẻ phát triển.'); ev(S,{k:'buydev',seat,d}); checkWin(S,t); return true; }
    if (a.t==='trade'){ const g=a.give, w=a.get, r=a.bank?[4,4,4,4,4]:rates(S,seat); if(!(g>=0&&g<5&&w>=0&&w<5)||g===w||P.res[g]<r[g]) return false; P.res[g]-=r[g]; P.res[w]++; S.log.unshift(name+(a.bank?' đổi với ngân hàng ':' đổi ')+r[g]+' '+KH_RES[g]+' lấy 1 '+KH_RES[w]+'.'); ev(S,{k:'trade',seat}); return true; }
    if (a.t==='plenty'){ if(S.devPlayed) return false; const i=P.dev.indexOf('plenty'); if(i<0||!(a.r1>=0&&a.r1<5&&a.r2>=0&&a.r2<5)) return false; P.dev.splice(i,1); S.devPlayed=true; P.res[a.r1]++; P.res[a.r2]++; S.log.unshift(name+' dùng Được mùa: +1 '+KH_RES[a.r1]+', +1 '+KH_RES[a.r2]+'.'); ev(S,{k:'dev',seat,d:'plenty'}); return true; }
    if (a.t==='mono'){ if(S.devPlayed) return false; const i=P.dev.indexOf('mono'); if(i<0||!(a.r>=0&&a.r<5)) return false; P.dev.splice(i,1); S.devPlayed=true; let n=0; S.P.forEach((Q,k)=>{ if(k!==seat){ n+=Q.res[a.r]; Q.res[a.r]=0; } }); P.res[a.r]+=n; S.log.unshift(name+' dùng Độc quyền: gom '+n+' '+KH_RES[a.r]+'.'); ev(S,{k:'dev',seat,d:'mono'}); return true; }
    if (a.t==='roaddev'){ if(S.devPlayed) return false; const i=P.dev.indexOf('road'); if(i<0) return false; P.dev.splice(i,1); S.devPlayed=true; S.free=Math.min(2,P.roads); S.log.unshift(name+' dùng Làm đường: xây 2 đường miễn phí.'); ev(S,{k:'dev',seat,d:'road'}); return true; }
    if (a.t==='end'){ P.dev.push(...P.newDev); P.newDev=[]; S._off=0; S.free=0; S.devPlayed=false; S.rolled=false; S.dice=S.dice; const n=S.seats.length; S.turn=(seat+1)%n; if(S.turn===0) S.round++; S.step='roll'; S.turnAt=t; ev(S,{k:'end',seat}); return true; }
    return false; }
  // ----- hoàn tác (chỉ máy chủ giữ ảnh chụp; S.undo = ghế được hoàn tác) -----
  let UND=null; const UNDOABLE=['town','road','city','trade'];
  function apply(S,seat,a,t){
    if (a&&a.t==='undo'){ if(!UND||UND.seat!==seat||S.phase==='over'||S.offer) return false; const sn=JSON.parse(JSON.stringify(UND.snap)), n=(S.evN||0)+1; UND=null;
      Object.keys(S).forEach(k=>{ delete S[k]; }); Object.assign(S,sn); S.undo=-1; S.evN=n; S.ev={n,k:'undo',seat}; S.log.unshift(S.seats[seat].name+' hoàn tác nước vừa đi.'); S.turnAt=t; return true; }
    const keep=a&&UNDOABLE.includes(a.t)&&seat===S.turn&&!S.offer&&S.phase!=='over'?JSON.parse(JSON.stringify(Object.assign({},S,{undo:-1}))):null;
    const ok=apply0(S,seat,a,t);
    if (ok&&a&&a.t!=='undo'){ if(keep&&S.phase!=='over'){ UND={seat,snap:keep}; S.undo=seat; } else { UND=null; S.undo=-1; } }
    return ok; }
  function tick(S,t){ if(S&&S.offer&&t-S.offer.at>30000){ S.log.unshift('Yêu cầu đổi của '+S.seats[S.offer.from].name+' đã hết hạn.'); S.offer=null; S.turnAt=t; return true; } return false; }
  function whoActs(S){ if(S.phase==='over') return []; if(S.step==='discard'&&S.disc){ const w=Object.keys(S.disc).map(Number); if(w.length) return w; } if(S.offer){ const p=pending(S); if(p.length) return p; } return [S.turn]; }
  // ---------- bot ----------
  function vScore(S,v,p){ let s=0; const seen=new Set(); V[v].hex.forEach(hi=>{ const h=S.hex[hi]; if(h.res<5){ s+=PIPS[h.num]*(h.res===4||h.res===3?1.15:1)*(hi===S.robber?.3:1); seen.add(h.res); } }); s+=seen.size*0.8;
    PORT_E.forEach((e,i)=>{ if(E[e].a===v||E[e].b===v) s+=S.ports[i]<0?1:1.5; }); if(p!=null){ const P=S.P[p]; seen.forEach(r=>{ if(!ownsRes(S,p,r)) s+=1.2; }); } return s; }
  function ownsRes(S,p,r){ return S.vo.some((o,v)=>o&&o.p===p&&V[v].hex.some(hi=>S.hex[hi].res===r)); }
  function bestRoadTo(S,p){ // đường hướng tới vị trí nhà tốt nhất trong 2 bước
    let best=null; E.forEach((e,i)=>{ if(!roadOK(S,p,i)) return; [e.a,e.b].forEach(v=>{ let sc=townFree(S,v)?vScore(S,v,p):0; V[v].adj.forEach(u=>{ if(townFree(S,u)&&S.vo[v]==null) sc=Math.max(sc,vScore(S,u,p)*.7); }); if(!best||sc>best.sc) best={e:i,sc}; }); }); return best; }
  function need(S,p,cost){ const P=S.P[p]; return cost.map((c,i)=>Math.max(0,c-P.res[i])); }
  function tradeFor(S,p,cost){ const P=S.P[p], r=rates(S,p), nd=need(S,p,cost); const want=nd.findIndex(x=>x>0); if(want<0) return null; if(tot(nd)>2) return null;
    for(let g=0;g<5;g++){ if(P.res[g]-cost[g]>=r[g]) return {t:'trade',give:g,get:want}; } return null; }
  function botAction(S,seat,t){
    if (S.step==='discard'&&S.disc&&S.disc[seat]!=null){ if(t-S.turnAt<900) return null; return {t:'discard',res:autoLost(S.P[seat],S.disc[seat])}; }
    if (t-S.turnAt<650) return null; const P=S.P[seat];
    if (S.offer&&S.offer.from!==seat){ const o=S.offer; if(!pending(S).includes(seat)) return null; const hasT=S.vo.some(x=>x&&x.p===seat&&!x.city), keep=(P.cities>0&&hasT)?KH_COST.city:KH_COST.town;
      const gain=o.give.reduce((s,x)=>s+x,0), lose=o.get.reduce((s,x)=>s+x,0); let ok=o.get.every((x,i)=>P.res[i]>=x)&&gain>=lose&&o.get.every((x,i)=>!x||P.res[i]-x>=keep[i])&&vp(S,o.from,true)<KH_WIN-2&&Math.random()<.85;
      return {t:'answer',ok}; }
    if (S.phase==='setup'){
      if (S.step==='town'){ let b=-1,bs=-1; V.forEach((_,v)=>{ if(townOK(S,seat,v)){ const s=vScore(S,v,seat)+Math.random()*.3; if(s>bs){bs=s;b=v;} } }); return {t:'town',v:b}; }
      const opts=V[S.setupV].e.filter(e=>roadOK(S,seat,e)); let b=opts[0],bs=-1; opts.forEach(e=>{ const o=E[e].a===S.setupV?E[e].b:E[e].a; let s=0; V[o].adj.forEach(u=>{ if(townFree(S,u)) s=Math.max(s,vScore(S,u,seat)); }); if(s>bs){bs=s;b=e;} }); return {t:'road',e:b}; }
    if (S.step==='robber'){ let b=-1,bs=-1e9, bv=null; S.hex.forEach((h,hi)=>{ if(hi===S.robber) return; let s=0; let mine=false; HEX[hi].v.forEach(v=>{ const o=S.vo[v]; if(o){ if(o.p===seat) mine=true; else s+=(o.city?2:1)*(PIPS[h.num]||0)*(1+vp(S,o.p)/10); } }); if(mine) s-=20; s+=Math.random()*.1; if(s>bs){bs=s;b=hi;} });
      const vs=victims(S,b,seat); if(vs.length) bv=vs.sort((x,y)=>vp(S,y)-vp(S,x))[0]; return {t:'robber',h:b,v:bv}; }
    const robbed = HEX[S.robber].v.some(v=>S.vo[v]&&S.vo[v].p===seat);
    if (S.step==='roll'){ if(!S.devPlayed && robbed && P.dev.includes('knight')) return {t:'knight'}; return {t:'roll'}; }
    // main
    if (S.free>0){ const r=bestRoadTo(S,seat); if(r) return {t:'road',e:r.e}; }
    if (!S.devPlayed){
      if (P.dev.includes('knight') && (robbed || P.knights>=2 && S.largest!==seat)) return {t:'knight'};
      if (P.dev.includes('plenty')){ const nd=need(S,seat,P.cities>0&&S.vo.some(o=>o&&o.p===seat&&!o.city)?KH_COST.city:KH_COST.town); const rs=[]; nd.forEach((x,r)=>{ for(let k=0;k<x;k++) rs.push(r); }); if(rs.length) return {t:'plenty',r1:rs[0],r2:rs[1]!=null?rs[1]:rs[0]}; }
      if (P.dev.includes('mono')){ let br=-1,bn=2; for(let r=0;r<5;r++){ const n=S.P.reduce((s,Q,k)=>k===seat?s:s+Q.res[r],0); if(n>bn){bn=n;br=r;} } if(br>=0) return {t:'mono',r:br}; }
      if (P.dev.includes('road') && P.roads>=2 && bestRoadTo(S,seat)) return {t:'roaddev'}; }
    if (P.cities>0 && canPay(P,KH_COST.city)){ let b=-1,bs=-1; S.vo.forEach((o,v)=>{ if(o&&o.p===seat&&!o.city){ const s=vScore(S,v); if(s>bs){bs=s;b=v;} } }); if(b>=0) return {t:'city',v:b}; }
    const spots=V.map((_,v)=>v).filter(v=>townOK(S,seat,v));
    if (P.towns>0 && spots.length && canPay(P,KH_COST.town)){ spots.sort((a,b)=>vScore(S,b,seat)-vScore(S,a,seat)); return {t:'town',v:spots[0]}; }
    if (P.roads>0 && !spots.length && canPay(P,KH_COST.road) && tot(P.res)>=3){ const r=bestRoadTo(S,seat); if(r && r.sc>2) return {t:'road',e:r.e}; }
    if (S.dev.length && canPay(P,KH_COST.dev) && (P.res[3]>1||P.res[4]>1||!S.vo.some(o=>o&&o.p===seat&&!o.city)||Math.random()<.35)) return {t:'buydev'};
    const goal = P.cities>0 && S.vo.some(o=>o&&o.p===seat&&!o.city) && (P.res[4]>=2||!spots.length) ? KH_COST.city : spots.length? KH_COST.town : KH_COST.road;
    const tr=tradeFor(S,seat,goal)||tradeFor(S,seat,KH_COST.dev); if(tr && (S._tr||0)<4){ S._tr=(S._tr||0)+1; return tr; }
    if (!S._off && S.seats.some((s,i)=>i!==seat&&!s.bot)){ const nd=need(S,seat,goal), want=nd.findIndex(x=>x>0); if(want>=0&&tot(nd)<=2){ let sr=-1,sv=0; for(let r=0;r<5;r++){ const sp=P.res[r]-goal[r]; if(r!==want&&sp>sv){ sv=sp; sr=r; } } if(sr>=0){ S._off=1; const gv=[0,0,0,0,0], wv=[0,0,0,0,0]; gv[sr]=1; wv[want]=1; return {t:'offer',give:gv,get:wv,to:-1}; } } }
    if (P.roads>0 && canPay(P,KH_COST.road) && tot(P.res)>=5){ const r=bestRoadTo(S,seat); if(r) return {t:'road',e:r.e}; }
    S._tr=0; return {t:'end'}; }
  function timeoutAction(S,seat,t){ if(S.step==='discard'&&S.disc&&S.disc[seat]!=null) return {t:'discard',res:autoLost(S.P[seat],S.disc[seat])}; if(S.offer) return seat===S.offer.from?{t:'cancel'}:{t:'answer',ok:false}; if(S.phase==='play'&&S.step==='main') return {t:'end'}; return botAction(S,seat,Infinity); }
  return {autoLost,HEX,V,E,PORT_E,PIPS,newGame,apply,tick,whoActs,botAction,timeoutAction,townOK,roadOK,rates,vp,canPay,tot,victims};
})();
if (typeof module!=='undefined') module.exports=KH;
