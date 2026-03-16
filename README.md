# 二十二道靈數密碼

> 基於陳彩綺塔羅靈數系統的互動式命運解析應用。輸入西元生日，即可獲得主命數、行為數、特質數與 2026 流年數的完整三層解析。

**線上網址**：[tarotnumapp.manus.space](https://tarotnumapp.manus.space)

---

## 目錄

- [專案概述](#專案概述)
- [技術棧](#技術棧)
- [本地開發環境啟動](#本地開發環境啟動)
- [環境變數說明](#環境變數說明)
- [資料庫設定](#資料庫設定)
- [專案結構](#專案結構)
- [核心演算法](#核心演算法)
- [商業模型](#商業模型)
- [部署說明](#部署說明)
- [開發規範](#開發規範)

---

## 專案概述

本專案是一個全棧互動式 Web App，採用「免費工具 → 積分解鎖 → 付費課程」的商業漏斗設計。用戶輸入生日後，系統計算四個靈數，並展示三層遞進內容：

| 層次 | 內容 | 存取方式 |
|------|------|---------|
| 天賦本質 | 靈魂天賦的金色引言框 | 免費開放 |
| 意識層解析 | 感情模式、職場特質、人際動態 | 免費開放 |
| 潛意識密碼 | 深層心理密碼與行動指引 | 需 50 積分解鎖 |

---

## 技術棧

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
| 資料庫 | MySQL 8.x（TiDB 相容）| — |
| 認證 | Manus OAuth | — |
| 測試 | Vitest | 2.x |
| 語言 | TypeScript | 5.9.x |
| 套件管理 | pnpm | 10.x |

---

## 本地開發環境啟動

### 前置需求

在開始之前，請確認已安裝以下工具：

- **Node.js** 22.x 以上（建議使用 [nvm](https://github.com/nvm-sh/nvm) 管理版本）
- **pnpm** 10.x（`npm install -g pnpm`）
- **MySQL** 8.x 或相容的 TiDB 實例

### 步驟一：複製倉庫

```bash
git clone https://github.com/fanfan3q-ai/Tarot-Ai.git
cd Tarot-Ai
```

### 步驟二：安裝依賴

```bash
pnpm install
```

### 步驟三：設定環境變數

複製環境變數範本並填入實際值：

```bash
cp .env.example .env
```

然後編輯 `.env` 檔案，填入所有必要的環境變數（詳見下方[環境變數說明](#環境變數說明)）。

### 步驟四：初始化資料庫

確保 MySQL 服務正在運行，且 `DATABASE_URL` 已正確設定，然後執行：

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 步驟五：啟動開發伺服器

```bash
pnpm dev
```

開發伺服器啟動後，瀏覽器開啟 [http://localhost:3000](http://localhost:3000) 即可預覽。

### 步驟六：執行測試

```bash
pnpm test
```

目前有 16 項靈數計算邏輯的單元測試，全部應通過。

---

## 環境變數說明

以下所有環境變數均**不應**直接寫入程式碼，必須透過 `.env` 檔案或部署平台的環境變數管理介面設定。

### 必要變數

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `DATABASE_URL` | MySQL 資料庫連線字串 | `mysql://user:password@host:3306/dbname` |
| `JWT_SECRET` | Session cookie 簽名密鑰（至少 32 字元隨機字串）| `your-super-secret-key-min-32-chars` |
| `VITE_APP_ID` | Manus OAuth 應用 ID | `your-manus-app-id` |
| `OAUTH_SERVER_URL` | Manus OAuth 後端 URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Manus 登入頁 URL | `https://manus.im/login` |

### 選用變數（AI 功能）

| 變數名稱 | 說明 | 備註 |
|---------|------|------|
| `BUILT_IN_FORGE_API_URL` | Manus 內建 API URL（含 LLM）| 僅 Manus 平台可用 |
| `BUILT_IN_FORGE_API_KEY` | Server-side Bearer token | 僅 Manus 平台可用 |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend Bearer token | 僅 Manus 平台可用 |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend API URL | 僅 Manus 平台可用 |

### 系統資訊變數

| 變數名稱 | 說明 |
|---------|------|
| `OWNER_OPEN_ID` | 管理員的 Manus OpenID（自動設為 admin 角色）|
| `OWNER_NAME` | 管理員名稱 |
| `VITE_APP_TITLE` | 網站標題（顯示於瀏覽器標籤）|
| `VITE_APP_LOGO` | 網站 Logo URL |

> **安全提醒**：`.env` 檔案已加入 `.gitignore`，請勿將其提交到版本控制系統。如需在團隊間共享設定，請使用 `.env.example` 範本（不含實際值）。

---

## 資料庫設定

本專案使用 Drizzle ORM 管理資料庫 Schema，包含以下五張表：

### 資料表說明

**`users`** — 用戶基本資料（含積分餘額與邀請碼）

```sql
id, openId, name, email, loginMethod, role,
points, inviteCode, lastCheckinAt,
createdAt, updatedAt, lastSignedIn
```

**`profiles`** — 靈數計算結果檔案

```sql
id, userId, birthday, zodiacSign,
mainNumber, behaviorNumber, traitNumber, yearNumber,
digitSum, birthDayNum,
unlockedSubconscious, unlockedYearReport,
createdAt, updatedAt
```

**`points_log`** — 積分交易記錄

```sql
id, userId, action, amount, description, createdAt
```

**`referrals`** — 邀請碼追蹤

```sql
id, inviterId, inviteeId, inviteCode, pointsAwarded, createdAt
```

**`shares`** — 社群分享追蹤

```sql
id, userId, platform, shareUrl, cardImageUrl,
clickCount, conversionCount, pointsAwarded, createdAt
```

### 執行遷移

```bash
# 生成遷移 SQL（修改 schema.ts 後執行）
pnpm drizzle-kit generate

# 套用遷移到資料庫
pnpm drizzle-kit migrate
```

---

## 專案結構

```
tarot-numerology-app/
├── client/                         # React 前端
│   ├── index.html                  # HTML 入口（字體引入、SEO meta）
│   └── src/
│       ├── App.tsx                 # 路由設定
│       ├── index.css               # 全域主題（午夜藍 + 香檳金）
│       ├── components/
│       │   └── StarfieldBackground.tsx   # GSAP 星空粒子背景
│       └── pages/
│           ├── Home.tsx            # 首頁（生日輸入表單）
│           └── Result.tsx          # 結果頁面（三層內容展示）
├── drizzle/
│   └── schema.ts                   # 資料庫 Schema 定義
├── server/
│   ├── db.ts                       # 資料庫查詢 helpers
│   ├── routers.ts                  # tRPC API 路由
│   ├── storage.ts                  # S3 檔案儲存 helpers
│   └── numerology.test.ts          # 靈數計算單元測試
├── shared/
│   ├── numerology.ts               # 核心計算邏輯（純函數）
│   ├── tarotContent.ts             # 1-7 號靈數內容資料
│   ├── tarotContent8to14.ts        # 8-14 號靈數內容資料
│   ├── tarotContent15to21.ts       # 15-21 號靈數內容資料
│   ├── tarotContentIndex.ts        # 統一內容索引
│   └── yearContent.ts              # 2026 流年九種類型文案
├── .gitignore                      # 排除 .env、node_modules 等
├── drizzle.config.ts               # Drizzle ORM 設定
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── todo.md                         # 功能追蹤清單
└── PROJECT_HANDOVER.md             # 完整交接文件
```

---

## 核心演算法

所有計算邏輯位於 `shared/numerology.ts`，均為純函數，無副作用，已有完整單元測試覆蓋。

### 主命數（潛意識數）

將西元生日的每一個數字加總，反覆縮減至個位數（1-9）。

```
範例：1990/03/15
1 + 9 + 9 + 0 + 0 + 3 + 1 + 5 = 28
2 + 8 = 10
1 + 0 = 1  ← 主命數為 1（魔術師）
```

### 行為數

`行為數 = 數字總和 - 出生日期`，若結果 ≥ 22 則再減 22。

```
範例：總和 28，出生日 15
28 - 15 = 13  ← 行為數為 13（死神）
```

### 特質數

依星座對應固定的塔羅牌號碼（不做縮減）：

| 星座 | 特質數 | 牌名 |
|------|--------|------|
| 牡羊 | 4 | 皇帝 |
| 金牛 | 5 | 教皇 |
| 雙子 | 6 | 戀人 |
| 巨蟹 | 7 | 戰車 |
| 獅子 | 8 | 力量 |
| 處女 | 9 | 隱士 |
| 天秤 | 11 | 正義 |
| 天蠍 | 1 | 魔術師 |
| 射手 | 14 | 節制 |
| 摩羯 | 10 | 命運之輪 |
| 水瓶 | 17 | 星星 |
| 雙魚 | 18 | 月亮 |

### 2026 流年數

`流年數 = 2026 + 生日月 + 生日日`，縮減至個位數（1-9）。

---

## 商業模型

```
免費工具（首頁計算）
    ↓ 天賦本質 + 意識層解析（免費）
    ↓ 潛意識密碼積分牆（需 50 積分）
    ↓ 分享/邀請/簽到獲取積分
    ↓ 解鎖潛意識密碼
    ↓ 課程 CTA（$499 體驗課）
    ↓ 認證老師（長期目標）
```

### 積分規則

| 行為 | 積分變化 |
|------|---------|
| 分享報告連結（有人點擊）| +10 |
| 邀請好友完成計算 | +20（邀請者）/ +10（受邀者）|
| 分享社群圖卡 | +15 |
| 每日簽到 | +5（24 小時限制）|
| 解鎖潛意識密碼 | -50 |

---

## 部署說明

### Manus 平台部署（推薦）

本專案針對 Manus 平台優化。部署流程如下：

1. 在 Manus 管理介面建立 checkpoint（`webdev_save_checkpoint`）
2. 點擊管理介面右上角的 **Publish** 按鈕
3. 網站將自動部署至 `tarotnumapp.manus.space`

所有環境變數（`DATABASE_URL`、`JWT_SECRET` 等）由 Manus 平台自動注入，無需手動設定。

### 其他平台部署

若需部署至其他平台（如 Railway、Render、Vercel），請注意：

1. 手動設定所有[必要環境變數](#必要變數)
2. 確保 MySQL 資料庫可連線
3. 執行 `pnpm build` 建置生產版本
4. 啟動指令：`node dist/index.js`

> **注意**：Manus OAuth 認證系統僅在 Manus 平台上可用。若部署至其他平台，需替換認證系統。

---

## 開發規範

### 程式碼風格

- 所有業務邏輯使用 TypeScript，嚴格型別
- 後端 API 透過 tRPC 定義，前端使用 `trpc.*.useQuery/useMutation`
- 禁止在前端直接呼叫 `fetch` 或 `axios`，所有 API 呼叫必須透過 tRPC
- 敏感操作（積分扣除、解鎖）必須在 `protectedProcedure` 中執行

### 提交規範

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
feat: 新增功能
fix: 修復問題
docs: 更新文件
style: 格式調整（不影響邏輯）
refactor: 重構（不新增功能也不修復問題）
test: 新增或修改測試
chore: 建置工具或輔助工具的變動
```

### 測試要求

每個新功能必須附帶對應的 Vitest 單元測試，執行 `pnpm test` 確保所有測試通過後才能提交。

---

## 待完成功能

詳見 [todo.md](./todo.md)，主要待開發項目包括：

- 後端 tRPC 路由（積分系統、簽到、分享追蹤、邀請碼）
- 生日輸入改為直接輸入（`YYYY/MM/DD` 格式）
- 翻牌儀式感動畫（3D GSAP 效果）
- 塔羅牌實際圖片整合
- Canvas 社群分享圖卡生成（1080×1080px）
- Gemini AI 個性化文案潤色（8% 流量）

---

*本專案由 fanfan3q-ai 開發，基於陳彩綺塔羅靈數系統。*
