import { signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { kv } from '@vercel/kv'
import { Session } from 'next-auth'

export interface SignOutProps {
  session: Session
}

export async function DeleteUser({ session }: SignOutProps) {
  return (
    <form
      action={async () => {
        'use server'
        await kv.del(`cursus:${session.user.login}`)
        await signOut({ redirectTo: '/' })
      }}
      className="size-full"
    >
      <Button
        type="submit"
        variant="ghost"
        className="size-full justify-start text-destructive hover:text-destructive"
      >
        Delete my information
      </Button>
    </form>
  )
}
