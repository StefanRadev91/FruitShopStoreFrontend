import { test, expect, mockBackend } from "./fixtures";

const openCart = (page) => page.getByRole("button", { name: "Количка", exact: true }).click();
const addFirst = async (page, name = "Банан") => {
  const card = page.locator(".mantine-Card-root").filter({ hasText: name }).first();
  await card.scrollIntoViewIfNeeded();
  await card.getByRole("button", { name: "Добави", exact: true }).click();
};

test.describe("Количка", () => {
  test("празна количка", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await openCart(page);
    await expect(page.getByText("Количката е празна")).toBeVisible();
  });

  test("добавяне, промяна на количество и изтриване", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await addFirst(page);
    await openCart(page);
    await expect(page.getByRole("dialog").getByText("Банан").first()).toBeVisible();

    await page.getByRole("button", { name: "Увеличи количеството" }).click();
    await expect(page.getByRole("dialog").getByText("2", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Намали количеството" }).click();
    await expect(page.getByRole("dialog").getByText("1", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Премахни Банан" }).click();
    await expect(page.getByText("Количката е празна")).toBeVisible();
  });

  test("количката се пази след презареждане", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await addFirst(page);
    await page.reload();
    await openCart(page);
    await expect(page.getByRole("dialog").getByText("Банан").first()).toBeVisible();
  });

  test("валидира формата преди изпращане", async ({ page, backend }) => {
    void backend;
    await page.goto("/");
    await addFirst(page);
    await openCart(page);
    await page.getByRole("button", { name: /Поръчай срещу/ }).click();
    await expect(page.getByText("Въведете име и фамилия")).toBeVisible();
    await expect(page.getByText("Въведете валиден телефон")).toBeVisible();
    await expect(page.getByText("Въведете адрес")).toBeVisible();
    expect(backend.orders).toHaveLength(0);
  });

  test("успешна поръчка: праща промо цената и показва потвърждение", async ({ page }) => {
    const { orders } = await mockBackend(page);
    await page.goto("/");
    await addFirst(page, "Ябълка"); // промо: 4.00 → 2.00
    await openCart(page);

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/Име и фамилия/).fill("Иван Петров");
    await dialog.getByLabel(/Телефон/).fill("0888 123 456");
    await dialog.getByLabel(/Адрес за доставка/).fill("ул. Витоша 1");
    await dialog.getByLabel(/Имейл/).fill("ivan@example.com");
    await dialog.getByRole("button", { name: /Поръчай срещу/ }).click();

    await expect(dialog.getByText(/Благодарим ти, Иван!/)).toBeVisible();
    await expect(dialog.getByText("№ 4242")).toBeVisible();

    expect(orders).toHaveLength(1);
    const { data } = orders[0];
    expect(data).toMatchObject({ customerName: "Иван Петров", phone: "0888 123 456", email: "ivan@example.com" });
    expect(data.products).toEqual([expect.objectContaining({ id: 1, name: "Ябълка", qty: 1, price: 2 })]);

    // количката е изчистена
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Количка", exact: true })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("cart_v1"))).toBeNull();
  });

  test("неуспешна поръчка показва грешка и запазва количката", async ({ page }) => {
    await mockBackend(page, { orderStatus: 500 });
    await page.goto("/");
    await addFirst(page);
    await openCart(page);
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/Име и фамилия/).fill("Иван Петров");
    await dialog.getByLabel(/Телефон/).fill("0888123456");
    await dialog.getByLabel(/Адрес за доставка/).fill("ул. Витоша 1");
    await dialog.getByLabel(/Имейл/).fill("ivan@example.com");
    await dialog.getByRole("button", { name: /Поръчай срещу/ }).click();
    await expect(page.getByText("Поръчката не беше изпратена")).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Банан" }).first()).toBeVisible();
  });
});
