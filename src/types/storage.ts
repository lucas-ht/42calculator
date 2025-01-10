export interface StorageService {
  // biome-ignore lint: The any type is used here because the return type is JSON
  load(prefix: string): Promise<any>;
}
