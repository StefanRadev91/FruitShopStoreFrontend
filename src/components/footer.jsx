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
        padding: "32px 16px",
        fontFamily: "inherit",
        width: "100%",
      }}
    >
      <Box style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "center", md: "center", sm: "center", lg: "flex-start", xl: "flex-start" }}
          wrap="wrap"
          gap="xl"
        >
          {/* Лява колона */}
          <Stack
            gap={4}
            flex="1"
            order={{ base: 1, md: 0 }}
            align={{ base: "center", md: "flex-start" }}
            style={{
              minWidth: 180,
              padding: "16px 0",
            }}
          >
            <Title order={6} c="white" ta={{ base: "center", md: "cemter" }}>
              Информация
            </Title>

            <Text size="sm" ta={{ base: "center", md: "center" }}>
              <Link to="/delivery" style={linkStyle}>Доставка</Link>
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              <Link to="/terms" style={linkStyle}>Общи условия</Link>
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              <Link to="/idea" style={linkStyle}>Нашата идея</Link>
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              <Link to="/cookies" style={linkStyle}>Ние използваме бисквитки</Link>
            </Text>
          </Stack>


          {/* Централна колона */}
          <Box
            flex="1"
            order={{ base: 0, md: 1 }}
            style={{
              padding: "16px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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

          {/* Дясна колона */}
          <Stack
            gap={4}
            flex="1"
            order={{ base: 2, md: 2 }}
            align={{ base: "center", md: "flex-end" }}
            style={{
              minWidth: 180,
              padding: "16px 0",
            }}
          >
            <Title order={6} c="white" ta={{ base: "center", md: "center" }}>
              Връзка с нас
            </Title>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              ФРЕСКО 2022 ООД
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              Тел: +359 886 282 323
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              гр. София
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              ж.к. Христо Смирненски бл.74, ап.62
            </Text>
          </Stack>
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