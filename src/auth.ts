import { parseCursus } from '@/lib/forty-two/forty-two'
import { kv } from '@vercel/kv'
import NextAuth, { type User } from 'next-auth'
import FortyTwo, { FortyTwoProfile } from 'next-auth/providers/42-school'

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
    maxAge: 24 * 60 * 60 // (24 hours)
  },

  providers: [
    FortyTwo({
      clientId: process.env.AUTH_42_SCHOOL_ID,
      clientSecret: process.env.AUTH_42_SCHOOL_SECRET,

      async profile(profile: FortyTwoProfile, tokens): Promise<User> {
        const cursus = await parseCursus(profile, tokens.access_token as string)

        try {
          await kv.set(`cursus:${profile.login}`, cursus, { ex: 24 * 60 * 60 })
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
  ],

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
