import { Box, Title } from "@mantine/core";
import { ProductCard } from "./ProductCard";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";

export function ProductSlider({ title, products, onAddToCart }) {
  if (!products.length) return null;

  return (
    <Box mt={40} mb={40}>
      <Title order={2} mb={24} ta="center">
        {title}
      </Title>
      <Carousel
        withIndicators={false}
        withControls={true}
        height="auto"
        slideSize="25%"
        slideGap="md"
        align="start"
        loop
        breakpoints={[
          { maxWidth: 'md', slideSize: '50%' },
          { maxWidth: 'sm', slideSize: '100%' },
        ]}
      >
        {products.map((p) => (
          <Carousel.Slide key={p.id}>
            <Box
              style={{
                minWidth: 260,
                maxWidth: 260,
                height: 360,
                display: "flex",
                flexDirection: "column",
                justifyContent: "stretch",
                margin: "0 auto",
              }}
            >
              <ProductCard
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                description={p.product_description}
                image={p.image}
                category={p.category}
                weight={p.weight}
                onAddToCart={() => onAddToCart(p)}
              />
            </Box>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}