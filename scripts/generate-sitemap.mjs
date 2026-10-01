// Генерира public/sitemap.xml от продуктите и категориите в Strapi.
// Пуска се автоматично преди билда. Ако API-то не отговори, оставя съществуващия sitemap.xml
// и билдът продължава нормално.
import { writeFile } from "node:fs/promises";
import { CATEGORY_ROUTES } from "../src/seo/categoryRoutes.js";

const SITE = "https://darotzemqta.bg";
const API = "https://fruitshopstore.onrender.com/api";
const PAGE_SIZE = 100; // maxLimit на Strapi
const OUT = new URL("../public/sitemap.xml", import.meta.url);

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/delivery", priority: "0.5", changefreq: "monthly" },
  { path: "/about", priority: "0.4", changefreq: "monthly" },
  { path: "/idea", priority: "0.4", changefreq: "monthly" },
  { path: "/terms", priority: "0.2", changefreq: "yearly" },
  { path: "/cookies", priority: "0.2", changefreq: "yearly" },
];

async function getJson(url, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === attempts) throw err;
      await new Promise((r) => setTimeout(r, 3000 * i)); // Render може да се "буди" до минута
    }
  }
}

async function getAll(endpoint, query) {
  const first = await getJson(`${API}/${endpoint}?${query}&pagination[page]=1&pagination[pageSize]=${PAGE_SIZE}`);
  const total = first.meta?.pagination?.total ?? first.data.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: Math.max(pages - 1, 0) }, (_, i) =>
      getJson(`${API}/${endpoint}?${query}&pagination[page]=${i + 2}&pagination[pageSize]=${PAGE_SIZE}`)
    )
  );
  return [first, ...rest].flatMap((r) => r.data || []);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const day = (iso) => (iso ? String(iso).slice(0, 10) : null);

function urlEntry({ path, lastmod, priority, changefreq }) {
  return [
    "  <url>",
    `    <loc>${esc(SITE + path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

try {
  const products = await getAll(
    "products",
    "fields[0]=slug&fields[1]=updatedAt&populate[category][fields][0]=Name&sort[0]=id:asc"
  );

  // Само категории, в които реално има продукти (празните са noindex).
  const categoryStats = new Map();
  for (const p of products) {
    const name = p.category?.Name;
    if (!name) continue;
    const prev = categoryStats.get(name) || { lastmod: null };
    const d = day(p.updatedAt);
    if (d && (!prev.lastmod || d > prev.lastmod)) prev.lastmod = d;
    categoryStats.set(name, prev);
  }

  const entries = [
    ...STATIC_PAGES,
    ...[...categoryStats.entries()].map(([name, { lastmod }]) => ({
      path: CATEGORY_ROUTES[name] || `/category/${encodeURIComponent(name)}`,
      lastmod,
      priority: "0.8",
      changefreq: "weekly",
    })),
    ...products
      .filter((p) => p.slug)
      .map((p) => ({
        path: `/product/${encodeURIComponent(p.slug)}`,
        lastmod: day(p.updatedAt),
        priority: "0.6",
        changefreq: "weekly",
      })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(urlEntry)
    .join("\n")}\n</urlset>\n`;
  await writeFile(OUT, xml, "utf8");
  console.log(`sitemap: ${entries.length} URLs (${products.length} продукта, ${categoryStats.size} категории)`);
} catch (err) {
  console.warn(`sitemap: пропуснат (${err.message}) – остава текущият public/sitemap.xml`);
}
