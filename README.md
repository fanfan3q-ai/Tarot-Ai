# 二十二道靈數密碼

> 基於陳彩綺塔羅靈數系統的互動式命運解析應用。
> 輸入西元生日，即可獲得主命數、行為數、特質數與 2026 流年數的完整三層解析。

**線上網址**：https://tarot-ai-284ad.web.app
**銷售頁**：https://tarot-ai-284ad.web.app/course.html

---

## 目錄

- [專案概述](#專案概述)
- [技術棧](#技術棧)
- [本地開發環境啟動](#本地開發環境啟動)
- [部署說明](#部署說明)
- [環境變數說明](#環境變數說明)
- [資料庫設定](#資料庫設定)
- [專案結構](#專案結構)
- [核心演算法](#核心演算法)
- [商業模型](#商業模型)
- [開發規範](#開發規範)

---

## 專案概述

本專案是一個全棧互動式 Web App，採用「免費工具 → 積分解鎖 → 付費課程」的商業漏斗設計。用戶輸入生日後，系統計算四個靈數，並展示三層遞進內容：

| 層次 | 內容 | 存取方式 |
|------|------|---------|
| 天賦本質 | 靈魂天賦的金色引言框 | 免費開放 |
| 意識層解析 | 感情模式、職場特質、人際動態 | 免費開放 |
| 潛意識密碼 | 深層心理密碼與行動指引 | 需 30 積分解鎖 |

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
| 語言 | TypeScript | 5.9.x |
| 套件管理 | pnpm | 10.x |

---

## 本地開發環境啟動

### 前置需求

- **Node.js** 22.x 以上
- **pnpm** 10.x（`npm install -g pnpm`）
- **MySQL** 8.x

### 步驟

```bash
# 1. 複製倉庫
git clone https://github.com/fanfan3q-ai/Tarot-Ai.git
cd Tarot-Ai

# 2. 安裝依賴
npm install --legacy-peer-deps

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env 填入實際值

# 4. 初始化資料庫
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 5. 啟動開發伺服器
pnpm dev
```

開發伺服器啟動後開啟 http://localhost:3000

---

## 部署說明

### 目前部署方式（Firebase Hosting）

本專案部署在 Firebase Hosting，完全由開發者自行控制，不依賴任何第三方平台。

```bash
# 1. 拉取最新程式碼
git pull

# 2. 建置
npm run build

# 3. 部署前端
firebase deploy --only hosting
```

**Firebase 專案 ID**：`tarot-ai-284ad`
**部署網址**：https://tarot-ai-284ad.web.app

### 銷售頁部署

銷售頁為獨立靜態 HTML，直接複製到 dist/public 後部署：

```bash
copy "銷售頁.html" "dist\public\course.html"
firebase deploy --only hosting
```

**銷售頁網址**：https://tarot-ai-284ad.web.app/course.html

### Firebase 初次設定

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# public directory: dist/public
# single-page app: Yes
# GitHub auto deploy: No
```

---

## 環境變數說明

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `DATABASE_URL` | MySQL 資料庫連線字串 | `mysql://user:password@host:3306/dbname` |
| `JWT_SECRET` | Session cookie 簽名密鑰（至少 32 字元）| `your-secret-key` |

> `.env` 已加入 `.gitignore`，請勿提交到版本控制。

---

## 資料庫設定

本專案使用 Drizzle ORM，包含以下五張表：

| 資料表 | 用途 |
|--------|------|
| `users` | 用戶資料、積分餘額、邀請碼 |
| `profiles` | 靈數計算結果 |
| `points_log` | 積分交易記錄 |
| `referrals` | 邀請碼追蹤 |
| `shares` | 社群分享追蹤 |

```bash
# 生成遷移 SQL
pnpm drizzle-kit generate

# 套用遷移
pnpm drizzle-kit migrate
```

---

## 專案結構

```
tarot-numerology-app/
├── client/
│   └── src/
│       ├── App.tsx                     # 路由設定
│       ├── index.css                   # 全域主題（午夜藍 + 香檳金）
│       ├── components/
│       │   └── StarfieldBackground.tsx # GSAP 星空粒子背景
│       └── pages/
│           ├── Home.tsx                # 首頁（生日輸入）
│           └── Result.tsx              # 結果頁（三層內容）
├── drizzle/
│   └── schema.ts                       # 資料庫 Schema
├── server/
│   ├── db.ts                           # 資料庫 helpers
│   ├── routers.ts                      # tRPC API 路由
│   └── numerology.test.ts              # 單元測試
├── shared/
│   ├── numerology.ts                   # 核心計算邏輯
│   ├── tarotContent.ts                 # 1-7 號牌內容
│   ├── tarotContent8to14.ts            # 8-14 號牌內容
│   ├── tarotContent15to21.ts           # 15-21 號牌內容
│   ├── tarotContentIndex.ts            # 統一內容索引
│   └── yearContent.ts                  # 2026 流年文案
└── dist/
    └── public/
        ├── index.html                  # 主站
        └── course.html                 # 募資銷售頁
```

---

## 核心演算法

所有計算邏輯位於 `shared/numerology.ts`，純函數，有完整單元測試。

### 主命數
西元生日所有數字加總，反覆縮減至個位數（1-9）。
```
1990/03/15 → 1+9+9+0+0+3+1+5=28 → 2+8=10 → 1+0=1（魔術師）
```

### 行為數
`總和 - 出生日期`，若結果 ≥ 22 則再減 22。
```
總和 28，出生日 15 → 28-15=13（死神）
```

### 特質數
依星座對應固定號碼：

| 星座 | 號碼 | 牌名 |
|------|------|------|
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
`2026 + 生日月 + 生日日`，縮減至個位數（1-9）。

---

## 商業模型

```
免費工具（首頁計算）
    ↓ 首次計算 +30 積分（新手禮包）
    ↓ 天賦本質 + 意識層解析（免費）
    ↓ 潛意識密碼積分牆（需 30 積分）
    ↓ 分享／邀請／簽到獲取積分
    ↓ 解鎖潛意識密碼
    ↓ 課程 CTA → 銷售頁（$299 超早鳥 / $499 標準價）
    ↓ 認證老師（長期目標）
```

### 積分規則

| 行為 | 積分 | 限制 |
|------|------|------|
| 首次完成計算（新手禮包）| +30 | 每帳號限一次 |
| 每日簽到 | +5 | 24 小時限制 |
| 分享連結被點擊 | +10 | 每次分享限計一次 |
| 邀請好友完成計算（邀請者）| +20 | 無上限 |
| 受邀者首次完成計算 | +10 | 每帳號限一次 |
| 分享社群圖卡 | +15 | 每日限一次 |
| 解鎖潛意識密碼 | -30 | 扣除後永久解鎖 |

---

## 開發規範

### 程式碼風格
- 所有業務邏輯使用 TypeScript 嚴格型別
- 後端 API 透過 tRPC 定義
- 敏感操作（積分扣除、解鎖）必須在 `protectedProcedure` 中執行
- 禁止在前端直接呼叫 `fetch`，所有 API 透過 tRPC

### 提交規範
```
feat: 新增功能
fix: 修復問題
docs: 更新文件
refactor: 重構
test: 測試相關
chore: 建置工具變動
```

### 測試要求
每個新功能附帶 Vitest 單元測試，執行 `pnpm test` 確保全部通過後才提交。

---

*基於陳彩綺塔羅靈數系統 · 由 fanfan3q-ai 開發維護*
