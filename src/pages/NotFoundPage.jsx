import { Box, Button, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { Seo } from "../seo/Seo";

export default function NotFoundPage() {
  return (
    <Box py={60} px="md" ta="center">
      <Seo title="Страницата не е намерена" path="/404" noindex />
      <Title order={1} size="h2" mb="sm">
        Страницата не е намерена
      </Title>
      <Text c="dimmed" mb="lg">
        Адресът е грешен или страницата вече не съществува.
      </Text>
      <Button component={Link} to="/" color="green">
        Към началната страница
      </Button>
    </Box>
  );
}
