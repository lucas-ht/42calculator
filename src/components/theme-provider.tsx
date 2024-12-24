"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Suspense } from "react";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <Suspense>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </Suspense>
  );
}
