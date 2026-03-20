import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { PhotoUploadArea } from "../../../components/sightings/PhotoUploadArea";
import type { PendingPhoto } from "../../../components/sightings/PhotoUploadArea";
import type { SpeciesWithCount } from "../../../lib/queries";

vi.mock("exifr", () => ({ default: { parse: vi.fn().mockResolvedValue(null) } }));

beforeEach(() => {
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
});

function makeSpecies(overrides: Partial<SpeciesWithCount> = {}): SpeciesWithCount {
  return {
    id: "sp-1",
    userId: "user-1",
    name: "スズメ",
    description: null,
    sortOrder: 0,
    bestPhotoId: null,
    photoCount: 0,
    bestPhotoThumbnailUrl: null,
    bestPhotoBlobUrl: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    ...overrides,
  };
}

function makePending(overrides: Partial<PendingPhoto> = {}): PendingPhoto {
  return {
    file: new File([""], "bird.jpg", { type: "image/jpeg" }),
    speciesId: "sp-1",
    preview: "blob:preview",
    ...overrides,
  };
}

describe("PhotoUploadArea", () => {
  it("アップロードエリアのテキストを表示する", () => {
    render(() => <PhotoUploadArea speciesList={[]} value={[]} onChange={() => {}} />);
    expect(screen.getByText("クリックまたはドラッグ&ドロップで写真を追加")).toBeInTheDocument();
  });

  it("pending photos がある場合、プレビュー画像を表示する", () => {
    render(() => (
      <PhotoUploadArea speciesList={[makeSpecies()]} value={[makePending()]} onChange={() => {}} />
    ));
    expect(screen.getByAltText("preview")).toBeInTheDocument();
  });

  it("削除ボタンをクリックすると、その写真を除いた配列で onChange が呼ばれる", () => {
    const photos = [
      makePending({ preview: "blob:a" }),
      makePending({ preview: "blob:b", speciesId: "sp-2" }),
    ];
    const onChange = vi.fn();
    render(() => (
      <PhotoUploadArea speciesList={[makeSpecies()]} value={photos} onChange={onChange} />
    ));
    const removeBtns = screen.getAllByText("✕");
    fireEvent.click(removeBtns[0]);
    expect(onChange).toHaveBeenCalledWith([photos[1]]);
  });

  it("種の選択を変更すると onChange が更新済み配列で呼ばれる", () => {
    const species = [makeSpecies(), makeSpecies({ id: "sp-2", name: "カラス" })];
    const photo = makePending({ speciesId: "sp-1" });
    const onChange = vi.fn();
    render(() => <PhotoUploadArea speciesList={species} value={[photo]} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "sp-2" } });
    expect(onChange).toHaveBeenCalledWith([{ ...photo, speciesId: "sp-2" }]);
  });
});
