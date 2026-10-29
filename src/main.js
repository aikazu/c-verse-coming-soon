import './style.css'
import * as THREE from 'three'

// Brand palette (brand guideline Edisi 02). Lime is the single accent; grey and
// white are neutrals. Orange is not used in the scene.
const BLACK=0x171717
const LIME=0xCCFF66
const GREY=0xCCCCCC
const WHITE=0xFFFFFF
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- CLOCK ----------
const clockEl=document.getElementById('clock')
function tickClock(){
  const d=new Date()
  const pad=n=>String(n).padStart(2,'0')
  if(clockEl){
    clockEl.textContent=`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`
    clockEl.setAttribute('datetime', d.toISOString())
  }
}
setInterval(tickClock, 1000)
tickClock()

// ---------- SOUND / MUSIC ----------
let soundOn=localStorage.getItem('cverse_sound')!=='off'
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
function syncSoundLabel(){
  if(!soundToggle) return
  const on=soundOn && musicWanted
  soundToggle.textContent=`Suara: ${on ? 'aktif' : 'nonaktif'}`
  soundToggle.setAttribute('aria-pressed', String(on))
}
syncSoundLabel()
soundToggle?.addEventListener('click', async ()=>{
  const next=!(soundOn && musicWanted)
  soundOn=next; musicWanted=next
  localStorage.setItem('cverse_sound', soundOn?'on':'off')
  localStorage.setItem('cverse_music', musicWanted?'on':'off')
  syncSoundLabel()
  // tryPlayMusic also restarts a track paused by the off path, then fades in
  if(next){ beep(660,0.08); tryRequestGyroPermission(); await tryPlayMusic() }
  else{ if(musicGain) fadeMusic(0,450); setTimeout(()=>{ if(bgm&&!musicWanted) bgm.pause()},500); if(!musicGain&&bgm) bgm.pause() }
})
tryPlayMusic()
;['click','touchend','keydown'].forEach(ev=> window.addEventListener(ev, function once(){ tryPlayMusic(); tryRequestGyroPermission(); window.removeEventListener(ev,once) }, {once:true, passive:true}))
bgm?.addEventListener('error', ()=>{ console.warn('[C.Verse] audio missing'); soundToggle?.setAttribute('data-missing','') })
bgm?.addEventListener('playing', ()=>{ setupAnalyser(); if(musicGain) fadeMusic(0.58,400) })

// ---------- THREE: HORIZON GRID + EQ BARS + STARS ----------
const canvas=document.getElementById('bg')
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'})
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.setClearColor(BLACK,1)
const scene=new THREE.Scene()
scene.fog=new THREE.FogExp2(BLACK,0.024)
const camera=new THREE.PerspectiveCamera(62, window.innerWidth/window.innerHeight, 0.1, 150)
camera.position.set(0,7.6,17.2)
camera.lookAt(0,1.2,-6)

