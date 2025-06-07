import { Card, Image, Text, Badge, Button, Group, Stack } from "@mantine/core";
import { Link } from "react-router-dom";

export function ProductCard({ id, name, price, description, image, category, onAddToCart }) {
  const imageUrl = image?.[0]?.url?.startsWith("http")
    ? image[0].url
    : `https://fruitshopstore.onrender.com${image?.[0]?.url || ""}`;

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        height: 390,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Link to={`/product/${id}`} style={{ textDecoration: "none", flexGrow: 1 }}>
        <Card.Section>
          <Image
            src={imageUrl}
            height={120}
            fit="contain"
            alt={name}
            style={{ maxWidth: 180, margin: "0 auto", paddingTop: 16 }}
          />
        </Card.Section>

        <Stack spacing="xs" style={{ flexGrow: 1, justifyContent: "flex-start" }}>
          <Text fw={500} lineClamp={2} size="sm" c="blue" title={name}>
            {name}
          </Text>

          <Badge color="green" variant="light" style={{ alignSelf: "flex-start" }}>
            {category?.Name || "Категория"}
          </Badge>

          <div
            style={{
              height: 60,
              overflowY: "auto",
              fontSize: "0.875rem",
              color: "var(--mantine-color-dimmed)",
              lineHeight: 1.4,
            }}
          >
            {Array.isArray(description)
              ? description[0]?.children?.[0]?.text
              : description}
          </div>
        </Stack>
      </Link>

      <Group justify="space-between" mt="md" noWrap style={{ marginTop: "auto", paddingTop: 8 }}>
        <Text size="lg" fw={700}>
          {price}
        </Text>
        <Button
          variant="light"
          color="green"
          radius="md"
          onClick={onAddToCart}
          style={{ whiteSpace: "nowrap" }}
        >
          Добави
        </Button>
      </Group>
    </Card>
  );
}