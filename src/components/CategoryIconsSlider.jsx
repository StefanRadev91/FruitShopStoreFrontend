// src/components/CategoryIconsSlider.jsx
import { useState, useEffect } from "react";
import { Box, Text, ThemeIcon, Stack, SimpleGrid, Badge, Portal, Collapse, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
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
  const [hoveredSubcategories, setHoveredSubcategories] = useState(false);
  const [expanded, setExpanded] = useState(false); // За мобилно expand/collapse
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [categoryPosition, setCategoryPosition] = useState({ x: 0, y: 0 });
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const IconComponent = category.icon;
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);
  
  const scrollToTop = () => {
    // Принудителен scroll до top - няколко опита за да се гарантира
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };
  
  const handleIconClick = () => {
    // Винаги отива към категория при клик на иконата
    navigate(category.link);
    scrollToTop();
  };

  const handleToggleSubcategories = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCategoryHover = (e) => {
    if (category.subcategoriesCount > 0 && !isMobile) {
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      
      const rect = e.currentTarget.getBoundingClientRect();
      setCategoryPosition({
        x: rect.left + rect.width / 2 - 100, // center the overlay
        y: rect.bottom + 4 // smaller gap
      });
      setHoveredSubcategories(true);
    }
  };

  const handleCategoryLeave = () => {
    if (!isMobile) {
      // Add delay before hiding
      const timeout = setTimeout(() => {
        setHoveredSubcategories(false);
      }, 200); // 200ms delay
      setHoverTimeout(timeout);
    }
  };

  const handleOverlayEnter = () => {
    if (!isMobile) {
      // Clear timeout when entering overlay
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setHoveredSubcategories(true);
    }
  };

  const handleOverlayLeave = () => {
    if (!isMobile) {
      setHoveredSubcategories(false);
    }
  };

  const handleSubcategoryClick = (subcategoryName) => {
    onSubcategoryClick(subcategoryName);
    scrollToTop();
    setHoveredSubcategories(false);
  };

  return (
    <Box 
      style={{ 
        textAlign: "center",
        position: "relative",
        zIndex: hoveredSubcategories ? 1001 : 1
      }}
      onMouseEnter={(e) => !isMobile && handleCategoryHover(e)}
      onMouseLeave={() => !isMobile && handleCategoryLeave()}
    >
      <Stack align="center" spacing={6}>
        {/* Икона */}
        <Box style={{ position: "relative" }}>
          <ThemeIcon
            variant="filled"
            radius="xl"
            size={70}
            color="green"
            style={{ 
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: hoveredSubcategories ? "scale(1.05)" : "scale(1)",
              boxShadow: hoveredSubcategories 
                ? "0 8px 25px rgba(34, 197, 94, 0.3)" 
                : "0 4px 15px rgba(0,0,0,0.1)"
            }}
            onClick={handleIconClick}
          >
            <IconComponent size={34} color="white" />
          </ThemeIcon>
          
          {/* Badge с брой подкатегории */}
          {category.subcategoriesCount > 0 && (
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
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            >
              {category.subcategoriesCount}
            </Badge>
          )}
        </Box>
        
        {/* Име на категория и стрелка за мобилно */}
        <Group spacing={4} align="center" style={{ justifyContent: "center" }}>
          <Text 
            size="sm" 
            fw={600} 
            style={{ 
              color: "#2b2b2b",
              cursor: "pointer",
              transition: "color 0.2s ease",
              textAlign: "center"
            }}
            onClick={handleIconClick}
          >
            {category.label}
          </Text>
          
          {/* Стрелка за подкатегории на мобилно */}
          {isMobile && category.subcategoriesCount > 0 && (
            <Box
              style={{ cursor: "pointer", marginLeft: 2 }}
              onClick={handleToggleSubcategories}
            >
              {expanded ? <IconChevronUp size={14} color="#666" /> : <IconChevronDown size={14} color="#666" />}
            </Box>
          )}
        </Group>
      </Stack>

      {/* Overlay меню за подкатегории */}
      {category.subcategoriesCount > 0 && hoveredSubcategories && (
        isMobile ? (
          <Box
            style={{
              position: "absolute",
              left: "50%",
              top: "100%",
              transform: "translateX(-50%)",
              marginTop: "8px",
              backgroundColor: "#ffffff",
              border: "1px solid #e9ecef",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              padding: "12px",
              minWidth: "160px",
              zIndex: 999999,
              animation: "slideInDown 0.2s ease-out"
            }}
          >
            <Stack spacing={6}>
              {category.subcategories.map((subcategory) => (
                <Box
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory.Name)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#495057",
                    backgroundColor: "transparent",
                    textAlign: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.color = "#212529";
                    e.target.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#495057";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  {subcategory.Name}
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          <Portal>
            <Box
              style={{
                position: "fixed",
                left: `${categoryPosition.x}px`,
                top: `${categoryPosition.y}px`,
                backgroundColor: "#ffffff",
                border: "1px solid #e9ecef",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                padding: "12px",
                minWidth: "200px",
                maxWidth: "250px",
                zIndex: 999999,
                animation: "slideInDown 0.2s ease-out"
              }}
              onMouseEnter={handleOverlayEnter}
              onMouseLeave={handleOverlayLeave}
            >
              <Stack spacing={6}>
                {category.subcategories.map((subcategory) => (
                  <Box
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory.Name)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#495057",
                      backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f8f9fa";
                      e.target.style.color = "#212529";
                      e.target.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "#495057";
                      e.target.style.transform = "translateX(0)";
                    }}
                  >
                    {subcategory.Name}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Portal>
        )
      )}

      {/* Мобилно Collapse меню за подкатегории */}
      {isMobile && category.subcategoriesCount > 0 && (
        <Collapse in={expanded}>
          <Box 
            mt="sm" 
            p="sm"
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              maxHeight: "280px",
              overflowY: "auto"
            }}
          >
            <Stack spacing={8}>
              {category.subcategories.map((subcategory) => (
                <Box
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory.Name)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#495057",
                    backgroundColor: "transparent",
                    textAlign: "center",
                    border: "1px solid transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.color = "#212529";
                    e.target.style.borderColor = "#dee2e6";
                    e.target.style.transform = "scale(1.02)";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#495057";
                    e.target.style.borderColor = "transparent";
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {subcategory.Name}
                </Box>
              ))}
            </Stack>
          </Box>
        </Collapse>
      )}

      {/* CSS Анимации */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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