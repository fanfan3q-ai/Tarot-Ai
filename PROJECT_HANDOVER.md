# 二十二道靈數密碼 — 完整專案交接文件

> 文件版本：v1.0 | 最後更新：2026-03-17 | 目前 checkpoint：`a190f440`

---

## 1. 專案概述

**網站名稱**：二十二道靈數密碼｜塔羅靈數解讀你的命運藍圖

**專案代號**：`tarot-numerology-app`

**網站類型**：全棧互動式 Web App（需資料庫 + 用戶系統 + 後端 API）

**核心目的**：以陳彩綺塔羅靈數系統為基礎，讓用戶輸入西元生日，即可獲得主命數、行為數、特質數與 2026 流年數的完整解析。採用「免費工具 → 積分解鎖 → 付費課程」的商業漏斗設計，引導用戶報名 $499 體驗課程，最終轉化為認證老師學員。

**目標受眾**：對塔羅、靈數、命理有興趣的 25-45 歲華語女性用戶，主要在台灣、香港、馬來西亞市場，以 Instagram 和 LINE 為主要社群渠道。

**整體風格**：神秘學氛圍。午夜深藍底色搭配香檳金文字，Cinzel Decorative 英文標題字體搭配 Noto Serif TC 中文字體，GSAP 星空粒子動畫背景（含流星效果），玻璃擬態（glassmorphism）卡片設計。

**線上網址**：
- 開發預覽：`https://3000-iq5u66mldsdk3f2kmv4w2-fca232e2.sg1.manus.computer`
- 正式域名：`tarotnumapp.manus.space`（已設定）

---

## 2. 功能需求清單

### 2.1 已完成功能

| 功能 | 狀態 | 說明 |
|------|------|------|
| 首頁 Hero 區 | ✅ | 標題、副標題、三層圖標說明（天賦本質/意識層/潛意識密碼）|
| 生日輸入表單 | ✅ 待優化 | 目前為下拉選單，**需改為直接輸入** |
| GSAP 星空粒子背景 | ✅ | Canvas 渲染，含流星效果，手機版自動降低粒子數 |
| 靈數計算邏輯 | ✅ | 主命數、行為數、特質數、流年數，16 項單元測試全過 |
| 1-21 號完整三層內容 | ✅ | 天賦本質 + 意識層解析 + 潛意識密碼（需積分解鎖）|
| 結果頁面 | ✅ | 三數字總覽卡片 + 天賦本質 + 意識層三段 + 積分牆 |
| 潛意識密碼積分牆 | ✅ 前端 | 模糊遮罩 + 解鎖按鈕 UI，後端邏輯尚未接通 |
| 2026 流年解析 | ✅ | 九種流年類型完整文案（1-9 號）|
| 課程 CTA | ✅ | $499 限時體驗價（原價 $999），含三項課程說明 |
| 積分獲取入口 UI | ✅ 前端 | 分享+10、邀請+20、圖卡+15、簽到+5 按鈕，後端未接通 |
| 資料庫 Schema | ✅ | users / profiles / points_log / referrals / shares 五張表 |
| 深色主題 CSS | ✅ | 完整 CSS 變數設定，OKLCH 色彩空間 |

### 2.2 未完成功能（待開發）

| 功能 | 優先級 | 說明 |
|------|--------|------|
| 生日輸入改為直接輸入 | 🔴 高 | 改為 `YYYY/MM/DD` 格式的文字輸入框，含即時驗證 |
| 翻牌儀式感動畫 | 🔴 高 | 提交生日後，先顯示 3D 翻牌動畫（揭開神秘面紗），再跳轉結果頁 |
| 塔羅牌圖片整合 | 🔴 高 | 將實際塔羅牌圖片對應到 1-21 號靈數，顯示在結果頁卡片上 |
| 後端積分系統 | 🔴 高 | tRPC 路由：查詢餘額、扣除積分解鎖內容、記錄交易 |
| 每日簽到 | 🔴 高 | 24 小時限制，Firestore timestamp 驗證防重複，+5 積分 |
| 分享連結追蹤 | 🟡 中 | 記錄分享點擊數與回流轉化率至 shares 表，觸發 +10 積分 |
| Canvas 分享圖卡 | 🟡 中 | 1080×1080px Instagram 格式，含靈數資訊與品牌元素 |
| 邀請碼系統 | 🟡 中 | 自動生成唯一邀請碼，雙向積分（邀請者+20、受邀者+10）|
| Gemini AI 潤色 | 🟢 低 | 8% 流量調用 Gemini 1.5 Flash 個性化文案潤色 |
| 手機版優化 | 🟡 中 | 生日輸入觸控優化、結果頁卡片堆疊佈局 |

