import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { PhotoLightbox } from "../../../components/photos/PhotoLightbox";
import type { PhotoWithSpecies } from "../../../lib/queries";

function makePhoto(overrides: Partial<PhotoWithSpecies> = {}): PhotoWithSpecies {
  return {
    id: "p-1",
    sightingId: "s-1",
    speciesId: "sp-1",
    blobUrl: "https://example.com/1.jpg",
    thumbnailUrl: null,
    originalFilename: "bird.jpg",
    sortOrder: 0,
    createdAt: "2024-06-01",
    speciesName: "スズメ",
    sightedAt: "2024-06-01",
    ...overrides,
  };
}

describe("PhotoLightbox", () => {
  it("初期インデックスの写真を表示する", () => {
    const photos = [
      makePhoto(),
      makePhoto({ id: "p-2", speciesName: "カラス", blobUrl: "https://example.com/2.jpg" }),
    ];
    render(() => <PhotoLightbox photos={photos} initialIndex={1} onClose={() => {}} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/2.jpg");
  });

  it("閉じるボタンをクリックすると onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(() => <PhotoLightbox photos={[makePhoto()]} initialIndex={0} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("閉じる"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(() => <PhotoLightbox photos={[makePhoto()]} initialIndex={0} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("写真が複数ある場合、前へ/次へボタンとカウンターを表示する", () => {
    const photos = [makePhoto(), makePhoto({ id: "p-2" })];
    render(() => <PhotoLightbox photos={photos} initialIndex={0} onClose={() => {}} />);
    expect(screen.getByLabelText("前の写真")).toBeInTheDocument();
    expect(screen.getByLabelText("次の写真")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("写真が1枚の場合、ナビゲーションボタンとカウンターを表示しない", () => {
    render(() => <PhotoLightbox photos={[makePhoto()]} initialIndex={0} onClose={() => {}} />);
    expect(screen.queryByLabelText("前の写真")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("次の写真")).not.toBeInTheDocument();
    expect(screen.queryByText(/\/ 1/)).not.toBeInTheDocument();
  });

  it("次へボタンをクリックすると次の写真に切り替わる", () => {
    const photos = [
      makePhoto({ speciesName: "スズメ", blobUrl: "https://example.com/1.jpg" }),
      makePhoto({ id: "p-2", speciesName: "カラス", blobUrl: "https://example.com/2.jpg" }),
    ];
    render(() => <PhotoLightbox photos={photos} initialIndex={0} onClose={() => {}} />);
    fireEvent.click(screen.getByLabelText("次の写真"));
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/2.jpg");
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("ArrowRight キーで次の写真に切り替わる", () => {
    const photos = [
      makePhoto({ blobUrl: "https://example.com/1.jpg" }),
      makePhoto({ id: "p-2", blobUrl: "https://example.com/2.jpg" }),
    ];
    render(() => <PhotoLightbox photos={photos} initialIndex={0} onClose={() => {}} />);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/2.jpg");
  });

  it("ArrowLeft キーで前の写真に切り替わる", () => {
    const photos = [
      makePhoto({ blobUrl: "https://example.com/1.jpg" }),
      makePhoto({ id: "p-2", blobUrl: "https://example.com/2.jpg" }),
    ];
    render(() => <PhotoLightbox photos={photos} initialIndex={1} onClose={() => {}} />);
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/1.jpg");
  });
});
