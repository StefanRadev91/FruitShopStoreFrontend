import {
  Group,
  Burger,
  ActionIcon,
  Box,
  Button,
} from "@mantine/core";
import { IconShoppingCart, IconHome } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { CategoryDrawer } from "./Drawer"; // <-- Добави това
import { SearchInput } from "./SearchInput";

export function Header({ cart, onCartClick }) {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Контакти */}
      <Box
        style={{
          background: "#ff4c1c",
          color: "white",
          padding: "4px 0",
          textAlign: "center",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        За връзка: +359 886 282 323 | darotzemqta@abv.bg
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
        }}
      >
        {/* Ляво: Начало + Бургер */}
        <Group spacing="xs">
          <ActionIcon
            size="lg"
            color="gray"
            variant="light"
            onClick={() => navigate("/")}
          >
            <IconHome size={22} />
          </ActionIcon>

          <Burger opened={drawerOpened} onClick={openDrawer} size="md" />
          <SearchInput />
        </Group>

        {/* Център: ЛОГО */}
        <Box
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            padding: "4px",
            zIndex: 1,
          }}
        >
          <img
            src={logo}
            alt="Дар от Земята"
            style={{
              height: 80,
              display: "block",
            }}
          />
        </Box>

        {/* Дясно: За нас + Количка */}
        <Group spacing="xs">
          <Button
            variant="subtle"
            color="dark"
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
      </Box>

      {/* Drawer меню – вече твоя красив CategoryDrawer */}
      <CategoryDrawer opened={drawerOpened} onClose={closeDrawer} />
    </>
  );
}