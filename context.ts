
import React from 'react';
import { Language, CurrencyCode } from './types';

export interface AppContextType {
  lang: Language;
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  t: any;
}

export const AppContext = React.createContext<AppContextType>(null!);
