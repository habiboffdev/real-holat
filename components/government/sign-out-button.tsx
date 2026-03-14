'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function GovSignOutButton() {
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
      variant="ghost"
      onClick={handleSignOut}
      className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
    >
      <LogOut className="h-4 w-4" />
      Chiqish
    </Button>
  )
}
