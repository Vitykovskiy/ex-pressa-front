import { http } from "@/services/http";
import { USE_MOCKS } from "@/services/mock";
import {
  mockCreateAddon,
  mockCreateAddonGroup,
  mockCreateProduct,
  mockCreateProductGroup,
  mockCreateProductPrice,
  mockDeleteProduct,
  mockDeleteProductGroup,
  mockFetchMenu,
  mockFetchProductById,
  mockLinkAddonGroup,
  mockReplaceProductPrices,
  mockUpdateProduct,
  mockUpdateProductGroup,
} from "@/services/mock/api";
import type {
  Addon,
  AddonGroup,
  CreateAddonDto,
  CreateAddonGroupDto,
  CreateProductDto,
  CreateProductGroupDto,
  CreateProductPriceDto,
  LinkAddonGroupDto,
  Product,
  ProductGroup,
  ProductGroupAddonGroup,
  ProductPrice,
  UpdateProductDto,
  UpdateProductGroupDto,
} from "./types";

async function fetchMenu(): Promise<ProductGroup[]> {
  if (USE_MOCKS) {
    return mockFetchMenu();
  }

  return http.get<ProductGroup[]>("/catalog");
}

async function fetchProductById(id: number): Promise<Product> {
  if (USE_MOCKS) {
    return mockFetchProductById(id);
  }

  return http.get<Product>(`/catalog/products/${id}`);
}

async function createProductGroup(
  payload: CreateProductGroupDto,
): Promise<ProductGroup> {
  if (USE_MOCKS) {
    return mockCreateProductGroup(payload);
  }

  return http.post<ProductGroup, CreateProductGroupDto>(
    "/catalog/product-groups",
    payload,
  );
}

async function createProduct(payload: CreateProductDto): Promise<Product> {
  if (USE_MOCKS) {
    return mockCreateProduct(payload);
  }

  return http.post<Product, CreateProductDto>("/catalog/products", payload);
}

async function updateProductGroup(
  groupId: number,
  payload: UpdateProductGroupDto,
): Promise<ProductGroup> {
  if (USE_MOCKS) {
    return mockUpdateProductGroup(groupId, payload);
  }

  return http.patch<ProductGroup, UpdateProductGroupDto>(
    `/catalog/product-groups/${groupId}`,
    payload,
  );
}

async function deleteProductGroup(groupId: number): Promise<void> {
  if (USE_MOCKS) {
    return mockDeleteProductGroup(groupId);
  }

  return http.delete<void>(`/catalog/product-groups/${groupId}`);
}

async function updateProduct(
  productId: number,
  payload: UpdateProductDto,
): Promise<Product> {
  if (USE_MOCKS) {
    return mockUpdateProduct(productId, payload);
  }

  return http.patch<Product, UpdateProductDto>(
    `/catalog/products/${productId}`,
    payload,
  );
}

async function deleteProduct(productId: number): Promise<void> {
  if (USE_MOCKS) {
    return mockDeleteProduct(productId);
  }

  return http.delete<void>(`/catalog/products/${productId}`);
}

async function createProductPrice(
  payload: CreateProductPriceDto,
): Promise<ProductPrice> {
  if (USE_MOCKS) {
    return mockCreateProductPrice(payload);
  }

  return http.post<ProductPrice, CreateProductPriceDto>(
    "/catalog/product-prices",
    payload,
  );
}

async function replaceProductPrices(
  productId: number,
  payload: Array<Pick<CreateProductPriceDto, "sizeCode" | "priceRub" | "isActive">>,
): Promise<ProductPrice[]> {
  if (USE_MOCKS) {
    return mockReplaceProductPrices(productId, payload);
  }

  return http.put<
    ProductPrice[],
    Array<Pick<CreateProductPriceDto, "sizeCode" | "priceRub" | "isActive">>
  >(`/catalog/products/${productId}/prices`, payload);
}

async function createAddonGroup(
  payload: CreateAddonGroupDto,
): Promise<AddonGroup> {
  if (USE_MOCKS) {
    return mockCreateAddonGroup(payload);
  }

  return http.post<AddonGroup, CreateAddonGroupDto>(
    "/catalog/addon-groups",
    payload,
  );
}

async function createAddon(payload: CreateAddonDto): Promise<Addon> {
  if (USE_MOCKS) {
    return mockCreateAddon(payload);
  }

  return http.post<Addon, CreateAddonDto>("/catalog/addons", payload);
}

async function linkAddonGroup(
  payload: LinkAddonGroupDto,
): Promise<ProductGroupAddonGroup> {
  if (USE_MOCKS) {
    return mockLinkAddonGroup(payload);
  }

  return http.post<ProductGroupAddonGroup, LinkAddonGroupDto>(
    "/catalog/addon-groups/link",
    payload,
  );
}

export default {
  fetchMenu,
  fetchProductById,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductPrice,
  replaceProductPrices,
  createAddonGroup,
  createAddon,
  linkAddonGroup,
};
