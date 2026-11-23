// Central money helpers.
//
// ALL monetary values in this codebase are stored and computed in INTEGER MINOR
// UNITS (e.g. centimes for MAD/EUR, cents for USD). JS floats are never used
// for money. Display formatting converts back to major units.
//
// Rates/thresholds that are legal/tax-related are NOT hardcoded here; they live
// in the `tax_rates` / `payroll_rates` config tables (see LEGAL_TODO.md).

export const MONEY_SCALE = 100; // minor units per major unit

export type MinorUnits = number; // integer

function isDigits(s: string): boolean {
  return /^\d+$/.test(s);
}

/**
 * Parse a decimal money value (string or number) into integer minor units.
 * Rounding is half-up (commercial) when more than 2 decimals are supplied.
 * Throws on invalid input.
 */
export function toMinor(input: string | number): MinorUnits {
  const s = String(input).trim();
  if (s === '' ) return 0;
  const negative = s.startsWith('-');
  const body = negative ? s.slice(1) : s;
  if (body === '' || !/^\d*\.?\d*$/.test(body)) {
    throw new Error(`Invalid money value: ${input}`);
  }
  const [intPartRaw, fracPartRaw = ''] = body.split('.');
  const intPart = intPartRaw === '' ? '0' : intPartRaw;
  if (!isDigits(intPart) || (fracPartRaw !== '' && !isDigits(fracPartRaw))) {
    throw new Error(`Invalid money value: ${input}`);
  }

  const scale = fracPartRaw.length;
  const totalStr = intPart + fracPartRaw; // integer in 10^-scale units (no leading-zero issues handled by BigInt)
  const total = BigInt(totalStr === '' ? '0' : totalStr);

  let minor: bigint;
  if (scale <= 2) {
    minor = total * BigInt(10) ** BigInt(2 - scale);
  } else {
    const divisor = BigInt(10) ** BigInt(scale - 2);
    const q = total / divisor;
    const r = total % divisor;
    // half-up
    minor = r * 2n >= divisor ? q + 1n : q;
  }

  const n = Number(minor);
  if (!Number.isSafeInteger(n)) {
    throw new Error(`Money value out of safe integer range: ${input}`);
  }
  return negative ? -n : n;
}

/**
 * Convert integer minor units back to a 2-decimal major-unit string.
 */
export function fromMinor(minor: MinorUnits): string {
  if (!Number.isInteger(minor)) {
    throw new Error(`Minor units must be an integer, got ${minor}`);
  }
  const negative = minor < 0;
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / MONEY_SCALE);
  const frac = abs % MONEY_SCALE;
  return `${negative ? '-' : ''}${whole}.${String(frac).padStart(2, '0')}`;
}

/**
 * Add two minor-unit amounts.
 */
export function addMinor(a: MinorUnits, b: MinorUnits): MinorUnits {
  return a + b;
}

/**
 * Subtract b from a (minor units).
 */
export function subMinor(a: MinorUnits, b: MinorUnits): MinorUnits {
  return a - b;
}

/**
 * Multiply a minor-unit amount by an integer quantity.
 */
export function mulMinorByQty(minor: MinorUnits, qty: number): MinorUnits {
  if (!Number.isInteger(qty)) {
    throw new Error(`Quantity must be an integer, got ${qty}`);
  }
  return minor * qty;
}

/**
 * Compute VAT minor units from an HT (exclusive) amount and a percentage rate.
 * ratePercent may be a decimal string/number such as 20 or 7.5 (TO VERIFY rates).
 * Rounding is half-up on the minor-unit result.
 */
export function computeVatMinor(htMinor: MinorUnits, ratePercent: string | number): MinorUnits {
  // Work in minor units * 100 to keep precision for percentage with decimals.
  // vat = ht * rate / 100, rounded to minor units.
  const rate = toMinor(String(ratePercent)); // rate as minor of "percent" (x.xx)
  // htMinor (minor) * rate (minor-of-percent) / 100 / 100  -> minor units
  // Use BigInt for exactness.
  const ht = BigInt(htMinor);
  const r = BigInt(rate);
  // vat_minor = ht_minor * rate_percent / 100, rounded half-up
  // rate is stored as minor units of percent (e.g. 20.00% -> 2000). So rate_percent = rate/100.
  // vat = ht * (rate/100) / 100? Let's derive: ratePercent=20 means 20%. vat = ht * 20/100.
  // ht in minor, result in minor. Use scaled: ht * ratePercent (as integer percent*100) / 10000.
  // rate (minor of percent) = ratePercent * 100. So ratePercent = rate/100.
  // vat_minor = ht_minor * ratePercent / 100 = ht_minor * (rate/100) / 100 = ht_minor * rate / 10000.
  const numerator = ht * r; // ht_minor * (ratePercent*100)
  const denom = 10000n;
  const q = numerator / denom;
  const rem = numerator % denom;
  const rounded = rem * 2n >= denom ? q + 1n : q;
  const n = Number(rounded);
  if (!Number.isSafeInteger(n)) throw new Error('VAT result out of safe range');
  return n;
}

/**
 * Format minor units as a currency string for display.
 */
export function formatMoney(minor: MinorUnits, currency: string, locale = 'fr-MA'): string {
  const major = Number(minor) / MONEY_SCALE;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(major);
  } catch {
    return `${fromMinor(minor)} ${currency}`;
  }
}

/**
 * Convert minor units to a number of major units (for charts/legacy). Avoid for money logic.
 */
export function minorToNumber(minor: MinorUnits): number {
  return minor / MONEY_SCALE;
}

/**
 * Best-effort French number-to-words for integer amounts (MAD). TO VERIFY legal
 * wording requirements for invoices.
 */
const FR_UNITS = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
export function numberToWordsFrInteger(n: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error('Expected non-negative integer');
  if (n < 17) return FR_UNITS[n];
  if (n < 20) return 'dix-' + FR_UNITS[n - 10];
  if (n < 70) {
    const tens = Math.floor(n / 10);
    const unit = n % 10;
    const tensWord = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'][tens];
    if (unit === 0) return tensWord;
    if (unit === 1) return tensWord + ' et un';
    return tensWord + '-' + FR_UNITS[unit];
  }
  if (n < 80) {
    const rest = n - 60;
    if (rest === 0) return 'soixante';
    return 'soixante-' + numberToWordsFrInteger(rest);
  }
  if (n < 100) {
    const rest = n - 80;
    if (rest === 0) return 'quatre-vingts';
    return 'quatre-vingt-' + numberToWordsFrInteger(rest);
  }
  if (n < 200) {
    const rest = n - 100;
    if (rest === 0) return 'cent';
    return 'cent ' + numberToWordsFrInteger(rest);
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    if (rest === 0) return FR_UNITS[hundreds] + ' cents';
    return FR_UNITS[hundreds] + ' cent ' + numberToWordsFrInteger(rest);
  }
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    const t = thousands === 1 ? 'mille' : numberToWordsFrInteger(thousands) + ' mille';
    if (rest === 0) return t;
    return t + ' ' + numberToWordsFrInteger(rest);
  }
  // fallback: grouped
  return String(n);
}

export function amountInWordsFr(minor: MinorUnits, currency = 'MAD'): string {
  const whole = Math.floor(Math.abs(minor) / MONEY_SCALE);
  const frac = Math.abs(minor) % MONEY_SCALE;
  let words = numberToWordsFrInteger(whole);
  if (minor < 0) words = 'moins ' + words;
  if (frac > 0) {
    words += ' et ' + String(frac).padStart(2, '0') + '/100';
  }
  return `${words} ${currency}`.trim();
}
