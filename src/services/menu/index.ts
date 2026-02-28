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
} from "./types";

async function fetchMenu(): Promise<ProductGroup[]> {
  return http.get<ProductGroup[]>("/catalog");
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

async function createProductPrice(
  payload: CreateProductPriceDto,
): Promise<ProductPrice> {
  return http.post<ProductPrice, CreateProductPriceDto>(
    "/catalog/product-prices",
    payload,
  );
}

async function createAddonGroup(
  payload: CreateAddonGroupDto,
): Promise<AddonGroup> {
  return http.post<AddonGroup, CreateAddonGroupDto>(
    "/catalog/addon-groups",
    payload,
  );
}

async function createAddon(payload: CreateAddonDto): Promise<Addon> {
  return http.post<Addon, CreateAddonDto>("/catalog/addons", payload);
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
  fetchProductById,
  createProductGroup,
  createProduct,
  createProductPrice,
  createAddonGroup,
  createAddon,
  linkAddonGroup,
};
