import { http } from "@/services/http";
import { USE_MOCKS } from "@/services/mock";
import { mockAuthorizeTelegram, mockFetchMe } from "@/services/mock/api";
import type { User } from "./types";

export async function authorizeTelegram(initData: string): Promise<void> {
  if (USE_MOCKS) {
    return mockAuthorizeTelegram(initData);
  }

  await http.post("/auth/telegram", { initData });
}

export async function fetchMe(): Promise<User> {
  if (USE_MOCKS) {
    return mockFetchMe();
  }

  return http.get<User>("/auth/me");
}
