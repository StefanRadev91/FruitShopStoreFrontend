import { defineConfig, devices } from "@playwright/test";

const PORT = 4175;
// E2E_BASE_URL=https://... пуска същите тестове срещу вече деплойнат адрес (без локален build/сървър).
const REMOTE = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: REMOTE || `http://localhost:${PORT}`,
    locale: "bg-BG",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Телефонът е основната аудитория – най-важните потоци минават и там.
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
      testMatch: /(home|cart|resilience)\.spec\.js/,
    },
  ],
  // Тества се production билдът (както го вижда клиентът). API-то е изцяло подменено – вж. e2e/fixtures.js.
  webServer: REMOTE
    ? undefined
    : {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
