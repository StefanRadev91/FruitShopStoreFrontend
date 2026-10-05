// Страниците "Виж всички" зад слайдерите на началната (ключът е същият като variant на слайдера).
export const COLLECTIONS = {
  promo: {
    path: "/promo",
    title: "Промо продукти",
    description: "Всички продукти на специална цена – докато трае промоцията.",
    filter: (p) => p.promo === true,
  },
  new: {
    path: "/new",
    title: "Най-нови продукти",
    description: "Последните попълнения в нашия асортимент.",
    filter: (p) => p.new_product === true,
  },
  best: {
    path: "/bestsellers",
    title: "Най-продавани",
    description: "Любимите продукти на нашите клиенти.",
    filter: (p) => p.featured === true,
  },
};
