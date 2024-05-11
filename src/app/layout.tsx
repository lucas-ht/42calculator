import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import React from 'react'

import { ThemeProvider } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import '@/styles/globals.css'

import Header from '@/components/header'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: '42Calculator',
  description: 'A calculator for the 42 curriculum'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
