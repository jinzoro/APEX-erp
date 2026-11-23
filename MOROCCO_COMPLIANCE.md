# Morocco compliance review (app audit)

Status legend: OK = implemented; GAP = not yet; PARTIAL = partial.

## Invoicing (Phase 4)
- Seller block: legal name, legal form, share capital, address, ICE, IF, RC (+ court), patente/TP, CNSS no., RIB — GAP (CompanyInfo lacks legal_form, share_capital, rc_court, patente, cnss_number, bank_rib; not printed).
- Buyer block: name, ICE (if business), address — GAP (Sale has no buyer ICE/address; invoice prints company address in "Bill to" — bug).
- VAT per line from tax_rates (0/7/10/14/20 configurable, TO VERIFY) — GAP (single slider per invoice).
- Exemption reason + legal reference when 0% — GAP.
- Store HT, VAT, TTC per line and per invoice — GAP (only TTC stored; HT derived by float division).
- Gap-free per-tenant per-fiscal-year numbering via DB sequence with locking — GAP (client counter; order number from first 3 letters of company name).
- Invoices never deleted/edited once validated; corrections via credit note — GAP (deleteItem exists; no credit note entity).
- Payment terms, due date, payment method, late-payment penalty wording (Law 69-21, TO VERIFY) — GAP.
- Foreign currency: document in MAD; show original currency + rate + rate date — GAP (hardcoded 10.05).
- Printable PDF FR (default) + AR (RTL), EN optional; amount in words — PARTIAL (FR/AR/EN present but amount-in-words not implemented).
- ICE/IF saved but not printed — GAP.

## Multi-tenancy / security (Phase 1-3, 8)
- Real users/roles, RLS, audit log with real user id/IP/before-after — GAP (localStorage, hardcoded "Administrator").
- Licence: signed token, device binding, heartbeat, grace, read-only — GAP (trivial checksum, localStorage flag).
- No "Factory Reset" in production, retention 10 years — GAP (factoryReset clears localStorage).
- Data protection Law 09-08/CNDP: notice, consent, export, anonymisation — GAP.

## Accounting (Phase 6)
- CGNC chart, double-entry, locked periods, VAT return helper — GAP (simple income/expense list).

## Payroll (Phase 7)
- Employee file with CIN, CNSS, hire date, family status, contract, gross salary — PARTIAL (only net salary).
- payroll_rates versioned — GAP.

## Trading (Phase 5)
- Quote -> order -> delivery note -> invoice with partials — GAP.
- Purchase flow, multi-warehouse, WAC, price lists, credit limit, aging, DSO — GAP/PARTIAL.

## i18n/UX (Phase 10)
- Field validators ICE/IF/RIB/CIN/phone — PARTIAL (validators added, not wired to forms).
- MAD formatting, Moroccan dates — PARTIAL.

## Quick wins to apply next
1. Fix invoice "Bill to" to use buyer data (not company address).
2. Print seller ICE/IF/RC on invoice.
3. Remove TVA slider; use per-line tax_rates.
4. Switch money to minor units (helper ready).
5. Wire validators into Settings/Sales forms.
