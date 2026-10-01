// Главните категории с отделна страница (същите пътища като в App.jsx).
export const CATEGORY_ROUTES = {
  "Плодове": "/fruits",
  "Зеленчуци": "/vegetables",
  "Лют свят": "/dairy",
  "Напитки": "/drinks",
  "Сладко и Солено": "/sweet",
  "Кафе и Подправки": "/spices",
  "Рибни": "/fish",
  "Ядки": "/nuts",
  "Месни изделия": "/salty",
  "БИО": "/bio",
  "Основни продукти": "/basic",
};

// Адрес на страницата на категория (главна или подкатегория).
export function categoryPath(name) {
  return CATEGORY_ROUTES[name] || `/category/${encodeURIComponent(name)}`;
}
