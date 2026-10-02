import { ActionIcon } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useFavorites } from "../services/favorites";

export function FavoriteButton({ id, size = "md", style }) {
  const { has, toggle } = useFavorites();
  const active = has(id);
  return (
    <ActionIcon
      variant={active ? "filled" : "default"}
      color={active ? "red" : "gray"}
      radius="xl"
      size={size}
      aria-label={active ? "Премахни от любими" : "Добави в любими"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)", ...style }}
    >
      {active ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
    </ActionIcon>
  );
}
