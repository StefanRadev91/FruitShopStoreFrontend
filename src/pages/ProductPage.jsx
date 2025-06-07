// src/pages/ProductPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Title,
  Text,
  Loader,
  Badge,
  Image,
  Button,
} from "@mantine/core";

export function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://fruitshopstore.onrender.com/api/products/${id}?populate=*`)
      .then((res) => res.json())
      .then((data) => {
        const raw = data.data;

        // Преобразуваме го, както се използва навсякъде другаде:
        const formatted = {
          id: raw.id,
          name: raw.name,
          price: raw.price,
          image: raw.image,
          category: raw.category,
          product_description: raw.product_description,
        };

        setProduct(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box mt="lg" style={{ textAlign: "center" }}>
        <Loader />
      </Box>
    );
  }

  if (!product) {
    return <Text align="center">Продуктът не беше намерен.</Text>;
  }

  const imageUrl = product.image?.[0]?.url?.startsWith("http")
    ? product.image[0].url
    : `https://fruitshopstore.onrender.com${product.image?.[0]?.url || ""}`;

  const descriptionText = Array.isArray(product.product_description)
    ? product.product_description[0]?.children?.[0]?.text
    : product.product_description;

  return (
    <Box mt="xl" maw={800} mx="auto" px="md">
      <Title order={2}>{product.name}</Title>
      <Image
        src={imageUrl}
        height={300}
        fit="contain"
        mt="md"
        alt={product.name}
      />
      <Text fw={700} size="xl" mt="md">
        {product.price} лв.
      </Text>
      <Badge mt="sm" color="green" variant="light">
        {product.category?.Name || "Категория"}
      </Badge>
      <Text mt="md">{descriptionText}</Text>
      <Button color="green" radius="md" mt="lg">
        Добави в количката
      </Button>
    </Box>
  );
}