import type OpenAI from "openai";
import { moderateText } from "../moderation";

export async function checkModeration(openaiClient: OpenAI, text: string) {
  try {
    const profanityResult = moderateText(text);

    if (!profanityResult.isAllowed) {
      return {
        flagged: true,
        categories: null,
        error: null,
        source: "profanity" as const,
        profaneWords: profanityResult.matched,
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
