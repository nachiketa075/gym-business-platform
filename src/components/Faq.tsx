import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Plus } from 'lucide-react'
import { faqs } from '../config/site'
import { SectionHead } from './SectionHead'
import { Reveal } from './Reveal'

export function Faq() {
  const uid = useId()
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const reduce = useReducedMotion()

  return (
    <section id="faq" tabIndex={-1} data-nav-target className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
      <div data-anchor className="mx-auto grid max-w-[105rem] gap-14 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <SectionHead index="05" label="FAQ" lines={['Good','questions']} />
        </div>
        <Reveal delay={0.1} className="xl:col-span-7">
          <div className="border-t border-line">
            {faqs.map((f, i) => {
              const on = openIdx === i
              return (
                <div key={f.q} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      id={`${uid}-b${i}`}
                      aria-expanded={on}
                      aria-controls={`${uid}-p${i}`}
                      onClick={() => setOpenIdx(on ? null : i)}
                      className="flex min-h-20 w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-lime"
                    >
                      <span className="display text-3xl sm:text-4xl">{f.q}</span>
                      <span className="grid size-10 shrink-0 place-items-center border border-line">
                        <motion.span animate={{ rotate: on ? 45 : 0 }} transition={{ duration: reduce ? 0 : 0.3 }} className="grid">
                          <Plus aria-hidden className={`size-5 ${on ? 'text-lime' : ''}`} />
                        </motion.span>
                      </span>
                    </button>
                  </h3>
                  <motion.div
                    id={`${uid}-p${i}`}
                    role="region"
                    aria-labelledby={`${uid}-b${i}`}
                    initial={false}
                    animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                    // Collapsed panels stay out of the tab order and accessibility tree.
                    {...(!on && { inert: true })}
                  >
                    <p className="max-w-2xl pb-6 leading-relaxed text-white/75">{f.a}</p>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
