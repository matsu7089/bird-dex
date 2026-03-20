import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Button } from "../../../components/ui/Button";

describe("Button", () => {
  it("children を表示する", () => {
    render(() => <Button>保存</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("保存");
  });

  it("disabled のとき操作不可になる", () => {
    render(() => <Button disabled>保存</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = vi.fn();
    render(() => <Button onClick={onClick}>クリック</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
