import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import GitHub from "../icons/GitHub";

export function Footer() {
  return (
    <footer className="@container flex w-full items-start justify-center border-border/40 border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="flex h-10 @max-[1400px]:w-full @min-[1400px]:w-[1400px] items-center justify-center gap-4 py-2">
        <Link href="/privacy-policy">
          <div className="truncate text-muted-foreground text-xs transition-colors hover:text-foreground">
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
  );
}

export default Footer;
