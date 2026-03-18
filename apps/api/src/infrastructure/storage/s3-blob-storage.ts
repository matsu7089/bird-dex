import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { IBlobStorage } from "../../domain/repositories/blob-storage.js";

export class S3BlobStorage implements IBlobStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(config: {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
  }) {
    this.endpoint = config.endpoint;
    this.bucket = config.bucket;
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: "us-east-1",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async upload(key: string, data: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
