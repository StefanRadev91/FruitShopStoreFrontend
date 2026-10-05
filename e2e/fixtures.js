import { test as base, expect } from "@playwright/test";

// 1×1 прозрачен PNG за всички снимки (без външни заявки).
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

const product = (id, over = {}) => ({
  id,
  name: `Продукт ${String(id).padStart(2, "0")}`,
  slug: `produkt-${id}`,
  price: "3.00",
  promo_price: null,
  promo: false,
  featured: false,
  new_product: false,
  updatedAt: new Date(2026, 0, id).toISOString(),
  image: [{ url: "https://res.cloudinary.com/demo/image/upload/v1/p.webp" }],
  category: { Name: "Плодове" },
  weight_variants: [],
  product_description: `Описание на продукт ${id}`,
  ...over,
});

// 18 промо продукти (над лимита от 12 на началната) + няколко обикновени.
export const PRODUCTS = [
  product(1, { name: "Ябълка", slug: "yabalka", price: "4.00", promo: true, promo_price: "2.00", new_product: true, featured: true }),
  product(2, { name: "Банан", slug: "banan", price: "3.50", new_product: true }),
  product(3, { name: "Домат", slug: "domat", price: "5.00", category: { Name: "Зеленчуци" }, featured: true }),
  product(4, {
    name: "Мед",
    slug: "med",
    price: "20.00",
    category: { Name: "Основни продукти" },
    weight_variants: [
      { id: 1, label: "250гр", price: 8, promo_price: null },
      { id: 2, label: "500гр", price: 15, promo_price: 12 },
    ],
  }),
  ...Array.from({ length: 16 }, (_, i) => product(10 + i, { promo: true, promo_price: "1.00", price: "2.00" })),
];

export const CATEGORIES = [
  { id: 1, Name: "Плодове", subcategories: [] },
  { id: 2, Name: "Зеленчуци", subcategories: [] },
  { id: 3, Name: "Основни продукти", subcategories: [{ id: 31, Name: "Мед и пчелни продукти" }] },
];

const page = (data, total) => ({ data, meta: { pagination: { total } } });

// Подменя целия бекенд (Strapi на Render) и Cloudinary. Опциите позволяват да симулираме бавно/счупено API.
export async function mockBackend(pg, { delayMs = 0, products = PRODUCTS, catalogStatus = 200, orderStatus = 200 } = {}) {
  const orders = [];
  const wait = () => (delayMs ? new Promise((r) => setTimeout(r, delayMs)) : undefined);

  await pg.route("https://res.cloudinary.com/**", (r) => r.fulfill({ contentType: "image/png", body: PIXEL }));

  await pg.route("https://fruitshopstore.onrender.com/api/categories**", async (r) => {
    await wait();
    await r.fulfill({ json: { data: CATEGORIES } });
  });

  await pg.route("https://fruitshopstore.onrender.com/api/products**", async (r) => {
    await wait();
    const url = new URL(r.request().url());
    const slug = url.searchParams.get("filters[slug][$eq]");
    if (slug) {
      const found = products.filter((p) => p.slug === slug);
      return r.fulfill({ json: page(found, found.length) });
    }
    if (url.searchParams.get("fields[1]") === "product_description") {
      return r.fulfill({ json: page(products.map((p) => ({ slug: p.slug, product_description: p.product_description })), products.length) });
    }
    if (catalogStatus !== 200) return r.fulfill({ status: catalogStatus, body: "error" });
    const pageNo = Number(url.searchParams.get("pagination[page]") || 1);
    const size = Number(url.searchParams.get("pagination[pageSize]") || 100);
    const slice = products.slice((pageNo - 1) * size, pageNo * size);
    return r.fulfill({ json: page(slice, products.length) });
  });

  await pg.route("https://fruitshopstore.onrender.com/api/orders", async (r) => {
    if (r.request().method() !== "POST") return r.continue();
    orders.push(r.request().postDataJSON());
    if (orderStatus !== 200) return r.fulfill({ status: orderStatus, body: "error" });
    await r.fulfill({ json: { data: { id: 4242 } } });
  });

  return { orders };
}

export const test = base.extend({
  // Всеки тест получава подменен бекенд; тестовете могат да го презапишат с mockBackend(page, опции).
  backend: async ({ page }, use) => {
    await use(await mockBackend(page));
  },
});

export { expect };
