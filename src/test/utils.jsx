import { render } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";
import { theme } from "../theme";

export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </MantineProvider>
  );
}

export const product = (over = {}) => ({
  id: 1,
  name: "Ябълка",
  slug: "yabalka",
  price: "3.00",
  promo_price: null,
  promo: false,
  featured: false,
  new_product: false,
  updatedAt: "2026-01-01T00:00:00.000Z",
  image: [],
  category: { Name: "Плодове" },
  weight_variants: [],
  ...over,
});
