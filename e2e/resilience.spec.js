import { test, expect, mockBackend } from "./fixtures";

test.describe("Устойчивост при грешки", () => {
  test("счупен чънк на количката не събаря сайта", async ({ page, backend }) => {
    void backend;
    await page.route("**/assets/CartDrawer-*.js", (r) => r.abort());
    await page.goto("/");
    await expect(page.getByText("Промо продукти")).toBeVisible();
    await page.getByRole("button", { name: "Количка", exact: true }).click();
    await expect(page.getByText("Не успяхме да заредим количката.")).toBeVisible({ timeout: 10_000 });
    // останалата част от страницата е жива
    await expect(page.getByText("Промо продукти")).toBeVisible();
    await expect(page.getByRole("button", { name: "Презареди" })).toBeVisible();
  });

  test("счупен чънк на менюто не събаря сайта", async ({ page, backend }) => {
    void backend;
    await page.route("**/assets/Drawer-*.js", (r) => r.abort());
    await page.goto("/");
    await expect(page.getByText("Промо продукти")).toBeVisible();
    await page.getByRole("button", { name: "Меню с категории" }).click();
    await expect(page.getByText("Не успяхме да заредим менюто.")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Промо продукти")).toBeVisible();
  });

  test("счупена страница показва съобщение с „Презареди“, а хедърът остава", async ({ page, backend }) => {
    void backend;
    await page.route("**/assets/ProductPage-*.js", (r) => r.abort());
    await page.goto("/");
    await page.goto("/product/domat");
    await expect(page.getByText("Не успяхме да заредим тази част от сайта.")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Количка", exact: true })).toBeVisible();
  });

  test("грешка от API-то: съобщение и „Опитай отново“ работи", async ({ page }) => {
    let failing = true;
    await mockBackend(page);
    await page.route("https://fruitshopstore.onrender.com/api/products**", (r, ) => {
      const url = r.request().url();
      if (failing && !url.includes("filters[slug]") && !url.includes("product_description")) return r.fulfill({ status: 500, body: "x" });
      return r.fallback();
    });
    await page.goto("/fruits");
    await expect(page.getByText("Не успяхме да заредим продуктите.")).toBeVisible();
    failing = false;
    await page.getByRole("button", { name: "Опитай отново" }).click();
    await expect(page.getByText("Банан")).toBeVisible();
  });
});
