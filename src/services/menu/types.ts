import type { User } from "@/services/auth/types";

export enum ProductType {
  Drink = "DRINK",
  Food = "FOOD",
  Merch = "MERCH",
}

export enum SizeCode {
  Small = "S",
  Medium = "M",
  Large = "L",
}

export interface AddonGroupRef {
  id: number;
  name: string;
}

export interface Addon {
  id: number;
  name: string;
  priceRub: number;
  isActive: boolean;
  addonGroup?: AddonGroupRef;
}

export interface AddonGroup {
  id: number;
  name: string;
  sortOrder?: number;
  isActive: boolean;
  addons: Addon[];
}

export interface ProductGroupRef {
  id: number;
  name: string;
}

export interface ProductPrice {
  id: number;
  sizeCode?: SizeCode;
  priceRub: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  group: ProductGroupRef;
  name: string;
  description?: string | null;
  type: ProductType;
  isActive: boolean;
  isAvailable: boolean;
  sortOrder?: number;
  prices: ProductPrice[];
}

export interface ProductGroupAddonGroup {
  productGroupId: number;
  addonGroupId: number;
  productGroup?: ProductGroupRef;
  addonGroup?: AddonGroup;
}

export interface ProductGroup {
  id: number;
  name: string;
  sortOrder?: number;
  isActive: boolean;
  products: Product[];
  addonLinks: ProductGroupAddonGroup[];
}

export interface CreateProductGroupDto {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateProductDto {
  groupId: number;
  name: string;
  description?: string | null;
  type: ProductType;
  isActive?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface CreateProductPriceDto {
  productId: number;
  sizeCode?: SizeCode;
  priceRub?: number;
  isActive?: boolean;
}

export interface CreateAddonGroupDto {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateAddonDto {
  addonGroupId: number;
  name: string;
  priceRub?: number;
  isActive?: boolean;
}

export interface LinkAddonGroupDto {
  productGroupId: number;
  addonGroupId: number;
}

export interface AddCartItemAddonDto {
  addonId: number;
  quantity: number;
}

export interface AddCartItemDto {
  productId: number;
  sizeCode?: SizeCode;
  quantity: number;
  addons?: AddCartItemAddonDto[];
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CreateOrderDto {
  timeSlotId: number;
}

export interface OrdersFilterDto {
  status?: OrderStatus[];
  dateFrom?: string;
  dateTo?: string;
}

export enum OrderStatus {
  CREATED = "CREATED",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  READY = "READY",
  CLOSED = "CLOSED",
}

export interface UpdateOrderStatusDto {
  status: Exclude<OrderStatus, OrderStatus.REJECTED>;
}

export interface RejectOrderDto {
  reason: string;
}

export interface TimeSlot {
  id: number;
  date: string;
  timeFrom: string;
  timeTo: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
}

export interface CartItemAddon {
  id: number;
  addonName: string;
  quantity: number;
}

export interface CartItem {
  id: number;
  productName: string;
  sizeCode?: SizeCode;
  quantity: number;
  addons: CartItemAddon[];
}

export interface Cart {
  id: number;
  user: Pick<User, "id" | "name">;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemAddon {
  id: number;
  addonName: string;
  quantity: number;
  unitPriceRub: number;
  lineTotalRub: number;
}

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  sizeCode?: SizeCode;
  unitPriceRub: number;
  lineTotalRub: number;
  addons: OrderItemAddon[];
}

export interface Order {
  id: number;
  user: Pick<User, "id" | "name">;
  timeSlot: Pick<TimeSlot, "id" | "date" | "timeFrom" | "timeTo">;
  status: OrderStatus;
  slotTimeFrom: string;
  slotTimeTo: string;
  totalRub: number;
  rejectReason?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  readyAt?: string | null;
  closedAt?: string | null;
  updatedAt: string;
  items: OrderItem[];
}

export function isDrinkProduct(product: Product): boolean {
  return product.type === ProductType.Drink;
}
