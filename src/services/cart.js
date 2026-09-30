// Един и същ продукт с различен грамаж е отделен ред в количката.
export function cartKey(item) {
  return `${item.id}|${item.selectedWeight?.label ?? ""}`;
}
