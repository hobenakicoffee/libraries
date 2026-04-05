import { describe, expect, test } from "bun:test";
import { getNewsletterPostLink } from "./get-newsletter-post-link";

describe("getNewsletterPostLink", () => {
  test("builds relative path without baseUrl", () => {
    const result = getNewsletterPostLink("johndoe", "my-post");
    expect(result).toBe("/@johndoe/posts/my-post");
  });

  test("builds absolute URL with baseUrl", () => {
    const result = getNewsletterPostLink(
      "johndoe",
      "my-post",
      "https://hobenaki.coffee"
    );
    expect(result).toBe("https://hobenaki.coffee/@johndoe/posts/my-post");
  });

  test("handles different usernames and slugs", () => {
    expect(getNewsletterPostLink("alice", "welcome-newsletter")).toBe(
      "/@alice/posts/welcome-newsletter"
    );
    expect(getNewsletterPostLink("bob", "updates-2024")).toBe(
      "/@bob/posts/updates-2024"
    );
  });
});
