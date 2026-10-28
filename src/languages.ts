import { parseActiveLanguage, setActiveLanguage } from './i18n';
import type { ActiveLanguage } from './i18n';
import { loadSettings } from './settings';
import { STORAGE } from './types';

/**
 * Picking the interface language by hand, and adding languages without a build.
 *
 * Bundled languages live in `_locales`, where `chrome.i18n` reads them for the
 * browser's own language. Imported ones live in storage. Either way the choice
 * is resolved here into one complete table (English underneath, so a half-done
 * translation never shows a raw key) and written to `STORAGE.ACTIVE_LANGUAGE`,
 * which `t()` reads in every context, the content script included.
 */

/**
 * Must match `LOCALES` in scripts/gen-locales.ts. Names are written in their
 * own language: someone looking for theirs reads it, whatever the UI is in now.
 */
export const BUILTIN_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt_BR', name: 'Português (Brasil)' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Українська' },
  { code: 'th', name: 'ไทย' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
  { code: 'zh_CN', name: '简体中文' },
  { code: 'zh_TW', name: '繁體中文' },
] as const;

const BUILTIN_CODES = new Set<string>(BUILTIN_LANGUAGES.map((l) => l.code));

export const CUSTOM_PREFIX = 'custom:';

/** Generous for ~100 short strings; anything bigger is not a language file. */
export const MAX_PACK_BYTES = 256 * 1024;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_NAME_LENGTH = 40;
const CODE_RE = /^[A-Za-z]{2,3}(?:[_-][A-Za-z0-9]{2,8}){0,2}$/;

export interface LanguagePack {
  code: string;
  name: string;
  /** BCP-47, for number formatting. */
  locale: string;
  messages: Record<string, string>;
}

export type CustomLanguages = Record<string, LanguagePack>;

/** `pt_BR` → `pt-BR`, checked by `Intl`. Falls back to English, never throws. */
export function toLocaleTag(value: string): string {
  try {
    return Intl.getCanonicalLocales(value.replace(/_/g, '-'))[0] ?? 'en';
  } catch {
    return 'en';
  }
}

/**
 * `_locales` files hold `{ key: { message } }` with literal dollars written
 * `$$` (see gen-locales.ts). Flattened and unescaped, they read like a pack.
 */
export function fromChromeMessages(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, entry] of Object.entries(raw)) {
    const message = (entry as { message?: unknown })?.message;
    if (typeof message === 'string') out[key] = message.replace(/\$\$/g, '$');
  }
  return out;
}

async function loadBuiltin(code: string): Promise<Record<string, string> | null> {
  try {
    const response = await fetch(chrome.runtime.getURL(`_locales/${code}/messages.json`));
    if (!response.ok) return null;
    return fromChromeMessages(await response.json());
  } catch {
    return null;
  }
}

/** The reference every pack is checked against and filled from. */
export function loadEnglish(): Promise<Record<string, string> | null> {
  return loadBuiltin('en');
}

const placeholders = (message: string): string[] => (message.match(/\$\d/g) ?? []).sort();

export interface ParsedPack {
  pack: LanguagePack;
  /** Keys this build does not know, dropped. */
  ignored: number;
  /** Keys whose translation lost a `$1` the English has. Imported anyway. */
  brokenPlaceholders: string[];
}

/**
 * Untrusted input, so nothing is taken on faith: only known keys, only strings,
 * bounded sizes. Values are rendered as text everywhere (`t()` output is never
 * fed to `{@html}`), so a string can at worst say something wrong.
 */
export function parseLanguagePack(
  raw: unknown,
  english: Record<string, string>
): ParsedPack | 'invalid' {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'invalid';
  const { _meta: meta, messages } = raw as Record<string, unknown>;
  if (!meta || typeof meta !== 'object' || !messages || typeof messages !== 'object' || Array.isArray(messages)) {
    return 'invalid';
  }

  const { code, name, locale } = meta as Record<string, unknown>;
  if (typeof code !== 'string' || !CODE_RE.test(code)) return 'invalid';
  if (typeof name !== 'string' || !name.trim() || name.trim().length > MAX_NAME_LENGTH) return 'invalid';

  const table: Record<string, string> = {};
  const brokenPlaceholders: string[] = [];
  let ignored = 0;
  for (const [key, value] of Object.entries(messages)) {
    if (!Object.hasOwn(english, key)) { ignored++; continue; }
    if (typeof value !== 'string' || !value.trim()) continue;
    if (value.length > MAX_MESSAGE_LENGTH) return 'invalid';
    table[key] = value;

    const want = placeholders(english[key]);
    const have = new Set(placeholders(value));
    if (want.some((p) => !have.has(p))) brokenPlaceholders.push(key);
  }
  if (!Object.keys(table).length) return 'invalid';

  return {
    pack: {
      code,
      name: name.trim(),
      locale: toLocaleTag(typeof locale === 'string' && locale ? locale : code),
      messages: table,
    },
    ignored,
    brokenPlaceholders,
  };
}

