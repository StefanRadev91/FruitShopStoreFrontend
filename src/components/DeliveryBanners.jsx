import { Box, Flex, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import officeImg from "../assets/office.png";
import restaurantImg from "../assets/restorant.jpg";

export function DeliveryBanners() {
  const navigate = useNavigate();

  const banners = [
    { image: officeImg, label: "Поръчай за дома или офиса" },
    { image: restaurantImg, label: "Поръчай за ресторант или търговски обект" },
  ];

  return (
    <Flex
      direction={{ base: "column", sm: "row" }} // Stack vertically on mobile, horizontally on larger screens
      justify="center"
      align="stretch"
      gap="xl"
      mt="xl"
      px="md"
      style={{ overflow: "hidden", width: "100%" }}
    >
      {banners.map((banner, i) => (
        <Box
          key={i}
          onClick={() => navigate("/delivery")}
          style={{
            position: "relative",
            minWidth: { base: "20%", sm: "50%" }, // Full width on mobile, 50% on larger screens
            width: "50%", // Ensure full width within container
            height: "120px",
            borderRadius: 8,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src={banner.image}
            alt={banner.label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Centered overlay text box */}
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)", // Center the text box vertically and horizontally
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              padding: "8px 16px", // Increased padding for better visibility
              borderRadius: 4,
              width: "80%", // Limit width to avoid stretching
              textAlign: "center",
            }}
          >
            <Text
              c="white"
              fw={600}
              size="sm"
              style={{
                whiteSpace: "normal",
                overflowWrap: "break-word",
                textAlign: "center",
              }}
            >
              {banner.label}
            </Text>
          </Box>
        </Box>
      ))}
    </Flex>
  );
}