// src/pages/HomePage.jsx
import { Suspense, useMemo } from "react";
import { Box, VisuallyHidden } from "@mantine/core";
import { HomeSlider } from "../components/HomeSlider";
import { FeatureBanners } from "../components/FeatureBanners";
import { CategoryIconsSlider } from "../components/CategoryIconsSlider";
import { DeliveryBanners } from "../components/DeliveryBanners";
import { CatalogError } from "../components/CatalogError";
import { Seo } from "../seo/Seo";
import { ProductSectionsSkeleton } from "../components/Skeletons";
import { useCatalog } from "../services/productsAPI";

export function HomePage({ onAddToCart }) {
  const { products, loading, error, reload } = useCatalog();

  const promo = useMemo(() => products.filter((p) => p.promo === true), [products]);
  const featured = useMemo(() => products.filter((p) => p.featured === true), [products]);
  const newProducts = useMemo(() => products.filter((p) => p.new_product === true), [products]);

  if (error && products.length === 0) return <CatalogError onRetry={reload} />;

  return (
    <>
      <Seo path="/" />
      <VisuallyHidden component="h1">
        Дар от Земята – натурални продукти от български ферми
      </VisuallyHidden>
      <DeliveryBanners />

      <CategoryIconsSlider />

      {loading ? (
        <ProductSectionsSkeleton />
      ) : (
        <Suspense fallback={<ProductSectionsSkeleton />}>
          {/* Промо продукти */}
          <Box sx={{ backgroundColor: "#E3F7FF", py: 8 }}>
            <HomeSlider variant="promo" products={promo} onAddToCart={onAddToCart} />
          </Box>

          {/* Най-нови продукти */}
          <HomeSlider variant="new" products={newProducts} onAddToCart={onAddToCart} />

          <FeatureBanners />

          {/* Най-продавани */}
          <Box sx={{ backgroundColor: "#0D3B66", py: 8 }}>
            <HomeSlider variant="best" products={featured} onAddToCart={onAddToCart} />
          </Box>
        </Suspense>
      )}
    </>
  );
}
