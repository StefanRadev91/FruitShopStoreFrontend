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
        {products.map((p) => (
          <Carousel.Slide key={p.id}>
            <Box
              style={{
                minWidth: 290,
                maxWidth: 290,
                height: 360,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start", // картата започва отвън, за да не притиска бутона
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
                weight_variants={[]}    // махаме dropdown-а
                onAddToCart={() => onAddToCart(p)}
                compact                  // включваме компактния режим за spacing
              />
            </Box>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}