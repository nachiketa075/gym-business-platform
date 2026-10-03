import { useMemo, useSyncExternalStore } from 'react'
import { memberships, type Duration, type Membership, type MembershipId } from '../config/site'

const KEY = 'fitnation-price-overrides-v1'
const EVENT = 'fitnation-prices'

type Overrides = Partial<Record<MembershipId, Partial<Record<Duration, number>>>>

const raw = () => {
  try {
    return window.localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

const merge = (json: string): Membership[] => {
  let ov: Overrides = {}
  try {
    ov = json ? JSON.parse(json) : {}
  } catch {
    ov = {}
  }
  return memberships.map((m) => ({ ...m, prices: { ...m.prices, ...(ov[m.id] ?? {}) } }))
}

/** The owner portal can override fees. Overrides live in this browser only (demo, no backend). */
export function setPriceOverrides(ov: Overrides | null) {
  try {
    if (ov && Object.keys(ov).length) window.localStorage.setItem(KEY, JSON.stringify(ov))
    else window.localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable: overrides simply do not persist */
  }
  window.dispatchEvent(new Event(EVENT))
}

export const getMemberships = () => merge(raw())

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

/** Memberships with any owner price overrides applied. */
export function useMemberships(): Membership[] {
  const json = useSyncExternalStore(subscribe, raw, () => '')
  return useMemo(() => merge(json), [json])
}

export const hasOverrides = () => raw() !== ''
