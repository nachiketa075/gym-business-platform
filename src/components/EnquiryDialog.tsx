import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CircleAlert, Info, X } from 'lucide-react'
import { brand, durationLabel, durations, memberships, planId, planLabel, programs } from '../config/site'
import { useEnquiry } from '../lib/enquiry'
import { Button } from './Button'

interface Values {
  name: string
  contact: string
  program: string
  plan: string
  date: string
}
type Errors = Partial<Record<keyof Values, string>>

const todayISO = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

function validate(v: Values): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = 'Enter your full name (at least 2 characters).'
  const c = v.contact.trim()
  const digits = c.replace(/[\s()+-]/g, '')
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)
  const isPhone = /^\d{10,13}$/.test(digits)
  if (!c) e.contact = 'Enter an email address or phone number.'
  else if (!isEmail && !isPhone) e.contact = 'Enter a valid email (name@example.com) or a 10-digit phone number.'
  if (!v.program) e.program = 'Choose a program, or "Not sure yet".'
  if (!v.date) e.date = 'Pick a preferred date.'
  else if (v.date < todayISO()) e.date = 'Choose today or a future date.'
  return e
}

const field =
  'mt-2 block min-h-12 w-full border bg-ink-2 px-4 text-base text-white placeholder:text-white/35 transition-colors focus:border-lime focus:outline-none focus-visible:outline-none'

export function EnquiryDialog() {
  const { isOpen, preset, close } = useEnquiry()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (isOpen && !d.open) {
      d.showModal()
      document.documentElement.style.overflow = 'hidden'
    }
    if (!isOpen && d.open) d.close()
    if (!isOpen) document.documentElement.style.overflow = ''
  }, [isOpen])

  return (
    <dialog
      ref={ref}
      aria-labelledby="enquiry-title"
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      onClick={(e) => {
        if (e.target === ref.current) close()
      }}
      className="m-auto max-h-[100dvh] w-full max-w-xl overflow-y-auto border border-line bg-ink p-0 text-white backdrop:bg-black/80 max-sm:m-0 max-sm:h-[100dvh] max-sm:max-w-none"
    >
      <AnimatePresence>{isOpen && <EnquiryForm key="form" preset={preset} onClose={close} />}</AnimatePresence>
    </dialog>
  )
}

function EnquiryForm({ preset, onClose }: { preset: { program?: string; plan?: string }; onClose: () => void }) {
  const uid = useId()
  const [values, setValues] = useState<Values>({
    name: '',
    contact: '',
    program: preset.program ?? '',
    plan: preset.plan ?? '',
    date: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<Values | null>(null)
  const firstRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof Values, val: string) => {
    setValues((p) => ({ ...p, [k]: val }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    const firstBad = (Object.keys(errs) as (keyof Values)[])[0]
    if (firstBad) {
      document.getElementById(`${uid}-${firstBad}`)?.focus()
      return
    }
    setDone(values)
  }

  const err = (k: keyof Values) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${uid}-${k}-err` } : {})
  const border = (k: keyof Values) => (errors[k] ? 'border-[#ff6b6b]' : 'border-line')
  const Err = ({ k }: { k: keyof Values }) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="mt-2 flex items-start gap-2 text-sm text-[#ff8a8a]">
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        {errors[k]}
      </p>
    ) : null

  const programName = (id: string) => (id === 'unsure' ? 'Not sure yet' : programs.find((p) => p.id === id)?.name ?? '')
  const planName = planLabel

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative p-6 sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close enquiry dialog"
        className="absolute right-3 top-3 grid size-12 place-items-center text-white/70 transition-colors hover:text-lime sm:right-5 sm:top-5"
      >
        <X aria-hidden className="size-6" />
      </button>

      {done ? (
        <div role="status" aria-live="polite">
          <p className="eyebrow">Preview only</p>
          <h2 id="enquiry-title" className="display mt-4 text-5xl sm:text-6xl">
            Nothing was sent
          </h2>
          <div className="mt-6 flex gap-3 border border-lime/50 bg-lime/10 p-4 text-sm leading-relaxed">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-lime" />
            <p>
              This is a frontend preview. No enquiry was sent and nothing was saved, because the site is not connected to a
              backend yet. Once it is, this form will reach the {brand.name} team.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
            {[
              ['Name', done.name.trim()],
              ['Contact', done.contact.trim()],
              ['Program', programName(done.program)],
              ...(done.plan ? [['Plan', planName(done.plan) ?? '']] : []),
              ['Preferred date', done.date],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <dt className="text-mute">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <Button className="mt-8 w-full sm:w-auto" onClick={onClose} arrow={false}>
            Close preview
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <p className="eyebrow">Book a trial</p>
          <h2 id="enquiry-title" className="display mt-4 pr-10 text-5xl sm:text-6xl">
            Start with a<br />trial session
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-mute">
            Tell us a little about you. This is a design preview, so submitting will not send anything.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor={`${uid}-name`} className="text-sm font-medium">
                Full name
              </label>
              <input
                ref={firstRef}
                id={`${uid}-name`}
                autoFocus
                autoComplete="name"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                className={`${field} ${border('name')}`}
                {...err('name')}
              />
              <Err k="name" />
            </div>
            <div>
              <label htmlFor={`${uid}-contact`} className="text-sm font-medium">
                Email or phone
              </label>
              <input
                id={`${uid}-contact`}
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com or 98765 43210"
                value={values.contact}
                onChange={(e) => set('contact', e.target.value)}
                className={`${field} ${border('contact')}`}
                {...err('contact')}
              />
              <Err k="contact" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-program`} className="text-sm font-medium">
                  Preferred program
                </label>
                <select
                  id={`${uid}-program`}
                  value={values.program}
                  onChange={(e) => set('program', e.target.value)}
                  className={`${field} ${border('program')}`}
                  {...err('program')}
                >
                  <option value="">Select a program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  <option value="unsure">Not sure yet</option>
                </select>
                <Err k="program" />
              </div>
              <div>
                <label htmlFor={`${uid}-date`} className="text-sm font-medium">
                  Preferred date
                </label>
                <input
                  id={`${uid}-date`}
                  type="date"
                  min={todayISO()}
                  value={values.date}
                  onChange={(e) => set('date', e.target.value)}
                  className={`${field} ${border('date')} [color-scheme:dark]`}
                  {...err('date')}
                />
                <Err k="date" />
              </div>
            </div>
            <div>
              <label htmlFor={`${uid}-plan`} className="text-sm font-medium">
                Membership plan <span className="font-normal text-mute">(optional)</span>
              </label>
              <select
                id={`${uid}-plan`}
                value={values.plan}
                onChange={(e) => set('plan', e.target.value)}
                className={`${field} border-line`}
              >
                <option value="">No plan selected</option>
                {memberships.map((m) => (
                  <optgroup key={m.id} label={m.name}>
                    {durations.map((d) => (
                      <option key={d} value={planId(m, d)}>
                        {m.name}, {durationLabel(d)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" className="mt-8 w-full">
            Preview enquiry
          </Button>
        </form>
      )}
    </motion.div>
  )
}
