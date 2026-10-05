import { describe, expect, it, vi } from "vitest";
import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { lazyWithRetry } from "./lazyWithRetry";
import { ErrorBoundary } from "../components/ErrorBoundary";

const Hello = () => <p>Здравей</p>;

describe("lazyWithRetry", () => {
  it("зарежда компонента", async () => {
    const { Component } = lazyWithRetry(async () => ({ default: Hello }));
    render(
      <Suspense fallback="чака">
        <Component />
      </Suspense>
    );
    expect(await screen.findByText("Здравей")).toBeInTheDocument();
  });

  it("опитва още веднъж след неуспех", async () => {
    const loader = vi.fn().mockRejectedValueOnce(new Error("мрежа")).mockResolvedValueOnce({ default: Hello });
    const { load } = lazyWithRetry(loader, { delayMs: 1 });
    await expect(load()).resolves.toEqual({ default: Hello });
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("хвърля, след като опитите свършат", async () => {
    const loader = vi.fn().mockRejectedValue(new Error("няма чънк"));
    const { load } = lazyWithRetry(loader, { retries: 2, delayMs: 1 });
    await expect(load()).rejects.toThrow("няма чънк");
    expect(loader).toHaveBeenCalledTimes(3);
  });

  it("неуспехът се хваща от ErrorBoundary и не събаря всичко", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { Component } = lazyWithRetry(() => Promise.reject(new Error("x")), { retries: 0 });
    render(
      <div>
        <p>Останалият сайт</p>
        <ErrorBoundary fallback={<p>Грешка при зареждане</p>}>
          <Suspense fallback={null}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
    expect(await screen.findByText("Грешка при зареждане")).toBeInTheDocument();
    expect(screen.getByText("Останалият сайт")).toBeInTheDocument();
  });
});
