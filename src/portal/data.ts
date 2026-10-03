import { memberships, type Duration, type MembershipId } from '../config/site'

export type Role = 'client' | 'trainer' | 'owner'
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type Day = (typeof DAYS)[number]

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  membership: MembershipId
  /** Term length in months. Extensions can make this a non-standard total such as 9 or 15. */
  months: number
  start: string // ISO date
  trainerId: string | null
  goal: string
  plan: Record<Day, string>
  attendance: string[] // ISO dates
  renewalRequested: boolean
}
export interface Trainer {
  id: string
  name: string
  email: string
  specialty: string
}
export interface ClassSession {
  id: string
  title: string
  day: number // 0 = Monday
  time: string // 24h "HH:MM"
  trainerId: string
  capacity: number
  booked: string[] // member ids
}
export interface Payment {
  id: string
  memberId: string
  amount: number
  date: string
  label: string
}
export interface DemoData {
  members: Member[]
  trainers: Trainer[]
  sessions: ClassSession[]
  payments: Payment[]
}

/** Demo accounts only. There is no backend: sign-in is simulated in the browser. */
export const DEMO_ACCOUNTS: Record<Role, { email: string; password: string; userId: string; label: string }> = {
  client: { email: 'client@fitnation.example', password: 'client123', userId: 'm1', label: 'Client' },
  trainer: { email: 'trainer@fitnation.example', password: 'trainer123', userId: 't1', label: 'Trainer' },
  owner: { email: 'owner@fitnation.example', password: 'owner123', userId: 'owner', label: 'Owner' },
}

