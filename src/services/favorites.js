import { useSyncExternalStore } from "react";

// Любими продукти (по id) – пазят се само в браузъра на клиента.
const KEY = "favorites_v1";
const listeners = new Set();
let cache = null;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => Number.isFinite(x)) : [];
  } catch {
    return [];
  }
}

function getSnapshot() {
  if (cache === null) cache = read();
  return cache;
}

function subscribe(callback) {
  listeners.add(callback);
  const onStorage = (e) => {
    if (e.key === KEY) {
      cache = read();
      callback();
    }
  };
  window.addEventListener("storage", onStorage); // промяна от друг таб
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleFavorite(id) {
  const current = getSnapshot();
  cache = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => []);
  return { ids, has: (id) => ids.includes(id), toggle: toggleFavorite };
}
