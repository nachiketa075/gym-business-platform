import { ArrowUpRight } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'lime' | 'ghost' | 'dark'
  arrow?: boolean
  children: ReactNode
}

const styles = {
  lime: 'bg-lime text-ink hover:bg-white',
  dark: 'bg-ink text-white hover:bg-white hover:text-ink',
  ghost: 'border border-white/40 text-white hover:border-lime hover:text-lime',
}

export function Button({ variant = 'lime', arrow = true, className = '', children, ...rest }: Props) {
  return (
    <button
      type="button"
      {...rest}
      className={`group inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase tracking-[0.12em] transition-[color,background-color,border-color,transform] duration-300 active:scale-[0.97] ${styles[variant]} ${className}`}
    >
      {children}
      {arrow && (
        <ArrowUpRight
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      )}
    </button>
  )
}
