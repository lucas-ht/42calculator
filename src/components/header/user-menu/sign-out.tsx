import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function SignOut() {
  return (
    <Button
      variant="ghost"
      className="size-full justify-start"
      onClick={async () => {
        "use server";
        await signOut({ redirectTo: "/calculator" });
      }}
    >
      Sign out
    </Button>
  );
}
