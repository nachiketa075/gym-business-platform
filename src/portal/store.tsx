import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { memberships, type Duration, type MembershipId } from '../config/site'
import { getMemberships } from '../lib/pricing'
import {
  DEMO_ACCOUNTS,
  endDate,
  seedData,
  todayISO,
  type Day,
  type DemoData,
  type Member,
  type Role,
} from './data'

const DATA_KEY = 'fitnation-demo-data-v1'
const SESSION_KEY = 'fitnation-demo-session-v1'

export interface Session {
  role: Role
  userId: string
}

type Action =
  | { type: 'toggleBooking'; sessionId: string; memberId: string }
  | { type: 'setPlanDay'; memberId: string; day: Day; text: string }
  | { type: 'toggleAttendance'; memberId: string; date: string }
  | { type: 'requestRenewal'; memberId: string }
  | { type: 'assignTrainer'; memberId: string; trainerId: string | null }
  | { type: 'extend'; memberId: string; months: Duration }
  | { type: 'addMember'; member: Member; amount: number }
  | { type: 'reset' }

function reducer(s: DemoData, a: Action): DemoData {
  const upd = (id: string, f: (m: Member) => Member) => ({ ...s, members: s.members.map((m) => (m.id === id ? f(m) : m)) })
  switch (a.type) {
    case 'toggleBooking':
      return {
        ...s,
        sessions: s.sessions.map((c) => {
          if (c.id !== a.sessionId) return c
          const has = c.booked.includes(a.memberId)
          if (!has && c.booked.length >= c.capacity) return c
          return { ...c, booked: has ? c.booked.filter((x) => x !== a.memberId) : [...c.booked, a.memberId] }
        }),
      }
    case 'setPlanDay':
      return upd(a.memberId, (m) => ({ ...m, plan: { ...m.plan, [a.day]: a.text } }))
    case 'toggleAttendance':
      return upd(a.memberId, (m) => ({
        ...m,
        attendance: m.attendance.includes(a.date) ? m.attendance.filter((d) => d !== a.date) : [...m.attendance, a.date],
      }))
    case 'requestRenewal':
      return upd(a.memberId, (m) => ({ ...m, renewalRequested: true }))
    case 'assignTrainer':
      return upd(a.memberId, (m) => ({ ...m, trainerId: a.trainerId }))
    case 'extend': {
      const m = s.members.find((x) => x.id === a.memberId)
      if (!m) return s
      const today = todayISO()
      const end = endDate(m)
      // Extending an expired membership restarts it today; an active one continues from its end date.
      const start = end < today ? today : m.start
      const months = (end < today ? 0 : m.months) + a.months
      const ms = memberships.find((x) => x.id === m.membership)!
      const amount = getMemberships().find((x) => x.id === ms.id)!.prices[a.months]
      return {
        ...s,
        members: s.members.map((x) => (x.id === m.id ? { ...x, start, months, renewalRequested: false } : x)),
        payments: [...s.payments, { id: `p${Date.now()}`, memberId: m.id, amount, date: today, label: `${ms.name}, ${a.months} mo (extension)` }],
      }
    }
    case 'addMember':
      return {
        ...s,
        members: [...s.members, a.member],
        payments: [
          ...s.payments,
          { id: `p${Date.now()}`, memberId: a.member.id, amount: a.amount, date: a.member.start, label: `${a.member.membership === 'gym' ? 'Gym membership' : 'Personal training'}, ${a.member.months} mo` },
        ],
      }
    case 'reset':
      return seedData()
  }
}

const load = (): DemoData => {
  try {
    const raw = window.localStorage.getItem(DATA_KEY)
    if (raw) return JSON.parse(raw) as DemoData
  } catch {
    /* fall through to seed */
  }
  return seedData()
}
const loadSession = (): Session | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

interface Ctx {
  data: DemoData
  dispatch: (a: Action) => void
  session: Session | null
  signIn: (role: Role) => void
  signOut: () => void
}
const PortalContext = createContext<Ctx | null>(null)

export function PortalProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, load)
  const [session, setSession] = useState<Session | null>(loadSession)

  useEffect(() => {
    try {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(data))
    } catch {
      /* demo data just will not persist */
    }
  }, [data])

  const signIn = useCallback((role: Role) => {
    const s = { role, userId: DEMO_ACCOUNTS[role].userId }
    setSession(s)
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    } catch {
      /* session lasts until reload */
    }
  }, [])
  const signOut = useCallback(() => {
    setSession(null)
    try {
      window.localStorage.removeItem(SESSION_KEY)
    } catch {
      /* nothing to clear */
    }
  }, [])

  const value = useMemo(() => ({ data, dispatch, session, signIn, signOut }), [data, session, signIn, signOut])
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortal() {
  const c = useContext(PortalContext)
  if (!c) throw new Error('usePortal must be used inside PortalProvider')
  return c
}

export type { MembershipId }
