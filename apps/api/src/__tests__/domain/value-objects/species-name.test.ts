import { describe, it, expect } from "vitest";
import { SpeciesName } from "../../../domain/value-objects/species-name.js";

describe("SpeciesName", () => {
  it("通常の名前でインスタンス生成できる", () => {
    const sn = new SpeciesName("スズメ");
    expect(sn.value).toBe("スズメ");
  });

  it("前後の空白をトリムする", () => {
    const sn = new SpeciesName("  ハシブトガラス  ");
    expect(sn.value).toBe("ハシブトガラス");
  });

  it("200文字の名前を受け付ける", () => {
    const name = "a".repeat(200);
    expect(() => new SpeciesName(name)).not.toThrow();
  });

  it("空文字でエラーを投げる", () => {
    expect(() => new SpeciesName("")).toThrow("Species name cannot be empty");
  });

  it("空白のみの文字列でエラーを投げる", () => {
    expect(() => new SpeciesName("   ")).toThrow("Species name cannot be empty");
  });

  it("201文字でエラーを投げる", () => {
    const name = "a".repeat(201);
    expect(() => new SpeciesName(name)).toThrow("Species name must be 200 characters or fewer");
  });
});
