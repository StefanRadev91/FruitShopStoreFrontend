import { Box, Flex, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import officeImg from "../assets/office.webp";
import restaurantImg from "../assets/restorant.webp";

export function DeliveryBanners() {
  const navigate = useNavigate();

  const banners = [
    {
      image: officeImg,
      label: "Поръчай за дома или офиса",
      width: 560,
      height: 560,
      link: "/delivery",
    },
    {
      image: restaurantImg,
      label: "Поръчай за ресторант или търговски обект",
      width: 640,
      height: 300,
      link: "/about",
    },
  ];

  return (
    <Flex
      justify="center"
      wrap="nowrap"
      gap="xl"
      mt="xl"
      px="md"
      style={{ overflow: "hidden" }}
    >
      {banners.map((banner, i) => (
        <Box
          key={i}
          onClick={() => navigate(banner.link)}
          style={{
            position: "relative",
            minWidth: "50%",
            height: "120px",
            borderRadius: 8,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.03)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src={banner.image}
            alt={banner.label}
            width={banner.width}
            height={banner.height}
            fetchPriority="high"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
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
  );
}