import { motion, MotionConfig } from 'motion/react'
import { EnquiryProvider } from './lib/enquiry'
import { useEffect } from 'react'
import { useRoute } from './lib/route'
import { useScrollReveals } from './lib/reveal'
import { followHash, navTo } from './lib/scroll'
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
  useScrollReveals()
  // Direct section URLs (/#membership), links opened in a new tab, arriving from another route, Back/Forward and edited hashes.
  useEffect(() => {
    let touched = false
    const inputs = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const
    const markTouched = () => {
      touched = true
    }
    inputs.forEach((t) => window.addEventListener(t, markTouched, { passive: true, once: true }))

    const arrivedOnSection = followHash(false)
    // Fonts and media may still be settling on a fresh load: re-aim once, unless the visitor has already taken over.
    const onLoad = () => {
      if (arrivedOnSection && !touched) followHash(false)
    }
    if (document.readyState !== 'complete') window.addEventListener('load', onLoad, { once: true })
    const onHash = () => {
      followHash(true)
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      inputs.forEach((t) => window.removeEventListener(t, markTouched))
      window.removeEventListener('load', onLoad)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  return (
    <EnquiryProvider>
      <a
        href="#club"
        onClick={navTo('club')}
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
        {/* Brief crossfade on arrival. Opacity only (a transform here would break the fixed header) and no exit,
            so navigation is never delayed and browser history is untouched. */}
        <motion.div key={route} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
          {route === 'login' ? <Login /> : route === 'portal' ? <Portal /> : <Site />}
        </motion.div>
      </PortalProvider>
    </MotionConfig>
  )
}
