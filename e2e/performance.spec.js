import { test, expect, mockBackend, PRODUCTS } from "./fixtures";

const MANY = Array.from({ length: 70 }, (_, i) => ({
  ...PRODUCTS[1],
  id: 100 + i,
  name: `Плод ${String(i).padStart(2, "0")}`,
  slug: `plod-${i}`,
  price: String(70 - i), // различни цени, за да сменя сортирането реда
  promo: false,
  new_product: false,
}));

test.describe("Скорост", () => {
  test("категория с много продукти рисува на порции и дорисува при скролиране", async ({ page }) => {
    await mockBackend(page, { products: MANY });
    await page.goto("/fruits");
    const cards = page.locator(".mantine-Card-root");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBe(24); // не всичките 70 наведнъж
    await expect(page.getByTestId("show-more")).toHaveText("Покажи още (46)");

    await page.getByTestId("show-more").scrollIntoViewIfNeeded();
    await expect.poll(() => cards.count()).toBeGreaterThan(24); // IntersectionObserver дорисува

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => cards.count(), { timeout: 10_000 }).toBe(70);
    await expect(page.getByTestId("show-more")).toHaveCount(0);
  });

  test("смяна на сортиране започва отначало от първата порция", async ({ page }) => {
    await mockBackend(page, { products: MANY });
    await page.goto("/fruits");
    await expect(page.getByTestId("show-more")).toBeVisible();
    await page.getByTestId("show-more").scrollIntoViewIfNeeded(); // дорисува още (IntersectionObserver)
    await expect.poll(() => page.locator(".mantine-Card-root").count()).toBeGreaterThan(24);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("textbox", { name: "Сортиране" }).click();
    await page.getByRole("option", { name: "Цена: възходящо" }).click();
    await expect.poll(() => page.locator(".mantine-Card-root").count()).toBe(24);
  });

  test("банерите се предзареждат само на началната", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(2);
    await page.goto("/fruits");
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(0);
  });

  test("началната зарежда малък JavaScript (бюджет)", async ({ page, backend }) => {
    void backend;
    let jsBytes = 0;
    page.on("response", async (r) => {
      if (r.url().endsWith(".js") && r.url().includes("/assets/")) {
        const len = Number((await r.allHeaders())["content-length"] || 0);
        jsBytes += len;
      }
    });
    await page.goto("/");
    await expect(page.getByText("Промо продукти")).toBeVisible();
    await page.waitForLoadState("networkidle");
    // несвит JS на началната (с ленивите чънкове) – да не расте незабелязано
    expect(jsBytes).toBeGreaterThan(0);
    expect(jsBytes).toBeLessThan(560 * 1024);
  });
});

test.describe("Заявки към API-то", () => {
  test("продуктова страница на нов посетител първо иска самия продукт, а каталога – после", async ({ page, backend }) => {
    void backend;
    const order = [];
    page.on("request", (r) => {
      const u = r.url();
      if (!u.includes("onrender.com/api/products")) return;
      order.push(u.includes("filters[slug]") ? "product" : u.includes("product_description") ? "descriptions" : "catalog");
    });
    await page.goto("/product/domat");
    await expect(page.getByRole("heading", { name: "Домат" })).toBeVisible();
    await expect.poll(() => order.includes("catalog"), { timeout: 8000 }).toBe(true); // после пак се зарежда (подобни)
    expect(order[0]).toBe("product");
  });

  test("нов посетител без количка не тегли каталога на началната напразно на чужда страница", async ({ page, backend }) => {
    void backend;
    let catalogRequests = 0;
    page.on("request", (r) => {
      const u = r.url();
      if (u.includes("onrender.com/api/products") && !u.includes("filters[slug]") && !u.includes("product_description")) catalogRequests++;
    });
    await page.goto("/about");
    await page.waitForTimeout(500);
    expect(catalogRequests).toBe(0); // нищо не е поискало каталога по-рано от свободно време
  });

  test("търсачката тегли каталога веднага при фокус", async ({ page, backend }) => {
    void backend;
    await page.goto("/about");
    const input = page.getByPlaceholder("Търси продукт...").first();
    await input.click();
    await input.fill("банан");
    await expect(page.getByRole("option", { name: /Банан/ })).toBeVisible({ timeout: 3000 });
  });
});
