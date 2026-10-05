// src/components/CategoryIconsSlider.jsx
import { useState, useEffect, useRef } from "react";
import { Box, Text, ThemeIcon, Stack, Badge, Portal } from "@mantine/core";
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
} from "@tabler/icons-react";
import { getMainCategoriesWithCache, getCachedMainCategories } from "../services/categoriesAPI";
import { useCanHover } from "../hooks/useCanHover";
import { categoryPath } from "../seo/categoryRoutes";

// Мапинг от API име към икона и линк
const categoryMapping = {
  "Плодове": { icon: IconApple, link: "/fruits" },
  "Зеленчуци": { icon: IconCarrot, link: "/vegetables" },
  "Лют свят": { icon: IconFlame, link: "/dairy" },
  "Напитки": { icon: IconBottle, link: "/drinks" },
  "Сладко и Солено": { icon: IconCandy, link: "/sweet" },
  "Кафе и Подправки": { icon: IconSalt, link: "/spices" },
  "Рибни": { icon: IconFish, link: "/fish" },
  "Ядки": { icon: IconNut, link: "/nuts" },
  "Месни изделия": { icon: IconMeat, link: "/salty" },
  "БИО": { icon: IconLeaf, link: "/bio" },
  "Основни продукти": { icon: IconGrain, link: "/basic" },
};

const MENU_WIDTH = 220;

function CategoryItem({ category, onSubcategoryClick }) {
  const [open, setOpen] = useState(false);
  const isTouch = !useCanHover();
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const hideTimeout = useRef(null);
  const rootRef = useRef(null);
  const IconComponent = category.icon;
  const hasSubcategories = category.subcategoriesCount > 0;

  useEffect(() => () => clearTimeout(hideTimeout.current), []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Менюто се центрира под иконата, но не излиза извън екрана.
  const openMenu = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(
      Math.max(rect.left + rect.width / 2 - MENU_WIDTH / 2, 8),
      window.innerWidth - MENU_WIDTH - 8
    );
    setMenuPosition({ x, y: rect.bottom + 4 });
    setOpen(true);
  };

  const handleClick = () => {
    // Категория с подкатегории не води към страница (там няма продукти) – отваря подкатегориите.
    if (hasSubcategories) {
      // С мишка менюто вече се отваря при задържане – кликът го оставя отворено.
      if (open && isTouch) setOpen(false);
      else openMenu();
      return;
    }
    // Категория без подкатегории е истинска връзка (<a href>) – навигацията я прави Link.
    scrollToTop();
  };

  const handleEnter = () => {
    if (isTouch || !hasSubcategories) return;
    clearTimeout(hideTimeout.current);
    openMenu();
  };

  const handleLeave = () => {
    if (isTouch) return;
    hideTimeout.current = setTimeout(() => setOpen(false), 200);
  };

  const handleSubcategoryClick = (name) => {
    onSubcategoryClick(name);
    scrollToTop();
    setOpen(false);
  };

  return (
    <Box
      ref={rootRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...(hasSubcategories ? {} : { component: Link, to: category.link })}
      style={{
        textAlign: "center",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
      }}
      onClick={handleClick}
      className="category-item"
    >
      <Stack align="center" gap={6}>
        <Box style={{ position: "relative" }}>
          <ThemeIcon
            variant="filled"
            radius="xl"
            size={60}
            color="green"
            style={{
              transition: "all 0.25s ease",
              transform: open ? "scale(1.06)" : "scale(1)",
              boxShadow: open
                ? "0 8px 25px rgba(34, 197, 94, 0.3)"
                : "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            <IconComponent size={30} color="white" />
          </ThemeIcon>

          {hasSubcategories && (
            <Badge
              size="sm"
              color="orange"
              variant="filled"
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                fontSize: 10,
                fontWeight: 700,
                border: "2px solid white",
                minWidth: 20,
                height: 20,
                padding: 0,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {category.subcategoriesCount}
            </Badge>
          )}
        </Box>

        <Text
          size="xs"
          fw={600}
          style={{ color: "#2b2b2b", lineHeight: 1.25, maxWidth: 90, textAlign: "center" }}
        >
          {category.label}
          {hasSubcategories && (
            <IconChevronDown
              size={12}
              color="#666"
              style={{
                marginLeft: 2,
                verticalAlign: "middle",
                transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "none",
              }}
            />
          )}
        </Text>
      </Stack>

      {hasSubcategories && open && (
        <Portal>
          {/* Прозрачен фон: клик навън затваря менюто (важно за тъч екрани) */}
          {isTouch && (
            <Box
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 999998 }}
            />
          )}
          <Box
            onMouseEnter={() => clearTimeout(hideTimeout.current)}
            onMouseLeave={handleLeave}
            style={{
              position: "fixed",
              left: menuPosition.x,
              top: menuPosition.y,
              width: MENU_WIDTH,
              maxHeight: "60vh",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              border: "1px solid #e9ecef",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              padding: 8,
              zIndex: 999999,
              animation: "categoryMenuIn 0.18s ease-out",
            }}
          >
            {category.subcategories.map((subcategory) => (
              <Box
                key={subcategory.id}
                component="a"
                href={categoryPath(subcategory.Name)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubcategoryClick(subcategory.Name);
                }}
                className="category-menu-item"
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#495057",
                }}
              >
                {subcategory.Name}
              </Box>
            ))}
          </Box>
        </Portal>
      )}
    </Box>
  );
}

function convertCategories(apiCategories) {
  return apiCategories.map((category) => {
    const mapping = categoryMapping[category.Name];
    return {
      icon: mapping?.icon || IconCategory,
      label: category.Name,
      link: mapping?.link || `/${category.Name.toLowerCase()}`,
      subcategoriesCount: category.subcategories?.length || 0,
      subcategories: category.subcategories || [],
      id: category.id,
    };
  });
}

export function CategoryIconsSlider() {
  const [categories, setCategories] = useState(() => {
    const cached = getCachedMainCategories();
    return cached ? convertCategories(cached) : [];
  });
  const [loading, setLoading] = useState(categories.length === 0);
  const navigate = useNavigate();

  useEffect(() => {
    getMainCategoriesWithCache()
      .then((apiCategories) => {
        if (apiCategories.length > 0) setCategories(convertCategories(apiCategories));
      })
      .catch((error) => console.error("Грешка при зареждане на категории:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleSubcategoryClick = (subcategoryName) => {
    navigate(`/category/${encodeURIComponent(subcategoryName)}`);
  };

  if (loading) {
    return (
      // Запазва мястото на категориите, за да не "скача" страницата, когато дойдат от API-то.
      <Box mt="xl" mb="md" role="status" aria-label="Зареждаме категории" className="category-placeholder" />
    );
  }

  return (
    <Box mt="xl" mb="md">
      <style>{`
        @keyframes categoryMenuIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .category-menu-item:hover { background-color: #f1f8f1; color: #212529; }
        /* Равни редове: 4+4+3 на телефон, 6+5 на таблет, един ред на голям екран */
        .category-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px 0; padding: 10px 4px 8px; }
        .category-item { flex: 0 0 25%; min-width: 0; }
        @media (max-width: 339px) { .category-item { flex-basis: 33.3333%; } }
        @media (min-width: 600px) { .category-item { flex-basis: 16.6666%; } }
        @media (min-width: 1180px) { .category-item { flex: 1 0 92px; } }
      `}</style>
      {/* Един ред под банерите на голям екран, на по-малки – равномерно пренареден */}
      <Box className="category-row">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            onSubcategoryClick={handleSubcategoryClick}
          />
        ))}
      </Box>
    </Box>
  );
}
