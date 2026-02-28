import type { HttpError } from "@/services/http";
import menuService from "@/services/menu";
import type { AddonGroup, ProductGroup } from "@/services/menu/types";

import { ref } from "vue";

const menu = ref<ProductGroup[]>([]);

export function useMenu() {
  async function fetchMenu(): Promise<void> {
    try {
      const data = await menuService.fetchMenu();
      menu.value = data;
    } catch (e) {
      const err = e as HttpError;
      console.error(err.message, err.status, err.data);
    }
  }

  if (!menu.value.length) {
    fetchMenu();
  }

  function getAddonGroupsForGroup(groupId: number): AddonGroup[] {
    const group = menu.value.find((item) => item.id === groupId);
    if (!group) return [];
    return group.addonLinks
      .map((link) => link.addonGroup)
      .filter((addonGroup): addonGroup is AddonGroup => Boolean(addonGroup));
  }

  return { menu, getAddonGroupsForGroup };
}
