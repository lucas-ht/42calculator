import { parseCursus } from "@/lib/forty-two/forty-two-user";
import NextAuth, { type User } from "next-auth";
import type { Provider } from "next-auth/providers";
import FortyTwo, { type FortyTwoProfile } from "next-auth/providers/42-school";
import Credentials from "next-auth/providers/credentials";
import { type FortyTwoCursus, FortyTwoCursusId } from "./types/forty-two";
import { track } from "@vercel/analytics/server";
import { after } from "next/server";
import { redis } from "@/redis";

export const isDevelopment =
  process.env.VERCEL_ENV === "development" ||
  process.env.VERCEL_ENV === "preview";

const SESSION_MAX_AGE = 24 * 60 * 60; // (24 hours)

const providers: Provider[] = [
  FortyTwo({
    id: "42",
    clientId: process.env.AUTH_42_SCHOOL_ID,
    clientSecret: process.env.AUTH_42_SCHOOL_SECRET,

    profile(profile: FortyTwoProfile, tokens): User {
      after(async () => {
        const cursus = await parseCursus(
          profile,
          tokens.access_token as string,
        );

        try {
          await redis.set(`cursus:${profile.login}`, cursus, {
            ex: SESSION_MAX_AGE,
          });
        } catch (error) {
          return Promise.reject(error);
        }
      });

      return {
        login: profile.login,
        image: profile.image.versions.small,
      };
    },
  }),
];

if (isDevelopment) {
  providers.push(
    Credentials({
      id: "credentials",
      credentials: {},

      async authorize(): Promise<User | null> {
        const cursus: FortyTwoCursus = {
          id: FortyTwoCursusId.MAIN,
          name: "Development",
          slug: "development",

          level: 10.0,

          events: 5,
          projects: {},
        };

        try {
          await redis.set("cursus:developer", cursus, { ex: SESSION_MAX_AGE });
        } catch (error) {
          return Promise.reject(error);
        }

        return {
          login: "developer",
        };
      },
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: "/auth",
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/auth/",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },

  providers: providers,

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.login = user.login;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.login = token.login;
      }

      return session;
    },
  },

  events: {
    signIn(params) {
      if (!("user" in params && params.user)) {
        return;
      }
      const { user } = params;

      after(async () => {
        await track("sign-in", {
          login: user.login,
        });
      });
    },

    async signOut(params) {
      if (!("token" in params && params.token?.login)) {
        return;
      }

      const { token } = params;
      await redis.del(`cursus:${token.login}`);

      after(async () => {
        await track("sign-out", {
          login: token.login as string,
        });
      });
    },
  },
});
