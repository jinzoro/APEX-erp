# LEGAL / TAX / PAYROLL TODO

Anything here is implemented as **configurable data** (versioned tables with
effective dates and a `to_verify` flag) until verified against official sources.

## VAT (TVA) rates
- Rates used: 0 / 7 / 10 / 14 / 20 (TO VERIFY current Moroccan VAT rates & exemptions with DGI).
- Exemption reason + legal reference required when 0% (TO VERIFY exact wording).
- Law 69-21 late-payment penalty wording and maximum payment term (TO VERIFY).

## Payroll rates (CNSS, AMO, IR scale, professional expense deduction, family deductions, CIMR)
- All in `payroll_rates` table with effective dates (TO VERIFY with CNSS/DGI sources).
- Source + date recorded per row.

## Identifiers
- ICE: 15 digits (TO VERIFY exact format/length with DGI).
- IF: length/format (TO VERIFY).
- RIB: 24 digits + checksum/mod-97 (TO VERIFY).
- CIN: format (TO VERIFY).
- CNSS employer/employee number format (TO VERIFY).

## Data protection (Law 09-08 / CNDP)
- Processing notice + consent record, retention 10 years for accounting docs.
- No hard delete / no Factory Reset in production.
- Data export per person, anonymisation instead of deletion.

## E-invoicing
- UBL 2.1 export (TO VERIFY against DGI spec when published).
- No hardcoded deadlines/API details.

## Invoice numbering
- Gap-free, per-tenant, per-fiscal-year via DB sequence with locking (TO VERIFY fiscal year boundaries).

## Other
- Amount in words (FR/AR) wording (TO VERIFY legal requirements).
- Foreign currency: document in MAD; show original currency + rate + rate date (remove hardcoded 10.05).
