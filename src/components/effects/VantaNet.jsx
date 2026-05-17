import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './VantaNet.css'

export default function VantaNet() {
  const elRef = useRef(null)
  const effectRef = useRef(null)

  useEffect(() => {
    if (effectRef.current || !elRef.current) return

    window.THREE = THREE

    import('vanta/dist/vanta.net.min').then((mod) => {
      const NET = mod.default ?? mod

      if (typeof NET !== 'function') {
        console.error('[VantaNet] NET is not callable:', NET)
        return
      }

      effectRef.current = NET({
        el: elRef.current,
        THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        showDots: false,
        backgroundColor: 0xffffff,
        color: 0x1a1a2e,
        color2: 0x16213e,
        maxDistance: 26.00,
        spacing: 18.00,
        points: 9.00,
        speed: 0.80,
      })
    })

    return () => {
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [])

  return <div ref={elRef} className="vanta-net" />
}
