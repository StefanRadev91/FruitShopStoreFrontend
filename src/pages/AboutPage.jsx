import { Container, Title, Text } from "@mantine/core";

export function AboutPage() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md">За нас</Title>
      <Text mb="sm">
        Добре дошли във Fresh.bg – вашият онлайн пазар за пресни плодове,
        зеленчуци и био продукти.
      </Text>
      <Text>
        Нашата мисия е да доставяме чиста, свежа и вкусна храна директно
        до вашия дом.
      </Text>
    </Container>
  );
}