import { useEffect, useState } from "react";

// Има ли устройството мишка (hover)? Определя се по устройството, а не по ширината на прозореца,
// за да работи задържането и в тесен прозорец на компютър.
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

export function useCanHover() {
  const [canHover, setCanHover] = useState(() => window.matchMedia?.(HOVER_QUERY).matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia?.(HOVER_QUERY);
    if (!mq) return;
    const onChange = () => setCanHover(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return canHover;
}
