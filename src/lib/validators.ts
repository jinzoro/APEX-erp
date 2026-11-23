// Field validators for Moroccan identifiers and common fields.
// Legal formats marked TO VERIFY against official DGI/CNDP/CNSS sources.

export function isValidICE(value: string): boolean {
  // ICE = 15 digits (TO VERIFY: exact format/length with DGI)
  return /^\d{15}$/.test(value.trim());
}

export function isValidIF(value: string): boolean {
  // IF = fiscal identifier; length varies (TO VERIFY)
  return /^\d{1,10}$/.test(value.trim());
}

export function isValidRC(value: string): boolean {
  // RC = registre de commerce; alphanumeric (TO VERIFY)
  return /^[A-Za-z0-9\-/]{3,20}$/.test(value.trim());
}

export function isValidRIB(value: string): boolean {
  // Moroccan RIB = 24 digits (TO VERIFY checksum/mod-97)
  const v = value.replace(/\s/g, '');
  return /^\d{24}$/.test(v);
}

export function isValidCIN(value: string): boolean {
  // CIN = 1-2 letters + 5-6 digits (TO VERIFY)
  return /^[A-Za-z]{1,2}\d{5,6}$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const v = value.replace(/[\s\-().]/g, '');
  return /^\+?\d{9,15}$/.test(v);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidCNSS(value: string): boolean {
  // CNSS employer/employee number (TO VERIFY format)
  return /^\d{6,12}$/.test(value.trim());
}
