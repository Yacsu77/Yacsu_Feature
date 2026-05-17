import { useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MenuCard from './MenuCard'
import { usePageTransition } from '@/context/TransitionContext'
import { useAudioManager } from '@/hooks/useAudioManager'
import './MenuLateral.css'

const ITEMS = [
  { label: 'Projetos',     path: '/projetos'     },
  { label: 'Certificados', path: '/certificados' },
  { label: 'Experiências', path: '/experiencias' },
  { label: 'Sobre Mim',    path: '/sobre'        },
]

export default function MenuLateral() {
  const navigate = useNavigate()
  const { triggerTransition } = usePageTransition()
  const { playHover, playClick, playLoading } = useAudioManager()
  const pushRefs = useRef([])

  const handleHoverChange = useCallback((hoveredIndex, isHovering) => {
    if (isHovering) playHover()

    ITEMS.forEach((_, j) => {
      const el = pushRefs.current[j]
      if (!el) return
      if (!isHovering) {
        el.style.transform = 'translateY(0)'
      } else if (j !== hoveredIndex) {
        el.style.transform = `translateY(${j < hoveredIndex ? -14 : 14}px)`
      }
    })
  }, [playHover])

  const handleNavigate = useCallback((path) => {
    playClick()
    playLoading(1400)
    triggerTransition(() => navigate(path))
  }, [playClick, playLoading, triggerTransition, navigate])

  return (
    <div className="menu-lateral">
      {ITEMS.map((item, i) => (
        <div
          key={item.path}
          className="menu-lateral__wrapper"
          style={{ '--idx': i }}
        >
          <div
            ref={(el) => (pushRefs.current[i] = el)}
            className="menu-lateral__push"
          >
            <MenuCard
              label={item.label}
              index={i}
              onNavigate={() => handleNavigate(item.path)}
              onHoverChange={handleHoverChange}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
