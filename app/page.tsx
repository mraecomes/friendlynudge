import { redirect } from 'next/navigation'

/**
 * Root page — redirects immediately to login.
 * The middleware handles redirecting authenticated users from /login to /dashboard.
 */
export default function RootPage() {
  redirect('/login')
}
