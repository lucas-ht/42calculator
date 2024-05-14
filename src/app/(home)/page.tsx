import { auth } from '@/auth'
import Calculator from '../(calculator)/calculator'
import SignIn from './sign-in'

export default async function Home() {
  const session = await auth()

  if (session == null) {
    return (
      <main className="container flex items-center justify-center p-4 lg:p-24">
        <SignIn />
      </main>
    )
  }

  return (
    <main className="container flex items-center justify-center p-4 lg:p-24">
      <Calculator />
    </main>
  )
}
