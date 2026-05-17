import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTransition } from '@/context/TransitionContext'
import { useAudioManager } from '@/hooks/useAudioManager'
import './PageTemplate.css'

export default function PageTemplate({ title, children }) {
  const navigate              = useNavigate()
  const { triggerTransition } = usePageTransition()
  const { playClick }         = useAudioManager()

  const handleBack = useCallback(() => {
    playClick()
    triggerTransition(() => navigate('/'))
  }, [playClick, triggerTransition, navigate])

  return (
    <div className="page-tpl">
      {/* Grid background */}
      <div className="page-tpl__grid" />

      {/* Corner decorations */}
      <div className="page-tpl__corner page-tpl__corner--tl" />
      <div className="page-tpl__corner page-tpl__corner--tr" />
      <div className="page-tpl__corner page-tpl__corner--bl" />
      <div className="page-tpl__corner page-tpl__corner--br" />

      {/* Page tag */}
      <div className="page-tpl__tag">{title.toUpperCase()} // YACSU FEATURE</div>

      {/* Content */}
      <div className="page-tpl__content">
        <h2 className="page-tpl__title">{title}</h2>
        {children}
      </div>

      {/* Back button */}
      <button className="page-tpl__back" onClick={handleBack}>
        [ VOLTAR ]
      </button>
    </div>
  )
}
