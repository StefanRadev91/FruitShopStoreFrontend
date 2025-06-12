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
    <>
      <Flex
        justify="center"
        wrap="nowrap"
        gap="xl"
        mt="xl"
        px="md"
        style={{ overflowX: "auto" }}
      >
        {banners.map((banner, i) => (
          <Box
            key={i}
            onClick={() => navigate("/delivery")}
            style={{
              position: "relative",
              minWidth: 600,
              height: 120,
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
                top: 8,
                left: 8,
                right: 8,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                padding: "4px 12px",
                borderRadius: 4,
              }}
            >
              <Text
                color="white"
                weight={600}
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
    </>
  );
}