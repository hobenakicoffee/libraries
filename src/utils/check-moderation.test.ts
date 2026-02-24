import { beforeEach, describe, expect, mock, test } from "bun:test";
import type OpenAI from "openai";
import { checkModeration } from "./check-moderation";

describe("checkModeration", () => {
  let mockOpenAiClient: OpenAI;
  let mockModerations: any;

  beforeEach(() => {
    mockModerations = {
      create: mock(async () => ({
        results: [
          {
            flagged: false,
            categories: {},
          },
        ],
      })),
    };

    mockOpenAiClient = {
      moderations: mockModerations,
    } as unknown as OpenAI;
  });

  test("returns OpenAI result when no profanity detected", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: true,
          categories: {
            hate: true,
            sexual: false,
          },
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "clean text");

    expect(result.flagged).toBe(true);
    expect(result.source).toBe("openai");
    expect(result.categories?.hate).toBe(true);
    expect(result.categories?.sexual).toBe(false);
    expect(result.error).toBeNull();
  });

  test("returns flagged false when OpenAI approves text", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: {},
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "safe text");

    expect(result.flagged).toBe(false);
    expect(result.source).toBe("openai");
    expect(result.error).toBeNull();
  });

  test("calls OpenAI moderations API with correct model", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: {},
        },
      ],
    }));

    const testText = "test content";
    await checkModeration(mockOpenAiClient, testText);

    expect(mockModerations.create).toHaveBeenCalledWith({
      model: "omni-moderation-latest",
      input: testText,
    });
  });

  test("returns error object when OpenAI API throws", async () => {
    const testError = new Error("API Error");
    mockModerations.create = mock(() => {
      throw testError;
    });

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result.flagged).toBe(false);
    expect(result.categories).toBeNull();
    expect(result.error).toBe(testError);
    expect(result.source).toBeNull();
  });

  test("returns error with stack trace when API fails", async () => {
    const testError = new Error("Network error");
    mockModerations.create = mock(() => {
      throw testError;
    });

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(typeof result.error).toBe("object");
    expect(result.source).toBeNull();
  });

  test("returns proper result structure for OpenAI case", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: {},
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result).toHaveProperty("flagged");
    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("source");
  });

  test("returns proper result structure for error case", async () => {
    mockModerations.create = mock(() => {
      throw new Error("Test error");
    });

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result).toHaveProperty("flagged");
    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("source");
  });

  test("handles OpenAI result with null categories", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: null,
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result.categories).toBeNull();
    expect(result.source).toBe("openai");
  });

  test("handles empty OpenAI results array gracefully", async () => {
    mockModerations.create = mock(async () => ({
      results: [],
    }));

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result.flagged).toBe(false);
    expect(result.categories).toBeNull();
    expect(result.source).toBe("openai");
  });

  test("handles empty text input", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: {},
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "");

    expect(result.source).toBe("openai");
    expect(result.error).toBeNull();
  });

  test("handles special characters in text", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: {},
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "test!@#$%^&*()");

    expect(result.source).toBe("openai");
    expect(result.error).toBeNull();
  });

  test("handles very long text", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: {},
        },
      ],
    }));

    const longText = "test ".repeat(10_000);
    const result = await checkModeration(mockOpenAiClient, longText);

    expect(result.source).toBe("openai");
    expect(result.error).toBeNull();
  });

  test("returns source as null on error", async () => {
    mockModerations.create = mock(() => {
      throw new Error("API Error");
    });

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result.source).toBeNull();
  });

  test("returns flagged as false when error occurs", async () => {
    mockModerations.create = mock(() => {
      throw new Error("API Error");
    });

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result.flagged).toBe(false);
  });

  test("handles multiple category flags", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: true,
          categories: {
            hate: true,
            sexual: true,
            violence: true,
            harassment: false,
          },
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result.flagged).toBe(true);
    expect(result.categories?.hate).toBe(true);
    expect(result.categories?.sexual).toBe(true);
    expect(result.categories?.violence).toBe(true);
  });

  test("passes input to OpenAI exactly as provided", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: {},
        },
      ],
    }));

    const customText = "Custom text with special @#$ chars";
    await checkModeration(mockOpenAiClient, customText);

    const callArgs = mockModerations.create.mock.calls[0][0];
    expect(callArgs.input).toBe(customText);
  });

  test("preserves error details in result", async () => {
    const errorMessage = "Specific API Error";
    mockModerations.create = mock(() => {
      throw new Error(errorMessage);
    });

    const result = await checkModeration(mockOpenAiClient, "test");

    expect((result.error as Error).message).toBe(errorMessage);
  });

  test("handles undefined OpenAI result fields", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: undefined,
          categories: undefined,
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "test");

    expect(result.flagged).toBe(false);
    expect(result.categories).toBeNull();
  });

  test("correctly identifies moderation source as openai", async () => {
    mockModerations.create = mock(async () => ({
      results: [
        {
          flagged: false,
          categories: {},
        },
      ],
    }));

    const result = await checkModeration(mockOpenAiClient, "clean content");

    expect(result.source).toBe("openai");
    expect(result.source).not.toBe("profanity");
    expect(result.source).not.toBeNull();
  });
});
