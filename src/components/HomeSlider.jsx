import { lazy, useMemo } from "react";
import { Button, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import { HOME_SLIDER_LIMIT } from "../config/home";
import { COLLECTIONS } from "../config/collections";

const ProductSlider = lazy(() => import("./ProductSlider").then((m) => ({ default: m.ProductSlider })));

const byNewest = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);

// Най-новите (по updatedAt) отпред; над лимита – бутон към страница с всички продукти от секцията.
export function HomeSlider({ variant, products, onAddToCart, limit = HOME_SLIDER_LIMIT }) {
  const sorted = useMemo(() => [...products].sort(byNewest), [products]);
  const hasMore = sorted.length > limit;
  const visible = hasMore ? sorted.slice(0, limit) : sorted;

  return (
    <>
      <ProductSlider variant={variant} products={visible} onAddToCart={onAddToCart} />
      {hasMore && (
        <Group justify="center" mt={-16} mb="md">
          <Button
            component={Link}
            to={COLLECTIONS[variant].path}
            onClick={() => window.scrollTo({ top: 0 })}
            variant="light"
            data-testid={`see-all-${variant}`}
          >
            Виж всички ({sorted.length})
          </Button>
        </Group>
      )}
    </>
  );
}
