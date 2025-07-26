// src/pages/HomePage.jsx - с кеширане
import { useEffect, useState } from "react";
import { Box } from "@mantine/core";
import { ProductSlider } from "../components/ProductSlider";
import { FeatureBanners } from "../components/FeatureBanners";
import { CategoryIconsSlider } from "../components/CategoryIconsSlider";
import { DeliveryBanners } from "../components/DeliveryBanners";
import { getAllCategories } from "../services/categoriesAPI";

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
          // Започваме preloading в background
          preloadAllData();
          return;
        }

        const [resPromo, resFeatured, resNew] = await Promise.all([
          fetch("https://fruitshopstore.onrender.com/api/products?populate=*&filters[promo]=true"),
          fetch("https://fruitshopstore.onrender.com/api/products?populate=*&filters[featured]=true"),
          fetch("https://fruitshopstore.onrender.com/api/products?populate=*&filters[new_product]=true"),
        ]);

        const dataPromo = await resPromo.json();
        const dataFeatured = await resFeatured.json();
        const dataNew = await resNew.json();

        const promoData = dataPromo.data || [];
        const featuredData = dataFeatured.data || [];
        const newData = dataNew.data || [];

        setPromo(promoData);
        setFeatured(featuredData);
        setNewProducts(newData);

        sessionStorage.setItem("promo_products", JSON.stringify(promoData));
        sessionStorage.setItem("featured_products", JSON.stringify(featuredData));
        sessionStorage.setItem("new_products", JSON.stringify(newData));

        // Започваме preloading в background
        preloadAllData();
      } catch (error) {
        console.error("⚠️ Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Preloading функция за всички категории и техните продукти
  const preloadAllData = async () => {
    console.log("🚀 Започвам preloading на всички данни...");
    
    try {
      // 1. Preload категории ако не са кеширани
      const cachedCategories = sessionStorage.getItem("all_categories");
      if (!cachedCategories) {
        console.log("📂 Preloading категории...");
        const categories = await getAllCategories();
        sessionStorage.setItem("all_categories", JSON.stringify(categories));
        console.log("✅ Категории кеширани:", categories.length);
      }

      // 2. Preload всички продукти по категория
      const allCategories = JSON.parse(sessionStorage.getItem("all_categories") || "[]");
      
      // Списък с всички категории и подкатегории
      const allCategoryNames = new Set();
      
      allCategories.forEach(category => {
        allCategoryNames.add(category.Name);
        // Добавяме и подкатегориите
        if (category.subcategories) {
          category.subcategories.forEach(sub => {
            allCategoryNames.add(sub.Name);
          });
        }
      });

      console.log("📦 Ще preload-вам продукти за", allCategoryNames.size, "категории");

      // Preload продукти за всяка категория (в chunks за да не блокира браузъра)
      const categoryArray = Array.from(allCategoryNames);
      const CHUNK_SIZE = 3; // По 3 категории наведнъж
      
      for (let i = 0; i < categoryArray.length; i += CHUNK_SIZE) {
        const chunk = categoryArray.slice(i, i + CHUNK_SIZE);
        
        await Promise.all(
          chunk.map(async (categoryName) => {
            const cacheKey = `category_products_${categoryName}`;
            
            // Проверяваме дали не е вече кеширана
            if (sessionStorage.getItem(cacheKey)) {
              return;
            }
            
            try {
              console.log(`📥 Preloading продукти за "${categoryName}"`);
              
              const res = await fetch(
                `https://fruitshopstore.onrender.com/api/products?filters[category][Name][$eq]=${encodeURIComponent(categoryName)}&populate=*&pagination[limit]=200`
              );
              const data = await res.json();
              
              if (data.data) {
                const sortedProducts = data.data.sort((a, b) =>
                  a.name.localeCompare(b.name, "bg", { sensitivity: "base" })
                );
                sessionStorage.setItem(cacheKey, JSON.stringify(sortedProducts));
                console.log(`✅ Кеширани ${sortedProducts.length} продукта за "${categoryName}"`);
              }
            } catch (err) {
              console.warn(`❗ Грешка при preloading на "${categoryName}":`, err);
            }
          })
        );
        
        // Малка пауза между chunk-овете за да не блокира UI-я
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log("🎉 Preloading завършен! Всички категории са кеширани.");
      
    } catch (error) {
      console.error("❌ Грешка при preloading:", error);
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

      {/* Промо продукти – подредени по последна модификация */}
      <Box sx={{ backgroundColor: "#E3F7FF", py: 8 }}>
        <ProductSlider
          title="📣 Промо продукти"
          products={[...promo].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
          onAddToCart={handleAddToCart}
        />
      </Box>

      <CategoryIconsSlider />

      {/* Най-нови продукти – също по updatedAt */}
      <ProductSlider
        title="🆕 Най-нови продукти"
        products={[...newProducts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
        onAddToCart={handleAddToCart}
      />

      <FeatureBanners />

      {/* Най-продавани – също по updatedAt */}
      <Box sx={{ backgroundColor: "#0D3B66", py: 8 }}>
        <ProductSlider
          title="⭐ Най-продавани"
          products={[...featured].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
          onAddToCart={handleAddToCart}
        />
      </Box>
    </>
  );
}