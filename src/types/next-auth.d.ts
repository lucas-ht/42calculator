import 'next-auth'
import { type DefaultUser } from 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User extends DefaultUser {
    login: string
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    login: string
  }
}
