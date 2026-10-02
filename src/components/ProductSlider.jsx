import { Box, Text, Title } from "@mantine/core";
import { IconRosetteDiscount, IconSparkles, IconTrophy, IconHeartHandshake } from "@tabler/icons-react";
import { ProductCard } from "./ProductCard";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";

const HEADINGS = {
  promo: {
    icon: IconRosetteDiscount,
    eyebrow: "Специални оферти",
    title: "Промо продукти",
    subtitle: "Свежи продукти на специална цена – докато трае промоцията",
    from: "#ff8a4c",
    to: "#f03e3e",
  },
  new: {
    icon: IconSparkles,
    eyebrow: "Прясно добавени",
    title: "Най-нови продукти",
    subtitle: "Последните попълнения в нашия асортимент",
    from: "#51cf66",
    to: "#12b886",
  },
  similar: {
    icon: IconHeartHandshake,
    eyebrow: "Може да ви хареса",
    title: "Подобни продукти",
    subtitle: "Още предложения от същата категория",
    from: "#4dabf7",
    to: "#2f7de1",
  },
  best: {
    icon: IconTrophy,
    eyebrow: "Избор на клиентите",
    title: "Най-продавани",
    subtitle: "Любимите продукти на нашите клиенти",
    from: "#ffc53d",
    to: "#f08c00",
  },
};

function SectionHeading({ variant }) {
  const { icon: Icon, eyebrow, title, subtitle, from, to } = HEADINGS[variant];
  return (
    <Box ta="center" mb={28} px="sm">
      <Box
        style={{
          width: 56,
          height: 56,
          margin: "0 auto 14px",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${from}, ${to})`,
          boxShadow: `0 10px 24px -8px ${to}`,
          transform: "rotate(-4deg)",
        }}
      >
        <Icon size={30} color="#fff" stroke={1.8} />
      </Box>
      <Text
        size="xs"
        fw={700}
        tt="uppercase"
        style={{ letterSpacing: "0.16em", color: to, marginBottom: 4 }}
      >
        {eyebrow}
      </Text>
      <Title
        order={2}
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.1rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#16301f",
        }}
      >
        {title}
      </Title>
      <Box
        style={{
          width: 56,
          height: 4,
          borderRadius: 4,
          margin: "12px auto 10px",
          background: `linear-gradient(90deg, ${from}, ${to})`,
        }}
      />
      <Text size="sm" c="dimmed" maw={460} mx="auto">
        {subtitle}
      </Text>
    </Box>
  );
}

export function ProductSlider({ variant, products, onAddToCart, slideSize }) {
  if (!products.length) return null;

  // Подреждане по последна модификация (най-новите отпред)
  // (при "подобни" запазваме подадения ред)
  const sortedProducts =
    variant === "similar"
      ? products
      : [...products].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <Box mt={40} mb={40}>
      <SectionHeading variant={variant} />
      <Carousel
        withIndicators={false}
        withControls
        controlsOffset={0}
        height="auto"
        slideSize={slideSize || { base: "100%", xs: "50%", sm: "33.3333%", md: "25%" }}
        slideGap="md"
        emblaOptions={{ align: "start", loop: false, containScroll: "trimSnaps", slidesToScroll: 1 }}
        styles={{
          root: { padding: "0 26px" },
          control: {
            background: "#fff",
            border: "none",
            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            width: 38,
            height: 38,
            opacity: 1,
          },
          viewport: { padding: "6px 4px 12px" },
        }}
      >
        {sortedProducts.map((p) => (
          <Carousel.Slide key={p.id}>
            <ProductCard
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              promo_price={p.promo_price}
              description={p.product_description}
              image={p.image}
              category={p.category}
              weight_variants={[]} // остава си празно
              onAddToCart={() => onAddToCart(p)}
              compact
              isNew={p.new_product === true}
            />
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}