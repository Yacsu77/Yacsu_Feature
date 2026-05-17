import { useEffect, useRef } from 'react'
import './LogoBolinhas.css'

// ─── Canvas dimensions (original coordinate space) ──────────────
const CW = 500
const CH = 460
const CX = CW / 2
const CY = CH / 2 - 20

// ─── Physics constants ───────────────────────────────────────────
const REPEL_RADIUS = 80
const REPEL_FORCE  = 5.5
const RETURN_SPEED = 0.085
const DAMPING      = 0.72

// ─── Geometry helpers ────────────────────────────────────────────
function tri(cx, cy, r, rot) {
  const pts = []
  for (let i = 0; i < 3; i++) {
    const a = rot + (Math.PI * 2 * i / 3) - Math.PI / 2
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  return pts
}

function buildLogo() {
  const dots = []

  function addPath(points, closed, step, size, color) {
    const n = points.length
    for (let i = 0; i < n; i++) {
      if (!closed && i === n - 1) break
      const a = points[i]
      const b = points[(i + 1) % n]
      const dx = b[0] - a[0], dy = b[1] - a[1]
      const steps = Math.floor(Math.hypot(dx, dy) / step)
      for (let s = 0; s <= steps; s++) {
        const t = s / Math.max(steps, 1)
        dots.push({ ox: a[0]+dx*t, oy: a[1]+dy*t, x: a[0]+dx*t, y: a[1]+dy*t, vx: 0, vy: 0, r: size, color })
      }
    }
  }

  function addCircle(cx, cy, r, step, size, color) {
    const n = Math.floor((2 * Math.PI * r) / step)
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i / n) - Math.PI / 2
      dots.push({ ox: cx+Math.cos(a)*r, oy: cy+Math.sin(a)*r, x: cx+Math.cos(a)*r, y: cy+Math.sin(a)*r, vx: 0, vy: 0, r: size, color })
    }
  }

  addPath(tri(CX, CY, 148, 0),            true, 9, 3.2, '#1a1a1a')
  addPath(tri(CX, CY + 6, 112, Math.PI),  true, 9, 2.6, '#444')
  addPath(tri(CX, CY, 82, 0),             true, 8, 2.0, '#222')
  addCircle(CX, CY + 6, 118, 8, 2.2, '#555')
  addPath(tri(CX, CY + 4, 130, 0),        true, 5, 4.8, '#0a0a0a')

  const boldT = tri(CX, CY + 4, 130, 0)
  for (let i = 0; i < 6; i++) {
    const t = i / 5
    const seg = Math.floor(t * 2)
    const lt  = (t * 2) % 1
    const a = boldT[seg], b = boldT[(seg + 1) % 3]
    for (let d = 3.5; d <= 5; d += 1.5) {
      dots.push({ ox: a[0]+(b[0]-a[0])*lt, oy: a[1]+(b[1]-a[1])*lt, x: a[0]+(b[0]-a[0])*lt, y: a[1]+(b[1]-a[1])*lt, vx: 0, vy: 0, r: d, color: '#0a0a0a' })
    }
  }

  const cornerCircles = [
    [CX - 148, CY + 80, 7, '#1a1a1a'], [CX + 148, CY + 80, 7, '#1a1a1a'],
    [CX, CY - 138, 5, '#1a1a1a'],
    [CX - 118, CY + 6, 5, '#333'], [CX + 118, CY + 6, 5, '#333'],
  ]
  cornerCircles.forEach(([x, y, r, color]) => {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      dots.push({ ox: x+Math.cos(a)*r, oy: y+Math.sin(a)*r, x: x+Math.cos(a)*r, y: y+Math.sin(a)*r, vx: 0, vy: 0, r: 2.2, color })
    }
  })

  const label = ['D','A','I','L','Y','M','I','N','I','M','A','L']
  label.forEach((_, i) => {
    const lx = CX - 52 + i * 9, ly = CY + 172
    for (let d = 0; d < 5; d++) {
      dots.push({ ox: lx+Math.random()*6-3, oy: ly+Math.random()*5-2, x: lx, y: ly, vx: 0, vy: 0, r: 1.5, color: '#888' })
    }
  })

  Array.from('NO. 155').forEach((_, i) => {
    const lx = CX - 28 + i * 9, ly = CY + 188
    for (let d = 0; d < 6; d++) {
      dots.push({ ox: lx+Math.random()*5-2, oy: ly+Math.random()*4-2, x: lx, y: ly, vx: 0, vy: 0, r: 1.8, color: '#555' })
    }
  })

  return dots
}

// ─── Component ───────────────────────────────────────────────────
export default function LogoBolinhas() {
  const canvasRef = useRef(null)
  const stateRef  = useRef({ mx: -999, my: -999, dots: [], frame: null, active: true })

  useEffect(() => {
    const cv    = canvasRef.current
    if (!cv) return
    const ctx   = cv.getContext('2d')
    const state = stateRef.current
    state.dots  = buildLogo()

    const loop = () => {
      if (!state.active) return
      ctx.clearRect(0, 0, CW, CH)
      for (const d of state.dots) {
        const dx   = d.x - state.mx
        const dy   = d.y - state.my
        const dist = Math.hypot(dx, dy)
        if (dist < REPEL_RADIUS && dist > 0) {
          const f = (REPEL_RADIUS - dist) / REPEL_RADIUS
          d.vx += (dx / dist) * f * REPEL_FORCE
          d.vy += (dy / dist) * f * REPEL_FORCE
        }
        d.vx += (d.ox - d.x) * RETURN_SPEED
        d.vy += (d.oy - d.y) * RETURN_SPEED
        d.vx *= DAMPING; d.vy *= DAMPING
        d.x  += d.vx;    d.y  += d.vy
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = d.color; ctx.fill()
      }
      state.frame = requestAnimationFrame(loop)
    }
    loop()

    const onMove = (e) => {
      const rect   = cv.getBoundingClientRect()
      state.mx = (e.clientX - rect.left)  * (CW / rect.width)
      state.my = (e.clientY - rect.top)   * (CH / rect.height)
    }
    const onLeave = () => { state.mx = -999; state.my = -999 }
    cv.addEventListener('mousemove', onMove)
    cv.addEventListener('mouseleave', onLeave)

    return () => {
      state.active = false
      if (state.frame) cancelAnimationFrame(state.frame)
      cv.removeEventListener('mousemove', onMove)
      cv.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CW}
      height={CH}
      className="logo-bolinhas"
      aria-label="Logo animado"
    />
  )
}
