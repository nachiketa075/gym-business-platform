import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { nav } from '../config/site'
import { useEnquiry } from '../lib/enquiry'
import { navigate } from '../lib/route'
import { goTo, isModifiedClick } from '../lib/scroll'
import { Button } from './Button'
import { Logo } from './Logo'

export function Header() {
  const { open } = useEnquiry()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [active, setActive] = useState('')
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    // The active-section highlight is a nicety: never let a missing or broken observer take the page down.
    let io: IntersectionObserver | undefined
    try {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
        { rootMargin: '-45% 0px -50% 0px' },
      )
      nav.forEach((n) => {
        const el = document.getElementById(n.id)
        if (el) io?.observe(el)
      })
    } catch {
      /* no highlight, everything else works */
    }
    return () => io?.disconnect()
  }, [])

  // Menu: lock scroll, Esc to close, trap Tab inside the panel + toggle, move focus in.
  useEffect(() => {
    if (!menu) return
    document.documentElement.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('a,button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false)
        toggleRef.current?.focus()
      }
      if (e.key === 'Tab') {
        const items = [toggleRef.current, ...(panelRef.current?.querySelectorAll<HTMLElement>('a,button') ?? [])].filter(
          Boolean,
        ) as HTMLElement[]
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const onResize = () => window.innerWidth >= 1280 && setMenu(false)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.documentElement.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [menu])

  const closeMenu = () => {
    document.documentElement.style.overflow = '' // release the scroll lock now, so the scroll below is never fought by it
    setMenu(false)
  }

  /** In-page link. Modified clicks keep native behaviour; from the mobile menu, close it first and scroll on the next frame. */
  const link = (id: string) => (e: React.MouseEvent) => {
    if (isModifiedClick(e)) return
    e.preventDefault()
    if (menu) {
      closeMenu()
      requestAnimationFrame(() => goTo(id))
    } else {
      goTo(id)
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
        scrolled || menu ? 'border-b border-line bg-ink/95' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[105rem] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12">
        <a
          href="#top"
          onClick={link('top')}
          aria-label="FIT NATION, back to top"
        >
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-9 xl:flex">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={link(n.id)}
              aria-current={active === n.id ? 'true' : undefined}
              className={`relative inline-flex min-h-11 min-w-11 items-center justify-center text-sm font-medium uppercase tracking-[0.12em] transition-colors hover:text-lime ${
                active === n.id ? 'text-lime' : 'text-white/80'
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex min-h-11 items-center px-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/80 transition-colors hover:text-lime max-sm:hidden"
          >
            Log in
          </button>
          <Button className="!min-h-11 max-sm:hidden" onClick={() => open()}>
            Book a trial
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className="grid size-12 place-items-center transition-[scale] duration-200 active:scale-90 xl:hidden"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? 'Close menu' : 'Open menu'}
            onClick={() => setMenu((m) => !m)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menu ? 'close' : 'open'}
                initial={{ opacity: 0, rotate: menu ? -80 : 80 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: menu ? 80 : -80 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="grid"
              >
                {menu ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-ink px-5 pb-10 pt-6 sm:px-8 xl:hidden"
          >
            <nav aria-label="Mobile">
              <ul className="divide-y divide-line border-y border-line">
                {nav.map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={`#${n.id}`}
                      onClick={link(n.id)}
                      className="display flex min-h-16 items-center justify-between py-3 text-5xl hover:text-lime [@media(max-height:520px)]:min-h-12 [@media(max-height:520px)]:py-1 [@media(max-height:520px)]:text-3xl"
                    >
                      {n.label}
                      <span aria-hidden className="font-sans text-xs font-semibold tracking-widest text-mute">
                        0{i + 1}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + nav.length * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Button
                className="mt-8 w-full"
                onClick={() => {
                  closeMenu()
                  open()
                }}
              >
                Book a trial
              </Button>
              <button
                type="button"
                onClick={() => {
                  closeMenu()
                  navigate('/login')
                }}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center border border-white/40 text-sm font-semibold uppercase tracking-[0.12em] transition-[color,border-color,scale] duration-300 active:scale-[0.97] hover:border-lime hover:text-lime"
              >
                Log in
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
