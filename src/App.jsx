import { useState, useEffect, lazy, Suspense } from "react";
import { Container, Box } from "@mantine/core";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";

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
  saveCustomer,
  clearCustomer,
  saveLastOrder,
} from "./services/cart";
import { getCatalog } from "./services/productsAPI";
import { CartDrawer } from "./components/CartDrawer";
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
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));

const MAX_QTY = 99;
const eur = (n) => n.toFixed(2);

function App() {
  const [cart, setCart] = useState(loadCart);
  const [cartOpened, setCartOpened] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [savedCustomer, setSavedCustomer] = useState(loadCustomer);

  const form = useForm({
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
  useEffect(() => {
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
    form.setValues({ name: "", phone: "", address: "", email: "", notes: "" });
  }

  async function handleSubmitOrder(values) {
    setLoadingOrder(true);
    const summary = summarizeCart(cart);
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
      products: cart.map((item) => ({
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
      saveCustomer(customer);
      setSavedCustomer(customer);
      saveLastOrder(cart);
      setConfirmation({
        id: json?.data?.id ?? null,
        items: cart,
        summary,
        name: values.name,
        phone: values.phone,
      });
      setCart([]);
      form.setValues({ ...customer, notes: "" });
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

        <Container size="lg" py="xl" style={{ flex: 1 }}>
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
        </Container>

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
          onForgetCustomer={handleForgetCustomer}
        />
      </Box>
      <Footer />
    </BrowserRouter>
  );
}

export default App;