import { describe, expect, it } from 'vitest';

import { createLunariaI18n, normalizeLocale } from './create-i18n';

describe('normalizeLocale edge cases', () => {
  it('returns en for undefined', () => {
    expect(normalizeLocale(undefined)).toBe('en');
  });

  it('returns en for empty string', () => {
    expect(normalizeLocale('')).toBe('en');
  });

  it('normalizes pt-BR explicitly', () => {
    expect(normalizeLocale('pt-BR')).toBe('pt-BR');
  });

  it('normalizes pt to pt-BR', () => {
    expect(normalizeLocale('pt')).toBe('pt-BR');
  });

  it('normalizes PT uppercase to pt-BR', () => {
    expect(normalizeLocale('PT')).toBe('pt-BR');
  });

  it('normalizes es-MX to es', () => {
    expect(normalizeLocale('es-MX')).toBe('es');
  });

  it('normalizes ES to es', () => {
    expect(normalizeLocale('ES')).toBe('es');
  });

  it('normalizes fr to fr', () => {
    expect(normalizeLocale('fr')).toBe('fr');
  });

  it('normalizes FR to fr', () => {
    expect(normalizeLocale('FR')).toBe('fr');
  });

  it('normalizes de to de', () => {
    expect(normalizeLocale('de')).toBe('de');
  });

  it('normalizes DE-AT to de', () => {
    expect(normalizeLocale('DE-AT')).toBe('de');
  });

  it('returns en for Japanese', () => {
    expect(normalizeLocale('ja')).toBe('en');
  });

  it('returns en for Chinese', () => {
    expect(normalizeLocale('zh')).toBe('en');
  });

  it('returns en for random string', () => {
    expect(normalizeLocale('xyz-123')).toBe('en');
  });
});

describe('createLunariaI18n', () => {
  it('defaults to en when no locale specified', () => {
    const i18n = createLunariaI18n();
    expect(i18n.language).toBe('en');
  });

  it('creates instance with specified locale', () => {
    const i18n = createLunariaI18n({ locale: 'fr' });
    expect(i18n.language).toBe('fr');
  });

  it('falls back to en for unsupported locale', () => {
    const i18n = createLunariaI18n({ locale: 'ja' });
    expect(i18n.language).toBe('en');
  });

  it('creates independent instances', () => {
    const i18n1 = createLunariaI18n({ locale: 'en' });
    const i18n2 = createLunariaI18n({ locale: 'es' });
    expect(i18n1).not.toBe(i18n2);
    expect(i18n1.language).not.toBe(i18n2.language);
  });

  it('translates keys from en resources', () => {
    const i18n = createLunariaI18n({ locale: 'en' });
    const result = i18n.t('app.runtimeEyebrow');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('translates keys from es resources', () => {
    const i18n = createLunariaI18n({ locale: 'es' });
    const result = i18n.t('app.bootstrapFailed');
    expect(result).toBeTruthy();
  });

  it('translates keys from de resources', () => {
    const i18n = createLunariaI18n({ locale: 'de' });
    const result = i18n.t('app.bootstrapFailed');
    expect(result).toBeTruthy();
  });

  it('translates keys from fr resources', () => {
    const i18n = createLunariaI18n({ locale: 'fr' });
    const result = i18n.t('app.bootstrapFailed');
    expect(result).toBeTruthy();
  });
});
