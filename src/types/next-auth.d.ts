import { FortyTwoCursus } from 'forty-two'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      cursus: FortyTwoCursus
    } & DefaultSession['user']
  }

  interface User {
    cursus: FortyTwoCursus
  }
}
