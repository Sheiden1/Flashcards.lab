const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 10;
const hits = new Map<string, number[]>();

export function checkRateLimit(ip: string, now: number = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export function __reset() {
  hits.clear();
}
