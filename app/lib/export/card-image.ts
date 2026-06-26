import type { Flashcard } from "@/types";

const W = 600;
const H = 840;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function wrapText(
  ctx: Pick<CanvasRenderingContext2D, "measureText">,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Desenha uma carta dentro da região (x, y, W, H) do contexto dado.
 * Coordenadas são relativas à região, então serve tanto para uma carta
 * isolada quanto para uma célula de um contact sheet.
 */
function drawCard(
  ctx: CanvasRenderingContext2D,
  card: Flashcard,
  ox: number,
  oy: number,
) {
  const holo = card.rarity === "holographic";

  // Superfície da carta
  roundRect(ctx, ox + 30, oy + 30, W - 60, H - 60, 28);
  ctx.fillStyle = "#15121F";
  ctx.fill();

  // Borda (gradiente holográfico para rara, roxo sólido para normal)
  if (holo) {
    const grad = ctx.createLinearGradient(ox + 30, oy + 30, ox + W - 30, oy + H - 30);
    grad.addColorStop(0, "#7C3AED");
    grad.addColorStop(0.5, "#B026FF");
    grad.addColorStop(1, "#38bdf8");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
  } else {
    ctx.strokeStyle = "rgba(124,58,237,0.5)";
    ctx.lineWidth = 3;
  }
  roundRect(ctx, ox + 30, oy + 30, W - 60, H - 60, 28);
  ctx.stroke();

  // Selo de marca
  ctx.fillStyle = "#B026FF";
  ctx.font = "700 18px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FLASHCARDS LAB", ox + 64, oy + 86);

  if (holo) {
    ctx.textAlign = "right";
    ctx.fillStyle = "#B026FF";
    ctx.font = "28px serif";
    ctx.fillText("✦", ox + W - 64, oy + 92);
  }

  // Pergunta (centralizada)
  ctx.textAlign = "center";
  ctx.fillStyle = "#F4F2F8";
  ctx.font = "600 34px Inter, sans-serif";
  const lines = wrapText(ctx, card.question, W - 140);
  const lineHeight = 46;
  const startY = oy + H / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, ox + W / 2, startY + i * lineHeight));

  // Rodapé
  ctx.fillStyle = "rgba(244,242,248,0.4)";
  ctx.font = "16px Inter, sans-serif";
  ctx.fillText(holo ? "carta holográfica" : "carta de estudo", ox + W / 2, oy + H - 70);
}

function triggerDownload(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Renderiza uma carta como PNG e dispara o download.
 * Ponto de extensão `lib/export/` previsto no design.
 */
export function downloadCardImage(card: Flashcard) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#0A0A0F";
  ctx.fillRect(0, 0, W, H);
  drawCard(ctx, card, 0, 0);

  triggerDownload(canvas, `flashcard-${card.id}.png`);
}

/** Calcula a grade do contact sheet (colunas/linhas) para N cartas. */
export function sheetLayout(count: number): { cols: number; rows: number } {
  if (count <= 0) return { cols: 0, rows: 0 };
  const cols = Math.min(3, count);
  const rows = Math.ceil(count / cols);
  return { cols, rows };
}

/**
 * Renderiza o deck inteiro como um contact sheet PNG (grade de até 3 colunas)
 * e dispara o download.
 */
export function downloadDeckImage(cards: Flashcard[]) {
  if (cards.length === 0) return;
  const gap = 24;
  const { cols, rows } = sheetLayout(cards.length);

  const canvas = document.createElement("canvas");
  canvas.width = cols * W + (cols + 1) * gap;
  canvas.height = rows * H + (rows + 1) * gap;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#0A0A0F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ox = gap + col * (W + gap);
    const oy = gap + row * (H + gap);
    drawCard(ctx, card, ox, oy);
  });

  triggerDownload(canvas, "flashcards-deck.png");
}
