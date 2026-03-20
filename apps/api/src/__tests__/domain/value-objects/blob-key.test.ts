import { describe, it, expect } from "vitest";
import { BlobKey } from "../../../domain/value-objects/blob-key.js";

describe("BlobKey", () => {
  it("正しい形式のキーを生成する", () => {
    const key = new BlobKey("sighting-1", "uuid-abc", "jpg");
    expect(key.value).toBe("sighting-1/uuid-abc.jpg");
  });

  it("thumbnailKey が _thumb サフィックスを付ける", () => {
    const key = new BlobKey("sighting-1", "uuid-abc", "jpg");
    expect(key.thumbnailKey()).toBe("sighting-1/uuid-abc_thumb.jpg");
  });

  it("png 拡張子でも thumbnailKey が正しく生成される", () => {
    const key = new BlobKey("s2", "u2", "png");
    expect(key.thumbnailKey()).toBe("s2/u2_thumb.png");
  });

  it("webp 拡張子でも thumbnailKey が正しく生成される", () => {
    const key = new BlobKey("s3", "u3", "webp");
    expect(key.thumbnailKey()).toBe("s3/u3_thumb.webp");
  });
});
