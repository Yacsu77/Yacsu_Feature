import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import './GlitchOverlay.css'

const rand    = (a, b) => Math.random() * (b - a) + a
const randInt = (a, b) => Math.floor(rand(a, b))

function drawFrame(ctx, W, H, intensity) {
  ctx.clearRect(0, 0, W, H)

  // Coloured horizontal bars
  for (let i = 0, n = randInt(4, 14); i < n; i++) {
    const y     = rand(0, H)
    const h     = rand(1, 18)
    const shift = rand(-60, 60) * intensity
    const alpha = rand(0.15, 0.55) * intensity
    const which = Math.random()
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = which < 0.33 ? '#ff003c' : which < 0.66 ? '#00ff9f' : '#00cfff'
    ctx.fillRect(0, y, W, h)
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = rand(0.1, 0.3) * intensity
    ctx.fillStyle = '#fff'
    ctx.fillRect(shift, y, W * rand(0.2, 0.9), h * 0.4)
    ctx.restore()
  }

  // Block glitches
  for (let i = 0, n = randInt(2, 8); i < n; i++) {
    ctx.save()
    ctx.globalAlpha = rand(0.05, 0.25) * intensity
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff'
    ctx.fillRect(rand(0, W * 0.8) + rand(-80, 80) * intensity, rand(0, H), rand(40, 300), rand(2, 30))
    ctx.restore()
  }
}

const GlitchOverlay = forwardRef(function GlitchOverlay(_, ref) {
  const [visible, setVisible] = useState(false)
  const canvasRef = useRef(null)
  const gnRef     = useRef(null)
  const rlRRef    = useRef(null)
  const rlGRef    = useRef(null)
  const rlBRef    = useRef(null)
  const frameRef  = useRef(null)

  const setRGB = (rX, rO, gX, gO, bX, bO) => {
    if (rlRRef.current) { rlRRef.current.style.transform = `translateX(${rX}px)`; rlRRef.current.style.opacity = rO }
    if (rlGRef.current) { rlGRef.current.style.transform = `translateX(${gX}px)`; rlGRef.current.style.opacity = gO }
    if (rlBRef.current) { rlBRef.current.style.transform = `translateX(${bX}px)`; rlBRef.current.style.opacity = bO }
  }

  useImperativeHandle(ref, () => ({
    trigger(callback) {
      const cv = canvasRef.current
      if (!cv) return
      cv.width  = window.innerWidth
      cv.height = window.innerHeight
      const ctx = cv.getContext('2d')

      setVisible(true)

      const DURATION = 900
      let start    = null
      let switched = false

      if (frameRef.current) cancelAnimationFrame(frameRef.current)

      const tick = (ts) => {
        if (!start) start = ts
        const t         = Math.min((ts - start) / DURATION, 1)
        const phase     = t < 0.5 ? t * 2 : (1 - t) * 2
        const intensity = Math.pow(phase, 0.6)

        drawFrame(ctx, cv.width, cv.height, intensity)
        if (gnRef.current) gnRef.current.style.opacity = intensity * 0.85

        const rShift = (Math.random() > 0.5 ? 1 : -1) * rand(20, 55)
        const gShift = (Math.random() > 0.5 ? 1 : -1) * rand(15, 40)
        const bShift = -rShift * 0.7 + rand(-10, 10)
        if (intensity > 0.1) {
          setRGB(rShift * intensity, intensity * 0.18, gShift * intensity, intensity * 0.12, bShift * intensity, intensity * 0.18)
        } else {
          setRGB(0, 0, 0, 0, 0, 0)
        }

        if (t >= 0.45 && !switched) {
          switched = true
          callback?.()
        }

        if (t < 1) {
          frameRef.current = requestAnimationFrame(tick)
        } else {
          ctx.clearRect(0, 0, cv.width, cv.height)
          if (gnRef.current) gnRef.current.style.opacity = '0'
          setRGB(0, 0, 0, 0, 0, 0)
          setVisible(false)
          frameRef.current = null
        }
      }

      frameRef.current = requestAnimationFrame(tick)
    }
  }))

  return (
    <div
      className="glitch-overlay"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'all' : 'none' }}
    >
      <canvas ref={canvasRef} className="glitch-overlay__canvas" />
      <div ref={gnRef} className="glitch-overlay__noise" />
      <div ref={rlRRef} className="glitch-overlay__rgb glitch-overlay__rgb--r" />
      <div ref={rlGRef} className="glitch-overlay__rgb glitch-overlay__rgb--g" />
      <div ref={rlBRef} className="glitch-overlay__rgb glitch-overlay__rgb--b" />
    </div>
  )
})

export default GlitchOverlay
