import { BottomNav } from '@/components/citizen/bottom-nav'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-topo relative">
      {/* Subtle top gradient overlay for depth */}
      <div className="fixed top-0 inset-x-0 h-24 bg-gradient-to-b from-white/60 to-transparent pointer-events-none z-10" />

      <main className="pb-28 relative z-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
