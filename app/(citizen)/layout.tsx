import { BottomNav } from '@/components/citizen/bottom-nav'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-topo">
      <main className="pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
