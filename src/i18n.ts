import { STORAGE } from './types';

/**
 * `chrome.i18n` is available in every context this extension runs in, including
 * the content script, and it costs no permission. The wrapper exists so the UI
 * never crashes when a key is missing (the API returns an empty string, which
 * silently blanks a label) and so tests can run without the API at all.
 *
 * `chrome.i18n` also always follows the browser's language and offers no way to
 * pick another one. A language chosen in the options page is therefore resolved
 * ahead of time (see languages.ts) into one flat table under
 * `STORAGE.ACTIVE_LANGUAGE`, which every context reads once at startup. With
 * nothing there, everything below behaves exactly as `chrome.i18n` alone.
 */

type Substitutions = string | string[];

export interface ActiveLanguage {
  /** What `Settings.uiLanguage` held when this table was built. */
  id: string;
  /** BCP-47 tag used for number formatting and `<html lang>`. */
  locale: string;
  /** Complete: English fills whatever the chosen language left out. */
  messages: Record<string, string>;
}

let active: ActiveLanguage | null = null;

/** Accepts anything storage may hold and returns a usable table or nothing. */
export function parseActiveLanguage(raw: unknown): ActiveLanguage | null {
  if (!raw || typeof raw !== 'object') return null;
  const { id, locale, messages } = raw as Record<string, unknown>;
  if (typeof id !== 'string' || typeof locale !== 'string') return null;
  if (!messages || typeof messages !== 'object' || Array.isArray(messages)) return null;

  const table: Record<string, string> = {};
  for (const [key, value] of Object.entries(messages)) {
    if (typeof value === 'string' && value) table[key] = value;
  }
  return { id, locale, messages: table };
}

export function setActiveLanguage(next: ActiveLanguage | null): void {
  active = next;
}

export function activeLanguageId(): string {
  return active?.id ?? 'auto';
}

/**
 * Called once before anything is rendered. `t()` stays synchronous, so every
 * existing call site keeps working; it just has a table to look in first.
 */
export async function initI18n(): Promise<void> {
  try {
    const stored = await chrome.storage.local.get(STORAGE.ACTIVE_LANGUAGE);
    active = parseActiveLanguage(stored?.[STORAGE.ACTIVE_LANGUAGE]);
  } catch {
    active = null;
  }
}

/** `$1`-`$9` the way `chrome.i18n` fills them. Anything else is left as written. */
export function substitute(message: string, substitutions?: Substitutions): string {
  const list = substitutions === undefined ? [] : Array.isArray(substitutions) ? substitutions : [substitutions];
  return message.replace(/\$(\d)/g, (match, n: string) => list[Number(n) - 1] ?? match);
}

export function t(key: string, substitutions?: Substitutions): string {
  const own = active?.messages[key];
  if (own) return substitute(own, substitutions);

  try {
    const value = chrome.i18n.getMessage(key, substitutions);
    if (value) return value;
  } catch {
    // No extension runtime: tests, or a stubbed environment.
  }
  return key;
}

/** BCP-47 tag of the UI, used to format numbers the way the user reads them. */
export function uiLocale(): string {
  if (active) return active.locale;
  try {
    const tag = chrome.i18n.getUILanguage();
    if (tag) return tag;
  } catch {
    // fall through
  }
  return 'en';
}
