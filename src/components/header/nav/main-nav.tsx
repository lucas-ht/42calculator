"use client";

import { cn } from "@/lib/utils";
import type { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "./links";

export interface MainNavProps {
  session: Session | null;
}

export function MainNav({ session }: MainNavProps) {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <nav className="flex items-center gap-4 font-medium text-sm lg:gap-6">
        {navLinks.map((link) => {
          if (link.isProtected && session == null) {
            return null;
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href
                  ? "text-foreground"
                  : "text-foreground/60",
                link.className,
              )}
            >
              {link.text}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
