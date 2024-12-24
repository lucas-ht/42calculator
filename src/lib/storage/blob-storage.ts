import type { StorageService } from "@/types/storage";
import { list } from "@vercel/blob";

// biome-ignore lint: The any type is used here because the return type is JSON
async function loadData(prefix: string): Promise<any> {
  "use server";
  process.stdout.write(`Loading ${prefix} from blob storage\n`);

  const { blobs } = await list({
    token: process.env.BLOB_READ_WRITE_TOKEN,
    prefix: prefix,
  });

  const response = await fetch(blobs[0].url);
  if (!response.ok) {
    throw new Error("Failed to load data");
  }

  return await response.json();
}

export class BlobStorageService implements StorageService {
  // biome-ignore lint: The any type is used here because the return type is JSON
  async load(prefix: string): Promise<any> {
    return loadData(prefix);
  }
}
