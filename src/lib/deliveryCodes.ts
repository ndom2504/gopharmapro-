export function makeSecureCode() {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function codesMatch(expected: string, input: string) {
  return expected.length === 6 && digitsOnly(input) === expected;
}

export const MAX_CODE_ATTEMPTS = 5;
