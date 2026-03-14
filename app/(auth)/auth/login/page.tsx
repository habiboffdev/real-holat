'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Loader2,
  Landmark,
  LogIn,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<'citizen' | 'government' | 'login' | null>(null)

  const handleDemoLogin = async (role: 'citizen' | 'government') => {
    setLoading(role)
    setError('')
    const demoEmail = role === 'citizen' ? 'fuqaro@demo.uz' : 'davlat@demo.uz'
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: 'demo123',
    })
    if (error) {
      setError("Demo hisob topilmadi. Seed ma'lumotlarni tekshiring.")
      setLoading(null)
      return
    }
    router.push(role === 'citizen' ? '/citizen' : '/government')
    router.refresh()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email va parolni kiriting.')
      return
    }
    setLoading('login')
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setError("Email yoki parol noto'g'ri. Qayta urinib ko'ring.")
      setLoading(null)
      return
    }
    router.push('/citizen')
    router.refresh()
  }

  return (
    <div className="flex min-h-dvh">
      {/* LEFT HALF - Dark navy branding panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy p-12 lg:flex">
        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy via-navy-light/80 to-navy" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-teal opacity-[0.08] blur-[100px]" />
        <div className="pointer-events-none absolute -top-20 -left-20 h-[300px] w-[300px] rounded-full bg-amber opacity-[0.06] blur-[80px]" />

        {/* Wordmark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/20">
              <ShieldCheck className="h-5 w-5 text-teal-light" />
            </div>
            <span
              className="text-2xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Real Holat
            </span>
          </div>
        </div>

        {/* Mission quote */}
        <div className="relative z-10 max-w-md">
          <blockquote
            className="text-2xl font-semibold leading-snug text-white/90 md:text-3xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            &ldquo;Shaffoflik — bu davlat va fuqaro o&apos;rtasidagi ishonch
            ko&apos;prigi.&rdquo;
          </blockquote>
          <p className="mt-4 text-base text-white/50">
            Har bir fuqaroning ovozi muhim.
          </p>

          {/* Floating stat pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
              800+ maktab tekshirildi
            </div>
            <div className="rounded-full bg-teal/15 px-4 py-2 text-sm font-medium text-teal-light backdrop-blur-sm">
              12 tuman qamrab olingan
            </div>
            <div className="rounded-full bg-amber/15 px-4 py-2 text-sm font-medium text-amber backdrop-blur-sm">
              1400+ tekshiruv
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-xs text-white/30">
            Real Holat &copy; 2026
          </p>
        </div>
      </div>

      {/* RIGHT HALF - Login form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile-only branded header */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
              <ShieldCheck className="h-4 w-4 text-teal-light" />
            </div>
            <span
              className="text-lg font-bold text-navy"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Real Holat
            </span>
          </div>

          {/* Welcome */}
          <h1
            className="text-3xl font-extrabold tracking-tight text-navy md:text-4xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Xush kelibsiz
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Tizimga kirish uchun quyidagilardan birini tanlang
          </p>

          {/* Demo Buttons */}
          <div className="mt-8 space-y-3">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => handleDemoLogin('citizen')}
                disabled={loading !== null}
                className="group relative h-14 w-full rounded-2xl bg-gradient-to-r from-teal to-teal-light px-6 text-base font-semibold text-white shadow-lg shadow-teal/25 hover:shadow-xl hover:shadow-teal/30 hover:brightness-105"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {loading === 'citizen' ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Users className="h-5 w-5 shrink-0" />
                    <span>Fuqaro sifatida sinab ko&apos;ring</span>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-60 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('government')}
                disabled={loading !== null}
                className="group relative h-14 w-full rounded-2xl border-2 border-navy/20 bg-navy/5 px-6 text-base font-semibold text-navy hover:border-navy/30 hover:bg-navy/10"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {loading === 'government' ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Landmark className="h-5 w-5 shrink-0" />
                    <span>Davlat xodimi</span>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-60 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="relative my-8 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="mx-4 select-none text-sm text-muted-foreground">yoki</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading !== null}
                className="h-[52px] rounded-xl border-border px-4 text-base transition-colors focus-visible:border-teal focus-visible:ring-teal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Parol
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading !== null}
                  className="h-[52px] rounded-xl border-border px-4 pr-12 text-base transition-colors focus-visible:border-teal focus-visible:ring-teal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-medium text-coral ring-1 ring-coral/20">
                {error}
              </div>
            )}

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading !== null}
                className="h-14 w-full rounded-2xl bg-navy text-base font-semibold text-white shadow-md shadow-navy/20 hover:bg-navy-light hover:shadow-lg"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {loading === 'login' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Kirish
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Hisobingiz yo&apos;qmi?{' '}
            <Link
              href="/auth/signup"
              className="font-semibold text-teal underline-offset-4 transition-colors hover:underline"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
