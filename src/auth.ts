import { parseCursus } from '@/lib/forty-two/forty-two'
import { kv } from '@vercel/kv'
import NextAuth, { type User } from 'next-auth'
import { type Provider } from 'next-auth/providers'
import FortyTwo, { type FortyTwoProfile } from 'next-auth/providers/42-school'
import Credentials from 'next-auth/providers/credentials'
import { FortyTwoCursusId, type FortyTwoCursus } from './types/forty-two'

const SESSION_MAX_AGE = 24 * 60 * 60 // (24 hours)

const providers: Array<Provider> = [
  FortyTwo({
    id: '42',
    clientId: process.env.AUTH_42_SCHOOL_ID,
    clientSecret: process.env.AUTH_42_SCHOOL_SECRET,

    async profile(profile: FortyTwoProfile, tokens): Promise<User> {
      const cursus = await parseCursus(profile, tokens.access_token as string)

      try {
        await kv.set(`cursus:${profile.login}`, cursus, { ex: SESSION_MAX_AGE })
      } catch (error) {
        process.stderr.write(`Error setting cursus: ${error}\n`)
        return Promise.reject(error)
      }

      return {
        login: profile.login,
        image: profile.image.versions.small
      }
    }
  })
]

if (process.env.NODE_ENV === 'development') {
  providers.push(
    Credentials({
      id: 'credentials',
      credentials: {},

      async authorize(): Promise<User | null> {
        const cursus: FortyTwoCursus = {
          id: FortyTwoCursusId.MAIN,
          name: 'Development',
          slug: 'development',

          level: 10.0,

          events: 5,
          projects: {}
        }

        try {
          await kv.set('cursus:developer', cursus, { ex: SESSION_MAX_AGE })
        } catch (error) {
          process.stderr.write(`Error setting cursus: ${error}\n`)
          return Promise.reject(error)
        }

        return {
          login: 'developer'
        }
      }
    })
  )
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
  unstable_update: update
} = NextAuth({
  basePath: '/auth',
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/auth/'
  },
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE
  },

  providers: providers,

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.login = user.login
      }

      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.login = token.login
      }

      return session
    }
  }
})
