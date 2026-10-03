import { ArrowUp } from 'lucide-react'
import { brand, contact, mapUrl, nav, videos } from '../config/site'
import { useEnquiry } from '../lib/enquiry'
import { navigate } from '../lib/route'
import { navTo } from '../lib/scroll'
import { Button } from './Button'
import { AmbientVideo } from './AmbientVideo'
import { LineReveal } from './LineReveal'
import { Reveal } from './Reveal'

export function FinalCta() {
  const { open } = useEnquiry()
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden px-5 py-28 sm:px-8 sm:py-40 lg:px-12 lg:py-56">
      <div className="cta-media absolute inset-y-0 right-0 -z-10 w-full lg:w-[75%]">
        <AmbientVideo
          src={videos.press.src}
          poster={videos.press.poster}
          label="gym training video"
          className="size-full object-cover"
          controlClassName="bottom-5 right-5 sm:bottom-8 sm:right-8 lg:right-12"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink/55 lg:bg-ink/20" />
      </div>
      <div className="mx-auto max-w-[105rem]">
        <Reveal>
          <p className="eyebrow">Your first session</p>
        </Reveal>
        <LineReveal
          id="cta-title"
          lines={['Ready when', 'you are']}
          lineClassNames={['', 'text-lime']}
          delay={0.08}
          className="display mt-6 text-[clamp(4rem,12vw,11rem)]"
        />
        <Reveal delay={0.16} className="mt-8 max-w-lg">
          <p className="text-lg leading-relaxed text-white/85">
            Book a trial, meet the coaches and train in the space. No pressure, just a proper first look.
          </p>
          <Button className="mt-8 w-full sm:w-auto" onClick={() => open()}>
            Book a trial
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

export function Footer() {
  const { open } = useEnquiry()
  const value = (text: string, href: string) => (
    <a href={href} className="inline-flex min-h-11 items-center transition-colors hover:text-lime">
      {text}
    </a>
  )

  return (
    <footer className="border-t border-line bg-ink px-5 pb-8 pt-16 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[105rem] gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <img src="/brand/fitnation-logo.png" width={560} height={433} alt={brand.name} loading="lazy" className="h-auto w-40 sm:w-48" />
          <p className="mt-5 max-w-xs leading-relaxed text-mute">{brand.tagline}. Weight training, cardio, CrossFit, steam room and personal training in {contact.area}.</p>
          <Button variant="ghost" className="mt-6" onClick={() => open()}>
            Book a trial
          </Button>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="eyebrow">Explore</h2>
          <ul className="mt-5 space-y-1">
            {nav.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={navTo(n.id)}
                  className="inline-flex min-h-11 min-w-11 items-center text-white/80 transition-colors hover:text-lime"
                >
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex min-h-11 items-center text-white/80 transition-colors hover:text-lime"
              >
                Client, trainer and owner log in
              </button>
            </li>
          </ul>
        </nav>

        <div id="contact" tabIndex={-1} data-nav-target className="md:col-span-4">
          <h2 className="eyebrow">Contact</h2>
          <address className="mt-4 space-y-1 not-italic text-white/80">
            {contact.phones.map((p) => (
              <p key={p.tel}>{value(p.display, `tel:${p.tel}`)}</p>
            ))}
            <p>
              {value(contact.email, `mailto:${contact.email}`)}
              {contact.emailIsDemo && <span className="ml-2 border border-white/30 px-1.5 py-0.5 align-middle text-xs uppercase tracking-widest text-white/60">Demo</span>}
            </p>
            <p className="pt-2 leading-relaxed">{contact.address}</p>
            <p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 font-semibold uppercase tracking-[0.12em] text-lime transition-colors hover:text-white"
              >
                Get directions<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </address>
          <dl className="mt-6 space-y-1 text-sm">
            {contact.hours.map((h) => (
              <div key={h.label} className="flex justify-between gap-4 border-b border-line py-2">
                <dt className="text-mute">{h.label}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
            <p className="pt-2 text-mute">{contact.hoursNote}</p>
          </dl>
          {contact.social.length > 0 && (
            <ul className="mt-6 flex gap-5">
              {contact.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="hover:text-lime" rel="noopener noreferrer" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[105rem] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-6 text-sm text-mute">
        <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
        <a
          href="#top"
          onClick={navTo('top')}
          className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap uppercase tracking-widest transition-colors hover:text-lime"
        >
          Back to top <ArrowUp aria-hidden className="size-4" />
        </a>
      </div>
    </footer>
  )
}
