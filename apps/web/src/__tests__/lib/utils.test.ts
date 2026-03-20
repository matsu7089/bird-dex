import { describe, it, expect } from "vitest";
import { cn, formatDate } from "../../lib/utils.js";

describe("cn", () => {
  it("複数のクラスを結合する", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("falsy な値を除外する", () => {
    expect(cn("a", undefined, null, false, "b")).toBe("a b");
  });

  it("引数なしで空文字を返す", () => {
    expect(cn()).toBe("");
  });

  it("単一クラスをそのまま返す", () => {
    expect(cn("only")).toBe("only");
  });
});

describe("formatDate", () => {
  it("YYYY-MM-DD を日本語形式にフォーマットする", () => {
    expect(formatDate("2024-06-01")).toBe("2024年6月1日");
  });

  it("ゼロパディングを除去する（月）", () => {
    expect(formatDate("2024-03-05")).toBe("2024年3月5日");
  });

  it("12月31日をフォーマットする", () => {
    expect(formatDate("2023-12-31")).toBe("2023年12月31日");
  });

  it("1月1日をフォーマットする", () => {
    expect(formatDate("2025-01-01")).toBe("2025年1月1日");
  });
});
