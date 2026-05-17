import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TransitionProvider } from '@/context/TransitionContext'
import LandingPage      from '@/pages/LandingPage'
import ProjetosPage     from '@/pages/ProjetosPage'
import CertificadosPage from '@/pages/CertificadosPage'
import ExperienciasPage from '@/pages/ExperienciasPage'
import SobreMimPage     from '@/pages/SobreMimPage'

export default function App() {
  return (
    <BrowserRouter>
      <TransitionProvider>
        <Routes>
          <Route path="/"             element={<LandingPage />}      />
          <Route path="/projetos"     element={<ProjetosPage />}     />
          <Route path="/certificados" element={<CertificadosPage />} />
          <Route path="/experiencias" element={<ExperienciasPage />} />
          <Route path="/sobre"        element={<SobreMimPage />}     />
        </Routes>
      </TransitionProvider>
    </BrowserRouter>
  )
}
