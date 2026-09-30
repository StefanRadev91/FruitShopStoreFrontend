import { Box, Button, Text } from "@mantine/core";

export function CatalogError({ onRetry }) {
  return (
    <Box ta="center" py={60}>
      <Text fw={600} mb={6}>
        Не успяхме да заредим продуктите.
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Провери връзката си и опитай отново.
      </Text>
      <Button color="green" onClick={onRetry}>
        Опитай отново
      </Button>
    </Box>
  );
}