---

## 3. 頁面結構

### 3.1 網站地圖（Sitemap）

```
/ (首頁)
├── 輸入生日 → 翻牌動畫 → /result?y=&m=&d=
│
/result (結果頁面)
├── 三數字總覽（主命數/行為數/特質數）
├── 天賦本質（免費）
├── 意識層三段解析（免費）
├── 潛意識密碼（需 50 積分）
├── 2026 流年解析
├── 積分獲取區塊
└── 課程 CTA

/share/:shareId (分享回流頁) ← 尚未建立
/invite/:code (邀請碼兌換頁) ← 尚未建立
```

### 3.2 各頁面主要內容區塊

**首頁 `/`**：可信度標籤（已為 12,847 人解讀）→ 主標題「二十二道靈數密碼」→ 三層說明圖標 → 生日輸入表單 → 開始解讀按鈕 → 牌面預覽輪播（5 張）→ 信任說明文字

**結果頁 `/result`**：頂部導覽列（返回/分享）→ 生日與星座顯示 → 三數字卡片 → 天賦本質金色引言框 → 核心天賦/成長課題雙欄 → 意識層三段（感情/職場/人際）→ 潛意識密碼積分牆 → 2026 流年解析卡 → 課程 CTA → 積分獲取行動區塊

---

## 4. 設計與素材

### 4.1 色彩系統

| 名稱 | 用途 | OKLCH | HEX 近似值 |
|------|------|-------|-----------|
| 午夜藍 | 主背景 | `oklch(0.13 0.03 260)` | `#070d1e` |
| 午夜藍淺 | 卡片背景 | `oklch(0.16 0.03 260)` | `#0d1530` |
| 香檳金 | 主色/標題 | `oklch(0.72 0.14 75)` | `#c8952a` |
| 香檳金淺 | hover 狀態 | `oklch(0.82 0.12 75)` | `#d9a94a` |
| 暖白 | 正文 | `oklch(0.92 0.01 80)` | `#ece8e0` |
| 靜音灰 | 次要文字 | `oklch(0.65 0.03 260)` | `#8a8fa8` |

### 4.2 字體設定

| 字體 | 用途 | 引入方式 |
|------|------|---------|
| Cinzel Decorative | 英文標題、數字 | Google Fonts CDN |
| Noto Serif TC | 中文標題、引言 | Google Fonts CDN |
| Noto Sans TC | 中文正文 | Google Fonts CDN |

### 4.3 自訂 CSS 元件類別

- `.text-gold-gradient`：金色漸層文字（用於主標題）
- `.glass-card`：玻璃擬態卡片（backdrop-blur + 半透明背景 + 金色邊框）
- `.soul-gift-box`：天賦本質引言框（左側金色邊線）
- `.paywall-blur`：積分牆模糊漸層遮罩
- `.border-gold-glow`：金色光暈邊框（用於流年卡片）
- `.animate-glow-pulse`：CTA 按鈕金色光暈脈衝動畫
- `.content-section`：內容層（z-index: 1，確保在粒子背景之上）

### 4.4 塔羅牌圖片（待整合）

用戶提供了「塔羅靈數診斷系統 - 圖片存儲位置與完整下載清單.docx」，包含 1-21 號塔羅牌的對應圖片資源。**此文件尚未讀取解析，需在下一個對話中處理。**

圖片整合計畫：上傳至 CDN（`manus-upload-file --webdev`），在結果頁面的三數字卡片上顯示對應塔羅牌圖片，並在翻牌動畫中使用。

---

## 5. 技術規格

### 5.1 技術棧

| 層次 | 技術 | 版本 |
|------|------|------|
| 前端框架 | React | 19.x |
| 建置工具 | Vite | 7.x |
| CSS 框架 | Tailwind CSS | 4.x |
| 動畫庫 | GSAP | 3.x |
| 路由 | Wouter | 3.x |
| UI 元件 | shadcn/ui + Radix UI | 最新 |
| 後端框架 | Express | 4.x |
| API 層 | tRPC | 11.x |
| ORM | Drizzle ORM | 0.44.x |
| 資料庫 | MySQL（TiDB 相容）| — |
| 認證 | Manus OAuth | — |
| 測試 | Vitest | 2.x |
| 語言 | TypeScript | 5.9.x |

### 5.2 資料庫 Schema

**`users` 表**（已擴展）：
```
id, openId, name, email, loginMethod, role,
points (積分餘額), inviteCode (唯一邀請碼),
createdAt, updatedAt, lastSignedIn, lastCheckinAt
```

