import { http } from "@/services/http";
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
  UpdateAddonDto,
  UpdateAddonGroupDto,
  UpdateProductDto,
  UpdateProductGroupDto,
} from "./types";

async function fetchMenu(): Promise<ProductGroup[]> {
  return http.get<ProductGroup[]>("/catalog");
}

async function fetchAddonGroups(): Promise<AddonGroup[]> {
  return http.get<AddonGroup[]>("/catalog/addon-groups");
}

async function fetchProductById(id: number): Promise<Product> {
  return http.get<Product>(`/catalog/products/${id}`);
}

async function createProductGroup(
  payload: CreateProductGroupDto,
): Promise<ProductGroup> {
  return http.post<ProductGroup, CreateProductGroupDto>(
    "/catalog/product-groups",
    payload,
  );
}

async function createProduct(payload: CreateProductDto): Promise<Product> {
  return http.post<Product, CreateProductDto>("/catalog/products", payload);
}

async function updateProductGroup(
  groupId: number,
  payload: UpdateProductGroupDto,
): Promise<ProductGroup> {
  return http.patch<ProductGroup, UpdateProductGroupDto>(
    `/catalog/product-groups/${groupId}`,
    payload,
  );
}

async function deleteProductGroup(groupId: number): Promise<void> {
  return http.delete<void>(`/catalog/product-groups/${groupId}`);
}

async function updateProduct(
  productId: number,
  payload: UpdateProductDto,
): Promise<Product> {
  return http.patch<Product, UpdateProductDto>(
    `/catalog/products/${productId}`,
    payload,
  );
}

async function deleteProduct(productId: number): Promise<void> {
  return http.delete<void>(`/catalog/products/${productId}`);
}

async function createProductPrice(
  payload: CreateProductPriceDto,
): Promise<ProductPrice> {
  return http.post<ProductPrice, CreateProductPriceDto>(
    "/catalog/product-prices",
    payload,
  );
}

async function replaceProductPrices(
  productId: number,
  payload: Array<Pick<CreateProductPriceDto, "sizeCode" | "priceRub" | "isActive">>,
): Promise<ProductPrice[]> {
  return http.put<
    ProductPrice[],
    Array<Pick<CreateProductPriceDto, "sizeCode" | "priceRub" | "isActive">>
  >(`/catalog/products/${productId}/prices`, payload);
}

async function createAddonGroup(
  payload: CreateAddonGroupDto,
): Promise<AddonGroup> {
  return http.post<AddonGroup, CreateAddonGroupDto>(
    "/catalog/addon-groups",
    payload,
  );
}

async function updateAddonGroup(
  groupId: number,
  payload: UpdateAddonGroupDto,
): Promise<AddonGroup> {
  return http.patch<AddonGroup, UpdateAddonGroupDto>(
    `/catalog/addon-groups/${groupId}`,
    payload,
  );
}

async function deleteAddonGroup(groupId: number): Promise<void> {
  return http.delete<void>(`/catalog/addon-groups/${groupId}`);
}

async function createAddon(payload: CreateAddonDto): Promise<Addon> {
  return http.post<Addon, CreateAddonDto>("/catalog/addons", payload);
}

async function updateAddon(
  addonId: number,
  payload: UpdateAddonDto,
): Promise<Addon> {
  return http.patch<Addon, UpdateAddonDto>(`/catalog/addons/${addonId}`, payload);
}

async function deleteAddon(addonId: number): Promise<void> {
  return http.delete<void>(`/catalog/addons/${addonId}`);
}

async function linkAddonGroup(
  payload: LinkAddonGroupDto,
): Promise<ProductGroupAddonGroup> {
  return http.post<ProductGroupAddonGroup, LinkAddonGroupDto>(
    "/catalog/addon-groups/link",
    payload,
  );
}

export default {
  fetchMenu,
  fetchAddonGroups,
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
  updateAddonGroup,
  deleteAddonGroup,
  createAddon,
  updateAddon,
  deleteAddon,
  linkAddonGroup,
};
