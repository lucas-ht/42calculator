import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Session } from 'next-auth'
import { DeleteUser } from './delete-user'
import { SignOut } from './sign-out'
import { UserAvatar } from './user-avatar'

export type UserMenuProps = {
  session: Session | null
}

export function UserMenu({ session }: UserMenuProps) {
  if (session == null) {
    return <span className="size-10 rounded-full" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar imageUrl={session.user.image as string} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="p-0">
          <SignOut />
        </DropdownMenuItem>

        <DropdownMenuItem className="p-0">
          <DeleteUser session={session} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
