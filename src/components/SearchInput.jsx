// src/components/SearchInput.jsx – търсачка с бързи подсказки (от вече зареденото меню с продукти)
import { useMemo, useRef, useState } from "react";
import { Box, Image, Paper, Text, TextInput, UnstyledButton, ActionIcon } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useCatalog, imageUrl } from "../services/productsAPI";
import { formatEUR } from "./PriceDisplay";
import { unitPriceBGN } from "../services/cart";

const MAX_SUGGESTIONS = 6;

export function SearchInput({ fullWidth = false }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const { products } = useCatalog();
  const inputRef = useRef(null);

  const query = value.trim().toLowerCase();
  const { suggestions, total } = useMemo(() => {
    if (query.length < 2) return { suggestions: [], total: 0 };
    const matches = products.filter((p) => p.slug && p.name.toLowerCase().includes(query));
    // Първо тези, които започват с търсеното
    matches.sort(
      (a, b) =>
        Number(b.name.toLowerCase().startsWith(query)) - Number(a.name.toLowerCase().startsWith(query)) ||
        a.name.localeCompare(b.name, "bg")
    );
    return { suggestions: matches.slice(0, MAX_SUGGESTIONS), total: matches.length };
  }, [products, query]);

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const goToSearch = () => {
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    setValue("");
    close();
    inputRef.current?.blur();
  };

  const goToProduct = (p) => {
    navigate(`/product/${encodeURIComponent(p.slug)}`);
    setValue("");
    close();
    inputRef.current?.blur();
  };

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      close();
    } else if (e.key === "Enter") {
      if (active >= 0 && suggestions[active]) goToProduct(suggestions[active]);
      else goToSearch();
    }
  }

  const showDropdown = open && query.length >= 2;

  return (
    <Box
      style={{ position: "relative", width: fullWidth ? "100%" : 260, maxWidth: "100%" }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      }}
    >
      <TextInput
        ref={inputRef}
        placeholder="Търси продукт..."
        aria-label="Търси продукт"
        leftSection={<IconSearch size={16} />}
        rightSection={
          value ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label="Изчисти търсенето"
              onClick={() => {
                setValue("");
                close();
                inputRef.current?.focus();
              }}
            >
              <IconX size={14} />
            </ActionIcon>
          ) : null
        }
        value={value}
        onChange={(e) => {
          setValue(e.currentTarget.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        radius="md"
        size="sm"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
      />

      {showDropdown && (
        <Paper
          shadow="lg"
          radius="md"
          withBorder
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: fullWidth ? "100%" : 360,
            maxWidth: "calc(100vw - 24px)",
            zIndex: 400,
            overflow: "hidden",
          }}
          role="listbox"
          // Натискане вътре в списъка не бива да "отнема" фокуса от полето – иначе Safari/iOS
          // затварят списъка още преди да се обработи кликът.
          onMouseDown={(e) => e.preventDefault()}
        >
          {suggestions.length === 0 ? (
            <Text size="sm" c="dimmed" p="md">
              Няма продукти за „{value.trim()}“
            </Text>
          ) : (
            <>
              {suggestions.map((p, i) => (
                <UnstyledButton
                  key={p.id}
                  component={Link}
                  to={`/product/${encodeURIComponent(p.slug)}`}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => {
                    setValue("");
                    close();
                  }}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 12px",
                    background: i === active ? "#f1f8f1" : "transparent",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <Image
                    src={imageUrl(p.image, 360)}
                    alt=""
                    w={40}
                    h={40}
                    fit="contain"
                    radius="sm"
                    style={{ flexShrink: 0, background: "#fff" }}
                  />
                  <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                    {p.name}
                  </Text>
                  <Text size="sm" fw={700} style={{ whiteSpace: "nowrap" }}>
                    {formatEUR(unitPriceBGN(p))}
                  </Text>
                </UnstyledButton>
              ))}
              <UnstyledButton
                onClick={goToSearch}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  borderTop: "1px solid #eee",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#2f9e44",
                  textAlign: "center",
                }}
              >
                Виж всички резултати ({total})
              </UnstyledButton>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}
