import { useEffect, useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { Button } from '../components/Button'
import { memberships } from '../config/site'
import { DAYS, endDate, fmtDate, fmtTime, statusOf, todayISO, weekdayIndex, type Day } from './data'
import { usePortal } from './store'
import { Block, Empty, field, Stat, Stats, StatusChip } from './ui'

export function TrainerView({ trainerId }: { trainerId: string }) {
  const { data, dispatch } = usePortal()
  const trainer = data.trainers.find((t) => t.id === trainerId)
  const clients = useMemo(() => data.members.filter((m) => m.trainerId === trainerId), [data.members, trainerId])
  const [q, setQ] = useState('')
  const [selId, setSelId] = useState<string | null>(clients[0]?.id ?? null)
  const [draft, setDraft] = useState<Record<Day, string> | null>(null)
  const [saved, setSaved] = useState(false)

  const today = todayISO()
  const todayIdx = weekdayIndex()
  const mine = data.sessions.filter((s) => s.trainerId === trainerId)
  const todays = mine.filter((s) => s.day === todayIdx).sort((a, b) => a.time.localeCompare(b.time))
  const sel = clients.find((c) => c.id === selId) ?? null
  const shown = clients.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()))
  const presentToday = clients.filter((c) => c.attendance.includes(today)).length

  // Load the selected client's plan into the editor whenever the selection changes.
  useEffect(() => {
    setDraft(sel ? { ...sel.plan } : null)
    setSaved(false)
  }, [selId, sel?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!trainer) return <Empty>This demo trainer no longer exists. Use “Reset demo data” above.</Empty>

  const dirty = !!(sel && draft && DAYS.some((d) => draft[d] !== sel.plan[d]))

  const save = () => {
    if (!sel || !draft) return
    DAYS.forEach((d) => draft[d] !== sel.plan[d] && dispatch({ type: 'setPlanDay', memberId: sel.id, day: d, text: draft[d].trim() || 'Rest' }))
    setSaved(true)
  }

  return (
    <>
      <div>
        <p className="eyebrow">Trainer</p>
        <h1 className="display mt-3 text-6xl sm:text-8xl">Hi, {trainer.name.split(' ')[0]}</h1>
        <p className="mt-3 text-mute">{trainer.specialty}</p>
      </div>

      <Stats>
        <Stat label="My clients" value={clients.length} />
        <Stat label="Sessions today" value={todays.length} />
        <Stat label="Sessions / week" value={mine.length} />
        <Stat label="Present today" value={presentToday} hint={`of ${clients.length} clients`} />
      </Stats>

      <Block title="Today’s sessions" kicker="Schedule">
        {todays.length === 0 ? (
          <Empty>No sessions of yours are scheduled today.</Empty>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {todays.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <p className="font-medium">
                  {fmtTime(s.time)} · {s.title}
                </p>
                <p className="text-mute">
                  {s.booked.length} of {s.capacity} booked
                  {s.booked.length > 0 && <span className="text-white/80"> · {s.booked.map((id) => data.members.find((m) => m.id === id)?.name.split(' ')[0]).join(', ')}</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="My clients" kicker="Attendance and plans">
        {clients.length === 0 ? (
          <Empty>No clients are assigned to you yet. The owner assigns clients from their portal.</Empty>
        ) : (
          <div className="grid gap-10 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <label htmlFor="client-search" className="sr-only">Search clients</label>
              <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mute" />
                <input id="client-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients" className={`${field} !mt-0 pl-11`} />
              </div>
              <ul className="mt-4 divide-y divide-line border-y border-line" aria-label="Clients">
                {shown.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-pressed={c.id === selId}
                      onClick={() => setSelId(c.id)}
                      className={`flex min-h-16 w-full items-center justify-between gap-3 px-3 text-left transition-colors ${c.id === selId ? 'bg-lime/10 text-lime' : 'hover:text-lime'}`}
                    >
                      <span className="font-medium">{c.name}</span>
                      <StatusChip status={statusOf(c)} />
                    </button>
                  </li>
                ))}
                {shown.length === 0 && <li className="p-4 text-mute">No clients match “{q}”.</li>}
              </ul>
            </div>

            <div className="xl:col-span-8">
              {sel && draft ? (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="display text-5xl">{sel.name}</h3>
                      <p className="mt-2 text-mute">
                        {memberships.find((x) => x.id === sel.membership)?.name}, {sel.months} months · until {fmtDate(endDate(sel))}
                      </p>
                      <p className="mt-1 text-white/80">Goal: {sel.goal}</p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={sel.attendance.includes(today)}
                      onClick={() => dispatch({ type: 'toggleAttendance', memberId: sel.id, date: today })}
                      className={`inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                        sel.attendance.includes(today) ? 'border-lime bg-lime text-ink hover:bg-white' : 'border-white/40 hover:border-lime hover:text-lime'
                      }`}
                    >
                      {sel.attendance.includes(today) && <Check aria-hidden className="size-4" />}
                      {sel.attendance.includes(today) ? 'Present today' : 'Mark present today'}
                    </button>
                  </div>

                  <h4 className="eyebrow mt-10">Weekly plan (visible to {sel.name.split(' ')[0]})</h4>
                  <div className="mt-4 space-y-4">
                    {DAYS.map((d) => (
                      <div key={d} className="grid gap-2 sm:grid-cols-[5rem_1fr] sm:items-start sm:gap-5">
                        <label htmlFor={`plan-${d}`} className="display pt-3 text-3xl text-lime">{d}</label>
                        <input
                          id={`plan-${d}`}
                          value={draft[d]}
                          onChange={(e) => {
                            setDraft({ ...draft, [d]: e.target.value })
                            setSaved(false)
                          }}
                          className={`${field} !mt-0`}
                          placeholder="Rest"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Button onClick={save} disabled={!dirty} className="disabled:cursor-not-allowed disabled:opacity-40" arrow={false}>
                      Save plan
                    </Button>
                    <p role="status" className="text-sm text-lime">{saved ? `Saved. ${sel.name.split(' ')[0]} can see the new plan now.` : ''}</p>
                  </div>
                </div>
              ) : (
                <Empty>Select a client to see their details.</Empty>
              )}
            </div>
          </div>
        )}
      </Block>
    </>
  )
}
