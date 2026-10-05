import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let api;
// Само заявките за каталога (без фоновото теглене на описанията).
const catalogCalls = (fetchMock) => fetchMock.mock.calls.filter(([url]) => !url.includes("fields[1]=product_description"));
const okJson = (data, total = data.length) => ({
  ok: true,
  json: async () => ({ data, meta: { pagination: { total } } }),
});

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  api = await import("./productsAPI");
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("imageUrl", () => {
  it("добавя Cloudinary трансформации", () => {
    const url = api.imageUrl([{ url: "https://res.cloudinary.com/x/image/upload/v1/a.webp" }], 360);
    expect(url).toBe("https://res.cloudinary.com/x/image/upload/w_360,f_auto,q_auto/v1/a.webp");
  });

  it("ползва ширина 400 по подразбиране", () => {
    expect(api.imageUrl([{ url: "https://res.cloudinary.com/x/image/upload/a.webp" }])).toContain("w_400");
  });

  it("връща чужд адрес непроменен, а относителен – с адреса на API-то", () => {
    expect(api.imageUrl([{ url: "https://cdn.example.com/a.png" }])).toBe("https://cdn.example.com/a.png");
    expect(api.imageUrl([{ url: "/uploads/a.png" }])).toBe(`${api.BASE_URL}/uploads/a.png`);
  });

  it("връща празен низ без снимка", () => {
    expect(api.imageUrl([])).toBe("");
    expect(api.imageUrl(undefined)).toBe("");
  });
});

describe("sortByName", () => {
  it("подрежда по българска азбука и не променя входа", () => {
    const input = [{ name: "Ябълка" }, { name: "Банан" }, { name: "Авокадо" }];
    expect(api.sortByName(input).map((p) => p.name)).toEqual(["Авокадо", "Банан", "Ябълка"]);
    expect(input[0].name).toBe("Ябълка");
  });
});

describe("getCatalog", () => {
  it("тегли страниците и ги слива", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(okJson([{ id: 1, slug: "a" }], 250))
      .mockResolvedValueOnce(okJson([{ id: 2, slug: "b" }], 250))
      .mockResolvedValueOnce(okJson([{ id: 3, slug: "c" }], 250)); // 250 продукта = 3 страници по 100
    const catalog = await api.getCatalog();
    expect(catalog.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toContain("pagination[page]=1");
    expect(fetchMock.mock.calls[0][0]).toContain("sort[0]=id:asc"); // стабилен ред
  });

  it("при повече от 3 страници тегли и останалите", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const page = Number(/pagination\[page\]=(\d+)/.exec(url)[1]);
      return okJson([{ id: page, slug: `p${page}` }], 450);
    });
    const catalog = await api.getCatalog();
    expect(catalog.map((p) => p.id)).toEqual([1, 2, 3, 4, 5]);
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("не тегли дългите описания в списъка", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(okJson([], 0));
    await api.getCatalog();
    expect(fetchMock.mock.calls[0][0]).not.toContain("product_description");
  });

  it("повторно извикване ползва същата заявка (кеш)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(okJson([], 0));
    await api.getCatalog();
    await api.getCatalog();
    expect(catalogCalls(fetchMock)).toHaveLength(3); // само първото теглене (3 паралелни страници)
  });

  it("force опреснява каталога", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(okJson([], 0));
    await api.getCatalog();
    await api.getCatalog({ force: true });
    expect(catalogCalls(fetchMock)).toHaveLength(6);
  });

  it("след 5 минути каталогът се опреснява", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(okJson([], 0));
    await api.getCatalog();
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    await api.getCatalog();
    expect(catalogCalls(fetchMock)).toHaveLength(6);
  });

  it("при грешка не кешира провала – следващият опит пак тегли", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (!failed) {
        failed = true;
        return { ok: false, status: 500 };
      }
      return okJson(url.includes("pagination[page]=1") ? [{ id: 1, slug: "a" }] : [], 1);
    });
    let failed = false;
    await expect(api.getCatalog()).rejects.toThrow("HTTP 500");
    await expect(api.getCatalog()).resolves.toHaveLength(1);
  });

  it("запазва каталога за следващо посещение и го връща от findInSnapshot", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
      okJson(url.includes("pagination[page]=1") ? [{ id: 1, slug: "a", name: "A" }] : [], 1)
    );
    await api.getCatalog();
    expect(JSON.parse(localStorage.getItem("catalog_v1"))).toHaveLength(1);
    expect(api.findInSnapshot("a")).toMatchObject({ id: 1 });
    expect(api.findInSnapshot("няма")).toBeNull();
  });

  it("clearCatalogCache изчиства запазеното", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
      okJson(url.includes("pagination[page]=1") ? [{ id: 1, slug: "a" }] : [], 1)
    );
    await api.getCatalog();
    api.clearCatalogCache();
    expect(localStorage.getItem("catalog_v1")).toBeNull();
    expect(api.findInSnapshot("a")).toBeNull();
  });
});
