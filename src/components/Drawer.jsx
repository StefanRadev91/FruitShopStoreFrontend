import { Drawer, Box, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  FaCarrot,
  FaFish,
  FaCheese,
  FaLeaf,
  FaCandyCane,
  FaGlassWhiskey,
  FaAppleAlt
} from "react-icons/fa";
import {
  GiSaltShaker,
  GiPeanut,
  GiMeat,
  GiChiliPepper
} from "react-icons/gi";

const categories = [
  { label: "Плодове", path: "/fruits", icon: <FaAppleAlt size={22} /> },
  { label: "Зеленчуци", path: "/vegetables", icon: <FaCarrot size={22} /> },
  { label: "Лют Свят", path: "/dairy", icon: <GiChiliPepper size={22} /> },
  { label: "Напитки", path: "/drinks", icon: <FaGlassWhiskey size={22} /> },
  { label: "Сладко", path: "/sweet", icon: <FaCandyCane size={22} /> },
  { label: "Подправки", path: "/spices", icon: <GiSaltShaker size={22} /> },
  { label: "Рибни", path: "/fish", icon: <FaFish size={22} /> },
  { label: "Ядки", path: "/nuts", icon: <GiPeanut size={22} /> },
  { label: "Месни изделия", path: "/salty", icon: <GiMeat size={22} /> },
  { label: "БИО", path: "/bio", icon: <FaLeaf size={22} /> },
];

export function CategoryDrawer({ opened, onClose }) {
  const navigate = useNavigate();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Асортимент"
      size="sm"
      padding="md"
      withinPortal={false}
      lockScroll
      overlayProps={{ opacity: 0.1 }}
      styles={{
        title: { fontSize: 22, fontWeight: 600 },
      }}
    >
      <Stack gap={10}>
        {categories.map((cat) => (
          <Box
            key={cat.label}
            onClick={() => {
              navigate(cat.path);
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 8,
              backgroundColor: "#f9f9f9",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: 500,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {cat.icon}
            {cat.label}
          </Box>
        ))}
      </Stack>
    </Drawer>
  );
}