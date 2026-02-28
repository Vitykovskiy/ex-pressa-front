/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_AUTH_MODE?: "auto" | "authorized" | "unauthorized";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
