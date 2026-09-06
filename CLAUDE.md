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
- `index.html` — **唯一的開發檔兼部署檔**（單一自足 HTML，無外部相依）。
  直接改它就好；**不再有 `CSCS-study-app.html`，也不需要任何 `cp` 同步步驟**。
- `sw.js` / `manifest.webmanifest` / `icons/` — PWA：離線可用、可加到手機主畫面。
  `sw.js` 對 HTML 採 **network-first**，所以改版**不必** bump 版本號、手機也不必強制重整；
  離線時自動回退到快取。用 `file://` 直接開檔時會安靜略過註冊，不影響單檔使用。
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
- 24 章：**150 張翻卡**、**316 題測驗**（`CH` 內建 76 題 ＋ `EXTRA` 240 題，載入時合併，每章 12–14 題）、
  24 章講師版重點整理、12 週計畫。
- **重點整理已全數擴寫為完整逐節講師版**：約 22 萬字元、平均每章約 9,200 字元（原本約 3,500）。
- **內嵌 SVG 圖解共 55 張**，24 章每章至少 1 張（Ch1 有 4 張）。
- 所有 quiz 的答案索引與選項數已驗證正確；已部署至 GitHub Pages 並線上驗證通過。

> 注意：dashboard 顯示的 316 是**合併後**的總數。若直接讀未合併的 `CH`，只會看到 76 題——
> 不要把 `CH` 的數量再加一次 `EXTRA` 而誤算成 556。

## 驗證方式
改完後建議跑（在能存取檔案的環境）：
```bash
node -e 'const fs=require("fs");const h=fs.readFileSync("index.html","utf8");
const js=h.match(/<script>([\s\S]*)<\/script>/)[1];new Function(js);console.log("JS OK");'
```
確認 JS 無語法錯誤；並檢查 quiz 每題 `a` 落在 `opts` 範圍內。

編輯 `NOTES` 時的注意事項：
- 每章是一個 **template literal**，內容中**不可出現反引號或 `${`**，否則會提前結束字串。
- SVG 用 `viewBox="0 0 600 300"`、深色配色（`#3ea6ff` 藍／`#57d9a3` 綠／`#ffb454` 橘／
  `#ff6b6b` 紅／`#e8eef4` 文字／`#9fb0c0` 次要／`#141e29` 底），外面包 `<figure class="fig">`＋`<figcaption>`。
- 驗證圖沒有溢出邊界：在瀏覽器用 `getBoundingClientRect()` 比對 svg 與各子元素
  （**不要用 `getBBox()`**——它不含元素自身的 `transform`，旋轉文字會誤報溢出）。

## 部署
- Repo：`https://github.com/wythel/cscs`（public、`origin`、分支 `main`）
- 線上：`https://wythel.github.io/cscs/`
- 流程：改 `index.html` → `node -e` 驗 JS → `git add -A && commit && push`。
  Pages 約 1–3 分鐘生效。**service worker 上線後不必再強制重整**——
  HTML 走 network-first，有網路時一定拿到最新版。
- 動到 `sw.js` 的快取清單時，把 `CACHE` 常數（目前 `cscs-v1`）改個號，舊快取才會被清掉。

## 可能的後續工作（使用者曾提到或可延伸）
- 加計算題（1RM 換算、%HRR/Karvonen、能量系統比例）。
- 匯出 Anki 牌組（.apkg 或 CSV）。
- 把「重點整理」做成可列印 PDF 講義。
- 依擴寫後的新內容補測驗題（新增了不少原本沒有的考點，例如測驗順序、
  1RM 流程、腰帶時機、各期組數次數、Karvonen 對照等）。
- 加入 service worker 讓手機可離線使用。
