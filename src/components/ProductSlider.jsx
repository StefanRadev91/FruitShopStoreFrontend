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
        controlsOffset={0}
        height="auto"
        slideSize={{ base: "100%", xs: "50%", sm: "33.3333%", md: "25%" }}
        slideGap="md"
        emblaOptions={{ align: "start", loop: false, containScroll: "trimSnaps", slidesToScroll: 1 }}
        styles={{
          root: { padding: "0 26px" },
          control: {
            background: "#fff",
            border: "none",
            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            width: 38,
            height: 38,
            opacity: 1,
          },
          viewport: { padding: "6px 4px 12px" },
        }}
      >
        {sortedProducts.map((p) => (
          <Carousel.Slide key={p.id}>
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
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}