import { signOut } from '@/auth'
import { Session } from 'next-auth'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

function UserSkeleton() {
  return <Skeleton className="size-10 rounded-full" />
}

function UserAvatar({ imageUrl }: { imageUrl: string }) {
  return (
    <Avatar className="size-10 cursor-pointer" role="button" tabIndex={0}>
      <span className="sr-only">Toggle user settings</span>
      <AvatarImage src={imageUrl} alt="User's avatar" />
      <AvatarFallback asChild>
        <UserSkeleton />
      </AvatarFallback>
    </Avatar>
  )
}

export type UserManagementProps = {
  session: Session | null
}

export function UserManagement({ session }: UserManagementProps) {
  if (session == null) {
    return <span className="size-10 rounded-full" />
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
            await signOut({ redirectTo: '/' })
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
