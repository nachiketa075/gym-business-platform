import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, CircleAlert, Dumbbell, Eye, EyeOff, Info, ShieldCheck, UserRound } from 'lucide-react'
import { navigate } from '../lib/route'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { Picture } from '../components/Picture'
import { DEMO_ACCOUNTS, type Role } from './data'
import { usePortal } from './store'
import { field } from './ui'

const roles: { id: Role; icon: typeof UserRound; blurb: string }[] = [
  { id: 'client', icon: UserRound, blurb: 'See your membership, book classes, follow your trainer’s plan and track attendance.' },
  { id: 'trainer', icon: Dumbbell, blurb: 'See your clients and today’s sessions, mark attendance and write each client’s weekly plan.' },
  { id: 'owner', icon: ShieldCheck, blurb: 'Run the club: members, trainers, renewals, revenue and the gym fees shown on the website.' },
]

export function Login() {
  const { signIn } = usePortal()
  const uid = useId()
  const [role, setRole] = useState<Role>('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const acct = DEMO_ACCOUNTS[role]
  const current = roles.find((r) => r.id === role)!

  const pick = (r: Role) => {
    setRole(r)
    setErrors({})
  }
  const onKey = (e: KeyboardEvent) => {
    const i = roles.findIndex((r) => r.id === role)
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const n = (i + step + roles.length) % roles.length
    pick(roles[n].id)
    tabs.current[n]?.focus()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    const em = email.trim()
    if (!em) errs.email = 'Enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Enter your password.'
    if (!errs.email && !errs.password && (em.toLowerCase() !== acct.email || password !== acct.password)) {
      errs.form = `That email and password do not match the ${acct.label.toLowerCase()} demo account.`
    }
    setErrors(errs)
    if (errs.email) return document.getElementById(`${uid}-email`)?.focus()
    if (errs.password) return document.getElementById(`${uid}-password`)?.focus()
    if (errs.form) return
    signIn(role)
    navigate('/portal')
  }

  const fill = () => {
    setEmail(acct.email)
    setPassword(acct.password)
    setErrors({})
  }

  return (
    <div className="grid min-h-[100svh] lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block">
        <Picture
          name="hero"
          priority
          sizes="50vw"
          alt="Athlete in a dark gym bent over a loaded barbell"
          className="absolute inset-0 size-full object-cover object-[50%_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/50" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="eyebrow">Members and staff</p>
          <p className="display mt-3 text-[clamp(4rem,7vw,7rem)]">
            Welcome
            <br />
            <span className="text-lime">back</span>
          </p>
        </div>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/') }} aria-label="FIT NATION, back to the website">
            <Logo />
          </a>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.12em] text-white/80 transition-colors hover:text-lime"
          >
            <ArrowLeft aria-hidden className="size-4" /> <span className="max-[380px]:sr-only">Website</span>
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="display text-6xl sm:text-7xl">Log in</h1>

          <div role="tablist" aria-label="Log in as" onKeyDown={onKey} className="mt-8 grid grid-cols-3 border border-line p-1">
            {roles.map((r, i) => {
              const on = r.id === role
              const Icon = r.icon
              return (
                <button
                  key={r.id}
                  ref={(el) => {
                    tabs.current[i] = el
                  }}
                  role="tab"
                  id={`${uid}-tab-${r.id}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => pick(r.id)}
                  className="relative flex min-h-16 flex-col items-center justify-center gap-1 px-2 text-xs font-semibold uppercase tracking-[0.12em] sm:text-sm"
                >
                  {on && <motion.span layoutId="role-pill" className="absolute inset-0 bg-lime" transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />}
                  <Icon aria-hidden className={`relative size-5 ${on ? 'text-ink' : 'text-white/70'}`} />
                  <span className={`relative ${on ? 'text-ink' : 'text-white/80'}`}>{DEMO_ACCOUNTS[r.id].label}</span>
                </button>
              )
            })}
          </div>

          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${role}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={role}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-5 min-h-[3.5rem] leading-relaxed text-white/75"
              >
                {current.blurb}
              </motion.p>
            </AnimatePresence>

            <form onSubmit={submit} noValidate className="mt-4 space-y-5">
              {errors.form && (
                <p role="alert" className="flex items-start gap-2 border border-[#ff6b6b]/60 bg-[#ff6b6b]/10 p-3 text-sm text-[#ff9a9a]">
                  <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {errors.form}
                </p>
              )}
              <div>
                <label htmlFor={`${uid}-email`} className="text-sm font-medium">Email</label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined, form: undefined })) }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `${uid}-email-err` : undefined}
                  className={`${field} ${errors.email ? '!border-[#ff6b6b]' : ''}`}
                />
                {errors.email && <p id={`${uid}-email-err`} className="mt-2 text-sm text-[#ff8a8a]">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-password`} className="text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    id={`${uid}-password`}
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined, form: undefined })) }}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? `${uid}-password-err` : undefined}
                    className={`${field} pr-14 ${errors.password ? '!border-[#ff6b6b]' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    aria-pressed={show}
                    className="absolute right-1 top-2 grid size-12 place-items-center text-white/70 hover:text-lime"
                  >
                    {show ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
                  </button>
                </div>
                {errors.password && <p id={`${uid}-password-err`} className="mt-2 text-sm text-[#ff8a8a]">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full">Log in as {acct.label.toLowerCase()}</Button>
            </form>

            <div className="mt-8 border border-line p-4 text-sm">
              <p className="flex items-start gap-2 leading-relaxed text-white/80">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-lime" />
                Demo only. There is no backend: accounts are simulated and all data stays in this browser.
              </p>
              <dl className="mt-3 space-y-1 text-white/70">
                <div className="flex justify-between gap-4"><dt>Email</dt><dd className="select-all text-white">{acct.email}</dd></div>
                <div className="flex justify-between gap-4"><dt>Password</dt><dd className="select-all text-white">{acct.password}</dd></div>
              </dl>
              <button type="button" onClick={fill} className="mt-3 inline-flex min-h-11 items-center font-semibold uppercase tracking-[0.12em] text-lime hover:text-white">
                Fill demo login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
