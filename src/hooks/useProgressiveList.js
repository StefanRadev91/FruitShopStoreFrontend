import { useCallback, useEffect, useState } from "react";

export const PAGE_STEP = 24;

// Показва списъка на порции: стотици карти наведнъж запушват главната нишка (висок TBT на телефон).
// Когато списъкът се смени (друга категория, сортиране, филтър), започва отначало.
export function useProgressiveList(items, step = PAGE_STEP) {
  const [count, setCount] = useState(step);

  // "Подпис" на списъка (дължина + първи и последен елемент): сменя се при друга категория, филтър или
  // сортиране, но не и при нов масив със същото съдържание (така не се губи вече показаното).
  const idOf = (x) => x?.id ?? x;
  const signature = `${items.length}|${idOf(items[0])}|${idOf(items[items.length - 1])}`;

  useEffect(() => {
    setCount(step);
  }, [signature, step]);

  const showMore = useCallback(() => setCount((c) => c + step), [step]);

  return {
    visible: items.slice(0, count),
    hasMore: items.length > count,
    remaining: Math.max(0, items.length - count),
    showMore,
  };
}
