import type {
  CreateAddonGroupDto,
  CreateProductDto,
  CreateProductGroupDto,
  SizeCode,
  UpdateAddonDto,
  UpdateProductDto,
  UpdateProductGroupDto,
} from "@/services/menu/types";

export type AddGroupSubmitPayload =
  | {
      mode: "addon";
      payload: CreateAddonGroupDto;
    }
  | {
      mode: "product";
      payload: CreateProductGroupDto;
      addonGroupIds: number[];
    };

export type AddProductSubmitPayload = {
  product: CreateProductDto;
  isAddonsGroup: boolean;
  prices: Array<{
    sizeCode?: SizeCode;
    priceRub: number;
  }>;
};

export type EditGroupSubmitPayload = {
  groupId: number;
  payload: UpdateProductGroupDto;
  addonGroupIds: number[];
};

export type EditProductSubmitPayload = {
  productId: number;
  payload: UpdateProductDto;
  prices: Array<{
    sizeCode?: SizeCode;
    priceRub: number;
  }>;
};

export type EditAddonSubmitPayload = {
  addonId: number;
  payload: UpdateAddonDto;
};
