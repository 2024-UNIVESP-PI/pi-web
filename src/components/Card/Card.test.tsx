import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Card from "./index";

describe("Card", () => {
  it("can be activated with Enter or Space when clickable", () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Produto</Card>);
    const card = screen.getByRole("button", { name: "Produto" });

    fireEvent.keyDown(card, { key: "Enter" });
    fireEvent.keyDown(card, { key: " " });

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
