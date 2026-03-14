'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  Loader2,
  Rocket,
  Landmark,
  LogIn,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
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
    <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)] px-4 py-8">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--primary-deep)] opacity-[0.03] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[var(--success)] opacity-[0.04] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-deep)] shadow-lg shadow-[var(--primary-deep)]/20"
          >
            <ShieldCheck className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-[2rem] font-bold tracking-tight text-[var(--primary-deep)]">
            Real Holat
          </h1>
          <p className="mt-1 text-base text-[var(--muted)]">
            Fuqarolar monitoring platformasi
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl shadow-black/5 border-0 ring-1 ring-black/[0.06]">
          <CardContent className="space-y-6 p-6 pt-6">
            {/* Demo Section */}
            <div className="space-y-3">
              <p className="text-center text-sm font-medium text-[var(--muted)] uppercase tracking-wider">
                Tezkor kirish
              </p>

              {/* Citizen Demo Button */}
              <motion.div whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => handleDemoLogin('citizen')}
                  disabled={loading !== null}
                  className="group relative flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 text-[1.05rem] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:brightness-105 active:translate-y-px disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading === 'citizen' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Rocket className="h-5 w-5" />
                      <span>Demo rejimida kirish</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-60 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </motion.div>

              {/* Government Demo Button */}
              <motion.div whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => handleDemoLogin('government')}
                  disabled={loading !== null}
                  className="group relative flex h-14 w-full items-center justify-center gap-3 rounded-xl border-2 border-[var(--primary-deep)]/20 bg-[var(--primary-deep)]/5 px-6 text-[1.05rem] font-semibold text-[var(--primary-deep)] transition-all hover:border-[var(--primary-deep)]/30 hover:bg-[var(--primary-deep)]/10 active:translate-y-px disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading === 'government' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Landmark className="h-5 w-5" />
                      <span>Davlat xodimi sifatida kirish</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-60 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <Separator className="flex-1" />
              <span className="mx-4 text-sm text-[var(--muted)] select-none">yoki</span>
              <Separator className="flex-1" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading !== null}
                  className="h-12 rounded-xl px-4 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
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
                    className="h-12 rounded-xl px-4 pr-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-foreground transition-colors"
                    tabIndex={-1}
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
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100"
                >
                  {error}
                </motion.div>
              )}

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading !== null}
                  className="h-14 w-full rounded-xl text-[1.05rem] font-semibold shadow-md shadow-black/10 hover:shadow-lg transition-all"
                >
                  {loading === 'login' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Kirish
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-[var(--muted)]">
              Hisobingiz yo&apos;qmi?{' '}
              <Link
                href="/auth/signup"
                className="font-semibold text-[var(--primary-deep)] underline-offset-4 hover:underline transition-colors"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--muted)]/60">
          Real Holat &copy; 2026. Barcha huquqlar himoyalangan.
        </p>
      </motion.div>
    </div>
  )
}
