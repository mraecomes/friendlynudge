import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PM Tool',
  description: 'Dependency-aware Gantt timelines with automated deadline notifications.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#F8FAFC] text-[#111827] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
