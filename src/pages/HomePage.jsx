// src/pages/HomePage.jsx
import { useMemo } from "react";
import { Box, VisuallyHidden } from "@mantine/core";
import { ProductSlider } from "../components/ProductSlider";
import { FeatureBanners } from "../components/FeatureBanners";
import { CategoryIconsSlider } from "../components/CategoryIconsSlider";
import { DeliveryBanners } from "../components/DeliveryBanners";
import { CatalogError } from "../components/CatalogError";
import { Seo } from "../seo/Seo";
import { HomeSkeleton } from "../components/Skeletons";
import { useCatalog } from "../services/productsAPI";

export function HomePage({ onAddToCart }) {
  const { products, loading, error, reload } = useCatalog();

  const promo = useMemo(() => products.filter((p) => p.promo === true), [products]);
  const featured = useMemo(() => products.filter((p) => p.featured === true), [products]);
  const newProducts = useMemo(() => products.filter((p) => p.new_product === true), [products]);

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (error && products.length === 0) return <CatalogError onRetry={reload} />;

  if (loading) return <HomeSkeleton />;

  return (
    <>
      <Seo path="/" />
      <VisuallyHidden component="h1">
        Дар от Земята – натурални продукти от български ферми
      </VisuallyHidden>
      <DeliveryBanners />

      <CategoryIconsSlider />

      {/* Промо продукти – подредени по последна модификация */}
      <Box sx={{ backgroundColor: "#E3F7FF", py: 8 }}>
        <ProductSlider
          variant="promo"
          products={[...promo].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
          onAddToCart={handleAddToCart}
        />
      </Box>

      {/* Най-нови продукти – също по updatedAt */}
      <ProductSlider
        variant="new"
        products={[...newProducts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
        onAddToCart={handleAddToCart}
      />

      <FeatureBanners />

      {/* Най-продавани – също по updatedAt */}
      <Box sx={{ backgroundColor: "#0D3B66", py: 8 }}>
        <ProductSlider
          variant="best"
          products={[...featured].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
          onAddToCart={handleAddToCart}
        />
      </Box>
    </>
  );
}