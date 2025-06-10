import { Container, Title, Text } from "@mantine/core";

export function AboutPage() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md">За нас</Title>
      <Text mb="sm">
        Телефон:
        +359 886282323
      </Text>
      <Text>
        DAROTZEMQTA.bg
        ФРЕСКО 2022 ООД гр. София ж.к. Христо Смирненски бл.74, ап.62 ЕИК: 208236969
      </Text>
    </Container>
  );
}