import { auth } from "@/auth";
import type { FortyTwoCursus } from "@/types/forty-two";
import { kv } from "@vercel/kv";

export async function getFortyTwoCursus(): Promise<FortyTwoCursus | undefined> {
  "use server";
  const session = await auth();

  let cursus: FortyTwoCursus | undefined;
  try {
    cursus = (await kv.get(`cursus:${session?.user.login}`)) ?? undefined;
  } catch (error) {
    // This runs during Server Component render, so we cannot mutate cookies
    // here (e.g. via signOut()). Fail gracefully and let the caller render
    // without a cursus instead of crashing the page.
    process.stderr.write(
      `[cursus] Could not reach the KV store at ${process.env.KV_REST_API_URL} ` +
        `while reading cursus for "${session?.user.login}". ` +
        `Verify KV_REST_API_URL is reachable from this container (not localhost) ` +
        `and KV_REST_API_TOKEN matches the proxy. Cause: ${error}\n`,
    );
  }

  return cursus;
}
