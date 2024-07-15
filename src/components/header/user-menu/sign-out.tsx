import { signOut } from '@/auth'
import { Button } from '@/components/ui/button'

export function SignOut() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/' })
      }}
      className="size-full"
    >
      <Button type="submit" variant="ghost" className="size-full justify-start">
        Sign out
      </Button>
    </form>
  )
}
