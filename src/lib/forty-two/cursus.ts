import { auth, signOut } from "@/auth";
import type { FortyTwoCursus } from "@/types/forty-two";
import { redis } from "@/redis";

export async function getFortyTwoCursus(): Promise<FortyTwoCursus | undefined> {
  "use server";
  const session = await auth();

  let cursus: FortyTwoCursus | undefined;
  try {
    cursus = (await redis.get(`cursus:${session?.user.login}`)) ?? undefined;
  } catch (error) {
    process.stderr.write(`Error getting cursus: ${error}\n`);
    await signOut();
  }

  return cursus;
}
