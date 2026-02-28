export function isMockModeEnabled(): boolean {
  const raw = String(import.meta.env.VITE_USE_MOCKS ?? "")
    .trim()
    .toLowerCase();

  return raw === "true" || raw === "1" || raw === "yes" || raw === "on";
}

export const USE_MOCKS = isMockModeEnabled();

export const MOCK_NETWORK_DELAY_MS = 150;

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
