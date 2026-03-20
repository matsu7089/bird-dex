import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Input, Textarea } from "../../../components/ui/Input";

describe("Input", () => {
  it("label が指定されたとき表示する", () => {
    render(() => <Input id="name" label="名前" />);
    expect(screen.getByText("名前")).toBeInTheDocument();
  });

  it("label が未指定のとき label 要素を表示しない", () => {
    render(() => <Input />);
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("error が指定されたときエラーメッセージを表示する", () => {
    render(() => <Input error="入力が不正です" />);
    expect(screen.getByText("入力が不正です")).toBeInTheDocument();
  });

  it("error が未指定のときエラーメッセージを表示しない", () => {
    render(() => <Input />);
    expect(screen.queryByText(/不正/)).not.toBeInTheDocument();
  });

  it("label と id が関連付けられている", () => {
    render(() => <Input id="email" label="メールアドレス" />);
    const label = screen.getByText("メールアドレス");
    expect(label).toHaveAttribute("for", "email");
  });
});

describe("Textarea", () => {
  it("label が指定されたとき表示する", () => {
    render(() => <Textarea id="memo" label="メモ" />);
    expect(screen.getByText("メモ")).toBeInTheDocument();
  });

  it("error が指定されたときエラーメッセージを表示する", () => {
    render(() => <Textarea error="必須項目です" />);
    expect(screen.getByText("必須項目です")).toBeInTheDocument();
  });
});
