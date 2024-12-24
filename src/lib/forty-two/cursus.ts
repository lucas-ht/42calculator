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
    process.stderr.write(`Error getting cursus: ${error}\n`);
  }

  return cursus;
}
