<p align="right"><a href="./README.md">English</a> · <b>繁體中文</b></p>

<h1 align="center">PriceHover</h1>
<p align="center">將滑鼠移到任何網頁的價格上，即可查看以你的貨幣表示的金額。<br />支援 Chrome 及其他 Chromium 瀏覽器，MV3，使用 WXT 與 Svelte 5 建置。</p>

<p align="center">
  <a href="https://github.com/ddd000987/PriceHover/releases"><img src="https://img.shields.io/github/v/release/ddd000987/PriceHover?display_name=tag" alt="版本" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/ddd000987/PriceHover" alt="授權" /></a>
  <a href="https://github.com/ddd000987/PriceHover/stargazers"><img src="https://img.shields.io/github/stars/ddd000987/PriceHover" alt="星星數" /></a>
  <a href="#安裝"><img src="https://img.shields.io/badge/browser-Chrome%20%7C%20Edge-0078D6" alt="瀏覽器" /></a>
  <a href="https://wxt.dev/"><img src="https://img.shields.io/badge/WXT-0.20-67D75B" alt="WXT" /></a>
  <a href="https://svelte.dev/"><img src="https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte" alt="Svelte" /></a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/demo-dark.webp" />
    <img src="./screenshots/demo-light.webp" alt="將滑鼠移到商店頁面的日圓價格上，會開啟一個提示框，顯示以歐元、美元和英鎊表示的金額。點一下其中一列即可複製，接著價格範圍會當作單一範圍換算。" width="820" />
  </picture>
</p>

<p align="center">
  <a href="#與原版的差異">Fork 的變更</a> ·
  <a href="#安裝">安裝</a> ·
  <a href="#會讀取什麼">會讀取什麼</a> ·
  <a href="#行內模式">行內模式</a> ·
  <a href="#加密貨幣雙向換算">加密貨幣</a> ·
  <a href="#彈出視窗也是換算器">彈出視窗</a> ·
  <a href="#隱私權">隱私權</a>
</p>

## 與原版的差異

