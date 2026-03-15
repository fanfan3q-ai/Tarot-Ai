/**
 * Tarot Numerology Core Calculation Logic
 * Based on 陳彩綺 Tarot Numerology System
 *
 * All functions are pure — no side effects, no DB calls.
 */

// ─── Zodiac → Trait Number Mapping ───────────────────────────────────
export const ZODIAC_TRAIT_MAP: Record<string, number> = {
  aries: 4,       // 牡羊
  taurus: 5,      // 金牛
  gemini: 6,      // 雙子
  cancer: 7,      // 巨蟹
  leo: 8,         // 獅子
  virgo: 9,       // 處女
  libra: 11,      // 天秤
  scorpio: 1,     // 天蠍
  sagittarius: 14, // 射手
  capricorn: 10,  // 摩羯
  aquarius: 17,   // 水瓶
  pisces: 18,     // 雙魚
};

export const ZODIAC_NAMES_ZH: Record<string, string> = {
  aries: "牡羊座",
  taurus: "金牛座",
  gemini: "雙子座",
  cancer: "巨蟹座",
  leo: "獅子座",
  virgo: "處女座",
  libra: "天秤座",
  scorpio: "天蠍座",
  sagittarius: "射手座",
  capricorn: "摩羯座",
  aquarius: "水瓶座",
  pisces: "雙魚座",
};

// ─── Zodiac Determination ────────────────────────────────────────────
/**
 * Determine zodiac sign from month and day.
 * Returns lowercase English key (e.g. 'aries').
 */
export function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "gemini";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "libra";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "scorpio";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces"; // (month === 2 && day >= 19) || (month === 3 && day <= 20)
}

// ─── Digit Sum Helpers ───────────────────────────────────────────────
/**
 * Sum all digits of a number. E.g. 1990 → 1+9+9+0 = 19
 */
export function sumDigits(n: number): number {
  return Math.abs(n)
    .toString()
    .split("")
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

/**
 * Reduce a number to a single digit (1-9) by repeatedly summing its digits.
 * E.g. 28 → 2+8=10 → 1+0=1
 */
export function reduceToSingleDigit(n: number): number {
  let result = Math.abs(n);
  while (result > 9) {
    result = sumDigits(result);
  }
  return result;
}

// ─── Main Number (主命數 / 潛意識) ──────────────────────────────────
/**
 * Calculate the Main Number (主命數).
 * Sum all digits of the full birthday (YYYYMMDD) and reduce to single digit (1-9).
 *
 * Example: 1990-03-15
 *   1+9+9+0+0+3+1+5 = 28 → 2+8 = 10 → 1+0 = 1
 *   Main Number = 1
 */
export function calculateMainNumber(year: number, month: number, day: number): { mainNumber: number; digitSum: number } {
  const dateStr = `${year}${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}`;
  const digitSum = dateStr.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  const mainNumber = reduceToSingleDigit(digitSum);
  return { mainNumber, digitSum };
}

// ─── Behavior Number (行為數) ────────────────────────────────────────
/**
 * Calculate the Behavior Number (行為數).
 * Formula: digitSum - birthDay. If result >= 22, subtract 22.
 *
 * Example: digitSum=28, birthDay=15 → 28-15 = 13
 * Example: digitSum=38, birthDay=5 → 38-5 = 33 → 33-22 = 11
 */
export function calculateBehaviorNumber(digitSum: number, birthDay: number): number {
  let behavior = digitSum - birthDay;
  if (behavior >= 22) {
    behavior -= 22;
  }
  // Handle edge case: if negative (shouldn't happen with valid dates), take absolute
  if (behavior < 0) {
    behavior = Math.abs(behavior);
  }
  return behavior;
}

// ─── Trait Number (特質數) ───────────────────────────────────────────
/**
 * Calculate the Trait Number (特質數).
 * Based on zodiac sign → tarot card mapping.
 */
export function calculateTraitNumber(zodiacSign: string): number {
  return ZODIAC_TRAIT_MAP[zodiacSign] ?? 0;
}

// ─── Year Number (流年數) ────────────────────────────────────────────
/**
 * Calculate the Year Number (流年數) for a given year.
 * Formula: targetYear + birthMonth + birthDay, reduce to single digit.
 *
 * Example: 2026 + 3 + 15 = 2044 → 2+0+4+4 = 10 → 1+0 = 1
 */
export function calculateYearNumber(targetYear: number, month: number, day: number): number {
  const total = targetYear + month + day;
  return reduceToSingleDigit(total);
}

// ─── Full Calculation ────────────────────────────────────────────────
export interface NumerologyResult {
  birthday: string;       // YYYY-MM-DD
  year: number;
  month: number;
  day: number;
  zodiacSign: string;     // e.g. 'aries'
  zodiacNameZh: string;   // e.g. '牡羊座'
  mainNumber: number;     // 主命數 (1-9)
  behaviorNumber: number; // 行為數
  traitNumber: number;    // 特質數
  yearNumber: number;     // 流年數
  digitSum: number;       // 各位數總和
}

/**
 * Calculate all numerology numbers from a birthday.
 */
export function calculateNumerology(year: number, month: number, day: number, targetYear = 2026): NumerologyResult {
  const zodiacSign = getZodiacSign(month, day);
  const zodiacNameZh = ZODIAC_NAMES_ZH[zodiacSign] ?? "";
  const { mainNumber, digitSum } = calculateMainNumber(year, month, day);
  const behaviorNumber = calculateBehaviorNumber(digitSum, day);
  const traitNumber = calculateTraitNumber(zodiacSign);
  const yearNumber = calculateYearNumber(targetYear, month, day);

  return {
    birthday: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    year,
    month,
    day,
    zodiacSign,
    zodiacNameZh,
    mainNumber,
    behaviorNumber,
    traitNumber,
    yearNumber,
    digitSum,
  };
}
