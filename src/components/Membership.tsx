import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { durationLabel, durations, formatINR, planId, priceFor, type MembershipId } from '../config/site'
import { useMemberships } from '../lib/pricing'
import { useEnquiry } from '../lib/enquiry'
import { Button } from './Button'
import { Reveal } from './Reveal'
import { SectionHead } from './SectionHead'

const ease = [0.16, 1, 0.3, 1] as const

export function Membership() {
  const { open } = useEnquiry()
  const memberships = useMemberships()
  const [cat, setCat] = useState<MembershipId>('gym')
  const m = memberships.find((x) => x.id === cat)!

  // The term with the lowest monthly cost is the best value, whatever the sample prices are.
  const best = durations.reduce((a, b) => (priceFor(m, b).perMonth < priceFor(m, a).perMonth ? b : a))

  return (
    <section id="membership" className="bg-ink-2 px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-[105rem]">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
          <SectionHead index="04" label="Membership" lines={['Choose how', 'you train']} />
          <Reveal delay={0.1}>
            <div role="group" aria-label="Membership type" className="inline-flex w-full border border-line p-1 sm:w-auto">
              {memberships.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={cat === x.id}
                  onClick={() => setCat(x.id)}
                  className="relative min-h-12 flex-1 px-4 text-sm font-semibold uppercase tracking-[0.12em] sm:flex-none sm:px-7"
                >
                  {cat === x.id && (
                    <motion.span layoutId="cat-pill" className="absolute inset-0 bg-lime" transition={{ duration: 0.35, ease }} />
                  )}
                  <span className={`relative transition-colors ${cat === x.id ? 'text-ink' : 'text-white/80'}`}>{x.name}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 xl:grid-cols-12 xl:gap-12">
          <div className="xl:col-span-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease }}
              >
                <h3 className="display text-5xl sm:text-6xl">{m.name}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-white/75">{m.blurb}</p>
                <ul className="mt-8 space-y-3 border-t border-line pt-6">
                  {m.features.map((f) => (
                    <li key={f} className="flex gap-3 leading-relaxed text-white/85">
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-lime" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="xl:col-span-8">
            <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
              {durations.map((d, n) => {
                const price = priceFor(m, d)
                const isBest = d === best
                return (
                  <Reveal
                    key={d}
                    delay={n * 0.07}
                    className={`flex flex-col p-7 sm:p-8 ${isBest ? 'on-lime bg-lime text-ink' : 'bg-ink'}`}
                  >
                    <div className="flex min-h-7 items-center justify-between gap-2">
                      <h4 className="display text-4xl">{durationLabel(d)}</h4>
                    </div>
                    <div className="h-9 pt-2">
                      {isBest && (
                        <span className="inline-block bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-widest text-lime">
                          Best value
                        </span>
                      )}
                    </div>

                    <div className="mt-6 border-y py-6" style={{ borderColor: isBest ? 'rgb(10 10 10 / 0.25)' : '#2a2a2a' }}>
                      <div className="relative h-16 overflow-hidden" aria-live="polite">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={`${m.id}-${d}`}
                            initial={{ y: '60%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '-60%', opacity: 0 }}
                            transition={{ duration: 0.35, ease }}
                            className="display block text-5xl leading-[4rem] sm:text-6xl"
                          >
                            {formatINR(price.total)}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <p className={`text-sm ${isBest ? 'text-ink/75' : 'text-mute'}`}>
                        {d === 1 ? 'for 1 month' : `for ${d} months`}
                      </p>
                    </div>

                    <div className={`mt-5 flex-1 space-y-1 text-sm ${isBest ? 'text-ink/85' : 'text-white/75'}`}>
                      <p className="font-semibold">
                        {d === 1 ? 'Pay month to month' : `${formatINR(price.perMonth)} per month`}
                      </p>
                      {price.saving > 0 && (
                        <p className={isBest ? 'text-ink/75' : 'text-mute'}>Save {formatINR(price.saving)} vs. paying monthly</p>
                      )}
                    </div>

                    <Button
                      variant={isBest ? 'dark' : 'ghost'}
                      className="mt-8 w-full"
                      onClick={() => open({ plan: planId(m, d) })}
                      aria-label={`Enquire about ${m.name}, ${durationLabel(d)}`}
                    >
                      Choose
                    </Button>
                  </Reveal>
                )
              })}
            </div>
            <p className="mt-6 text-sm text-mute">
              Prices in INR. Gym membership and personal training are separate options. Personal training prices are
              placeholders until confirmed by the club.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
