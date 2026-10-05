import { test, expect } from "./fixtures";

test.describe("Категории", () => {
  test("страницата на категория показва само нейните продукти по азбучен ред", async ({ page, backend }) => {
    void backend;
    await page.goto("/vegetables");
    await expect(page.getByRole("heading", { level: 1, name: "Зеленчуци" })).toBeVisible();
    await expect(page.getByText("Домат")).toBeVisible();
    await expect(page.getByText("Банан")).toHaveCount(0);
  });

  test("филтър „Само промо“", async ({ page, backend }) => {
    void backend;
    await page.goto("/fruits");
    await expect(page.getByText("Банан")).toBeVisible();
    await page.getByText("Само промо").click();
    await expect(page.getByText("Банан")).toHaveCount(0);
    await expect(page.getByText("Ябълка")).toBeVisible();
  });

  test("подкатегория по адрес", async ({ page, backend }) => {
    void backend;
    await page.goto("/category/" + encodeURIComponent("Основни продукти"));
    await expect(page.getByRole("heading", { level: 1, name: "Основни продукти" })).toBeVisible();
    await expect(page.getByText("Мед").first()).toBeVisible();
  });

  test("категориите на началната водят към страница на категория", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await page.getByRole("link", { name: /Плодове/ }).first().click();
    await expect(page).toHaveURL(/\/fruits/);
  });
});

test.describe("Продукт", () => {
  test("страница на продукт, количество и добавяне в количката", async ({ page, backend }) => {
    void backend;
    await page.goto("/product/domat");
    await expect(page.getByRole("heading", { name: "Домат" })).toBeVisible();
    await expect(page.getByText("Описание на продукт 3")).toBeVisible();
    await page.getByRole("button", { name: "Увеличи количеството" }).click();
    await page.getByRole("button", { name: "Добави в количката" }).first().click();
    await page.getByRole("button", { name: "Количка", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("link", { name: "Домат" }).first()).toBeVisible();
    await expect(dialog.getByText("2", { exact: true })).toBeVisible(); // количество
  });

  test("продукт с различни грамажи – избраният грамаж е в количката", async ({ page, backend }) => {
    void backend;
    await page.goto("/product/med");
    await page.getByText("500гр").first().click();
    await page.getByRole("button", { name: "Добави в количката" }).first().click();
    await page.getByRole("button", { name: "Количка", exact: true }).click();
    await expect(page.getByRole("dialog").getByText(/500гр/).first()).toBeVisible();
  });

  test("несъществуващ продукт показва съобщение", async ({ page, backend }) => {
    void backend;
    await page.goto("/product/nqma-takuv");
    await expect(page.getByText("Продуктът не беше намерен")).toBeVisible();
  });

  test("несъществуваща страница – 404 с връзка към началото", async ({ page, backend }) => {
    void backend;
    await page.goto("/ne-sashtestvuva");
    await expect(page.getByRole("link", { name: /начало|начална/i }).first()).toBeVisible();
  });
});
