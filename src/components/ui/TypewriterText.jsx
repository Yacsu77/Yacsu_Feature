import { useEffect, useRef, useState } from 'react'
import './TypewriterText.css'

export default function TypewriterText({
  text,
  className = '',
  delay = 600,
  speed = 90,
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setDone(false)

    const start = setTimeout(() => {
      const interval = setInterval(() => {
        indexRef.current += 1
        setDisplayed(text.slice(0, indexRef.current))

        if (indexRef.current >= text.length) {
          clearInterval(interval)
          // keep cursor briefly, then fade it
          setTimeout(() => setDone(true), 900)
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(start)
  }, [text, delay, speed])

  return (
    <span className={`typewriter ${className}`}>
      {displayed}
      <span className={`typewriter__cursor${done ? ' typewriter__cursor--done' : ''}`} aria-hidden />
    </span>
  )
}
