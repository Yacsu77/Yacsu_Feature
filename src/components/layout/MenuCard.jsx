import { useRef, useEffect, useCallback } from 'react'
import './MenuCard.css'

// ─── Constants ──────────────────────────────────────────────────
const OVF    = 22
const REPEL  = 80
const FORCE  = 4.2
const SPRING = 0.05
const DAMP   = 0.73

const PALETTES = [
  ['#D2AF50','#C8A83C','#E8C860','#B89028'],
  ['#C0A030','#D8B848','#E0C050','#A89020'],
  ['#B89828','#CAA838','#D8B840','#A08820'],
  ['#A88020','#BCAA30','#CAAC28','#907818'],
]

// Card 0 = base; each next is 25% smaller (×0.75)
const SCALE_STEP = 0.75
const BASE_H = 88
const scaleAt = (i) => Math.pow(SCALE_STEP, i)
const HEIGHTS = [0, 1, 2, 3].map((i) => {
  const h = Math.round(BASE_H * scaleAt(i))
  if (i === 2) return Math.round(h * 1.22)
  if (i === 3) return Math.round(h * 1.28)
  return h
})
const WIDTHS  = [0, 1, 2, 3].map((i) => 100 * scaleAt(i))

// ─── Helpers (module-level, no React) ───────────────────────────
function shapePts(type, cx, cy, sw, sh, n) {
  const pts = []
  if (type < 0.65) {
    for (let i = 0; i < n; i++) {
      const t = i / n, side = Math.floor(t * 4), u = (t * 4) % 1
      if      (side === 0) pts.push({ x: cx - sw + u * sw * 2, y: cy - sh })
      else if (side === 1) pts.push({ x: cx + sw, y: cy - sh + u * sh * 2 })
      else if (side === 2) pts.push({ x: cx + sw - u * sw * 2, y: cy + sh })
      else                 pts.push({ x: cx - sw, y: cy + sh - u * sh * 2 })
    }
  } else {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      pts.push({ x: cx + Math.cos(a) * sw, y: cy + Math.sin(a) * sw })
    }
  }
  return pts
}

function buildParticles(W, H, palette) {
  const pts = []
  const GAP  = 13
  const cols = Math.floor((W + OVF * 2 - 8) / GAP)
  const rows = Math.floor((H + OVF * 2 - 8) / GAP)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.35) continue
      const x  = W + OVF - 6 - c * GAP + Math.random() * 3
      const y  = -OVF + 6 + r * GAP + Math.random() * 3
      const sp = shapePts(Math.random(), x, y, Math.random() * 4 + 2, Math.random() * 3 + 1.5, Math.floor(Math.random() * 6) + 6)
      const col = palette[Math.floor(Math.random() * palette.length)]
      sp.forEach(p => pts.push({
        ox: p.x, oy: p.y,
        x:  p.x + (Math.random() - 0.5) * 70,
        y:  p.y + (Math.random() - 0.5) * 70,
        vx: 0, vy: 0,
        size:  Math.random() * 0.85 + 0.5,
        alpha: Math.random() * 0.3 + 0.45,
        col,
        angle: Math.random() * Math.PI * 2,
        angV:  (Math.random() - 0.5) * 0.014,
      }))
    }
  }
  return pts
}

