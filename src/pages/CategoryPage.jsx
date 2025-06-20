import { useEffect, useState } from "react";
import { Title, SimpleGrid, Loader } from "@mantine/core";
import { ProductCard } from "../components/ProductCard";

export function CategoryPage({ category, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `category_${category}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setProducts(JSON.parse(cached));
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(
          `https://fruitshopstore.onrender.com/api/products?populate=*&filters[category][Name][$eq]=${encodeURIComponent(
            category
          )}&pagination[limit]=200`
        );
        const data = await res.json();

        const sorted = (data.data || []).sort((a, b) =>
          a.name.localeCompare(b.name, "bg", { sensitivity: "base" })
        );

        setProducts(sorted);
        sessionStorage.setItem(cacheKey, JSON.stringify(sorted));
      } catch (error) {
        console.error("⚠️ Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [category]);

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (loading) return <Loader />;

  return (
    <>
      <Title order={2} mb="lg" ta="center">
        {category}
      </Title>
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3, xl: 3 }}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'sm', cols: 1 }
        ]}
      >
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            slug={p.slug}
            price={p.price}
            description={p.product_description}
            image={p.image}
            category={p.category}
            weight_variants={p.weight_variants || []}
            onAddToCart={handleAddToCart}
          />
        ))}
      </SimpleGrid>
    </>
  );
}