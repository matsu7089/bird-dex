import { BlobServiceClient } from "@azure/storage-blob";
import type { IBlobStorage } from "../../domain/repositories/blob-storage.js";

export class AzureBlobStorage implements IBlobStorage {
  private readonly serviceClient: BlobServiceClient;
  private readonly container: string;
  private containerEnsured = false;

  constructor(config: { connectionString: string; container: string }) {
    this.serviceClient = BlobServiceClient.fromConnectionString(config.connectionString);
    this.container = config.container;
  }

  async upload(key: string, data: Buffer, contentType: string): Promise<string> {
    const containerClient = this.serviceClient.getContainerClient(this.container);
    if (!this.containerEnsured) {
      await containerClient.createIfNotExists({ access: "blob" });
      this.containerEnsured = true;
    }
    const blobClient = containerClient.getBlockBlobClient(key);
    await blobClient.upload(data, data.length, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    return blobClient.url;
  }

  async delete(key: string): Promise<void> {
    const containerClient = this.serviceClient.getContainerClient(this.container);
    const blobClient = containerClient.getBlockBlobClient(key);
    await blobClient.deleteIfExists();
  }
}
