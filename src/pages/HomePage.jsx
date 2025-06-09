// ✅ HomePage.jsx – адаптиран за selectedWeight
import { useEffect, useState } from "react";
import { Title, SimpleGrid, Loader, Box } from "@mantine/core";
import { ProductSlider } from "../components/ProductSlider";
import { FeatureBanners } from "../components/FeatureBanners";
import { CategoryIconsSlider } from "../components/CategoryIconsSlider";

export function HomePage({ onAddToCart }) {
  const [featured, setFeatured] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const resFeatured = await fetch(
          "https://fruitshopstore.onrender.com/api/products?populate=*&filters[featured]=true"
        );
        const dataFeatured = await resFeatured.json();
        setFeatured(dataFeatured.data || []);

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
      <FeatureBanners />
      <CategoryIconsSlider />
      <ProductSlider
        title="⭐ Най-продавани"
        products={featured}
        onAddToCart={handleAddToCart}
      />
      <ProductSlider
        title="🆕 Най-нови продукти"
        products={newProducts}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}