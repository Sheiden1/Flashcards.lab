type ArrowKey = "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp";

/**
 * Dado o índice atual num grid de `cols` colunas e `total` itens, devolve o
 * índice do item a focar para a seta pressionada — ou o mesmo índice se o
 * movimento sairia dos limites. Função pura: isola a aritmética de navegação.
 */
export function nextFocusIndex(
  current: number,
  key: ArrowKey,
  cols: number,
  total: number,
): number {
  let next = current;
  if (key === "ArrowRight") next = current + 1;
  else if (key === "ArrowLeft") next = current - 1;
  else if (key === "ArrowDown") next = current + cols;
  else if (key === "ArrowUp") next = current - cols;
  return next >= 0 && next < total ? next : current;
}

export function isArrowKey(key: string): key is ArrowKey {
  return (
    key === "ArrowRight" ||
    key === "ArrowLeft" ||
    key === "ArrowDown" ||
    key === "ArrowUp"
  );
}
