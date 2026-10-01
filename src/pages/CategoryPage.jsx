// src/pages/CategoryPage.jsx - почистена версия
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Title, SimpleGrid, Text } from "@mantine/core";
import { ProductCard } from "../components/ProductCard";
import { Seo, breadcrumbJsonLd } from "../seo/Seo";
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

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (error && catalog.length === 0) return <CatalogError onRetry={reload} />;

  if (loading) {
    return (
      <div
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
          Зареждаме категорията...
        </div>
        <style>
          {`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50%       { transform: translateY(-14px); }
            }
          `}
        </style>
      </div>
    );
  }

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

      {/* Продукти */}
      {products.length === 0 ? (
        <Text ta="center" c="dimmed">
          Няма продукти в категория "{categoryName}".
        </Text>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3, xl: 3 }}
          spacing="lg"
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              promo_price={p.promo_price}
              description={p.product_description}
              image={p.image}
              category={p.category}
              weight_variants={p.weight_variants || []}
              onAddToCart={handleAddToCart}
            />
          ))}
        </SimpleGrid>
      )}
    </>
  );
}