import { checkProfanity } from "glin-profanity";
import { banglaBadWords } from "./datasets";
import { normalizeLeetspeak, normalizeUnicode } from "./normalizer";

export interface ModerationResult {
  isAllowed: boolean;
  matched: string[];
}

export function checkBanglaWords(text: string): string[] {
  const matches: string[] = [];

  for (const word of banglaBadWords) {
    const lowerWord = word.toLowerCase();
    const normalized = normalizeUnicode(normalizeLeetspeak(lowerWord));
    if (text.includes(normalized)) {
      matches.push(lowerWord);
    }
  }

  return matches;
}

export function moderateText(input?: string): ModerationResult {
  if (!input) {
    return { isAllowed: true, matched: [] };
  }

  const lower = input.toLowerCase();
  const normalized = normalizeUnicode(normalizeLeetspeak(lower));

  const matched: string[] = [];

  // 1️⃣ English profanity via glin
  const { containsProfanity, matches } = checkProfanity(normalized, {
    languages: ["english"],
  });

  if (containsProfanity && matches) {
    matched.push(...matches.map((m) => m.word));
  }

  // 2️⃣ Bangla script
  matched.push(...checkBanglaWords(normalized));

  return {
    isAllowed: matched.length === 0,
    matched,
  };
}
