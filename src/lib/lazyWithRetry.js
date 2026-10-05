import { lazy } from "react";

// Като React.lazy, но при неуспех (мрежа, нов деплой) опитва още веднъж, преди да хвърли грешка.
export function lazyWithRetry(loader, { retries = 1, delayMs = 400 } = {}) {
  const load = async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await loader();
      } catch (err) {
        if (attempt >= retries) throw err;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  };
  return { Component: lazy(load), load };
}
