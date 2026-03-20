import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { SpeciesCard } from "../../../components/species/SpeciesCard";
import type { SpeciesWithCount } from "../../../lib/queries";

vi.mock("@tanstack/solid-router", () => ({
  Link: (props: any) => props.children,
}));

function makeSpecies(overrides: Partial<SpeciesWithCount> = {}): SpeciesWithCount {
  return {
    id: "sp-1",
    userId: "user-1",
    name: "スズメ",
    description: null,
    sortOrder: 0,
    bestPhotoId: null,
    photoCount: 3,
    bestPhotoThumbnailUrl: null,
    bestPhotoBlobUrl: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    ...overrides,
  };
}

describe("SpeciesCard", () => {
  it("種名を表示する", () => {
    render(() => <SpeciesCard species={makeSpecies()} />);
    expect(screen.getByText("スズメ")).toBeInTheDocument();
  });

  it("説明が指定されている場合表示する", () => {
    render(() => <SpeciesCard species={makeSpecies({ description: "スズメ目スズメ科" })} />);
    expect(screen.getByText("スズメ目スズメ科")).toBeInTheDocument();
  });

  it("説明が未指定の場合表示しない", () => {
    render(() => <SpeciesCard species={makeSpecies()} />);
    expect(screen.queryByText("スズメ目")).not.toBeInTheDocument();
  });

  it("写真枚数を Badge で表示する", () => {
    render(() => <SpeciesCard species={makeSpecies({ photoCount: 5 })} />);
    expect(screen.getByText("5枚")).toBeInTheDocument();
  });

  it("ベスト写真がある場合 img を表示する", () => {
    render(() => (
      <SpeciesCard
        species={makeSpecies({ bestPhotoThumbnailUrl: "https://example.com/thumb.jpg" })}
      />
    ));
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/thumb.jpg");
  });

  it("ベスト写真がない場合 img を表示しない", () => {
    render(() => <SpeciesCard species={makeSpecies()} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
