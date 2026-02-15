import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Error:', error)
    return redirect('/error')
  }

  return redirect(data.url)
}
