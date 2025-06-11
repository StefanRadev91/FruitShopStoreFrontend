import { Box, Text, Flex, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconBuildingSkyscraper, IconChefHat } from "@tabler/icons-react";

export function DeliveryBanners() {
  const navigate = useNavigate();

  const banners = [
    {
      label: "Поръчайте за Дома и Офиса",
      icon: (
        <IconBuildingSkyscraper
          size={36}
          color="#2b2b2b"
          className="icon-pulse"
        />
      ),
    },
    {
      label: "Поръчайте за вашия ресторант или търговски обект",
      icon: (
        <IconChefHat
          size={36}
          color="#2b2b2b"
          className="icon-pulse"
          style={{ position: "relative", top: 4 }}
        />
      ),
    },
  ];

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.85; }
            100% { transform: scale(1); opacity: 1; }
          }

          .icon-pulse {
            animation: pulse 2.5s infinite ease-in-out;
          }
        `}
      </style>

      <Flex justify="center" wrap="wrap" gap="xl" mt="xl" px="md">
        {banners.map((banner, i) => (
          <Box
            key={i}
            onClick={() => navigate("/delivery")}
            style={{
              width: 245,
              height: 120,
              borderRadius: 8,
              background: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 12px",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Stack spacing={8} align="center">
              {banner.icon}
              <Text fw={600} size="md" style={{ color: "#2b2b2b" }}>
                {banner.label}
              </Text>
            </Stack>
          </Box>
        ))}
      </Flex>
    </>
  );
}