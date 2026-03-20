import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { SpeciesForm } from "../../../components/species/SpeciesForm";
import type { Species } from "../../../lib/queries";

vi.mock("~/lib/api", () => ({
  apiFetch: vi.fn().mockResolvedValue({}),
}));

import { apiFetch } from "~/lib/api";

beforeEach(() => {
  vi.mocked(apiFetch).mockClear();
});

function makeSpecies(): Species {
  return {
    id: "sp-1",
    userId: "user-1",
    name: "スズメ",
    description: null,
    sortOrder: 0,
    bestPhotoId: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };
}

describe("SpeciesForm", () => {
  it("open=false のとき何も表示しない", () => {
    render(() => <SpeciesForm open={false} onClose={() => {}} onSaved={() => {}} />);
    expect(screen.queryByText("種を追加")).not.toBeInTheDocument();
  });

  it("新規作成時のタイトルは「種を追加」", () => {
    render(() => <SpeciesForm open={true} onClose={() => {}} onSaved={() => {}} />);
    expect(screen.getByText("種を追加")).toBeInTheDocument();
  });

  it("編集時のタイトルは「種を編集」", () => {
    render(() => (
      <SpeciesForm open={true} onClose={() => {}} onSaved={() => {}} initial={makeSpecies()} />
    ));
    expect(screen.getByText("種を編集")).toBeInTheDocument();
  });

  it("名前が空のまま保存するとエラーを表示し API を呼ばない", () => {
    render(() => <SpeciesForm open={true} onClose={() => {}} onSaved={() => {}} />);
    fireEvent.click(screen.getByText("保存"));
    expect(screen.getByText("名前を入力してください")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("キャンセルボタンをクリックすると onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(() => <SpeciesForm open={true} onClose={onClose} onSaved={() => {}} />);
    fireEvent.click(screen.getByText("キャンセル"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("名前を入力して保存すると onSaved と onClose が呼ばれる", async () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();
    render(() => <SpeciesForm open={true} onClose={onClose} onSaved={onSaved} />);
    fireEvent.input(screen.getByLabelText("名前 *"), { target: { value: "ヒヨドリ" } });
    fireEvent.click(screen.getByText("保存"));
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
