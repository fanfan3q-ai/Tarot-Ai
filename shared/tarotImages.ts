/**
 * Tarot Card Image URLs — CDN mapping for cards 0-21
 * Images hosted on AWS CloudFront CDN.
 */

const CDN_BASE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663391558975/oXdMK86fqsJKPKfV4ifck6/";

/** Filename mapping for each tarot card (0-21) */
const CARD_FILENAMES: Record<number, string> = {
  0: "tarot-card-00-fool-YCEqcEgxMXFCfKvBMUhxQi.webp",
  1: "tarot-card-01-magician-hjUPcTfq2Dk8M7YjgzvVQa.webp",
  2: "tarot-card-02-priestess-HbYL98WPAS7mgSJdTo2Csa.webp",
  3: "tarot-card-03-empress-UxmgSgqNzHw6T6Hkak3oAz.webp",
  4: "tarot-card-04-emperor-FtKmjEeFrNa5PGZT2LZj9H.webp",
  5: "tarot-card-05-hierophant-PTpTEGFRBsoNG26VZxWpCD.webp",
  6: "tarot-card-06-lovers-arbhQnPyfkuqeMDvL3R27r.webp",
  7: "tarot-card-07-chariot-VnTqtbmFTJmGsKCEaF5rpT.webp",
  8: "tarot-card-08-strength-9CPf4fustSmK36ypsh6by8.webp",
  9: "tarot-card-09-hermit-eqJXY7jCfg7w3c4pozEmEh.webp",
  10: "tarot-card-10-wheel-kSHX2uraG9F2Ub9uAtwLmt.webp",
  11: "tarot-card-11-justice-bYhRQZv6abrPpbssirxGuv.webp",
  12: "tarot-card-12-hanged-man-4bvuSKDX55nx4cXy2E8eLC.webp",
  13: "tarot-card-13-death-m39oaD4BxzudbZDSreUbkb.webp",
  14: "tarot-card-14-temperance-LPGC3wJxfsfuf2RwJFd46j.webp",
  15: "tarot-card-15-devil-hqEMDXPhBMeyDZBVhjARxP.webp",
  16: "tarot-card-16-tower-HemRhsprzJU6KE3FRULtet.webp",
  17: "tarot-card-17-star-XtXzb24cwzYKooKUiK7dtH.webp",
  18: "tarot-card-18-moon-KK3fs5QSy3zerfWZxdjXmK.webp",
  19: "tarot-card-19-sun-kr7gPB6LWtYUdxXUWZt5QM.webp",
  20: "tarot-card-20-judgement-WLHDZ58B52ZMJrCSRoRPcS.webp",
  21: "tarot-card-21-world-LQ94arFqaLyXPJgGrxjH6B.webp",
};

/** Background parchment image URL */
export const PARCHMENT_BG_URL = `${CDN_BASE}parchment-bg-main-VNrxkfe5Vjuu7s4Qobwk9g.webp`;

/** Get the CDN URL for a specific tarot card number (0-21) */
export function getCardImageUrl(number: number): string | undefined {
  const filename = CARD_FILENAMES[number];
  if (!filename) return undefined;
  return `${CDN_BASE}${filename}`;
}

/** Get all card image URLs as a record */
export const CARD_IMAGE_URLS: Record<number, string> = Object.fromEntries(
  Object.entries(CARD_FILENAMES).map(([num, filename]) => [
    Number(num),
    `${CDN_BASE}${filename}`,
  ])
);
