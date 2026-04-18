import { redirect } from 'next/navigation'

/**
 * Root page — redirects immediately to login.
 * Once authentication is built (Issue #2), this will check for an active
 * Supabase session and redirect to /dashboard if the user is already logged in.
 */
export default function RootPage() {
  redirect('/login')
}
