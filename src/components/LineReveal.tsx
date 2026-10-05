import type { CSSProperties, ReactNode } from 'react'

interface Props {
  lines: ReactNode[]
  className?: string
  /** Seconds before the first line starts. */
  delay?: number
  as?: 'h1' | 'h2'
  id?: string
  lineClassNames?: string[]
}

/**
 * Headline that rises line by line from behind a mask (translate only). Hidden and revealed by the scroll-reveal
 * system, so it can never be left stuck under its mask. Lines stagger by 110ms in CSS.
 */
export function LineReveal({ lines, className, delay = 0, as: Tag = 'h2', id, lineClassNames = [] }: Props) {
  const style = delay ? ({ '--reveal-delay': `${Math.round(delay * 1000)}ms` } as CSSProperties) : undefined
  return (
    <Tag id={id} className={className} data-reveal="lines" style={style}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-line">
          <span className={`reveal-line-inner ${lineClassNames[i] ?? ''}`} style={{ '--line': i } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  )
}
