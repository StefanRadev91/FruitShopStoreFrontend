import { toEUR } from "../components/PriceDisplay";

// Един и същ продукт с различен грамаж е отделен ред в количката.
export function cartKey(item) {
  return `${item.id}|${item.selectedWeight?.label ?? ""}`;
}

// Цената за реда в поръчката – същата, която клиентът вижда в количката (промо, ако има).
export function orderPrice(item) {
  if (item.selectedWeight) {
    return item.selectedWeight.promo_price ?? item.selectedWeight.price;
  }
  const promo = item.promo_price ? parseFloat(item.promo_price) : NaN;
  return Number.isFinite(promo) ? promo : item.price;
}

// Единична цена в лева (промо, ако има). Цените в базата са в лева.
export function unitPriceBGN(item) {
  const raw = parseFloat(orderPrice(item));
  return Number.isFinite(raw) ? raw : 0;
}

// Правила за доставка (както на страницата "Доставка"): над 40 лв. – безплатна, иначе 5 лв.
export const FREE_DELIVERY_OVER_BGN = 40;
export const DELIVERY_FEE_BGN = 5;

// Всички суми за количката на едно място (в евро, закръглени до цент по редове).
export function summarizeCart(cart) {
  const subtotalBGN = cart.reduce((sum, item) => sum + unitPriceBGN(item) * item.qty, 0);
  const subtotalEUR = cart.reduce((sum, item) => sum + toEUR(unitPriceBGN(item)) * item.qty, 0);
  const isEmpty = cart.length === 0;
  const freeDelivery = !isEmpty && subtotalBGN > FREE_DELIVERY_OVER_BGN;
  const deliveryEUR = isEmpty || freeDelivery ? 0 : toEUR(DELIVERY_FEE_BGN);
  const totalEUR = subtotalEUR + deliveryEUR;
  const remainingEUR = freeDelivery || isEmpty ? 0 : toEUR(FREE_DELIVERY_OVER_BGN - subtotalBGN);
  const progress = isEmpty ? 0 : Math.min(100, (subtotalBGN / FREE_DELIVERY_OVER_BGN) * 100);
  return {
    count: cart.reduce((s, i) => s + i.qty, 0),
    subtotalEUR,
    deliveryEUR,
    totalEUR,
    freeDelivery,
    remainingEUR,
    progress,
    freeOverEUR: toEUR(FREE_DELIVERY_OVER_BGN),
  };
}

// --- Запазване в браузъра (localStorage) ---

const CART_KEY = "cart_v1";
const CUSTOMER_KEY = "customer_v1";
const LAST_ORDER_KEY = "last_order_v1";

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* пълен/забранен storage – не е критично */
  }
}

// В количката пазим само нужното (без дългите описания).
export function slimCartItem(product, qty = 1) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    promo_price: product.promo_price ?? null,
    image: product.image?.[0] ? [{ url: product.image[0].url }] : [],
    category: product.category?.Name ? { Name: product.category.Name } : null,
    selectedWeight: product.selectedWeight ?? null,
    qty,
  };
}

export function loadCart() {
  const saved = read(CART_KEY);
  if (!Array.isArray(saved)) return [];
  return saved.filter((i) => i && i.id != null && i.name && Number.isFinite(i.qty) && i.qty > 0);
}

export function saveCart(cart) {
  write(CART_KEY, cart.length ? cart : null);
}

// Освежава цените/имената в количката от актуалния каталог (запазената количка може да е стара).
export function refreshCartFromCatalog(cart, catalog) {
  if (!cart.length || !catalog.length) return cart;
  const byId = new Map(catalog.map((p) => [p.id, p]));
  return cart.map((item) => {
    const fresh = byId.get(item.id);
    if (!fresh) return item;
    const selectedWeight = item.selectedWeight
      ? fresh.weight_variants?.find((v) => v.label === item.selectedWeight.label) ?? item.selectedWeight
      : null;
    return { ...slimCartItem({ ...fresh, selectedWeight }, item.qty) };
  });
}

export function loadCustomer() {
  const c = read(CUSTOMER_KEY);
  return c && typeof c === "object"
    ? { name: c.name || "", phone: c.phone || "", address: c.address || "", email: c.email || "" }
    : null;
}

export function saveCustomer(customer) {
  write(CUSTOMER_KEY, { name: customer.name, phone: customer.phone, address: customer.address, email: customer.email });
}

export function clearCustomer() {
  write(CUSTOMER_KEY, null);
}

export function loadLastOrder() {
  const items = read(LAST_ORDER_KEY);
  return Array.isArray(items) ? items : [];
}

export function saveLastOrder(items) {
  write(LAST_ORDER_KEY, items.map((i) => slimCartItem(i, i.qty)));
}
