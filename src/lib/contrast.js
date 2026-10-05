// WCAG: относителна яркост и контраст между два #rrggbb цвята.
const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

export function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Смесва цвета с бяло: amount=0.1 е 10% от цвета върху бяло (така Mantine рисува фона на "light" бутоните).
export function tintOnWhite(hex, amount = 0.1) {
  const mixed = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * amount + 255 * (1 - amount)));
  return `#${mixed.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// Потъмнява цвета на стъпки, докато контрастът му към всички фонове стане ≥ min.
// Фонът може да е цвят (#rrggbb) или функция от текущия цвят (напр. tintOnWhite).
export function darkenToContrast(hex, backgrounds, min = 4.5) {
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const toHex = () => `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  const bgOf = (bg) => (typeof bg === "function" ? bg(toHex()) : bg);
  while (backgrounds.some((bg) => contrast(toHex(), bgOf(bg)) < min) && r + g + b > 0) {
    [r, g, b] = [r, g, b].map((v) => Math.max(0, Math.round(v * 0.97)));
  }
  return toHex();
}
