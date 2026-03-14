'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
    <button
      type="button"
      onClick={handleSignOut}
      className="text-coral hover:bg-coral/10 rounded-xl h-12 w-full border border-coral/20 font-medium transition-colors"
    >
      {UZ.profile_signout}
    </button>
  )
}
