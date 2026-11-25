
import { createContext } from 'react';
import { Language, CurrencyCode, CompanyInfo } from '@/lib/types';

export interface AppContextType {
  lang: Language;
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  t: any;
  company: CompanyInfo;
}

export const AppContext = createContext<AppContextType>(null!);
