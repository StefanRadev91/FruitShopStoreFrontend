import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Box, Flex, Text, Group, Stack, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <Box
      component="footer"
      style={{
        background: "#202f10",
        color: "white",
        padding: "24px 0",
        fontFamily: "inherit",
        width: "100%",
        position: "relative",
      }}
    >
      <Box style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <Flex justify="space-between" align="flex-start" wrap="wrap">
          {/* Ляво: линкове */}
          <Stack gap={4} style={{ minWidth: 180 }}>
            <Title order={6} c="white">
              Информация
            </Title>
            <Link to="/delivery" style={linkStyle}>
              Доставка
            </Link>
            <Link to="/terms" style={linkStyle}>
              Общи условия
            </Link>
            <Link to="/idea" style={linkStyle}>
              Нашата идея
            </Link>
            <Link to="/cookies" style={linkStyle}>
              Ние използваме бисквитки
            </Link>
          </Stack>

          {/* Дясно: контакт */}
          <Stack gap={4} style={{ minWidth: 180, textAlign: "right" }}>
            <Title order={6} c="white">
              Връзка с нас
            </Title>
            <Text size="sm">ФРЕСКО 2022 ООД</Text>
            <Text size="sm">Тел: +359 886 282 323</Text>
            <Text size="sm">гр. София</Text>
            <Text size="sm">ж.к. Христо Смирненски бл.74, ап.62</Text>
          </Stack>

          {/* Център – абсолютно центриран */}
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <Group justify="center" gap={12} mb={8}>
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
            <Text size="sm" style={{ fontWeight: 400 }}>
              Всички права запазени &copy; 2025 "ДАР ОТ ЗЕМЯТА"
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

const linkStyle = {
  color: "white",
  fontSize: "0.875rem",
  textDecoration: "none",
  marginBottom: 4,
};

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
};
