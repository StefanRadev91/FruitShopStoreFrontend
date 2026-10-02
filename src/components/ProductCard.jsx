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
  Box,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { PriceDisplay, formatEUR } from "./PriceDisplay";
import { imageUrl } from "../services/productsAPI";
import { FavoriteButton } from "./FavoriteButton";

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
  isNew = false,
}) {
  const imageSrc = imageUrl(image, 360);

  // Докато курсорът е над картата, свалям едрата снимка, за да е готова при отваряне на продукта.
  const prefetchLargeImage = () => {
    const large = imageUrl(image, 800);
    if (large) new window.Image().src = large;
  };

  const descriptionText = Array.isArray(description)
    ? description[0]?.children?.[0]?.text
    : description;
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const descRef = useRef(null);

  // оригинална цена (variant или основна)
  const originalPrice = selectedWeight?.price ?? parseFloat(price);
  // промо цена само ако има за конкретния variant, иначе основната промо цена
  const promoPrice = selectedWeight
    ? selectedWeight.promo_price ?? null
    : promo_price
    ? parseFloat(promo_price)
    : null;

  // Отстъпка в проценти (само когато има промо цена)
  const discountPct =
    promoPrice && originalPrice > promoPrice
      ? Math.round((1 - promoPrice / originalPrice) * 100)
      : 0;

  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const handleAddClick = () => {
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
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
      className="product-card"
      style={{
        height: descriptionText ? (compact ? 380 : 440) : compact ? 300 : "auto",
        gap: 12,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {(discountPct > 0 || isNew) && (
        <Box style={{ position: "absolute", top: 10, left: 10, zIndex: 2, display: "flex", flexDirection: "column", gap: 4 }}>
          {discountPct > 0 && (
            <Badge color="red" variant="filled" size="md">
              −{discountPct}%
            </Badge>
          )}
          {isNew && (
            <Badge color="green" variant="filled" size="md">
              Ново
            </Badge>
          )}
        </Box>
      )}
      <FavoriteButton id={id} size="md" style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }} />

      <Link
        onMouseEnter={prefetchLargeImage}
        onTouchStart={prefetchLargeImage}
        to={`/product/${encodeURIComponent(slug)}`}
        style={{ textDecoration: "none", flexGrow: 1 }}
      >
        <Card.Section>
          <Image
            src={imageSrc}
            loading="lazy"
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
            minHeight: descriptionText ? (compact ? 100 : 130) : 0,
          }}
        >
          <Text fw={500} lineClamp={2} size="sm" c="blue" title={name}>
            {name}
          </Text>

          <Badge color="green" variant="light" style={{ alignSelf: "flex-start" }}>
            {category?.Name || "Категория"}
          </Badge>

          {descriptionText && (
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
            title={descriptionText}
          >
            {descriptionText}
          </div>
          )}

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
              label: `${formatEUR(parseFloat(price))} (оригинална цена)`,
            },
            ...weight_variants.map((w) => ({
              value: w.label,
              label: `${w.label} – ${formatEUR(w.price)}`,
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
          variant={added ? "filled" : "light"}
          color="green"
          radius="md"
          onClick={handleAddClick}
          size={compact ? "sm" : "md"}
          leftSection={added ? <IconCheck size={16} /> : null}
          style={{ 
            minWidth: 112,
            whiteSpace: "nowrap",
            alignSelf: compact ? "stretch" : "auto", // Разтяга бутона в compact
            marginTop: compact ? 2 : 0
          }}
        >
          {added ? "Добавено" : "Добави"}
        </Button>
      </Group>
    </Card>
  );
}