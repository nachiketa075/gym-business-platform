import { brand } from '../config/site'

/** Mark from the supplied logo plus a live-text wordmark (F and N picked out in the brand lime, as in the logo). */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 whitespace-nowrap ${className}`}>
      <img src="/brand/fitnation-mark.png" width={256} height={246} alt="" className="h-9 w-auto" />
      <span className="font-display text-[1.7rem] font-extrabold uppercase leading-none tracking-[0.06em]">
        <span className="text-lime">F</span>IT <span className="text-lime">N</span>ATION
      </span>
      <span className="sr-only">{brand.name}</span>
    </span>
  )
}
