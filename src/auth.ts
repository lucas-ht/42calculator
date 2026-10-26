import { parseCursus } from "@/lib/forty-two/forty-two-user";
import { kv } from "@vercel/kv";
import NextAuth, { type User } from "next-auth";
import type { Provider } from "next-auth/providers";
import FortyTwo, { type FortyTwoProfile } from "next-auth/providers/42-school";
import Credentials from "next-auth/providers/credentials";
import { type FortyTwoCursus, FortyTwoCursusId } from "./types/forty-two";
import { track } from "@vercel/analytics/server";
import { after } from "next/server";

export const isDevelopment =
  process.env.VERCEL_ENV === "development" ||
  process.env.VERCEL_ENV === "preview";

const SESSION_MAX_AGE = 24 * 60 * 60; // (24 hours)

const providers: Provider[] = [
  FortyTwo({
    id: "42",
    clientId: process.env.AUTH_42_SCHOOL_ID,
    clientSecret: process.env.AUTH_42_SCHOOL_SECRET,

    async profile(profile: FortyTwoProfile, tokens): Promise<User> {
      // Fetch and store the cursus *before* returning, so it is available on
      // the very first render after sign-in. Deferring this with after() let
      // the redirect to /calculator read the cache before the write landed,
      // which showed a level of 0 until the page was refreshed.
      try {
        const cursus = await parseCursus(
          profile,
          tokens.access_token as string,
        );

        await kv.set(`cursus:${profile.login}`, cursus, {
          ex: SESSION_MAX_AGE,
        });
      } catch (error) {
        // Don't block sign-in if the cursus can't be fetched or stored; the UI
        // falls back to defaults until the data becomes available.
        console.error(
          `[auth] Could not store cursus for "${profile.login}". ` +
            `Verify KV_REST_API_URL (${process.env.KV_REST_API_URL}) is reachable ` +
            `from this container and KV_REST_API_TOKEN matches the proxy. Cause: ${error}`,
        );
      }

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
          await kv.set("cursus:developer", cursus, { ex: SESSION_MAX_AGE });
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
  // Self-hosted behind a reverse proxy (Coolify/Traefik): trust the
  // X-Forwarded-Host header so Auth.js doesn't reject the request host.
  trustHost: true,
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
      await kv.del(`cursus:${token.login}`);

      after(async () => {
        await track("sign-out", {
          login: token.login as string,
        });
      });
    },
  },
});