這是 [klNuno/PriceHover](https://github.com/klNuno/PriceHover) 的 fork。其餘功能都與原版相同，變更的只有介面語言、哪些價格會開啟提示框，以及支援的瀏覽器。

| | 原版 | 此 fork |
|---|---|---|
| 介面語言 | 一律使用瀏覽器的語言 | 在設定 → **語言** 中選擇任何語言，或維持 *瀏覽器語言* |
| 內建語言 | 8 種：en, fr, es, de, pt_BR, it, ja, zh_CN | 18 種：原有的 8 種，加上 zh_TW, ko, ru, nl, pl, tr, uk, id, vi, th |
| 新增語言 | 編輯 `scripts/gen-locales.ts` 並重新建置 | 將語言**匯出**為 JSON，翻譯後再**匯入**。不需要建置，已安裝的擴充功能也能使用 |
| 數字格式 | 依瀏覽器 | 依所選的語言 |
| 會開啟提示框的價格 | 只有貨幣既不是你的貨幣、也不在 *換算為* 中的價格 | 除了你自己貨幣的價格之外，每個價格都會。若你的貨幣是 TWD，*換算為* 有 USD 和 JPY，美元價格會顯示 TWD 和 JPY，日圓價格則顯示 TWD 和 USD |
| 瀏覽器 | Chrome 和 Firefox | Chrome、Edge 及其他 Chromium 瀏覽器，不再建置 Firefox 版 |
| 版本號 | `2.2.0` | `2.2.0.1`：原版的版本號，加上第四位數字代表此 fork 自己的版本 |

新增的 10 種語言為機器翻譯，歡迎母語者透過 issue 或 pull request 協助校對。

仍由瀏覽器決定的部分：擴充功能的名稱與說明，在瀏覽器自己的選單和工具列提示中，是由瀏覽器從 manifest 讀取的，因此仍會跟隨瀏覽器的語言。

### 語言檔案

設定 → **語言** → **匯出** 會將所選的語言（選擇 *瀏覽器語言* 時為英文）寫成如下的檔案：

```json
{
  "_meta": { "code": "ko", "name": "한국어", "locale": "ko-KR", "version": "2.2.0" },
  "messages": {
    "searchPlaceholder": "검색 또는 가격 입력…",
    "timeMinutes": "$1분 전"
  }
}
```

- `code` 用來識別語言包：匯入另一個相同 code 的檔案會取代原有的語言包。
- `name` 是語言選單顯示的名稱。`locale` 是用於數字格式的 BCP-47 標籤。
- `$1`、`$2`、`$3` 會在執行時填入，必須保留。翻譯若漏掉其中一個，檔案仍會匯入，並顯示指出該 key 的警告。
- 省略的 key，或維持英文的 key，會顯示英文。未知的 key 會被忽略。超過 256 KB 的檔案會被拒絕。
- 匯入的語言包存放在擴充功能的本機儲存空間，只在這部裝置上。

## 為什麼

價格若是你不習慣思考的貨幣，就得多開一個分頁、一個搜尋框，還會丟掉你在頁面中的位置。PriceHover 直接在價格所在之處讀取。不需要帳號，不需要貼上，匯率每天只請求一次。

## 功能

- **將滑鼠移到價格上，或選取價格。** 你的貨幣排在最前面；以它標示的價格不會被換算。
- **`$` 代表網站所指的貨幣。** `.ca` 商店的 `$49` 是加幣，`.no` 商店的 `1 099 kr` 是挪威克朗，`.cn` 商店的 `¥` 是人民幣。寫明貨幣的表格列，會決定該列中價格的貨幣；網站只寫明一次貨幣時，會記住並套用到整個網站。
- **你比網站更清楚時，可以鎖定網站的貨幣**：在設定頁面把 `amazon.com` 設為 `$ = CAD`。
- **一般文字就是一般文字。** `try 100 times` 和 `error code 500 KD` 不是價格。每個有歧義的字詞，背後都有一個排除測試。
- **價格範圍。** `€10 – €20`、`€10-20` 和 `10-20 kr` 會當作單一範圍換算。
- **點一下該列即可複製**金額。
- **行內模式。** 在每個價格旁寫上你的貨幣，不必等你將滑鼠移上去。它只會附加內容。
- **兩個開關。** 一個總開關，加上每個網站各自的暫停，都在彈出視窗中。
- **彈出視窗中的計算機。** `20 chf`、`100 eur jpy`，開啟加密貨幣後還有 `0.5 btc`。
- **四捨五入。** 顯示 `≈€1,235`，因為 `€1,234.56` 會假裝換算有它並不具備的精確度。
- **小於一分的價格仍是價格。** 一日圓是 `€0.0061`，不是 `€0.01`，更不會是 `€0`。每單位和按比例計算的價格（`$0.0075`）也能讀取。
- **加密貨幣，想要才開。** 24 種資產，包括 BTC、ETH、XMR、USDT、USDC 和 DOGE。預設關閉，多一個主機，由你授予權限，關閉時會交還。
- **44 種貨幣、十八種語言，還有你的語言的空間。** 手動選擇介面語言，或匯入一種。旗幟已內建，不會從第三方擷取任何東西。

> [!NOTE]
> 2.0.0 更改了 `$` 的判讀方式。在國家網域上，它現在會當作該國的貨幣換算，而不是 USD。設定 → **行為** → *依網站判讀 `$`、`kr` 和 `¥`* 可以恢復舊的判讀方式，但你已鎖定的網站除外。

## 會讀取什麼

### 同一個 `$49.99`，兩間商店

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/context-dark.png" />
    <img src="./screenshots/context-light.png" alt="同一個 $49.99 出現在 .com 商店和 .ca 商店：前者換算為 44 歐元，後者為 31 歐元，並註明貨幣是依網站判讀" width="820" />
  </picture>
</p>

國家取自網域；網域無法判斷時，取自 `<html lang>` 中的地區。裝飾性的網域結尾（`.co`、`.io`、`.ai`、`.me`、`.tv`、`.to`）會被忽略，因為其中的國家沒有意義。當是網站而非價格決定了貨幣時，提示框會說明。

### 一張表格、八種貨幣、三種符號

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/table-dark.png" />
    <img src="./screenshots/table-light.png" alt="開啟行內模式的區域價格表：三列美元、兩列日圓、三列克朗，每一列都依該列寫明的貨幣換算" width="820" />
  </picture>
</p>

有兩件事的優先順序高於網域：價格旁印出的代碼（`$49 CAD`），以及價格所在的表格列。因此 SteamDB 上 Chinese Yuan 列的 `¥ 69` 是人民幣，而 Japanese Yen 列的 `¥ 1,980` 仍是日圓。有一件事的優先順序低於它：網站自己的頁面所寫明的內容，它會依網站記在你的電腦上，並列在設定中，每一筆都可以移除。你自己設定的鎖定，優先於以上所有。

| 頁面上的內容 | 判讀為 |
| --- | --- |
| `.jp` 商店的 `¥74,800` | 74 800 JPY |
| `.cn` 商店的 `¥74,800` | 74 800 CNY |
| 任何地方的 `$49.99 CAD` | 49.99 CAD |
| 標示為 Chinese Yuan 的列上的 `¥ 69` | 69 CNY |
| `₹1,49,900` | 149 900 INR（印度的 lakh 分位法） |
| `KD 12.500` | 12.500 KWD（三位小數，不是千分位） |
| `€10-20` | 一個範圍，10 到 20 EUR |
| `try 100 times`、`requires PHP 8.2`、`error code 500 KD` | 無 |

## 行內模式

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/inline-dark.png" />
    <img src="./screenshots/inline-light.png" alt="商品頁面上，每個日圓金額後面都以括號附上對應的歐元金額" width="820" />
  </picture>
</p>

預設關閉。網站原本的文字不會被改寫，只會在後面附加內容，文字欄位、可編輯區域、`code` 和 `pre` 則不會動。

## 加密貨幣雙向換算

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/crypto-dark.png" />
    <img src="./screenshots/crypto-light.png" alt="左：標價 0.0042 BTC 的授權，以歐元、美元和英鎊顯示。右：標價 $49.99 的背包，以歐元、英鎊、比特幣和以太幣顯示。" width="820" />
  </picture>
</p>

預設關閉。在設定中開啟一個開關，瀏覽器會要求存取 `api.coingecko.com`，之後：

- **頁面上的加密貨幣價格，和其他價格一樣會換算。** `0.0042 BTC`、`₿0.05`、`Ξ0.085`、`250 USDT`，以及代號 XMR、USDC、DOGE、XRP、LTC 和 BCH。`ETH 8092` 仍是蘇黎世的郵遞區號，`BTC 10000` 仍是新聞標題。
- **24 種資產都可以放進你的清單**，因此美元價格也能以比特幣或以太幣顯示。
- **彈出視窗也接受它們**：`0.5 btc`、`100 eur eth`。
- **匯率有自己的更新週期**，開關開啟時每小時更新一次，匯率過期時提示框會顯示警告。

關閉後會交還權限，也不會再有任何請求連到第二個主機。

## 彈出視窗也是換算器

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/popup-dark.png" />
    <img src="./screenshots/popup-light.png" alt="PriceHover 彈出視窗的兩個畫面：分別將 250 CHF 和 0.5 BTC 換算為一系列貨幣" width="640" />
  </picture>
</p>

輸入 `250 chf`、`20 usd jpy`、開啟加密貨幣後的 `0.5 btc`，或只輸入一個數字，就會從你自己的貨幣開始換算。頁尾會顯示匯率的更新時間，並可隨時重新整理。

## 設定

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/options-dark.png" />
    <img src="./screenshots/options-light.png" alt="PriceHover 設定頁面：貨幣、行為、網站（含已暫停、已鎖定和已記住的項目）、關於" width="760" />
  </picture>
</p>

你的貨幣、要換算成的貨幣清單及其順序、停留延遲、四捨五入、行內模式、已暫停的網站、已鎖定的網站貨幣、從各網站讀取的貨幣，以及介面語言，並可匯入和匯出語言檔案。

## 隱私權

PriceHover 只連線一個主機 `open.er-api.com`，只向它問一個問題：今天的匯率。這個請求不帶有任何關於你或你所在頁面的資訊。價格是在你的電腦上偵測的，旗幟已內建在擴充功能中，也沒有分析、沒有遙測、沒有識別碼。只有兩項權限：`storage` 和 `open.er-api.com`，再加上每個內容指令碼為了讀取其所在頁面都需要的頁面存取權。

開啟加密貨幣換算會多一個主機 `api.coingecko.com`，除此之外沒有別的。它預設關閉，授予前瀏覽器會先詢問，再次關閉時會交還權限。

完整說明請見[隱私權政策](PRIVACY.md)。

## 安裝

- **Chrome / Edge**：從 [Releases](https://github.com/ddd000987/PriceHover/releases) 下載 zip 檔並解壓縮，在 `chrome://extensions`（Edge 為 `edge://extensions`）開啟開發人員模式，再以「載入未封裝項目」選擇該資料夾。此 fork 沒有上架任何商店。

## 從原始碼建置

```bash
bun install
bun run dev            # Chrome, hot reload
bun run build          # Chrome MV3  -> .output/chrome-mv3
bun test               # unit tests, plus DOM tests under happy-dom
bun run typecheck      # tsc --noEmit, kept clean and enforced in CI
```

`bun run icons`、`bun run flags` 和 `bun run locales` 會重新產生已提交的檔案，且不會在建置時執行。推送 `vX.Y.Z.N` 標籤即可發布版本：CI 會拒絕與 `package.json` 不一致，或沒有對應說明檔 `.github/release-notes/vX.Y.Z.N.md`（上方英文、下方繁體中文）的標籤，接著建置擴充功能，並附上 zip 檔。

## 參與貢獻

歡迎提出 issue 和 pull request。請讓 `bun test` 和 `bun run typecheck` 保持通過，且絕不要新增連到第二個主機的執行階段請求。偵測是最容易悄悄出問題的部分：某個字詞在某個位置被過於寬鬆地接受，就會讓 `error code 500 KD` 變成價格，所以每個新增的字詞都必須附上一個必須保持不被辨識的案例。

## 授權

[GNU General Public License v3.0 or later](LICENSE)。你可以使用、閱讀、fork 它。散布修改後的版本，包括把 fork 發布到瀏覽器商店，就必須以相同的授權釋出其原始碼。所有相依套件都與 GPL 相容，而且只有 Svelte (MIT) 會包含在擴充功能中。

此 fork 由 [ddd000987](https://github.com/ddd000987) 以 [klNuno/PriceHover](https://github.com/klNuno/PriceHover) 2.2.0 為基礎修改。修改內容列於[與原版的差異](#與原版的差異)及 [CHANGELOG.md](CHANGELOG.md)。
