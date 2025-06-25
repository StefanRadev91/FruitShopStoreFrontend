import { Box, Flex } from "@mantine/core";
import { Link } from "react-router-dom";

import fresh from "../assets/icons-01.svg";
import time from "../assets/icons-02.svg";
import easy from "../assets/icons-03.svg";
import variety from "../assets/icons-04.svg";

// Определяме към къде води всяка икона
const banners = [
  { src: fresh, link: "/idea" },
  { src: time, link: "/delivery" },
  { src: easy, link: "/delivery" },
  { src: variety, link: "/idea" },
];

export function FeatureBanners() {
  return (
    <Flex justify="center" wrap="wrap" gap="xl" my="xl" px="md">
      {banners.map((banner, index) => (
        <Link
          to={banner.link}
          key={index}
          onClick={() => window.scrollTo({ top: 0 })}
        >
          <Box
            style={{
              minWidth: "245px",
              height: 120,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <img
              src={banner.src}
              alt={`feature-${index}`}
              style={{
                width: "115%",
                height: "auto",
                objectFit: "contain",
                padding: 10,
              }}
            />
          </Box>
        </Link>
      ))}
    </Flex>
  );
}