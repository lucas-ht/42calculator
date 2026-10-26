import { SignIn } from "@/app/(home)/sign-in";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Already signed in? Skip the login card and go straight to the calculator.
  const session = await auth();
  if (session?.user) {
    redirect("/calculator");
  }

  return (
    <main className="@container flex grow items-start justify-center p-4 md:p-12 lg:p-24">
      <SignIn />
    </main>
  );
}
