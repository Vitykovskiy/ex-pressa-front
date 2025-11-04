import { type AnyMenuGroup, DrinkSize, MenuGroupType } from "./types";
import type { DataTableHeader } from "vuetify";

export const MENU_DATA: AnyMenuGroup[] = [
  {
    id: 1,
    type: MenuGroupType.Drinks,
    name: "Классика кофе",
    position: 1,
    items: [
      {
        id: 101,
        name: "Эспрессо",
        position: 1,
        isAvailable: true,
        sizes: {
          [DrinkSize.Small]: {
            id: 1011,
            size: DrinkSize.Small,
            price: 120,
          },
          [DrinkSize.Medium]: {
            id: 1012,
            size: DrinkSize.Medium,
            price: 150,
          },
          [DrinkSize.Large]: {
            id: 1013,
            size: DrinkSize.Large,
            price: 180,
          },
        },
      },
      {
        id: 102,
        name: "Американо",
        position: 2,
        isAvailable: true,
        sizes: {
          [DrinkSize.Small]: {
            id: 1021,
            size: DrinkSize.Small,
            price: 130,
          },
          [DrinkSize.Medium]: {
            id: 1022,
            size: DrinkSize.Medium,
            price: 160,
          },
          [DrinkSize.Large]: {
            id: 1023,
            size: DrinkSize.Large,
            price: 190,
          },
        },
      },
      {
        id: 103,
        name: "Капучино",
        position: 3,
        isAvailable: true,
        sizes: {
          [DrinkSize.Small]: {
            id: 1031,
            size: DrinkSize.Small,
            price: 160,
          },
          [DrinkSize.Medium]: {
            id: 1032,
            size: DrinkSize.Medium,
            price: 190,
          },
          [DrinkSize.Large]: {
            id: 1033,
            size: DrinkSize.Large,
            price: 220,
          },
        },
      },
    ],
  },
  {
    id: 2,
    type: MenuGroupType.Drinks,
    name: "Сладкий кофе",
    position: 2,
    items: [
      {
        id: 201,
        name: "Латте карамельный",
        position: 1,
        isAvailable: true,
        sizes: {
          [DrinkSize.Small]: {
            id: 2011,
            size: DrinkSize.Small,
            price: 180,
          },
          [DrinkSize.Medium]: {
            id: 2012,
            size: DrinkSize.Medium,
            price: 210,
          },
          [DrinkSize.Large]: {
            id: 2013,
            size: DrinkSize.Large,
            price: 240,
          },
        },
      },
      {
        id: 202,
        name: "Мокка",
        position: 2,
        isAvailable: true,
        sizes: {
          [DrinkSize.Small]: {
            id: 2021,
            size: DrinkSize.Small,
            price: 190,
          },
          [DrinkSize.Medium]: {
            id: 2022,
            size: DrinkSize.Medium,
            price: 220,
          },
          [DrinkSize.Large]: {
            id: 2023,
            size: DrinkSize.Large,
            price: 250,
          },
        },
      },
    ],
  },
  {
    id: 3,
    type: MenuGroupType.Drinks,
    name: "Не кофе",
    position: 3,
    items: [
      {
        id: 301,
        name: "Матча латте",
        position: 1,
        isAvailable: true,
        sizes: {
          [DrinkSize.Small]: {
            id: 3011,
            size: DrinkSize.Small,
            price: 200,
          },
          [DrinkSize.Medium]: {
            id: 3012,
            size: DrinkSize.Medium,
            price: 230,
          },
        },
      },
      {
        id: 302,
        name: "Какао",
        position: 2,
        isAvailable: true,
        sizes: {
          [DrinkSize.Small]: {
            id: 3021,
            size: DrinkSize.Small,
            price: 170,
          },
          [DrinkSize.Medium]: {
            id: 3022,
            size: DrinkSize.Medium,
            price: 200,
          },
        },
      },
    ],
  },
  {
    id: 4,
    type: MenuGroupType.Food,
    name: "Десерты",
    position: 4,
    items: [
      { id: 401, name: "Чизкейк", price: 250, position: 1, isAvailable: true },
      { id: 402, name: "Брауни", price: 220, position: 2, isAvailable: true },
      {
        id: 403,
        name: "Пирог с яблоками",
        price: 230,
        position: 3,
        isAvailable: false,
      },
    ],
  },
  {
    id: 5,
    type: MenuGroupType.Food,
    name: "Еда",
    position: 5,
    items: [
      {
        id: 501,
        name: "Сэндвич с курицей",
        price: 270,
        position: 1,
        isAvailable: true,
      },
      {
        id: 502,
        name: "Круассан с ветчиной и сыром",
        price: 260,
        position: 2,
        isAvailable: true,
      },
    ],
  },
  {
    id: 6,
    type: MenuGroupType.Other,
    name: "Доп. опции",
    position: 6,
    items: [
      {
        id: 601,
        name: "Молоко безлактозное",
        price: 30,
        position: 1,
        isAvailable: true,
      },
      {
        id: 602,
        name: "Доп. шот эспрессо",
        price: 50,
        position: 2,
        isAvailable: true,
      },
      { id: 603, name: "Сироп", price: 20, position: 3, isAvailable: true },
    ],
  },
  {
    id: 7,
    type: MenuGroupType.Other,
    name: "Мерч",
    position: 7,
    items: [
      {
        id: 701,
        name: "Кружка фирменная",
        price: 600,
        position: 1,
        isAvailable: true,
      },
      {
        id: 702,
        name: "Термокружка",
        price: 900,
        position: 2,
        isAvailable: true,
      },
      { id: 703, name: "Худи", price: 2500, position: 3, isAvailable: true },
    ],
  },
];

export const DRINKS_TABLE_HEADERS: DataTableHeader[] = [
  { title: "Наименование", key: "name", sortable: false },
  {
    title: "S",
    key: `sizes.${DrinkSize.Small}.price`,
    align: "end",
    sortable: false,
  },
  {
    title: "M",
    key: `sizes.${DrinkSize.Medium}.price`,
    align: "end",
    sortable: false,
  },
  {
    title: "L",
    key: `sizes.${DrinkSize.Large}.price`,
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
