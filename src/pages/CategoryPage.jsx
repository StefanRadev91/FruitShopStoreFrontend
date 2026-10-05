// src/pages/CategoryPage.jsx - почистена версия
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Title, Text } from "@mantine/core";
import { ProductGrid } from "../components/ProductGrid";
import { Seo, breadcrumbJsonLd } from "../seo/Seo";
import { ProductGridSkeleton } from "../components/Skeletons";
import { ProductToolbar, useProductView } from "../components/ProductToolbar";
import { CategoryChips } from "../components/CategoryChips";
import { categoryPath } from "../seo/categoryRoutes";
import { CatalogError } from "../components/CatalogError";
import { useCatalog, sortByName } from "../services/productsAPI";

export function CategoryPage({ category: propCategory, onAddToCart }) {
  const { subcategory } = useParams();
  const { products: catalog, loading, error, reload } = useCatalog();

  // Приоритет: 1) prop category (за старите routes), 2) subcategory param (за новите)
  const categoryName = propCategory || (subcategory ? decodeURIComponent(subcategory) : "");

  const products = useMemo(
    () => sortByName(catalog.filter((p) => p.category?.Name === categoryName)),
    [catalog, categoryName]
  );
  const view = useProductView(products);

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (error && catalog.length === 0) return <CatalogError onRetry={reload} />;

  if (loading) return <ProductGridSkeleton />;

  const path = categoryPath(categoryName);

  return (
    <>
      <Seo
        title={`${categoryName} – купи онлайн`}
        description={
          products.length > 0
            ? `${categoryName} – ${products.length} продукта от български ферми. Свежи и натурални, с доставка до дома или офиса. Поръчай онлайн от Дар от Земята.`
            : `${categoryName} – Дар от Земята`
        }
        path={path}
        noindex={products.length === 0}
        jsonLd={breadcrumbJsonLd([
          { name: "Начало", path: "/" },
          { name: categoryName, path },
        ])}
      />
      {/* Заглавие */}
      <Title order={1} size="h2" mb="lg" ta="center">
        {categoryName}
      </Title>

      <CategoryChips current={categoryName} />

      {/* Продукти */}
      {products.length === 0 ? (
        <Text ta="center" c="dimmed">
          Няма продукти в категория "{categoryName}".
        </Text>
      ) : (
        <>
        <ProductToolbar view={view} />
        {view.visible.length === 0 ? (
          <Text ta="center" c="dimmed">
            Няма продукти на промоция в тази категория.
          </Text>
        ) : (
          <ProductGrid products={view.visible} onAddToCart={handleAddToCart} />
        )}
        </>
      )}
    </>
  );
}