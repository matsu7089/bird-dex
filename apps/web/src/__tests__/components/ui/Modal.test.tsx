import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Modal } from "../../../components/ui/Modal";

describe("Modal", () => {
  it("open=false のとき何も表示しない", () => {
    render(() => (
      <Modal open={false} onClose={() => {}} title="テスト">
        内容
      </Modal>
    ));
    expect(screen.queryByText("テスト")).not.toBeInTheDocument();
  });

  it("open=true のときタイトルと子要素を表示する", () => {
    render(() => (
      <Modal open={true} onClose={() => {}} title="テストモーダル">
        <p>コンテンツ</p>
      </Modal>
    ));
    expect(screen.getByText("テストモーダル")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ")).toBeInTheDocument();
  });

  it("✕ ボタンをクリックすると onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(() => (
      <Modal open={true} onClose={onClose} title="テスト">
        内容
      </Modal>
    ));
    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("バックドロップをクリックすると onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(() => (
      <Modal open={true} onClose={onClose} title="テスト">
        内容
      </Modal>
    ));
    const backdrop = document.body.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
