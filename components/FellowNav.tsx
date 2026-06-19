'use client'

// Shared fellow-facing section nav. Client component so it can highlight the
// active tab via usePathname() — every fellow page renders <FellowNav/> instead
// of duplicating the link bar.
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { href: string; label: string }

const ITEMS: NavItem[] = [
  { href: '/log', label: 'Logger' },
  { href: '/onboarding', label: 'Checklist' },
  { href: '/evaluations', label: 'Evaluations' },
  { href: '/resources', label: 'Materials' },
  { href: '/emergencies', label: 'Emergencies' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/account', label: 'Password' },
]

export default function FellowNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Sections"
      className="max-w-md mx-auto px-2 pb-1 flex gap-1 overflow-x-auto"
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'px-3 py-2 text-sm font-medium rounded-md text-[#003a63] bg-gray-100 whitespace-nowrap'
                : 'px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap'
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
