import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Loader,
  Title,
  Box,
  Text,
  Image,
  Container,
  Grid,
  Stack,
  Button,
  Badge,
} from "@mantine/core";

export function ProductPage({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(
          `https://fruitshopstore.onrender.com/api/products?filters[id][$eq]=${id}&populate=*`
        );
        const data = await res.json();
        if (!data.data || data.data.length === 0) throw new Error("Продуктът не е намерен.");
        setProduct(data.data[0]);
      } catch (error) {
        console.error("Грешка при зареждане на продукт:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Box
        style={{
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader />
      </Box>
    );
  }

  if (!product) return <Text align="center">Продуктът не беше намерен.</Text>;

  const { name, price, product_description, image } = product;

  const imageUrl = image?.[0]?.url?.startsWith("http")
    ? image[0].url
    : `https://fruitshopstore.onrender.com${image?.[0]?.url || ""}`;

  return (
    <Container size="md" py="xl">
      <Grid gutter="xl">
        {/* Лява колона: снимка */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Image
            src={imageUrl}
            alt={name}
            radius="md"
            fit="contain"
            h={320}
            w="100%"
            withPlaceholder
          />
        </Grid.Col>

        {/* Дясна колона: инфо */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack spacing="sm">
            <Title order={3}>{name}</Title>
            <Text size="xl" fw={700}>
              {price}
            </Text>

            <Badge color="green" size="lg" variant="light">
              В наличност
            </Badge>

            <Button
              color="orange"
              size="md"
              radius="md"
              w={160}
              onClick={() => onAddToCart(product)}
            >
              Купи
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Описание под гърда */}
      <Box mt="xl">
        <Title order={4} mb="sm">
          Описание на продукта
        </Title>
        {Array.isArray(product_description) ? (
          product_description.map((desc, index) => {
            if (typeof desc === "string") return <Text key={index}>{desc}</Text>;
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