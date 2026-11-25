import { describe, it, expect } from 'vitest';
import {
  toMinor, fromMinor, addMinor, subMinor, mulMinorByQty,
  computeVatMinor, formatMoney, amountInWordsFr,
} from '../money';

describe('money toMinor/fromMinor', () => {
  it('parses integer', () => expect(toMinor('100')).toBe(10000));
  it('parses 2 decimals', () => expect(toMinor('12.34')).toBe(1234));
  it('parses 1 decimal padded', () => expect(toMinor('12.3')).toBe(1230));
  it('parses 3 decimals half-up', () => expect(toMinor('12.345')).toBe(1235));
  it('parses 3 decimals round down', () => expect(toMinor('12.344')).toBe(1234));
  it('handles negative', () => expect(toMinor('-1.23')).toBe(-123));
  it('handles number input', () => expect(toMinor(1.005)).toBe(101)); // note float
  it('roundtrips', () => {
    for (const v of ['0', '0.01', '12.34', '999.99', '-5.50']) {
      expect(fromMinor(toMinor(v))).toBe(normalize(v));
    }
  });
  it('rejects invalid', () => expect(() => toMinor('abc')).toThrow());
});

function normalize(v: string): string {
  const n = Number(v);
  return n.toFixed(2);
}

describe('money arithmetic', () => {
  it('add', () => expect(addMinor(100, 200)).toBe(300));
  it('sub', () => expect(subMinor(500, 200)).toBe(300));
  it('mul qty', () => expect(mulMinorByQty(1234, 3)).toBe(3702));
  it('mul qty rejects float', () => expect(() => mulMinorByQty(1, 1.5)).toThrow());
});

describe('VAT', () => {
  it('20% of 100.00', () => expect(computeVatMinor(10000, 20)).toBe(2000));
  it('7% of 100.00', () => expect(computeVatMinor(10000, 7)).toBe(700));
  it('14% of 33.33', () => expect(computeVatMinor(3333, 14)).toBe(467)); // 466.62 -> 467
  it('0% -> 0', () => expect(computeVatMinor(10000, 0)).toBe(0));
});

describe('formatting', () => {
  it('formatMoney', () => expect(typeof formatMoney(1234, 'MAD')).toBe('string'));
  it('amountInWordsFr', () => {
    const w = amountInWordsFr(12345, 'MAD');
    expect(w).toContain('MAD');
  });
});
