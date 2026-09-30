// src/pages/HomePage.jsx
import { useMemo } from "react";
import { Box } from "@mantine/core";
import { ProductSlider } from "../components/ProductSlider";
import { FeatureBanners } from "../components/FeatureBanners";
import { CategoryIconsSlider } from "../components/CategoryIconsSlider";
import { DeliveryBanners } from "../components/DeliveryBanners";
import { useCatalog } from "../services/productsAPI";

export function HomePage({ onAddToCart }) {
  const { products, loading } = useCatalog();

  const promo = useMemo(() => products.filter((p) => p.promo === true), [products]);
  const featured = useMemo(() => products.filter((p) => p.featured === true), [products]);
  const newProducts = useMemo(() => products.filter((p) => p.new_product === true), [products]);

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (loading)
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          minHeight: 300,
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/590/590685.png"
          alt="Зареждаме..."
          style={{
            width: 80,
            height: 80,
            animation: "bounce 1.2s ease-in-out infinite",
          }}
        />
        <div style={{ marginTop: 12, fontSize: 16, color: "#888" }}>
          Зареждаме свежест...
        </div>
        <style>
          {`
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-14px);
              }
            }
          `}
        </style>
      </Box>
    );

  return (
    <>
      <DeliveryBanners />

      {/* Промо продукти – подредени по последна модификация */}
      <Box sx={{ backgroundColor: "#E3F7FF", py: 8 }}>
        <ProductSlider
          title="📣 Промо продукти"
          products={[...promo].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
          onAddToCart={handleAddToCart}
        />
      </Box>

      <CategoryIconsSlider />

      {/* Най-нови продукти – също по updatedAt */}
      <ProductSlider
        title="🆕 Най-нови продукти"
        products={[...newProducts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
        onAddToCart={handleAddToCart}
      />

      <FeatureBanners />

      {/* Най-продавани – също по updatedAt */}
      <Box sx={{ backgroundColor: "#0D3B66", py: 8 }}>
        <ProductSlider
          title="⭐ Най-продавани"
          products={[...featured].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
          onAddToCart={handleAddToCart}
        />
      </Box>
    </>
  );
}