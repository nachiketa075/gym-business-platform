import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

interface Props {
  src: string
  poster: string
  className?: string
  /** Names the media for the pause control, e.g. "conditioning video". */
  label: string
  controlClassName?: string
}

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Decorative looping video. Plays only while on screen, never autoplays for reduced-motion users,
 * and always offers a pause control (WCAG 2.2.2).
 */
export function AmbientVideo({ src, poster, className, label, controlClassName = 'bottom-4 right-4' }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(prefersReduced)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (visible && !paused) v.play().catch(() => setPaused(true))
    else v.pause()
  }, [visible, paused])

  return (
    <>
      <video
        ref={ref}
        className={className}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={`${paused ? 'Play' : 'Pause'} ${label}`}
        className={`absolute z-10 grid size-12 place-items-center border border-white/40 bg-ink/60 text-white transition-colors hover:border-lime hover:text-lime ${controlClassName}`}
      >
        {paused ? <Play aria-hidden className="size-5" /> : <Pause aria-hidden className="size-5" />}
      </button>
    </>
  )
}
