import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SimpleGrid, Title, Loader, Text } from "@mantine/core";
import { ProductCard } from "../components/ProductCard";

export function SearchResultsPage({ onAddToCart }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) return;

    async function fetchResults() {
      try {
        const res = await fetch(
          `https://fruitshopstore.onrender.com/api/products?populate=*&filters[name][$containsi]=${encodeURIComponent(
            query
          )}`
        );
        const data = await res.json();
        setResults(data.data || []);
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

  if (loading) return <Loader />;

  return (
    <>
      <Title order={2} mb="md" ta="center">
        Резултати за: “{query}”
      </Title>

      {results.length === 0 ? (
        <Text ta="center" c="dimmed">
          Няма намерени продукти.
        </Text>
      ) : (
        <SimpleGrid
          cols={2}
          spacing="lg"
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          {results.map((p) => (
            <ProductCard
              key={p.id}
              name={p.name}
              price={p.price}
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