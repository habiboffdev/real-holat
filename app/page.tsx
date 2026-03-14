import Link from 'next/link'
import { ArrowRight, BarChart3, Camera, CheckCircle2, Landmark, MapPin, ShieldCheck, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createSupabaseServer } from '@/lib/supabase/server'
import { AnimatedLandingHero } from '@/components/landing/animated-hero'

export default async function Home() {
  // Fetch live stats from Supabase
  const supabase = await createSupabaseServer()
  const { count: schoolCount } = await supabase
    .from('schools_cache')
    .select('*', { count: 'exact', head: true })

  const { count: inspectionCount } = await supabase
    .from('inspections')
    .select('*', { count: 'exact', head: true })

  const { data: inspections } = await supabase
    .from('inspections')
    .select('school_id')

  const uniqueDistricts = new Set<string>()
  // Fetch distinct districts from schools that have inspections
  const schoolIds = new Set((inspections || []).map(i => i.school_id))
  if (schoolIds.size > 0) {
    const { data: schools } = await supabase
      .from('schools_cache')
      .select('district')
      .in('id', Array.from(schoolIds))
    for (const s of schools || []) {
      if (s.district) uniqueDistricts.add(s.district)
    }
  }

  const stats = [
    { value: schoolCount || 0, suffix: '+', label: 'maktab' },
    { value: inspectionCount || 0, suffix: '+', label: 'tekshiruv' },
    { value: Math.max(uniqueDistricts.size, 1), suffix: '', label: 'tuman' },
  ]

  return (
    <div className="min-h-dvh bg-background relative overflow-hidden">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-navy flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-teal-light" />
          </div>
          <span
            className="text-xl font-bold tracking-tight text-navy"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Real Holat
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 cursor-pointer hover:bg-muted transition-colors">
              <BarChart3 className="h-3 w-3" />
              Ochiq dashboard
            </Badge>
          </Link>
          <Button
            className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Link href="/auth/login" className="flex items-center gap-2">
              Kirish
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <AnimatedLandingHero stats={stats} />

      {/* How It Works — 3-step visual flow */}
      <section className="relative z-10 px-6 py-16 md:px-12 lg:px-20 bg-muted/30 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 text-center"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Qanday ishlaydi
          </p>
          <h2
            className="text-center text-[1.5rem] md:text-[1.75rem] font-bold text-navy mb-10"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            3 oddiy qadam
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: '01',
                icon: <MapPin className="h-6 w-6" />,
                title: 'Maktabni toping',
                desc: "Xaritadan yoki ro'yxatdan o'z hududingizdagi maktabni tanlang",
                color: 'text-teal',
                bg: 'bg-teal/10',
              },
              {
                step: '02',
                icon: <Camera className="h-6 w-6" />,
                title: 'Tekshiring va suratga oling',
                desc: "Va'da qilingan ishlar bajarilganmi? Holatni suratga oling va xabar bering",
                color: 'text-amber',
                bg: 'bg-amber/10',
              },
              {
                step: '03',
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: 'Natijani ko\'ring',
                desc: "Dashboard real vaqtda yangilanadi. Hamma bir xil haqiqatni ko'radi",
                color: 'text-emerald',
                bg: 'bg-emerald/10',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center md:text-left">
                {/* Connector line between steps (desktop only) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 border-t-2 border-dashed border-border" />
                )}
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ${item.color} mb-4`}>
                  {item.icon}
                </div>
                <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wider mb-1">{item.step}</p>
                <h3
                  className="text-[1.05rem] font-bold text-navy mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {item.title}
                </h3>
                <p className="text-[0.85rem] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="rounded-2xl bg-navy text-white px-8 h-14 text-[0.95rem] font-semibold shadow-lg shadow-navy/20 hover:bg-navy-light hover:shadow-xl"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Hozir boshlash
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Zarina's Story */}
      <section className="relative z-10 px-6 py-16 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Story card */}
            <div className="rounded-2xl bg-navy p-8 md:p-10 text-white relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-[200px] w-[200px] rounded-full bg-teal opacity-[0.08] blur-[60px]" />
              <p className="text-[0.7rem] uppercase tracking-[0.15em] text-teal-light font-medium mb-4">Haqiqiy hikoya</p>
              <blockquote
                className="text-[1.15rem] md:text-[1.3rem] font-semibold leading-snug mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                &ldquo;Davlat maktabimizdagi hojatxonalarni ta&apos;mirlab berishga va&apos;da bergan. Ikki oy o&apos;tdi. Sovun idishlari bo&apos;sh, unitaz qopqoqlari singan.&rdquo;
              </blockquote>
              <p className="text-white/60 text-[0.85rem]">
                — Zarina, 45-maktab o&apos;qituvchisi
              </p>
            </div>

            {/* Solution */}
            <div>
              <h2
                className="text-[1.35rem] md:text-[1.5rem] font-bold text-navy mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Zarinaga minbar beryapmiz
              </h2>
              <div className="space-y-3">
                {[
                  { emoji: '📱', text: 'Telefonini ochadi' },
                  { emoji: '📷', text: 'Singan o\'rindiqni suratga oladi' },
                  { emoji: '⚡', text: '10 soniyada xabar beradi' },
                  { emoji: '📊', text: 'Buni ommaviy dashboardda ko\'radi' },
                  { emoji: '✅', text: 'Kimdir haqiqatan ham o\'qiyotganini biladi' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-[0.9rem] text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-xl text-teal border-teal/30 hover:bg-teal/5 gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Ochiq dashboardni ko&apos;rish
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entry Cards */}
      <section className="relative z-10 px-6 pb-16 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4 text-center"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Platformaga kirish
          </p>
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              {
                icon: <User className="h-5 w-5" />,
                title: 'Fuqaro',
                description: 'Maktabni tekshiring',
                href: '/auth/login?role=citizen',
                borderColor: 'border-l-teal',
                iconBg: 'bg-teal/10 text-teal',
              },
              {
                icon: <Landmark className="h-5 w-5" />,
                title: 'Davlat',
                description: 'Hisobotlarni ko\'ring',
                href: '/auth/login?role=government',
                borderColor: 'border-l-amber',
                iconBg: 'bg-amber/10 text-amber',
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                title: 'Jamoatchilik',
                description: 'Ochiq dashboard',
                href: '/dashboard',
                borderColor: 'border-l-emerald',
                iconBg: 'bg-emerald/10 text-emerald',
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`glass-card group flex flex-col gap-4 rounded-2xl border-l-4 ${card.borderColor} p-6 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                  {card.icon}
                </div>
                <div>
                  <h3
                    className="text-lg font-bold text-navy"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-teal transition-all group-hover:gap-2">
                  Ochish
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 pb-8 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            Real Holat &copy; 2026. Fuqarolar ishtirokidagi monitoring platformasi.
          </p>
        </div>
      </footer>

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-teal opacity-[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full bg-amber opacity-[0.05] blur-[100px]" />
    </div>
  )
}
