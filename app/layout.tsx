import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vacationaire - Your Personalized Vacation Planner',
  description: 'Plan your perfect vacation with AI-powered recommendations and sustainability insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}