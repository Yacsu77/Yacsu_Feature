import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import './AnimatedTitle.css'

const TITLE = 'Yacsu Feature'

// Each letter gets a slightly different personality
const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa',
  '#7c3aed', '#4f46e5', '#818cf8',
]

export default function AnimatedTitle() {
  const lettersRef = useRef([])

  const handleEnter = useCallback((i) => {
    const el = lettersRef.current[i]
    if (!el || el.dataset.space) return

    const color = ACCENT_COLORS[i % ACCENT_COLORS.length]
    const jumpY = gsap.utils.random(-16, -8)
    const rot   = gsap.utils.random(-18, 18)

    gsap.killTweensOf(el)
    gsap.to(el, {
      y: jumpY,
      scale: gsap.utils.random(1.18, 1.38),
      rotation: rot,
      color,
      duration: 0.22,
      ease: 'back.out(5)',
      overwrite: true,
    })

    // Ripple to neighbours
    const neighbours = [i - 1, i + 1]
    neighbours.forEach((j) => {
      const nb = lettersRef.current[j]
      if (!nb || nb.dataset.space) return
      gsap.to(nb, {
        y: jumpY * 0.35,
        scale: 1.08,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: false,
      })
    })
  }, [])

  const handleLeave = useCallback((i) => {
    const el = lettersRef.current[i]
    if (!el || el.dataset.space) return

    gsap.killTweensOf(el)
    gsap.to(el, {
      y: 0,
      scale: 1,
      rotation: 0,
      color: '#1a1a2e',
      duration: 0.7,
      ease: 'elastic.out(1.1, 0.35)',
      overwrite: true,
    })

    const neighbours = [i - 1, i + 1]
    neighbours.forEach((j) => {
      const nb = lettersRef.current[j]
      if (!nb || nb.dataset.space) return
      gsap.to(nb, {
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'elastic.out(1, 0.4)',
        overwrite: false,
      })
    })
  }, [])

  const handleClick = useCallback((i) => {
    const el = lettersRef.current[i]
    if (!el || el.dataset.space) return

    gsap.timeline()
      .to(el, { scale: 1.6, rotation: 360, duration: 0.3, ease: 'power4.out' })
      .to(el, { scale: 1, rotation: 0, color: '#1a1a2e', duration: 0.5, ease: 'elastic.out(1.2, 0.4)' })
  }, [])

  return (
    <h1 className="animated-title" aria-label={TITLE}>
      {TITLE.split('').map((char, i) => (
        <span
          key={i}
          ref={(el) => (lettersRef.current[i] = el)}
          className="animated-title__letter"
          data-space={char === ' ' ? 'true' : undefined}
          onMouseEnter={() => handleEnter(i)}
          onMouseLeave={() => handleLeave(i)}
          onClick={() => handleClick(i)}
          aria-hidden
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  )
}
