import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { Navbar } from "../../../components/layout/Navbar";
import type { UserDto } from "../../../lib/queries";

vi.mock("@tanstack/solid-router", () => ({
  Link: (props: any) => <a href={props.to}>{props.children}</a>,
  useRouter: () => ({ navigate: vi.fn() }),
}));

vi.mock("~/lib/api", () => ({
  apiFetch: vi.fn().mockResolvedValue({}),
}));

function makeUser(overrides: Partial<UserDto> = {}): UserDto {
  return {
    id: "u-1",
    username: "taro",
    avatarUrl: null,
    createdAt: "2024-01-01",
    ...overrides,
  };
}

describe("Navbar", () => {
  it("ナビゲーションリンクを表示する", () => {
    render(() => <Navbar user={null} refetchAuth={() => {}} />);
    expect(screen.getByText("図鑑")).toBeInTheDocument();
    expect(screen.getByText("観察記録")).toBeInTheDocument();
    expect(screen.getByText("ヒートマップ")).toBeInTheDocument();
  });

  it("user が null のときユーザー情報を表示しない", () => {
    render(() => <Navbar user={null} refetchAuth={() => {}} />);
    expect(screen.queryByText("ログアウト")).not.toBeInTheDocument();
  });

  it("user がいるときユーザー名とログアウトボタンを表示する", () => {
    render(() => <Navbar user={makeUser()} refetchAuth={() => {}} />);
    expect(screen.getByText("taro")).toBeInTheDocument();
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
  });

  it("ログアウトをクリックすると refetchAuth が呼ばれる", async () => {
    const refetchAuth = vi.fn();
    render(() => <Navbar user={makeUser()} refetchAuth={refetchAuth} />);
    fireEvent.click(screen.getByText("ログアウト"));
    await waitFor(() => expect(refetchAuth).toHaveBeenCalledTimes(1));
  });
});
