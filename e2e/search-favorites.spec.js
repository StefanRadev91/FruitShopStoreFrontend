import { test, expect } from "./fixtures";

test.describe("Търсене", () => {
  test("подсказки и отваряне на продукт", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    const input = page.getByPlaceholder("Търси продукт...").first();
    await input.fill("ябъл");
    await expect(page.getByRole("option", { name: /Ябълка/ })).toBeVisible();
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/product\/yabalka/);
    await expect(page.getByRole("heading", { name: "Ябълка" })).toBeVisible();
  });

  test("Enter отваря страница с резултати", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    const input = page.getByPlaceholder("Търси продукт...").first();
    await input.fill("банан");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("банан");
    await expect(page.getByText("Банан").first()).toBeVisible();
  });

  test("без резултати", async ({ page, backend }) => {
    void backend;
    await page.goto("/search?q=несъществуващ");
    await expect(page.getByText("Няма намерени продукти.")).toBeVisible();
  });
});

test.describe("Любими", () => {
  test("добавяне от категория, списък и презареждане", async ({ page, backend }) => {
    void backend;
    await page.goto("/fruits");
    const card = page.locator(".mantine-Card-root").filter({ hasText: "Банан" }).first();
    await card.getByRole("button", { name: "Добави в любими" }).click();
    await expect(card.getByRole("button", { name: "Премахни от любими" })).toBeVisible();

    await page.getByRole("link", { name: "Любими продукти" }).click();
    await expect(page).toHaveURL(/\/favorites/);
    await expect(page.getByText("Банан")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Банан")).toBeVisible();
  });

  test("премахване от любими", async ({ page, backend }) => {
    void backend;
    await page.goto("/fruits");
    const card = page.locator(".mantine-Card-root").filter({ hasText: "Банан" }).first();
    await card.getByRole("button", { name: "Добави в любими" }).click();
    await card.getByRole("button", { name: "Премахни от любими" }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorites_v1")))).toEqual([]);
  });
});
