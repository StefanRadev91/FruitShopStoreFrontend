import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Group, Text } from "@mantine/core";
import { getCachedMainCategories, getMainCategoriesWithCache } from "../services/categoriesAPI";
import { categoryPath } from "../seo/categoryRoutes";

// Връзки към "съседните" подкатегории (напр. във "Фрешове" – Вино, Сокове, Розета...).
export function CategoryChips({ current }) {
  const [tree, setTree] = useState(getCachedMainCategories);

  useEffect(() => {
    getMainCategoriesWithCache().then(setTree).catch(() => {});
  }, []);

  const parent = (tree || []).find((c) => c.subcategories?.some((s) => s.Name === current));
  if (!parent) return null;

  return (
    <nav aria-label={`Подкатегории на ${parent.Name}`} style={{ marginBottom: 20 }}>
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={8} ta="center" style={{ letterSpacing: "0.1em" }}>
        {parent.Name}
      </Text>
      <Group gap={8} justify="center">
        {parent.subcategories.map((s) => {
          const active = s.Name === current;
          return (
            <Link
              key={s.id}
              to={categoryPath(s.Name)}
              onClick={() => window.scrollTo({ top: 0 })}
              aria-current={active ? "page" : undefined}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                border: "1px solid",
                borderColor: active ? "#2f9e44" : "#d8e4d8",
                background: active ? "#2f9e44" : "#fff",
                color: active ? "#fff" : "#2b2b2b",
              }}
            >
              {s.Name}
            </Link>
          );
        })}
      </Group>
    </nav>
  );
}
