import { useEffect, useRef, useState } from 'react'
import './ProximityGlitchTitle.css'

const TITLE = 'Yacsu Feature'
const PROX_RADIUS = 260

const FONT_POOL = [
  "'Arena', sans-serif",
  "'Calligrapher', cursive",
  "'Space Mono', monospace",
  "'Rajdhani', sans-serif",
  'Georgia, serif',
  'system-ui, sans-serif',
]

export default function ProximityGlitchTitle() {
  const wrapRef = useRef(null)
  const [intensity, setIntensity] = useState(0)
  const [letterFonts, setLetterFonts] = useState(() =>
    TITLE.split('').map(() => 0),
  )
  const [letterJitter, setLetterJitter] = useState(() =>
    TITLE.split('').map(() => ({ x: 0, y: 0 })),
  )
  const intensityRef = useRef(0)

  useEffect(() => {
    intensityRef.current = intensity
  }, [intensity])

  useEffect(() => {
    const onMove = (e) => {
      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
      setIntensity(Math.max(0, 1 - dist / PROX_RADIUS))
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const letters = TITLE.split('')
    let tick = 0

    const interval = setInterval(() => {
      const i = intensityRef.current
      if (i < 0.1) {
        setLetterFonts(letters.map(() => 0))
        setLetterJitter(letters.map(() => ({ x: 0, y: 0 })))
        return
      }

      tick++
      const every = i > 0.65 ? 2 : i > 0.35 ? 4 : 8
      if (tick % every !== 0) return

      const jitterAmt = i * 4
      setLetterJitter(
        letters.map(() => ({
          x: (Math.random() - 0.5) * jitterAmt,
          y: (Math.random() - 0.5) * jitterAmt * 0.6,
        })),
      )

      setLetterFonts(
        letters.map((ch) => {
          if (ch === ' ') return 0
          const chance = i > 0.6 ? 0.75 : i > 0.35 ? 0.5 : 0.25
          if (Math.random() < chance) {
            return Math.floor(Math.random() * FONT_POOL.length)
          }
          return 0
        }),
      )
    }, 32)

    return () => clearInterval(interval)
  }, [])

  const rShift = intensity * 7
  const bShift = intensity * -6
  const chroma = intensity * 2.5

  return (
    <h1
      ref={wrapRef}
      className="prox-title"
      aria-label={TITLE}
      style={{
        '--intensity': intensity,
        '--r-shift': `${rShift}px`,
        '--b-shift': `${bShift}px`,
        '--chroma': `${chroma}px`,
      }}
    >
      {TITLE.split('').map((ch, i) => {
        const font = FONT_POOL[letterFonts[i] ?? 0]
        const { x: jx, y: jy } = letterJitter[i] ?? { x: 0, y: 0 }
        const display = ch === ' ' ? '\u00A0' : ch

        return (
          <span
            key={i}
            className="prox-title__glyph"
            style={{
              fontFamily: font,
              transform: intensity > 0.15 ? `translate(${jx}px, ${jy}px)` : 'none',
            }}
          >
            <span
              className="prox-title__layer prox-title__layer--r"
              style={{ fontFamily: font }}
              aria-hidden
            >
              {display}
            </span>
            <span
              className="prox-title__layer prox-title__layer--b"
              style={{ fontFamily: font }}
              aria-hidden
            >
              {display}
            </span>
            <span className="prox-title__layer prox-title__layer--main">
              {display}
            </span>
          </span>
        )
      })}
    </h1>
  )
}
