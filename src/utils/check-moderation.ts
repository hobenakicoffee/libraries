import type OpenAI from "openai";
import { containsProfanity } from "../moderation";

export async function checkModeration(openaiClient: OpenAI, text: string) {
  try {
    const hasProfanity = containsProfanity(text);

    if (hasProfanity) {
      return {
        flagged: true,
        categories: null,
        error: null,
        source: "profanity" as const,
      };
    }

    const moderation = await openaiClient.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = moderation.results[0];
    return {
      flagged: result?.flagged ?? false,
      categories: result?.categories ?? null,
      error: null,
      source: "openai" as const,
    };
  } catch (err) {
    return {
      flagged: false,
      categories: null,
      error: err,
      source: null,
    };
  }
}