/** What an export writes, and what an import reads back. */
export function packFile(
  code: string,
  name: string,
  locale: string,
  messages: Record<string, string>,
  english: Record<string, string>,
  version: string
): string {
  // English order and every English key, so a translator sees what is left to do.
  const ordered: Record<string, string> = {};
  for (const key of Object.keys(english)) ordered[key] = messages[key] ?? english[key];
  return `${JSON.stringify({ _meta: { code, name, locale, version }, messages: ordered }, null, 2)}\n`;
}

/**
 * A file for `uiLanguage` (or English, for `auto`): the template a translator
 * starts from, or the current state of a pack they want to keep working on.
 */
export async function exportLanguageFile(
  id: string,
  version: string
): Promise<{ filename: string; text: string } | null> {
  const english = await loadEnglish();
  if (!english) return null;
  const customs = await readCustomLanguages().catch(() => ({}) as CustomLanguages);

  const target = id === 'auto' ? 'en' : id;
  const found = await lookup(target, customs);
  if (!found) return null;

  const pack = target.startsWith(CUSTOM_PREFIX) ? customs[target.slice(CUSTOM_PREFIX.length)] : null;
  const code = pack?.code ?? target;
  const name = pack?.name ?? languageName(target, customs);
  return {
    filename: `pricehover-${code}.json`,
    text: packFile(code, name, found.locale, found.messages, english, version),
  };
}

/** Display name for a `uiLanguage` value, in its own language. */
export function languageName(id: string, customs: CustomLanguages): string {
  if (id === 'auto') return BUILTIN_LANGUAGES[0].name;
  if (id.startsWith(CUSTOM_PREFIX)) return customs[id.slice(CUSTOM_PREFIX.length)]?.name ?? id;
  return BUILTIN_LANGUAGES.find((l) => l.code === id)?.name ?? id;
}

/** Stored packs re-checked on the way out: storage is editable from devtools. */
export function parseCustomLanguages(raw: unknown): CustomLanguages {
  const out: CustomLanguages = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [code, value] of Object.entries(raw)) {
    const pack = value as Partial<LanguagePack> | null;
    if (!pack || pack.code !== code || !CODE_RE.test(code) || typeof pack.name !== 'string') continue;
    if (!pack.messages || typeof pack.messages !== 'object') continue;
    const messages: Record<string, string> = {};
    for (const [key, message] of Object.entries(pack.messages)) {
      if (typeof message === 'string' && message) messages[key] = message;
    }
    out[code] = {
      code,
      name: pack.name,
      locale: toLocaleTag(typeof pack.locale === 'string' ? pack.locale : code),
      messages,
    };
  }
  return out;
}

export async function readCustomLanguages(): Promise<CustomLanguages> {
  const stored = await chrome.storage.local.get(STORAGE.CUSTOM_LANGUAGES);
  return parseCustomLanguages(stored?.[STORAGE.CUSTOM_LANGUAGES]);
}

export async function saveCustomLanguage(pack: LanguagePack): Promise<void> {
  const current = await readCustomLanguages();
  await chrome.storage.local.set({ [STORAGE.CUSTOM_LANGUAGES]: { ...current, [pack.code]: pack } });
}

export async function removeCustomLanguage(code: string): Promise<void> {
  const current = await readCustomLanguages();
  delete current[code];
  await chrome.storage.local.set({ [STORAGE.CUSTOM_LANGUAGES]: current });
}

/** Messages and locale for a `uiLanguage` value, or null when it names nothing. */
async function lookup(
  id: string,
  customs: CustomLanguages
): Promise<{ locale: string; messages: Record<string, string> } | null> {
  if (id.startsWith(CUSTOM_PREFIX)) {
    const pack = customs[id.slice(CUSTOM_PREFIX.length)];
    return pack ? { locale: pack.locale, messages: pack.messages } : null;
  }
  if (!BUILTIN_CODES.has(id)) return null;
  const messages = await loadBuiltin(id);
  return messages ? { locale: toLocaleTag(id), messages } : null;
}

/**
 * Rebuilds `STORAGE.ACTIVE_LANGUAGE` from the settings and the imported packs.
 * Called after anything that may change the answer: a new choice, an import or
 * removal, and an extension update (bundled texts may have changed with it).
 * Anything that cannot be resolved falls back to the browser's language.
 */
export async function applyLanguage(): Promise<ActiveLanguage | null> {
  const settings = await loadSettings();
  const id = settings.uiLanguage;

  let next: ActiveLanguage | null = null;
  if (id !== 'auto') {
    const [english, customs] = await Promise.all([loadEnglish(), readCustomLanguages().catch(() => ({}))]);
    const found = await lookup(id, customs);
    if (english && found) {
      next = parseActiveLanguage({ id, locale: found.locale, messages: { ...english, ...found.messages } });
    }
  }

  if (next) await chrome.storage.local.set({ [STORAGE.ACTIVE_LANGUAGE]: next });
  else await chrome.storage.local.remove(STORAGE.ACTIVE_LANGUAGE);
  setActiveLanguage(next);
  return next;
}
