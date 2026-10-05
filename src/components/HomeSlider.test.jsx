import { beforeEach, describe, expect, it, vi } from "vitest";
import { Suspense } from "react";
import { screen } from "@testing-library/react";
import { HomeSlider } from "./HomeSlider";
import { HOME_SLIDER_LIMIT } from "../config/home";
import { COLLECTIONS } from "../config/collections";
import { product, renderWithProviders } from "../test/utils";

// Истинският слайдер (Embla) не е важен тук – проверяваме кои продукти получава.
vi.mock("./ProductSlider", () => ({
  ProductSlider: ({ products }) => (
    <ul data-testid="slider">
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  ),
}));

const many = (n) =>
  Array.from({ length: n }, (_, i) =>
    product({ id: i + 1, name: `Продукт ${i + 1}`, updatedAt: new Date(2026, 0, i + 1).toISOString() })
  );

const setup = (products, props = {}) =>
  renderWithProviders(
    <Suspense fallback="чака">
      <HomeSlider variant="promo" products={products} {...props} />
    </Suspense>
  );

beforeEach(() => vi.clearAllMocks());

describe("HomeSlider", () => {
  it("показва само най-новите до лимита, най-новият първи", async () => {
    setup(many(HOME_SLIDER_LIMIT + 8));
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(HOME_SLIDER_LIMIT);
    expect(items[0]).toHaveTextContent(`Продукт ${HOME_SLIDER_LIMIT + 8}`);
  });

  it('"Виж всички" е връзка към страницата с всички продукти от секцията', async () => {
    const total = HOME_SLIDER_LIMIT + 8;
    setup(many(total));
    await screen.findByTestId("slider");
    const link = screen.getByRole("link", { name: `Виж всички (${total})` });
    expect(link).toHaveAttribute("href", COLLECTIONS.promo.path);
  });

  it("всяка секция води към своята страница", async () => {
    setup(many(5), { limit: 2, variant: "best" });
    await screen.findByTestId("slider");
    expect(screen.getByRole("link", { name: /Виж всички/ })).toHaveAttribute("href", "/bestsellers");
  });

  it("без връзка, когато продуктите са в рамките на лимита", async () => {
    setup(many(HOME_SLIDER_LIMIT));
    await screen.findByTestId("slider");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("не променя подадения масив", async () => {
    const input = many(3);
    const copy = [...input];
    setup(input);
    await screen.findByTestId("slider");
    expect(input).toEqual(copy);
  });

  it("уважава custom лимит", async () => {
    setup(many(5), { limit: 2 });
    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Виж всички (5)" })).toBeInTheDocument();
  });
});
