import { auth } from "@/auth";
import { MainNav } from "./nav/main-nav";
import { MobileNav } from "./nav/mobile-nav";
import ThemeToggle from "./theme-toggle";
import UserMenu from "./user-menu/user-menu";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background md:bg-background/95 md:backdrop-blur-md md:supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav session={session} />
        <MobileNav session={session} />

        <div className="ml-auto flex items-center gap-x-4">
          <ThemeToggle />
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  );
}

export default Header;
