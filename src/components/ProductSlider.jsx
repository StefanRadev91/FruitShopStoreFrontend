import { Box, Title, ScrollArea } from "@mantine/core";
import { ProductCard } from "./ProductCard";

export function ProductSlider({ title, products, onAddToCart }) {
  if (!products.length) return null;

  return (
    <Box mt={40} mb={40}>
      <Title order={2} mb={24} ta="center">
        {title}
      </Title>
      <ScrollArea scrollbarSize={6} type="scroll" offsetScrollbars>
        <Box
          style={{
            display: "flex",
            gap: 16,
            padding: "0 16px",
            overflowX: "auto",
          }}
        >
          {products.map((p) => (
            <Box
              key={p.id}
              style={{
                minWidth: 260,
                maxWidth: 260,
                height: 360,
                display: "flex",
                flexDirection: "column",
                justifyContent: "stretch",
              }}
            >
              <ProductCard
                name={p.name}
                price={p.price}
                description={p.product_description}
                image={p.image}
                category={p.category}
                weight={p.weight}
                onAddToCart={() => onAddToCart(p)}
              />
            </Box>
          ))}
        </Box>
      </ScrollArea>
    </Box>
  );
}