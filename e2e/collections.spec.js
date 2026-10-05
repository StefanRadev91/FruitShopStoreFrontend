import { test, expect } from "./fixtures";

const COLLECTIONS = [
  ["/promo", "Промо продукти", 17],
  ["/new", "Най-нови продукти", 2],
  ["/bestsellers", "Най-продавани", 2],
];

test.describe("Страници „Виж всички“", () => {
  for (const [path, title, count] of COLLECTIONS) {
    test(`${path} показва всички продукти от секцията`, async ({ page, backend }) => {
      void backend;
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.locator(".mantine-Card-root")).toHaveCount(count);
    });
  }

  test("продуктите от колекцията се добавят в количката", async ({ page, backend }) => {
    void backend;
    await page.goto("/new");
    await page.locator(".mantine-Card-root").filter({ hasText: "Банан" }).getByRole("button", { name: "Добави", exact: true }).click();
    await page.getByRole("button", { name: "Количка", exact: true }).click();
    await expect(page.getByRole("dialog").getByRole("link", { name: "Банан" }).first()).toBeVisible();
  });

  test("началната не показва „Виж всички“, когато продуктите са в рамките на лимита", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await expect(page.getByText("Най-нови продукти")).toBeVisible();
    await expect(page.getByTestId("see-all-new")).toHaveCount(0);
  });
});
