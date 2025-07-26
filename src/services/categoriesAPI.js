// ===== 1. src/services/categoriesApi.js =====
const BASE_URL = "https://fruitshopstore.onrender.com/api";

// Вземи всички категории с техните подкатегории
export async function getAllCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories?populate=*`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Грешка при зареждане на категории:", error);
    return [];
  }
}

// Вземи само главните категории (без parent)
export async function getMainCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories?filters[parent][$null]=true&populate=*`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Грешка при зареждане на главни категории:", error);
    return [];
  }
}

// ⭐ НОВА ФУНКЦИЯ - Вземи главни категории с кеширане
export async function getMainCategoriesWithCache() {
  const cached = sessionStorage.getItem("main_categories");
  if (cached) {
    console.log("📋 Използвам кеширани главни категории");
    return JSON.parse(cached);
  }
  
  console.log("🔄 Зареждам главни категории от API...");
  const categories = await getMainCategories();
  sessionStorage.setItem("main_categories", JSON.stringify(categories));
  return categories;
}

// Вземи подкатегориите на дадена главна категория
export async function getSubcategories(parentCategoryName) {
  try {
    const response = await fetch(`${BASE_URL}/categories?filters[parent][Name][$eq]=${encodeURIComponent(parentCategoryName)}&populate=*`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Грешка при зареждане на подкатегории за ${parentCategoryName}:`, error);
    return [];
  }
}

// Вземи продукти по категория (работи и за главни, и за подкатегории)
export async function getProductsByCategory(categoryName) {
  try {
    const response = await fetch(`${BASE_URL}/products?filters[category][Name][$eq]=${encodeURIComponent(categoryName)}&populate=*`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Грешка при зареждане на продукти за категория ${categoryName}:`, error);
    return [];
  }
}

// Помощна функция за построяване на йерархичната структура
export function buildCategoryTree(categories) {
  const tree = {};
  // Първо намираме всички главни категории
  categories.forEach(category => {
    if (!category.parent) {
      tree[category.Name] = {
        ...category,
        subcategories: category.subcategories || []
      };
    }
  });
  return tree;
}

// Функция за намиране на пътя до категория (breadcrumbs)
export function getCategoryPath(categoryName, allCategories) {
  const category = allCategories.find(cat => cat.Name === categoryName);
  if (!category) return [categoryName];
  if (!category.parent) {
    return [category.Name];
  }
  return [category.parent.Name, category.Name];
}

// Проверка дали категория има подкатегории
export function hasSubcategories(categoryName, allCategories) {
  const category = allCategories.find(cat => cat.Name === categoryName);
  return category?.subcategories?.length > 0;
}