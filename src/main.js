import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// ---------- CLOCK ----------
const clockEl = document.getElementById('clock')
function tickClock(){
  const d = new Date()
  const pad = n => String(n).padStart(2,'0')
  if(clockEl) clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`
}
setInterval(tickClock, 1000)
tickClock()

// ---------- FIT CREATOR ----------
function fitKreator(){
  const el = document.querySelector('.title__big')
  const wrap = document.querySelector('.hero__content')
  if(!el || !wrap) return
  // JP mode pakai flex frame per huruf — jangan di-fit via fontSize (frame yang handle)
  const isJP = document.querySelector('.title__flip.ja')
  if(isJP) return
  el.style.fontSize = ''
  const maxW = wrap.clientWidth - 8
  let size = parseFloat(getComputedStyle(el).fontSize)
  let guard = 40
  while(el.scrollWidth > maxW && size > 22 && guard-- > 0){ size-=1; el.style.fontSize=size+'px' }
}
window.addEventListener('load', () => { fitKreator(); setTimeout(fitKreator,300) })
window.addEventListener('resize', fitKreator)
if(document.fonts?.ready) document.fonts.ready.then(()=>fitKreator())
try{ const ro=new ResizeObserver(()=>fitKreator()); const hc=document.querySelector('.hero__content'); if(hc) ro.observe(hc) }catch{}

// — flip CREATOR↔クリエイター / VERSE↔の世界 — neon frame per huruf (JP only)
;(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if(prefersReduced) return
  const els=[...document.querySelectorAll('.title__flip')]
  const titleEl=document.querySelector('.title')
  if(!els.length) return

  function renderJP(el, toJP){
    const en=el.dataset.en, jp=el.dataset.jp
    if(!en||!jp) return
    if(!toJP){
      el.textContent=en
      el.setAttribute('data-text', en)
      el.style.fontSize='' // clear inline size so CSS clamp applies for EN
      return
    }
    // JP: pecah per huruf jadi neon frame
    const kind = el.classList.contains('title__big--verse') ? 'verse' : 'creator'
    el.textContent=''
    for(const ch of [...jp]){
      const sp=document.createElement('span')
      sp.className=`char-frame char-frame--${kind}`
      sp.textContent=ch
      sp.setAttribute('aria-hidden','false')
      el.appendChild(sp)
    }
    // untuk shadow ::after, pakai full JP juga tapi hidden (frame yang tampil)
    el.setAttribute('data-text', jp)
    el.style.fontSize='' // JP size handled by CSS 0.70em
  }

  let jp=false
  function glitchSwap(el, nextJp){
    // RGB split + slice glitch — swap text di tengah durasi
    el.classList.add('glitching')
    // force reflow biar animation restart tiap cycle
    void el.offsetWidth
    setTimeout(()=>{
      renderJP(el, nextJp)
      el.classList.toggle('ja', nextJp)
      if(!nextJp) fitKreator()
    }, 265)
    setTimeout(()=> el.classList.remove('glitching'), 600)
  }
  function stagger(nextJp){
    if(nextJp) titleEl?.classList.add('title--jp')
    const [a,b]=els
    if(a) glitchSwap(a, nextJp)
    setTimeout(()=>{
      if(!b){
        jp=nextJp
        if(!nextJp) titleEl?.classList.remove('title--jp')
        return
      }
      glitchSwap(b, nextJp)
      setTimeout(()=>{
        jp=nextJp
        if(!nextJp) titleEl?.classList.remove('title--jp')
      }, 600)
    }, 140)
    if(!b) jp=nextJp
    else setTimeout(()=>{ jp=nextJp }, 740)
  }
  // init render depends on current dom (EN) — no frame yet
  let id=setInterval(()=> stagger(!jp), 3400)
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden) clearInterval(id)
    else id=setInterval(()=> stagger(!jp), 3400)
  })
})()

// ---------- COMING SOON typewriter ----------
;(function(){
  const el=document.querySelector('.coming-text')
  if(!el) return
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ el.textContent='COMING SOON'; return }
  const full='COMING SOON'
  let i=0,dir=1,hold=0
  const TYPE=95,DEL=48,HF=18,HE=8
  function tick(){
    if(hold>0){ hold--; setTimeout(tick,95); return }
    if(dir===1){
      i++; el.textContent=full.slice(0,i)
      if(i>=full.length){ hold=HF; dir=-1; setTimeout(tick,95) } else setTimeout(tick, TYPE+(Math.random()*18-9))
    }else{
      i--; el.textContent=full.slice(0,i)
      if(i<=0){ hold=HE; dir=1; setTimeout(tick,95) } else setTimeout(tick, DEL)
    }
  }
  el.textContent=''; setTimeout(tick,500)
})()

// ---------- SOUND / MUSIC ----------
let soundOn = localStorage.getItem('cverse_sound')!=='off'
let audioCtx=null
function ensureCtx(){
  if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)()
  if(audioCtx.state==='suspended') audioCtx.resume()
  return audioCtx
}
function beep(freq=880,dur=0.12,type='square',gain=0.12){
  if(!soundOn) return
  try{ const c=ensureCtx(); const o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=gain; o.connect(g).connect(c.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur); o.stop(c.currentTime+dur) }catch{}
}
const bgm=document.getElementById('bgMusic')
let musicWanted=localStorage.getItem('cverse_music')!=='off'
let musicReady=false, musicGain=null, analyser=null, freqData=null, musicSource=null
let beat={ bass:0, mid:0, high:0, kick:0, level:0 }
function setupAnalyser(){
  if(!bgm||analyser) return
  try{
    const ctx=ensureCtx()
    if(!musicSource) musicSource=ctx.createMediaElementSource(bgm)
    analyser=ctx.createAnalyser(); analyser.fftSize=512; analyser.smoothingTimeConstant=0.70
    freqData=new Uint8Array(analyser.frequencyBinCount)
    musicGain=ctx.createGain(); musicGain.gain.value=0
    try{ musicSource.disconnect() }catch{}
    musicSource.connect(analyser); analyser.connect(musicGain); musicGain.connect(ctx.destination)
  }catch(e){ console.warn('[C.Verse] analyser fail',e) }
}
function fadeMusic(to,ms=900){
  if(!musicGain){ if(bgm) bgm.volume=to; return }
  const ctx=ensureCtx(), now=ctx.currentTime
  try{ musicGain.gain.cancelScheduledValues(now); musicGain.gain.setValueAtTime(musicGain.gain.value,now); musicGain.gain.linearRampToValueAtTime(to, now+ms/1000) }catch{ musicGain.gain.value=to }
  if(bgm){ bgm.muted=false; bgm.volume=1 }
}
async function tryPlayMusic(){
  if(!bgm||!musicWanted||!soundOn) return
  setupAnalyser()
  try{
    const ctx=ensureCtx(); await ctx.resume().catch(()=>{})
    bgm.muted=false
    if(musicGain) bgm.volume=1; else bgm.volume=0
    await bgm.play(); musicReady=true
    if(musicGain) fadeMusic(0.58,1100)
    else{ bgm.volume=0; let v=0; const id=setInterval(()=>{ v=Math.min(0.55,v+0.04); bgm.volume=v; if(v>=0.55) clearInterval(id)},70) }
  }catch{}
}
const soundToggle=document.getElementById('soundToggle')
function syncSoundLabel(){ if(soundToggle) soundToggle.textContent=`SOUND: ${soundOn && musicWanted ? 'ON':'OFF'}`}
syncSoundLabel()
soundToggle?.addEventListener('click', async e=>{
  e.preventDefault()
  const next=!(soundOn && musicWanted)
  soundOn=next; musicWanted=next
  localStorage.setItem('cverse_sound', soundOn?'on':'off')
  localStorage.setItem('cverse_music', musicWanted?'on':'off')
  syncSoundLabel()
  if(next){ beep(660,0.08); tryRequestGyroPermission(); if(musicReady&&musicGain) fadeMusic(0.58,500); else await tryPlayMusic() }
  else{ if(musicGain) fadeMusic(0,450); setTimeout(()=>{ if(bgm&&!musicWanted) bgm.pause()},500); if(!musicGain&&bgm) bgm.pause() }
})
tryPlayMusic()
;['click','touchend','keydown'].forEach(ev=> window.addEventListener(ev, function once(){ tryPlayMusic(); tryRequestGyroPermission(); window.removeEventListener(ev,once) }, {once:true, passive:true}))
bgm?.addEventListener('error', ()=>{ console.warn('[C.Verse] audio missing'); if(soundToggle) soundToggle.style.opacity='0.5' })
bgm?.addEventListener('playing', ()=>{ setupAnalyser(); if(musicGain) fadeMusic(0.58,400) })

// ---------- THREE: VAPOR HORIZON + EQ BARS + STARS + JET ----------
const canvas=document.getElementById('bg')
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'})
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.setClearColor(0x07080e,1)
const scene=new THREE.Scene()
scene.fog=new THREE.FogExp2(0x07080e,0.024)
const camera=new THREE.PerspectiveCamera(62, window.innerWidth/window.innerHeight, 0.1, 150)
camera.position.set(0,7.6,17.2)
camera.lookAt(0,1.2,-6)

// — wide motion X + Y —
let targetX=0,targetY=0,hasGyro=false,gyroX=0,gyroY=0
window.addEventListener('mousemove', e=>{
  if(hasGyro) return
  targetX=(e.clientX/window.innerWidth-0.5)*1.65
  targetY=(e.clientY/window.innerHeight-0.5)*1.55
}, {passive:true})
window.addEventListener('touchmove', e=>{
  if(hasGyro||!e.touches[0]) return
  const t=e.touches[0]
  targetX=(t.clientX/window.innerWidth-0.5)*1.6
  targetY=(t.clientY/window.innerHeight-0.5)*1.2
}, {passive:true})
function handleOrientation(e){
  const g=e.gamma,b=e.beta
  if(g==null||b==null) return
  hasGyro=true
  const nx=Math.max(-50,Math.min(50,g))/50
  const ny=Math.max(-35,Math.min(35,b-22))/35
  gyroX+=(nx-gyroX)*0.15; gyroY+=(ny-gyroY)*0.10
  targetX=gyroX*2.0; targetY=-gyroY*1.45
}
async function tryRequestGyroPermission(){
  const DOE=window.DeviceOrientationEvent
  if(!DOE) return false
  try{
    if(typeof DOE.requestPermission==='function'){
      const r=await DOE.requestPermission()
      if(r==='granted'){ window.addEventListener('deviceorientation',handleOrientation,true); return true }
      return false
    }else{ window.addEventListener('deviceorientation',handleOrientation,true); return true }
  }catch{ return false }
}
tryRequestGyroPermission()
;['click','touchend'].forEach(ev=> window.addEventListener(ev,function once(){ tryRequestGyroPermission(); window.removeEventListener(ev,once) }, {once:true,passive:true}))

scene.add(new THREE.AmbientLight(0x9aa0ff,0.50))
const p1=new THREE.PointLight(0x00F0FF,15,54,1.6); p1.position.set(-13,9,-10); scene.add(p1)
const p2=new THREE.PointLight(0xFF0A6C,10,44,1.7); p2.position.set(13,7,-12); scene.add(p2)
const p3=new THREE.PointLight(0x7B2BFF,13,60,1.7); p3.position.set(0,13,-34); scene.add(p3)

// grid
const gridGeo=new THREE.PlaneGeometry(96,96,1,1)
const gridMat=new THREE.ShaderMaterial({
  transparent:true,
  uniforms:{ uTime:{value:0}, uBeat:{value:0}, uBass:{value:0} },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`
    varying vec2 vUv;
    uniform float uTime,uBeat,uBass;
    float grid(vec2 uv,float s){ vec2 g=fract(uv*s); float l=min(g.x,g.y); return (1.0-step(0.011,l))*smoothstep(0.0,0.45,uv.y); }
    void main(){
      vec2 uv=vUv; uv.y+=uTime*0.034+uBass*0.016;
      float g1=grid(uv,16.0), g2=grid(uv,64.0)*0.33, g=max(g1,g2);
      float horizon=pow(1.0-uv.y,3.0)*0.9;
      float glow=horizon*(0.38+0.22*sin(uTime*0.55+uv.x*5.0)+uBeat*0.42);
      vec3 colGrid=vec3(0.0,0.94,1.0)+vec3(0.12,0.05,0.35)*uBeat*0.65;
      vec3 colGlow=vec3(0.48,0.2,1.0);
      vec3 col=vec3(0.015,0.025,0.07);
      col+=g*colGrid*(0.9+uBeat*0.55);
      col+=glow*colGlow*(0.5+uBeat*0.5);
      float d=smoothstep(0.0,1.0,uv.y); col*=d;
      float pulse=smoothstep(0.0,0.018, abs(fract(uv.y*2.0 - uTime*0.16 - uBass*0.45)-0.5));
      col+=(1.0-pulse)*(0.11+uBeat*0.16)*vec3(0.0,0.94,1.0)*step(0.30,uv.y)*step(uv.y,0.67);
      gl_FragColor=vec4(col,0.92*d);
    }`
})
const gridMesh=new THREE.Mesh(gridGeo,gridMat)
gridMesh.rotation.x=-Math.PI/2; gridMesh.position.set(0,-1.68,-4)
scene.add(gridMesh)

// ===== EQUALIZER — bumpy bars bottom→top, beat-reactive =====
const EQ_COUNT=56
const EQ_W=0.92, EQ_GAP=0.68
const EQ_TOTAL=EQ_COUNT*(EQ_W+EQ_GAP)-EQ_GAP
const EQ_Z=-35, EQ_BASEY=-1.62
const eqBars=[]
const eqTargets=new Float32Array(EQ_COUNT)
const eqCurrent=new Float32Array(EQ_COUNT)
for(let i=0;i<EQ_COUNT;i++) eqCurrent[i]=1.2

// single shared shader for all bars — gradient bottom→top + tip glow
const eqBarGeo=new THREE.BoxGeometry(EQ_W, 1, 0.34)
eqBarGeo.translate(0,0.5,0)
const eqMat=new THREE.ShaderMaterial({
  transparent:true,
  blending:THREE.AdditiveBlending,
  depthWrite:false,
  uniforms:{ uBeat:{value:0} },
  vertexShader:`
    varying vec2 vUv;
    varying float vH;
    void main(){
      vUv=uv;
      vH=position.y;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }`,
  fragmentShader:`
    varying vec2 vUv; varying float vH;
    uniform float uBeat;
    void main(){
      float y = vUv.y;
      float tip = smoothstep(0.88,1.0,y);
      // IDLE palette (keep muted) — PLAY adds blue fire via lerp
      vec3 base0 = vec3(0.04,0.06,0.11);
      vec3 mid10 = vec3(0.10,0.62,0.78);
      vec3 mid20 = vec3(0.30,0.22,0.68);
      vec3 topc0 = vec3(0.72,0.18,0.42);
      // blue fire palette (when beat high)
      vec3 base1 = vec3(0.02,0.08,0.22);
      vec3 mid11 = vec3(0.06,0.78,1.0);
      vec3 mid21 = vec3(0.16,0.42,1.0);
      vec3 topc1 = vec3(0.55,0.78,1.0);
      float fire = clamp(smoothstep(0.08, 0.42, uBeat), 0.0, 1.0);
      vec3 base = mix(base0, base1, fire*0.85);
      vec3 mid1 = mix(mid10, mid11, fire);
      vec3 mid2 = mix(mid20, mid21, fire);
      vec3 topc = mix(topc0, topc1, fire);
      float m1=smoothstep(0.08,0.42,y);
      float m2=smoothstep(0.38,0.78,y);
      float m3=smoothstep(0.72,1.0,y);
      vec3 col=mix(base, mid1, m1*0.62);
      col=mix(col, mid2, m2*0.72);
      col=mix(col, topc, m3*0.52);
      float bevel = 1.0 - pow(abs(vUv.x-0.5)*2.0, 1.4)*0.18;
      col *= bevel;
      // tip glow — stronger + cooler when fire
      float tipGlow = pow(y, 2.4) * 0.55;
      vec3 fireGlow = mix(vec3(0.85,0.90,1.0), vec3(0.55,0.88,1.0), fire);
      col += fireGlow * tipGlow * (0.18 + uBeat*0.62*fire + uBeat*0.08);
      // base fire core
      col += vec3(0.10,0.55,1.0) * (1.0 - y) * 0.10 * fire * (0.6 + uBeat*0.9);
      col *= 0.72 + fire*0.12;
      float alpha = 0.58 + fire*0.12;
      alpha *= (0.82 + tip*0.18);
      alpha *= 1.0 - pow(abs(vUv.x-0.5)*1.9, 3.0)*0.18;
      if(alpha<0.02) discard;
      gl_FragColor=vec4(col, alpha);
    }`
})

// glow behind each bar (slightly larger, more transparent)
const glowGeo=new THREE.BoxGeometry(EQ_W*1.28, 1, 0.18)
glowGeo.translate(0,0.5,0)
const glowMat=new THREE.MeshBasicMaterial({ color:0x00F0FF, transparent:true, opacity:0.0, blending:THREE.AdditiveBlending, depthWrite:false })

const eqGroup=new THREE.Group()
for(let i=0;i<EQ_COUNT;i++){
  const x = -EQ_TOTAL/2 + i*(EQ_W+EQ_GAP) + EQ_W/2
  const bar=new THREE.Mesh(eqBarGeo, eqMat)
  bar.position.set(x, EQ_BASEY, EQ_Z)
  bar.scale.y = 1.2
  // subtle color shift per bar via hue not needed — shader handles, but we vary glow hue
  const glow=new THREE.Mesh(glowGeo, glowMat.clone())
  glow.position.set(x, EQ_BASEY, EQ_Z-0.18)
  glow.scale.y = 1.2
  // hue per position: cyan at center, purple at edges — for glow
  const t = Math.abs(i - EQ_COUNT/2) / (EQ_COUNT/2)
  const hueCol = new THREE.Color().lerpColors(new THREE.Color(0x00F0FF), new THREE.Color(0x7B2BFF), t*0.55)
  hueCol.lerp(new THREE.Color(0xFF0A6C), t*0.22)
  glow.material.color.copy(hueCol)
  eqGroup.add(bar); eqGroup.add(glow)
  eqBars.push({ bar, glow, x, hueCol })
}
scene.add(eqGroup)

// base beam under eq
const baseGeo=new THREE.PlaneGeometry(EQ_TOTAL+6, 0.22)
const baseMat=new THREE.MeshBasicMaterial({ color:0x00F0FF, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide })
const baseBeam=new THREE.Mesh(baseGeo, baseMat)
baseBeam.rotation.x=-Math.PI/2
baseBeam.position.set(0, EQ_BASEY+0.02, EQ_Z)
scene.add(baseBeam)

// mountains — now static silhouette in front of EQ (subtle, not equalizer anymore)
function makeMountain({width=120,height=13,seg=96,z=-31,y=-1.2,seed=0}){
  const pos=[],idx=[],uv=[]
  for(let i=0;i<=seg;i++){
    const x=-width/2+(width/seg)*i, t=i/seg
    let h=5.8
    h+=Math.sin(t*12.0+seed)*1.6; h+=Math.cos(t*18.0+seed*1.3)*1.1
    h+=Math.sin(t*7.0+seed*0.7)*2.4; h+=Math.cos(t*24.0+seed*0.52)*0.75
    h+=Math.sin(t*3.2+seed)*1.2; h+=Math.sin(i*127.1+seed*89.7)*0.42
    h=Math.max(1.9,Math.min(height,h))
    pos.push(x,0,0); uv.push(t,0); pos.push(x,h,0); uv.push(t,1)
  }
  for(let i=0;i<seg;i++){ const a=i*2,b=a+1,c=a+2,d=a+3; idx.push(a,b,c, b,d,c) }
  const geo=new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2))
  geo.setIndex(idx); geo.computeVertexNormals()
  const mat=new THREE.MeshBasicMaterial({ color:0x0a0f1e, transparent:true, opacity:0.96 })
  const m=new THREE.Mesh(geo,mat)
  m.position.set(0,y,z)
  return m
}
const mFar=makeMountain({width:158,height:9.2,seg:88,z:-30.8,y:-0.52,seed:2.1})
const mNear=makeMountain({width:142,height:11.5,seg:108,z:-27.2,y:-1.45,seed:6.4})
mNear.material.opacity=0.98
scene.add(mFar); scene.add(mNear)
mFar.material.color.setRGB(0.07,0.09,0.16); mNear.material.color.setRGB(0.04,0.06,0.12)
// tip line for mountains
function addRidgeLine(m, color){
  const pos=m.geometry.attributes.position.array
  const seg=m.geometry.attributes.position.count/2 -1
  const pts=[]
  for(let i=0;i<=seg;i++){ const idx=(i*2+1)*3; pts.push(new THREE.Vector3(pos[idx-3+0], pos[idx+1], pos[idx+2])) }
  const g=new THREE.BufferGeometry().setFromPoints(pts)
  const mat=new THREE.LineBasicMaterial({ color, transparent:true, opacity:0.32 })
  const line=new THREE.Line(g, mat)
  m.add(line)
  return line
}
const ridgeNear=addRidgeLine(mNear, 0x00F0FF)
const ridgeFar=addRidgeLine(mFar, 0x7B2BFF)

const ringGeo=new THREE.TorusGeometry(1.2,0.038,12,64)
const ringMat=new THREE.MeshBasicMaterial({ color:0x00F0FF, transparent:true, opacity:0.42 })
const ring=new THREE.Mesh(ringGeo, ringMat)
ring.position.set(0,-0.18,-13); ring.rotation.x=Math.PI/2; scene.add(ring)

// star dome
const STAR_N=800
const starGeo=new THREE.BufferGeometry()
const starPos=new Float32Array(STAR_N*3), starPhase=new Float32Array(STAR_N)
for(let i=0;i<STAR_N;i++){
  const theta=Math.random()*Math.PI*2
  const phi=Math.acos(1 - Math.random()*0.60)
  const r=62 + Math.random()*26
  const x=r*Math.sin(phi)*Math.cos(theta)
  const y=r*Math.cos(phi)*0.62 + 6.5
  const z=r*Math.sin(phi)*Math.sin(theta) - 14
  starPos[i*3]=x; starPos[i*3+1]=y; starPos[i*3+2]=z
  starPhase[i]=Math.random()*Math.PI*2
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3))
starGeo.setAttribute('phase', new THREE.BufferAttribute(starPhase,1))
const starMat=new THREE.ShaderMaterial({
  transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  uniforms:{ uTime:{value:0}, uBeat:{value:0} },
  vertexShader:`
    attribute float phase; varying float vPhase;
    void main(){ vPhase=phase; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=(1.7+sin(phase*2.0)*0.6)*(275.0/-mv.z); gl_PointSize=clamp(gl_PointSize,0.7,3.0); gl_Position=projectionMatrix*mv; }`,
  fragmentShader:`
    uniform float uTime,uBeat; varying float vPhase;
    void main(){ vec2 c=gl_PointCoord*2.0-1.0; float d=dot(c,c); if(d>1.0) discard; float tw=0.70+0.30*sin(uTime*1.1+vPhase*2.3)+uBeat*0.20; float core=1.0-smoothstep(0.0,1.0,d); float halo=1.0-smoothstep(0.0,1.0,d*0.55); float a=core*0.82+halo*0.20; gl_FragColor=vec4(vec3(1.0), a*tw*0.88); }`
})
const stars=new THREE.Points(starGeo, starMat)
scene.add(stars)

// dust particles + bokeh
const PCOUNT=1200
const pGeo=new THREE.BufferGeometry()
const pPos=new Float32Array(PCOUNT*3), pSpeed=new Float32Array(PCOUNT)
for(let i=0;i<PCOUNT;i++){ pPos[i*3]=(Math.random()-0.5)*78; pPos[i*3+1]=Math.random()*17-0.3; pPos[i*3+2]=(Math.random()-0.5)*80-6; pSpeed[i]=0.016+Math.random()*0.060 }
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3))
const pMat=new THREE.PointsMaterial({ color:0xffffff, size:0.042, sizeAttenuation:true, transparent:true, opacity:0.40, blending:THREE.AdditiveBlending, depthWrite:false })
const points=new THREE.Points(pGeo,pMat); scene.add(points)
const BCOUNT=80
const bGeo=new THREE.BufferGeometry()
const bPos=new Float32Array(BCOUNT*3), bCol=new Float32Array(BCOUNT*3)
for(let i=0;i<BCOUNT;i++){ bPos[i*3]=(Math.random()-0.5)*38; bPos[i*3+1]=Math.random()*11+0.8; bPos[i*3+2]=(Math.random()-0.5)*34-4; const c=Math.random()<0.46?[0,0.94,1]:Math.random()<0.72?[0.48,0.18,1]:[1,0.06,0.42]; bCol[i*3]=c[0]; bCol[i*3+1]=c[1]; bCol[i*3+2]=c[2] }
bGeo.setAttribute('position', new THREE.BufferAttribute(bPos,3))
bGeo.setAttribute('color', new THREE.BufferAttribute(bCol,3))
const bMat=new THREE.PointsMaterial({ size:0.15, vertexColors:true, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true })
const bokeh=new THREE.Points(bGeo,bMat); scene.add(bokeh)

// shooting stars
const shootingStars=[]
class ShootingStar{
  constructor(){
    const g=new THREE.Group()
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.085,10,10), new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:1 }))
    const halo=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,10), new THREE.MeshBasicMaterial({ color:0x8af6ff, transparent:true, opacity:0.32, blending:THREE.AdditiveBlending, depthWrite:false }))
    const trailGeo=new THREE.BufferGeometry()
    const trailPos=new Float32Array(18*3)
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos,3))
    const trail=new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color:0x7af0ff, transparent:true, opacity:0.0, blending:THREE.AdditiveBlending }))
    g.add(trail); g.add(halo); g.add(head); g.visible=false; scene.add(g)
    this.g=g; this.head=head; this.halo=halo; this.trail=trail; this.trailPos=trailPos; this.active=false; this.vel=new THREE.Vector3(); this.life=0; this.queue=[]
  }
  spawn(){
    const side=Math.random()<0.5?-1:1
    const sx= side*(18+Math.random()*14), sy=14+Math.random()*12, sz=-22-Math.random()*18
    this.g.position.set(sx,sy,sz)
    this.vel.set(-side*(8+Math.random()*6), -(9+Math.random()*5), (Math.random()-0.5)*1.2)
    this.queue=[]; this.life=0; this.active=true; this.g.visible=true; this.trail.material.opacity=0.85; this.head.material.opacity=1; this.halo.material.opacity=0.42
  }
  update(dt){
    if(!this.active) return false
    this.life+=dt; this.g.position.addScaledVector(this.vel, dt)
    this.queue.unshift(this.g.position.clone()); if(this.queue.length>18) this.queue.pop()
    for(let i=0;i<18;i++){ const p=this.queue[i]||this.queue[this.queue.length-1]||this.g.position; this.trailPos[i*3]=p.x-this.g.position.x; this.trailPos[i*3+1]=p.y-this.g.position.y; this.trailPos[i*3+2]=p.z-this.g.position.z }
    this.trail.geometry.attributes.position.needsUpdate=true; this.trail.position.copy(this.g.position)
    const t=this.life/1.9, fade=1-THREE.MathUtils.clamp((t-0.55)/0.45,0,1)
    this.trail.material.opacity=0.9*fade; this.head.material.opacity=fade; this.halo.material.opacity=0.42*fade; this.halo.scale.setScalar(1+t*0.7)
    if(this.life>1.85||this.g.position.y<-2){ this.active=false; this.g.visible=false; return true }
    return false
  }
}
for(let i=0;i<4;i++) shootingStars.push(new ShootingStar())
let shootTimer=1.2+Math.random()*1.8
function updateShootingStars(dt){
  shootTimer-=dt
  if(shootTimer<=0){ const s=shootingStars.find(x=>!x.active); if(s){ s.spawn(); shootTimer=1.6+Math.random()*2.8 } else shootTimer=0.4 }
  for(const s of shootingStars) s.update(dt)
}

// tiny jet
let jet=null, jetActive=false, jetTimer=8+Math.random()*5
function makeJet(){
  const g=new THREE.Group()
  const bodyGeo=new THREE.CylinderGeometry(0.055,0.095,1.35,8); bodyGeo.rotateZ(Math.PI/2)
  const body=new THREE.Mesh(bodyGeo, new THREE.MeshBasicMaterial({ color:0x0f1420 }))
  const noseGeo=new THREE.ConeGeometry(0.055,0.38,8); noseGeo.rotateZ(-Math.PI/2)
  const nose=new THREE.Mesh(noseGeo, new THREE.MeshBasicMaterial({color:0xd8ecff})); nose.position.x=0.86
  const wing=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.018,0.62), new THREE.MeshBasicMaterial({ color:0x1a243a })); wing.position.set(-0.08,0,0)
  const tail=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.32,0.02), new THREE.MeshBasicMaterial({color:0x1a243a})); tail.position.set(-0.58,0.16,0)
  const eng=new THREE.Mesh(new THREE.SphereGeometry(0.075,8,8), new THREE.MeshBasicMaterial({ color:0xff6a2a, transparent:true, opacity:0.95, blending:THREE.AdditiveBlending })); eng.position.set(-0.70,0,0); eng.scale.set(1.6,1,1)
  const strobe=new THREE.Mesh(new THREE.SphereGeometry(0.035,6,6), new THREE.MeshBasicMaterial({ color:0xff2a4a, transparent:true, opacity:1 })); strobe.position.set(-0.02,0.07,0)
  const ctGeo=new THREE.BufferGeometry(); const ctPos=new Float32Array(14*3); ctGeo.setAttribute('position', new THREE.BufferAttribute(ctPos,3))
  const ct=new THREE.Line(ctGeo, new THREE.LineBasicMaterial({ color:0x8ad6ff, transparent:true, opacity:0.0, blending:THREE.AdditiveBlending }))
  g.add(ct,body,nose,wing,tail,eng,strobe); g._eng=eng; g._strobe=strobe; g._ct=ct; g._ctPos=ctPos; g._ctQueue=[]; g.visible=false; scene.add(g); return g
}
function spawnJet(){
  if(!jet) jet=makeJet()
  const dir=Math.random()<0.5?1:-1, y=8.5+Math.random()*6, z=-26-Math.random()*10, x=-dir*38
  jet.position.set(x,y,z); jet.rotation.set(0, dir===1?0:Math.PI, 0); jet.userData={ dir, speed:22+Math.random()*10, life:0 }; jet.visible=true; jetActive=true; jet._ctQueue=[]; jet._ct.material.opacity=0.55
}
function updateJet(dt){
  if(!jetActive||!jet) return
  const d=jet.userData; d.life+=dt
  jet.position.x += d.dir*d.speed*dt
  jet.position.y += Math.sin(d.life*1.8)*0.012 + Math.sin(d.life*0.45)*0.008
  const flick=0.85+Math.sin(d.life*18)*0.10+beat.bass*0.3+beat.kick*0.4
  jet._eng.scale.set(1.6*flick,1*flick,1*flick); jet._eng.material.opacity=0.75+Math.sin(d.life*22)*0.18+beat.kick*0.22
  jet._strobe.material.opacity=(Math.floor(d.life*3.2)%2===0)?1:0.15
  jet._ctQueue.unshift(jet.position.clone()); if(jet._ctQueue.length>14) jet._ctQueue.pop()
  for(let i=0;i<14;i++){ const p=jet._ctQueue[i]||jet._ctQueue[jet._ctQueue.length-1]||jet.position; jet._ctPos[i*3]=p.x-jet.position.x; jet._ctPos[i*3+1]=p.y-jet.position.y; jet._ctPos[i*3+2]=p.z-jet.position.z }
  jet._ct.geometry.attributes.position.needsUpdate=true; jet._ct.position.copy(jet.position)
  jet.rotation.z=Math.sin(d.life*0.6)*0.06 + d.dir*0.06
  if(Math.abs(jet.position.x)>42){ jetActive=false; jet.visible=false; jetTimer=7+Math.random()*9; jet._ct.material.opacity=0 }
}

const beatFlash=document.createElement('div')
beatFlash.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;background:radial-gradient(680px 420px at 50% 34%, rgba(0,240,255,0.10), transparent 72%);mix-blend-mode:screen;transition:opacity 110ms linear'
document.body.appendChild(beatFlash)

function onResize(){
  const w=window.innerWidth,h=window.innerHeight
  camera.aspect=w/h; camera.updateProjectionMatrix()
  renderer.setSize(w,h); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
  fitKreator()
}
window.addEventListener('resize', onResize)
window.addEventListener('orientationchange', ()=> setTimeout(()=>{ onResize(); fitKreator() },260))
onResize()

function updateBeat(){
  if(!analyser||!freqData||!bgm||bgm.paused){
    const idle=0.34+0.24*Math.sin(performance.now()*0.00055)
    beat.bass+=(idle*0.17-beat.bass)*0.05; beat.mid+=(idle*0.11-beat.mid)*0.05; beat.high+=(idle*0.07-beat.high)*0.05
    beat.level=(beat.bass+beat.mid*0.6+beat.high*0.3)/1.4; beat.kick+=(0-beat.kick)*0.10; return
  }
  analyser.getByteFrequencyData(freqData)
  const avg=(a,b)=>{ let s=0,c=0; for(let i=a;i<b&&i<freqData.length;i++){ s+=freqData[i]; c++ } return c? s/c/255:0 }
  const rb=avg(1,10), rm=avg(10,48), rh=avg(48,140), rl=avg(2,110)
  const kickNow= rb>0.40 && rb>beat.bass*1.32 ?1:0
  beat.bass+=(rb-beat.bass)*0.30; beat.mid+=(rm-beat.mid)*0.22; beat.high+=(rh-beat.high)*0.18; beat.level+=(rl-beat.level)*0.16; beat.kick+=(kickNow-beat.kick)*0.36
  beat.kick=Math.max(0,Math.min(1,beat.kick))
}

function updateEQ(){
  // map freq bins to bars — low→high left→right
  // when analyser active: use real spectrum, else idle sine
  const hasData = !!(analyser && freqData && bgm && !bgm.paused)
  for(let i=0;i<EQ_COUNT;i++){
    let level
    if(hasData){
      const bin = Math.floor((i/EQ_COUNT) * 110) // first 110 bins ~ bass→low-mid dominant for music
      const raw = freqData[Math.min(freqData.length-1, 3+bin)]/255
      // center louder (bass) — slight V shape
      const centerBias = 1 - Math.abs(i - EQ_COUNT/2)/(EQ_COUNT/2)*0.22
      level = raw * (0.92 + centerBias*0.35)
    }else{
      const t=performance.now()*0.001
      level = 0.18 + 0.22*Math.sin(i*0.55 + t*1.9) + 0.14*Math.sin(i*0.22 - t*1.1) + 0.08*Math.sin(i*1.1+t*2.6)
      level = Math.max(0, level)
    }
    // kick adds punch to all
    level += beat.kick * 0.55
    level += beat.bass * 0.18
    // target physical height — clamp biar tidak nutup CREATOR
    const h = 0.9 + level*6.8 + Math.pow(level,1.55)*2.2
    eqTargets[i]= Math.max(0.45, Math.min(9.5, h))
  }
  for(let i=0;i<EQ_COUNT;i++){
    // lerp — attack fast, release medium
    const tgt=eqTargets[i], cur=eqCurrent[i]
    const speed = tgt > cur ? 0.38 : 0.18
    eqCurrent[i] = cur + (tgt - cur)*speed
    const h=eqCurrent[i]
    const { bar, glow }=eqBars[i]
    bar.scale.y = h
    glow.scale.y = h*1.04
    glow.material.opacity = 0.08 + (h/22)*0.22 + beat.kick*0.10
    // baseBeam local bright spot under tall bars — handled via overall beam opacity
  }
  baseBeam.material.opacity = 0.18 + beat.bass*0.16 + beat.kick*0.10
  // bar shader beat for tip glow
  eqMat.uniforms.uBeat.value = beat.bass*0.9 + beat.kick*0.7
  ridgeNear.material.opacity = 0.32 + beat.bass*0.18
  ridgeFar.material.opacity = 0.22 + beat.bass*0.14
}

let t=0,raf=0
const clock=new THREE.Clock()
function animate(){
  raf=requestAnimationFrame(animate)
  const dt=Math.min(0.033, clock.getDelta()); t+=dt
  updateBeat()
  updateEQ()
  const b=beat.bass, k=beat.kick, lvl=beat.level
  gridMat.uniforms.uTime.value=t; gridMat.uniforms.uBeat.value=b*0.9+k*0.6; gridMat.uniforms.uBass.value=b
  starMat.uniforms.uTime.value=t; starMat.uniforms.uBeat.value=b*0.55+k*0.35
  updateShootingStars(dt)
  jetTimer-=dt
  if(!jetActive && jetTimer<=0){ if(Math.random()<0.82) spawnJet(); jetTimer=9+Math.random()*10 }
  updateJet(dt)
  const idleX=Math.sin(t*0.10)*0.85 + Math.sin(t*0.06+1.2)*0.32 + Math.sin(t*0.18+2.4)*0.14
  const idleY=Math.cos(t*0.08)*0.52 + Math.sin(t*0.12+0.7)*0.28 + Math.cos(t*0.04+1.8)*0.16
  const jx=(Math.random()-0.5)*k*0.28, jy=(Math.random()-0.5)*k*0.16
  const tx=targetX*2.0 + idleX + jx
  const ty=targetY*1.45 + idleY + jy
  camera.position.x+=(tx - camera.position.x)*0.052
  camera.position.y+=((7.8 + ty*1.85) - camera.position.y)*0.052
  const tz=17.2 - b*1.35 - k*1.05
  camera.position.z+=(tz - camera.position.z)*0.042
  camera.rotation.z+=(tx*0.034 - camera.rotation.z)*0.052
  camera.rotation.x+=((-ty*0.022) - camera.rotation.x)*0.048
  camera.lookAt(tx*1.10, 1.0 + ty*1.45, -7.5)
  const sb= 1 + b*0.18 + k*0.14; ring.scale.set(sb,sb,sb); ring.material.opacity=0.36 + b*0.30 + k*0.24; ring.rotation.z+=dt*(0.22 + b*0.38); ring.rotation.y=Math.sin(t*0.4)*0.08 + tx*0.04
  p1.intensity=13 + b*18 + k*11 + Math.sin(t*0.9)*1.1; p2.intensity=9 + beat.mid*15 + k*9; p3.intensity=11 + lvl*13 + k*8
  const ppos=pGeo.attributes.position
  for(let i=0;i<PCOUNT;i++){ let z=ppos.array[i*3+2]; z+=pSpeed[i]*(1 + b*1.0 + k*0.7); if(z>13){ z=-44-Math.random()*14; ppos.array[i*3]=(Math.random()-0.5)*78; ppos.array[i*3+1]=Math.random()*17-0.3 } ppos.array[i*3+2]=z }
  ppos.needsUpdate=true
  bMat.opacity=0.50 + lvl*0.22 + k*0.13; bokeh.rotation.y+=dt*(0.012 + b*0.022); bokeh.scale.setScalar(1 + b*0.07)
  stars.rotation.y+=dt*0.008; stars.rotation.x=Math.sin(t*0.04)*0.01
  if(k>0.42){ beatFlash.style.opacity=String(0.10 + k*0.13); const title=document.querySelector('.title__big'); if(title&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches) title.style.transform=`scale(${1+k*0.016})` }
  else{ beatFlash.style.opacity='0'; const title=document.querySelector('.title__big'); if(title) title.style.transform='' }
  renderer.render(scene,camera)
}
animate()
gsap.from('.title__big', { y:28, opacity:0, duration:0.9, ease:'power3.out', delay:0.15 })
gsap.from('.title__small, .title__coming', { y:14, opacity:0, duration:0.7, stagger:0.08, ease:'power2.out', delay:0.35 })
gsap.from('.eyebrow', { y:10, opacity:0, duration:0.6, ease:'power2.out', delay:0.45 })
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) cancelAnimationFrame(raf)
if(import.meta.hot) import.meta.hot.dispose(()=>cancelAnimationFrame(raf))
