import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconHeart, IconRepeat } from "@tabler/icons-react";
import { Seo } from "../seo/Seo";
import { ProductCard } from "../components/ProductCard";
import { useFavorites } from "../services/favorites";
import { useCatalog } from "../services/productsAPI";
import { loadLastOrder, refreshCartFromCatalog, cartKey } from "../services/cart";

export default function FavoritesPage({ onAddToCart, onReorder }) {
  const { ids } = useFavorites();
  const { products } = useCatalog();
  const lastOrder = useMemo(() => loadLastOrder(), []);

  const favorites = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }, [ids, products]);

  return (
    <Box>
      <Seo title="Любими продукти" path="/favorites" noindex />
      <Title order={1} size="h2" mb="lg" ta="center">
        Любими продукти
      </Title>

      {ids.length === 0 ? (
        <Stack align="center" gap="sm" py={40} ta="center">
          <IconHeart size={56} color="#adb5bd" stroke={1.4} />
          <Text fw={700} size="lg">
            Още нямаш любими продукти
          </Text>
          <Text c="dimmed" size="sm" maw={420}>
            Натисни сърцето върху продукт, за да го запазиш тук и да го намираш бързо следващия път.
          </Text>
          <Button component={Link} to="/" color="green" variant="light">
            Разгледай продуктите
          </Button>
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {favorites.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              promo_price={p.promo_price}
              image={p.image}
              category={p.category}
              weight_variants={p.weight_variants || []}
              onAddToCart={onAddToCart}
              isNew={p.new_product === true}
            />
          ))}
        </SimpleGrid>
      )}

      {lastOrder.length > 0 && (
        <Box mt={48} p="lg" style={{ background: "#fff", borderRadius: 16, border: "1px solid #e3efe3" }}>
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Box>
              <Title order={2} size="h4" mb={4}>
                Последната ти поръчка
              </Title>
              <Text size="sm" c="dimmed">
                Поръчай същите продукти с един клик.
              </Text>
            </Box>
            <Button
              color="green"
              leftSection={<IconRepeat size={18} />}
              onClick={() => onReorder(refreshCartFromCatalog(lastOrder, products))}
            >
              Поръчай отново
            </Button>
          </Group>
          <Stack gap={4} mt="md">
            {lastOrder.map((item) => (
              <Text key={cartKey(item)} size="sm">
                {item.qty} × {item.name}
                {item.selectedWeight?.label ? ` (${item.selectedWeight.label})` : ""}
              </Text>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
