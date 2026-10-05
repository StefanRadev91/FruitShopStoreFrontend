import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTACT_LINE, EMAIL, PHONE } from "./contact";
import { HOME_SLIDER_LIMIT } from "./home";
import { COLLECTIONS } from "./collections";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("конфигурация", () => {
  it("контактната лента съдържа телефона и имейла", () => {
    expect(CONTACT_LINE).toContain(PHONE);
    expect(CONTACT_LINE).toContain(EMAIL);
  });

  it("лимитът на слайдерите е разумен", () => {
    expect(HOME_SLIDER_LIMIT).toBeGreaterThanOrEqual(4);
    expect(HOME_SLIDER_LIMIT).toBeLessThanOrEqual(30);
  });

  it("index.html има заместител за контактите, а не твърдо записан текст", () => {
    const html = readFileSync(resolve(root, "index.html"), "utf8");
    expect(html).toContain("<!--CONTACT_LINE-->");
    expect(html).not.toContain(PHONE);
  });

  it("всички шрифтови файлове от fonts.css съществуват", () => {
    const css = readFileSync(resolve(root, "src/fonts.css"), "utf8");
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThanOrEqual(6); // 2 шрифта × (cyrillic, latin-ext, latin)
    for (const u of urls) expect(existsSync(resolve(root, "src", u)), u).toBe(true);
  });

  it("fonts.css има font-display: swap и не включва ненужни подмножества", () => {
    const css = readFileSync(resolve(root, "src/fonts.css"), "utf8");
    expect(css).toContain("font-display: swap");
    expect(css).not.toMatch(/greek|vietnamese/);
  });

  it("колекциите филтрират правилните продукти и имат уникални адреси", () => {
    expect(COLLECTIONS.promo.filter({ promo: true })).toBe(true);
    expect(COLLECTIONS.promo.filter({ promo: false })).toBe(false);
    expect(COLLECTIONS.new.filter({ new_product: true })).toBe(true);
    expect(COLLECTIONS.best.filter({ featured: true })).toBe(true);
    const paths = Object.values(COLLECTIONS).map((c) => c.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("vercel.json кешира хешираните ресурси за година (immutable) и пази rewrite-а за SPA", () => {
    const cfg = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));
    const assets = cfg.headers.find((h) => h.source === "/assets/(.*)");
    expect(assets.headers).toContainEqual({ key: "Cache-Control", value: "public, max-age=31536000, immutable" });
    expect(cfg.rewrites).toContainEqual({ source: "/(.*)", destination: "/" });
    // само /assets (с хеш в името) е immutable – index.html не бива да е
    expect(cfg.headers.every((h) => h.source.startsWith("/assets"))).toBe(true);
  });
});
