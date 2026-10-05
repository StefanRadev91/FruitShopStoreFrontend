import { useEffect, useState } from "react";
import { whenIdle } from "../lib/whenIdle";

// Зарежда ленив чънк в свободно време (след като страницата вече е показана).
// Връща true, когато чънкът е готов. Ако зареждането се провали – връща false и не хвърля:
// чънкът ще се опита да се зареди отново, когато потребителят наистина го поиска.
export function useIdlePreload(loader) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cancelIdle = whenIdle(() =>
      loader()
        .then(() => {
          if (!cancelled) setReady(true);
        })
        .catch(() => {})
    );
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [loader]);

  return ready;
}
