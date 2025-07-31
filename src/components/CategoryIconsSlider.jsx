// src/components/CategoryIconsSlider.jsx
import { useState, useEffect } from "react";
import { Box, Text, ThemeIcon, Stack, SimpleGrid, Badge, Paper, Group, Button, Collapse } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
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
  IconCategory,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { getMainCategoriesWithCache } from "../services/categoriesAPI";

// Мапинг от API име към икона и линк
const categoryMapping = {
  "Плодове": { icon: IconApple, link: "/fruits" },
  "Зеленчуци": { icon: IconCarrot, link: "/vegetables" },
  "Лют свят": { icon: IconFlame, link: "/dairy" },
  "Напитки": { icon: IconBottle, link: "/drinks" },
  "Сладко и Солено": { icon: IconCandy, link: "/sweet" },
  "Подправки": { icon: IconSalt, link: "/spices" },
  "Рибни": { icon: IconFish, link: "/fish" },
  "Ядки": { icon: IconNut, link: "/nuts" },
  "Месни изделия": { icon: IconMeat, link: "/salty" },
  "БИО": { icon: IconLeaf, link: "/bio" },
  "Основни продукти": { icon: IconGrain, link: "/basic" },
};

function CategoryItem({ category, onSubcategoryClick }) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = category.icon;
  const navigate = useNavigate();
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Функция за клик на иконата - винаги отива към категорията
  const handleIconClick = () => {
    navigate(category.link);
    scrollToTop();
  };

  // Функция за клик на стрелката - показва/скрива подкатегории
  const handleToggleSubcategories = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleSubcategoryClick = (subcategoryName) => {
    onSubcategoryClick(subcategoryName);
    scrollToTop();
  };

  return (
    <Box style={{ textAlign: "center" }}>
      <Stack align="center" spacing={6}>
        {/* Икона - винаги клик към категория */}
        <Box style={{ position: "relative" }}>
          <ThemeIcon
            variant="filled"
            radius="xl"
            size={70}
            color="green"
            style={{ cursor: "pointer" }}
            onClick={handleIconClick}
          >
            <IconComponent size={34} color="white" />
          </ThemeIcon>
          
          {/* Badge с брой подкатегории */}
          {category.subcategoriesCount > 0 && (
            <Badge
              size="xs"
              color="orange"
              variant="filled"
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10
              }}
            >
              {category.subcategoriesCount}
            </Badge>
          )}
        </Box>
        
        {/* Име на категория и стрелка */}
        <Group spacing={4} align="center">
          {/* Име на категория - също клик към категория */}
          <Text 
            size="sm" 
            fw={600} 
            style={{ 
              color: "#2b2b2b",
              cursor: "pointer"
            }}
            onClick={handleIconClick}
          >
            {category.label}
          </Text>
          
          {/* Стрелка за подкатегории - само ако има подкатегории */}
          {category.subcategoriesCount > 0 && (
            <Box
              style={{ cursor: "pointer" }}
              onClick={handleToggleSubcategories}
            >
              {expanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
            </Box>
          )}
        </Group>
      </Stack>

      {/* Подкатегории */}
      {category.subcategoriesCount > 0 && (
        <Collapse in={expanded}>
          <Paper
            shadow="md"
            p="xs"
            mt="xs"
            radius="md"
            style={{
              background: "#f8f9fa",
              border: "1px solid #e9ecef"
            }}
          >
            <Stack spacing={4}>
              <Text size="xs" c="dimmed" fw={600} mb={2}>
                Подкатегории:
              </Text>
              {category.subcategories.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant="subtle"
                  color="blue"
                  size="xs"
                  onClick={() => handleSubcategoryClick(subcategory.Name)}
                  style={{
                    height: 24,
                    fontSize: 11,
                    justifyContent: "flex-start",
                    padding: "4px 8px"
                  }}
                >
                  {subcategory.Name}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Collapse>
      )}
    </Box>
  );
}

export function CategoryIconsSlider() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const apiCategories = await getMainCategoriesWithCache();
        
        if (apiCategories.length > 0) {
          // Конвертираме API данните към нашия формат
          const convertedCategories = apiCategories.map(category => {
            const mapping = categoryMapping[category.Name];
            return {
              icon: mapping?.icon || IconCategory,
              label: category.Name,
              link: mapping?.link || `/${category.Name.toLowerCase()}`,
              subcategoriesCount: category.subcategories?.length || 0,
              subcategories: category.subcategories || [],
              id: category.id
            };
          });
          
          setCategories(convertedCategories);
        }
      } catch (error) {
        console.error("Грешка при зареждане на категории:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const handleSubcategoryClick = (subcategoryName) => {
    // За подкатегориите използваме direct URL pattern
    // Ще трябва да добавиш route за това в App.jsx
    const urlFriendlyName = subcategoryName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${encodeURIComponent(subcategoryName)}`);
  };

  if (loading) {
    return (
      <Box my="xl" px="sm" ta="center">
        <Text size="sm" c="dimmed">Зареждаме категории...</Text>
      </Box>
    );
  }

  return (
    <Box my="xl" px="sm">
      <SimpleGrid cols={{ base: 2, xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }} spacing={12}>
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            onSubcategoryClick={handleSubcategoryClick}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}