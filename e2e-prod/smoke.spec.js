import { test, expect } from "@playwright/test";

// Само четене: нищо не се добавя в поръчка, не се праща формата.

test.beforeEach(async ({ page }) => {
  // Предпазна мрежа: ако някой тест случайно опита да създаде поръчка в продукция – блокираме я.
  await page.route("**/api/orders", (r) => (r.request().method() === "POST" ? r.abort() : r.continue()));
});

test.describe("Продукция – основни страници", () => {
  test("началната се зарежда с продукти и без грешки", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page).toHaveTitle(/Дар от Земята/);
    await expect(page.getByText("Поръчай за дома или офиса")).toBeVisible();
    await expect(page.locator("a[href^='/product/']").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("новият билд е деплойнат (статична лента, предзареждане на банерите)", async ({ page, request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain("За връзка: +359");
    expect(html).toMatch(/assets\/(office|restorant)-[\w-]+\.webp/); // preload скриптът
    await page.goto("/");
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(2);
  });

  test("категория показва продукти", async ({ page }) => {
    await page.goto("/fruits");
    await expect(page.getByRole("heading", { level: 1, name: "Плодове" })).toBeVisible();
    await expect(page.locator(".mantine-Card-root").first()).toBeVisible();
  });

  test("директен адрес на дълбока страница работи (Vercel rewrite) и 404 е прихваната от приложението", async ({ page, request }) => {
    expect((await request.get("/delivery")).status()).toBe(200);
    await page.goto("/ne-sashtestvuva-123");
    await expect(page.getByRole("link", { name: /начало|начална/i }).first()).toBeVisible();
  });

  test("продукт се отваря от списъка", async ({ page }) => {
    await page.goto("/fruits");
    const first = page.locator("a[href^='/product/']").first();
    const href = await first.getAttribute("href");
    await first.click();
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Добави в количката" }).first()).toBeVisible();
  });

  test("търсенето дава подсказки", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder("Търси продукт...").first();
    await input.click();
    await input.fill("ябъл");
    await expect(page.getByRole("option").first()).toBeVisible();
  });

  test("добавяне в количката и отваряне (без поръчка)", async ({ page }) => {
    await page.goto("/fruits");
    await page.locator(".mantine-Card-root").first().getByRole("button", { name: "Добави", exact: true }).click();
    await page.getByRole("button", { name: "Количка", exact: true }).click();
    await expect(page.getByRole("dialog").getByText("Твоята количка")).toBeVisible();
    await expect(page.getByRole("button", { name: /Поръчай срещу/ })).toBeVisible(); // не се натиска
  });

  test("страниците „Виж всички“ работят", async ({ page }) => {
    for (const path of ["/promo", "/new", "/bestsellers"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});

test.describe("Продукция – SEO и ресурси", () => {
  test("robots.txt и sitemap.xml са достъпни и sitemap-ът има новите страници", async ({ request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200);
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const p of ["/promo", "/new", "/bestsellers", "/fruits"]) expect(xml).toContain(p);
  });

  test("хешираните ресурси се кешират дълго (бърз повторен достъп)", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const js = html.match(/\/assets\/index-[\w-]+\.js/)[0];
    const res = await request.get(js);
    expect(res.status()).toBe(200);
    expect(res.headers()["cache-control"]).toMatch(/max-age=(\d{6,})|immutable/);
    expect(["br", "gzip"]).toContain(res.headers()["content-encoding"]); // компресирано
  });

  test("канонични адреси и описание са зададени", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /darotzemqta\.bg/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
  });
});
