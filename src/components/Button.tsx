import { ArrowUpRight } from 'lucide-react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'lime' | 'ghost' | 'dark'

const styles: Record<Variant, string> = {
  lime: 'bg-lime text-ink hover:bg-white',
  dark: 'bg-ink text-white hover:bg-white hover:text-ink',
  ghost: 'border border-white/40 text-white hover:border-lime hover:text-lime',
}

const classes = (variant: Variant, className: string) =>
  `group inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase tracking-[0.12em] transition-[color,background-color,border-color,translate,scale] duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] ${styles[variant]} ${className}`

const Arrow = () => (
  <ArrowUpRight
    aria-hidden
    className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
  />
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  arrow?: boolean
  children: ReactNode
}

/** For actions: opens a dialog, toggles something, submits a form. */
export function Button({ variant = 'lime', arrow = true, className = '', children, ...rest }: ButtonProps) {
  return (
    <button type="button" {...rest} className={classes(variant, className)}>
      {children}
      {arrow && <Arrow />}
    </button>
  )
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  arrow?: boolean
  children: ReactNode
}

/** For navigation: a real link (so it can be opened in a new tab) that looks like a Button. */
export function LinkButton({ variant = 'lime', arrow = true, className = '', children, ...rest }: LinkButtonProps) {
  return (
    <a {...rest} className={classes(variant, className)}>
      {children}
      {arrow && <Arrow />}
    </a>
  )
}
