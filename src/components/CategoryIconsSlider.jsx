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
  IconGrain,
} from "@tabler/icons-react";

const categories = [
  { icon: IconApple,  label: "Плодове",           link: "/fruits" },
  { icon: IconCarrot, label: "Зеленчуци",         link: "/vegetables" },
  { icon: IconFlame,  label: "Лют Свят",          link: "/dairy" },
  { icon: IconBottle,label: "Напитки",           link: "/drinks" },
  { icon: IconCandy, label: "Сладко",            link: "/sweet" },
  { icon: IconSalt,  label: "Подправки",         link: "/spices" },
  { icon: IconFish,  label: "Рибни",             link: "/fish" },
  { icon: IconNut,   label: "Ядки",              link: "/nuts" },
  { icon: IconMeat,  label: "Месни изделия",     link: "/salty" },
  { icon: IconLeaf,  label: "БИО",               link: "/bio" },
  { icon: IconGrain, label: "Основни продукти",  link: "/basic" },
];

export function CategoryIconsSlider() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Box my="xl" px="sm">
      <SimpleGrid cols={{ base: 2, xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }} spacing={8}>
        {categories.map((cat, i) => {
          const IconComponent = cat.icon;
          return (
            <Link
              to={cat.link}
              key={i}
              onClick={scrollToTop}
              style={{
                textAlign: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Stack align="center" spacing={6}>
                <ThemeIcon variant="filled" radius="xl" size={70} color="green">
                  <IconComponent size={34} color="white" />
                </ThemeIcon>
                <Text size="sm" fw={600} style={{ color: "#2b2b2b" }}>
                  {cat.label}
                </Text>
              </Stack>
            </Link>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}