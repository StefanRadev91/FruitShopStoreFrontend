import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react";
import { Box, Flex, Text, Group, Stack, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMainCategoriesWithCache, getCachedMainCategories } from "../services/categoriesAPI";
import { categoryPath } from "../seo/categoryRoutes";

// Плосък списък: категориите без подкатегории + всички подкатегории.
function flattenCategories(categories) {
  return (categories || []).flatMap((c) =>
    c.subcategories?.length ? c.subcategories.map((s) => s.Name) : [c.Name]
  );
}

export default function Footer() {
  const [categoryNames, setCategoryNames] = useState(() => flattenCategories(getCachedMainCategories()));

  useEffect(() => {
    getMainCategoriesWithCache()
      .then((cats) => setCategoryNames(flattenCategories(cats)))
      .catch(() => {});
  }, []);

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
          align={{
            base: "center",
            md: "center",
            sm: "center",
            lg: "flex-start",
            xl: "flex-start",
          }}
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
            <Title order={2} size="h6" c="white" ta={{ base: "center", md: "center" }}>
              Информация
            </Title>

            <Text size="sm" ta={{ base: "center", md: "center" }}>
              <Link to="/delivery" style={linkStyle} onClick={() => window.scrollTo({ top: 0 })}>
                Доставка
              </Link>
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              <Link to="/terms" style={linkStyle} onClick={() => window.scrollTo({ top: 0 })}>
                Общи условия
              </Link>
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              <Link to="/idea" style={linkStyle} onClick={() => window.scrollTo({ top: 0 })}>
                Нашата идея
              </Link>
            </Text>
            <Text size="sm" ta={{ base: "center", md: "center" }}>
              <Link to="/cookies" style={linkStyle} onClick={() => window.scrollTo({ top: 0 })}>
                Ние използваме бисквитки
              </Link>
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
                aria-label="Facebook"
                style={iconLinkStyle}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandFacebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/your-page"
                aria-label="Instagram"
                style={iconLinkStyle}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandInstagram size={18} />
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
            <Title order={2} size="h6" c="white" ta={{ base: "center", md: "center" }}>
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

        {categoryNames.length > 0 && (
          <Box
            component="nav"
            aria-label="Категории"
            style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 16, paddingTop: 16, textAlign: "center" }}
          >
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.12em", opacity: 0.8 }} mb={8}>
              Категории
            </Text>
            <Box style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px" }}>
              {categoryNames.map((name) => (
                <Link
                  key={name}
                  to={categoryPath(name)}
                  style={{ ...linkStyle, fontSize: "0.8125rem", opacity: 0.9, marginBottom: 0 }}
                  onClick={() => window.scrollTo({ top: 0 })}
                >
                  {name}
                </Link>
              ))}
            </Box>
          </Box>
        )}
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