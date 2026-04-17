import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";
import { banglaBadWords } from "./datasets";

// English matcher (unchanged)
export const badwordsMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// Bangla matcher: normalize unicode then test each word as a word-boundary regex
const banglaPatterns = banglaBadWords.map(
  (word) => new RegExp(word.normalize("NFC"), "u")
);

export function containsBanglaSwear(input: string): boolean {
  const normalized = input.normalize("NFC");
  return banglaPatterns.some((pattern) => pattern.test(normalized));
}

export function containsProfanity(input: string): boolean {
  return badwordsMatcher.hasMatch(input) || containsBanglaSwear(input);
}
