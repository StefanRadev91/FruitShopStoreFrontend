// src/pages/ProductPage.jsx - актуализирана версия
import { imageUrl, findInSnapshot, useCatalog } from "../services/productsAPI";
import { useEffect, useMemo, useState } from "react";
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
  Select,
} from "@mantine/core";
import { PriceDisplay, formatEUR, toEUR } from "../components/PriceDisplay";
import { Seo, SITE_URL, breadcrumbJsonLd } from "../seo/Seo";
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
  const { products: catalog } = useCatalog();

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
    onAddToCart({
      ...product,
      selectedWeight,
      qty: 1,
    });
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
          <Stack spacing="sm">
            <Title order={1} size="h3">{productName}</Title>

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
                  { value: "__original__", label: `${formatEUR(parseFloat(price))} (оригинална цена)` },
                  ...weight_variants.map((w) => ({
                    value: w.label,
                    label: `${w.label} – ${formatEUR(w.price)}`,
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