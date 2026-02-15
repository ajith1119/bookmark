import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function POST(request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/')
}
