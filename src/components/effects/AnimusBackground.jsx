import { useEffect, useRef } from 'react'
import './AnimusBackground.css'

const GOLD = 'rgba(201,168,76,'
const TEAL = 'rgba(0,200,130,'
const WHITE = 'rgba(220,235,225,'

function rnd(a, b) {
  return Math.random() * (b - a) + a
}

class Node {
  constructor(W, H) {
    this.W = W
    this.H = H
    this.reset(true)
  }

  reset() {
    this.x = rnd(0, this.W)
    this.y = rnd(0, this.H)
    this.vx = rnd(-0.18, 0.18)
    this.vy = rnd(-0.12, 0.12)
    this.r = rnd(1.2, 3.5)
    this.pulse = rnd(0, Math.PI * 2)
    this.speed = rnd(0.4, 1.2)
    this.type = Math.random() < 0.12 ? 'gold' : Math.random() < 0.2 ? 'teal' : 'base'
    this.opacity = rnd(0.3, 0.9)
    this.connections = 0
  }

  update(mx, my) {
    this.x += this.vx
    this.y += this.vy
    this.pulse += 0.02 * this.speed
    const dx = mx - this.x
    const dy = my - this.y
    const dist = Math.hypot(dx, dy)
    if (dist < 120) {
      this.vx -= (dx / dist) * 0.012
      this.vy -= (dy / dist) * 0.012
    }
    this.vx *= 0.998
    this.vy *= 0.998
    if (this.x < -20) this.x = this.W + 20
    if (this.x > this.W + 20) this.x = -20
    if (this.y < -20) this.y = this.H + 20
    if (this.y > this.H + 20) this.y = -20
  }

  draw(ctx) {
    const p = (0.5 + 0.5 * Math.sin(this.pulse)) * this.opacity
    const col = this.type === 'gold' ? GOLD : this.type === 'teal' ? TEAL : WHITE
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = col + p + ')'
    ctx.fill()
    if (this.type === 'gold' && this.r > 2.5) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r + 3 + Math.sin(this.pulse) * 2, 0, Math.PI * 2)
      ctx.strokeStyle = col + p * 0.3 + ')'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }
}

export default function AnimusBackground() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let W = 0
    let H = 0
    let frameId
    let t = 0
    let dashOffset = 0
    let nodes = []

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      mouseRef.current = { x: W / 2, y: H / 2 }
      nodes = Array.from({ length: 140 }, () => new Node(W, H))
    }
    resize()

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const drawEdge = (ax, ay, bx, by, alpha, col) => {
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(bx, by)
      ctx.strokeStyle = col + alpha + ')'
      ctx.lineWidth = alpha * 1.2
      ctx.stroke()
    }

    const drawDashedEdge = (ax, ay, bx, by, alpha, offset) => {
      ctx.save()
      ctx.setLineDash([4, 6])
      ctx.lineDashOffset = -offset
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(bx, by)
      ctx.strokeStyle = GOLD + alpha * 0.5 + ')'
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.restore()
    }

    const frame = () => {
      frameId = requestAnimationFrame(frame)
      t++
      dashOffset = (dashOffset + 0.4) % 20
      const { x: mx, y: my } = mouseRef.current

      ctx.fillStyle = 'rgba(1,10,6,.18)'
      ctx.fillRect(0, 0, W, H)

      nodes.forEach((n) => n.update(mx, my))

      for (let i = 0; i < nodes.length; i++) {
        nodes[i].connections = 0
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.hypot(dx, dy)
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.35
            const isGold = nodes[i].type === 'gold' || nodes[j].type === 'gold'
            const isTeal = nodes[i].type === 'teal' || nodes[j].type === 'teal'
            const col = isGold ? GOLD : isTeal ? TEAL : WHITE
            if (isGold && dist < 77) {
              drawDashedEdge(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, alpha, dashOffset)
            } else {
              drawEdge(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, alpha, col)
            }
            nodes[i].connections++
            nodes[j].connections++
          }
        }
        const mdx = mx - nodes[i].x
        const mdy = my - nodes[i].y
        const mdist = Math.hypot(mdx, mdy)
        if (mdist < 160) {
          const alpha = (1 - mdist / 160) * 0.55
          drawEdge(nodes[i].x, nodes[i].y, mx, my, alpha, GOLD)
        }
      }

      nodes.forEach((n) => n.draw(ctx))
    }

    frame()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="animus-bg__canvas" aria-hidden />
      <div className="animus-bg__scan" aria-hidden />
    </>
  )
}
