import type { NewsletterOverrides } from "./rpc/newsletter";
import type { PaymentsOverrides } from "./rpc/payments";
import type { PlatformOverrides } from "./rpc/platform";
import type { MessagingOverrides } from "./rpc/platform/messaging";
import type { PlatformServiceOverrides } from "./rpc/platform/service";
import type { PaginationOverrides } from "./rpc/shared/pagination";
import type { CheckoutOverrides } from "./rpc/shop/checkout";
import type { OrdersOverrides } from "./rpc/shop/orders";
import type { ShopProductsOverrides } from "./rpc/shop/products";
import type { ShopSettingsOverrides } from "./rpc/shop/settings";
import type { StorefrontOverrides } from "./rpc/shop/storefront";
import type { Database as GeneratedDatabase } from "./supabase";

export type RpcOverrides = ShopProductsOverrides &
  ShopSettingsOverrides &
  StorefrontOverrides &
  CheckoutOverrides &
  OrdersOverrides &
  PaginationOverrides &
  PlatformOverrides &
  PlatformServiceOverrides &
  MessagingOverrides &
  NewsletterOverrides &
  PaymentsOverrides;

type GeneratedFunctions = GeneratedDatabase["public"]["Functions"];

type OverriddenFunctions = {
  [K in keyof GeneratedFunctions]: K extends keyof RpcOverrides
    ? Omit<GeneratedFunctions[K], "Args" | "Returns"> & {
        Args: GeneratedFunctions[K]["Args"];
        Returns: RpcOverrides[K];
      }
    : GeneratedFunctions[K];
};

// Compile-time guard: fails if any override key no longer matches a generated RPC.
type OrphanedRpcOverrides = Exclude<
  keyof RpcOverrides,
  keyof GeneratedFunctions
>;

export type AssertNoOrphans = [OrphanedRpcOverrides] extends [never]
  ? true
  : never;

export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<GeneratedDatabase["public"], "Functions"> & {
    Functions: OverriddenFunctions;
  };
};

export * from "./contracts/activity";
export * from "./rpc/newsletter";
export * from "./rpc/payments";
export * from "./rpc/platform";
export * from "./rpc/platform/messaging";
export * from "./rpc/platform/service";
export * from "./rpc/shared/pagination";
export * from "./rpc/shop/checkout";
export * from "./rpc/shop/orders";
export * from "./rpc/shop/primitives";
export * from "./rpc/shop/products";
export * from "./rpc/shop/settings";
export * from "./rpc/shop/storefront";
