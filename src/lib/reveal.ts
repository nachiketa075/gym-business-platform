import { useLayoutEffect } from 'react'

/**
 * Scroll reveals, built to fail open.
 *
 *  - Elements marked `data-reveal` are only hidden once this hook has armed the page (`data-reveal-armed` on <html>).
 *    If the script throws, or the browser has no IntersectionObserver, or the visitor prefers reduced motion,
 *    nothing is ever hidden.
 *  - One IntersectionObserver reveals each element the moment it enters the viewport.
 *  - A geometry backstop reveals anything that has been on screen for a moment without the observer firing
 *    (landing on a #hash, restored scroll position, an element only a sliver of which is visible).
 *  - Each element reveals once. Afterwards its reveal attributes are removed, so nothing replays on small scrolls and
 *    the element is left with no leftover transition to fight hover or focus styling.
 */

const ARMED = 'data-reveal-armed'
/** Trigger just before the very bottom edge so entrances read as arriving content, not as content already on screen. */
const ROOT_MARGIN = '0px 0px -3% 0px'
/** If an element has been visible this long without the observer firing, reveal it anyway. */
const BACKSTOP_AFTER_MS = 450
const BACKSTOP_EVERY_MS = 250
const MIN_VISIBLE_PX = 24

const toMs = (s: string) => (s.trim().endsWith('ms') ? parseFloat(s) : parseFloat(s) * 1000) || 0

/** How long an element's reveal takes from now, including its own delay and its masked lines / image inner. */
function revealDuration(el: HTMLElement): number {
  let longest = 0
  for (const node of [el, ...el.querySelectorAll<HTMLElement>('.reveal-line-inner, .reveal-image-inner')]) {
    const cs = getComputedStyle(node)
    const durations = cs.transitionDuration.split(',')
    const delays = cs.transitionDelay.split(',')
    durations.forEach((d, i) => {
      longest = Math.max(longest, toMs(d) + toMs(delays[i % delays.length]))
    })
  }
  return longest
}

export function useScrollReveals() {
  useLayoutEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) return

    const pending = new Set<HTMLElement>()
    const firstSeen = new Map<HTMLElement, number>()
    const cleanups = new Set<number>()
    let io: IntersectionObserver | undefined
    let mo: MutationObserver | undefined
    let backstop = 0

    const reveal = (el: HTMLElement) => {
      if (!pending.delete(el)) return
      io?.unobserve(el)
      firstSeen.delete(el)
      el.setAttribute('data-revealed', '')
      const t = window.setTimeout(() => {
        cleanups.delete(t)
        el.removeAttribute('data-reveal')
        el.removeAttribute('data-revealed')
        el.style.removeProperty('--reveal-delay')
        el.style.removeProperty('--reveal-dur')
      }, revealDuration(el) + 150)
      cleanups.add(t)
    }

    const track = (el: HTMLElement) => {
      if (el.hasAttribute('data-revealed') || pending.has(el)) return
      pending.add(el)
      io?.observe(el)
    }
    const scan = (node: Element | Document) => {
      if (node instanceof HTMLElement && node.hasAttribute('data-reveal')) track(node)
      node.querySelectorAll<HTMLElement>('[data-reveal]').forEach(track)
    }

    const disarm = () => {
      root.removeAttribute(ARMED)
      for (const el of pending) {
        el.removeAttribute('data-reveal')
        el.removeAttribute('data-revealed')
        el.style.removeProperty('--reveal-delay')
        el.style.removeProperty('--reveal-dur')
      }
      pending.clear()
    }

    try {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) reveal(e.target as HTMLElement)
        },
        { rootMargin: ROOT_MARGIN },
      )
      scan(document)
      root.setAttribute(ARMED, '')

      // Anything rendered after mount (conditional UI) is picked up too, so it can never be left hidden.
      mo = new MutationObserver((records) => {
        for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && scan(n))
      })
      mo.observe(document.body, { childList: true, subtree: true })

      backstop = window.setInterval(() => {
        if (document.hidden || pending.size === 0) return
        const now = performance.now()
        const vh = window.innerHeight
        for (const el of pending) {
          const r = el.getBoundingClientRect()
          const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0)
          if (r.height > 0 && visible >= Math.min(MIN_VISIBLE_PX, r.height)) {
            const since = firstSeen.get(el) ?? now
            firstSeen.set(el, since)
            if (now - since >= BACKSTOP_AFTER_MS) reveal(el)
          } else {
            firstSeen.delete(el)
          }
        }
      }, BACKSTOP_EVERY_MS)
    } catch {
      disarm()
    }

    return () => {
      io?.disconnect()
      mo?.disconnect()
      window.clearInterval(backstop)
      cleanups.forEach((t) => window.clearTimeout(t))
      disarm()
    }
  }, [])
}
