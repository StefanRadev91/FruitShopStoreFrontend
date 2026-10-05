import { useEffect, useRef } from "react";
import { Box, Button, SimpleGrid } from "@mantine/core";
import { ProductCard } from "./ProductCard";
import { useProgressiveList } from "../hooks/useProgressiveList";

// Снимките на първите карти се зареждат веднага (те са най-големият видим елемент – LCP).
const PRIORITY_CARDS = 3;

// Решетка с продукти, която се дорисува при скролиране (и има бутон като резервен вариант).
export function ProductGrid({ products, onAddToCart, step }) {
  const { visible, hasMore, remaining, showMore } = useProgressiveList(products, step);
  const sentinel = useRef(null);

  useEffect(() => {
    if (!hasMore || !sentinel.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && showMore(), {
      rootMargin: "600px",
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, showMore, visible.length]);

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 3 }} spacing="lg">
        {visible.map((p, index) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            slug={p.slug}
            price={p.price}
            promo_price={p.promo_price}
            description={p.product_description}
            image={p.image}
            category={p.category?.data?.attributes || p.category}
            weight_variants={p.weight_variants || []}
            onAddToCart={onAddToCart}
            priority={index < PRIORITY_CARDS}
          />
        ))}
      </SimpleGrid>
      {hasMore && (
        <Box ref={sentinel} ta="center" mt="xl">
          <Button variant="light" onClick={showMore} data-testid="show-more">
            Покажи още ({remaining})
          </Button>
        </Box>
      )}
    </>
  );
}
