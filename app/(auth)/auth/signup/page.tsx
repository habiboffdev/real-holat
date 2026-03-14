'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  User,
  Landmark,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  School,
  MapPin,
} from 'lucide-react'

type Role = 'citizen' | 'government'

const districts = [
  'Yunusobod tumani',
  'Shayxontoxur tumani',
  'Chilonzor tumani',
  'Mirzo Ulug\'bek tumani',
]

// Placeholder schools -- will be populated from schools_cache later
const placeholderSchools: Record<string, { id: string; name: string }[]> = {
  'Yunusobod tumani': [
    { id: 'school-1', name: '1-son maktab' },
    { id: 'school-2', name: '56-son maktab' },
    { id: 'school-3', name: '110-son maktab' },
  ],
  'Shayxontoxur tumani': [
    { id: 'school-4', name: '5-son maktab' },
    { id: 'school-5', name: '23-son maktab' },
  ],
  'Chilonzor tumani': [
    { id: 'school-6', name: '12-son maktab' },
    { id: 'school-7', name: '89-son maktab' },
  ],
  'Mirzo Ulug\'bek tumani': [
    { id: 'school-8', name: '3-son maktab' },
    { id: 'school-9', name: '45-son maktab' },
  ],
}

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const totalSteps = selectedRole === 'citizen' ? 3 : 2

  const handleStep1 = () => {
    if (!name.trim()) {
      setError('Ismingizni kiriting.')
      return
    }
    if (!email.trim()) {
      setError('Email kiriting.')
      return
    }
    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleStep2 = () => {
    if (!selectedRole) {
      setError('Rolni tanlang.')
      return
    }
    setError('')
    if (selectedRole === 'citizen') {
      setStep(3)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    // 1. Sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('Bu email allaqachon ro\'yxatdan o\'tgan.')
      } else {
        setError('Ro\'yxatdan o\'tishda xatolik yuz berdi. Qayta urinib ko\'ring.')
      }
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Foydalanuvchi yaratilmadi.')
      setLoading(false)
      return
    }

    // 2. Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: name,
      role: selectedRole,
      district: selectedDistrict || null,
      school_id: selectedSchoolId || null,
    })

    if (profileError) {
      console.error('Profile insert error:', profileError)
      // Don't block -- the user is still signed up
    }

    // 3. Redirect
    router.push(selectedRole === 'citizen' ? '/citizen' : '/government')
    router.refresh()
  }

  const schools = selectedDistrict ? (placeholderSchools[selectedDistrict] || []) : []

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
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--primary-deep)]">
            Ro&apos;yxatdan o&apos;tish
          </h1>
          <p className="mt-1 text-base text-[var(--muted)]">
            Real Holat platformasiga qo&apos;shiling
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? 'w-8 bg-[var(--primary-deep)]'
                  : i + 1 < step
                  ? 'w-8 bg-emerald-500'
                  : 'w-2 bg-black/10'
              }`}
            />
          ))}
        </div>

        {/* Main Card */}
        <Card className="shadow-xl shadow-black/5 border-0 ring-1 ring-black/[0.06]">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Credentials */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      Shaxsiy ma&apos;lumotlar
                    </h2>
                    <p className="text-sm text-[var(--muted)]">
                      Asosiy ma&apos;lumotlaringizni kiriting
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">To&apos;liq ism</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ismingizni kiriting"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 rounded-xl px-4 text-base"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl px-4 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Parol</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Kamida 6 ta belgi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                      onClick={handleStep1}
                      className="h-14 w-full rounded-xl text-[1.05rem] font-semibold shadow-md shadow-black/10"
                    >
                      Davom etish
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Role Selection */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      Rolni tanlang
                    </h2>
                    <p className="text-sm text-[var(--muted)]">
                      Platformadan qanday foydalanmoqchisiz?
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {/* Citizen Card */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRole('citizen')}
                      className={`group relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                        selectedRole === 'citizen'
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                          : 'border-black/[0.08] hover:border-black/20 hover:bg-muted/30'
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          selectedRole === 'citizen'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-[var(--muted)]'
                        }`}
                      >
                        <User className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold">Fuqaroman</span>
                          {selectedRole === 'citizen' && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-[var(--muted)]">
                          Men maktabni tekshirmoqchiman
                        </p>
                      </div>
                    </motion.button>

                    {/* Government Card */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRole('government')}
                      className={`group relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                        selectedRole === 'government'
                          ? 'border-[var(--primary-deep)] bg-[var(--primary-deep)]/5 ring-2 ring-[var(--primary-deep)]/20'
                          : 'border-black/[0.08] hover:border-black/20 hover:bg-muted/30'
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          selectedRole === 'government'
                            ? 'bg-[var(--primary-deep)] text-white'
                            : 'bg-muted text-[var(--muted)]'
                        }`}
                      >
                        <Landmark className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold">Davlat xodimi</span>
                          {selectedRole === 'government' && (
                            <CheckCircle2 className="h-5 w-5 text-[var(--primary-deep)]" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-[var(--muted)]">
                          Men hisobotlarni ko&apos;rmoqchiman
                        </p>
                      </div>
                    </motion.button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setError('')
                        setStep(1)
                      }}
                      className="h-14 flex-1 rounded-xl text-base font-medium"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Orqaga
                    </Button>
                    <motion.div whileTap={{ scale: 0.98 }} className="flex-[2]">
                      <Button
                        onClick={handleStep2}
                        disabled={!selectedRole || loading}
                        className="h-14 w-full rounded-xl text-[1.05rem] font-semibold shadow-md shadow-black/10"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : selectedRole === 'citizen' ? (
                          <>
                            Davom etish
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </>
                        ) : (
                          'Tugatish'
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: School Selection (citizens only) */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      Maktabni tanlang
                    </h2>
                    <p className="text-sm text-[var(--muted)]">
                      Qaysi maktabni tekshirmoqchisiz?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--muted)]" />
                      Tuman
                    </Label>
                    <div className="relative">
                      <select
                        id="district"
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value)
                          setSelectedSchoolId('')
                        }}
                        className="h-12 w-full appearance-none rounded-xl border border-input bg-transparent px-4 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="">Tumanni tanlang</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school" className="flex items-center gap-2">
                      <School className="h-4 w-4 text-[var(--muted)]" />
                      Maktab
                    </Label>
                    <div className="relative">
                      <select
                        id="school"
                        value={selectedSchoolId}
                        onChange={(e) => setSelectedSchoolId(e.target.value)}
                        disabled={!selectedDistrict}
                        className="h-12 w-full appearance-none rounded-xl border border-input bg-transparent px-4 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {selectedDistrict
                            ? 'Maktabni tanlang'
                            : 'Avval tumanni tanlang'}
                        </option>
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setError('')
                        setStep(2)
                      }}
                      className="h-14 flex-1 rounded-xl text-base font-medium"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Orqaga
                    </Button>
                    <motion.div whileTap={{ scale: 0.98 }} className="flex-[2]">
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="h-14 w-full rounded-xl text-[1.05rem] font-semibold shadow-md shadow-black/10"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Tugatish
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Hisobingiz bormi?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-[var(--primary-deep)] underline-offset-4 hover:underline transition-colors"
          >
            Kirish
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-[var(--muted)]/60">
          Real Holat &copy; 2026. Barcha huquqlar himoyalangan.
        </p>
      </motion.div>
    </div>
  )
}
