import { BottomNav } from '@/components/citizen/bottom-nav'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
