import { BottomNav } from '@/components/citizen/bottom-nav'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background relative selection:bg-teal/20">
      <main className="h-dvh h-screen w-full">
        {children}
      </main>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[100]">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
