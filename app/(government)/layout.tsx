import { Badge } from '@/components/ui/badge'
import { GovSignOutButton } from '@/components/government/sign-out-button'

export default function GovernmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      {/* Top nav bar */}
      <header className="sticky top-0 z-40 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-lg font-bold"
            >
              Real Holat
            </span>
            <Badge
              variant="secondary"
              className="bg-white/10 text-white/80 border-0"
            >
              Boshqaruv paneli
            </Badge>
          </div>
          <GovSignOutButton />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
