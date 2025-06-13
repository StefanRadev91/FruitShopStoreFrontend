import { useEffect, useState } from "react";
import { Title, SimpleGrid, Loader, Box, Container } from "@mantine/core";
import { ProductSlider } from "../components/ProductSlider";
import { FeatureBanners } from "../components/FeatureBanners";
import { CategoryIconsSlider } from "../components/CategoryIconsSlider";
import { DeliveryBanners } from "../components/DeliveryBanners";

export function HomePage({ onAddToCart }) {
  const [featured, setFeatured] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Проверка дали има вече данни в sessionStorage
        const cachedFeatured = sessionStorage.getItem("featured_products");
        const cachedNew = sessionStorage.getItem("new_products");

        if (cachedFeatured && cachedNew) {
          setFeatured(JSON.parse(cachedFeatured));
          setNewProducts(JSON.parse(cachedNew));
          setLoading(false);
          preloadCategories(); // Продължаваме с категориите
          return;
        }

        // ✅ Няма кеш — теглим от сървъра
        const resFeatured = await fetch(
          "https://fruitshopstore.onrender.com/api/products?populate=*&filters[featured]=true"
        );
        const dataFeatured = await resFeatured.json();
        const featuredData = dataFeatured.data || [];
        setFeatured(featuredData);
        sessionStorage.setItem("featured_products", JSON.stringify(featuredData));

        const resNew = await fetch(
          "https://fruitshopstore.onrender.com/api/products?populate=*&filters[new_product]=true"
        );
        const dataNew = await resNew.json();
        const newData = dataNew.data || [];
        setNewProducts(newData);
        sessionStorage.setItem("new_products", JSON.stringify(newData));

        preloadCategories();
      } catch (error) {
        console.error("⚠️ Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const preloadCategories = async () => {
    const categoryNames = [
      "Плодове",
      "Зеленчуци",
      "Лют Свят",
      "Напитки",
      "Сладко",
      "Подправки",
      "Рибни",
      "Ядки",
      "Месни изделия",
      "БИО"
    ];

    for (const name of categoryNames) {
      const cacheKey = `category_${name}`;
      if (sessionStorage.getItem(cacheKey)) continue;

      try {
        const res = await fetch(
          `https://fruitshopstore.onrender.com/api/products?populate=*&filters[category][Name][$eq]=${encodeURIComponent(
            name
          )}&pagination[limit]=200`
        );
        const data = await res.json();

        const sorted = (data.data || []).sort((a, b) =>
          a.name.localeCompare(b.name, "bg", { sensitivity: "base" })
        );

        sessionStorage.setItem(cacheKey, JSON.stringify(sorted));
      } catch (err) {
        console.warn("❗ Пропусната категория при кеширане:", name);
      }
    }
  };

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

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

  return (
    <>
      <DeliveryBanners />
      <CategoryIconsSlider />
      <ProductSlider
        title="🆕 Най-нови продукти"
        products={newProducts}
        onAddToCart={handleAddToCart}
      />
      <FeatureBanners />
      <ProductSlider
        title="⭐ Най-продавани"
        products={featured}
        onAddToCart={handleAddToCart}
      />
      {/* <ProductSlider
        title="🆕 Най-нови продукти"
        products={newProducts}
        onAddToCart={handleAddToCart}
      /> */}
    </>
  );
}