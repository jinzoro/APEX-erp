
import { createContext } from 'react';
import { Language, CurrencyCode } from '@/lib/types';

export interface AppContextType {
  lang: Language;
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  t: any;
}

export const AppContext = createContext<AppContextType>(null!);
