import { useState } from "react";
import { Container, Box } from "@mantine/core";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";

import { Header } from "./components/header";
import { CartDrawer } from "./components/CartDrawer";
import { HomePage } from "./pages/HomePage";
import { CategoryPage } from "./pages/CategoryPage";
import AboutPage from "./pages/AboutPage";
import Footer from "./components/footer";
import { ProductPage } from "./pages/ProductPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import DeliveryPage from "./pages/DeliveryPage";
import TermsPage from "./pages/TermsPage";
import IdeaPage from "./pages/IdeaPage";
import CookiesPage from "./pages/CookiesPage";

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpened, setCartOpened] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
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

  function handleAddToCart(product) {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  }

  function handleRemoveFromCart(productId) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }

  function handleChangeQty(productId, diff) {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, qty: Math.max(1, item.qty + diff) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  const total = cart.reduce((sum, item) => {
    const num = parseFloat(
      String(item.selectedWeight?.price ?? item.price)
        .replace(/[^\d.]/g, "")
        .replace(",", ".")
    );
    return sum + num * item.qty;
  }, 0);

  function handleSubmitOrder(values) {
    setLoadingOrder(true);
    const order = {
      customerName: values.name,
      phone: values.phone,
      address: values.address,
      email: values.email,
      notes: values.notes,
      products: cart.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.selectedWeight?.price ?? item.price,
        weight: item.selectedWeight?.label ?? "оригинален грамаж",
      })),
    };

    fetch(`https://fruitshopstore.onrender.com/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: order }),
    })
      .then((res) => {
        setLoadingOrder(false);
        if (res.ok) {
          notifications.show({
            title: "Поръчката е изпратена!",
            message: "Ще се свържем с вас за потвърждение.",
            color: "green",
          });
          setCart([]);
          form.reset();
          setCartOpened(false);
        } else {
          throw new Error("HTTP error");
        }
      })
      .catch(() => {
        setLoadingOrder(false);
        notifications.show({
          title: "Грешка!",
          message: "Поръчката не беше изпратена. Моля, опитайте отново.",
          color: "red",
        });
      });
  }

  return (
    <BrowserRouter>
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(120deg, #e6ffe6 0%, #f9fcff 100%)",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <Header cart={cart} onCartClick={() => setCartOpened(true)} />

        <Container size="lg" py="xl" style={{ flex: 1 }}>
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
          </Routes>
        </Container>

        <CartDrawer
          cartOpened={cartOpened}
          onClose={() => setCartOpened(false)}
          cart={cart}
          handleChangeQty={handleChangeQty}
          handleRemoveFromCart={handleRemoveFromCart}
          handleSubmitOrder={handleSubmitOrder}
          loadingOrder={loadingOrder}
          form={form}
          total={total}
        />
      </Box>
      <Footer />
    </BrowserRouter>
  );
}

export default App;