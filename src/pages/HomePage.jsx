import { useEffect, useState } from "react";
import { Title, SimpleGrid, Loader, Box } from "@mantine/core";
import { ProductCard } from "../components/ProductCard";


export function HomePage({ onAddToCart }) {
  const [featured, setFeatured] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Най-продавани
        const resFeatured = await fetch(
          "https://fruitshopstore.onrender.com/api/products?populate=*&filters[featured]=true"
        );
        const dataFeatured = await resFeatured.json();
        setFeatured(dataFeatured.data || []);

        // Най-нови
        const resNew = await fetch(
          "https://fruitshopstore.onrender.com/api/products?populate=*&filters[new_product]=true"
        );
        const dataNew = await resNew.json();
        setNewProducts(dataNew.data || []);
      } catch (error) {
        console.error("⚠️ Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading)
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <Loader />
      </Box>
    );

  function renderProductSection(title, emoji, products, addTop = false) {
    if (!products.length) return null;

    return (
      <Box mt={addTop ? 40 : 0} mb={40}>
        <Title order={2} mb={32} ta="center">
          <span style={{ marginRight: 10 }}>{emoji}</span>
          {title}
        </Title>

        {products.length === 1 ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 18,
              paddingBottom: 18,
            }}
          >
            <Box style={{ maxWidth: 400, width: "100%" }}>
              <ProductCard
                key={products[0].id}
                name={products[0].name}
                price={products[0].price}
                description={products[0].product_description}
                image={products[0].image}
                category={products[0].category}
                onAddToCart={() => onAddToCart(products[0])}
              />
            </Box>
          </Box>
        ) : (
          <SimpleGrid
            cols={2}
            spacing="lg"
            breakpoints={[
              { maxWidth: "md", cols: 2 },
              { maxWidth: "sm", cols: 1 },
            ]}
            style={{
              margin: "0 auto",
              maxWidth: 1000,
              paddingTop: 18,
              paddingBottom: 18,
            }}
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price}
                description={p.product_description}
                image={p.image}
                category={p.category}
                onAddToCart={() => onAddToCart(p)}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
    );
  }

  return (
    <>
      {renderProductSection("Най-продавани", "⭐", featured)}
      {renderProductSection("Най-нови продукти", "🆕", newProducts, true)}
    </>
  );
}