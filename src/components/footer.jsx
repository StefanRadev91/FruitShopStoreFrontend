import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Box, Flex, Text, Group } from "@mantine/core";

export default function Footer() {
  return (
    <Box
      component="footer"
      style={{
        background: "#202f10",
        color: "white",
        padding: "12px 0",
        fontFamily: "inherit",
        width: "100%",
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {/* Иконки най-вляво */}
        <Group gap={8}>
          <a
            href="https://www.facebook.com/profile.php?id=61576940663187"
            style={iconLinkStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF size={18} />
          </a>
          <a
            href="https://www.instagram.com/your-page"
            style={iconLinkStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={18} />
          </a>
        </Group>

        {/* Центриран текст */}
        <Box style={{ flex: 1, textAlign: "center", position: "absolute", left: 0, right: 0, margin: "0 auto", pointerEvents: "none" }}>
          <Text size="sm" style={{ color: "white", fontWeight: 400 }}>
            Всички права запазени &copy; 2025 "ДАР ОТ ЗЕМЯТА"
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

const iconLinkStyle = {
  margin: "0 4px",
  color: "white",
  border: "1.5px solid white",
  borderRadius: "50%",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.15rem",
  transition: "background .2s, color .2s",
  textDecoration: "none",
  zIndex: 1,
};