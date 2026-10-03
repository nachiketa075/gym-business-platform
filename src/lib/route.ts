import { useEffect, useState } from 'react'

export type Route = 'site' | 'login' | 'portal'

const read = (): Route => {
  const h = window.location.hash
  if (h.startsWith('#/login')) return 'login'
  if (h.startsWith('#/portal')) return 'portal'
  return 'site'
}

/** Tiny hash router: the marketing site keeps plain #section anchors, the demo portal lives under #/login and #/portal. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const on = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function navigate(to: '/' | '/login' | '/portal') {
  if (to === '/') {
    history.pushState(null, '', window.location.pathname + window.location.search)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = to
  }
}
