import { describe, expect, it } from "vitest";
import {
  calculateMainNumber,
  calculateBehaviorNumber,
  calculateTraitNumber,
  calculateYearNumber,
  calculateNumerology,
  getZodiacSign,
  reduceToSingleDigit,
  sumDigits,
} from "../shared/numerology";

describe("sumDigits", () => {
  it("sums digits of a number", () => {
    expect(sumDigits(1990)).toBe(19); // 1+9+9+0
    expect(sumDigits(28)).toBe(10);   // 2+8
    expect(sumDigits(0)).toBe(0);
    expect(sumDigits(5)).toBe(5);
  });
});

describe("reduceToSingleDigit", () => {
  it("reduces to single digit", () => {
    expect(reduceToSingleDigit(28)).toBe(1);  // 28→10→1
    expect(reduceToSingleDigit(19)).toBe(1);  // 19→10→1
    expect(reduceToSingleDigit(9)).toBe(9);
    expect(reduceToSingleDigit(11)).toBe(2);  // 11→2
    expect(reduceToSingleDigit(33)).toBe(6);  // 33→6
  });
});

describe("getZodiacSign", () => {
  it("returns correct zodiac for boundary dates", () => {
    expect(getZodiacSign(3, 21)).toBe("aries");
    expect(getZodiacSign(4, 19)).toBe("aries");
    expect(getZodiacSign(4, 20)).toBe("taurus");
    expect(getZodiacSign(12, 22)).toBe("capricorn");
    expect(getZodiacSign(1, 19)).toBe("capricorn");
    expect(getZodiacSign(1, 20)).toBe("aquarius");
    expect(getZodiacSign(2, 19)).toBe("pisces");
    expect(getZodiacSign(3, 20)).toBe("pisces");
  });

  it("returns correct zodiac for mid-month dates", () => {
    expect(getZodiacSign(7, 15)).toBe("cancer");
    expect(getZodiacSign(8, 15)).toBe("leo");
    expect(getZodiacSign(10, 1)).toBe("libra");
  });
});

describe("calculateMainNumber", () => {
  it("calculates main number for 1990-03-15", () => {
    // 1+9+9+0+0+3+1+5 = 28 → 2+8=10 → 1+0=1
    const result = calculateMainNumber(1990, 3, 15);
    expect(result.digitSum).toBe(28);
    expect(result.mainNumber).toBe(1);
  });

  it("calculates main number for 1985-12-25", () => {
    // 1+9+8+5+1+2+2+5 = 33 → 3+3=6
    const result = calculateMainNumber(1985, 12, 25);
    expect(result.digitSum).toBe(33);
    expect(result.mainNumber).toBe(6);
  });

  it("calculates main number for 2000-01-01", () => {
    // 2+0+0+0+0+1+0+1 = 4
    const result = calculateMainNumber(2000, 1, 1);
    expect(result.digitSum).toBe(4);
    expect(result.mainNumber).toBe(4);
  });
});

describe("calculateBehaviorNumber", () => {
  it("calculates behavior number normally", () => {
    // digitSum=28, day=15 → 28-15=13
    expect(calculateBehaviorNumber(28, 15)).toBe(13);
  });

  it("subtracts 22 when result >= 22", () => {
    // digitSum=38, day=5 → 38-5=33 → 33-22=11
    expect(calculateBehaviorNumber(38, 5)).toBe(11);
  });

  it("handles small results", () => {
    // digitSum=10, day=5 → 10-5=5
    expect(calculateBehaviorNumber(10, 5)).toBe(5);
  });
});

describe("calculateTraitNumber", () => {
  it("maps zodiac to correct tarot card number", () => {
    expect(calculateTraitNumber("aries")).toBe(4);
    expect(calculateTraitNumber("taurus")).toBe(5);
    expect(calculateTraitNumber("libra")).toBe(11);
    expect(calculateTraitNumber("scorpio")).toBe(1);
    expect(calculateTraitNumber("pisces")).toBe(18);
    expect(calculateTraitNumber("aquarius")).toBe(17);
  });
});

describe("calculateYearNumber", () => {
  it("calculates 2026 year number for March 15", () => {
    // 2026+3+15=2044 → 2+0+4+4=10 → 1+0=1
    expect(calculateYearNumber(2026, 3, 15)).toBe(1);
  });

  it("calculates 2026 year number for December 25", () => {
    // 2026+12+25=2063 → 2+0+6+3=11 → 1+1=2
    expect(calculateYearNumber(2026, 12, 25)).toBe(2);
  });
});

describe("calculateNumerology (full integration)", () => {
  it("returns complete result for 1990-03-15", () => {
    const result = calculateNumerology(1990, 3, 15);
    expect(result.birthday).toBe("1990-03-15");
    expect(result.zodiacSign).toBe("pisces");
    expect(result.zodiacNameZh).toBe("雙魚座");
    expect(result.mainNumber).toBe(1);
    expect(result.behaviorNumber).toBe(13); // 28-15=13
    expect(result.traitNumber).toBe(18);    // pisces=18
    expect(result.yearNumber).toBe(1);      // 2026+3+15=2044→1
    expect(result.digitSum).toBe(28);
  });

  it("returns complete result for 1985-07-23", () => {
    const result = calculateNumerology(1985, 7, 23);
    // 1+9+8+5+0+7+2+3 = 35 → 3+5=8
    expect(result.mainNumber).toBe(8);
    // 35-23=12
    expect(result.behaviorNumber).toBe(12);
    // July 23 = Leo = 8
    expect(result.zodiacSign).toBe("leo");
    expect(result.traitNumber).toBe(8);
    // 2026+7+23=2056 → 2+0+5+6=13 → 1+3=4
    expect(result.yearNumber).toBe(4);
  });
});
