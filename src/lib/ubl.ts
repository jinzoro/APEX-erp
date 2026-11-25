// UBL 2.1 invoice export from stored structured data.
// TO VERIFY against DGI spec when published.

import { Sale, CompanyInfo } from './types';

function esc(s: string | undefined | null): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function invoiceToUbl(sale: Sale, company: CompanyInfo | null): string {
  const c = company;
  const issueDate = sale.date.split('T')[0];
  const dueDate = sale.dueDate || issueDate;
  const lines = sale.items.map((it, idx) => `
    <cac:InvoiceLine>
      <cbc:ID>${idx + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="EA">${it.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="MAD">${it.lineHt.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Name>${esc(it.name)}</cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="MAD">${it.price.toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="MAD">${it.lineVat.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="MAD">${it.lineHt.toFixed(2)}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="MAD">${it.lineVat.toFixed(2)}</cbc:TaxAmount>
          <cac:TaxCategory>
            <cbc:ID>S</cbc:ID>
            <cbc:Percent>${it.vatRate}</cbc:Percent>
            <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>
      </cac:TaxTotal>
    </cac:InvoiceLine>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ID>${esc(sale.orderNumber)}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:DueDate>${dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>MAD</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${esc(c?.name)}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${esc(c?.address)}</cbc:StreetName>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${esc(c?.ice)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${esc(sale.customerName)}</cbc:Name></cac:PartyName>
      ${sale.buyerIce ? `<cac:PartyTaxScheme><cbc:CompanyID>${esc(sale.buyerIce)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>` : ''}
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="MAD">${sale.totalVat.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="MAD">${sale.subtotalHt.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="MAD">${sale.subtotalHt.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="MAD">${sale.amount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="MAD">${sale.amount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lines}
</Invoice>`;
}
