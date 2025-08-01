import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SimpleGrid, Title, Text, Box } from "@mantine/core";
import { ProductCard } from "../components/ProductCard";

export function SearchResultsPage({ onAddToCart }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    async function fetchResults() {
      try {
        const res = await fetch(
          `https://fruitshopstore.onrender.com/api/products?populate=*&filters[name][$containsi]=${encodeURIComponent(
            query
          )}`
        );
        const data = await res.json();

        const sorted = (data.data || []).sort((a, b) =>
          a.name.localeCompare(b.name, "bg", { sensitivity: "base" })
        );

        setResults(sorted);
      } catch (error) {
        console.error("⚠️ Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (loading) {
    return (
      <Box
        style={{
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/590/590685.png"
          alt="Зареждаме..."
          style={{
            width: 80,
            height: 80,
            animation: "bounce 1.2s ease-in-out infinite",
          }}
        />
        <div style={{ marginTop: 12, fontSize: 16, color: "#888" }}>
          Търсим продукти за теб...
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-14px); }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <>
      <Title order={2} mb="lg" ta="center">
        Резултати за: “{query}”
      </Title>

      {results.length === 0 ? (
        <Text ta="center" c="dimmed">
          Няма намерени продукти.
        </Text>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3, xl: 3 }}
          spacing="lg"
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          {results.map((p) => (
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
  );
}