**`profiles` 表**（靈數計算結果）：
```
id, userId, birthday, zodiacSign,
mainNumber, behaviorNumber, traitNumber, yearNumber, digitSum, birthDayNum,
unlockedSubconscious, unlockedYearReport,
createdAt, updatedAt
```

**`points_log` 表**（積分交易記錄）：
```
id, userId, action, amount, description, createdAt
```

**`referrals` 表**（邀請追蹤）：
```
id, inviterId, inviteeId, inviteCode, pointsAwarded, createdAt
```

**`shares` 表**（分享追蹤）：
```
id, userId, platform, shareUrl, cardImageUrl,
clickCount, conversionCount, pointsAwarded, createdAt
```

### 5.3 核心計算邏輯（`shared/numerology.ts`）

所有計算為純函數，無副作用：

- **主命數**：`calculateMainNumber(year, month, day)` — 將 YYYYMMDD 各位數加總，縮至個位數 (1-9)
- **行為數**：`calculateBehaviorNumber(digitSum, birthDay)` — `digitSum - birthDay`，若 ≥22 則再減 22
- **特質數**：`calculateTraitNumber(zodiacSign)` — 依星座查表（牡羊=4、金牛=5、雙子=6、巨蟹=7、獅子=8、處女=9、天秤=11、天蠍=1、射手=14、摩羯=10、水瓶=17、雙魚=18）
- **流年數**：`calculateYearNumber(2026, month, day)` — `2026 + month + day`，縮至個位數
- **星座判定**：`getZodiacSign(month, day)` — 依月日判定 12 星座

### 5.4 後端 API 路由（`server/routers.ts`）

目前已有：`auth.me`、`auth.logout`、`system.notifyOwner`

**待建立的 tRPC 路由**：
```typescript
profiles.calculate   // 計算靈數並儲存至 DB
points.balance       // 查詢用戶積分餘額
points.checkin       // 每日簽到（24h 驗證）+5 積分
points.deduct        // 扣除積分解鎖內容（-50 積分）
shares.track         // 記錄分享事件，觸發 +10 積分
referrals.create     // 生成邀請碼
referrals.redeem     // 兌換邀請碼，雙向發放積分
ai.personalize       // Gemini 個性化文案潤色（8% 流量）
```

### 5.5 環境變數（已注入，無需手動設定）

```
DATABASE_URL          MySQL 連線字串
JWT_SECRET            Session cookie 簽名密鑰
VITE_APP_ID           Manus OAuth 應用 ID
OAUTH_SERVER_URL      Manus OAuth 後端 URL
VITE_OAUTH_PORTAL_URL Manus 登入頁 URL
BUILT_IN_FORGE_API_URL Manus 內建 API URL（含 LLM）
BUILT_IN_FORGE_API_KEY Bearer token（server-side）
VITE_FRONTEND_FORGE_API_KEY Bearer token（frontend）
OWNER_OPEN_ID         管理員 OpenID
```

### 5.6 部署

- 平台：Manus 內建 Hosting
- 域名：`tarotnumapp.manus.space`（已設定）
- 發布方式：建立 checkpoint 後點擊管理介面的 Publish 按鈕

---

## 6. 內容文案

### 6.1 網站標題與 SEO

- **主標題**：二十二道靈數密碼
- **副標題**：你的生日，藏著宇宙給你的密碼
- **說明文字**：輸入生日，解讀你的主命數、行為數、特質數與 2026 流年運勢
- **Meta Description**：輸入生日，解讀你的主命數、行為數、特質數與2026流年運勢。基於陳彩綺塔羅靈數系統，揭示你的靈魂天賦與潛意識密碼。
- **可信度標籤**：基於陳彩綺塔羅靈數系統 · 已為 12,847 人解讀

### 6.2 三層內容架構（1-21 號全部完成）

每號包含六個欄位，已全部存入 `shared/tarotContent.ts`、`shared/tarotContent8to14.ts`、`shared/tarotContent15to21.ts`：

| 欄位 | 說明 | 是否免費 |
|------|------|---------|
| `soulGift` | 天賦本質（金色引言框）| ✅ 免費 |
| `consciousLayer` | 意識層三段解析（感情/職場/人際）| ✅ 免費 |
| `strengths` | 核心天賦（5 項標籤）| ✅ 免費 |
| `challenges` | 成長課題（3 項標籤）| ✅ 免費 |
| `subconsciousLayer` | 潛意識密碼 | 🔒 需 50 積分 |
| `courseCta` | 體驗課引導文案 | — |

### 6.3 號碼與牌名對應

