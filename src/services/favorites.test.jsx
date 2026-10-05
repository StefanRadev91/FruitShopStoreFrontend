import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

// Модулът пази кеш на ниво модул – зареждаме го наново за всеки тест.
let useFavorites;
let toggleFavorite;
beforeEach(async () => {
  vi.resetModules();
  ({ useFavorites, toggleFavorite } = await import("./favorites"));
});

describe("любими", () => {
  it("започва празно и добавя/маха продукти", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids).toEqual([]);
    act(() => result.current.toggle(5));
    expect(result.current.has(5)).toBe(true);
    act(() => result.current.toggle(5));
    expect(result.current.has(5)).toBe(false);
  });

  it("запазва в localStorage", () => {
    act(() => toggleFavorite(1));
    act(() => toggleFavorite(2));
    expect(JSON.parse(localStorage.getItem("favorites_v1"))).toEqual([1, 2]);
  });

  it("чете запазените и игнорира повредени стойности", async () => {
    localStorage.setItem("favorites_v1", JSON.stringify([1, "x", null, 3]));
    vi.resetModules();
    const mod = await import("./favorites");
    const { result } = renderHook(() => mod.useFavorites());
    expect(result.current.ids).toEqual([1, 3]);
  });

  it("не се чупи при невалиден JSON", async () => {
    localStorage.setItem("favorites_v1", "{ъъъ");
    vi.resetModules();
    const mod = await import("./favorites");
    const { result } = renderHook(() => mod.useFavorites());
    expect(result.current.ids).toEqual([]);
  });

  it("всички компоненти се обновяват при промяна", () => {
    const a = renderHook(() => useFavorites());
    const b = renderHook(() => useFavorites());
    act(() => a.result.current.toggle(7));
    expect(b.result.current.has(7)).toBe(true);
  });

  it("следи промяна от друг таб (storage събитие)", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      localStorage.setItem("favorites_v1", JSON.stringify([9]));
      window.dispatchEvent(new StorageEvent("storage", { key: "favorites_v1" }));
    });
    expect(result.current.has(9)).toBe(true);
  });
});
