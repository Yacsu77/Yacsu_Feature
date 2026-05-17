import VantaNet from '@/components/effects/VantaNet'
import AnimatedTitle from '@/components/ui/AnimatedTitle'
import TypewriterText from '@/components/ui/TypewriterText'
import GlitchText from '@/components/ui/GlitchText'
import MusicBadge from '@/components/ui/MusicBadge'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="landing">
      <VantaNet />

      {/* ── Title block — top-right ─────────────────── */}
      <div className="landing__title-block">
        <AnimatedTitle />

        <div className="landing__credits">
          <span className="landing__offering">
            <TypewriterText text="oferecimentos" delay={800} speed={85} />
          </span>

          <div className="landing__author-block">
            <GlitchText className="landing__author-name">
              Pedro Carneichuk
            </GlitchText>
            <span className="landing__author-role">
              Analista e Desenvolvedor de Software
            </span>
          </div>
        </div>
      </div>

      {/* ── Music badge — bottom-right ──────────────── */}
      <div className="landing__music">
        <MusicBadge />
      </div>
    </div>
  )
}
