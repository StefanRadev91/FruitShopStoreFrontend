import { Group, Button } from "@mantine/core";

export function CategoriesNav() {
  return (
    <Group position="center" spacing="xl" mt={24} mb={20}>
      <Button size="md" color="teal" radius="xl" variant="outline" style={{ minWidth: 140 }}>
        Плодове
      </Button>
      <Button size="md" color="lime" radius="xl" variant="outline" style={{ minWidth: 140 }}>
        Зеленчуци
      </Button>
    </Group>
  );
}