import { useMemo } from "react";
import { Title, Text } from "@mantine/core";
import { ProductGrid } from "../components/ProductGrid";
import { Seo, breadcrumbJsonLd } from "../seo/Seo";
import { ProductGridSkeleton } from "../components/Skeletons";
import { ProductToolbar, useProductView } from "../components/ProductToolbar";
import { CatalogError } from "../components/CatalogError";
import { useCatalog, sortByName } from "../services/productsAPI";
import { COLLECTIONS } from "../config/collections";

// Всички продукти от дадена колекция (промо / най-нови / най-продавани).
export function CollectionPage({ variant, onAddToCart }) {
  const { title, description, path, filter } = COLLECTIONS[variant];
  const { products: catalog, loading, error, reload } = useCatalog();

  const products = useMemo(() => sortByName(catalog.filter(filter)), [catalog, filter]);
  const view = useProductView(products);

  if (error && catalog.length === 0) return <CatalogError onRetry={reload} />;
  if (loading) return <ProductGridSkeleton />;

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={path}
        jsonLd={breadcrumbJsonLd([
          { name: "Начало", path: "/" },
          { name: title, path },
        ])}
      />
      <Title order={1} size="h2" mb="lg" ta="center">
        {title}
      </Title>

      {products.length === 0 ? (
        <Text ta="center" c="dimmed">
          В момента няма продукти в тази секция.
        </Text>
      ) : (
        <>
          <ProductToolbar view={view} />
          {view.visible.length === 0 ? (
            <Text ta="center" c="dimmed">
              Няма промоционални продукти.
            </Text>
          ) : (
          <ProductGrid products={view.visible} onAddToCart={onAddToCart} />
          )}
        </>
      )}
    </>
  );
}
