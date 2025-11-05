import { type AnyMenuGroup, DrinkSize, MenuGroupType } from "./types";
import type { DataTableHeader } from "vuetify";

export const MENU_DATA: AnyMenuGroup[] = [
  {
    id: 1,
    type: MenuGroupType.Drinks,
    name: "Классика кофе",
    position: 1,
    optionsId: 6,
    items: [
      {
        id: 101,
        name: "Эспрессо",
        position: 1,
        isAvailable: true,
        sizes: [
          {
            size: DrinkSize.Small,
            price: 120,
          },
          {
            size: DrinkSize.Medium,
            price: 150,
          },
          {
            size: DrinkSize.Large,
            price: 180,
          },
        ],
      },
      {
        id: 102,
        name: "Американо",
        position: 2,
        isAvailable: true,
        sizes: [
          {
            size: DrinkSize.Small,
            price: 120,
          },
          {
            size: DrinkSize.Medium,
            price: 150,
          },
          { size: DrinkSize.Large, price: 180 },
        ],
      },
      {
        id: 103,
        name: "Капучино",
        position: 3,
        isAvailable: true,
        sizes: [
          {
            size: DrinkSize.Small,
            price: 120,
          },
          {
            size: DrinkSize.Medium,
            price: 150,
          },
          { size: DrinkSize.Large, price: 180 },
        ],
      },
    ],
  },
  {
    id: 2,
    type: MenuGroupType.Drinks,
    name: "Сладкий кофе",
    position: 2,
    optionsId: 6,
    items: [
      {
        id: 201,
        name: "Латте карамельный",
        position: 1,
        isAvailable: true,
        sizes: [
          {
            size: DrinkSize.Small,
            price: 120,
          },
          {
            size: DrinkSize.Medium,
            price: 150,
          },
          { size: DrinkSize.Large, price: 180 },
        ],
      },
      {
        id: 202,
        name: "Мокка",
        position: 2,
        isAvailable: true,
        sizes: [
          {
            size: DrinkSize.Small,
            price: 120,
          },
          {
            size: DrinkSize.Medium,
            price: 150,
          },
          { size: DrinkSize.Large, price: 180 },
        ],
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
        sizes: [
          {
            size: DrinkSize.Small,
            price: 120,
          },
          {
            size: DrinkSize.Medium,
            price: 150,
          },
          { size: DrinkSize.Large, price: 180 },
        ],
      },
      {
        id: 302,
        name: "Какао",
        position: 2,
        isAvailable: true,
        sizes: [
          {
            size: DrinkSize.Small,
            price: 120,
          },
          {
            size: DrinkSize.Medium,
            price: 150,
          },
          { size: DrinkSize.Large, price: 180 },
        ],
      },
    ],
  },
  {
    id: 4,
    type: MenuGroupType.Other,
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
    type: MenuGroupType.Other,
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
    type: MenuGroupType.Options,
    name: "Кофе опции",
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
    type: MenuGroupType.Options,
    name: "Сырники опции",
    position: 6,
    items: [
      {
        id: 701,
        name: "Сметана",
        price: 30,
        position: 1,
        isAvailable: true,
      },
      {
        id: 702,
        name: "Варенье",
        price: 50,
        position: 2,
        isAvailable: true,
      },
    ],
  },
  {
    id: 8,
    type: MenuGroupType.Other,
    name: "Мерч",
    position: 7,
    items: [
      {
        id: 801,
        name: "Кружка фирменная",
        price: 600,
        position: 1,
        isAvailable: true,
      },
      {
        id: 802,
        name: "Термокружка",
        price: 900,
        position: 2,
        isAvailable: true,
      },
      { id: 803, name: "Худи", price: 2500, position: 3, isAvailable: true },
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
