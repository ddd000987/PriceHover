<p align="right"><b>English</b> · <a href="./README.zh-TW.md">繁體中文</a></p>

<h1 align="center">PriceHover</h1>
<p align="center">Hover any price on any page and read it in your own currency.<br />Chrome and other Chromium browsers, MV3, built with WXT and Svelte 5.</p>

<p align="center">
  <a href="https://github.com/ddd000987/PriceHover/releases"><img src="https://img.shields.io/github/v/release/ddd000987/PriceHover?display_name=tag" alt="Release" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/ddd000987/PriceHover" alt="License" /></a>
  <a href="https://github.com/ddd000987/PriceHover/stargazers"><img src="https://img.shields.io/github/stars/ddd000987/PriceHover" alt="Stars" /></a>
  <a href="#install"><img src="https://img.shields.io/badge/browser-Chrome%20%7C%20Edge-0078D6" alt="Browser" /></a>
  <a href="https://wxt.dev/"><img src="https://img.shields.io/badge/WXT-0.20-67D75B" alt="WXT" /></a>
  <a href="https://svelte.dev/"><img src="https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte" alt="Svelte" /></a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/demo-dark.webp" />
    <img src="./screenshots/demo-light.webp" alt="Hovering a yen price on a shop page opens a card with the amount in euros, dollars and pounds. A click on a row copies it, then a price range converts as one range." width="820" />
  </picture>
</p>

<p align="center">
  <a href="#how-this-fork-differs-from-the-original">Fork changes</a> ·
  <a href="#install">Install</a> ·
  <a href="#what-it-reads">What it reads</a> ·
  <a href="#inline-mode">Inline mode</a> ·
  <a href="#crypto-both-ways">Crypto</a> ·
  <a href="#the-popup-is-also-a-converter">Popup</a> ·
  <a href="#privacy">Privacy</a>
</p>

## How this fork differs from the original

