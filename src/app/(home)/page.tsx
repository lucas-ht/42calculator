import { auth } from '@/auth'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Calculator = dynamic(() => import('../(calculator)/calculator'), {
  loading: () => <Skeleton className="h-[365px] w-full md:h-[395px]" />
})

const SignIn = dynamic(() => import('./sign-in'), {
  loading: () => <Skeleton className="h-[164px] w-full" />
})

async function Loader() {
  const session = await auth()

  if (session == null) {
    return <SignIn />
  }

  return <Calculator />
}

export default function Home() {
  return (
    <main className="container flex grow items-start justify-center p-4 md:p-12 lg:p-24">
      <Suspense fallback={null}>
        <Loader />
      </Suspense>
    </main>
  )
}
