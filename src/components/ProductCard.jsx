import { Card, Image, Text, Badge, Button, Group } from "@mantine/core";

export function ProductCard({ name, price, description, image, category, onAddToCart }) {
  const imageUrl = image?.[0]?.url?.startsWith("http")
    ? image[0].url
    : `https://fruitshopstore.onrender.com${image?.[0]?.url || ""}`;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: "100%" }}>
      <Card.Section>
        <Image
          src={imageUrl}
          height={140}
          fit="contain"
          alt={name}
          style={{ maxWidth: 220, margin: "0 auto", paddingTop: 16 }}
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{name}</Text>
        <Badge color="green" variant="light">
          {category?.Name || "Категория"}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" lineClamp={3}>
        {Array.isArray(description)
          ? description[0]?.children?.[0]?.text
          : description}
      </Text>

      <Group justify="space-between" mt="md">
        <Text size="lg" fw={700}>
          {price}
        </Text>
        <Button variant="light" color="green" radius="md" onClick={onAddToCart}>
          Добави в количката
        </Button>
      </Group>
    </Card>
  );
}