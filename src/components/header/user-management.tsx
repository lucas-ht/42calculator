import { auth, signOut } from '@/auth'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

function UserAvatar({ imageUrl }: { imageUrl: string }) {
  return (
    <Avatar className="size-10 cursor-pointer">
      <AvatarImage src={imageUrl} alt="User avatar" />
      <AvatarFallback asChild>
        <Skeleton className="size-full rounded-full" />
      </AvatarFallback>
    </Avatar>
  )
}

export async function UserManagement() {
  const session = await auth()

  if (session == null) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar imageUrl={session.user.image as string} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <form
          action={async () => {
            'use server'
            console.log('signing out')
            await signOut()
          }}
        >
          <button type="submit" className="size-full">
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserManagement
