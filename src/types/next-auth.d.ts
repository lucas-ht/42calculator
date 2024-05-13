import 'next-auth'
import 'next-auth/jwt'

import { FortyTwoCursus } from '@/types/forty-two'

declare module 'next-auth' {
  interface User {
    cursus?: FortyTwoCursus
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    cursus?: FortyTwoCursus
  }
}
