import type { StorageService } from "@/types/storage";
// biome-ignore lint: The nodes functions are only used in the Node.js environment
import { promises as fs } from "node:fs";
// biome-ignore lint: The nodes functions are only used in the Node.js environment
import * as path from "node:path";

// biome-ignore lint: The any type is used here because the return type is JSON
async function loadData(prefix: string): Promise<any> {
  "use server";
  process.stdout.write(`Loading ${prefix} from local storage\n`);

  const filePath = path.join(process.cwd(), "data", `${prefix}.json`);

  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

export class LocalStorageService implements StorageService {
  // biome-ignore lint: The any type is used here because the return type is JSON
  async load(prefix: string): Promise<any> {
    return loadData(prefix);
  }
}
