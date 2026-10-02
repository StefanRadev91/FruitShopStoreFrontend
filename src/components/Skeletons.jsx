import { Box, Card, Grid, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";

// Сиви контури вместо въртящ се индикатор – страницата изглежда "готова" още преди данните да дойдат.

export function ProductCardSkeleton() {
  return (
    <Card padding="lg" radius="md" withBorder aria-hidden="true">
      <Skeleton height={110} radius="md" mb="md" />
      <Skeleton height={14} width="80%" mb={10} />
      <Skeleton height={20} width={90} radius="xl" mb="lg" />
      <Group justify="space-between" mt={36}>
        <Skeleton height={22} width={70} />
        <Skeleton height={34} width={100} radius="md" />
      </Group>
    </Card>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <Box role="status" aria-label="Зареждане на продукти">
      <Skeleton height={32} width={220} mx="auto" mb="xl" />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {Array.from({ length: count }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export function HomeSkeleton() {
  return (
    <Box role="status" aria-label="Зареждане">
      <Group grow gap="xl" mt="xl" wrap="nowrap">
        <Skeleton height={120} radius="md" />
        <Skeleton height={120} radius="md" />
      </Group>
      <Group justify="center" gap={24} mt="xl" wrap="wrap">
        {Array.from({ length: 6 }, (_, i) => (
          <Stack key={i} align="center" gap={8}>
            <Skeleton height={60} width={60} circle />
            <Skeleton height={10} width={56} />
          </Stack>
        ))}
      </Group>
      <Skeleton height={34} width={240} mx="auto" mt={48} mb="xl" />
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export function ProductPageSkeleton() {
  return (
    <Box role="status" aria-label="Зареждане на продукта" py="md">
      <Skeleton height={14} width={220} mb="lg" />
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Skeleton height={320} radius="md" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <Skeleton height={28} width="70%" />
            <Skeleton height={30} width={110} />
            <Skeleton height={30} width="60%" radius="xl" />
            <Skeleton height={42} width={280} radius="md" />
            <Skeleton height={14} width="50%" />
            <Skeleton height={14} width="45%" />
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
