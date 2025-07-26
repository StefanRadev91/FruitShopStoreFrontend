// src/components/ProductCard.jsx - актуализирана версия
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
import { PriceDisplay } from "./PriceDisplay";

export function ProductCard({
  id,
  name,
  slug,
  price,
  promo_price,
  description,
  image,
  category,
  weight_variants = [],
  onAddToCart,
  compact = false,
}) {
  const imageUrl = image?.[0]?.url?.startsWith("http")
    ? image[0].url
    : `https://fruitshopstore.onrender.com${image?.[0]?.url || ""}`;

  const [selectedWeight, setSelectedWeight] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const descRef = useRef(null);

  // оригинална цена (variant или основна)
  const originalPrice = selectedWeight?.price ?? parseFloat(price);
  // най-подходяща промо цена, ако има
  const promoPrice =
    (selectedWeight && selectedWeight.promo_price) ||
    (promo_price ? parseFloat(promo_price) : null);

  const handleAddClick = () => {
    onAddToCart({
      id,
      name,
      slug,
      image,
      category,
      price,
      promo_price,
      selectedWeight,
    });
  };

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const canScroll = el.scrollHeight > el.clientHeight;
    setShowScrollHint(canScroll);
    const onScroll = () =>
      setShowScrollHint(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [description]);

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        height: compact ? 380 : 440,  // Увеличено за компактен режим
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Link
        to={`/product/${encodeURIComponent(slug)}`}
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
            minHeight: compact ? 100 : 130,
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
              maxHeight: compact ? "2.4em" : "2.8em", // По-малко място в compact режим
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

      {!compact && weight_variants.length > 0 && (
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
              label: `${price} лв. (оригинална цена)`,
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
        justify={compact ? "center" : "space-between"} // Центрираме всичко в compact режим
        wrap="nowrap"
        style={{ 
          marginTop: compact ? "8px" : "auto",
          paddingTop: compact ? 4 : 8,
          flexDirection: compact ? "column" : "row", // Вертикално подравняване в compact
          gap: compact ? 4 : 8
        }}
      >
        {/* Заменяме старата логика за цени с новия PriceDisplay компонент */}
        <PriceDisplay
          priceBGN={originalPrice}
          promoPriceBGN={promoPrice}
          size={compact ? "md" : "lg"}
          compact={compact}
        />

        <Button
          variant="light"
          color="green"
          radius="md"
          onClick={handleAddClick}
          size={compact ? "sm" : "md"}
          style={{ 
            whiteSpace: "nowrap",
            alignSelf: compact ? "stretch" : "auto", // Разтяга бутона в compact
            marginTop: compact ? 2 : 0
          }}
        >
          Добави
        </Button>
      </Group>
    </Card>
  );
}