// — wide motion X + Y —
let targetX=0,targetY=0,hasGyro=false,gyroX=0,gyroY=0
// single-gain motion convention: inputs land in ~[-0.5,0.5]; the loop applies the one gain.
// dead-zone keeps micro mouse jitter near center from wobbling the camera (smooth, no threshold jump).
function deadzone(v, d=0.04){ const a=Math.abs(v); return a<d ? 0 : Math.sign(v)*(a-d)/(0.5-d)*0.5 }
window.addEventListener('mousemove', e=>{
  if(hasGyro) return
  targetX=deadzone(e.clientX/window.innerWidth-0.5)
  targetY=deadzone(e.clientY/window.innerHeight-0.5)
}, {passive:true})
window.addEventListener('touchmove', e=>{
  if(hasGyro||!e.touches[0]) return
  const t=e.touches[0]
  targetX=(t.clientX/window.innerWidth-0.5)
  targetY=(t.clientY/window.innerHeight-0.5)*0.8
}, {passive:true})
function handleOrientation(e){
  const g=e.gamma,b=e.beta
  if(g==null||b==null) return
  hasGyro=true
  const nx=Math.max(-50,Math.min(50,g))/50
  const ny=Math.max(-35,Math.min(35,b-22))/35
  gyroX+=(nx-gyroX)*0.15; gyroY+=(ny-gyroY)*0.10
  targetX=gyroX*0.7; targetY=-gyroY*0.6   // gyro travels a touch wider for mobile tilt
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

scene.add(new THREE.AmbientLight(GREY,0.45))
const p1=new THREE.PointLight(LIME,15,54,1.6); p1.position.set(-13,9,-10); scene.add(p1)
const p2=new THREE.PointLight(GREY,8,44,1.7); p2.position.set(13,7,-12); scene.add(p2)
const p3=new THREE.PointLight(LIME,12,60,1.7); p3.position.set(0,13,-34); scene.add(p3)

// grid — lime lines on black, lime horizon glow
const gridGeo=new THREE.PlaneGeometry(96,96,1,1)
const gridMat=new THREE.ShaderMaterial({
  transparent:true,
  uniforms:{ uTime:{value:0}, uBeat:{value:0}, uBass:{value:0} },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`
    varying vec2 vUv;
    uniform float uTime,uBeat,uBass;
    const vec3 LIME=vec3(0.80,1.00,0.40);
    const vec3 GREY=vec3(0.80,0.80,0.80);
    float grid(vec2 uv,float s){ vec2 g=fract(uv*s); float l=min(g.x,g.y); return (1.0-step(0.011,l))*smoothstep(0.0,0.45,uv.y); }
    void main(){
      vec2 uv=vUv; uv.y+=uTime*0.034+uBass*0.016;
      float g1=grid(uv,16.0), g2=grid(uv,64.0)*0.33, g=max(g1,g2);
      float horizon=pow(1.0-uv.y,3.0)*0.9;
      float glow=horizon*(0.30+0.16*sin(uTime*0.55+uv.x*5.0)+uBeat*0.36);
      vec3 colGrid=mix(LIME, GREY, 0.25)*(0.55+uBeat*0.35);
      vec3 colGlow=LIME*0.45;
      vec3 col=vec3(0.09);
      col+=g*colGrid;
      col+=glow*colGlow*(0.5+uBeat*0.5);
      float d=smoothstep(0.0,1.0,uv.y); col*=d;
      float pulse=smoothstep(0.0,0.018, abs(fract(uv.y*2.0 - uTime*0.16 - uBass*0.45)-0.5));
      col+=(1.0-pulse)*(0.08+uBeat*0.12)*LIME*step(0.30,uv.y)*step(uv.y,0.67);
      gl_FragColor=vec4(col,0.92*d);
    }`
})
const gridMesh=new THREE.Mesh(gridGeo,gridMat)
gridMesh.rotation.x=-Math.PI/2; gridMesh.position.set(0,-1.68,-4)
scene.add(gridMesh)

// ===== EQUALIZER — bars bottom→top, beat-reactive =====
const EQ_COUNT=32
const EQ_W=1.5, EQ_GAP=1.06
const EQ_TOTAL=EQ_COUNT*(EQ_W+EQ_GAP)-EQ_GAP
const EQ_Z=-35, EQ_BASEY=-1.62
const eqBars=[]
const eqTargets=new Float32Array(EQ_COUNT)
const eqCurrent=new Float32Array(EQ_COUNT)
for(let i=0;i<EQ_COUNT;i++) eqCurrent[i]=1.2

// single shared shader for all bars — grey base rising to a lime tip; the
// beat ("fire") brightens toward lime/white instead of changing hue
const eqBarGeo=new THREE.BoxGeometry(EQ_W, 1, 0.34)
eqBarGeo.translate(0,0.5,0)
const eqMat=new THREE.ShaderMaterial({
  transparent:true,
  blending:THREE.AdditiveBlending,
  depthWrite:false,
  uniforms:{ uBeat:{value:0} },
  vertexShader:`
    varying vec2 vUv;
    void main(){
      vUv=uv;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }`,
  fragmentShader:`
    varying vec2 vUv;
    uniform float uBeat;
    const vec3 LIME=vec3(0.80,1.00,0.40);
    const vec3 GREY=vec3(0.80,0.80,0.80);
    void main(){
      float y = vUv.y;
      float tip = smoothstep(0.88,1.0,y);
      // idle palette: dark grey base, muted lime body
      vec3 base0 = vec3(0.10);
      vec3 mid10 = GREY*0.35;
      vec3 mid20 = LIME*0.45;
      vec3 topc0 = LIME*0.70;
      // beat palette: brighter lime, pale tip
      vec3 base1 = vec3(0.12,0.15,0.07);
      vec3 mid11 = LIME*0.60;
      vec3 mid21 = LIME*0.85;
      vec3 topc1 = mix(LIME, vec3(1.0), 0.35);
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
      float tipGlow = pow(y, 2.4) * 0.45;
      col += LIME * tipGlow * (0.14 + uBeat*0.45*fire + uBeat*0.06);
      col *= 0.56 + fire*0.10;
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
const glowMat=new THREE.MeshBasicMaterial({ color:LIME, transparent:true, opacity:0.0, blending:THREE.AdditiveBlending, depthWrite:false })

const eqGroup=new THREE.Group()
for(let i=0;i<EQ_COUNT;i++){
  const x = -EQ_TOTAL/2 + i*(EQ_W+EQ_GAP) + EQ_W/2
  const bar=new THREE.Mesh(eqBarGeo, eqMat)
  bar.position.set(x, EQ_BASEY, EQ_Z)
  bar.scale.y = 1.2
  const glow=new THREE.Mesh(glowGeo, glowMat.clone())
  glow.position.set(x, EQ_BASEY, EQ_Z-0.18)
  glow.scale.y = 1.2
  // lime at center, grey toward the edges — for glow only
  const t = Math.abs(i - EQ_COUNT/2) / (EQ_COUNT/2)
  glow.material.color.lerpColors(new THREE.Color(LIME), new THREE.Color(GREY), t*0.6)
  eqGroup.add(bar); eqGroup.add(glow)
  eqBars.push({ bar, glow })
}
scene.add(eqGroup)

// base beam under eq
const baseGeo=new THREE.PlaneGeometry(EQ_TOTAL+6, 0.22)
const baseMat=new THREE.MeshBasicMaterial({ color:LIME, transparent:true, opacity:0.45, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide })
const baseBeam=new THREE.Mesh(baseGeo, baseMat)
baseBeam.rotation.x=-Math.PI/2
baseBeam.position.set(0, EQ_BASEY+0.02, EQ_Z)
scene.add(baseBeam)

// mountains — static silhouette in front of the EQ
function makeMountain({width=120,height=13,seg=96,z=-31,y=-1.2,seed=0,color=0x1c1c1c}){
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
  const mat=new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.97 })
  const m=new THREE.Mesh(geo,mat)
  m.position.set(0,y,z)
  return m
}
const mFar=makeMountain({width:158,height:9.2,seg:88,z:-30.8,y:-0.52,seed:2.1,color:0x202020})
const mNear=makeMountain({width:142,height:11.5,seg:108,z:-27.2,y:-1.45,seed:6.4,color:0x151515})
scene.add(mFar); scene.add(mNear)
// ridge line on each mountain
function addRidgeLine(m, color, opacity){
  const pos=m.geometry.attributes.position.array
  const seg=m.geometry.attributes.position.count/2 -1
  const pts=[]
  for(let i=0;i<=seg;i++){ const idx=(i*2+1)*3; pts.push(new THREE.Vector3(pos[idx-3+0], pos[idx+1], pos[idx+2])) }
  const g=new THREE.BufferGeometry().setFromPoints(pts)
  const mat=new THREE.LineBasicMaterial({ color, transparent:true, opacity })
  const line=new THREE.Line(g, mat)
  m.add(line)
  return line
}
const ridgeNear=addRidgeLine(mNear, LIME, 0.32)
const ridgeFar=addRidgeLine(mFar, GREY, 0.18)

const ringGeo=new THREE.TorusGeometry(1.2,0.038,12,64)
const ringMat=new THREE.MeshBasicMaterial({ color:LIME, transparent:true, opacity:0.42 })
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
    void main(){ vec2 c=gl_PointCoord*2.0-1.0; float d=dot(c,c); if(d>1.0) discard; float tw=0.70+0.30*sin(uTime*1.1+vPhase*2.3)+uBeat*0.20; float core=1.0-smoothstep(0.0,1.0,d); float halo=1.0-smoothstep(0.0,1.0,d*0.55); float a=core*0.82+halo*0.20; gl_FragColor=vec4(vec3(0.80), a*tw*0.88); }`
})
const stars=new THREE.Points(starGeo, starMat)
scene.add(stars)

// dust particles + bokeh
const PCOUNT=1200
const pGeo=new THREE.BufferGeometry()
const pPos=new Float32Array(PCOUNT*3), pSpeed=new Float32Array(PCOUNT)
for(let i=0;i<PCOUNT;i++){ pPos[i*3]=(Math.random()-0.5)*78; pPos[i*3+1]=Math.random()*17-0.3; pPos[i*3+2]=(Math.random()-0.5)*80-6; pSpeed[i]=0.016+Math.random()*0.060 }
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3))
const pMat=new THREE.PointsMaterial({ color:GREY, size:0.042, sizeAttenuation:true, transparent:true, opacity:0.40, blending:THREE.AdditiveBlending, depthWrite:false })
const points=new THREE.Points(pGeo,pMat); scene.add(points)
const BCOUNT=80
const bGeo=new THREE.BufferGeometry()
const bPos=new Float32Array(BCOUNT*3), bCol=new Float32Array(BCOUNT*3)
const bokehLime=new THREE.Color(LIME), bokehGrey=new THREE.Color(GREY)
for(let i=0;i<BCOUNT;i++){
  bPos[i*3]=(Math.random()-0.5)*38; bPos[i*3+1]=Math.random()*11+0.8; bPos[i*3+2]=(Math.random()-0.5)*34-4
  const c=Math.random()<0.6?bokehLime:bokehGrey
  bCol[i*3]=c.r; bCol[i*3+1]=c.g; bCol[i*3+2]=c.b
}
bGeo.setAttribute('position', new THREE.BufferAttribute(bPos,3))
bGeo.setAttribute('color', new THREE.BufferAttribute(bCol,3))
const bMat=new THREE.PointsMaterial({ size:0.15, vertexColors:true, transparent:true, opacity:0.5, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true })
const bokeh=new THREE.Points(bGeo,bMat); scene.add(bokeh)

