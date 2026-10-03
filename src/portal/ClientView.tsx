import { motion } from 'motion/react'
import { Check, Info } from 'lucide-react'
import { Button } from '../components/Button'
import { memberships } from '../config/site'
import { DAYS, daysBetween, endDate, fmtDate, fmtTime, fromISO, statusOf, todayISO, weekdayIndex } from './data'
import { usePortal } from './store'
import { Block, Empty, Stat, Stats, StatusChip } from './ui'

const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function ClientView({ memberId }: { memberId: string }) {
  const { data, dispatch } = usePortal()
  const m = data.members.find((x) => x.id === memberId)
  if (!m) return <Empty>This demo member no longer exists. Use “Reset demo data” above.</Empty>

  const today = todayISO()
  const end = endDate(m)
  const left = daysBetween(today, end)
  const status = statusOf(m)
  const plan = memberships.find((x) => x.id === m.membership)!
  const total = Math.max(1, daysBetween(m.start, end))
  const used = Math.min(100, Math.max(0, Math.round(((total - Math.max(left, 0)) / total) * 100)))
  const trainer = data.trainers.find((t) => t.id === m.trainerId)
  const hasPlan = DAYS.some((d) => m.plan[d] && m.plan[d] !== 'Rest')

  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7
  const inMonth = m.attendance.filter((d) => d.startsWith(today.slice(0, 7))).length
  const todayIdx = weekdayIndex()

  const myBookings = data.sessions.filter((s) => s.booked.includes(m.id)).length

  return (
    <>
      <div>
        <p className="eyebrow">Client</p>
        <h1 className="display mt-3 text-6xl sm:text-8xl">Hi, {m.name.split(' ')[0]}</h1>
      </div>

      <Stats>
        <Stat label="Membership" value={<StatusChip status={status} />} hint={`${plan.name}, ${m.months} months`} />
        <Stat label="Valid until" value={<span className="text-4xl sm:text-5xl">{fmtDate(end)}</span>} />
        <Stat label="Days left" value={Math.max(left, 0)} />
        <Stat label="Classes booked" value={myBookings} hint={`${inMonth} visit${inMonth === 1 ? '' : 's'} this month`} />
      </Stats>

      <Block title="Your membership" kicker="Plan">
        <div className="max-w-3xl">
          <div className="flex justify-between text-sm text-mute">
            <span>{fmtDate(m.start)}</span>
            <span>{fmtDate(end)}</span>
          </div>
          <div className="mt-2 h-3 border border-line" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={100} aria-label="Membership time used">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: used / 100 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="h-full origin-left bg-lime" />
          </div>
          <p className="mt-3 text-white/80">
            {left < 0 ? 'Your membership has ended.' : `${left} day${left === 1 ? '' : 's'} remaining on your ${plan.name.toLowerCase()}.`}
          </p>
          <div className="mt-6">
            {m.renewalRequested ? (
              <p role="status" className="flex items-start gap-2 border border-lime/50 bg-lime/10 p-4 text-sm leading-relaxed">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-lime" />
                Renewal requested. The club owner can see this in their portal (demo, nothing is emailed).
              </p>
            ) : (
              <Button onClick={() => dispatch({ type: 'requestRenewal', memberId: m.id })} variant={status === 'active' ? 'ghost' : 'lime'}>
                Request renewal
              </Button>
            )}
          </div>
        </div>
      </Block>

      <Block title="Class timetable" kicker="Book a spot">
        <div className="divide-y divide-line border-y border-line">
          {FULL_DAYS.map((name, d) => {
            const list = data.sessions.filter((s) => s.day === d).sort((a, b) => a.time.localeCompare(b.time))
            if (!list.length) return null
            return (
              <div key={name} className="grid gap-3 py-5 md:grid-cols-[10rem_1fr]">
                <h3 className="display text-3xl">
                  {name}
                  {d === todayIdx && <span className="eyebrow ml-3 align-middle">Today</span>}
                </h3>
                <ul className="space-y-3">
                  {list.map((s) => {
                    const mine = s.booked.includes(m.id)
                    const full = s.booked.length >= s.capacity && !mine
                    const t = data.trainers.find((x) => x.id === s.trainerId)
                    return (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {fmtTime(s.time)} · {s.title}
                          </p>
                          <p className="text-sm text-mute">
                            {t?.name} · {full ? 'Full' : `${s.capacity - s.booked.length} spots left`}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={full}
                          aria-pressed={mine}
                          aria-label={`${mine ? 'Cancel booking for' : 'Book'} ${s.title}, ${name} ${fmtTime(s.time)}`}
                          onClick={() => dispatch({ type: 'toggleBooking', sessionId: s.id, memberId: m.id })}
                          className={`min-h-11 min-w-28 border px-4 text-sm font-semibold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                            mine ? 'border-lime bg-lime text-ink hover:bg-white' : 'border-white/40 hover:border-lime hover:text-lime'
                          }`}
                        >
                          {mine ? 'Booked' : full ? 'Full' : 'Book'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </Block>

      <Block title="Your trainer and plan" kicker={trainer ? trainer.name : 'No trainer yet'}>
        {!trainer ? (
          <Empty>No trainer is assigned to you yet. Ask the club owner to assign one and your weekly plan will appear here.</Empty>
        ) : !hasPlan ? (
          <Empty>{trainer.name} ({trainer.specialty}) has not written your weekly plan yet.</Empty>
        ) : (
          <>
            <p className="mb-4 text-mute">
              Goal: <span className="text-white">{m.goal}</span> · plan by {trainer.name}
            </p>
            <ol className="divide-y divide-line border-y border-line">
              {DAYS.map((d, i) => (
                <li key={d} className={`grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6 ${i === todayIdx ? 'bg-lime/5' : ''}`}>
                  <span className="display text-3xl text-lime">{d}</span>
                  <span className={m.plan[d] === 'Rest' ? 'text-mute' : 'text-white/90'}>{m.plan[d] || 'Rest'}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </Block>

      <Block title="Attendance" kicker={now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}>
        <div className="max-w-md">
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-mute" aria-hidden>
            {DAYS.map((d) => <span key={d}>{d[0]}</span>)}
          </div>
          <ul className="mt-1 grid grid-cols-7 gap-1" aria-label={`${inMonth} visit${inMonth === 1 ? '' : 's'} this month`}>
            {Array.from({ length: lead }).map((_, i) => <li key={`b${i}`} aria-hidden />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const iso = new Date(now.getFullYear(), now.getMonth(), i + 1)
              const key = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
              const hit = m.attendance.includes(key)
              const isToday = key === today
              return (
                <li
                  key={key}
                  title={fromISO(key).toDateString()}
                  className={`grid aspect-square place-items-center border text-sm ${hit ? 'border-lime bg-lime font-semibold text-ink' : 'border-line text-white/70'} ${isToday ? 'outline outline-1 outline-offset-1 outline-white' : ''}`}
                >
                  <span aria-hidden>{i + 1}</span>
                  <span className="sr-only">{`${i + 1}: ${hit ? 'attended' : 'no visit'}`}</span>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 flex items-start gap-2 text-sm text-mute">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" /> Your trainer marks attendance when you train with them.
          </p>
        </div>
      </Block>
    </>
  )
}
