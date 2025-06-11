import { useEffect, useRef, useState } from "react";
import {
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Select,
} from "@mantine/core";
import { Link } from "react-router-dom";

export function ProductCard({
  id,
  name,
  price,
  description,
  image,
  category,
  weight_variants = [],
  onAddToCart,
}) {
  const imageUrl = image?.[0]?.url?.startsWith("http")
    ? image[0].url
    : `https://fruitshopstore.onrender.com${image?.[0]?.url || ""}`;

  const [selectedWeight, setSelectedWeight] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const descRef = useRef(null);

  const handleAddClick = () => {
    const productToAdd = {
      id,
      name,
      image,
      category,
      price,
      selectedWeight,
    };
    onAddToCart(productToAdd);
  };

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;

    const shouldScroll = el.scrollHeight > el.clientHeight;
    setShowScrollHint(shouldScroll);

    const handleScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      setShowScrollHint(!atBottom && shouldScroll);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [description]);

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        height: 440,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Link
        to={`/product/${id}`}
        style={{ textDecoration: "none", flexGrow: 1 }}
      >
        <Card.Section>
          <Image
            src={imageUrl}
            height={120}
            fit="contain"
            alt={name}
            style={{ maxWidth: 180, margin: "0 auto", paddingTop: 16 }}
          />
        </Card.Section>

        <Stack
          spacing="xs"
          style={{
            flexGrow: 1,
            justifyContent: "flex-start",
            minHeight: 130,
          }}
        >
          <Text fw={500} lineClamp={2} size="sm" c="blue" title={name}>
            {name}
          </Text>

          <Badge color="green" variant="light" style={{ alignSelf: "flex-start" }}>
            {category?.Name || "Категория"}
          </Badge>

          <div
            ref={descRef}
            style={{
              position: "relative",
              maxHeight: "2.8em", // около два реда
              overflowY: "auto",
              paddingRight: 4,
              fontSize: "0.875rem",
              color: "var(--mantine-color-dimmed)",
              lineHeight: 1.4,
              ...(showScrollHint && {
                maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              }),
            }}
            title={
              Array.isArray(description)
                ? description[0]?.children?.[0]?.text
                : description
            }
          >
            {Array.isArray(description)
              ? description[0]?.children?.[0]?.text
              : description}
          </div>

          {showScrollHint && (
            <div
              style={{
                textAlign: "center",
                marginTop: -6,
                fontSize: 14,
                color: "#bbb",
                animation: "bounce 1.5s infinite",
              }}
            >
              ↓
            </div>
          )}
        </Stack>
      </Link>

      {weight_variants.length > 0 && (
        <Select
          label="Избери друг грамаж (по желание)"
          placeholder="Избери..."
          value={selectedWeight?.label || "__original__"}
          onChange={(val) => {
            if (val === "__original__") {
              setSelectedWeight(null);
            } else {
              const variant = weight_variants.find((w) => w.label === val);
              setSelectedWeight(variant);
            }
          }}
          data={[
            {
              value: "__original__",
              label: `${price} (оригинална цена)`,
            },
            ...weight_variants.map((w) => ({
              value: w.label,
              label: `${w.label} – ${w.price.toFixed(2)} лв.`,
            })),
          ]}
          size="xs"
          mb={-4}
        />
      )}

      <Group
        justify="space-between"
        mt="md"
        wrap="nowrap"
        style={{ marginTop: "auto", paddingTop: 8 }}
      >
        <Text size="lg" fw={700}>
          {(selectedWeight?.price ?? parseFloat(price)).toFixed(2)} лв.
        </Text>
        <Button
          variant="light"
          color="green"
          radius="md"
          onClick={handleAddClick}
          style={{ whiteSpace: "nowrap" }}
        >
          Добави
        </Button>
      </Group>
    </Card>
  );
}