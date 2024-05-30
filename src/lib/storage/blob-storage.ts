import { StorageService } from '@/types/storage'
import { list } from '@vercel/blob'

export class BlobStorageService implements StorageService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async load(prefix: string): Promise<any> {
    process.stdout.write(`Loading ${prefix} from blob storage\n`)

    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: prefix
    })

    const response = await fetch(blobs[0].url)
    if (!response.ok) {
      throw new Error('Failed to load data')
    }

    return await response.json()
  }
}
