/* BỘ KHUNG DÙNG CHUNG — core/audio.js: âm thanh và nhạc nền tổng hợp bằng Web Audio */
/* ===================== ÂM THANH (tổng hợp bằng Web Audio, không cần file) ===================== */
const SFX = {
  ctx:null, master:null, on:true,
  init(){
    if (this.ctx) { if (this.ctx.state==='suspended') this.ctx.resume().catch(()=>{}); return; }
    try { const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; this.ctx=new AC(); this.master=this.ctx.createGain(); this.master.gain.value=.55; this.master.connect(this.ctx.destination); } catch(e){ this.ctx=null; }
  },
  ok(){ return this.on && this.ctx && this.ctx.state==='running'; },
  tone(f, dur, {type='sine', vol=.3, at=0, slide=null, attack=.005}={}){
    if(!this.ok()) return; const c=this.ctx, t=c.currentTime+at; const o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(slide, t+dur);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+attack); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t+dur+.05);
  },
  noise(dur, {vol=.3, at=0, freq=1200, q=1, type='bandpass', sweep=null}={}){
    if(!this.ok()) return; const c=this.ctx, t=c.currentTime+at;
    const len=Math.max(1,Math.floor(c.sampleRate*dur)); const buf=c.createBuffer(1,len,c.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    const src=c.createBufferSource(); src.buffer=buf; const f=c.createBiquadFilter(); f.type=type; f.frequency.setValueAtTime(freq,t); f.Q.value=q; if(sweep) f.frequency.exponentialRampToValueAtTime(sweep,t+dur);
    const g=c.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    src.connect(f); f.connect(g); g.connect(this.master); src.start(t); src.stop(t+dur+.02);
  },
  draw(){ this.noise(.16,{vol:.35,freq:900,sweep:4000,q:.8}); this.tone(1400,.05,{type:'triangle',vol:.12,at:.1}); },
  flip(){ this.noise(.07,{vol:.25,freq:3000,q:1.5}); },
  stone(at=0,v=1){ const p=.9+Math.random()*.25; this.noise(.025,{vol:.55*v,freq:3200*p,q:4,at}); this.tone(2350*p,.07,{vol:.22*v,at,attack:.001}); this.tone(3650*p,.045,{vol:.12*v,at,attack:.001}); this.tone(420*p,.05,{type:'triangle',vol:.18*v,at,attack:.001}); },
  clack(n){ for(let i=0;i<n;i++){ const at=i*.16; this.stone(at,1); this.stone(at+.055,.55); this.stone(at+.1,.25); } },
  whistle(){
    if(!this.ok()) return; const c=this.ctx, t=c.currentTime;
    [[523,.0],[659,.0],[784,.0]].forEach(([f])=>{ const o=c.createOscillator(), g=c.createGain(), bp=c.createBiquadFilter(), lfo=c.createOscillator(), lg=c.createGain();
      o.type='sawtooth'; o.frequency.value=f; bp.type='bandpass'; bp.frequency.value=f*2; bp.Q.value=3; lfo.frequency.value=6; lg.gain.value=f*.012; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(.13,t+.08); g.gain.setValueAtTime(.13,t+.45); g.gain.exponentialRampToValueAtTime(.09,t+.5); g.gain.setValueAtTime(.12,t+.62); g.gain.exponentialRampToValueAtTime(0.0001,t+1.2);
      o.connect(bp); bp.connect(g); g.connect(this.master); o.start(t); lfo.start(t); o.stop(t+1.25); lfo.stop(t+1.25); });
    this.noise(1.1,{vol:.12,freq:5000,q:.5,type:'highpass'});
  },
  chime(){ [784,988,1175,1568].forEach((f,i)=>{ this.tone(f,.7,{vol:.22,at:i*.09}); this.tone(f*2,.4,{vol:.06,at:i*.09}); }); },
  ding(){ this.tone(1320,1.2,{vol:.28}); this.tone(2640,.8,{vol:.08}); this.tone(1980,.9,{vol:.06,at:.01}); },
  rumble(){ this.noise(1.2,{vol:.6,freq:140,q:.7,type:'lowpass'}); this.tone(55,1,{type:'sine',vol:.35,slide:38}); },
  turn(){ this.tone(659,.25,{type:'triangle',vol:.22}); this.tone(988,.45,{type:'triangle',vol:.22,at:.14}); },
  paper(){ this.noise(.25,{vol:.25,freq:2200,sweep:900,q:.6}); },
  horn(){ [196,247,294].forEach(f=>this.tone(f,.9,{type:'sawtooth',vol:.07})); this.tone(392,.9,{type:'square',vol:.04,at:.45}); },
  fanfare(){ const n=[[523,0,.18],[523,.18,.12],[523,.3,.12],[659,.42,.5],[784,.95,.25],[659,1.2,.2],[784,1.42,.8]];
    n.forEach(([f,at,d])=>{ this.tone(f,d+.1,{type:'triangle',vol:.25,at}); this.tone(f/2,d+.1,{type:'sine',vol:.15,at}); });
    [1047,1319,1568].forEach((f,i)=>this.tone(f,1,{vol:.08,at:1.42+i*.05})); },
  error(){ this.tone(220,.15,{type:'square',vol:.08}); this.tone(180,.2,{type:'square',vol:.08,at:.1}); },
  tick(hi, mine){ const v=mine?.09:.04; this.tone(hi?2100:1600,.035,{type:'square',vol:v}); this.noise(.025,{vol:v*1.5,freq:hi?5200:4200,q:6}); },
  chimeSoft(){ [880,1320].forEach((f,i)=>this.tone(f,.5,{vol:.15,at:i*.08})); },
  hiss(){ // tiếng xịt hơi tàu ngắn
    this.noise(.55,{vol:.55,freq:6000,sweep:1800,q:.6,type:'bandpass'});
    this.noise(.35,{vol:.25,freq:3500,q:.5,type:'highpass'});
    this.tone(880,.25,{type:'sine',vol:.06,at:.05});
  },
  reward(){ // âm thanh phần thưởng khi lên điểm
    [[988,0],[1319,.07],[1568,.14],[1976,.21]].forEach(([f,at])=>{ this.tone(f,.28,{type:'square',vol:.05,at}); this.tone(f,.4,{type:'sine',vol:.12,at}); });
    [2637,3136,3951].forEach((f,i)=>this.tone(f,.35,{vol:.05,at:.28+i*.05}));
  },
  chatPing(){ this.tone(1047,.12,{type:'sine',vol:.14}); this.tone(1568,.18,{type:'sine',vol:.12,at:.08}); },
  pop(){ this.tone(880,.08,{type:'sine',vol:.15,slide:1500}); }
};