| 號碼 | 中文牌名 | 英文牌名 | Emoji |
|------|---------|---------|-------|
| 1 | 魔術師 | The Magician | 🪄 |
| 2 | 女祭司 | The High Priestess | 🌙 |
| 3 | 女皇 | The Empress | 🌸 |
| 4 | 皇帝 | The Emperor | ⚡ |
| 5 | 教皇 | The Hierophant | 🌍 |
| 6 | 戀人 | The Lovers | 💖 |
| 7 | 戰車 | The Chariot | 🔍 |
| 8 | 力量 | Strength | 💎 |
| 9 | 隱士 | The Hermit | 🌟 |
| 10 | 命運之輪 | Wheel of Fortune | ♾️ |
| 11 | 正義 | The Justice | ⚖️ |
| 12 | 倒吊人 | The Hanged Man | 🌀 |
| 13 | 死神 | The Death | 🦋 |
| 14 | 節制 | The Temperance | 🌈 |
| 15 | 惡魔 | The Devil | 🔥 |
| 16 | 塔 | The Tower | 💥 |
| 17 | 星星 | The Star | ⭐ |
| 18 | 月亮 | The Moon | 🌕 |
| 19 | 太陽 | The Sun | ☀️ |
| 20 | 審判 | The Judgement | 📯 |
| 21 | 世界 | The World | 🌍 |

### 6.4 積分系統規則

| 行為 | 積分變化 |
|------|---------|
| 分享報告連結（有人點擊）| +10 |
| 邀請好友完成計算 | +20（邀請者）/ +10（受邀者）|
| 分享社群圖卡 | +15 |
| 每日簽到 | +5（24 小時限制）|
| 解鎖潛意識密碼 | -50 |

### 6.5 課程 CTA 文案

- **標題**：想要更深入了解你的 [牌名] 能量？
- **正文**：[每號個性化文案，存於 `courseCta` 欄位]
- **課程包含**：一對一靈數解讀、個人化行動方案、90 天能量追蹤
- **價格**：~~原價 $999~~ **$499 限時體驗價**
- **按鈕**：預約體驗課程
- **信任文字**：由陳彩綺認證塔羅靈數老師親自指導

### 6.6 2026 流年解析（9 種類型，全部完成）

存於 `shared/yearContent.ts`，每種類型包含：`title`、`emoji`、`keyword`、`overview`（年度總覽）、`love`（感情運勢）、`career`（事業運勢）、`advice`（年度金句）。

---

## 7. 目前進度

### 7.1 已完成的工作

**資料層（100% 完成）**：
- 資料庫 Schema 設計與遷移（5 張表）
- 核心計算邏輯（`shared/numerology.ts`，16 項單元測試全過）
- 1-21 號完整三層內容資料模組（`shared/tarotContent*.ts`）
- 2026 流年九種類型文案（`shared/yearContent.ts`）
- 靈數內容統一索引（`shared/tarotContentIndex.ts`）

**前端 UI（80% 完成）**：
- 全域深色主題（`client/src/index.css`）
- 字體引入（`client/index.html`）
- GSAP 星空粒子背景（`client/src/components/StarfieldBackground.tsx`）
- 首頁（`client/src/pages/Home.tsx`）— 生日輸入待改為直接輸入
- 結果頁面（`client/src/pages/Result.tsx`）— 積分牆後端未接通
- 路由設定（`client/src/App.tsx`）

**後端（20% 完成）**：
- 資料庫 Schema 與遷移
- 基礎 tRPC 路由（auth.me、auth.logout）
- 所有業務邏輯路由尚未建立

### 7.2 完整檔案清單

```
tarot-numerology-app/
├── client/
│   ├── index.html                          # 字體引入、SEO meta
│   └── src/
│       ├── App.tsx                         # 路由設定（/ 和 /result）
│       ├── index.css                       # 全域主題、自訂元件類別
│       ├── components/
│       │   └── StarfieldBackground.tsx     # GSAP 星空粒子背景
│       └── pages/
│           ├── Home.tsx                    # 首頁（含生日輸入表單）
│           └── Result.tsx                  # 結果頁面（三層內容展示）
├── drizzle/
│   └── schema.ts                           # 資料庫 Schema（5 張表）
├── server/
│   ├── db.ts                               # 資料庫查詢 helpers
│   ├── routers.ts                          # tRPC 路由（待擴展）
│   └── numerology.test.ts                  # 靈數計算單元測試（16 tests）
├── shared/
│   ├── numerology.ts                       # 核心計算邏輯（純函數）
│   ├── tarotContent.ts                     # 1-7 號內容資料
│   ├── tarotContent8to14.ts                # 8-14 號內容資料
│   ├── tarotContent15to21.ts               # 15-21 號內容資料
│   ├── tarotContentIndex.ts                # 統一索引（getCardContent）
│   └── yearContent.ts                      # 2026 流年九種類型文案
└── todo.md                                 # 功能追蹤清單
```

