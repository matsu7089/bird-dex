import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Badge } from "../../../components/ui/Badge";

describe("Badge", () => {
  it("枚数を '○枚' 形式で表示する", () => {
    render(() => <Badge count={3} />);
    expect(screen.getByText("3枚")).toBeInTheDocument();
  });

  it("0枚も正しく表示する", () => {
    render(() => <Badge count={0} />);
    expect(screen.getByText("0枚")).toBeInTheDocument();
  });

  it("大きな数値も表示する", () => {
    render(() => <Badge count={999} />);
    expect(screen.getByText("999枚")).toBeInTheDocument();
  });
});
