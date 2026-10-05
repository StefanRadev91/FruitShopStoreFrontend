import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/utils";

let FavoriteButton;
beforeEach(async () => {
  vi.resetModules();
  ({ FavoriteButton } = await import("./FavoriteButton"));
});

describe("<FavoriteButton />", () => {
  it("превключва любим и обновява достъпното име", async () => {
    renderWithProviders(<FavoriteButton id={3} />);
    const btn = screen.getByRole("button", { name: "Добави в любими" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(btn);
    const active = screen.getByRole("button", { name: "Премахни от любими" });
    expect(active).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(localStorage.getItem("favorites_v1"))).toEqual([3]);
  });

  it("клик не се разпространява към картата/връзката около него", async () => {
    const onParentClick = vi.fn();
    renderWithProviders(
      <div onClick={onParentClick}>
        <FavoriteButton id={4} />
      </div>
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