### 7.3 未完成的待辦事項

**緊急（下一步必做）**：

1. **讀取並整合塔羅牌圖片**（`塔羅靈數診斷系統_-_圖片存儲位置與完整下載清單.docx`）— 將圖片 URL 對應到 1-21 號靈數，上傳至 CDN
2. **生日輸入改為直接輸入**（`Home.tsx`）— 改為 `YYYY/MM/DD` 格式文字輸入，含即時驗證與錯誤提示
3. **翻牌儀式感動畫**（新元件 `CardRevealAnimation.tsx`）— 提交生日後先顯示 3D 翻牌動畫（揭開神秘面紗），再跳轉結果頁

**中期（積分系統）**：

4. **後端 tRPC 路由**（`server/routers.ts`）— 建立 profiles、points、shares、referrals 路由
5. **積分牆後端接通**（`Result.tsx`）— 連接 `points.deduct` mutation，真實扣除積分
6. **每日簽到功能** — 24 小時 timestamp 驗證
7. **分享連結追蹤** — 生成帶 `shareId` 的追蹤連結，記錄點擊數

**後期（增長功能）**：

8. **Canvas 分享圖卡** — 1080×1080px Instagram 格式
9. **邀請碼系統** — 自動生成、雙向積分
10. **Gemini AI 潤色** — 8% 流量調用

---

## 8. 特殊需求與注意事項

### 8.1 計算邏輯精確性

靈數計算公式必須嚴格遵守陳彩綺系統：
- **主命數**：西元年月日所有數字加總（例如 1990/03/15 = 1+9+9+0+0+3+1+5 = 28 → 2+8 = 10 → 1+0 = **1**）
- **行為數**：`digitSum - birthDay`（例如 28-15 = 13），若結果 ≥22 則再減 22
- **特質數**：依星座查固定對應表，不做縮減（例如天秤=11，射手=14）
- **流年數**：`2026 + 生日月 + 生日日`，縮至個位數

### 8.2 積分防刷機制

- 每日簽到：以 `lastCheckinAt` 欄位驗證，必須距上次簽到 ≥24 小時
- 分享積分：以 `shares.pointsAwarded` 布林值確保每次分享只發放一次
- 邀請積分：以 `referrals.pointsAwarded` 布林值確保每對邀請關係只發放一次
- 同一邀請碼不可重複兌換

### 8.3 翻牌動畫設計要求

用戶明確要求「有儀式感、揭開神秘面紗的感覺」。建議實作方式：
- 全螢幕覆蓋的暗色遮罩
- 中央顯示一張正面朝下的塔羅牌（帶金色邊框）
- 粒子光效從四周聚集
- 牌面緩慢 3D 翻轉（rotateY 0° → 180°），揭示用戶的主命數牌面
- 配合神秘感的文字（「宇宙正在解讀你的密碼...」）
- 動畫完成後自動跳轉結果頁

### 8.4 塔羅牌圖片整合注意事項

- 圖片必須上傳至 CDN（`manus-upload-file --webdev`），不可存放在 `client/public/` 目錄
- 每張牌需要兩個版本：正面（顯示牌面）和背面（翻牌動畫用）
- 圖片 URL 應存入 `shared/tarotContent.ts` 的 `imageUrl` 欄位（目前尚未加入此欄位）

### 8.5 商業模型轉化漏斗

```
免費工具（首頁計算）
    ↓ 看到天賦本質 + 意識層解析（免費）
    ↓ 被潛意識密碼吸引（積分牆）
    ↓ 分享/邀請獲取積分
    ↓ 解鎖潛意識密碼
    ↓ 看到課程 CTA（$499 體驗課）
    ↓ 轉化為付費學員
    ↓ 認證老師（長期目標）
```

### 8.6 平台限制

- 本專案部署在 Manus 平台，不使用 Firebase（原計畫書提及，但實際改用 Manus 內建的 MySQL + tRPC 架構）
- 認證系統使用 Manus OAuth，不使用 Firebase Auth
- 圖片儲存使用 Manus S3 helper，不使用 Firebase Storage
- 部署使用 Manus Hosting，不使用 Firebase Hosting

---

*本文件由 Manus AI 自動生成，版本 v1.0，checkpoint `a190f440`。*
