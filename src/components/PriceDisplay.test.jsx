import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { PriceDisplay, toEUR, formatEUR, eurAmount, convertBGNToEUR } from "./PriceDisplay";
import { renderWithProviders } from "../test/utils";

describe("валута", () => {
  it("конвертира лева в евро по фиксирания курс", () => {
    expect(convertBGNToEUR(1.95583)).toBeCloseTo(1, 10);
    expect(toEUR(1.95583)).toBe(1);
    expect(toEUR(NaN)).toBe(0);
  });

  it("форматира сумите", () => {
    expect(formatEUR(1.95583)).toBe("1.00 €");
    expect(formatEUR(NaN)).toBe("—");
    expect(eurAmount(2.5)).toBe("2.50 €");
  });
});

describe("<PriceDisplay />", () => {
  it("показва само цената без промоция", () => {
    renderWithProviders(<PriceDisplay priceBGN={1.95583} />);
    expect(screen.getByText("1.00 €")).toBeInTheDocument();
  });

  it("при промоция показва и двете цени", () => {
    renderWithProviders(<PriceDisplay priceBGN={3.91166} promoPriceBGN={1.95583} />);
    expect(screen.getByText("2.00 €")).toBeInTheDocument(); // зачертаната
    expect(screen.getByText("1.00 €")).toBeInTheDocument(); // промо
  });
});
