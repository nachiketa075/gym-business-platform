import { createElement, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style'> {
  children: ReactNode
  /** Seconds. Keep staggers to about 0.08s a step. */
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'h2' | 'h3' | 'ul' | 'span' | 'section' | 'nav'
  /** up: fades in while rising a little. fade: opacity only. */
  variant?: 'up' | 'fade'
}

/** Marks content for the scroll-reveal system (lib/reveal.ts). The visual states live in index.css. */
export function Reveal({ children, delay = 0, className, as = 'div', variant = 'up', ...rest }: Props) {
  const style = delay ? ({ '--reveal-delay': `${Math.round(delay * 1000)}ms` } as CSSProperties) : undefined
  return createElement(as, { ...rest, className, 'data-reveal': variant, style }, children)
}
