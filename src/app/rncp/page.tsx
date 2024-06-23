import { auth } from '@/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getFortyTwoProjects } from '@/lib/forty-two/forty-two-projects'
import { getFortyTwoTitles } from '@/lib/forty-two/forty-two-rncp'
import { FortyTwoStoreProvider } from '@/providers/forty-two-store-provider'
import { FortyTwoCursus } from '@/types/forty-two'
import { kv } from '@vercel/kv'
import { Suspense } from 'react'
import { Titles } from './rncp'

function TitleSkeleton() {
  return <Skeleton className="h-[246.5px] w-full" />
}

async function Title() {
  const session = await auth()

  let cursus: FortyTwoCursus | undefined = undefined
  try {
    cursus = (await kv.get(`cursus:${session?.user.login}`)) ?? undefined
  } catch (error) {
    process.stderr.write(`Error getting cursus: ${error}\n`)
  }

  const projects = await getFortyTwoProjects()
  const titles = await getFortyTwoTitles()

  return (
    <FortyTwoStoreProvider cursus={cursus} titles={titles} projects={projects}>
      <Titles />
    </FortyTwoStoreProvider>
  )
}

export default function TitlePage() {
  return (
    <main className="container flex grow items-start justify-center p-4 md:p-12 lg:p-24">
      <Card className="w-full bg-card/5 backdrop-blur">
        <CardHeader>
          <CardTitle tag="h1">RNCP</CardTitle>
          <CardDescription>
            Calculate your level based on your future 42 projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <Suspense fallback={<TitleSkeleton />}>
            <Title />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  )
}
