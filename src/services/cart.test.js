import { describe, expect, it } from "vitest";
import {
  cartKey,
  getPrices,
  orderPrice,
  unitPriceBGN,
  summarizeCart,
  slimCartItem,
  loadCart,
  saveCart,
  refreshCartFromCatalog,
  loadCustomer,
  saveCustomer,
  clearCustomer,
  loadLastOrder,
  saveLastOrder,
  FREE_DELIVERY_OVER_BGN,
} from "./cart";
import { product } from "../test/utils";

const item = (over = {}) => ({ ...slimCartItem(product()), qty: 1, ...over });

describe("цени", () => {
  it("cartKey различава грамажите на един продукт", () => {
    expect(cartKey({ id: 1 })).toBe("1|");
    expect(cartKey({ id: 1, selectedWeight: { label: "500гр" } })).toBe("1|500гр");
  });

  it("getPrices връща редовна и промо цена", () => {
    expect(getPrices({ price: "3.00", promo_price: "2.50" })).toEqual({ original: 3, promo: 2.5 });
    expect(getPrices({ price: "3.00", promo_price: null })).toEqual({ original: 3, promo: null });
    expect(getPrices({ price: "3", promo_price: "abc" }).promo).toBeNull();
  });

  it("getPrices ползва цените на избрания грамаж", () => {
    const selectedWeight = { label: "1кг", price: 10, promo_price: 8 };
    expect(getPrices({ selectedWeight, price: "3" })).toEqual({ original: 10, promo: 8 });
  });

  it("orderPrice е промо цената, ако има такава (каквато клиентът е видял)", () => {
    expect(orderPrice({ price: "3.00", promo_price: "2.50" })).toBe(2.5);
    expect(orderPrice({ price: "3.00", promo_price: null })).toBe("3.00");
    expect(orderPrice({ selectedWeight: { price: 10, promo_price: null } })).toBe(10);
    expect(orderPrice({ selectedWeight: { price: 10, promo_price: 7 } })).toBe(7);
  });

  it("unitPriceBGN е 0 при невалидна цена", () => {
    expect(unitPriceBGN({ price: "3.50" })).toBe(3.5);
    expect(unitPriceBGN({ price: "няма" })).toBe(0);
    expect(unitPriceBGN({ price: undefined })).toBe(0);
  });
});

describe("summarizeCart", () => {
  it("празната количка няма доставка и прогрес", () => {
    const s = summarizeCart([]);
    expect(s).toMatchObject({ count: 0, deliveryEUR: 0, totalEUR: 0, freeDelivery: false, remainingEUR: 0, progress: 0 });
  });

  it("под прага добавя такса за доставка", () => {
    const s = summarizeCart([item({ price: "10", qty: 2 })]); // 20 лв.
    expect(s.freeDelivery).toBe(false);
    expect(s.count).toBe(2);
    expect(s.deliveryEUR).toBeGreaterThan(0);
    expect(s.totalEUR).toBeCloseTo(s.subtotalEUR + s.deliveryEUR, 5);
    expect(s.progress).toBeCloseTo(50, 5);
    expect(s.remainingEUR).toBeGreaterThan(0);
  });

  it('"над 40 лв." е строго: при точно 40 лв. доставката не е безплатна', () => {
    const s = summarizeCart([item({ price: String(FREE_DELIVERY_OVER_BGN), qty: 1 })]);
    expect(s.freeDelivery).toBe(false);
    expect(s.remainingEUR).toBeGreaterThanOrEqual(0.01);
    expect(s.progress).toBe(100);
  });

  it("над прага доставката е безплатна", () => {
    const s = summarizeCart([item({ price: "41", qty: 1 })]);
    expect(s.freeDelivery).toBe(true);
    expect(s.deliveryEUR).toBe(0);
    expect(s.remainingEUR).toBe(0);
  });

  it("ползва промо цената в сумата", () => {
    const withPromo = summarizeCart([item({ price: "10", promo_price: "5", qty: 1 })]);
    const without = summarizeCart([item({ price: "10", promo_price: null, qty: 1 })]);
    expect(withPromo.subtotalEUR).toBeLessThan(without.subtotalEUR);
  });
});

describe("запазване в браузъра", () => {
  it("slimCartItem пази само нужното", () => {
    const slim = slimCartItem(
      product({ product_description: "много дълго описание", image: [{ url: "/a.png", extra: 1 }] }),
      3
    );
    expect(slim).not.toHaveProperty("product_description");
    expect(slim.image).toEqual([{ url: "/a.png" }]);
    expect(slim.qty).toBe(3);
    expect(slim.category).toEqual({ Name: "Плодове" });
  });

  it("saveCart/loadCart кръгов ход", () => {
    const cart = [item({ qty: 2 })];
    saveCart(cart);
    expect(loadCart()).toEqual(cart);
  });

  it("празна количка се изтрива от storage", () => {
    saveCart([item()]);
    saveCart([]);
    expect(localStorage.getItem("cart_v1")).toBeNull();
  });

  it("loadCart отхвърля повредени редове и повреден JSON", () => {
    localStorage.setItem(
      "cart_v1",
      JSON.stringify([item(), { id: null, name: "x", qty: 1 }, { id: 2, name: "y", qty: 0 }, { id: 3, name: "z", qty: "1" }, null])
    );
    expect(loadCart()).toHaveLength(1);
    localStorage.setItem("cart_v1", "{не е json");
    expect(loadCart()).toEqual([]);
    localStorage.setItem("cart_v1", JSON.stringify({ not: "array" }));
    expect(loadCart()).toEqual([]);
  });

  it("клиентските данни се запомнят и забравят", () => {
    expect(loadCustomer()).toBeNull();
    saveCustomer({ name: "Иван", phone: "0888", address: "ул. 1", email: "a@b.bg", notes: "не се пази" });
    expect(loadCustomer()).toEqual({ name: "Иван", phone: "0888", address: "ул. 1", email: "a@b.bg" });
    clearCustomer();
    expect(loadCustomer()).toBeNull();
  });

  it("последната поръчка се пази", () => {
    expect(loadLastOrder()).toEqual([]);
    saveLastOrder([item({ qty: 4 })]);
    expect(loadLastOrder()[0].qty).toBe(4);
  });
});

describe("refreshCartFromCatalog", () => {
  it("освежава цената и името от каталога, запазва количеството", () => {
    const cart = [item({ id: 1, price: "3.00", qty: 5 })];
    const catalog = [product({ id: 1, name: "Нова ябълка", price: "4.00" })];
    const [fresh] = refreshCartFromCatalog(cart, catalog);
    expect(fresh).toMatchObject({ name: "Нова ябълка", price: "4.00", qty: 5 });
  });

  it("запазва продукт, който вече не е в каталога", () => {
    const cart = [item({ id: 99 })];
    expect(refreshCartFromCatalog(cart, [product({ id: 1 })])).toEqual(cart);
  });

  it("освежава цената на избрания грамаж", () => {
    const cart = [item({ id: 1, selectedWeight: { label: "1кг", price: 10, promo_price: null }, qty: 1 })];
    const catalog = [product({ id: 1, weight_variants: [{ label: "1кг", price: 12, promo_price: 9 }] })];
    expect(refreshCartFromCatalog(cart, catalog)[0].selectedWeight).toMatchObject({ price: 12, promo_price: 9 });
  });

  it("връща същата количка при празен каталог", () => {
    const cart = [item()];
    expect(refreshCartFromCatalog(cart, [])).toBe(cart);
  });
});
