'use client'

import Link from 'next/link'

import ThemeToggle from './theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/">
          <h1 className="font-bold">42Calculator</h1>
        </Link>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
