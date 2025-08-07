// src/components/Drawer.jsx - актуализирана версия
import { useState, useEffect, useRef } from "react";
import { Drawer, Box, Stack, Badge, Text, Portal } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import {
  FaCarrot,
  FaFish,
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
  { label: "Кафе и Подправки", path: "/spices", icon: <GiSaltShaker size={22} /> },
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
  "Кафе и Подправки": { icon: <GiSaltShaker size={22} />, path: "/spices" },
  "Рибни": { icon: <FaFish size={22} />, path: "/fish" },
  "Ядки": { icon: <GiPeanut size={22} />, path: "/nuts" },
  "Месни изделия": { icon: <GiMeat size={22} />, path: "/salty" },
  "БИО": { icon: <FaLeaf size={22} />, path: "/bio" },
  "Основни продукти": { icon: <FaBowlRice size={22} />, path: "/basic" }
};

function CategoryItem({ category, navigate, onClose, isLastCategory, categoryIndex, totalCategories }) {
  const [hoveredSubcategories, setHoveredSubcategories] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [categoryPosition, setCategoryPosition] = useState({ x: 0, y: 0 });
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const categoryRef = useRef(null);
  
  // Проверяваме дали тази категория трябва да разпъва подкатегориите нагоре
  const shouldExpandUpward = totalCategories - categoryIndex <= 4; // последните 4 категории

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

  const handleMainClick = () => {
    navigate(category.path);
    onClose();
  };

  const handleSubcategoryClick = (subcategoryName) => {
    navigate(`/category/${encodeURIComponent(subcategoryName)}`);
    onClose();
  };


  const handleCategoryHover = (e) => {
    if (category.subcategories?.length > 0 && !isMobile) {
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      
      const rect = e.currentTarget.getBoundingClientRect();
      // Позиционираме dropdown-а спрямо стрелката
      setCategoryPosition({
        x: rect.right + 8,
        y: shouldExpandUpward ? rect.bottom - 10 : rect.top - 10 // за upward разпъване позиционираме от дъното
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

  const handleCategoryClick = () => {
    // На мобилно винаги отиваме в категорията
    handleMainClick();
  };

  const handleArrowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMobile && category.subcategories?.length > 0) {
      const newState = !hoveredSubcategories;
      setHoveredSubcategories(newState);
      
      
      // Auto-scroll само за категории които разпъват надолу
      if (newState && !shouldExpandUpward && isLastCategory) {
        setTimeout(() => {
          // Търсим drawer body контейнера
          const selectors = [
            '.mantine-Drawer-body',
            '[data-mantine-component="Drawer"] .mantine-Drawer-body',
            '.mantine-Stack-root',
            '[role="dialog"] [data-mantine-scrollarea]'
          ];
          
          let drawerBody = null;
          for (const selector of selectors) {
            drawerBody = document.querySelector(selector);
            if (drawerBody) break;
          }
          
          if (drawerBody) {
            // Скролваме до края само за последната категория която разпъва надолу
            drawerBody.scrollTo({
              top: drawerBody.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 250);
      }
    }
  };

  return (
    <Box
      ref={categoryRef}
      style={{ 
        position: "relative",
        zIndex: hoveredSubcategories ? 1001 : 1
      }}
    >
      {/* Главна категория */}
      <Box
        onClick={handleCategoryClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderRadius: 12,
          backgroundColor: "#ffffff",
          border: "1px solid #f0f0f0",
          cursor: "pointer",
          transition: "all 0.3s ease",
          fontWeight: 500,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          position: "relative",
          ":hover": {
            backgroundColor: "#f8f9fa",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {category.icon}
        <Text 
          style={{ 
            flex: 1, 
            fontSize: "16px",
            color: "#2c2e33"
          }}
        >
          {category.label}
        </Text>
        
        {/* Стрелка вдясно за категории с подкатегории */}
        {category.subcategories && category.subcategories.length > 0 && (
          <>
            <Badge 
              size="sm" 
              color="blue" 
              variant="light"
              style={{
                fontSize: "11px",
                fontWeight: 600
              }}
            >
              {category.subcategories.length}
            </Badge>
            <Box
              onClick={handleArrowClick}
              onMouseEnter={(e) => !isMobile && handleCategoryHover(e)}
              onMouseLeave={() => !isMobile && handleCategoryLeave()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "6px",
                backgroundColor: hoveredSubcategories ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                minWidth: "36px",
                minHeight: "36px"
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <IconChevronRight 
                size={20} 
                style={{ 
                  color: "#495057",
                  transition: "transform 0.2s ease",
                  transform: hoveredSubcategories ? "rotate(90deg)" : "rotate(0deg)"
                }} 
              />
            </Box>
          </>
        )}
      </Box>

      {/* Overlay меню за подкатегории */}
      {category.subcategories && category.subcategories.length > 0 && hoveredSubcategories && (
        isMobile ? (
          <Box
            style={{
              position: "absolute",
              left: "0",
              top: shouldExpandUpward ? "auto" : "100%",
              bottom: shouldExpandUpward ? "100%" : "auto",
              marginTop: shouldExpandUpward ? "0" : "8px",
              marginBottom: shouldExpandUpward ? "8px" : "0",
              backgroundColor: "#ffffff",
              border: "1px solid #e9ecef",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              padding: "8px",
              minWidth: "100%",
              width: "calc(100% - 16px)",
              maxHeight: "40vh", // Ограничаваме височината
              overflowY: "auto", // Добавяме scroll
              WebkitOverflowScrolling: "touch", // Smooth scroll на iOS
              zIndex: 999999,
              animation: shouldExpandUpward ? "slideInUp 0.2s ease-out" : "slideInDown 0.2s ease-out",
              transform: "translateX(0)",
              opacity: 1,
              pointerEvents: "auto"
            }}
          >
            <Stack spacing={2}>
              {category.subcategories.slice(0, 50).map((subcategory) => ( // Ограничаваме до 50 подкатегории
                <Box
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory.Name)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontSize: "14px",
                    fontWeight: 400,
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
              {category.subcategories.length > 50 && (
                <Box
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#868e96",
                    fontStyle: "italic"
                  }}
                >
                  ... и още {category.subcategories.length - 50}
                </Box>
              )}
            </Stack>
          </Box>
        ) : (
          <Portal>
            <Box
              style={{
                position: "fixed",
                left: `${categoryPosition.x}px`,
                top: shouldExpandUpward ? "auto" : `${categoryPosition.y}px`,
                bottom: shouldExpandUpward ? `calc(100vh - ${categoryPosition.y}px)` : "auto",
                backgroundColor: "#ffffff",
                border: "1px solid #e9ecef",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                padding: "8px",
                minWidth: "200px",
                maxWidth: "300px",
                maxHeight: "60vh", // Ограничаваме височината
                overflowY: "auto", // Добавяме scroll
                zIndex: 999999,
                animation: shouldExpandUpward ? "slideInUp 0.2s ease-out" : "slideInRight 0.2s ease-out",
                transform: "translateX(0)",
                opacity: 1,
                pointerEvents: "auto"
              }}
              onMouseEnter={handleOverlayEnter}
              onMouseLeave={handleOverlayLeave}
            >
              <Stack spacing={2}>
                {category.subcategories.slice(0, 50).map((subcategory) => ( // Ограничаваме до 50
                  <Box
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory.Name)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontSize: "14px",
                      fontWeight: 400,
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
                {category.subcategories.length > 50 && (
                  <Box
                    style={{
                      padding: "8px 12px",
                      textAlign: "center",
                      fontSize: "12px",
                      color: "#868e96",
                      fontStyle: "italic"
                    }}
                  >
                    ... и още {category.subcategories.length - 50}
                  </Box>
                )}
              </Stack>
            </Box>
          </Portal>
        )
      )}

      {/* CSS Анимации */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
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
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
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

export function CategoryDrawer({ opened, onClose }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(staticCategories);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      padding="lg"
      withinPortal={false}
      overlayProps={{ opacity: 0.15 }}
      styles={{ 
        title: { 
          fontSize: 24, 
          fontWeight: 700,
          color: "#2c2e33",
          marginBottom: "20px"
        },
        content: {
          backgroundColor: "#fafafa"
        },
        body: {
          overflowY: "auto",
          maxHeight: "calc(100vh - 100px)",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
          paddingBottom: isMobile ? "2.5rem" : "1rem", // Различен padding за mobile/desktop
          minHeight: "auto"
        },
        inner: {
          zIndex: 1000
        }
      }}
    >
      <Box style={{ paddingBottom: isMobile ? "1.5rem" : "0.5rem" }}>
        <Stack spacing={12}>
          {loading && (
            <Text 
              size="sm" 
              c="dimmed" 
              ta="center"
              style={{ 
                padding: "20px",
                fontStyle: "italic"
              }}
            >
              Актуализираме менюто...
            </Text>
          )}
          {categories.map((cat, index) => (
            <CategoryItem
              key={cat.id || cat.label}
              category={cat}
              navigate={navigate}
              onClose={onClose}
              isLastCategory={index === categories.length - 1}
              categoryIndex={index}
              totalCategories={categories.length}
            />
          ))}
        </Stack>
      </Box>
    </Drawer>
  );
}