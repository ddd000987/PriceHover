import { afterEach, describe, expect, test } from 'bun:test';
import { parseActiveLanguage, setActiveLanguage, substitute, t, uiLocale } from './i18n';
import {
  BUILTIN_LANGUAGES, fromChromeMessages, packFile, parseCustomLanguages, parseLanguagePack, toLocaleTag,
} from './languages';
import { parseSettings } from './settings';

const ENGLISH = {
  extName: 'PriceHover',
  timeMinutes: '$1 min ago',
  languageImportDone: 'Imported $1: $2 of $3 texts translated.',
  pageContext: 'Read $, kr and ¥ from the site',
};

const pack = (messages: Record<string, unknown>, meta: Record<string, unknown> = {}) => ({
  _meta: { code: 'ko', name: '한국어', locale: 'ko-KR', ...meta },
  messages,
});

afterEach(() => setActiveLanguage(null));

describe('t() with a chosen language', () => {
  test('reads the resolved table first and fills $1-$9', () => {
    setActiveLanguage({ id: 'custom:ko', locale: 'ko-KR', messages: { timeMinutes: '$1분 전' } });
    expect(t('timeMinutes', '5')).toBe('5분 전');
    expect(uiLocale()).toBe('ko-KR');
  });

  test('a key the table lacks still comes back as something', () => {
    setActiveLanguage({ id: 'ko', locale: 'ko', messages: {} });
    expect(t('nope')).toBe('nope');
  });

  test('no table means the browser decides, as before', () => {
    expect(uiLocale()).toBe('en');
    expect(t('timeMinutes')).toBe('timeMinutes');
  });

  test('substitution leaves a literal dollar and a missing value alone', () => {
    expect(substitute('Read $, kr and ¥')).toBe('Read $, kr and ¥');
    expect(substitute('$1 of $2', ['3'])).toBe('3 of $2');
    expect(substitute('$2 / $1', ['a', 'b'])).toBe('b / a');
  });

  test('a stored table that is not one is ignored', () => {
    expect(parseActiveLanguage(null)).toBeNull();
    expect(parseActiveLanguage({ id: 'ko', locale: 'ko', messages: [] })).toBeNull();
    expect(parseActiveLanguage({ id: 'ko', locale: 'ko', messages: { a: 'x', b: 3, c: '' } })?.messages)
      .toEqual({ a: 'x' });
  });
});

describe('bundled locales', () => {
  test('$$ in a _locales file is a literal dollar', () => {
    expect(fromChromeMessages({ pageContext: { message: 'Read $$, kr' }, n: { message: '$1 min' } }))
      .toEqual({ pageContext: 'Read $, kr', n: '$1 min' });
  });

  test('every bundled language has a messages.json', async () => {
    for (const { code } of BUILTIN_LANGUAGES) {
      const file = Bun.file(`${import.meta.dir}/../public/_locales/${code}/messages.json`);
      expect(await file.exists()).toBe(true);
    }
  });

  test('locale tags are canonical and never throw', () => {
    expect(toLocaleTag('pt_BR')).toBe('pt-BR');
    expect(toLocaleTag('zh_TW')).toBe('zh-TW');
    expect(toLocaleTag('not a tag!')).toBe('en');
  });
});

describe('importing a language pack', () => {
  test('keeps known keys and counts the rest', () => {
    const parsed = parseLanguagePack(pack({ timeMinutes: '$1분 전', bogus: 'x', extName: 42 }), ENGLISH);
    if (parsed === 'invalid') throw new Error('rejected');
    expect(parsed.pack).toEqual({ code: 'ko', name: '한국어', locale: 'ko-KR', messages: { timeMinutes: '$1분 전' } });
    expect(parsed.ignored).toBe(1);
    expect(parsed.brokenPlaceholders).toEqual([]);
  });

  test('a translation that lost a placeholder is imported, and reported', () => {
    const parsed = parseLanguagePack(pack({ languageImportDone: '$1 가져옴: $3개 중 번역됨' }), ENGLISH);
    if (parsed === 'invalid') throw new Error('rejected');
    expect(parsed.brokenPlaceholders).toEqual(['languageImportDone']);
  });

  test('rejects what is not a pack', () => {
    expect(parseLanguagePack([], ENGLISH)).toBe('invalid');
    expect(parseLanguagePack({ messages: { timeMinutes: 'x' } }, ENGLISH)).toBe('invalid');
    expect(parseLanguagePack(pack({ timeMinutes: 'x' }, { code: '../en' }), ENGLISH)).toBe('invalid');
    expect(parseLanguagePack(pack({ timeMinutes: 'x' }, { name: '  ' }), ENGLISH)).toBe('invalid');
    expect(parseLanguagePack(pack({ bogus: 'x' }), ENGLISH)).toBe('invalid');
    expect(parseLanguagePack(pack({ timeMinutes: 'x'.repeat(2001) }), ENGLISH)).toBe('invalid');
  });

  test('a missing or bad locale falls back to the code', () => {
    const parsed = parseLanguagePack(pack({ timeMinutes: 'x' }, { code: 'pt_PT', locale: undefined }), ENGLISH);
    if (parsed === 'invalid') throw new Error('rejected');
    expect(parsed.pack.locale).toBe('pt-PT');
  });

  test('an exported file imports back unchanged', () => {
    const text = packFile('ko', '한국어', 'ko-KR', { timeMinutes: '$1분 전' }, ENGLISH, '2.2.0');
    const parsed = parseLanguagePack(JSON.parse(text), ENGLISH);
    if (parsed === 'invalid') throw new Error('rejected');
    // English fills the gaps in an export, so a translator sees every key.
    expect(Object.keys(parsed.pack.messages)).toEqual(Object.keys(ENGLISH));
    expect(parsed.pack.messages.timeMinutes).toBe('$1분 전');
    expect(parsed.pack.messages.pageContext).toBe(ENGLISH.pageContext);
  });

  test('stored packs are re-checked', () => {
    const stored = parseCustomLanguages({
      ko: { code: 'ko', name: '한국어', locale: 'ko', messages: { a: 'x', b: 1 } },
      th: { code: 'xx', name: 'mismatch', locale: 'th', messages: {} },
      junk: 'nope',
    });
    expect(Object.keys(stored)).toEqual(['ko']);
    expect(stored.ko.messages).toEqual({ a: 'x' });
  });
});

describe('uiLanguage setting', () => {
  test('defaults to the browser and accepts only the expected shapes', () => {
    expect(parseSettings({}).uiLanguage).toBe('auto');
    expect(parseSettings({ uiLanguage: 'zh_TW' }).uiLanguage).toBe('zh_TW');
    expect(parseSettings({ uiLanguage: 'custom:pt-PT' }).uiLanguage).toBe('custom:pt-PT');
    expect(parseSettings({ uiLanguage: '../../x' }).uiLanguage).toBe('auto');
    expect(parseSettings({ uiLanguage: 7 }).uiLanguage).toBe('auto');
  });
});
