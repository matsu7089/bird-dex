import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { PhotoGrid } from "../../../components/photos/PhotoGrid";
import type { PhotoWithSpecies } from "../../../lib/queries";

function makePhoto(overrides: Partial<PhotoWithSpecies> = {}): PhotoWithSpecies {
  return {
    id: "p-1",
    sightingId: "s-1",
    speciesId: "sp-1",
    blobUrl: "https://example.com/1.jpg",
    thumbnailUrl: "https://example.com/1_thumb.jpg",
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

describe("PhotoGrid", () => {
  it("写真が空の場合フォールバックテキストを表示する", () => {
    render(() => <PhotoGrid photos={[]} />);
    expect(screen.getByText("写真がありません")).toBeInTheDocument();
  });

  it("写真があれば全て表示する", () => {
    const photos = [makePhoto(), makePhoto({ id: "p-2", speciesName: "カラス" })];
    render(() => <PhotoGrid photos={photos} />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("onDelete が指定されたとき削除ボタンが表示され、クリックで onDelete が呼ばれる", () => {
    const onDelete = vi.fn();
    render(() => <PhotoGrid photos={[makePhoto()]} onDelete={onDelete} />);
    fireEvent.click(screen.getByText("削除"));
    expect(onDelete).toHaveBeenCalledWith("p-1");
  });

  it("onSetBestPhoto が指定されたとき ★設定 ボタンが表示され、クリックで onSetBestPhoto が呼ばれる", () => {
    const onSetBestPhoto = vi.fn();
    render(() => <PhotoGrid photos={[makePhoto()]} onSetBestPhoto={onSetBestPhoto} />);
    fireEvent.click(screen.getByText("★設定"));
    expect(onSetBestPhoto).toHaveBeenCalledWith("p-1");
  });

  it("bestPhotoId が一致する写真には ★解除 ボタンを表示する", () => {
    render(() => <PhotoGrid photos={[makePhoto()]} bestPhotoId="p-1" onSetBestPhoto={() => {}} />);
    expect(screen.getByText("★解除")).toBeInTheDocument();
    expect(screen.queryByText("★設定")).not.toBeInTheDocument();
  });

  it("★解除 をクリックすると onSetBestPhoto(null) が呼ばれる", () => {
    const onSetBestPhoto = vi.fn();
    render(() => (
      <PhotoGrid photos={[makePhoto()]} bestPhotoId="p-1" onSetBestPhoto={onSetBestPhoto} />
    ));
    fireEvent.click(screen.getByText("★解除"));
    expect(onSetBestPhoto).toHaveBeenCalledWith(null);
  });

  it("写真をクリックするとライトボックスが開く", () => {
    render(() => <PhotoGrid photos={[makePhoto()]} />);
    fireEvent.click(screen.getByRole("img"));
    expect(screen.getByLabelText("閉じる")).toBeInTheDocument();
  });
});
