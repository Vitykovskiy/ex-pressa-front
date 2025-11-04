import type { HttpError } from "@/services/http";
import menuService from "@/services/menu";
import { MENU_DATA } from "@/views/menu/constants";
import type { AnyMenuGroup } from "@/views/menu/types";
import { ref } from "vue";

const menu = ref<AnyMenuGroup[]>([]);

export function useMenu() {
  async function fetchMenu(): Promise<void> {
    /*     try {
      menu.value = await menuService.fetchMenu();
    } catch (e) {
      const err = e as HttpError;
      console.error(err.message, err.status, err.data);
    }
 */
    menu.value = MENU_DATA;
  }

  if (!menu.value.length) {
    fetchMenu();
  }

  return { menu };
}
