import { Box, Title } from "@mantine/core";
import { ProductCard } from "./ProductCard";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";

export function ProductSlider({ title, products, onAddToCart }) {
  if (!products.length) return null;

  // Подреждане по последна модификация (най-новите отпред)
  const sortedProducts = [...products].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return (
    <Box mt={40} mb={40}>
      <Title order={2} mb={24} ta="center">
        {title}
      </Title>
      <Carousel
        withIndicators={false}
        withControls
        height="auto"
        slideSize="25%"
        slideGap="md"
        align="start"
        loop
        breakpoints={[
          { maxWidth: "md", slideSize: "50%" },
          { maxWidth: "sm", slideSize: "100%" },
        ]}
      >
        {sortedProducts.map((p) => (
          <Carousel.Slide key={p.id}>
            <Box
              style={{
                minWidth: 290,
                maxWidth: 290,
                height: 360,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                margin: "0 auto",
              }}
            >
              <ProductCard
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                promo_price={p.promo_price}
                description={p.product_description}
                image={p.image}
                category={p.category}
                weight_variants={[]} // остава си празно
                onAddToCart={() => onAddToCart(p)}
                compact
              />
            </Box>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}