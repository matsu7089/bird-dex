import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { SightingCard } from "../../../components/sightings/SightingCard";
import type { SightingWithPhotos } from "../../../lib/queries";
import type { PhotoWithSpecies } from "../../../lib/queries";

vi.mock("@tanstack/solid-router", () => ({
  Link: (props: any) => props.children,
}));

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

function makeSighting(overrides: Partial<SightingWithPhotos> = {}): SightingWithPhotos {
  return {
    id: "s-1",
    userId: "user-1",
    memo: null,
    sightedAt: "2024-06-01",
    latitude: "35.6895",
    longitude: "139.6917",
    locationName: null,
    createdAt: "2024-06-01",
    updatedAt: "2024-06-01",
    photos: [],
    ...overrides,
  };
}

describe("SightingCard", () => {
  it("観察日を日本語形式で表示する", () => {
    render(() => <SightingCard sighting={makeSighting()} />);
    expect(screen.getByText("2024年6月1日")).toBeInTheDocument();
  });

  it("場所名が指定されている場合表示する", () => {
    render(() => <SightingCard sighting={makeSighting({ locationName: "代々木公園" })} />);
    expect(screen.getByText("📍 代々木公園")).toBeInTheDocument();
  });

  it("場所名が未指定の場合表示しない", () => {
    render(() => <SightingCard sighting={makeSighting()} />);
    expect(screen.queryByText(/📍/)).not.toBeInTheDocument();
  });

  it("メモが指定されている場合表示する", () => {
    render(() => <SightingCard sighting={makeSighting({ memo: "餌をついばんでいた" })} />);
    expect(screen.getByText("餌をついばんでいた")).toBeInTheDocument();
  });

  it("写真がない場合プレースホルダーを表示する", () => {
    render(() => <SightingCard sighting={makeSighting()} />);
    expect(screen.getByText("🐦")).toBeInTheDocument();
  });

  it("写真の種名を重複なしで表示する", () => {
    const photos = [
      makePhoto({ speciesName: "スズメ" }),
      makePhoto({ id: "p-2", speciesName: "スズメ" }),
      makePhoto({ id: "p-3", speciesName: "カラス" }),
    ];
    render(() => <SightingCard sighting={makeSighting({ photos })} />);
    expect(screen.getByText("スズメ・カラス")).toBeInTheDocument();
  });

  it("写真枚数を表示する", () => {
    const photos = [makePhoto(), makePhoto({ id: "p-2" }), makePhoto({ id: "p-3" })];
    render(() => <SightingCard sighting={makeSighting({ photos })} />);
    expect(screen.getByText("3枚")).toBeInTheDocument();
  });
});
