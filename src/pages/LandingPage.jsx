import GeometricBg    from '@/components/effects/GeometricBg'
import AnimatedTitle  from '@/components/ui/AnimatedTitle'
import TypewriterText from '@/components/ui/TypewriterText'
import GlitchText     from '@/components/ui/GlitchText'
import MusicBadge     from '@/components/ui/MusicBadge'
import LogoBolinhas   from '@/components/ui/LogoBolinhas'
import MenuLateral    from '@/components/layout/MenuLateral'
import SocialLinks    from '@/components/layout/SocialLinks'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="landing">
      <GeometricBg />

      <div className="landing__logo">
        <LogoBolinhas />
      </div>

      <div className="landing__left">
        <MenuLateral />
      </div>

      <div className="landing__right-panel">
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
      </div>

      <div className="landing__social">
        <SocialLinks />
      </div>

      <div className="landing__music">
        <MusicBadge />
      </div>
    </div>
  )
}
