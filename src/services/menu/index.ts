// пример: src/api/menu.api.ts
import { http } from "@/services/http";
import type { MenuItem } from "./types";

async function fetchMenu(): Promise<MenuItem[]> {
  return http.get<MenuItem[]>("/menu/items/all");
}

export default {
  fetchMenu,
};
