import { defineConfig, devices } from "@playwright/test";

// Проверки срещу ЖИВИЯ сайт (истинското API). Само четене – никога не пращат поръчка.
//   npm run test:prod                      → https://darotzemqta.bg
//   PROD_URL=https://... npm run test:prod → друг адрес (напр. Vercel preview)
const BASE = process.env.PROD_URL || "https://darotzemqta.bg";

export default defineConfig({
  testDir: "./e2e-prod",
  timeout: 90_000, // Render може да е "заспал" и да отговаря бавно
  expect: { timeout: 45_000 },
  retries: 1,
  reporter: "list",
  use: { baseURL: BASE, locale: "bg-BG", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
