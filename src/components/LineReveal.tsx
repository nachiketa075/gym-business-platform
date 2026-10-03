import { useRef, type ReactNode } from 'react'
import { motion, useInView } from 'motion/react'

interface Props {
  lines: ReactNode[]
  className?: string
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean
  delay?: number
  as?: 'h1' | 'h2'
  id?: string
  lineClassNames?: string[]
}

/**
 * Masked line-by-line headline reveal (translate only, so reduced motion simply shows the text).
 * The heading itself is observed: its lines start clipped inside overflow-hidden wrappers, so observing them would never fire.
 */
export function LineReveal({ lines, className, immediate, delay = 0, as: Tag = 'h2', id, lineClassNames = [] }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const show = immediate || seen
  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="-my-[0.08em] block overflow-hidden py-[0.08em]">
          <motion.span
            className={`block ${lineClassNames[i] ?? ''}`}
            initial={{ y: '112%' }}
            animate={{ y: show ? 0 : '112%' }}
            transition={{ duration: 1, delay: delay + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
