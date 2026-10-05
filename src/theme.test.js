import { describe, expect, it } from "vitest";
import { DEFAULT_THEME } from "@mantine/core";
import { theme } from "./theme";
import { contrast, darkenToContrast, tintOnWhite } from "./lib/contrast";

describe("contrast", () => {
  it("черно/бяло е 21:1, еднакви цветове 1:1", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#777777")).toBeCloseTo(1, 5);
  });

  it("darkenToContrast стига до целевия контраст", () => {
    const dark = darkenToContrast("#40c057", ["#ffffff"], 4.5);
    expect(contrast(dark, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("не пипа цвят, който вече е достатъчно тъмен", () => {
    expect(darkenToContrast("#000000", ["#ffffff"], 4.5)).toBe("#000000");
  });
});

describe("тема (достъпност)", () => {
  it.each(["green", "red", "blue", "orange"])("основният нюанс на %s е четим върху бяло и върху светлия си фон (≥ 4.5:1)", (name) => {
    const main = theme.colors[name][6];
    expect(contrast(main, "#ffffff")).toBeGreaterThanOrEqual(4.5); // текст върху бяло И бял текст върху бутона
    expect(contrast(main, tintOnWhite(main, 0.1))).toBeGreaterThanOrEqual(4.5); // light бутони/значки (10% тон)
  });

  it("другите нюанси не са променени", () => {
    expect(theme.colors.green[3]).toBe(DEFAULT_THEME.colors.green[3]);
    expect(theme.colors.green).toHaveLength(10);
  });

  it("шрифтовете имат резервни системни шрифтове", () => {
    expect(theme.fontFamily).toContain("system-ui");
    expect(theme.headings.fontFamily).toContain("system-ui");
  });
});
