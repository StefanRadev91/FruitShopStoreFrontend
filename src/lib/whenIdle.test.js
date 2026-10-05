import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { whenIdle } from "./whenIdle";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  delete window.requestIdleCallback;
  delete window.cancelIdleCallback;
});

describe("whenIdle", () => {
  it("без requestIdleCallback ползва таймер (най-много 2.5 s)", () => {
    const cb = vi.fn();
    whenIdle(cb, 4000);
    vi.advanceTimersByTime(2499);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("ползва requestIdleCallback с подадения timeout", () => {
    window.requestIdleCallback = vi.fn(() => 7);
    window.cancelIdleCallback = vi.fn();
    const cancel = whenIdle(() => {}, 1234);
    expect(window.requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 1234 });
    cancel();
    expect(window.cancelIdleCallback).toHaveBeenCalledWith(7);
  });

  it("отмяната спира изпълнението", () => {
    const cb = vi.fn();
    const cancel = whenIdle(cb);
    cancel();
    vi.advanceTimersByTime(10_000);
    expect(cb).not.toHaveBeenCalled();
  });
});
