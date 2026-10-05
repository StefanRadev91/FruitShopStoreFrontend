import { test, expect, mockBackend } from "./fixtures";

test.describe("Начална страница", () => {
  test("показва банери, категории и продуктови секции", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Дар от Земята/ })).toBeAttached();
    await expect(page.getByText("Поръчай за дома или офиса")).toBeVisible();
    await expect(page.getByText("Промо продукти")).toBeVisible();
    await expect(page.getByText("Най-нови продукти")).toBeVisible();
    await expect(page.getByText("Най-продавани")).toBeVisible();
    await expect(page).toHaveTitle(/Дар от Земята/);
  });

  test("банерите се виждат веднага, без да чакат бавното API (LCP)", async ({ page }) => {
    await mockBackend(page, { delayMs: 4000 });
    await page.goto("/");
    await expect(page.getByText("Поръчай за дома или офиса")).toBeVisible({ timeout: 2000 });
    // докато каталогът още се зарежда – скелет, не празна страница
    await expect(page.getByRole("status", { name: "Зареждане на продукти" })).toBeVisible();
    await expect(page.getByText("Промо продукти")).toBeVisible({ timeout: 10_000 });
  });

  test("запазва мястото на категориите – без скачане на страницата (CLS)", async ({ page }) => {
    await mockBackend(page, { delayMs: 1500 });
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    await expect(page.getByText("Промо продукти")).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(500);
    const cls = await page.evaluate(() => window.__cls);
    expect(cls).toBeLessThan(0.1);
  });

  test("слайдерът показва 12 продукта, а „Виж всички“ отваря страница с всички", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    const link = page.getByTestId("see-all-promo");
    await expect(link).toHaveText(/Виж всички \(17\)/);
    await link.click();
    await expect(page).toHaveURL(/\/promo$/);
    await expect(page.getByRole("heading", { level: 1, name: "Промо продукти" })).toBeVisible();
    await expect(page.locator("a[href^='/product/']").filter({ hasText: /Продукт|Ябълка/ }).first()).toBeVisible();
    // всичките 17 промо продукта са в списъка (не само 12)
    await expect(page.locator(".mantine-Card-root")).toHaveCount(17);
  });

  test("контактите са видими и без JavaScript (статична лента)", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const p = await ctx.newPage();
    await p.goto("/");
    await expect(p.getByText("За връзка: +359 886 282 323 | darotzemqta@abv.bg")).toBeVisible();
    await ctx.close();
  });

  test("няма грешки в конзолата", async ({ page, backend }) => {
    void backend;
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto("/");
    await expect(page.getByText("Промо продукти")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
