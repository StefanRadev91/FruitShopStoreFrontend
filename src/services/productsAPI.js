import { useEffect, useState } from "react";

export const BASE_URL = "https://fruitshopstore.onrender.com";

// Дългите описания са ~80% от размера на списъците. Картата показва само първия ред,
// затова по подразбиране не ги теглим (пълното описание се зарежда на страницата на продукта).
// Сложи true, ако искаш да се върне описанието в картите.
const INCLUDE_DESCRIPTION_IN_LISTS = false;

const PAGE_SIZE = 100; // maxLimit на Strapi
const STORAGE_KEY = "catalog_v1";

const FIELDS = [
  "name",
  "slug",
  "price",
  "promo_price",
  "promo",
  "featured",
  "new_product",
  "updatedAt",
  ...(INCLUDE_DESCRIPTION_IN_LISTS ? ["product_description"] : []),
];

function pageUrl(page) {
  const params = [
    ...FIELDS.map((f, i) => `fields[${i}]=${f}`),
    "populate[image][fields][0]=url",
    "populate[category][fields][0]=Name",
    "populate[weight_variants]=true",
    `pagination[page]=${page}`,
    `pagination[pageSize]=${PAGE_SIZE}`,
  ];
  return `${BASE_URL}/api/products?${params.join("&")}`;
}

async function fetchPage(page) {
  const res = await fetch(pageUrl(page));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Теглим целия каталог наведнъж (леки данни) – всички страници го филтрират локално.
async function fetchCatalog() {
  // Първите 3 страници тръгват паралелно, за да не чакаме една след друга.
  const first = await Promise.all([1, 2, 3].map(fetchPage));
  const total = first[0].meta?.pagination?.total ?? 0;
  const pages = first.map((r) => r.data || []);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  if (pageCount > 3) {
    const rest = await Promise.all(
      Array.from({ length: pageCount - 3 }, (_, i) => fetchPage(i + 4))
    );
    rest.forEach((r) => pages.push(r.data || []));
  }
  return pages.flat();
}

// Описанията се теглят отделно и на заден план (след като каталогът вече е показан),
// за да се отварят страниците на продуктите веднага.
const DESC_KEY = "descriptions_v1";

async function fetchDescriptionPage(page) {
  const res = await fetch(
    `${BASE_URL}/api/products?fields[0]=slug&fields[1]=product_description&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function prefetchDescriptions() {
  try {
    const first = await Promise.all([1, 2, 3].map(fetchDescriptionPage));
    const pages = first.map((r) => r.data || []);
    const pageCount = Math.ceil((first[0].meta?.pagination?.total ?? 0) / PAGE_SIZE);
    if (pageCount > 3) {
      const rest = await Promise.all(
        Array.from({ length: pageCount - 3 }, (_, i) => fetchDescriptionPage(i + 4))
      );
      rest.forEach((r) => pages.push(r.data || []));
    }
    const map = {};
    pages.flat().forEach((p) => {
      map[p.slug] = p.product_description;
    });
    localStorage.setItem(DESC_KEY, JSON.stringify(map));
  } catch {
    /* не е критично – страницата на продукта ще си дръпне описанието сама */
  }
}

function readDescription(slug) {
  try {
    return JSON.parse(localStorage.getItem(DESC_KEY) || "{}")[slug];
  } catch {
    return undefined;
  }
}

let catalogPromise = null;

export function getCatalog({ force = false } = {}) {
  if (!catalogPromise || force) {
    catalogPromise = fetchCatalog()
      .then((data) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          /* пълен storage – не е проблем */
        }
        setTimeout(prefetchDescriptions, 500);
        return data;
      })
      .catch((err) => {
        catalogPromise = null;
        throw err;
      });
  }
  return catalogPromise;
}

function readSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function findInSnapshot(slug) {
  const product = readSnapshot()?.find((p) => p.slug === slug);
  if (!product) return null;
  const product_description = readDescription(slug);
  return product_description ? { ...product, product_description } : product;
}

// Показва веднага последно видяния каталог (ако има) и го опреснява във фонов режим.
export function useCatalog() {
  const [products, setProducts] = useState(readSnapshot);
  const [loading, setLoading] = useState(products === null);

  useEffect(() => {
    let cancelled = false;
    getCatalog()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => console.error("Грешка при зареждане на продукти:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products: products || [], loading };
}

export function sortByName(list) {
  return [...list].sort((a, b) =>
    a.name.localeCompare(b.name, "bg", { sensitivity: "base" })
  );
}

export function clearCatalogCache() {
  catalogPromise = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// Cloudinary умалява и оптимизира снимките в движение (w_ ширина, f_auto формат, q_auto качество).
export function imageUrl(image, width = 400) {
  const url = image?.[0]?.url;
  if (!url) return "";
  const full = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  return full.includes("res.cloudinary.com") && full.includes("/upload/")
    ? full.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`)
    : full;
}
