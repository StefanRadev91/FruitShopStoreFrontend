import { useLayoutEffect, useRef, useState } from "react";
import {
  Group,
  Burger,
  ActionIcon,
  Box,
  Button,
  Tooltip,
} from "@mantine/core";
import { IconShoppingCart, IconHome, IconX, IconHeart } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp";
import { clearCatalogCache } from "../services/productsAPI";
import { clearCategoriesCache } from "../services/categoriesAPI";
import { CategoryDrawer } from "./Drawer";
import { SearchInput } from "./SearchInput";
import { useFavorites } from "../services/favorites";

// Значка с брой – стои извън бутона, защото ActionIcon скрива всичко, което излиза от рамката му.
function CountBadge({ value, color, max = 99 }) {
  if (!value) return null;
  return (
    <Box
      aria-hidden="true"
      style={{
        position: "absolute",
        top: -8,
        right: -8,
        background: color,
        borderRadius: 999,
        color: "#fff",
        minWidth: 22,
        height: 22,
        padding: "0 5px",
        fontSize: 13,
        fontWeight: 800,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        pointerEvents: "none",
      }}
    >
      {value > max ? `${max}+` : value}
    </Box>
  );
}

export function Header({ cart, onCartClick }) {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const { ids: favoriteIds } = useFavorites();

  // Горната лента се скролира навън, а белият хедър остава залепен най-горе.
  const barRef = useRef(null);
  const [barHeight, setBarHeight] = useState(30);
  useLayoutEffect(() => {
    setBarHeight(barRef.current?.offsetHeight || 0);
  }, [isMobile]);

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: -barHeight,
        zIndex: 100,
      }}
    >
      {/* Горна оранжева лента с контакти и бутон за кеш */}
      <Box
        ref={barRef}
        style={{
          background: "#ff4c1c",
          color: "white",
          padding: "4px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 500,
          position: "relative",
        }}
      >
        <span>За връзка: +359 886 282 323 | darotzemqta@abv.bg</span>

        <Box style={{ position: "absolute", right: 12 }}>
          <Tooltip label="Изчисти кеша">
            <ActionIcon
              onClick={() => {
                sessionStorage.clear();
                clearCatalogCache();
                clearCategoriesCache();
                window.location.reload();
              }}
              variant="transparent"
              color="white"
              size="lg"
            >
              <IconX size={20} />
            </ActionIcon>
          </Tooltip>
        </Box>
      </Box>

      {/* Хедър */}
      <Box
        style={{
          position: "relative",
          background: "#fff",
          borderBottom: "1px solid #e3e3e3",
          minHeight: isMobile ? 84 : 112,
          display: "flex",
          alignItems: "center",
          justifyContent: "stretch", // всички колони с еднаква ширина
          paddingLeft: 16,
          paddingRight: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Ляво: Начало + Бургер + Search */}
        <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <ActionIcon
            size="lg"
            color="gray"
            variant="light"
            onClick={() => navigate("/")}
          >
            <IconHome size={22} />
          </ActionIcon>

          <Burger opened={drawerOpened} onClick={openDrawer} size="md" />

          {!isMobile && <SearchInput />}
        </Group>

        {/* Център: Лого */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: "#fff",
            zIndex: 1,
          }}
        >
          <Link to="/" aria-label="Дар от Земята – начална страница" style={{ display: "block" }}>
            <img
              src={logo}
              alt="Дар от Земята"
              width={isMobile ? 76 : 100}
              height={isMobile ? 76 : 100}
              style={{ display: "block", objectFit: "contain" }}
            />
          </Link>
        </Box>

        {/* Дясно: За нас + Количка */}
        <Group
          gap={isMobile ? 8 : 10}
          wrap="nowrap"
          style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            variant="subtle"
            color="dark"
            style={{ padding: isMobile ? "0 4px" : 0, flexShrink: 0 }}
            size={isMobile ? "compact-sm" : "sm"}
            onClick={() => navigate("/idea")}
          >
            За нас
          </Button>

          {/* Значката е извън бутона, защото ActionIcon скрива всичко, което излиза от рамката му */}
          <Box style={{ position: "relative", flexShrink: 0 }}>
            <ActionIcon
              component={Link}
              to="/favorites"
              size="lg"
              color="red"
              variant="light"
              aria-label="Любими продукти"
            >
              <IconHeart size={22} />
            </ActionIcon>
            <CountBadge value={favoriteIds.length} color="#c92a2a" max={9} />
          </Box>

          <Box style={{ position: "relative", flexShrink: 0 }}>
            <ActionIcon
              size="lg"
              color="green"
              variant="filled"
              aria-label="Количка"
              onClick={onCartClick}
            >
              <IconShoppingCart size={24} />
            </ActionIcon>
            <CountBadge value={cart.reduce((sum, i) => sum + i.qty, 0)} color="#ff4c1c" />
          </Box>
        </Group>

        {/* Search на мобилно – пада отдолу */}
        {isMobile && (
          <Box style={{ width: '100%', marginBottom: '16px' }}>
            <SearchInput fullWidth />
          </Box>
        )}
      </Box>

      <CategoryDrawer opened={drawerOpened} onClose={closeDrawer} />
    </Box>
  );
}