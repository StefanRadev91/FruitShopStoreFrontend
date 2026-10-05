import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useIdlePreload } from "./useIdlePreload";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useIdlePreload", () => {
  it("зарежда в свободно време и става ready", async () => {
    const loader = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => useIdlePreload(loader));
    expect(result.current).toBe(false);
    expect(loader).not.toHaveBeenCalled(); // не веднага – не пречи на първоначалното зареждане
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2600);
    });
    expect(loader).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(true);
  });

  it("при провал не хвърля и остава false", async () => {
    const loader = vi.fn().mockRejectedValue(new Error("Failed to fetch dynamically imported module"));
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
    const { result } = renderHook(() => useIdlePreload(loader));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2600);
    });
    expect(loader).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(false);
    expect(unhandled).not.toHaveBeenCalled();
    process.off("unhandledRejection", unhandled);
  });

  it("отмяна при демонтиране – не зарежда и не пипа state", async () => {
    const loader = vi.fn().mockResolvedValue({});
    const { unmount } = renderHook(() => useIdlePreload(loader));
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(loader).not.toHaveBeenCalled();
  });

  it("ползва requestIdleCallback, когато го има", async () => {
    const ric = vi.fn((cb) => setTimeout(cb, 0));
    const cic = vi.fn();
    window.requestIdleCallback = ric;
    window.cancelIdleCallback = cic;
    const loader = vi.fn().mockResolvedValue({});
    const { unmount } = renderHook(() => useIdlePreload(loader));
    expect(ric).toHaveBeenCalledWith(expect.any(Function), { timeout: 4000 });
    unmount();
    expect(cic).toHaveBeenCalled();
    delete window.requestIdleCallback;
    delete window.cancelIdleCallback;
  });
});
