import { afterEach, describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductGrid } from "./ProductGrid";
import { product, renderWithProviders } from "../test/utils";

const many = (n) => Array.from({ length: n }, (_, i) => product({ id: i + 1, name: `Продукт ${i + 1}`, slug: `p-${i + 1}` }));
const cards = () => document.querySelectorAll(".mantine-Card-root");

afterEach(() => vi.unstubAllGlobals());

describe("<ProductGrid />", () => {
  it("рисува само първата порция и бутон с остатъка", () => {
    renderWithProviders(<ProductGrid products={many(30)} onAddToCart={() => {}} step={10} />);
    expect(cards()).toHaveLength(10);
    expect(screen.getByRole("button", { name: "Покажи още (20)" })).toBeInTheDocument();
  });

  it("бутонът дорисува следващите", async () => {
    renderWithProviders(<ProductGrid products={many(25)} onAddToCart={() => {}} step={10} />);
    await userEvent.click(screen.getByTestId("show-more"));
    expect(cards()).toHaveLength(20);
    await userEvent.click(screen.getByTestId("show-more"));
    expect(cards()).toHaveLength(25);
    expect(screen.queryByTestId("show-more")).not.toBeInTheDocument();
  });

  it("без бутон, когато всичко се побира", () => {
    renderWithProviders(<ProductGrid products={many(5)} onAddToCart={() => {}} step={10} />);
    expect(cards()).toHaveLength(5);
    expect(screen.queryByTestId("show-more")).not.toBeInTheDocument();
  });

  it("дорисува автоматично, когато краят доближи екрана (IntersectionObserver)", () => {
    let trigger;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb) {
          trigger = () => cb([{ isIntersecting: true }]);
        }
        observe() {}
        disconnect() {}
      }
    );
    renderWithProviders(<ProductGrid products={many(25)} onAddToCart={() => {}} step={10} />);
    expect(cards()).toHaveLength(10);
    act(() => trigger());
    expect(cards()).toHaveLength(20);
  });
});
