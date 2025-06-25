import { useEffect, useState } from "react";
import { Box } from "@mantine/core";
import { ProductSlider } from "../components/ProductSlider";
import { FeatureBanners } from "../components/FeatureBanners";
import { CategoryIconsSlider } from "../components/CategoryIconsSlider";
import { DeliveryBanners } from "../components/DeliveryBanners";

export function HomePage({ onAddToCart }) {
  const [promo, setPromo] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const cachedPromo = sessionStorage.getItem("promo_products");
        const cachedFeatured = sessionStorage.getItem("featured_products");
        const cachedNew = sessionStorage.getItem("new_products");

        if (cachedPromo && cachedFeatured && cachedNew) {
          setPromo(JSON.parse(cachedPromo));
          setFeatured(JSON.parse(cachedFeatured));
          setNewProducts(JSON.parse(cachedNew));
          setLoading(false);
          preloadCategories();
          return;
        }

        // Fetch promo products
        const resPromo = await fetch(
          "https://fruitshopstore.onrender.com/api/products?populate=*&filters[promo]=true"
        );
        const dataPromo = await resPromo.json();
        const promoData = dataPromo.data || [];
        setPromo(promoData);
        sessionStorage.setItem("promo_products", JSON.stringify(promoData));

        // Fetch featured products
        const resFeatured = await fetch(
          "https://fruitshopstore.onrender.com/api/products?populate=*&filters[featured]=true"
        );
        const dataFeatured = await resFeatured.json();
        const featuredData = dataFeatured.data || [];
        setFeatured(featuredData);
        sessionStorage.setItem("featured_products", JSON.stringify(featuredData));

        // Fetch new products
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
          Зареждаме свежест...
        </div>
        <style>
          {`
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-14px);
              }
            }
          `}
        </style>
      </Box>
    );

  return (
    <>
      <DeliveryBanners />

      {/* Промо: светло син фон */}
      <Box sx={{ backgroundColor: "#E3F7FF", py: 8 }}>
        <ProductSlider
          title="📣 Промо продукти"
          products={promo}
          onAddToCart={handleAddToCart}
        />
      </Box>

      <CategoryIconsSlider />

      {/* Най-нови продукти */}
      <ProductSlider
        title="🆕 Най-нови продукти"
        products={newProducts}
        onAddToCart={handleAddToCart}
      />

      <FeatureBanners />

      {/* Най-продавани: тъмно син фон */}
      <Box sx={{ backgroundColor: "#0D3B66", py: 8 }}>
        <ProductSlider
          title="⭐ Най-продавани"
          products={featured}
          onAddToCart={handleAddToCart}
        />
      </Box>
    </>
  );
}