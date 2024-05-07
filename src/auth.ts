import NextAuth from 'next-auth'
import FortyTwo from 'next-auth/providers/42-school'

import { ParseCursus } from '@/lib/forty-two'

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: '/auth',
  pages: {
    signIn: '/',
    signOut: '/'
  },

  providers: [
    FortyTwo({
      clientId: process.env.AUTH_42_SCHOOL_ID,
      clientSecret: process.env.AUTH_42_SCHOOL_SECRET,

      profile(profile) {
        return {
          name: profile.login,
          image: profile.image_url,
          cursus: ParseCursus(profile.cursus_users, profile.projects_users)
        }
      }
    })
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.cursus = user.cursus
      }

      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.cursus = token.cursus
      }

      return session
    }
  }
})
