// src/pages/ProductPage.jsx - актуализирана версия
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Title,
  Box,
  Text,
  Image,
  Container,
  Grid,
  Stack,
  Button,
  Badge,
  Select,
} from "@mantine/core";
import { PriceDisplay } from "../components/PriceDisplay";

export function ProductPage({ onAddToCart }) {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchProduct() {
      try {
        const res = await fetch(
          `https://fruitshopstore.onrender.com/api/products?filters[slug][$eq]=${encodeURIComponent(
            slug
          )}&populate=*`
        );
        const data = await res.json();
        if (!data.data || data.data.length === 0)
          throw new Error("Продуктът не е намерен.");
        setProduct(data.data[0]);
      } catch (error) {
        console.error("Грешка при зареждане на продукт:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

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
          Зареждаме продукта...
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
  }

  if (!product) {
    return <Text align="center">Продуктът не беше намерен.</Text>;
  }

  const {
    name: productName,
    price,
    promo_price,
    product_description,
    image,
    category,
    weight_variants = [],
  } = product;

  // Създаваме URL за изображението
  const imageUrl = image?.[0]?.url?.startsWith("http")
    ? image[0].url
    : `https://fruitshopstore.onrender.com${image?.[0]?.url || ""}`;

  // Изчисляваме оригинална и промо цена
  const originalPrice = selectedWeight?.price ?? parseFloat(price);
  const promoPrice = selectedWeight
    ? selectedWeight.promo_price ?? null
    : promo_price
    ? parseFloat(promo_price)
    : null;

  const handleAddClick = () => {
    onAddToCart({
      ...product,
      selectedWeight,
      qty: 1,
    });
  };

  return (
    <Container size="md" py="xl">
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Image
            src={imageUrl}
            alt={productName}
            radius="md"
            fit="contain"
            h={320}
            w="100%"
            withPlaceholder
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack spacing="sm">
            <Title order={3}>{productName}</Title>

            {/* Заменяме старата логика за цени с новия PriceDisplay компонент */}
            <PriceDisplay
              priceBGN={originalPrice}
              promoPriceBGN={promoPrice}
              size="xl"
              compact={false}
            />

            {weight_variants.length > 0 && (
              <Select
                label="Избери друг грамаж (по желание)"
                placeholder="Избери..."
                value={selectedWeight?.label || "__original__"}
                onChange={(val) => {
                  if (val === "__original__") {
                    setSelectedWeight(null);
                  } else {
                    setSelectedWeight(weight_variants.find((w) => w.label === val));
                  }
                }}
                data={[
                  { value: "__original__", label: `${price} лв. (оригинална цена)` },
                  ...weight_variants.map((w) => ({
                    value: w.label,
                    label: `${w.label} – ${w.price.toFixed(2)} лв.`,
                  })),
                ]}
                size="sm"
              />
            )}

            <Badge color="green" size="lg" variant="light">
              В наличност
            </Badge>

            <Button color="orange" size="md" radius="md" w={160} onClick={handleAddClick}>
              Купи
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>

      <Box mt="xl">
        <Title order={4} mb="sm">
          Описание на продукта
        </Title>
        {Array.isArray(product_description) ?
          product_description.map((block, index) => (
            <Text key={index} mb="sm">
              {block?.children?.[0]?.text || ""}
            </Text>
          )) : (
          <Text>{product_description}</Text>
        )}
      </Box>
    </Container>
  );
}