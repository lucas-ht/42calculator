import { auth, signIn } from '@/auth'
import FortyTwo from '@/components/icons/FortyTwo'
import { Button } from '@/components/ui/button'

function SignIn() {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('42-school')
      }}
    >
      <Button>
        <FortyTwo className="mr-4 h-6" />
        Sign in with 42
      </Button>
    </form>
  )
}

export default async function Home() {
  const session = await auth()

  // if (session != null)
  //   return <div>Already signed in</div>

  console.log(`page: ${JSON.stringify(session?.user)}`)

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <SignIn />
    </main>
  )
}
