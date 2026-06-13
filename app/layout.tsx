import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Howard Endo Fellowship',
  description:
    'Internal program tool for the Howard University Hospital Endocrinology, Diabetes & Metabolism fellowship: evaluations, progress tracking, and program materials.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
