import { describe, expect, test } from "bun:test";
import { productInfo, companyInfo } from "./legal";

describe("productInfo", () => {
  test("should have all required fields", () => {
    expect(productInfo).toHaveProperty("name");
    expect(productInfo).toHaveProperty("domain");
    expect(productInfo).toHaveProperty("twitterHandle");
    expect(productInfo).toHaveProperty("title");
    expect(productInfo).toHaveProperty("description");
    expect(productInfo).toHaveProperty("keywords");
  });

  test("should have correct types for fields", () => {
    expect(typeof productInfo.name).toBe("string");
    expect(typeof productInfo.domain).toBe("string");
    expect(typeof productInfo.twitterHandle).toBe("string");
    expect(typeof productInfo.title).toBe("string");
    expect(typeof productInfo.description).toBe("string");
    expect(typeof productInfo.keywords).toBe("string");
  });
});

describe("companyInfo", () => {
  test("should have all required fields", () => {
    expect(companyInfo).toHaveProperty("name");
    expect(companyInfo).toHaveProperty("contactEmail");
    expect(companyInfo).toHaveProperty("contactPhone");
    expect(companyInfo).toHaveProperty("contactLocation");
    expect(companyInfo).toHaveProperty("contactWhatsapp");
    expect(companyInfo).toHaveProperty("contactX");
    expect(companyInfo).toHaveProperty("contactFacebook");
    expect(companyInfo).toHaveProperty("contactYoutube");
    expect(companyInfo).toHaveProperty("contactLinkedin");
    expect(companyInfo).toHaveProperty("domain");
    expect(companyInfo).toHaveProperty("postalAddress");
  });

  test("should have correct types for fields", () => {
    expect(typeof companyInfo.name).toBe("string");
    expect(typeof companyInfo.contactEmail).toBe("string");
    expect(typeof companyInfo.contactPhone).toBe("string");
    expect(typeof companyInfo.contactLocation).toBe("string");
    expect(typeof companyInfo.contactWhatsapp).toBe("string");
    expect(typeof companyInfo.contactX).toBe("string");
    expect(typeof companyInfo.contactFacebook).toBe("string");
    expect(typeof companyInfo.contactYoutube).toBe("string");
    expect(typeof companyInfo.contactLinkedin).toBe("string");
    expect(typeof companyInfo.domain).toBe("string");
    expect(typeof companyInfo.postalAddress).toBe("object");
  });

  test("postalAddress should have all required fields", () => {
    const address = companyInfo.postalAddress;
    expect(address).toHaveProperty("streetAddress");
    expect(address).toHaveProperty("addressLocality");
    expect(address).toHaveProperty("addressRegion");
    expect(address).toHaveProperty("postalCode");
    expect(address).toHaveProperty("addressCountry");
  });
});
