import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Pagination } from "../../../components/ui/Pagination";

describe("Pagination", () => {
  it("件数範囲テキストを表示する（1ページ目）", () => {
    render(() => <Pagination page={1} total={50} limit={20} onPageChange={() => {}} />);
    expect(screen.getByText(/50件中 1–20件/)).toBeInTheDocument();
  });

  it("件数範囲テキストを表示する（2ページ目）", () => {
    render(() => <Pagination page={2} total={50} limit={20} onPageChange={() => {}} />);
    expect(screen.getByText(/50件中 21–40件/)).toBeInTheDocument();
  });

  it("最終ページで上限を total に切り捨てる", () => {
    render(() => <Pagination page={3} total={50} limit={20} onPageChange={() => {}} />);
    expect(screen.getByText(/50件中 41–50件/)).toBeInTheDocument();
  });

  it("現在ページ / 総ページ数を表示する", () => {
    render(() => <Pagination page={2} total={50} limit={20} onPageChange={() => {}} />);
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("1ページ目では「前」ボタンが無効化される", () => {
    render(() => <Pagination page={1} total={50} limit={20} onPageChange={() => {}} />);
    expect(screen.getByText("← 前")).toBeDisabled();
  });

  it("最終ページでは「次」ボタンが無効化される", () => {
    render(() => <Pagination page={3} total={50} limit={20} onPageChange={() => {}} />);
    expect(screen.getByText("次 →")).toBeDisabled();
  });

  it("中間ページでは両ボタンが有効", () => {
    render(() => <Pagination page={2} total={50} limit={20} onPageChange={() => {}} />);
    expect(screen.getByText("← 前")).not.toBeDisabled();
    expect(screen.getByText("次 →")).not.toBeDisabled();
  });

  it("「次」ボタンをクリックすると次のページ番号で onPageChange が呼ばれる", () => {
    const onPageChange = vi.fn();
    render(() => <Pagination page={1} total={50} limit={20} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("次 →"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("「前」ボタンをクリックすると前のページ番号で onPageChange が呼ばれる", () => {
    const onPageChange = vi.fn();
    render(() => <Pagination page={2} total={50} limit={20} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("← 前"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
