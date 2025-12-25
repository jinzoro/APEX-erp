
import { CurrencyCode } from '../types';

const BASE_URL = 'https://open.er-api.com/v6/latest/USD';

interface RatesResponse {
  rates: Record<string, number>;
}

export const currencyService = {
  async getRates(): Promise<Record<string, number>> {
    try {
      const res = await fetch(BASE_URL);
      const data: RatesResponse = await res.json();
      return data.rates;
    } catch (e) {
      console.warn("Currency fetch failed, using fallback rates");
      // Fallback with MAD included
      return { USD: 1, EUR: 0.92, GBP: 0.78, MAD: 10.05, SAR: 3.75, JPY: 150.2 };
    }
  },

  /**
   * Converts an amount from one currency to another using the USD-based rates table
   */
  convert(amount: number, from: string, to: string, rates: Record<string, number>): number {
    if (from === to) return amount;
    // Rates are relative to USD (1 USD = X rate)
    const amountInUSD = amount / (rates[from] || 1);
    return amountInUSD * (rates[to] || 1);
  },

  format(amount: number, code: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2
    }).format(amount);
  }
};
