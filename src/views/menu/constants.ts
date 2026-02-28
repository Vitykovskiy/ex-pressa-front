import { SizeCode } from "@/services/menu/types";
import type { DataTableHeader } from "vuetify";

export const DRINKS_TABLE_HEADERS: DataTableHeader[] = [
  { title: "Наименование", key: "name", sortable: false },
  {
    title: "S",
    key: `sizes.${SizeCode.Small}.price`,
    align: "end",
    sortable: false,
  },
  {
    title: "M",
    key: `sizes.${SizeCode.Medium}.price`,
    align: "end",
    sortable: false,
  },
  {
    title: "L",
    key: `sizes.${SizeCode.Large}.price`,
    align: "end",
    sortable: false,
  },
];

export const OTHER_TABLE_HEADERS: DataTableHeader[] = [
  { title: "Наименование", key: "name", sortable: false },
  { title: "Цена", key: "price", align: "end", sortable: false },
];

export const GROUPS_TABLE_HEADERS: DataTableHeader[] = [
  { title: "Наименование", key: "name", sortable: false },
];
