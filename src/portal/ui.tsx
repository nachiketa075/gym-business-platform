import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { Status } from './data'

export const field =
  'mt-2 block min-h-12 w-full border border-line bg-ink-2 px-4 text-base text-white placeholder:text-white/35 transition-colors focus:border-lime focus:outline-none'

const chip: Record<Status, string> = {
  active: 'border-lime/60 text-lime',
  expiring: 'border-[#ffb547]/70 text-[#ffb547]',
  expired: 'border-[#ff6b6b]/70 text-[#ff8a8a]',
}
const chipText: Record<Status, string> = { active: 'Active', expiring: 'Expiring soon', expired: 'Expired' }

export function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`inline-block whitespace-nowrap border px-2.5 py-1 text-xs font-semibold uppercase tracking-widest ${chip[status]}`}>
      {chipText[status]}
    </span>
  )
}

export function Block({ title, kicker, children, action }: { title: string; kicker?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-line pt-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {kicker && <p className="eyebrow">{kicker}</p>}
          <h2 className="display mt-2 text-4xl sm:text-5xl">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </motion.section>
  )
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="px-1 py-5 sm:px-6 sm:first:pl-0">
      <dt className="eyebrow !text-mute">{label}</dt>
      <dd className="display mt-2 text-5xl sm:text-6xl">{value}</dd>
      {hint && <p className="mt-1 text-sm text-mute">{hint}</p>}
    </div>
  )
}

export const Stats = ({ children }: { children: ReactNode }) => (
  <dl className="grid grid-cols-2 divide-x divide-y divide-line border-y border-line sm:grid-cols-4 sm:divide-y-0 [&>div:nth-child(odd)]:border-l-0">
    {children}
  </dl>
)

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-line p-6 text-mute">{children}</p>
}
