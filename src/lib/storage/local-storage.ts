import { StorageService } from '@/types/storage'
import { promises as fs } from 'fs'
import * as path from 'path'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadData(prefix: string): Promise<any> {
  'use server'
  process.stdout.write(`Loading ${prefix} from local storage\n`)

  const filePath = path.join(process.cwd(), 'data', `${prefix}.json`)

  const data = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(data)
}

export class LocalStorageService implements StorageService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async load(prefix: string): Promise<any> {
    return loadData(prefix)
  }
}
