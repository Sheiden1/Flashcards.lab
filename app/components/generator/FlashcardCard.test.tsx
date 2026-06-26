import { test, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FlashcardCard } from "./FlashcardCard";
import { useGeneratorStore } from "@/app/store/generator.store";
import type { Flashcard } from "@/types";

afterEach(() => {
  cleanup();
  useGeneratorStore.setState({ flipped: new Set() });
});

const normal: Flashcard = {
  id: "c1",
  question: "Qual a capital?",
  answer: "Brasília",
  rarity: "normal",
};

test("renders question and answer faces", () => {
  render(<FlashcardCard card={normal} index={0} />);
  expect(screen.getByText("Qual a capital?")).toBeInTheDocument();
  expect(screen.getByText("Brasília")).toBeInTheDocument();
});

test("clicking toggles the flip transform", () => {
  const { container } = render(<FlashcardCard card={normal} index={0} />);
  const inner = container.querySelector("button > div") as HTMLElement;
  expect(inner.className).not.toContain("rotateY(180deg)");

  fireEvent.click(screen.getByRole("button"));
  expect(inner.className).toContain("rotateY(180deg)");
});

test("holographic card shows the rare marker", () => {
  const holo: Flashcard = { ...normal, id: "c2", rarity: "holographic" };
  render(<FlashcardCard card={holo} index={0} />);
  expect(screen.getByText("✦")).toBeInTheDocument();
});
