import type { CSSProperties, ReactNode } from 'react'

/** Wipe-and-settle image entrance: the frame opens while the photo eases down from a slight zoom. Rounded and clipped. */
export function ImageReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const style = delay ? ({ '--reveal-delay': `${Math.round(delay * 1000)}ms` } as CSSProperties) : undefined
  return (
    <div data-reveal="image" className={`rounded-media ${className ?? ''}`} style={style}>
      <div className="reveal-image-inner size-full">{children}</div>
    </div>
  )
}
