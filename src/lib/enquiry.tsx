import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export interface EnquiryPreset {
  program?: string
  plan?: string
}
interface Ctx {
  isOpen: boolean
  preset: EnquiryPreset
  open: (preset?: EnquiryPreset) => void
  close: () => void
}

const EnquiryContext = createContext<Ctx | null>(null)

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [preset, setPreset] = useState<EnquiryPreset>({})
  const open = useCallback((p: EnquiryPreset = {}) => {
    setPreset(p)
    setOpen(true)
  }, [])
  const close = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ isOpen, preset, open, close }), [isOpen, preset, open, close])
  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>
}

export function useEnquiry() {
  const ctx = useContext(EnquiryContext)
  if (!ctx) throw new Error('useEnquiry must be used inside EnquiryProvider')
  return ctx
}
