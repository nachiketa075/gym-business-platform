import { useEffect } from 'react'
import { LogOut, RotateCcw } from 'lucide-react'
import { navigate } from '../lib/route'
import { useScrollReveals } from '../lib/reveal'
import { Logo } from '../components/Logo'
import { DEMO_ACCOUNTS } from './data'
import { usePortal } from './store'
import { ClientView } from './ClientView'
import { TrainerView } from './TrainerView'
import { OwnerView } from './OwnerView'

export function Portal() {
  const { session, data, dispatch, signOut } = usePortal()
  useScrollReveals()

  useEffect(() => {
    if (!session) navigate('/login')
  }, [session])
  if (!session) return null

  const name =
    session.role === 'owner'
      ? 'Club owner'
      : session.role === 'trainer'
        ? data.trainers.find((t) => t.id === session.userId)?.name
        : data.members.find((m) => m.id === session.userId)?.name

  return (
    <div className="min-h-[100svh]">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/95">
        <div className="mx-auto flex h-16 max-w-[105rem] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/') }} aria-label="FIT NATION, back to the website">
            <Logo />
          </a>
          <div className="flex items-center gap-1 sm:gap-3">
            <p className="hidden text-right text-sm leading-tight sm:block">
              <span className="block font-medium">{name}</span>
              <span className="eyebrow">{DEMO_ACCOUNTS[session.role].label}</span>
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex min-h-11 items-center px-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/80 hover:text-lime max-sm:hidden"
            >
              Website
            </button>
            <button
              type="button"
              onClick={() => {
                signOut()
                navigate('/login')
              }}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap border border-white/40 px-4 text-sm font-semibold uppercase tracking-[0.12em] transition-colors hover:border-lime hover:text-lime max-[420px]:px-0"
            >
              <LogOut aria-hidden className="size-4" />
              <span className="max-[420px]:sr-only">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-line bg-ink-2">
        <p className="mx-auto flex max-w-[105rem] flex-wrap items-center justify-between gap-2 px-5 py-2 text-xs text-mute sm:px-8 lg:px-12">
          <span>Demo portal: simulated sign-in, data saved only in this browser.</span>
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className="inline-flex min-h-11 items-center gap-2 font-semibold uppercase tracking-widest hover:text-lime"
          >
            <RotateCcw aria-hidden className="size-3.5" /> Reset demo data
          </button>
        </p>
      </div>

      <main className="mx-auto max-w-[105rem] space-y-14 px-5 pb-24 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        {session.role === 'client' && <ClientView memberId={session.userId} />}
        {session.role === 'trainer' && <TrainerView trainerId={session.userId} />}
        {session.role === 'owner' && <OwnerView />}
      </main>
    </div>
  )
}
