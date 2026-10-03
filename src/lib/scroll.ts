import type { MouseEvent } from 'react'

/**
 * One place for same-page navigation, so every link and button lands the same way:
 * - the destination heading is fully visible, just below the sticky header
 * - layout shifts while the page settles (fonts, lazy media) are corrected after the scroll ends
 * - reduced-motion users get an instant jump
 * - keyboard focus follows the scroll, so the next Tab starts inside the section
 */

const GAP = 16 // breathing room between the sticky header and the destination
const SETTLE_FRAMES = 8 // frames without movement before we treat a scroll as finished
const BOTTOM_MARGIN = 24 // keep the heading at least this far above the viewport bottom

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const headerHeight = () => document.querySelector('header')?.getBoundingClientRect().height ?? 0
const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY

/** Where to scroll so `section`'s heading is visible under the header. */
function destinationY(section: HTMLElement): number {
  if (section.id === 'top') return 0
  const offset = headerHeight() + GAP
  const start = section.querySelector<HTMLElement>('[data-anchor]') ?? section
  const heading = start.querySelector<HTMLElement>('h1, h2') ?? start
  // Prefer showing the very start of the section (e.g. an image above the heading) ...
  let y = docTop(start) - offset
  const headingBottom = docTop(heading) + heading.getBoundingClientRect().height
  // ... unless that pushes the heading off-screen (stacked layouts on phones and tablets): then align the heading itself.
  if (headingBottom - y > window.innerHeight - BOTTOM_MARGIN) {
    y = docTop(section.querySelector<HTMLElement>('[data-heading]') ?? heading) - offset
  }
  return Math.min(Math.max(0, Math.round(y)), maxScroll())
}

let currentRun = 0

/** Move instantly, ignoring any CSS smooth scrolling. Falls back for browsers that reject behavior: 'instant'. */
export function jumpTo(top: number) {
  try {
    window.scrollTo({ top, behavior: 'instant' })
  } catch {
    window.scrollTo(0, top)
  }
}

/** After a scroll starts, wait for it to stop, re-aim if the layout moved underneath it, then move focus to the target. */
function settle(run: number, el: HTMLElement) {
  const inputs = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const
  const cancel = () => {
    if (run === currentRun) currentRun++ // a person took over: stop correcting
  }
  inputs.forEach((t) => window.addEventListener(t, cancel, { passive: true, once: true }))
  const cleanup = () => inputs.forEach((t) => window.removeEventListener(t, cancel))

  const started = performance.now()
  let last = window.scrollY
  let still = 0
  let corrections = 0
  const tick = () => {
    if (run !== currentRun) return cleanup()
    const y = window.scrollY
    still = Math.abs(y - last) < 0.5 ? still + 1 : 0
    last = y
    const timedOut = performance.now() - started > 3000
    if (still >= SETTLE_FRAMES || timedOut) {
      const want = destinationY(el)
      if (!timedOut && corrections < 4 && Math.abs(y - want) > 2) {
        corrections++
        jumpTo(want)
        still = 0
      } else {
        cleanup()
        el.focus({ preventScroll: true })
        return
      }
    }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

interface GoOptions {
  /** Animate the scroll (default). Reduced-motion users always get an instant jump. */
  smooth?: boolean
  /** Write #id to the address bar (default). Off when the URL already says so. */
  updateHash?: boolean
}

/** Scroll to the element with this id. Returns false if there is no such element. */
export function goTo(id: string, { smooth = true, updateHash = true }: GoOptions = {}): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  const run = ++currentRun
  if (updateHash) {
    const url = id === 'top' ? window.location.pathname + window.location.search : `#${id}`
    history.replaceState(null, '', url)
  }
  const top = destinationY(el)
  if (smooth && !prefersReducedMotion()) window.scrollTo({ top, behavior: 'smooth' })
  else jumpTo(top)
  settle(run, el)
  return true
}

/** The section id named by the URL hash, if the page has it. Route hashes such as #/login are ignored. */
export function sectionFromHash(): string | null {
  let id = ''
  try {
    id = decodeURIComponent(window.location.hash.slice(1))
  } catch {
    return null
  }
  return id && !id.startsWith('/') && document.getElementById(id) ? id : null
}

/** Scroll to whatever section the URL points at. Returns whether there was one. */
export function followHash(smooth: boolean): boolean {
  const id = sectionFromHash()
  return id ? goTo(id, { smooth, updateHash: false }) : false
}

/** Plain left-clicks are handled in-page; modified clicks (new tab, new window) keep the native link behaviour. */
export const isModifiedClick = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey

/** onClick for an in-page anchor: `<a href="#programs" onClick={navTo('programs')}>`. */
export const navTo = (id: string, before?: () => void) => (e: MouseEvent) => {
  if (isModifiedClick(e)) return
  e.preventDefault()
  before?.()
  goTo(id)
}
