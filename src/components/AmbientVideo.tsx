import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  poster: string
  className?: string
}

/** Start downloading this far before the video scrolls into view, so it can start the moment it arrives. */
const FETCH_AHEAD = '600px 0px'
/** Play once at least this fraction of the video is on screen. */
const PLAY_RATIO = 0.2

type Problem = null | 'blocked' | 'unsupported'

/**
 * Decorative, silent, looping background video. Not for instructional or spoken content (that needs real controls and
 * captions, so it should not use this component).
 *
 * Behaviour:
 *  - Always plays by itself, muted and inline, as soon as it is on screen. There is no Play button anywhere.
 *    (The site owner chose this deliberately, so it also applies when the visitor's system asks for reduced motion.
 *    The small Pause control below is what keeps that acceptable: WCAG 2.2.2.)
 *  - Nothing is downloaded until the video is close to the screen.
 *  - Pauses when it leaves the screen or the tab is hidden, and resumes when it returns, 
 *  - If a browser setting refuses unattended playback, the poster simply stays up (no button) and playback starts by
 *    itself on the visitor's next tap, click or key press anywhere on the page.
 *  - There are no controls of any kind.
 */
export function AmbientVideo({ src, poster, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [tabVisible, setTabVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  const [problem, setProblem] = useState<Problem>(null)

  const wanted = inView && tabVisible && problem !== 'unsupported'
  const wantedRef = useRef(wanted)
  wantedRef.current = wanted
  const retries = useRef(0)

  /** Unattended playback is only ever allowed for muted media, so make sure of it before every attempt. */
  const prepare = useCallback((v: HTMLVideoElement) => {
    v.muted = true
    v.defaultMuted = true // also puts the `muted` attribute in the DOM (React only sets the property)
    v.playsInline = true
    v.loop = true
  }, [])

  const start = useCallback(() => {
    const v = ref.current
    if (!v) return
    prepare(v)
    // Only now, when playback is actually wanted: an `autoplay` attribute makes browsers download immediately, which would
    // defeat the lazy loading if it were set on mount. Some browsers are more willing to start a muted autoplay video.
    v.autoplay = true
    let attempt: Promise<void> | undefined
    try {
      attempt = v.play()
    } catch {
      return
    }
    attempt?.then(() => setProblem(null)).catch((err: unknown) => {
      const name = (err as DOMException | undefined)?.name
      if (name === 'NotAllowedError') setProblem('blocked')
      else if (name === 'NotSupportedError') setProblem('unsupported')
      else if (wantedRef.current && retries.current++ < 3) {
        // AbortError and friends: our own pause() or a reload interrupted this attempt. If playback is still wanted, go again.
        window.setTimeout(() => {
          const el = ref.current
          if (wantedRef.current && el?.paused) start()
        }, 120)
      }
    })
  }, [prepare])

  // The one rule: play when wanted, pause when not.
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!wanted) {
      v.pause()
      return
    }
    if (problem === 'blocked') return // waiting for a gesture, see below
    retries.current = 0
    start()
  }, [wanted, problem, start])

  // Blocked: the browser wants a gesture first. Retry on the next tap, click or key press anywhere (it counts as one).
  useEffect(() => {
    if (problem !== 'blocked' || !wanted) return
    const retry = () => start()
    const events = ['pointerdown', 'touchend', 'click', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, retry, { passive: true }))
    return () => events.forEach((e) => window.removeEventListener(e, retry))
  }, [problem, wanted, start])

  // On screen? Close to the screen? Two observers, so the file starts downloading before it is needed.
  useEffect(() => {
    const v = ref.current
    if (!v) return
    let nudge = 0
    const fetchAhead = () => {
      v.preload = 'auto' // browsers that honour a preload change start downloading right away
      // For any that do not, nudge once. Never while a download is already running or playing: load() would restart the request.
      nudge = window.setTimeout(() => {
        if (v.readyState === 0 && v.networkState !== HTMLMediaElement.NETWORK_LOADING && v.paused) v.load()
      }, 400)
    }
    if (typeof IntersectionObserver === 'undefined') {
      fetchAhead()
      setInView(true)
      return () => window.clearTimeout(nudge)
    }
    let near: IntersectionObserver | undefined
    let on: IntersectionObserver | undefined
    try {
      near = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            fetchAhead()
            near?.disconnect()
          }
        },
        { rootMargin: FETCH_AHEAD },
      )
      on = new IntersectionObserver(
        ([e]) => setInView(e.intersectionRatio >= PLAY_RATIO || e.intersectionRect.height >= window.innerHeight * 0.5),
        { threshold: [0, PLAY_RATIO, 0.5] },
      )
      near.observe(v)
      on.observe(v)
    } catch {
      fetchAhead()
      setInView(true)
    }
    return () => {
      near?.disconnect()
      on?.disconnect()
      window.clearTimeout(nudge)
    }
  }, [])

  // Hidden tab: stop (saves battery), resume when the tab is visible again.
  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      ref.current?.pause()
    }
  }, [])

  // Before any attempt, and whatever React did with the `muted` prop, the attribute must be present.
  useEffect(() => {
    if (ref.current) prepare(ref.current)
  }, [prepare])

  return (
    <video
        ref={ref}
        className={className}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        tabIndex={-1}
        onPlaying={() => setProblem(null)}
        onError={() => ref.current?.error && setProblem('unsupported')}
      />
  )
}
