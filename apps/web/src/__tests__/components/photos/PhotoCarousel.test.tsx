import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { PhotoCarousel } from "../../../components/photos/PhotoCarousel";
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
    cameraMake: null,
    cameraModel: null,
    fNumber: null,
    shutterSpeed: null,
    focalLength: null,
    iso: null,
    createdAt: "2024-06-01",
    speciesName: "スズメ",
    sightedAt: "2024-06-01",
    ...overrides,
  };
}

describe("PhotoCarousel", () => {
  it("写真が空の場合プレースホルダーを表示する", () => {
    render(() => <PhotoCarousel photos={[]} />);
    expect(screen.getByText("🐦")).toBeInTheDocument();
  });

  it("写真がある場合、現在の写真と種名を表示する", () => {
    render(() => <PhotoCarousel photos={[makePhoto()]} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/1.jpg");
    expect(screen.getByText("スズメ")).toBeInTheDocument();
  });

  it("写真が1枚の場合、ナビゲーションボタンを表示しない", () => {
    render(() => <PhotoCarousel photos={[makePhoto()]} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("写真が複数ある場合、1枚目では前へが無効・次へが有効", () => {
    const photos = [makePhoto(), makePhoto({ id: "p-2", speciesName: "カラス" })];
    render(() => <PhotoCarousel photos={photos} />);
    const [prev, next] = screen.getAllByRole("button");
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();
  });

  it("次へボタンをクリックすると次の写真に切り替わる", () => {
    const photos = [
      makePhoto({ speciesName: "スズメ", blobUrl: "https://example.com/1.jpg" }),
      makePhoto({ id: "p-2", speciesName: "カラス", blobUrl: "https://example.com/2.jpg" }),
    ];
    render(() => <PhotoCarousel photos={photos} />);
    const [, next] = screen.getAllByRole("button");
    fireEvent.click(next);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/2.jpg");
    expect(screen.getByText("カラス")).toBeInTheDocument();
  });

  it("onDelete が指定されたとき削除ボタンを表示する", () => {
    render(() => <PhotoCarousel photos={[makePhoto()]} onDelete={() => {}} />);
    expect(screen.getByText("削除")).toBeInTheDocument();
  });

  it("削除ボタンをクリックして confirm 確認後に onDelete が呼ばれる", () => {
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    const onDelete = vi.fn();
    render(() => <PhotoCarousel photos={[makePhoto()]} onDelete={onDelete} />);
    fireEvent.click(screen.getByText("削除"));
    expect(onDelete).toHaveBeenCalledWith("p-1");
  });

  it("onDelete が未指定のとき削除ボタンを表示しない", () => {
    render(() => <PhotoCarousel photos={[makePhoto()]} />);
    expect(screen.queryByText("削除")).not.toBeInTheDocument();
  });
});
