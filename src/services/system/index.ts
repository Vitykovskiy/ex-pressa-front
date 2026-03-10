import { http } from "@/services/http";

export interface AppVersionInfo {
  appName: string;
  packageVersion: string;
  version: string;
  generatedAt: string;
}

export interface HealthResponse {
  status: string;
  app?: AppVersionInfo;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return http.get<HealthResponse>("/health");
}
