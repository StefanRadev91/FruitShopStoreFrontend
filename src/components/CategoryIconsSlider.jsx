import { Box, Text, ThemeIcon, Stack } from "@mantine/core";
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
  { icon: IconMeat, label: "Местни изделия", link: "/salty" },
  { icon: IconLeaf, label: "БИО", link: "/bio" },
];

export function CategoryIconsSlider() {
  return (
    <Box
      style={{
        overflow: "hidden",
        width: "100%",
        position: "relative",
        height: 130,
      }}
    >
      <Box
        style={{
          display: "flex",
          gap: 32,
          animation: "scrollLeft 40s linear infinite",
          width: "max-content",
        }}
      >
        {categories.concat(categories).map((cat, i) => (
          <Link
            to={cat.link}
            key={i}
            style={{
              textAlign: "center",
              minWidth: 90,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Stack align="center" spacing={6}>
              <ThemeIcon variant="filled" radius="xl" size={70} color="green">
                <cat.icon size={34} color="white" />
              </ThemeIcon>
              <Text
                size="sm"
                fw={600}
                style={{
                  color: "#2b2b2b",
                  transition: "color 0.3s ease",
                }}
                className="category-label"
              >
                {cat.label}
              </Text>
            </Stack>
          </Link>
        ))}
      </Box>
    </Box>
  );
}