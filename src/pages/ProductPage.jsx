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
        const prod = data.data[0];
        setProduct(prod);
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

  if (!product) return <Text align="center">Продуктът не беше намерен.</Text>;

  const {
    name: productName,
    price,
    product_description,
    image,
    category,
    weight_variants = [],
  } = product;

  const imageUrl = image?.[0]?.url?.startsWith("http")
    ? image[0].url
    : `https://fruitshopstore.onrender.com${image?.[0]?.url || ""}`;

  const handleAddClick = () => {
    const itemToAdd = {
      ...product,
      selectedWeight,
      slug,
    };
    onAddToCart(itemToAdd);
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

            <Text size="xl" fw={700}>
              {selectedWeight
                ? `${selectedWeight.price.toFixed(2)} лв.`
                : `${price}`}
            </Text>

            {weight_variants.length > 0 && (
              <Select
                label="Избери друг грамаж (по желание)"
                placeholder="Избери..."
                value={selectedWeight?.label || "__original__"}
                onChange={(val) => {
                  if (val === "__original__") {
                    setSelectedWeight(null);
                  } else {
                    const variant = weight_variants.find(
                      (w) => w.label === val
                    );
                    setSelectedWeight(variant);
                  }
                }}
                data={[
                  {
                    value: "__original__",
                    label: `${price} (оригинална цена)`
                  },
                  ...weight_variants.map((w) => ({
                    value: w.label,
                    label: `${w.label} – ${w.price.toFixed(2)} лв.`
                  }))
                ]}
                size="sm"
              />
            )}

            <Badge color="green" size="lg" variant="light">
              В наличност
            </Badge>

            <Button
              color="orange"
              size="md"
              radius="md"
              w={160}
              onClick={handleAddClick}
            >
              Купи
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>

      <Box mt="xl">
        <Title order={4} mb="sm">
          Описание на продукта
        </Title>
        {Array.isArray(product_description) ? (
          product_description.map((desc, index) => {
            if (typeof desc === "string")
              return <Text key={index}>{desc}</Text>;
            if (desc.children && Array.isArray(desc.children)) {
              return (
                <Text key={index} mt="sm">
                  {desc.children.map((c) => c.text || "").join("")}
                </Text>
              );
            }
            return null;
          })
        ) : (
          <Text>{product_description}</Text>
        )}
      </Box>
    </Container>
  );
}