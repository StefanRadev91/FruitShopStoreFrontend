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
