import type { HttpError } from "@/services/http";
import menuService from "@/services/menu";
import { MENU_DATA } from "@/views/menu/constants";
import {
  MenuGroupType,
  type AnyMenuGroup,
  type OptionsGroup,
} from "@/views/menu/types";
import { ref } from "vue";

const menu = ref<AnyMenuGroup[]>([]);
const options = ref<OptionsGroup[]>([]);

export function useMenu() {
  async function fetchMenu(): Promise<void> {
    /*     try {
      menu.value = await menuService.fetchMenu();
    } catch (e) {
      const err = e as HttpError;
      console.error(err.message, err.status, err.data);
    }
 */
    menu.value = MENU_DATA.filter(
      (group) => group.type !== MenuGroupType.Options
    );

    options.value = MENU_DATA.filter(
      (group) => group.type === MenuGroupType.Options
    );
  }

  if (!menu.value.length) {
    fetchMenu();
  }

  return { menu, options };
}
