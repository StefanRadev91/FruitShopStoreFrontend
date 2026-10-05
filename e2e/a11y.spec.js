import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const PAGES = [
  ["начална", "/"],
  ["категория", "/fruits"],
  ["продукт", "/product/domat"],
  ["търсене", "/search?q=банан"],
];

test.describe("Достъпност", () => {
  for (const [name, path] of PAGES) {
    test(`няма сериозни нарушения: ${name}`, async ({ page, backend }) => {
      void backend;
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const serious = violations.filter((v) => ["serious", "critical"].includes(v.impact));
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ") + " :: " + (n.any[0]?.message || "")).slice(0, 2).join(" | ")}`)).toEqual([]);
    });
  }

  test("езикът е български, има точно един <main> и всички снимки имат alt", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "bg");
    await expect(page.locator("main")).toHaveCount(1);
    const withoutAlt = await page.locator("img:not([alt])").count();
    expect(withoutAlt).toBe(0);
  });
});
