import { SignIn } from "@/app/(home)/sign-in";

export default function HomePage() {
  return (
    <main className="@container flex grow items-start justify-center p-4 md:p-12 lg:p-24">
      <SignIn />
    </main>
  );
}
