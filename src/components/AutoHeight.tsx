import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * Animates its own height to follow its content, so switching between differently sized panels eases the content below
 * into its new position instead of making it jump. Overflow is only clipped while the height is moving, so focus rings
 * are never cut off at rest. Window resizes are followed instantly.
 */
export function AutoHeight({ children, className }: { children: ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const [moving, setMoving] = useState(false)
  const resizingUntil = useRef(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onResize = () => {
      resizingUntil.current = performance.now() + 200
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    setHeight(el.offsetHeight)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const instant = reduce || performance.now() < resizingUntil.current
  return (
    <motion.div
      className={className}
      style={{ overflow: moving ? 'hidden' : 'visible' }}
      initial={false}
      animate={{ height: height ?? 'auto' }}
      transition={{ duration: instant ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      onAnimationStart={() => setMoving(true)}
      onAnimationComplete={() => setMoving(false)}
    >
      <div ref={inner}>{children}</div>
    </motion.div>
  )
}
