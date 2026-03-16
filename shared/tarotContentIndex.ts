/**
 * Unified Tarot Content Index — merges all 0-21 card content
 */
import type { TarotCardContent } from "./tarotContent";
import { TAROT_CONTENT } from "./tarotContent";
import { TAROT_CONTENT_8_14 } from "./tarotContent8to14";
import { TAROT_CONTENT_15_21 } from "./tarotContent15to21";

export type { TarotCardContent };

/** Complete 0-21 tarot card content map */
export const ALL_TAROT_CONTENT: Record<number, TarotCardContent> = {
  ...TAROT_CONTENT,
  ...TAROT_CONTENT_8_14,
  ...TAROT_CONTENT_15_21,
};

/** Get content for a specific card number (0-21) */
export function getCardContent(number: number): TarotCardContent | undefined {
  return ALL_TAROT_CONTENT[number];
}

/** Card name mapping for quick lookups */
export const CARD_NAMES: Record<number, { zh: string; en: string; emoji: string }> = {};
for (let i = 0; i <= 21; i++) {
  const card = ALL_TAROT_CONTENT[i];
  if (card) {
    CARD_NAMES[i] = { zh: card.nameZh, en: card.nameEn, emoji: card.emoji };
  }
}
