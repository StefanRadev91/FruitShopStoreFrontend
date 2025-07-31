// src/components/Drawer.jsx - актуализирана версия
import { useState, useEffect } from "react";
import { Drawer, Box, Stack, Badge, Button, Collapse, Group, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconChevronDown, IconChevronRight, IconTags } from "@tabler/icons-react";
import {
  FaCarrot,
  FaFish,
  FaCheese,
  FaLeaf,
  FaCandyCane,
  FaGlassWhiskey,
  FaAppleAlt,
} from "react-icons/fa";
import {
  GiSaltShaker,
  GiPeanut,
  GiMeat,
  GiChiliPepper
} from "react-icons/gi";
import { FaBowlRice } from "react-icons/fa6";
import { getMainCategoriesWithCache } from "../services/categoriesAPI";

// Статични категории (fallback)
const staticCategories = [
  { label: "Плодове", path: "/fruits", icon: <FaAppleAlt size={22} /> },
  { label: "Зеленчуци", path: "/vegetables", icon: <FaCarrot size={22} /> },
  { label: "Лют Свят", path: "/dairy", icon: <GiChiliPepper size={22} /> },
  { label: "Напитки", path: "/drinks", icon: <FaGlassWhiskey size={22} /> },
  { label: "Сладко", path: "/sweet", icon: <FaCandyCane size={22} /> },
  { label: "Подправки", path: "/spices", icon: <GiSaltShaker size={22} /> },
  { label: "Рибни", path: "/fish", icon: <FaFish size={22} /> },
  { label: "Ядки", path: "/nuts", icon: <GiPeanut size={22} /> },
  { label: "Месни изделия", path: "/salty", icon: <GiMeat size={22} /> },
  { label: "БИО", path: "/bio", icon: <FaLeaf size={22} /> },
  { label: "Основни продукти", path: "/basic", icon: <FaBowlRice size={22} /> }
];

// Мапинг от API имена към икони и пътища
const iconMapping = {
  "Плодове": { icon: <FaAppleAlt size={22} />, path: "/fruits" },
  "Зеленчуци": { icon: <FaCarrot size={22} />, path: "/vegetables" },
  "Лют свят": { icon: <GiChiliPepper size={22} />, path: "/dairy" },
  "Напитки": { icon: <FaGlassWhiskey size={22} />, path: "/drinks" },
  "Сладко и Солено": { icon: <FaCandyCane size={22} />, path: "/sweet" },
  "Подправки": { icon: <GiSaltShaker size={22} />, path: "/spices" },
  "Рибни": { icon: <FaFish size={22} />, path: "/fish" },
  "Ядки": { icon: <GiPeanut size={22} />, path: "/nuts" },
  "Месни изделия": { icon: <GiMeat size={22} />, path: "/salty" },
  "БИО": { icon: <FaLeaf size={22} />, path: "/bio" },
  "Основни продукти": { icon: <FaBowlRice size={22} />, path: "/basic" }
};

function CategoryItem({ category, navigate, onClose }) {
  const [expanded, setExpanded] = useState(false);

  const handleMainClick = () => {
    navigate(category.path);
    onClose();
  };

  const handleSubcategoryClick = (subcategoryName) => {
    navigate(`/category/${encodeURIComponent(subcategoryName)}`);
    onClose();
  };

  const toggleExpanded = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Box>
      {/* Главна категория */}
      <Group spacing="xs" wrap="nowrap">
        {/* Стрелка за разгъване ако има подкатегории */}
        {category.subcategories && category.subcategories.length > 0 && (
          <Button
            variant="subtle"
            size="xs"
            p={2}
            onClick={toggleExpanded}
            style={{ minWidth: 20, height: 20 }}
          >
            {expanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
          </Button>
        )}

        {/* Основната категория (същия стил като преди) */}
        <Box
          onClick={handleMainClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 8,
            backgroundColor: "#f9f9f9",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontWeight: 500,
            flex: 1
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {category.icon}
          <Text style={{ flex: 1 }}>{category.label}</Text>
          {/* Badge с брой подкатегории */}
          {category.subcategories && category.subcategories.length > 0 && (
            <Badge size="xs" color="orange" variant="filled">
              {category.subcategories.length}
            </Badge>
          )}
        </Box>
      </Group>

      {/* Подкатегории */}
      {category.subcategories && category.subcategories.length > 0 && (
        <Collapse in={expanded}>
          <Box ml={24} mt="xs" pl="xs" style={{ borderLeft: "2px solid #e3f2fd" }}>
            <Stack spacing={4}>
              {category.subcategories.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant="subtle"
                  color="blue"
                  size="xs"
                  leftSection={<IconTags size={12} />}
                  onClick={() => handleSubcategoryClick(subcategory.Name)}
                  style={{
                    justifyContent: "flex-start",
                    height: 28,
                    fontSize: 12
                  }}
                >
                  {subcategory.Name}
                </Button>
              ))}
            </Stack>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

export function CategoryDrawer({ opened, onClose }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(staticCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      if (!opened) return; // Зареждаме само когато се отвори drawer-а

      try {
        setLoading(true);
        const apiCategories = await getMainCategoriesWithCache();
        
        if (apiCategories.length > 0) {
          // Конвертираме API данните към нашия формат
          const convertedCategories = apiCategories.map(category => {
            const mapping = iconMapping[category.Name];
            return {
              label: category.Name,
              path: mapping?.path || `/${category.Name.toLowerCase()}`,
              icon: mapping?.icon || <FaBowlRice size={22} />, // default icon
              subcategories: category.subcategories || [],
              id: category.id
            };
          });
          setCategories(convertedCategories);
        }
      } catch (error) {
        console.error("Грешка при зареждане на категории:", error);
        // При грешка остават статичните категории
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [opened]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Асортимент"
      size="sm"
      padding="md"
      withinPortal={false}
      lockScroll
      overlayProps={{ opacity: 0.1 }}
      styles={{ title: { fontSize: 22, fontWeight: 600 } }}
    >
      <Stack spacing={8}>
        {loading && (
          <Text size="sm" c="dimmed" ta="center">Актуализираме менюто...</Text>
        )}
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id || cat.label}
            category={cat}
            navigate={navigate}
            onClose={onClose}
          />
        ))}
      </Stack>
    </Drawer>
  );
}