This is a fork of [klNuno/PriceHover](https://github.com/klNuno/PriceHover).
Everything else works the way the original does. The changes are the interface
language, which prices open a tooltip, and the browsers it is built for.

| | Original | This fork |
|---|---|---|
| Interface language | Always the browser's language | Pick any language in Settings → **Language**, or keep *Browser language* |
| Bundled languages | 8: en, fr, es, de, pt_BR, it, ja, zh_CN | 18: the original 8 plus zh_TW, ko, ru, nl, pl, tr, uk, id, vi, th |
| Adding a language | Edit `scripts/gen-locales.ts` and rebuild | **Export** a language as JSON, translate it, **Import** it back. No build, and it works on an installed extension too |
| Number format | Follows the browser | Follows the chosen language |
| Prices that open a tooltip | Only prices in a currency that is neither your own nor in *Convert to* | Every price except those in your own currency. With TWD as yours and USD, JPY in *Convert to*, a US price shows TWD and JPY, and a yen price shows TWD and USD |
| Browsers | Chrome and Firefox | Chrome, Edge and other Chromium browsers. Firefox is no longer built |
| Version | `2.2.0` | `2.2.0.1`: the original's version, plus a fourth number for this fork's own releases |

The ten added languages were machine-translated. Corrections from native
speakers are welcome as issues or pull requests.

What stays with the browser: the extension's name and description in the
browser's own menus and the toolbar tooltip are read by the browser from the
manifest, so they keep following the browser's language.

### Language files

Settings → **Language** → **Export** writes the selected language (English when
*Browser language* is selected) as a file like this:

```json
{
  "_meta": { "code": "ko", "name": "한국어", "locale": "ko-KR", "version": "2.2.0" },
  "messages": {
    "searchPlaceholder": "검색 또는 가격 입력…",
    "timeMinutes": "$1분 전"
  }
}
```

- `code` identifies the pack: importing another file with the same code replaces it.
- `name` is what the language menu shows. `locale` is a BCP-47 tag used for numbers.
- `$1`, `$2`, `$3` are filled in at runtime and must stay. A translation that
  drops one is still imported, with a warning naming the key.
- Keys left out, or left in English, show in English. Unknown keys are ignored.
  Files over 256 KB are refused.
- Imported packs live in the extension's local storage, on this device only.

## Why

A price in a currency you do not think in costs a tab, a search box and your
place in the page. PriceHover reads it where it sits. No account, no paste, one
request a day for the rates.

## Features

- **Hover or select** a price. Your own currency comes first and is never converted away from.
- **`$` means what the site means.** `$49` on a `.ca` shop is Canadian, `1 099 kr` on a `.no` shop is Norwegian, `¥` on a `.cn` shop is yuan. A table row that names its currency decides for the prices in it, and a site that names its currency once is remembered for the whole site.
- **Lock a site's currency** when you know better: `amazon.com` with `$ = CAD`, from the settings page.
- **Prose stays prose.** `try 100 times` and `error code 500 KD` are not prices. Every ambiguous token has a rejection test behind it.
- **Ranges.** `€10 – €20`, `€10-20` and `10-20 kr` convert as one range.
- **Click a row to copy** the amount.
- **Inline mode.** Write your currency beside every price instead of waiting for a hover. It only ever appends.
- **Two switches.** A master one and a per-site pause, both in the popup.
- **A calculator in the popup.** `20 chf`, `100 eur jpy`, and `0.5 btc` once crypto is on.
- **Rounding.** `≈€1,235` where `€1,234.56` would pretend to a precision a conversion does not have.
- **Sub-cent prices stay prices.** A yen is `€0.0061`, not `€0.01`, and never `€0`. Per-unit and prorated prices (`$0.0075`) are read too.
- **Crypto, if you want it.** 24 assets including BTC, ETH, XMR, USDT, USDC and DOGE. Off by default, one extra host, granted by you and given back when you switch it off.
- **44 currencies, eighteen languages, and room for yours.** Pick the interface language by hand, or import one. Flags are bundled, nothing is fetched from a third party.

> [!NOTE]
> 2.0.0 changed how `$` is read. On a country domain it now converts as that
> country's dollar, not as USD. Settings → **Behaviour** → *Read `$`, `kr` and
> `¥` from the site* puts the old reading back, except on sites you locked.

## What it reads

### The same `$49.99`, two shops

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/context-dark.png" />
    <img src="./screenshots/context-light.png" alt="The same $49.99 on a .com shop and on a .ca shop: 44 euros on the first, 31 on the second, with a note that the currency was read from the site" width="820" />
  </picture>
</p>

The country comes from the domain, or from the region in `<html lang>` when the
domain says nothing. Vanity endings (`.co`, `.io`, `.ai`, `.me`, `.tv`, `.to`)
are ignored, because the country in them means nothing. When the site decided
and not the price, the card says so.

### One table, eight currencies, three symbols

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/table-dark.png" />
    <img src="./screenshots/table-light.png" alt="A regional price table with inline mode on: three dollar rows, two yen rows and three krone rows, each converted from the currency its row names" width="820" />
  </picture>
</p>

Two things outrank the domain: a code printed beside the price (`$49 CAD`), and
the row the price sits in, so SteamDB's `¥ 69` on the Chinese Yuan row is yuan
while the `¥ 1,980` on the Japanese Yen row stays yen. One thing ranks below it:
what the site's own pages said, remembered per site on your machine and listed
in the settings, where each entry can be removed. A lock you set yourself beats
all of them.

| On the page | Read as |
| --- | --- |
| `¥74,800` on a `.jp` shop | 74 800 JPY |
| `¥74,800` on a `.cn` shop | 74 800 CNY |
| `$49.99 CAD` anywhere | 49.99 CAD |
| `¥ 69` on a row labelled Chinese Yuan | 69 CNY |
| `₹1,49,900` | 149 900 INR (Indian lakh grouping) |
| `KD 12.500` | 12.500 KWD (three decimals, not thousands) |
| `€10-20` | a range, 10 to 20 EUR |
| `try 100 times`, `requires PHP 8.2`, `error code 500 KD` | nothing |

## Inline mode

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/inline-dark.png" />
    <img src="./screenshots/inline-light.png" alt="A product page where every yen amount is followed by its euro equivalent in brackets" width="820" />
  </picture>
</p>

Off by default. The site's own text is never rewritten, only appended to, and
text fields, editable areas, `code` and `pre` are left alone.

## Crypto, both ways

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/crypto-dark.png" />
    <img src="./screenshots/crypto-light.png" alt="Left, a licence priced 0.0042 BTC read as euros, dollars and pounds. Right, a $49.99 backpack read in euros, pounds, bitcoin and ether." width="820" />
  </picture>
</p>

Off by default. One switch in the settings turns it on, your browser asks for
`api.coingecko.com`, and from then on:

- **Crypto prices on a page convert like any other.** `0.0042 BTC`, `₿0.05`,
  `Ξ0.085`, `250 USDT`, and the tickers XMR, USDC, DOGE, XRP, LTC and BCH.
  `ETH 8092` stays a Zurich postal code and `BTC 10000` a headline.
- **Any of the 24 assets can sit in your list**, so a price in dollars also
  reads in bitcoin or ether.
- **The popup takes them too**: `0.5 btc`, `100 eur eth`.
- **Rates have their own clock**, refreshed hourly while the switch is on, with
  a warning on the card when they are stale.

Switching it off hands the permission back, and nothing contacts the second
host again.

## The popup is also a converter

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/popup-dark.png" />
    <img src="./screenshots/popup-light.png" alt="The PriceHover popup twice: converting 250 CHF, then 0.5 BTC, into a list of currencies" width="640" />
  </picture>
</p>

Type `250 chf`, `20 usd jpy`, `0.5 btc` once crypto is on, or a bare number to
convert from your own currency. The footer says how old the rates are and refreshes them on demand.

## Settings

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./screenshots/options-dark.png" />
    <img src="./screenshots/options-light.png" alt="The PriceHover settings page: currencies, behaviour, sites with paused, locked and remembered entries, about" width="760" />
  </picture>
</p>

Your own currency, the list to convert into and its order, hover delay,
rounding, inline mode, paused sites, locked site currencies, the currencies
read from each site, and the interface language, with import and export of
language files.

## Privacy

PriceHover contacts exactly one host, `open.er-api.com`, and asks it one
question: today's exchange rates. That request carries nothing about you or the
page you are on. Prices are detected on your machine, flags are bundled in the
extension, and there is no analytics, no telemetry and no identifier. Two
permissions, `storage` and `open.er-api.com`, plus the page access every
content script needs to read the page it runs on.

Turning on crypto conversion adds a second host, `api.coingecko.com`, and
nothing else. It is off by default, your browser asks before granting it, and
switching it back off hands the permission back.

Full details in the [privacy policy](PRIVACY.md).

## Install

- **Chrome / Edge**: unzip the zip from [Releases](https://github.com/ddd000987/PriceHover/releases),
  then load the folder unpacked from `chrome://extensions` (`edge://extensions`)
  with developer mode on. This fork is not published to any store.

## Build from source

```bash
bun install
bun run dev            # Chrome, hot reload
bun run build          # Chrome MV3  -> .output/chrome-mv3
bun test               # unit tests, plus DOM tests under happy-dom
bun run typecheck      # tsc --noEmit, kept clean and enforced in CI
```

`bun run icons`, `bun run flags` and `bun run locales` regenerate committed
files and never run at build time. A release is cut by pushing a `vX.Y.Z.N` tag:
CI refuses a tag that disagrees with `package.json`, builds the extension and
attaches the zip.

## Contributing

Issues and pull requests are welcome. Keep `bun test` and `bun run typecheck`
clean, and never add a runtime request to a second host. Detection is the part
that breaks quietly: a token accepted one position too freely turns `error code
500 KD` into a price, so every new one arrives with the case that must stay
silent.

## License

[GNU General Public License v3.0 or later](LICENSE). Use it, read it, fork it.
Distributing a modified version, publishing a fork to a browser store included,
means releasing its source under the same license. Every dependency is
GPL-compatible, and only Svelte (MIT) ships inside the extension.

This fork was modified by [ddd000987](https://github.com/ddd000987) from
[klNuno/PriceHover](https://github.com/klNuno/PriceHover) 2.2.0. What changed is
listed under [How this fork differs from the original](#how-this-fork-differs-from-the-original)
and in [CHANGELOG.md](CHANGELOG.md).