/** Imperative rAF tick — reads from live refs, no stale closure */
function runTick(stateRef, canvasRef) {
  const state = stateRef.current
  const cv    = canvasRef.current
  if (!cv || !state.active) return

  const dpr = window.devicePixelRatio || 1
  const W   = cv.width / dpr
  const H   = cv.height / dpr
  const ctx = cv.getContext('2d')
  ctx.clearRect(-OVF, -OVF, W + OVF * 2, H + OVF * 2)

  for (const p of state.particles) {
    p.angle += p.angV
    const wob = state.hovered ? 3 : 0
    const ox  = p.ox + Math.sin(p.angle) * wob
    const oy  = p.oy + Math.cos(p.angle + 1) * wob * 0.7
    const dx  = p.x - state.mouse.x
    const dy  = p.y - state.mouse.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < REPEL && dist > 0) {
      const f = (1 - dist / REPEL) * FORCE
      p.vx += (dx / dist) * f
      p.vy += (dy / dist) * f
    }
    p.vx += (ox - p.x) * SPRING; p.vy += (oy - p.y) * SPRING
    p.vx *= DAMP; p.vy *= DAMP
    p.x  += p.vx;  p.y  += p.vy

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const boost = Math.min(1, speed * 0.3)
    const sz    = p.size + (state.hovered ? boost * 2 : 0)

    if (state.hovered) {
      ctx.globalAlpha = Math.min(1, p.alpha + boost * 0.4)
      ctx.fillStyle   = p.col
    } else {
      ctx.globalAlpha = p.alpha * 0.5
      ctx.fillStyle   = 'rgba(190,190,190,1)'
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  }

  if (state.hovered && state.mouse.x > 0) {
    ctx.beginPath(); ctx.arc(state.mouse.x, state.mouse.y, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(210,175,80,0.9)'; ctx.fill()
    ctx.beginPath(); ctx.arc(state.mouse.x, state.mouse.y, REPEL, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(210,175,80,0.07)'; ctx.lineWidth = 1; ctx.stroke()
  }

  state.animFrame = requestAnimationFrame(() => runTick(stateRef, canvasRef))
}

// ─── Component ──────────────────────────────────────────────────
export default function MenuCard({ label, index, onNavigate, onHoverChange }) {
  const canvasRef   = useRef(null)
  const cardElRef   = useRef(null)
  const lblBaseRef  = useRef(null)
  const lblRRef     = useRef(null)
  const lblBRef     = useRef(null)
  const dotRef      = useRef(null)

  const palette = PALETTES[index % PALETTES.length]
  const cardH   = HEIGHTS[index] ?? 104
  const widthPct = WIDTHS[index] ?? 63

  const stateRef = useRef({
    particles: [],
    mouse:     { x: -9999, y: -9999 },
    hovered:   false,
    animFrame: null,
    glitching: false,
    stopRGB:   null,
    active:    true,
    palette,
  })

  // ── Glitch label scramble ──────────────────────────────────────
  const doGlitch = useCallback(() => {
    const state = stateRef.current
    const lbl   = lblBaseRef.current
    const lr    = lblRRef.current
    const lb    = lblBRef.current
    if (!lbl || state.glitching) return
    state.glitching = true
    const txt   = lbl.dataset.text
    const chars = '!<>-_\\/[]{}=+*^?#@$'
    let runs = 0
    const go = () => {
      if (runs >= 7) {
        lbl.textContent = txt
        if (lr) lr.textContent = txt
        if (lb) lb.textContent = txt
        state.glitching = false
        return
      }
      let out = ''
      for (let i = 0; i < txt.length; i++)
        out += Math.random() < 0.28 ? chars[Math.floor(Math.random() * chars.length)] : txt[i]
      lbl.textContent = out
      if (lr) lr.textContent = out
      if (lb) lb.textContent = out
      runs++
      setTimeout(go, 52)
    }
    go()
  }, [])

  // ── RGB split animation on label ──────────────────────────────
  const startRGB = useCallback(() => {
    const state = stateRef.current
    const lbl   = lblBaseRef.current
    const lr    = lblRRef.current
    const lb    = lblBRef.current
    if (!lbl || !lr || !lb) return
    const txt = lbl.dataset.text
    lr.textContent = txt; lb.textContent = txt
    let alive = true
    state.stopRGB = () => { alive = false }
    const anim = () => {
      if (!alive || !state.hovered) { lr.style.opacity = '0'; lb.style.opacity = '0'; return }
      const t = Math.sin(Date.now() * 0.0028) * 2.6
      lr.style.transform = `translate(${t}px,${t * 0.22}px)`;  lr.style.opacity = '0.5'
      lb.style.transform = `translate(${-t}px,${-t * 0.22}px)`; lb.style.opacity = '0.5'
      requestAnimationFrame(anim)
    }
    anim()
  }, [])

  // ── Canvas resize ─────────────────────────────────────────────
  const setSize = useCallback(() => {
    const cv   = canvasRef.current
    const card = cardElRef.current
    if (!cv || !card) return
    const dpr = window.devicePixelRatio || 1
    const W   = card.getBoundingClientRect().width || 400
    cv.width  = Math.round(W * dpr)
    cv.height = Math.round(cardH * dpr)
    cv.style.width  = W + 'px'
    cv.style.height = cardH + 'px'
    const ctx = cv.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    stateRef.current.particles = buildParticles(W, cardH, stateRef.current.palette)
  }, [cardH])

  // ── Mount / cleanup ───────────────────────────────────────────
  useEffect(() => {
    const lbl = lblBaseRef.current
    if (lbl) lbl.dataset.text = lbl.textContent

    const t1 = setTimeout(() => { setSize(); setTimeout(() => runTick(stateRef, canvasRef), 90) }, 50 + index * 20)
    const onResize = () => setTimeout(setSize, 50)
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t1)
      window.removeEventListener('resize', onResize)
      stateRef.current.active = false
      if (stateRef.current.animFrame) cancelAnimationFrame(stateRef.current.animFrame)
    }
  }, [setSize, index])

  // ── Event handlers ────────────────────────────────────────────
  const handleEnter = useCallback(() => {
    const state = stateRef.current
    state.hovered = true
    cardElRef.current?.classList.add('hovered')
    doGlitch(); startRGB()
    onHoverChange?.(index, true)
    if (state.animFrame) cancelAnimationFrame(state.animFrame)
    runTick(stateRef, canvasRef)
  }, [doGlitch, startRGB, index, onHoverChange])

  const handleLeave = useCallback(() => {
    const state = stateRef.current
    state.hovered = false
    state.stopRGB?.()
    cardElRef.current?.classList.remove('hovered')
    state.mouse = { x: -9999, y: -9999 }
    if (dotRef.current) dotRef.current.style.display = 'none'
    onHoverChange?.(index, false)
    if (state.animFrame) cancelAnimationFrame(state.animFrame)
    runTick(stateRef, canvasRef)
  }, [index, onHoverChange])

  const handleMove = useCallback((e) => {
    const r = cardElRef.current?.getBoundingClientRect()
    if (!r) return
    const state = stateRef.current
    state.mouse.x = e.clientX - r.left
    state.mouse.y = e.clientY - r.top
    if (dotRef.current) {
      dotRef.current.style.display = 'block'
      dotRef.current.style.left    = state.mouse.x + 'px'
      dotRef.current.style.top     = state.mouse.y + 'px'
    }
  }, [])

  return (
    <div className="mc-row" style={{ width: `${widthPct}%` }}>
      {/* Canvas card */}
      <div
        ref={cardElRef}
        className="mc-card"
        style={{ height: `${cardH}px` }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
        onClick={onNavigate}
      >
        <canvas ref={canvasRef} style={{ display: 'block', position: 'relative', zIndex: 1 }} />
        <div className="mc-scanlines" />
        <div className="mc-scan mc-scan--a" />
        <div className="mc-scan mc-scan--b" />
        <div className="mc-scan mc-scan--c" />
        <div className="mc-corner mc-corner--tl" />
        <div className="mc-corner mc-corner--tr" />
        <div className="mc-corner mc-corner--bl" />
        <div className="mc-corner mc-corner--br" />
        <div ref={dotRef} className="mc-dot" />
      </div>

      {/* Label */}
      <div className="mc-label-wrap">
        <div ref={lblRRef} className="mc-label-r" />
        <div ref={lblBRef} className="mc-label-b" />
        <div ref={lblBaseRef} className="mc-label-base">{label}</div>
      </div>
    </div>
  )
}
