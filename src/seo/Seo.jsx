import { useEffect } from "react";

// Основният адрес на сайта (без www – www пренасочва към него).
export const SITE_URL = "https://darotzemqta.bg";
export const SITE_NAME = "Дар от Земята";
export const DEFAULT_TITLE = "Дар от Земята | Натурални продукти от български ферми";
export const DEFAULT_DESCRIPTION =
  "Дар от Земята предлага чисти натурални продукти, директно от български ферми – без посредници, без компромиси. Подкрепи местното производство.";
export const DEFAULT_IMAGE = `${SITE_URL}/logo-og.png`;

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function truncate(text, max = 158) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

// Задава заглавие, описание, canonical, Open Graph, robots и JSON-LD за текущата страница.
// При напускане на страницата връща стойностите по подразбиране от index.html.
export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd = null,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = truncate(description) || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", desc);
    upsertMeta("name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    upsertCanonical(url);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", image);

    let script = null;
    if (jsonLdText) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "page");
      script.textContent = jsonLdText;
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
      document.title = DEFAULT_TITLE;
      upsertMeta("name", "description", DEFAULT_DESCRIPTION);
      upsertMeta("name", "robots", "index, follow, max-image-preview:large");
      upsertCanonical(`${SITE_URL}/`);
      upsertMeta("property", "og:title", DEFAULT_TITLE);
      upsertMeta("property", "og:description", DEFAULT_DESCRIPTION);
      upsertMeta("property", "og:url", `${SITE_URL}/`);
      upsertMeta("property", "og:image", DEFAULT_IMAGE);
      upsertMeta("name", "twitter:title", DEFAULT_TITLE);
      upsertMeta("name", "twitter:description", DEFAULT_DESCRIPTION);
      upsertMeta("name", "twitter:image", DEFAULT_IMAGE);
    };
  }, [fullTitle, desc, url, image, noindex, jsonLdText]);

  return null;
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
