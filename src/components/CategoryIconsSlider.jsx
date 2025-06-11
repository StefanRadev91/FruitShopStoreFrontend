import { Box, Text, ThemeIcon, Stack, SimpleGrid } from "@mantine/core";
import { Link } from "react-router-dom";
import {
  IconApple,
  IconCarrot,
  IconFlame,
  IconBottle,
  IconCandy,
  IconSalt,
  IconFish,
  IconNut,
  IconMeat,
  IconLeaf,
} from "@tabler/icons-react";

const categories = [
  { icon: IconApple, label: "Плодове", link: "/fruits" },
  { icon: IconCarrot, label: "Зеленчуци", link: "/vegetables" },
  { icon: IconFlame, label: "Лют Свят", link: "/dairy" },
  { icon: IconBottle, label: "Напитки", link: "/drinks" },
  { icon: IconCandy, label: "Сладко", link: "/sweet" },
  { icon: IconSalt, label: "Подправки", link: "/spices" },
  { icon: IconFish, label: "Рибни", link: "/fish" },
  { icon: IconNut, label: "Ядки", link: "/nuts" },
  { icon: IconMeat, label: "Месни изделия", link: "/salty" },
  { icon: IconLeaf, label: "БИО", link: "/bio" },
];

export function CategoryIconsSlider() {
  return (
    <Box my="xl" px="md">
      <SimpleGrid cols={5} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 3 }]}>
        {categories.map((cat, i) => (
          <Link
            to={cat.link}
            key={i}
            style={{
              textAlign: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Stack align="center" spacing={6}>
              <ThemeIcon variant="filled" radius="xl" size={70} color="green">
                <cat.icon size={34} color="white" />
              </ThemeIcon>
              <Text size="sm" fw={600} style={{ color: "#2b2b2b" }}>
                {cat.label}
              </Text>
            </Stack>
          </Link>
        ))}
      </SimpleGrid>
    </Box>
  );
}