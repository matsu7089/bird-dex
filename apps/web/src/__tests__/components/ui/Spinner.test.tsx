import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { Spinner } from "../../../components/ui/Spinner";

describe("Spinner", () => {
  it("スピナー要素がレンダリングされる", () => {
    const { container } = render(() => <Spinner />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
