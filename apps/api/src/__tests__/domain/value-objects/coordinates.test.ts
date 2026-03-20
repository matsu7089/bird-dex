import { describe, it, expect } from "vitest";
import { Coordinates } from "../../../domain/value-objects/coordinates.js";

describe("Coordinates", () => {
  it("有効な緯度経度でインスタンス生成できる", () => {
    const c = new Coordinates(35.6895, 139.6917);
    expect(c.lat).toBe(35.6895);
    expect(c.lng).toBe(139.6917);
  });

  it("境界値 (0, 0) を受け付ける", () => {
    const c = new Coordinates(0, 0);
    expect(c.lat).toBe(0);
    expect(c.lng).toBe(0);
  });

  it("緯度の最大値 (90) を受け付ける", () => {
    expect(() => new Coordinates(90, 0)).not.toThrow();
  });

  it("緯度の最小値 (-90) を受け付ける", () => {
    expect(() => new Coordinates(-90, 0)).not.toThrow();
  });

  it("経度の最大値 (180) を受け付ける", () => {
    expect(() => new Coordinates(0, 180)).not.toThrow();
  });

  it("経度の最小値 (-180) を受け付ける", () => {
    expect(() => new Coordinates(0, -180)).not.toThrow();
  });

  it("緯度が 90 を超えるとエラーを投げる", () => {
    expect(() => new Coordinates(90.0001, 0)).toThrow("Latitude must be between -90 and 90");
  });

  it("緯度が -90 未満だとエラーを投げる", () => {
    expect(() => new Coordinates(-90.0001, 0)).toThrow("Latitude must be between -90 and 90");
  });

  it("経度が 180 を超えるとエラーを投げる", () => {
    expect(() => new Coordinates(0, 180.0001)).toThrow("Longitude must be between -180 and 180");
  });

  it("経度が -180 未満だとエラーを投げる", () => {
    expect(() => new Coordinates(0, -180.0001)).toThrow("Longitude must be between -180 and 180");
  });
});
