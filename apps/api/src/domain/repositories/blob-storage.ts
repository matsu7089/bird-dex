export interface IBlobStorage {
  upload(key: string, data: Buffer, contentType: string): Promise<string>; // returns URL
  delete(key: string): Promise<void>;
}
