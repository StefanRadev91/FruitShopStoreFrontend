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

// Главни категории: показваме веднага запазеното от предишно посещение (localStorage)
// и го опресняваме на заден план. Заявката е лека – само Name и подкатегориите им.
const MAIN_CATEGORIES_KEY = "main_categories_v2";
let mainCategoriesRequest = null;

export function getCachedMainCategories() {
  try {
    const raw = localStorage.getItem(MAIN_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function refreshMainCategories() {
  if (!mainCategoriesRequest) {
    mainCategoriesRequest = fetch(
      `${BASE_URL}/categories?filters[parent][$null]=true&fields[0]=Name&populate[subcategories][fields][0]=Name`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const categories = json.data || [];
        try {
          localStorage.setItem(MAIN_CATEGORIES_KEY, JSON.stringify(categories));
        } catch {
          /* ignore */
        }
        return categories;
      })
      .finally(() => {
        mainCategoriesRequest = null;
      });
  }
  return mainCategoriesRequest;
}

export async function getMainCategoriesWithCache() {
  const cached = getCachedMainCategories();
  if (cached) {
    refreshMainCategories().catch(() => {});
    return cached;
  }
  try {
    return await refreshMainCategories();
  } catch (error) {
    console.error("Грешка при зареждане на главни категории:", error);
    return [];
  }
}

// Започваме да теглим категориите още при старта на приложението.
getMainCategoriesWithCache();

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