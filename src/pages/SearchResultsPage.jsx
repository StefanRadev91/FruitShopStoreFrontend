import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SimpleGrid, Title, Text, Box } from "@mantine/core";
import { ProductCard } from "../components/ProductCard";
import { Seo } from "../seo/Seo";
import { ProductGridSkeleton } from "../components/Skeletons";
import { ProductToolbar, useProductView } from "../components/ProductToolbar";
import { CatalogError } from "../components/CatalogError";
import { useCatalog, sortByName } from "../services/productsAPI";

export function SearchResultsPage({ onAddToCart }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  const { products, loading, error, reload } = useCatalog();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return sortByName(products.filter((p) => p.name.toLowerCase().includes(q)));
  }, [products, query]);
  const view = useProductView(results);

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (error && products.length === 0) return <CatalogError onRetry={reload} />;

  if (loading) return <ProductGridSkeleton />;

  return (
    <>
      <Seo title="Търсене" path="/search" noindex />
      <Title order={1} size="h2" mb="lg" ta="center">
        Резултати за: “{query}”
      </Title>

      {results.length === 0 ? (
        <Text ta="center" c="dimmed">
          Няма намерени продукти.
        </Text>
      ) : (
        <>
        <ProductToolbar view={view} />
        {view.visible.length === 0 ? (
          <Text ta="center" c="dimmed">
            Няма намерени промоционални продукти.
          </Text>
        ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3, xl: 3 }}
          spacing="lg"
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          {view.visible.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              promo_price={p.promo_price}                    // подаваме промо цена
              description={p.product_description}
              image={p.image}
              category={p.category?.data?.attributes || p.category}
              weight_variants={p.weight_variants || []}
              onAddToCart={handleAddToCart}
            />
          ))}
        </SimpleGrid>
        )}
        </>
      )}
    </>
  );
}