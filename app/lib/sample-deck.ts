import type { Flashcard } from "@/types";

/**
 * Deck de demonstração — usado pelo botão "Ver exemplo".
 * Funciona sem GEMINI_API_KEY, então mostra os cards holográficos
 * mesmo antes de configurar a chave (útil para portfólio).
 */
export const SAMPLE_DECK: Flashcard[] = [
  {
    id: "s1",
    question: "O que é a fotossíntese?",
    answer:
      "Processo pelo qual plantas convertem luz, água e CO₂ em glicose e oxigênio.",
    rarity: "normal",
  },
  {
    id: "s2",
    question: "Qual organela realiza a fotossíntese?",
    answer: "O cloroplasto, graças ao pigmento clorofila.",
    rarity: "normal",
  },
  {
    id: "s3",
    question: "Qual gás é liberado na fotossíntese?",
    answer: "Oxigênio (O₂).",
    rarity: "holographic",
  },
  {
    id: "s4",
    question: "O que a planta absorve do solo para o processo?",
    answer: "Água (H₂O), pelas raízes.",
    rarity: "normal",
  },
  {
    id: "s5",
    question: "Qual é o produto energético da fotossíntese?",
    answer: "Glicose (C₆H₁₂O₆), usada como fonte de energia.",
    rarity: "normal",
  },
  {
    id: "s6",
    question: "Em que parte da célula a luz é captada?",
    answer: "Nos tilacoides, dentro do cloroplasto.",
    rarity: "normal",
  },
];
