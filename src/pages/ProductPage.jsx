// src/pages/ProductPage.jsx - актуализирана версия
import { imageUrl, findInSnapshot, useCatalog } from "../services/productsAPI";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  Group,
  ActionIcon,
  Breadcrumbs,
  Anchor,
  NumberInput,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShare, IconTruckDelivery, IconLeaf, IconCalendarEvent, IconMinus, IconPlus } from "@tabler/icons-react";
import { FavoriteButton } from "../components/FavoriteButton";
import { FREE_DELIVERY_OVER_BGN } from "../services/cart";
import { PriceDisplay, formatEUR, toEUR } from "../components/PriceDisplay";
import { Seo, SITE_URL, breadcrumbJsonLd } from "../seo/Seo";
import { ProductPageSkeleton } from "../components/Skeletons";
import { categoryPath } from "../seo/categoryRoutes";
import { ProductSlider } from "../components/ProductSlider";

const RELATED_COUNT = 10;

// Стабилно "разбъркване" по slug, за да не се сменят предложенията при всяко рендиране.
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

export function ProductPage({ onAddToCart }) {
  const { slug } = useParams();
  // Показваме веднага продукта от каталога (без описание), а пълните данни идват във фонов режим.
  const [product, setProduct] = useState(() => findInSnapshot(slug));
  const [hiResLoaded, setHiResLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(() => !!product?.product_description);
  const [loading, setLoading] = useState(product === null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [qty, setQty] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef(null);
  const { products: catalog } = useCatalog();

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  });

  // Други продукти от същата категория; ако са малко – допълваме с най-продаваните.
  const categoryName = product?.category?.Name;
  const related = useMemo(() => {
    if (!product) return [];
    const others = catalog.filter((p) => p.slug && p.slug !== product.slug);
    const sameCategory = categoryName ? others.filter((p) => p.category?.Name === categoryName) : [];
    const pool = sameCategory.length >= 3 ? sameCategory : [...sameCategory, ...others.filter((p) => p.featured && !sameCategory.includes(p))];
    return pool
      .sort((a, b) => hashCode(product.slug + a.slug) - hashCode(product.slug + b.slug))
      .slice(0, RELATED_COUNT);
  }, [catalog, product, categoryName]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const seed = findInSnapshot(slug);
    setProduct(seed);
    setLoading(seed === null);
    setFullLoaded(!!seed?.product_description);
    setHiResLoaded(false);
    setQty(1);
    setSelectedWeight(null);
    let cancelled = false;

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
        if (cancelled) return;
        setProduct(data.data[0]);
        setFullLoaded(true);
      } catch (error) {
        console.error("Грешка при зареждане на продукт:", error);
        if (!cancelled) setFullLoaded(true); // не оставяме "Зареждаме описанието..." завинаги
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <ProductPageSkeleton />;

  if (!product) {
    return (
      <Container size="md" py="xl" ta="center">
        <Seo title="Продуктът не е намерен" path={`/product/${slug}`} noindex />
        <Title order={1} size="h3" mb="sm">
          Продуктът не беше намерен
        </Title>
        <Text c="dimmed" mb="md">
          Възможно е да е свален от продажба или линкът да е грешен.
        </Text>
        <Button component={Link} to="/" color="green" variant="light">
          Към началната страница
        </Button>
      </Container>
    );
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
  const imageSrc = imageUrl(image, 800);
  const previewSrc = imageUrl(image, 360);

  // Изчисляваме оригинална и промо цена
  const originalPrice = selectedWeight?.price ?? parseFloat(price);
  const promoPrice = selectedWeight
    ? selectedWeight.promo_price ?? null
    : promo_price
    ? parseFloat(promo_price)
    : null;

  const handleAddClick = () => {
    onAddToCart({ ...product, selectedWeight }, qty);
    notifications.show({
      message: `${qty} × ${productName} е добавен в количката`,
      color: "green",
      autoClose: 2200,
    });
  };

  const handleShare = async () => {
    const url = `${SITE_URL}/product/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: productName, url });
      } else {
        await navigator.clipboard.writeText(url);
        notifications.show({ message: "Линкът е копиран", color: "green", autoClose: 1800 });
      }
    } catch {
      /* потребителят е затворил прозореца за споделяне */
    }
  };

  // --- SEO: описание, структурирани данни (цената е в евро, както се вижда на сайта) ---
  const productPath = `/product/${slug}`;
  const descriptionText = Array.isArray(product_description)
    ? product_description.map((b) => b?.children?.[0]?.text || "").filter(Boolean).join(" ")
    : product_description || "";
  const basePrice = (() => {
    const promo = promo_price ? parseFloat(promo_price) : NaN;
    return Number.isFinite(promo) ? promo : parseFloat(price);
  })();
  const seoImage = image?.[0]?.url
    ? image[0].url.startsWith("http")
      ? image[0].url
      : imageUrl(image, 800)
    : undefined;
  const seoDescription =
    descriptionText ||
    `${productName} – купи онлайн от Дар от Земята. Натурални продукти от български ферми с доставка до дома или офиса.`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: seoDescription.slice(0, 500),
    ...(seoImage && { image: [seoImage] }),
    ...(category?.Name && { category: category.Name }),
    url: `${SITE_URL}${productPath}`,
    ...(Number.isFinite(basePrice) && {
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}${productPath}`,
        priceCurrency: "EUR",
        price: toEUR(basePrice).toFixed(2),
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "Дар от Земята" },
      },
    }),
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Начало", path: "/" },
    ...(category?.Name ? [{ name: category.Name, path: categoryPath(category.Name) }] : []),
    { name: productName, path: productPath },
  ]);

  return (
    <Container size="md" py="xl">
      <Seo
        title={productName}
        description={seoDescription}
        path={productPath}
        image={seoImage}
        jsonLd={[productJsonLd, breadcrumbs]}
      />
      <Breadcrumbs mb="lg" separator="›" style={{ flexWrap: "wrap" }}>
        <Anchor component={Link} to="/" size="sm" c="dimmed">
          Начало
        </Anchor>
        {category?.Name && (
          <Anchor component={Link} to={categoryPath(category.Name)} size="sm" c="dimmed">
            {category.Name}
          </Anchor>
        )}
        <Text size="sm" lineClamp={1}>
          {productName}
        </Text>
      </Breadcrumbs>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 5 }}>
          {/* Малката версия (вече е в кеша от картата) се вижда веднага, а едрата се наслагва след като се зареди */}
          <Box style={{ position: "relative", height: 320, width: "100%" }}>
            <Image
              src={previewSrc}
              alt={productName}
              fit="contain"
              h={320}
              w="100%"
              style={{ position: "absolute", inset: 0 }}
            />
            <Image
              src={imageSrc}
              alt={productName}
              fit="contain"
              h={320}
              w="100%"
              onLoad={() => setHiResLoaded(true)}
              style={{
                position: "absolute",
                inset: 0,
                opacity: hiResLoaded ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            />
          </Box>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
              <Title order={1} size="h3">{productName}</Title>
              <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
                <ActionIcon variant="default" radius="xl" size="md" aria-label="Сподели" onClick={handleShare} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                  <IconShare size={18} />
                </ActionIcon>
                <FavoriteButton id={product.id} size="md" />
              </Group>
            </Group>

            <PriceDisplay
              priceBGN={originalPrice}
              promoPriceBGN={promoPrice}
              size="xl"
              compact={false}
            />

            {weight_variants.length > 0 && (
              <Box>
                <Text size="sm" fw={600} mb={6}>
                  Избери грамаж
                </Text>
                <Group gap={8}>
                  {[{ key: "__original__", label: "Оригинален грамаж", price: Number.isFinite(parseFloat(promo_price)) ? parseFloat(promo_price) : parseFloat(price), variant: null }, ...weight_variants.map((w) => ({ key: w.label, label: w.label, price: w.promo_price ?? w.price, variant: w }))].map((opt) => {
                    const selected = (selectedWeight?.label ?? "__original__") === opt.key;
                    return (
                      <Button
                        key={opt.key}
                        size="xs"
                        radius="xl"
                        variant={selected ? "filled" : "default"}
                        color="green"
                        aria-pressed={selected}
                        onClick={() => setSelectedWeight(opt.variant)}
                      >
                        {opt.label} · {formatEUR(opt.price)}
                      </Button>
                    );
                  })}
                </Group>
              </Box>
            )}

            <Badge color="green" size="lg" variant="light" w="fit-content">
              В наличност
            </Badge>

            <Group gap="md" align="center" wrap="wrap" ref={ctaRef}>
              <Group gap={4} wrap="nowrap">
                <ActionIcon variant="light" color="green" size="lg" aria-label="Намали количеството" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
                  <IconMinus size={16} />
                </ActionIcon>
                <NumberInput
                  value={qty}
                  onChange={(v) => setQty(Math.min(99, Math.max(1, Math.floor(Number(v)) || 1)))}
                  min={1}
                  max={99}
                  hideControls
                  w={64}
                  size="sm"
                  aria-label="Количество"
                  styles={{ input: { textAlign: "center", fontWeight: 700 } }}
                />
                <ActionIcon variant="light" color="green" size="lg" aria-label="Увеличи количеството" onClick={() => setQty((q) => Math.min(99, q + 1))}>
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>
              <Button color="orange" size="md" radius="md" style={{ minWidth: 190 }} onClick={handleAddClick}>
                Добави в количката
              </Button>
            </Group>

            <Divider />
            <Stack gap={8}>
              <Group gap={10} wrap="nowrap">
                <IconLeaf size={20} color="#2f9e44" style={{ flexShrink: 0 }} />
                <Text size="sm">Директно от български ферми</Text>
              </Group>
              <Group gap={10} wrap="nowrap">
                <IconCalendarEvent size={20} color="#2f9e44" style={{ flexShrink: 0 }} />
                <Text size="sm">Доставка в София от понеделник до неделя</Text>
              </Group>
              <Group gap={10} wrap="nowrap">
                <IconTruckDelivery size={20} color="#2f9e44" style={{ flexShrink: 0 }} />
                <Text size="sm">Безплатна доставка над {toEUR(FREE_DELIVERY_OVER_BGN).toFixed(2)} €</Text>
              </Group>
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>

      {(!fullLoaded || product_description) && (
      <Box mt="xl">
        <Title order={4} mb="sm">
          Описание на продукта
        </Title>
        {!fullLoaded && !product_description ? (
          <Text c="dimmed">Зареждаме описанието...</Text>
        ) : Array.isArray(product_description) ?
          product_description.map((block, index) => (
            <Text key={index} mb="sm">
              {block?.children?.[0]?.text || ""}
            </Text>
          )) : (
          <Text>{product_description}</Text>
        )}
      </Box>
      )}

      {/* Залепена лента за покупка на телефон – показва се, когато основният бутон е извън екрана */}
      <Box
        hiddenFrom="sm"
        aria-hidden={!showStickyBar}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 90,
          padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
          background: "#fff",
          borderTop: "1px solid #e3e3e3",
          boxShadow: "0 -6px 20px rgba(0,0,0,0.08)",
          transform: showStickyBar ? "translateY(0)" : "translateY(110%)",
          transition: "transform 0.25s ease",
        }}
      >
        <Group justify="space-between" wrap="nowrap" gap="md">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {productName}
            </Text>
            <Text fw={800} c={promoPrice ? "red" : undefined}>
              {formatEUR(promoPrice ?? originalPrice)}
            </Text>
          </Box>
          <Button color="orange" radius="md" tabIndex={showStickyBar ? 0 : -1} onClick={handleAddClick}>
            Добави в количката
          </Button>
        </Group>
      </Box>

      {related.length > 0 && (
        <Box mt={48}>
          <ProductSlider
            variant="similar"
            products={related}
            onAddToCart={onAddToCart}
            slideSize={{ base: "100%", xs: "50%", sm: "33.3333%" }}
          />
        </Box>
      )}
    </Container>
  );
}