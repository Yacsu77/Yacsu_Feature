import { createContext, useContext, useRef } from 'react'
import GlitchOverlay from '@/components/effects/GlitchOverlay'

const TransitionContext = createContext(null)

export function TransitionProvider({ children }) {
  const overlayRef = useRef(null)

  /**
   * Trigger the glitch transition then call `callback` at the midpoint.
   * Usage: triggerTransition(() => navigate('/projetos'))
   */
  const triggerTransition = (callback) => {
    overlayRef.current?.trigger(callback)
  }

  return (
    <TransitionContext.Provider value={{ triggerTransition }}>
      {children}
      <GlitchOverlay ref={overlayRef} />
    </TransitionContext.Provider>
  )
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('usePageTransition must be inside TransitionProvider')
  return ctx
}