// shooting stars
const shootingStars=[]
class ShootingStar{
  constructor(){
    const g=new THREE.Group()
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.085,10,10), new THREE.MeshBasicMaterial({ color:WHITE, transparent:true, opacity:1 }))
    const halo=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,10), new THREE.MeshBasicMaterial({ color:LIME, transparent:true, opacity:0.32, blending:THREE.AdditiveBlending, depthWrite:false }))
    const trailGeo=new THREE.BufferGeometry()
    const trailPos=new Float32Array(18*3)
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos,3))
    const trail=new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color:LIME, transparent:true, opacity:0.0, blending:THREE.AdditiveBlending }))
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
  if(shootTimer<=0){ const s=shootingStars.find(x=>!x.active); if(s){ s.spawn(); shootTimer=2.6+Math.random()*4.0 } else shootTimer=0.5 }
  for(const s of shootingStars) s.update(dt)
}

function onResize(){
  const w=window.innerWidth,h=window.innerHeight
  camera.aspect=w/h; camera.updateProjectionMatrix()
  renderer.setSize(w,h); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
  if(prefersReduced) renderStaticFrame()
}
window.addEventListener('resize', onResize)
window.addEventListener('orientationchange', ()=> setTimeout(onResize,260))

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
    // target physical height — clamped so bars stay below the lockup
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
    glow.material.opacity = 0.06 + (h/22)*0.18 + beat.kick*0.08
  }
  baseBeam.material.opacity = 0.16 + beat.bass*0.14 + beat.kick*0.08
  eqMat.uniforms.uBeat.value = beat.bass*0.9 + beat.kick*0.7
  ridgeNear.material.opacity = 0.32 + beat.bass*0.18
  ridgeFar.material.opacity = 0.18 + beat.bass*0.10
}

