import { useRef, useCallback } from 'react'
import hoverSrc   from '@sounds/Hover.mp3'
import clickSrc   from '@sounds/Click.mp3'
import loadingSrc from '@sounds/Carregamento.mp3'

function makeAudio(src, volume = 0.6) {
  const a = new Audio(src)
  a.volume = volume
  return a
}

export function useAudioManager() {
  const hoverAudio   = useRef(null)
  const clickAudio   = useRef(null)
  const loadingAudio = useRef(null)
  const loadingTimer = useRef(null)

  const playHover = useCallback(() => {
    if (!hoverAudio.current) hoverAudio.current = makeAudio(hoverSrc, 0.5)
    hoverAudio.current.currentTime = 0
    hoverAudio.current.play().catch(() => {})
  }, [])

  const playClick = useCallback(() => {
    if (!clickAudio.current) clickAudio.current = makeAudio(clickSrc, 0.7)
    clickAudio.current.currentTime = 0
    clickAudio.current.play().catch(() => {})
  }, [])

  const playLoading = useCallback((duration = 1600) => {
    if (!loadingAudio.current) loadingAudio.current = makeAudio(loadingSrc, 0.45)
    clearTimeout(loadingTimer.current)
    loadingAudio.current.currentTime = 0
    loadingAudio.current.play().catch(() => {})
    loadingTimer.current = setTimeout(() => {
      loadingAudio.current?.pause()
      if (loadingAudio.current) loadingAudio.current.currentTime = 0
    }, duration)
  }, [])

  return { playHover, playClick, playLoading }
}
