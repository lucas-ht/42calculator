import { auth, signIn } from '@/auth'

function SignIn() {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('42-school')
      }}
    >
      <button type="submit">Sign in with 42</button>
    </form>
  )
}

export default async function Home() {
  const session = await auth()

  console.log(`page: ${JSON.stringify(session?.user)}`)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignIn></SignIn>
    </main>
  )
}