/* ===== Nhạc nền du dương nho nhỏ (hộp nhạc, nhịp valse) ===== */
const MUSIC = {
  on:true, gain:null, timer:null, next:0, step:0, E:.36,
  CH:[[261.63,329.63,392.00],[220.00,261.63,329.63],[174.61,220.00,261.63],[196.00,246.94,293.66],
      [261.63,329.63,392.00],[174.61,220.00,261.63],[196.00,246.94,293.66],[261.63,329.63,392.00]],
  MEL:[[784,0],[659,3],[880,0],[784,3],[698,0],[659,3],[587,0],[784,3],[784,0],[880,3],[698,0],[587,3],[659,0],[587,2],[523,0],[0,0]],
  sync(want){ if (want && SFX.ok() && this.on) this.start(); else this.stop(); },
  start(){
    if (this.timer) return; const c=SFX.ctx;
    if (!this.gain){ this.gain=c.createGain(); this.gain.gain.value=0; this.gain.connect(SFX.master); }
    this.gain.gain.cancelScheduledValues(c.currentTime); this.gain.gain.setTargetAtTime(.55, c.currentTime, 1.2);
    this.next=c.currentTime+.15; this.timer=setInterval(()=>this.sched(), 150);
  },
  stop(){ if(!this.timer) return; clearInterval(this.timer); this.timer=null; if(this.gain&&SFX.ctx) this.gain.gain.setTargetAtTime(0, SFX.ctx.currentTime, .35); },
  note(f, t, dur, type, vol){
    const c=SFX.ctx, o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.value=f;
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(this.gain); o.start(t); o.stop(t+dur+.05);
  },
  sched(){
    const c=SFX.ctx; if(!c) return;
    while (this.next < c.currentTime+.8){
      const t=this.next, st=this.step, bar=Math.floor(st/6)%8, e=st%6, ch=this.CH[bar];
      if (e===0) this.note(ch[0]/2, t, this.E*6, 'triangle', .07);
      const pat=[0,1,2,1,2,1]; const f=ch[pat[e]]*(e===2||e===4?2:1);
      this.note(f*2, t, .9, 'sine', e===0?.05:.035);
      const m=this.MEL[(Math.floor(st/6)%16)]; if (m[0] && e===m[1]) { this.note(m[0], t, 1.4, 'sine', .055); this.note(m[0]*2, t, .6, 'triangle', .012); }
      this.next+=this.E; this.step++;
    }
  }
};
