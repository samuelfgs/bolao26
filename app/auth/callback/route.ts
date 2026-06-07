import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/palpites'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // The user is synced to the 'users' table via a database trigger (handle_new_user)
      // Check if user has a name in metadata to decide if they need onboarding
      const hasName = !!(user.user_metadata.full_name || user.user_metadata.name);
      const redirectTo = hasName ? next : '/onboarding';

      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
