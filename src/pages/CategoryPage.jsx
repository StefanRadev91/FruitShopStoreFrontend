// src/pages/CategoryPage.jsx - почистена версия
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Title, SimpleGrid } from "@mantine/core";
import { ProductCard } from "../components/ProductCard";

export function CategoryPage({ category: propCategory, onAddToCart }) {
  const { subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        let targetCategoryName;
        
        // Приоритет: 1) prop category (за старите routes), 2) subcategory param (за новите)
        if (propCategory) {
          targetCategoryName = propCategory;
        } else if (subcategory) {
          targetCategoryName = decodeURIComponent(subcategory);
        }
        
        setCategoryName(targetCategoryName);
        
        // Проверяваме за кеширани данни ПЪРВО
        const cacheKey = `category_products_${targetCategoryName}`;
        const cachedProducts = sessionStorage.getItem(cacheKey);
        
        if (cachedProducts) {
          const parsedProducts = JSON.parse(cachedProducts);
          setProducts(parsedProducts);
          setLoading(false);
          return;
        }
        
        // Ако няма кеш, зареждаме от API
        const res = await fetch(
          `https://fruitshopstore.onrender.com/api/products?filters[category][Name][$eq]=${encodeURIComponent(targetCategoryName)}&populate=*&pagination[limit]=200`
        );
        const data = await res.json();
        
        if (data.data) {
          const sortedProducts = data.data.sort((a, b) =>
            a.name.localeCompare(b.name, "bg", { sensitivity: "base" })
          );
          
          // Кешираме резултата
          sessionStorage.setItem(cacheKey, JSON.stringify(sortedProducts));
          setProducts(sortedProducts);
        } else {
          setProducts([]);
        }
        
      } catch (error) {
        console.error("❌ Грешка при зареждане на продукти:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [propCategory, subcategory]);

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          minHeight: 300,
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
      {/* Заглавие */}
      <Title order={2} mb="lg" ta="center">
        {categoryName}
      </Title>

      {/* Продукти */}
      {products.length === 0 ? (
        <Text ta="center" c="dimmed">
          Няма продукти в категория "{categoryName}".
        </Text>
      ) : (
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
      )}
    </>
  );
}