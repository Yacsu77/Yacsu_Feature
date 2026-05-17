import './GlitchText.css'

/**
 * Subtle RGB-split glitch effect.
 * `data-text` drives the ::before / ::after pseudo-element content.
 */
export default function GlitchText({ children, className = '' }) {
  return (
    <span
      className={`glitch-text ${className}`}
      data-text={typeof children === 'string' ? children : ''}
    >
      {children}
    </span>
  )
}
