import { useState, useEffect, lazy, Suspense } from "react";
import { Container, Box } from "@mantine/core";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useSimpleForm } from "./hooks/useSimpleForm";

import { Header } from "./components/header";
import {
  cartKey,
  orderPrice,
  slimCartItem,
  summarizeCart,
  loadCart,
  saveCart,
  refreshCartFromCatalog,
  loadCustomer,
  unitPriceBGN,
  saveCustomer,
  clearCustomer,
  saveLastOrder,
} from "./services/cart";
import { getCatalog } from "./services/productsAPI";
import { ErrorBoundary, LoadFailed } from "./components/ErrorBoundary";
import { useIdlePreload } from "./hooks/useIdlePreload";
import { lazyWithRetry } from "./lib/lazyWithRetry";
const { Component: CartDrawer, load: loadCartDrawer } = lazyWithRetry(() =>
  import("./components/CartDrawer").then((m) => ({ default: m.CartDrawer }))
);
import { HomePage } from "./pages/HomePage";
const CategoryPage = lazy(() => import("./pages/CategoryPage").then((m) => ({ default: m.CategoryPage })));
const AboutPage = lazy(() => import("./pages/AboutPage"));
import Footer from "./components/footer";
const ProductPage = lazy(() => import("./pages/ProductPage").then((m) => ({ default: m.ProductPage })));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage").then((m) => ({ default: m.SearchResultsPage })));
const DeliveryPage = lazy(() => import("./pages/DeliveryPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const IdeaPage = lazy(() => import("./pages/IdeaPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage").then((m) => ({ default: m.CollectionPage })));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));

const MAX_QTY = 99;
const eur = (n) => n.toFixed(2);

function App() {
  const [cart, setCart] = useState(loadCart);
  const [cartOpened, setCartOpened] = useState(false);
  // Количката е извън първоначалния bundle: зарежда се в свободно време или при първо отваряне.
  const cartReady = useIdlePreload(loadCartDrawer);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [savedCustomer, setSavedCustomer] = useState(loadCustomer);
  // Данните на клиента се запомнят само ако той го поиска (по подразбиране – ако вече го е искал).
  const [remember, setRemember] = useState(() => !!loadCustomer());

  const form = useSimpleForm({
    initialValues: {
      name: savedCustomer?.name || "",
      phone: savedCustomer?.phone || "",
      address: savedCustomer?.address || "",
      email: savedCustomer?.email || "",
      notes: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Въведете име и фамилия" : null),
      phone: (value) =>
        /^\d{8,15}$/.test(value.replace(/[\s+()-]/g, ""))
          ? null
          : "Въведете валиден телефон",
      address: (value) => (value.length < 4 ? "Въведете адрес" : null),
    },
  });

  // Количката се пази в браузъра, за да не се губи при презареждане.
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Запазената количка може да е стара – освежаваме цените и имената от актуалния каталог.
  // Само ако има запазена количка – на нов посетител каталогът не се тегли напразно още на старта.
  useEffect(() => {
    if (loadCart().length === 0) return;
    getCatalog()
      .then((catalog) => setCart((prev) => refreshCartFromCatalog(prev, catalog)))
      .catch(() => {});
  }, []);

  function handleAddToCart(product, qty = 1) {
    const add = Math.min(MAX_QTY, Math.max(1, Math.floor(qty) || 1));
    setConfirmation(null);
    setCart((prevCart) => {
      const existing = prevCart.find((item) => cartKey(item) === cartKey(product));
      if (existing) {
        return prevCart.map((item) =>
          cartKey(item) === cartKey(product)
            ? { ...item, qty: Math.min(MAX_QTY, item.qty + add) }
            : item
        );
      }
      return [...prevCart, slimCartItem(product, add)];
    });
  }

  // "Поръчай отново": добавя всички артикули от последната поръчка.
  function handleReorder(items) {
    items.forEach((item) => handleAddToCart(item, item.qty));
    setCartOpened(true);
  }

  function handleRemoveFromCart(productId) {
    setCart((prevCart) => prevCart.filter((item) => cartKey(item) !== productId));
  }

  function handleChangeQty(productId, diff) {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          cartKey(item) === productId
            ? { ...item, qty: Math.min(MAX_QTY, Math.max(1, item.qty + diff)) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function handleForgetCustomer() {
    clearCustomer();
    setSavedCustomer(null);
    setRemember(false);
    form.setValues({ name: "", phone: "", address: "", email: "", notes: "" });
  }

  async function handleSubmitOrder(values) {
    setLoadingOrder(true);

    // Запазената количка може да е стара: преди изпращане сверяваме цените и наличността с каталога.
    let items = cart;
    try {
      const catalog = await getCatalog();
      if (catalog.length > 0) {
        const ids = new Set(catalog.map((p) => p.id));
        const refreshed = refreshCartFromCatalog(cart, catalog);
        const unavailable = cart.filter((i) => !ids.has(i.id));
        const priceChanged = refreshed.filter((i, idx) => ids.has(i.id) && unitPriceBGN(i) !== unitPriceBGN(cart[idx]));
        if (unavailable.length > 0 || priceChanged.length > 0) {
          setCart(refreshed.filter((i) => ids.has(i.id)));
          notifications.show({
            title: "Количката е обновена",
            message: [
              unavailable.length > 0 ? "Някои продукти вече не са налични и бяха премахнати." : "",
              priceChanged.length > 0 ? "Цените на част от продуктите са променени." : "",
              "Прегледай количката и потвърди поръчката отново.",
            ]
              .filter(Boolean)
              .join(" "),
            color: "orange",
            autoClose: 8000,
          });
          setLoadingOrder(false);
          return;
        }
        items = refreshed;
      }
    } catch {
      /* няма връзка с каталога – продължаваме с текущата количка */
    }

    const summary = summarizeCart(items);
    // Сумите отиват в бележките, за да ги вижда и получателят на имейла (бекендът не се променя).
    const summaryNote = `[Продукти: ${eur(summary.subtotalEUR)} €; доставка: ${
      summary.freeDelivery ? "безплатна" : `${eur(summary.deliveryEUR)} €`
    }; общо: ${eur(summary.totalEUR)} €]`;

    const order = {
      customerName: values.name,
      phone: values.phone,
      address: values.address,
      email: values.email,
      notes: [values.notes?.trim(), summaryNote].filter(Boolean).join("\n\n"),
      products: items.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: orderPrice(item),
        weight: item.selectedWeight?.label ?? "оригинален грамаж",
      })),
    };

    try {
      const res = await fetch(`https://fruitshopstore.onrender.com/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: order }),
      });
      if (!res.ok) throw new Error("HTTP error");
      const json = await res.json().catch(() => null);

      const customer = { name: values.name, phone: values.phone, address: values.address, email: values.email };
      if (remember) {
        saveCustomer(customer);
        setSavedCustomer(customer);
      } else {
        clearCustomer();
        setSavedCustomer(null);
      }
      saveLastOrder(items);
      setConfirmation({
        id: json?.data?.id ?? null,
        items,
        summary,
        name: values.name,
        phone: values.phone,
      });
      setCart([]);
      form.setValues({ ...(remember ? customer : { name: "", phone: "", address: "", email: "" }), notes: "" });
    } catch {
      notifications.show({
        title: "Грешка!",
        message: "Поръчката не беше изпратена. Моля, опитайте отново.",
        color: "red",
      });
    } finally {
      setLoadingOrder(false);
    }
  }

  return (
    <BrowserRouter>
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(120deg, #e6ffe6 0%, #f9fcff 100%)",
          maxWidth: "100vw",
          overflowX: "clip", // "hidden" би счупило залепения хедър (sticky)
        }}
      >
        <Header cart={cart} onCartClick={() => setCartOpened(true)} />

        <Container component="main" size="lg" py="xl" style={{ flex: 1 }}>
          <ErrorBoundary fallback={<LoadFailed />}>
          <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomePage onAddToCart={handleAddToCart} />} />
            
            {/* Главни категории - стари routes */}
            <Route path="/fruits" element={<CategoryPage category="Плодове" onAddToCart={handleAddToCart} />} />
            <Route path="/vegetables" element={<CategoryPage category="Зеленчуци" onAddToCart={handleAddToCart} />} />
            <Route path="/dairy" element={<CategoryPage category="Лют свят" onAddToCart={handleAddToCart} />} />
            <Route path="/drinks" element={<CategoryPage category="Напитки" onAddToCart={handleAddToCart} />} />
            <Route path="/sweet" element={<CategoryPage category="Сладко и Солено" onAddToCart={handleAddToCart} />} />
            <Route path="/spices" element={<CategoryPage category="Кафе и Подправки" onAddToCart={handleAddToCart} />} />
            <Route path="/fish" element={<CategoryPage category="Рибни" onAddToCart={handleAddToCart} />} />
            <Route path="/nuts" element={<CategoryPage category="Ядки" onAddToCart={handleAddToCart} />} />
            <Route path="/salty" element={<CategoryPage category="Месни изделия" onAddToCart={handleAddToCart} />} />
            <Route path="/bio" element={<CategoryPage category="БИО" onAddToCart={handleAddToCart} />} />
            <Route path="/basic" element={<CategoryPage category="Основни продукти" onAddToCart={handleAddToCart} />} />
            
            {/* НОВ route за подкатегории */}
            <Route path="/category/:subcategory" element={<CategoryPage onAddToCart={handleAddToCart} />} />
            
            {/* Останали страници */}
            {/* "Виж всички" зад слайдерите на началната */}
            <Route path="/promo" element={<CollectionPage variant="promo" onAddToCart={handleAddToCart} />} />
            <Route path="/new" element={<CollectionPage variant="new" onAddToCart={handleAddToCart} />} />
            <Route path="/bestsellers" element={<CollectionPage variant="best" onAddToCart={handleAddToCart} />} />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/product/:slug" element={<ProductPage onAddToCart={handleAddToCart} />} />
            <Route path="/search" element={<SearchResultsPage onAddToCart={handleAddToCart} />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/idea" element={<IdeaPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/favorites" element={<FavoritesPage onAddToCart={handleAddToCart} onReorder={handleReorder} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </Container>

        {(cartReady || cartOpened) && (
        <ErrorBoundary fallback={<LoadFailed inline message="Не успяхме да заредим количката." />}>
        <Suspense fallback={null}>
        <CartDrawer
          cartOpened={cartOpened}
          onClose={() => {
            setCartOpened(false);
            setConfirmation(null);
          }}
          cart={cart}
          handleChangeQty={handleChangeQty}
          handleRemoveFromCart={handleRemoveFromCart}
          handleSubmitOrder={handleSubmitOrder}
          loadingOrder={loadingOrder}
          form={form}
          confirmation={confirmation}
          hasSavedCustomer={!!savedCustomer}
          remember={remember}
          onRememberChange={setRemember}
          onForgetCustomer={handleForgetCustomer}
        />
        </Suspense>
        </ErrorBoundary>
        )}
      </Box>
      <Footer />
    </BrowserRouter>
  );
}

export default App;