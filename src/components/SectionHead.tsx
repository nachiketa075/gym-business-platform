import type { ReactNode } from 'react'
import { LineReveal } from './LineReveal'
import { Reveal } from './Reveal'

export function SectionHead({
  index,
  label,
  lines,
  lineClassNames,
}: {
  index: string
  label: string
  lines: ReactNode[]
  lineClassNames?: string[]
}) {
  return (
    <div data-heading>
      <Reveal className="flex items-center gap-4">
        <span className="eyebrow">{index}</span>
        <span aria-hidden className="h-px w-10 bg-lime/60" />
        <span className="eyebrow !text-white/70">{label}</span>
      </Reveal>
      <LineReveal lines={lines} lineClassNames={lineClassNames} delay={0.08} className="display mt-6 text-[clamp(3.5rem,9vw,8rem)]" />
    </div>
  )
}
