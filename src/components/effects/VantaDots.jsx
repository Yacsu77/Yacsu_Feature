import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './VantaDots.css'

export default function VantaDots() {
  const elRef = useRef(null)
  const effectRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    let destroyed = false
    let onResize = null
    window.THREE = THREE

    const boot = async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      if (destroyed) return

      const mod = await import('vanta/dist/vanta.dots.min.js')
      const DOTS = mod.default ?? mod
      if (destroyed || typeof DOTS !== 'function') return

      effectRef.current = DOTS({
        el,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        showLines: false,
        backgroundColor: 0xffffff,
        color: 0x1a1a2e,
        color2: 0x3d3d5c,
        size: 3.5,
        spacing: 35,
      })

      onResize = () => effectRef.current?.resize?.()
      onResize()
      setTimeout(onResize, 150)
      window.addEventListener('resize', onResize)
    }

    boot().catch((err) => console.error('[VantaDots]', err))

    return () => {
      destroyed = true
      if (onResize) window.removeEventListener('resize', onResize)
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [])

  return <div ref={elRef} className="vanta-dots" aria-hidden />
}
