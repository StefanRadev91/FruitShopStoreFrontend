import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeliveryBanners } from "./DeliveryBanners";
import { renderWithProviders } from "../test/utils";

describe("<DeliveryBanners />", () => {
  it("картинките имат размери (без скачане) и alt текст", () => {
    renderWithProviders(<DeliveryBanners />);
    for (const img of screen.getAllByRole("img")) {
      expect(img).toHaveAttribute("width");
      expect(img).toHaveAttribute("height");
      expect(img.getAttribute("alt")).not.toBe("");
    }
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("първият банер е с висок приоритет (LCP)", () => {
    renderWithProviders(<DeliveryBanners />);
    expect(screen.getAllByRole("img")[0]).toHaveAttribute("fetchpriority", "high");
  });

  it("етикетите са видими", async () => {
    renderWithProviders(<DeliveryBanners />);
    expect(screen.getByText("Поръчай за дома или офиса")).toBeVisible();
    await userEvent.click(screen.getByText("Поръчай за дома или офиса")); // не хвърля
  });
});
