import { describe, expect, test } from "bun:test";
import { getProductLink } from "./get-product-link";

describe("getProductLink", () => {
  test("builds product link with default baseUrl", () => {
    const result = getProductLink("johndoe", "my-product");
    expect(result).toBe(
      "https://hobenakicoffee.com/@johndoe/shop/products/my-product"
    );
  });

  test("builds product link with custom baseUrl", () => {
    const result = getProductLink(
      "johndoe",
      "my-product",
      "https://custom.com"
    );
    expect(result).toBe("https://custom.com/@johndoe/shop/products/my-product");
  });

  test("sanitizes username with whitespace", () => {
    const result = getProductLink(" john doe ", "my-product");
    expect(result).toBe(
      "https://hobenakicoffee.com/@johndoe/shop/products/my-product"
    );
  });

  test("does not encode slug - passes through as-is", () => {
    const result = getProductLink("johndoe", "my product 123");
    expect(result).toBe(
      "https://hobenakicoffee.com/@johndoe/shop/products/my-product-123"
    );
  });
});
