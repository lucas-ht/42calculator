import { signIn } from '@/auth'
import FortyTwo from '@/components/icons/FortyTwo'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function SignIn() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Access the calculator with your 42 account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <form
          action={async () => {
            'use server'
            await signIn('42-school')
          }}
        >
          <Button variant="secondary">
            <FortyTwo className="mr-4 h-6" />
            Sign in with 42
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default SignIn
