import Footer from '@/components/footer/footer'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import '@/styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { VercelToolbar } from '@vercel/toolbar/next'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import React, { StrictMode } from 'react'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: '42calculator',
  description: 'A calculator for the 42 curriculum'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const shouldInjectToolbar = process.env.NODE_ENV === 'development'
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex min-h-screen flex-col bg-background bg-[url('/hero-pattern.svg')] bg-[length:100px_100px] font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StrictMode>
            <Header />
            {children}
            <Footer />
          </StrictMode>
        </ThemeProvider>

        <Analytics />
        <SpeedInsights />
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  )
}
