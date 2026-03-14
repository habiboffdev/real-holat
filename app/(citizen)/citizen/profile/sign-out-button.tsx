'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { UZ } from '@/lib/constants/uzbek'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      className="flex items-center justify-center gap-2.5 text-coral hover:bg-coral/8 rounded-xl h-14 w-full border-2 border-coral/15 font-bold text-[0.95rem] transition-all duration-200 hover:border-coral/30"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      <LogOut className="h-4.5 w-4.5" />
      {UZ.profile_signout}
    </Button>
  )
}
