import { Box, Text, ThemeIcon, Stack, ActionIcon } from "@mantine/core";
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
  IconChevronRight,
  IconChevronLeft,
} from "@tabler/icons-react";
import { useRef } from "react";

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
  const scrollRef = useRef();

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 200, behavior: "smooth" });
    }
  };

  return (
    <Box style={{ position: "relative", width: "100%", padding: "0 16px" }}>
      {/* Лява стрелка */}
      <ActionIcon
        variant="subtle"
        radius="xl"
        size="lg"
        style={arrowStyleLeft}
        onClick={() => handleScroll(-1)}
      >
        <IconChevronLeft size={22} />
      </ActionIcon>

      {/* Категории */}
      <Box
        ref={scrollRef}
        style={{
          overflowX: "auto",
          display: "flex",
          gap: 32,
          padding: "16px 0",
          scrollBehavior: "smooth",
        }}
      >
        {categories.map((cat, i) => (
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
              <Text size="sm" fw={600} style={{ color: "#2b2b2b" }}>
                {cat.label}
              </Text>
            </Stack>
          </Link>
        ))}
      </Box>

      {/* Дясна стрелка */}
      <ActionIcon
        variant="subtle"
        radius="xl"
        size="lg"
        style={arrowStyleRight}
        onClick={() => handleScroll(1)}
      >
        <IconChevronRight size={22} />
      </ActionIcon>
    </Box>
  );
}

const arrowStyleLeft = {
  position: "absolute",
  top: "50%",
  left: -8,
  transform: "translateY(-50%)",
  zIndex: 5,
  color: "#888",
  backgroundColor: "transparent",
  transition: "opacity 0.2s ease",
  opacity: 0.4,
  cursor: "pointer",
};

const arrowStyleRight = {
  position: "absolute",
  top: "50%",
  right: -8,
  transform: "translateY(-50%)",
  zIndex: 5,
  color: "#888",
  backgroundColor: "transparent",
  transition: "opacity 0.2s ease",
  opacity: 0.4,
  cursor: "pointer",
};
