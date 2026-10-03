import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'h2' | 'h3'
}

/** Opacity + small translate reveal. MotionConfig(reducedMotion="user") strips the transform for reduced-motion users. */
export function Reveal({ children, delay = 0, className, as = 'div' }: Props) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  )
}
