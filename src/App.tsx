import { MotionConfig } from 'motion/react'
import { EnquiryProvider } from './lib/enquiry'
import { useRoute } from './lib/route'
import { PortalProvider } from './portal/store'
import { Login } from './portal/Login'
import { Portal } from './portal/Portal'
import { EnquiryDialog } from './components/EnquiryDialog'
import { Faq } from './components/Faq'
import { FinalCta, Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Intro } from './components/Intro'
import { Membership } from './components/Membership'
import { Programs } from './components/Programs'
import { ScrollProgress } from './components/ScrollProgress'
import { Space } from './components/Space'

function Site() {
  return (
    <EnquiryProvider>
      <a
        href="#club"
        className="fixed left-4 top-4 z-50 -translate-y-24 bg-lime px-4 py-3 font-semibold text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Intro />
        <Programs />
        <Space />
        <Membership />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <EnquiryDialog />
    </EnquiryProvider>
  )
}

export default function App() {
  const route = useRoute()
  return (
    <MotionConfig reducedMotion="user">
      <PortalProvider>
        {route === 'login' ? <Login /> : route === 'portal' ? <Portal /> : <Site />}
      </PortalProvider>
    </MotionConfig>
  )
}
