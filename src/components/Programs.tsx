import { useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { programs } from '../config/site'
import { useEnquiry } from '../lib/enquiry'
import { Button } from './Button'
import { Picture } from './Picture'
import { SectionHead } from './SectionHead'
import { Reveal } from './Reveal'

export function Programs() {
  const { open } = useEnquiry()
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const p = programs[i]

  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    let next = i
    if (e.key in keys) next = (i + keys[e.key] + programs.length) % programs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = programs.length - 1
    else return
    e.preventDefault()
    setI(next)
    tabs.current[next]?.focus()
  }

  return (
    <section id="programs" tabIndex={-1} data-nav-target className="bg-ink-2 px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
      <div data-anchor className="mx-auto max-w-[105rem]">
        <SectionHead index="02" label="Training programs" lines={['Pick your','discipline']} lineClassNames={['','text-lime']} />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          <Reveal className="self-start lg:sticky lg:top-28 lg:col-span-5">
            <div role="tablist" aria-label="Training programs" aria-orientation="vertical" onKeyDown={onKey} className="border-y border-line">
              {programs.map((pr, n) => {
                const on = n === i
                return (
                  <button
                    key={pr.id}
                    ref={(el) => {
                      tabs.current[n] = el
                    }}
                    role="tab"
                    id={`tab-${pr.id}`}
                    aria-selected={on}
                    aria-controls="program-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => setI(n)}
                    className={`group relative flex min-h-20 w-full items-center justify-between gap-4 border-b border-line px-1 py-4 text-left transition-colors last:border-b-0 sm:px-3 ${
                      on ? 'text-lime' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {on && (
                      <motion.span layoutId="prog-bar" className="absolute inset-y-0 left-0 w-1 bg-lime" transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
                    )}
                    <span className="flex items-baseline gap-4 pl-3">
                      <span className="font-sans text-xs font-semibold tracking-widest">0{n + 1}</span>
                      <span className="display text-4xl sm:text-5xl">{pr.name}</span>
                    </span>
                    <ArrowRight aria-hidden className={`size-5 shrink-0 transition-transform duration-300 ${on ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                  </button>
                )
              })}
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={p.id}
                role="tabpanel"
                id="program-panel"
                aria-labelledby={`tab-${p.id}`}
                tabIndex={0}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="group relative overflow-hidden"
                  initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: 'inset(0 0% 0 0)' }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
                >
                  <Picture
                    name={p.image}
                    alt={p.imageAlt}
                    sizes="(min-width:1024px) 58vw, 100vw"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03] sm:aspect-[16/10]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <p className="eyebrow absolute bottom-4 left-4 !text-white sm:bottom-6 sm:left-6">{p.kicker}</p>
                </motion.div>

                <div className="mt-8 grid gap-8 md:grid-cols-[1.3fr_1fr]">
                  <p className="text-lg leading-relaxed text-white/85">{p.description}</p>
                  <ul className="space-y-2 border-l border-lime/60 pl-5 text-sm text-white/80">
                    {p.focus.map((f, n) => (
                      <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + n * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {f}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <dl className="mt-8 grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  {p.details.map((d) => (
                    <div key={d.label} className="py-4 sm:px-5 sm:first:pl-0">
                      <dt className="eyebrow !text-mute">{d.label}</dt>
                      <dd className="mt-1 font-display text-2xl font-bold uppercase">{d.value}</dd>
                    </div>
                  ))}
                </dl>

                <Button className="mt-8 w-full sm:w-auto" onClick={() => open({ program: p.id })}>
                  Trial {p.name}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
