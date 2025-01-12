"use server";

// biome-ignore lint: The nodes functions are only used in the Node.js environment
import { promises as fs } from "node:fs";
// biome-ignore lint: The nodes functions are only used in the Node.js environment
import * as path from "node:path";

// biome-ignore lint: The any type is used here because the return type is JSON
export async function loadLocalData(prefix: string): Promise<any> {
  "use server";

  const filePath = path.join(process.cwd(), "data", `${prefix}.json`);
  const data = await fs.readFile(filePath, "utf-8");

  return JSON.parse(data);
}
