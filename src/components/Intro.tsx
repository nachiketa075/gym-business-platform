import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { brand } from '../config/site'
import { Picture } from './Picture'
import { ImageReveal } from './ImageReveal'
import { Reveal } from './Reveal'
import { SectionHead } from './SectionHead'

const pillars = [
  { t: 'The training', d: 'Programs built around progression, not novelty. Every session has a purpose and a coach who knows what it is.' },
  { t: 'The equipment', d: 'Weight training and cardio zones, a CrossFit area, a steam room, lockers and showers across a spacious 3,500 sq ft floor.' },
  { t: 'The coaching', d: 'Certified trainers who watch, correct and adjust. Beginners get clear instruction, experienced lifters get a second set of eyes.' },
]

export function Intro() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [28, -28])
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-18, 18])

  return (
    <section id="club" tabIndex={-1} data-nav-target className="section-y relative px-5 sm:px-8 lg:px-12">
      <div ref={ref} data-anchor className="mx-auto grid max-w-[105rem] gap-x-10 gap-y-[var(--space-head)] lg:grid-cols-12">
        <div className="relative self-start lg:col-span-5">
          <ImageReveal>
            <div className="group relative">
              <motion.div style={{ y }} className="-my-8">
                <Picture
                  name="club-main"
                  sizes="(min-width:1024px) 40vw, 100vw"
                  alt="Athlete in a white top lifting a loaded barbell overhead in front of a dark brick wall"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
              </motion.div>
            </div>
          </ImageReveal>
          <motion.div
            style={{ y: y2 }}
            className="rounded-media absolute -bottom-10 right-4 hidden w-[46%] border-[6px] border-ink sm:block lg:-right-16 lg:w-[50%]"
          >
            <Picture
              name="club-detail"
              sizes="(min-width:1024px) 20vw, 40vw"
              alt="Close-up of a hand gripping a heavy dumbbell on a rack"
              className="aspect-[3/2] w-full object-cover"
            />
          </motion.div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
          <SectionHead index="01" label="The club" lines={['Train with','intent']} />
          <Reveal delay={0.1} as="p" className="mt-8 max-w-xl text-lg leading-relaxed text-white/80">
            {brand.name} is a gym for people who want to get better at training. No clutter, no noise: a well-equipped floor,
            coaching that pays attention and a community that turns up.
          </Reveal>
          <ul className="mt-12 divide-y divide-line border-y border-line">
            {pillars.map((p, i) => (
              <Reveal as="li" key={p.t} delay={i * 0.08} className="grid gap-2 py-6 sm:grid-cols-[11rem_1fr] sm:gap-8">
                <h3 className="display text-3xl text-lime">{p.t}</h3>
                <p className="leading-relaxed text-mute">{p.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