// canvas fades in on first painted frame — no hard pop of EQ/stars
let firstFrame=true
function revealCanvas(){ if(firstFrame){ firstFrame=false; requestAnimationFrame(()=>{ canvas.style.opacity='1' }) } }

// reduced-motion: render ONE deliberately composed still (resting EQ curve + grid), not a random mid-idle freeze
function renderStaticFrame(){
  const t0=1.4
  gridMat.uniforms.uTime.value=t0; gridMat.uniforms.uBeat.value=0; gridMat.uniforms.uBass.value=0
  starMat.uniforms.uTime.value=t0; starMat.uniforms.uBeat.value=0
  eqMat.uniforms.uBeat.value=0
  // gentle symmetric resting curve — tallest at center, tapering out
  for(let i=0;i<EQ_COUNT;i++){
    const c=1-Math.abs(i-EQ_COUNT/2)/(EQ_COUNT/2)
    const h=1.1 + c*2.4 + Math.sin(i*0.7)*0.35 + 0.6
    eqCurrent[i]=h
    const { bar, glow }=eqBars[i]
    bar.scale.y=h; glow.scale.y=h*1.04; glow.material.opacity=0.06+(h/22)*0.18
  }
  baseBeam.material.opacity=0.18
  camera.position.set(0,7.8,17.2); camera.rotation.set(0,0,0); camera.lookAt(0,1.0,-7.5)
  renderer.render(scene,camera)
  canvas.style.opacity='1'
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
  const idleX=Math.sin(t*0.10)*0.85 + Math.sin(t*0.06+1.2)*0.32 + Math.sin(t*0.18+2.4)*0.14
  const idleY=Math.cos(t*0.08)*0.52 + Math.sin(t*0.12+0.7)*0.28 + Math.cos(t*0.04+1.8)*0.16
  const jx=(Math.random()-0.5)*k*0.28, jy=(Math.random()-0.5)*k*0.16
  // single motion gain applied here (inputs are pre-normalized ~[-0.5,0.5])
  const tx=targetX*2.6 + idleX + jx
  const ty=targetY*2.2 + idleY + jy
  camera.position.x+=(tx - camera.position.x)*0.052
  camera.position.y+=((7.8 + ty*1.85) - camera.position.y)*0.052
  const tz=17.2 - b*1.35 - k*1.05
  camera.position.z+=(tz - camera.position.z)*0.042
  camera.rotation.z+=(tx*0.034 - camera.rotation.z)*0.052
  camera.rotation.x+=((-ty*0.022) - camera.rotation.x)*0.048
  camera.lookAt(tx*1.10, 1.0 + ty*1.45, -7.5)
  const sb= 1 + b*0.18 + k*0.14; ring.scale.set(sb,sb,sb); ring.material.opacity=0.36 + b*0.30 + k*0.24; ring.rotation.z+=dt*(0.22 + b*0.38); ring.rotation.y=Math.sin(t*0.4)*0.08 + tx*0.04
  p1.intensity=13 + b*18 + k*11 + Math.sin(t*0.9)*1.1; p2.intensity=7 + beat.mid*10 + k*6; p3.intensity=11 + lvl*13 + k*8
  const ppos=pGeo.attributes.position
  for(let i=0;i<PCOUNT;i++){ let z=ppos.array[i*3+2]; z+=pSpeed[i]*(1 + b*1.0 + k*0.7); if(z>13){ z=-44-Math.random()*14; ppos.array[i*3]=(Math.random()-0.5)*78; ppos.array[i*3+1]=Math.random()*17-0.3 } ppos.array[i*3+2]=z }
  ppos.needsUpdate=true
  bMat.opacity=0.45 + lvl*0.20 + k*0.12; bokeh.rotation.y+=dt*(0.012 + b*0.022); bokeh.scale.setScalar(1 + b*0.07)
  stars.rotation.y+=dt*0.008; stars.rotation.x=Math.sin(t*0.04)*0.01
  renderer.render(scene,camera)
  revealCanvas()
}
onResize()
if(prefersReduced){
  renderStaticFrame()
} else {
  animate()
}
// intro fade runs in CSS (.hero__content > *), so it completes even when the WebGL loop is slow
if(import.meta.hot) import.meta.hot.dispose(()=>cancelAnimationFrame(raf))
