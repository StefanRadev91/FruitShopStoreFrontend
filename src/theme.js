import { DEFAULT_THEME } from "@mantine/core";
import { darkenToContrast, tintOnWhite } from "./lib/contrast";

// Нюансът по подразбиране (6) на зеленото, червеното, синьото и оранжевото е твърде светъл за четим текст/бутони
// (контраст < 4.5:1). Взимаме по-тъмен нюанс, който е четим върху бяло И върху 10% тонирания фон на
// "light" бутоните/значките – оправя контраста навсякъде наведнъж, без да пипаме компонентите.
const accessible = (name) => {
  const shades = [...DEFAULT_THEME.colors[name]];
  shades[6] = darkenToContrast(shades[7], ["#ffffff", (c) => tintOnWhite(c, 0.1)], 4.6);
  return shades;
};

export const theme = {
  fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  headings: { fontFamily: "'Manrope Variable', Manrope, 'Inter Variable', system-ui, sans-serif", fontWeight: "800" },
  primaryColor: "green",
  colors: {
    green: accessible("green"),
    red: accessible("red"),
    blue: accessible("blue"),
    orange: accessible("orange"),
  },
};
