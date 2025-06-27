// src/pages/CategoryPage.jsx
import { useEffect, useState } from "react";
import { Title, SimpleGrid } from "@mantine/core";
import { ProductCard } from "../components/ProductCard";

export function CategoryPage({ category, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // при всяка смяна на категория – скрол към най-горе
    window.scrollTo({ top: 0, behavior: "smooth" });

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

  if (loading) {
    return (
      <div
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
          Зареждаме категорията...
        </div>
        <style>
          {`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50%       { transform: translateY(-14px); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <>
      <Title order={2} mb="lg" ta="center">
        {category}
      </Title>

      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3, xl: 3 }}
        spacing="lg"
        breakpoints={[{ maxWidth: "sm", cols: 1 }]}
      >
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            slug={p.slug}
            price={p.price}
            promo_price={p.promo_price}
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