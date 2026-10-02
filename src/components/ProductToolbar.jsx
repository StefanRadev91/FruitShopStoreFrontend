import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Group, Select, Switch, Text } from "@mantine/core";
import { unitPriceBGN } from "../services/cart";

const SORT_OPTIONS = [
  { value: "az", label: "Азбучно (А–Я)" },
  { value: "price-asc", label: "Цена: възходящо" },
  { value: "price-desc", label: "Цена: низходящо" },
  { value: "promo", label: "Първо промоциите" },
];

const nameCompare = (a, b) => a.name.localeCompare(b.name, "bg", { sensitivity: "base" });
const priceOf = (p) => {
  const v = unitPriceBGN(p);
  return v > 0 ? v : Infinity; // продуктите без цена отиват най-накрая
};
const hasPromo = (p) => Number.isFinite(parseFloat(p.promo_price)) && parseFloat(p.promo_price) > 0;

export function sortProducts(list, mode) {
  const sorted = [...list];
  if (mode === "price-asc") sorted.sort((a, b) => priceOf(a) - priceOf(b) || nameCompare(a, b));
  else if (mode === "price-desc") sorted.sort((a, b) => (priceOf(b) === Infinity ? -1 : priceOf(a) === Infinity ? 1 : priceOf(b) - priceOf(a)) || nameCompare(a, b));
  else if (mode === "promo") sorted.sort((a, b) => Number(hasPromo(b)) - Number(hasPromo(a)) || nameCompare(a, b));
  else sorted.sort(nameCompare);
  return sorted;
}

// Сортиране/филтър, запазени в адреса (?sort=...&promo=1) – могат да се споделят и работят с "Назад".
export function useProductView(products) {
  const [params, setParams] = useSearchParams();
  const sort = SORT_OPTIONS.some((o) => o.value === params.get("sort")) ? params.get("sort") : "az";
  const promoOnly = params.get("promo") === "1";

  const visible = useMemo(() => {
    const filtered = promoOnly ? products.filter(hasPromo) : products;
    return sortProducts(filtered, sort);
  }, [products, sort, promoOnly]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  return {
    visible,
    total: products.length,
    hasPromos: products.some(hasPromo),
    sort,
    promoOnly,
    setSort: (value) => update({ sort: value === "az" ? null : value }),
    setPromoOnly: (on) => update({ promo: on ? "1" : null }),
  };
}

export function ProductToolbar({ view }) {
  const { visible, total, hasPromos, sort, promoOnly, setSort, setPromoOnly } = view;
  return (
    <Group justify="space-between" align="center" mb="lg" gap="sm">
      <Text size="sm" c="dimmed">
        {visible.length === total ? `${total} продукта` : `${visible.length} от ${total} продукта`}
      </Text>
      <Group gap="md" wrap="wrap">
        {(hasPromos || promoOnly) && (
          <Switch
            label="Само промо"
            color="red"
            checked={promoOnly}
            onChange={(e) => setPromoOnly(e.currentTarget.checked)}
          />
        )}
        <Select
          aria-label="Сортиране"
          data={SORT_OPTIONS}
          value={sort}
          onChange={(v) => v && setSort(v)}
          allowDeselect={false}
          size="sm"
          w={190}
        />
      </Group>
    </Group>
  );
}
