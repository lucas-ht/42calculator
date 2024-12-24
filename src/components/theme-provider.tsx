'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { Suspense } from 'react'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <Suspense>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </Suspense>
  )
}
