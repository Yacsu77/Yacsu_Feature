import { useEffect, useRef, useState } from 'react'
import bgMusic from '@sounds/2-05. The British Empire.mp3'
import './MusicBadge.css'

const TRACK_NAME = 'The British Empire'
const TRACK_DETAIL = "Assassin's Creed IV — Black Flag"

export default function MusicBadge() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.35
    audio.loop = true

    const tryPlay = () => {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }

    tryPlay()

    const handleInteraction = () => {
      if (!audioRef.current.paused) return
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }

    window.addEventListener('pointerdown', handleInteraction, { once: true })
    return () => window.removeEventListener('pointerdown', handleInteraction)
  }, [])

  const toggle = (e) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <button
      className={`music-badge${playing ? ' music-badge--playing' : ''}`}
      onClick={toggle}
      aria-label={playing ? 'Pausar música' : 'Reproduzir música'}
      title={playing ? 'Clique para pausar' : 'Clique para reproduzir'}
    >
      <audio ref={audioRef} src={bgMusic} preload="auto" />

      {/* Equalizer bars */}
      <div className="music-badge__eq" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="music-badge__bar" />
        ))}
      </div>

      <div className="music-badge__text">
        <span className="music-badge__title">{TRACK_NAME}</span>
        <span className="music-badge__detail">{TRACK_DETAIL}</span>
      </div>
    </button>
  )
}
