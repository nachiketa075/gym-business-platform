import { useEffect, useState } from 'react'
import { jumpTo } from './scroll'

export type Route = 'site' | 'login' | 'portal'

const read = (): Route => {
  const h = window.location.hash
  if (h.startsWith('#/login')) return 'login'
  if (h.startsWith('#/portal')) return 'portal'
  return 'site'
}

/**
 * Tiny hash router: the marketing site keeps plain #section anchors, the demo portal lives under #/login and #/portal.
 * The page only jumps to the top when the route actually changes. Moving between #sections on the site is left to
 * lib/scroll, so Back/Forward and edited hashes land on the section instead of the top.
 */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    let current = read()
    const on = () => {
      const next = read()
      setRoute(next)
      if (next !== current) {
        current = next
        jumpTo(0)
      }
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

/** Go to a route, optionally landing on a section of the website, e.g. navigate('/', 'membership'). */
export function navigate(to: '/' | '/login' | '/portal', section?: string) {
  if (to === '/' && !section) {
    history.pushState(null, '', window.location.pathname + window.location.search)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = to === '/' ? `#${section}` : to
  }
}
