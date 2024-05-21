import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import GitHub from '../icons/GitHub'

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-10 max-w-screen-2xl items-center justify-center gap-4 py-2">
        <Link href="/privacy-policy">
          <div className="truncate text-xs text-muted-foreground transition-colors hover:text-foreground">
            Privacy Policy
          </div>
        </Link>
        <Separator orientation="vertical" />
        <Link href="https://github.com/lucas-ht/42calculator">
          <div className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground">
            <div className="truncate text-xs">Checkout the Code</div>
            <GitHub className="ml-2 h-4" />
          </div>
        </Link>
      </div>
    </footer>
  )
}

export default Footer
