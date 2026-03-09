import { http } from "@/services/http";
import type { User } from "./types";

export async function authorizeTelegram(initData: string): Promise<void> {
  await http.post("/auth/telegram", undefined, {
    headers: {
      Authorization: `tma ${initData}`,
    },
  });
}

export async function fetchMe(): Promise<User> {
  return http.get<User>("/auth/me");
}
