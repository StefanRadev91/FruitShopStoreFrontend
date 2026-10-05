import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useProgressiveList, PAGE_STEP } from "./useProgressiveList";

const list = (n) => Array.from({ length: n }, (_, i) => i);

describe("useProgressiveList", () => {
  it("показва първата порция", () => {
    const { result } = renderHook(() => useProgressiveList(list(100)));
    expect(result.current.visible).toHaveLength(PAGE_STEP);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.remaining).toBe(100 - PAGE_STEP);
  });

  it("showMore добавя следваща порция до края", () => {
    const { result } = renderHook(() => useProgressiveList(list(30), 10));
    act(() => result.current.showMore());
    expect(result.current.visible).toHaveLength(20);
    act(() => result.current.showMore());
    expect(result.current.visible).toHaveLength(30);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.remaining).toBe(0);
    act(() => result.current.showMore());
    expect(result.current.visible).toHaveLength(30); // не надвишава списъка
  });

  it("къс списък се показва целият, без „още“", () => {
    const { result } = renderHook(() => useProgressiveList(list(5)));
    expect(result.current.visible).toHaveLength(5);
    expect(result.current.hasMore).toBe(false);
  });

  it("при нов списък (друга категория/сортиране) започва отначало", () => {
    const { result, rerender } = renderHook(({ items }) => useProgressiveList(items, 10), {
      initialProps: { items: list(50) },
    });
    act(() => result.current.showMore());
    expect(result.current.visible).toHaveLength(20);
    rerender({ items: list(40) });
    expect(result.current.visible).toHaveLength(10);
  });
});
