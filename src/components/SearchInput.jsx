// src/components/SearchInput.jsx
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchInput() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  function handleKeyDown(e) {
    if (e.key === "Enter" && value.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      setValue(""); // по избор: изчистване на полето след търсене
    }
  }

  return (
    <TextInput
      placeholder="Търси продукт..."
      icon={<IconSearch size={16} />}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      onKeyDown={handleKeyDown}
      radius="md"
      size="sm"
      style={{ width: 200 }}
    />
  );
}