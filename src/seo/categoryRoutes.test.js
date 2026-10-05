import { describe, expect, it } from "vitest";
import { CATEGORY_ROUTES, categoryPath } from "./categoryRoutes";

describe("categoryPath", () => {
  it("главните категории имат собствен път", () => {
    expect(categoryPath("Плодове")).toBe("/fruits");
    expect(categoryPath("Зеленчуци")).toBe("/vegetables");
  });

  it("подкатегориите са кодирани в /category/…", () => {
    expect(categoryPath("Бонбони")).toBe(`/category/${encodeURIComponent("Бонбони")}`);
    expect(categoryPath("a b/c")).toBe("/category/a%20b%2Fc");
  });

  it("всички пътища са уникални и започват с /", () => {
    const paths = Object.values(CATEGORY_ROUTES);
    expect(new Set(paths).size).toBe(paths.length);
    paths.forEach((p) => expect(p).toMatch(/^\/[a-z]+$/));
  });
});
