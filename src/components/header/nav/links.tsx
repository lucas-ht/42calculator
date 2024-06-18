export interface NavLink {
  text: string
  href: string
  className?: string
  isProtected?: boolean
}

export const navLinks: Array<NavLink> = [
  {
    text: '42calculator',
    href: '/',
    className: 'font-semibold text-foreground'
  },
  {
    text: 'Calculator',
    href: '/calculator',
    isProtected: true
  },
]
