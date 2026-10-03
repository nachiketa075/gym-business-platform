import { useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '../components/Button'
import { durationLabel, durations, formatINR, type Duration, type MembershipId } from '../config/site'
import { navigate } from '../lib/route'
import { hasOverrides, setPriceOverrides, useMemberships } from '../lib/pricing'
import { addDays, endDate, fmtDate, statusOf, todayISO, type Member, type Status } from './data'
import { usePortal } from './store'
import { Block, Empty, field, Stat, Stats, StatusChip } from './ui'

type Filter = 'all' | Status | 'renewal'

export function OwnerView() {
  const { data, dispatch } = usePortal()
  const live = useMemberships()
  const today = todayISO()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [adding, setAdding] = useState(false)

  const statuses = data.members.map((m) => ({ m, s: statusOf(m) }))
  const active = statuses.filter((x) => x.s !== 'expired').length
  const expiring = statuses.filter((x) => x.s === 'expiring').length
  const renewals = data.members.filter((m) => m.renewalRequested).length
  const since = addDays(today, -30)
  const recent = data.payments.filter((p) => p.date >= since)
  const revenue = recent.reduce((a, p) => a + p.amount, 0)

  const rows = statuses
    .filter(({ m, s }) => (filter === 'all' ? true : filter === 'renewal' ? m.renewalRequested : s === filter))
    .filter(({ m }) => (m.name + m.email).toLowerCase().includes(q.trim().toLowerCase()))

  const planName = (m: Member) => `${live.find((x) => x.id === m.membership)?.name ?? ''}, ${durationLabel(m.months)}`

  return (
    <>
      <div>
        <p className="eyebrow">Owner</p>
        <h1 className="display mt-3 text-6xl sm:text-8xl">Club overview</h1>
      </div>

      <Stats>
        <Stat label="Active members" value={active} hint={`${data.members.length} on record`} />
        <Stat label="Expiring in 7 days" value={expiring} />
        <Stat label="Renewal requests" value={renewals} />
        <Stat label="Revenue, last 30 days" value={<span className="text-4xl sm:text-5xl">{formatINR(revenue)}</span>} hint={`${recent.length} payment${recent.length === 1 ? '' : 's'}`} />
      </Stats>

      <Block
        title="Members"
        kicker="Manage"
        action={
          <Button variant={adding ? 'ghost' : 'lime'} arrow={false} onClick={() => setAdding((a) => !a)} aria-expanded={adding}>
            <Plus aria-hidden className="size-4" /> {adding ? 'Close form' : 'Add member'}
          </Button>
        }
      >
        {adding && <AddMember onDone={() => setAdding(false)} />}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="member-search" className="sr-only">Search members</label>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mute" />
            <input id="member-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className={`${field} !mt-0 pl-11`} />
          </div>
          <div>
            <label htmlFor="member-filter" className="sr-only">Filter members</label>
            <select id="member-filter" value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className={`${field} !mt-0 sm:w-56`}>
              <option value="all">All members</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring soon</option>
              <option value="expired">Expired</option>
              <option value="renewal">Renewal requested</option>
            </select>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-6"><Empty>No members match this search and filter.</Empty></div>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line" aria-label="Members">
            {rows.map(({ m, s }) => (
              <li key={m.id} className="grid gap-4 py-5 xl:grid-cols-[1.4fr_1.2fr_1fr_1fr_1fr] xl:items-center">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-mute">{m.email}</p>
                  {m.renewalRequested && <p className="eyebrow mt-1">Renewal requested</p>}
                </div>
                <div>
                  <p>{planName(m)}</p>
                  <p className="text-sm text-mute">until {fmtDate(endDate(m))}</p>
                </div>
                <div><StatusChip status={s} /></div>
                <div>
                  <label htmlFor={`tr-${m.id}`} className="eyebrow !text-mute xl:sr-only">Trainer</label>
                  <select
                    id={`tr-${m.id}`}
                    value={m.trainerId ?? ''}
                    onChange={(e) => dispatch({ type: 'assignTrainer', memberId: m.id, trainerId: e.target.value || null })}
                    className={`${field} !mt-1 xl:!mt-0`}
                  >
                    <option value="">No trainer</option>
                    {data.trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor={`ext-${m.id}`} className="eyebrow !text-mute xl:sr-only">Extend</label>
                  <select
                    id={`ext-${m.id}`}
                    value=""
                    onChange={(e) => e.target.value && dispatch({ type: 'extend', memberId: m.id, months: Number(e.target.value) as Duration })}
                    className={`${field} !mt-1 xl:!mt-0`}
                  >
                    <option value="">Extend membership…</option>
                    {durations.map((d) => <option key={d} value={d}>+ {durationLabel(d)}</option>)}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="Trainers" kicker="Team">
        <ul className="divide-y divide-line border-y border-line">
          {data.trainers.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-mute">{t.specialty}</p>
              </div>
              <p className="text-white/80">
                {data.members.filter((m) => m.trainerId === t.id).length} clients · {data.sessions.filter((s) => s.trainerId === t.id).length} sessions / week
              </p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Recent payments" kicker="Revenue">
        <ul className="divide-y divide-line border-y border-line">
          {[...data.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{data.members.find((m) => m.id === p.memberId)?.name}</p>
                <p className="text-sm text-mute">{p.label} · {fmtDate(p.date)}</p>
              </div>
              <p className="display text-3xl">{formatINR(p.amount)}</p>
            </li>
          ))}
        </ul>
      </Block>

      <FeeEditor />
    </>
  )
}

function AddMember({ onDone }: { onDone: () => void }) {
  const { data, dispatch } = usePortal()
  const live = useMemberships()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [membership, setMembership] = useState<MembershipId>('gym')
  const [months, setMonths] = useState<Duration>(1)
  const [trainerId, setTrainerId] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (name.trim().length < 2) errs.name = 'Enter the member’s full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = 'Enter a valid email address.'
    setErrors(errs)
    if (errs.name || errs.email) return
    const amount = live.find((x) => x.id === membership)!.prices[months]
    dispatch({
      type: 'addMember',
      amount,
      member: {
        id: `m${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: '',
        membership,
        months,
        start: todayISO(),
        trainerId: trainerId || null,
        goal: 'Not set yet',
        plan: { Mon: 'Rest', Tue: 'Rest', Wed: 'Rest', Thu: 'Rest', Fri: 'Rest', Sat: 'Rest', Sun: 'Rest' },
        attendance: [],
        renewalRequested: false,
      },
    })
    onDone()
  }

  return (
    <form onSubmit={submit} noValidate className="mb-8 grid gap-5 border border-line p-5 sm:grid-cols-2 sm:p-6">
      <div>
        <label htmlFor="am-name" className="text-sm font-medium">Full name</label>
        <input id="am-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} className={`${field} ${errors.name ? '!border-[#ff6b6b]' : ''}`} />
        {errors.name && <p className="mt-2 text-sm text-[#ff8a8a]">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="am-email" className="text-sm font-medium">Email</label>
        <input id="am-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} className={`${field} ${errors.email ? '!border-[#ff6b6b]' : ''}`} />
        {errors.email && <p className="mt-2 text-sm text-[#ff8a8a]">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="am-type" className="text-sm font-medium">Membership</label>
        <select id="am-type" value={membership} onChange={(e) => setMembership(e.target.value as MembershipId)} className={field}>
          {live.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="am-term" className="text-sm font-medium">Term</label>
        <select id="am-term" value={months} onChange={(e) => setMonths(Number(e.target.value) as Duration)} className={field}>
          {durations.map((d) => (
            <option key={d} value={d}>{durationLabel(d)} · {formatINR(live.find((m) => m.id === membership)!.prices[d])}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="am-trainer" className="text-sm font-medium">Trainer <span className="font-normal text-mute">(optional)</span></label>
        <select id="am-trainer" value={trainerId} onChange={(e) => setTrainerId(e.target.value)} className={field}>
          <option value="">No trainer yet</option>
          {data.trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" arrow={false}>Add member and record payment</Button>
      </div>
    </form>
  )
}

function FeeEditor() {
  const live = useMemberships()
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const key = (id: string, d: number) => `${id}-${d}`
  const val = (id: string, d: Duration) => draft[key(id, d)] ?? String(live.find((m) => m.id === id)!.prices[d])

  const save = (e: FormEvent) => {
    e.preventDefault()
    const ov: Partial<Record<MembershipId, Partial<Record<Duration, number>>>> = {}
    for (const m of live) {
      for (const d of durations) {
        const n = Number(val(m.id, d))
        if (!Number.isInteger(n) || n <= 0) {
          setErr(`${m.name}, ${durationLabel(d)}: enter a whole number above zero.`)
          setMsg('')
          return
        }
        ;(ov[m.id] ??= {})[d] = n
      }
    }
    setPriceOverrides(ov)
    setDraft({})
    setErr('')
    setMsg('Saved. The Membership section on the website now shows these fees (this browser only).')
  }

  return (
    <Block title="Membership fees" kicker="Shown on the website">
      <form onSubmit={save} noValidate className="space-y-8">
        {live.map((m) => (
          <fieldset key={m.id} className="border-t border-line pt-5">
            <legend className="display pr-4 text-3xl text-lime">{m.name}</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {durations.map((d) => (
                <div key={d}>
                  <label htmlFor={`fee-${m.id}-${d}`} className="text-sm font-medium">{durationLabel(d)} (₹)</label>
                  <input
                    id={`fee-${m.id}-${d}`}
                    inputMode="numeric"
                    value={val(m.id, d)}
                    onChange={(e) => {
                      setDraft({ ...draft, [key(m.id, d)]: e.target.value.replace(/[^\d]/g, '') })
                      setMsg('')
                    }}
                    className={field}
                  />
                </div>
              ))}
            </div>
          </fieldset>
        ))}
        {err && <p role="alert" className="text-sm text-[#ff8a8a]">{err}</p>}
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" arrow={false}>Save fees</Button>
          <Button variant="ghost" arrow={false} onClick={() => { setPriceOverrides(null); setDraft({}); setErr(''); setMsg('Fees reset to the defaults.') }} disabled={!hasOverrides() && Object.keys(draft).length === 0}>
            Reset to defaults
          </Button>
          <button type="button" onClick={() => { navigate('/'); setTimeout(() => document.getElementById('membership')?.scrollIntoView(), 100) }} className="min-h-11 text-sm font-semibold uppercase tracking-[0.12em] text-lime hover:text-white">
            View on website
          </button>
        </div>
        <p role="status" className="text-sm text-lime">{msg}</p>
      </form>
    </Block>
  )
}

