import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Picture } from './Picture'
import { videos } from '../config/site'
import { Reveal } from './Reveal'
import { AmbientVideo } from './AmbientVideo'
import { ImageReveal } from './ImageReveal'
import { SectionHead } from './SectionHead'

const facilities = [
  { t: 'Weight training', d: 'Racks, benches and free weights with space to move.' },
  { t: 'Cardio zone', d: 'Treadmills and machines for warm-ups and endurance.' },
  { t: 'CrossFit area', d: 'Ropes, sleds and room for interval work.' },
  { t: 'Steam room', d: 'Wind down and recover after your session.' },
  { t: 'Lockers and showers', d: 'Secure lockers and showers before and after.' },
]

export function Space() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%'])

  return (
    <section id="space" tabIndex={-1} data-nav-target className="px-0 py-24 sm:py-32 lg:py-40">
      <div data-anchor className="mx-auto max-w-[105rem] px-5 sm:px-8 lg:px-12">
        <SectionHead index="03" label="The training space" lines={['Room to','work']} />
      </div>

      <div ref={ref} className="relative mt-14 overflow-hidden lg:mt-20">
        <motion.div style={{ y }} className="-my-[8%]">
          <Picture
            name="space-main"
            sizes="100vw"
            alt="Wide view of a dark industrial gym with dumbbell racks, benches and a red ceiling duct"
            className="aspect-[4/3] w-full object-cover object-[50%_65%] sm:aspect-[16/9] lg:aspect-[2/1]"
          />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20 lg:via-ink/50" />

        <div className="absolute inset-x-0 bottom-0 mx-auto hidden max-w-[105rem] px-5 pb-10 sm:px-8 xl:block lg:px-12">
          <ul className="grid grid-cols-5 gap-6 border-t border-white/30 pt-5">
            {facilities.map((f, i) => (
              <Reveal as="li" key={f.t} delay={i * 0.06}>
                <h3 className="display text-2xl text-lime">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{f.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      <ul className="mx-auto mt-2 grid max-w-[105rem] divide-y divide-line border-y border-line px-5 sm:px-8 xl:hidden">
        {facilities.map((f) => (
          <li key={f.t} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8">
            <h3 className="display text-3xl text-lime">{f.t}</h3>
            <p className="text-mute">{f.d}</p>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-6 grid max-w-[105rem] gap-6 px-5 sm:px-8 md:grid-cols-12 md:items-stretch lg:mt-10 lg:px-12">
        <ImageReveal className="group md:col-span-7 md:h-full">
          <Picture
            name="space-floor"
            sizes="(min-width:768px) 58vw, 100vw"
            alt="Long empty gym floor with treadmills and a timber training area under low lighting"
            className="aspect-[16/10] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04] md:aspect-auto md:h-full"
          />
        </ImageReveal>
        <ImageReveal delay={0.12} className="group md:col-span-5 md:h-full">
          <Picture
            name="space-rack"
            sizes="(min-width:768px) 42vw, 100vw"
            alt="Rows of dumbbells on a rack receding into the distance"
            className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04] md:aspect-auto md:h-full"
          />
        </ImageReveal>
      </div>

      <div className="relative mx-auto mt-6 max-w-[105rem] overflow-hidden px-5 sm:px-8 lg:mt-10 lg:px-12">
        <ImageReveal className="relative">
          <AmbientVideo
            src={videos.ropes.src}
            poster={videos.ropes.poster}
            label="CrossFit floor video"
            className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:aspect-[21/9]"
            controlClassName="bottom-4 right-4"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
          <div className="pointer-events-none absolute bottom-0 left-0 p-5 sm:p-8">
            <p className="eyebrow">CrossFit floor</p>
            <p className="display mt-2 text-4xl sm:text-6xl">Ropes, sleds,<br />intervals</p>
          </div>
        </ImageReveal>
      </div>
    </section>
  )
}
