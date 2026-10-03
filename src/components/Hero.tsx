import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useEnquiry } from '../lib/enquiry'
import { goTo } from '../lib/scroll'
import { Button } from './Button'
import { LineReveal } from './LineReveal'
import { Picture } from './Picture'

const ease = [0.16, 1, 0.3, 1] as const
const item = (i: number) => ({
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease },
})

const marks = ['Weight training', 'Cardio zone', 'CrossFit', 'Steam room']

export function Hero() {
  const { open } = useEnquiry()
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const parallax = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '9%'])
  return (
    <section ref={ref} id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#050505]">
      {/* Photograph: the source is near-black at its edges, so it dissolves into the page on the left. */}
      <motion.div
        aria-hidden={false}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease }}
        className="hero-photo absolute inset-x-0 bottom-[36%] top-[25%] -z-10 sm:bottom-[30%] lg:inset-y-0 lg:left-[22%] lg:right-0 lg:top-0"
        style={{
          y: parallax,
          maskImage: 'var(--hero-mask)',
          WebkitMaskImage: 'var(--hero-mask)',
        }}
      >
        <Picture
          name="hero"
          priority
          sizes="(min-width:1024px) 80vw, 100vw"
          alt="Athlete in a dark gym bent over a loaded barbell, hands on the bar, about to lift"
          className="size-full object-cover object-[50%_58%] lg:object-[50%_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />
      </motion.div>

      <div className="mx-auto mt-auto flex w-full max-w-[105rem] flex-1 flex-col justify-between px-5 pb-8 pt-28 sm:px-8 lg:px-12 lg:pt-32">
        <div>
          <motion.p {...item(0)} className="eyebrow">
            Malad East, Mumbai · Strength &amp; CrossFit
          </motion.p>
          <LineReveal
            as="h1"
            immediate
            delay={0.25}
            lines={['Build your', 'Next level']}
            lineClassNames={['', 'text-lime']}
            className="display hero-title mt-5"
          />
        </div>

        <div className="mt-10 flex flex-col gap-8 lg:mt-0 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <motion.p {...item(3)} className="text-base leading-relaxed text-white/85 sm:text-lg">
              Serious equipment, honest coaching and programs for every level. Come in, train properly and see what the
              next level looks like for you.
            </motion.p>
            <motion.div {...item(4)} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => open()}>Book a trial</Button>
              <Button variant="ghost" arrow={false} onClick={() => goTo('programs')}>
                Explore programs
              </Button>
            </motion.div>
          </div>

          <motion.div {...item(5)} className="hidden lg:block">
            <ul className="flex gap-8 border-t border-white/25 pt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              {marks.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => goTo('club')}
        aria-label="Scroll to the club introduction"
        className="absolute bottom-6 right-5 hidden size-12 place-items-center border border-white/30 transition-colors hover:border-lime hover:text-lime sm:grid lg:right-12"
        style={{ bottom: '5.5rem' }}
      >
        <ChevronDown aria-hidden className="size-5" />
      </button>
    </section>
  )
}
