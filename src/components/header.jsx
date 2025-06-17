import {
  Group,
  Burger,
  ActionIcon,
  Box,
  Button,
  Tooltip,
} from "@mantine/core";
import { IconShoppingCart, IconHome, IconX } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { CategoryDrawer } from "./Drawer";
import { SearchInput } from "./SearchInput";

export function Header({ cart, onCartClick }) {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Горна оранжева лента с контакти и бутон за кеш */}
      <Box
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
          minHeight: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 16,
          paddingRight: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Ляво: Начало + Бургер + Search */}
        <Group spacing="xs" style={{ minWidth: 0, width: '33%' }}>
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
            backgroundColor: "#fff",
            zIndex: 1,
          }}
        >
          <img
            src={logo}
            alt="Дар от Земята"
            style={{
              height: "100%",
              maxHeight: "80px",
              display: "block",
            }}
          />
        </Box>

        {/* Дясно: За нас + Количка */}
        <Group spacing="xs" style={{width: '37%', display: 'flex', justifyContent: 'end'}}>
          <Button
            variant="subtle"
            color="dark"
            style={{
              padding: 0,
            }}
            onClick={() => navigate("/about")}
          >
              За нас
          </Button>

          <ActionIcon
            size="lg"
            color="green"
            variant="filled"
            style={{ position: "relative" }}
            onClick={onCartClick}
          >
            <IconShoppingCart size={24} />
            {cart.length > 0 && (
              <Box
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  background: "#ff4c1c",
                  borderRadius: "50%",
                  color: "#fff",
                  width: 20,
                  height: 20,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  border: "2px solid #fff",
                }}
              >
                {cart.reduce((s, i) => s + i.qty, 0)}
              </Box>
            )}
          </ActionIcon>
        </Group>

        {/* Search на мобилно – пада отдолу */}
        {isMobile && (
          <Box style={{ width: '100%', marginBottom: '16px'}}>
            <SearchInput />
          </Box>
        )}
      </Box>

      <CategoryDrawer opened={drawerOpened} onClose={closeDrawer} />
    </Box>
  );
}