# CSCS 備考學習 App — 專案交接說明

> 這份文件供 Claude Code 讀取，用來接續原本在 Cowork 對話中的工作。

## 專案目標
使用者 Wythe 正在準備 **NSCA CSCS 認證考試**，教材為本資料夾內的
《Essentials of Strength Training and Conditioning》第 4 版（24 章 PDF）。
目標是做一套自學工具：**12 週讀書計畫 + 章節重點整理 + 翻卡 + 測驗**。
預計 12 週讀完，中英對照（專有名詞留英文、解釋用**正體中文**）。

## 使用者偏好
- 回覆用**正體中文**、簡潔直接。
- 卡片/題目/重點：中英對照，考點導向。

## 產出檔案（都在本資料夾）
- `CSCS-study-app.html` — 主要開發檔（單一 HTML，離線可用）。
- `index.html` — 上面那支的複本，命名給 **GitHub Pages** 部署用。
  **每次改完 `CSCS-study-app.html`，要把它複製覆蓋 `index.html` 保持同步。**
- `Chapter 1.pdf` ~ `Chapter 24.pdf` — 原始教材（雲端同步，bash 讀取可能鎖定，必要時用編輯器的檔案讀取工具下載）。

## App 架構（單一 HTML，無外部相依）
純 HTML/CSS/vanilla JS，資料與邏輯都內嵌在 `<script>` 內。四個分頁：
總覽 / 12週計畫 / 重點整理 / 翻卡 / 測驗。

### 主要資料結構（在 `<script>` 開頭）
- `const CH = [...]` — 24 章物件陣列，每章 `{n, title, zh, domain, cards:[{f,b}], quiz:[{q,opts,a,exp}]}`。
- `const EXTRA = {...}` — 各章延伸測驗題，載入時以 `CH.forEach(x=>{ if(EXTRA[x.n]) x.quiz = x.quiz.concat(EXTRA[x.n]); })` 併入 `CH`。
- `const NOTES = {章號: \`HTML字串\`}` — 各章「重點整理」，講師授課風格。用到的 class：`.lead`（開場導讀藍框）、`h4`（小節）、`.num`（必記數字灰框）、`.trap`（常見陷阱黃框）、`.en-term`（英文名詞）。
- `const PLAN = [...]` — 12 週計畫表格資料。

### 進度儲存
瀏覽器 `localStorage`，key = `cscs_v1`；存各章翻卡熟練度與測驗分數。清除進度會清掉。

## 目前狀態（已完成）
- 24 章：150+ 張翻卡、**約 316 題測驗（每章 12–14 題）**、24 章講師版重點整理、12 週計畫。
- 所有 quiz 的答案索引與選項數已驗證正確。

## 驗證方式
改完後建議跑（在能存取檔案的環境）：
```bash
node -e 'const fs=require("fs");const h=fs.readFileSync("CSCS-study-app.html","utf8");
const js=h.match(/<script>([\s\S]*)<\/script>/)[1];new Function(js);console.log("JS OK");'
```
確認 JS 無語法錯誤；並檢查 quiz 每題 `a` 落在 `opts` 範圍內。

## 可能的後續工作（使用者曾提到或可延伸）
- 加計算題（1RM 換算、%HRR/Karvonen、能量系統比例）。
- 匯出 Anki 牌組（.apkg 或 CSV）。
- 把「重點整理」做成可列印 PDF 講義。
- 各章加圖解／示意圖。
- 部署到 GitHub Pages（把 `index.html` 上傳到 public repo → Settings → Pages）。