// ---------- date helpers (local time, ISO yyyy-mm-dd)
export const toISO = (d: Date) => {
  const x = new Date(d)
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}
export const fromISO = (s: string) => new Date(`${s}T00:00:00`)
export const todayISO = () => toISO(new Date())
export const addDays = (s: string, n: number) => {
  const d = fromISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
export const addMonths = (s: string, n: number) => {
  const d = fromISO(s)
  d.setMonth(d.getMonth() + n)
  return toISO(d)
}
export const daysBetween = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 864e5)
export const weekdayIndex = (d = new Date()) => (d.getDay() + 6) % 7
export const fmtDate = (s: string) =>
  fromISO(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

// ---------- derived membership info
export const endDate = (m: Member) => addMonths(m.start, m.months)
export type Status = 'active' | 'expiring' | 'expired'
export const statusOf = (m: Member, today = todayISO()): Status => {
  const left = daysBetween(today, endDate(m))
  return left < 0 ? 'expired' : left <= 7 ? 'expiring' : 'active'
}

// ---------- seed
const emptyPlan = (): Record<Day, string> => ({ Mon: 'Rest', Tue: 'Rest', Wed: 'Rest', Thu: 'Rest', Fri: 'Rest', Sat: 'Rest', Sun: 'Rest' })
const strengthPlan = (): Record<Day, string> => ({
  Mon: 'Squat 5x5, Romanian deadlift 3x8, core circuit',
  Tue: 'Mobility flow 30 min, easy cardio 20 min',
  Wed: 'Bench press 5x5, row 4x8, shoulder accessories',
  Thu: 'Rest',
  Fri: 'Deadlift 5x3, split squat 3x10, carries',
  Sat: 'CrossFit class, stretch',
  Sun: 'Rest',
})
const conditioningPlan = (): Record<Day, string> => ({
  ...emptyPlan(),
  Mon: 'Interval circuit 40 min',
  Wed: 'Sled and rope work, mobility finisher',
  Fri: 'Full-body CrossFit class',
})

export function seedData(): DemoData {
  const today = todayISO()
  const ago = (n: number) => addDays(today, -n)
  const mk = (
    id: string,
    name: string,
    membership: MembershipId,
    months: Duration,
    startedAgo: number,
    trainerId: string | null,
    goal: string,
    plan: Record<Day, string>,
    extra: Partial<Member> = {},
  ): Member => {
    const n = Number(id.slice(1))
    const attendance: string[] = []
    const now = new Date()
    for (let day = 1; day < now.getDate(); day++) {
      if ((day * 7 + n * 3) % 5 < 2) attendance.push(toISO(new Date(now.getFullYear(), now.getMonth(), day)))
    }
    return {
      id,
      name,
      email: `${name.split(' ')[0].toLowerCase()}@member.fitnation.example`,
      phone: '',
      membership,
      months,
      start: ago(startedAgo),
      trainerId,
      goal,
      plan,
      attendance,
      renewalRequested: false,
      ...extra,
    }
  }
  const members: Member[] = [
    mk('m1', 'Aarav Mehta', 'gym', 6, 40, 't1', 'Build strength and add 20 kg to my squat', strengthPlan(), { email: DEMO_ACCOUNTS.client.email }),
    mk('m2', 'Diya Nair', 'pt', 3, 70, 't1', 'Fat loss and a first pull-up', strengthPlan()),
    mk('m3', 'Kabir Singh', 'gym', 1, 27, null, 'General fitness', emptyPlan()),
    mk('m4', 'Isha Verma', 'gym', 12, 100, 't2', 'Improve conditioning for running', conditioningPlan()),
    mk('m5', 'Rahul Das', 'gym', 3, 120, null, 'Stay consistent', emptyPlan()),
    mk('m6', 'Sana Khan', 'pt', 6, 15, 't3', 'Mobility and posture', emptyPlan()),
    mk('m7', 'Vikram Patel', 'gym', 1, 5, 't2', 'Lose weight', conditioningPlan()),
    mk('m8', 'Neha Rao', 'pt', 1, 29, 't3', 'Rebuild strength after a break', emptyPlan(), { renewalRequested: true }),
  ]
  const trainers: Trainer[] = [
    { id: 't1', name: 'Rohan Shah', email: DEMO_ACCOUNTS.trainer.email, specialty: 'Strength training' },
    { id: 't2', name: 'Meera Iyer', email: 'meera@staff.fitnation.example', specialty: 'CrossFit and conditioning' },
    { id: 't3', name: 'Anil Kapoor', email: 'anil@staff.fitnation.example', specialty: 'Mobility and personal training' },
  ]
  const cls = (id: string, title: string, day: number, time: string, trainerId: string, booked: string[] = []): ClassSession => ({
    id,
    title,
    day,
    time,
    trainerId,
    capacity: 12,
    booked,
  })
  const sessions: ClassSession[] = [
    cls('s1', 'Strength Foundations', 0, '06:00', 't1', ['m1', 'm2']),
    cls('s2', 'Strength Foundations', 0, '18:00', 't1', ['m3']),
    cls('s3', 'CrossFit', 1, '07:00', 't2', ['m4']),
    cls('s4', 'CrossFit', 1, '19:00', 't2', ['m7']),
    cls('s5', 'Strength Foundations', 2, '06:00', 't1', ['m1']),
    cls('s6', 'Mobility & Recovery', 2, '20:00', 't3', ['m6']),
    cls('s7', 'CrossFit', 3, '07:00', 't2'),
    cls('s8', 'CrossFit', 3, '19:00', 't2', ['m4', 'm7']),
    cls('s9', 'Strength Foundations', 4, '06:00', 't1', ['m2']),
    cls('s10', 'Strength Foundations', 4, '18:00', 't1', ['m1']),
    cls('s11', 'CrossFit', 5, '07:00', 't2'),
    cls('s12', 'Mobility & Recovery', 6, '07:00', 't3', ['m6']),
  ]
  const payments: Payment[] = members.map((m, i) => {
    const prices = memberships.find((x) => x.id === m.membership)!.prices
    return {
      id: `p${i + 1}`,
      memberId: m.id,
      amount: prices[m.months as Duration],
      date: m.start,
      label: `${memberships.find((x) => x.id === m.membership)!.name}, ${m.months} mo`,
    }
  })
  return { members, trainers, sessions, payments }
}
