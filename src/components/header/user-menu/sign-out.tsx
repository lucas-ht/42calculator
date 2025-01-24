import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { kv } from "@vercel/kv";
import type { Session } from "next-auth";

export function SignOut({ session }: { session: Session }) {
  return (
    <form
      action={async () => {
        "use server";
        await kv.del(`cursus:${session.user.login}`);
        await signOut({ redirectTo: "/" });
      }}
      className="size-full"
    >
      <Button
        type="submit"
        variant="ghost"
        className="size-full justify-start"
      >
        Sign out
      </Button>
    </form>
  );
}
