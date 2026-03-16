import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with points balance and invite code for the tarot numerology app.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  points: int("points").default(0).notNull(),
  isFirstCalc: boolean("isFirstCalc").default(false).notNull(),
  inviteCode: varchar("inviteCode", { length: 16 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  lastCheckinAt: timestamp("lastCheckinAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Numerology profiles — stores calculated results per user per birthday.
 */
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  birthday: varchar("birthday", { length: 10 }).notNull(), // YYYY-MM-DD
  zodiacSign: varchar("zodiacSign", { length: 10 }).notNull(),
  mainNumber: int("mainNumber").notNull(),       // 主命數 (1-9)
  behaviorNumber: int("behaviorNumber").notNull(), // 行為數
  traitNumber: int("traitNumber").notNull(),       // 特質數
  yearNumber: int("yearNumber").notNull(),         // 2026 流年數
  digitSum: int("digitSum").notNull(),             // 各位數總和 (for behavior calc)
  birthDayNum: int("birthDayNum").notNull(),       // 出生日 (day of month)
  unlockedSubconscious: boolean("unlockedSubconscious").default(false).notNull(),
  unlockedYearReport: boolean("unlockedYearReport").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Points transaction log — every credit/debit is recorded here.
 */
export const pointsLog = mysqlTable("points_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 32 }).notNull(),
  amount: int("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointsLogEntry = typeof pointsLog.$inferSelect;

/**
 * Referral tracking — who invited whom, and whether points were awarded.
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  inviterId: int("inviterId").notNull(),
  inviteeId: int("inviteeId").notNull(),
  inviteCode: varchar("inviteCode", { length: 16 }).notNull(),
  pointsAwarded: boolean("pointsAwarded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;

/**
 * Share tracking — records each share event and its click/conversion metrics.
 */
export const shares = mysqlTable("shares", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 32 }).notNull(),
  shareUrl: text("shareUrl"),
  cardImageUrl: text("cardImageUrl"),
  clickCount: int("clickCount").default(0).notNull(),
  conversionCount: int("conversionCount").default(0).notNull(),
  pointsAwarded: boolean("pointsAwarded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Share = typeof shares.$inferSelect;
