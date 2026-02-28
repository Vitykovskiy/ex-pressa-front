import { http } from "@/services/http";
import { USE_MOCKS } from "@/services/mock";
import {
  mockCreateAddon,
  mockCreateAddonGroup,
  mockCreateProduct,
  mockCreateProductGroup,
  mockCreateProductPrice,
  mockFetchMenu,
  mockFetchProductById,
  mockLinkAddonGroup,
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
  createProduct,
  createProductPrice,
  createAddonGroup,
  createAddon,
  linkAddonGroup,
};
