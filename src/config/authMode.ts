export const enum AuthMode {
  Auto = "auto",
  Authorized = "authorized",
  Unauthorized = "unauthorized",
}

export function getAuthMode(): AuthMode {
  const raw = String(import.meta.env.VITE_AUTH_MODE ?? "")
    .trim()
    .toLowerCase();

  if (raw === AuthMode.Authorized) {
    return AuthMode.Authorized;
  }

  if (raw === AuthMode.Unauthorized) {
    return AuthMode.Unauthorized;
  }

  return AuthMode.Auto;
}

export function isForcedAuthMode(): boolean {
  const mode = getAuthMode();
  return mode === AuthMode.Authorized || mode === AuthMode.Unauthorized;
}
