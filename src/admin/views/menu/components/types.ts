import type {
  CreateProductDto,
  SizeCode,
  UpdateProductDto,
  UpdateProductGroupDto,
} from "@/services/menu/types";

export type AddProductSubmitPayload = {
  product: CreateProductDto;
  prices: Array<{
    sizeCode?: SizeCode;
    priceRub: number;
  }>;
};

export type EditGroupSubmitPayload = {
  groupId: number;
  payload: UpdateProductGroupDto;
};

export type EditProductSubmitPayload = {
  productId: number;
  payload: UpdateProductDto;
  prices: Array<{
    sizeCode?: SizeCode;
    priceRub: number;
  }>;
};
