export interface StorageService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load(prefix: string): Promise<any>
}
