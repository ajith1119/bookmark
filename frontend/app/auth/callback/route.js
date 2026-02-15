import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return redirect('/auth/auth-code-error')
}
