import { isPositiveAmount, isValidEmail, parseAmount } from '../validators';

describe('isPositiveAmount (RN-02)', () => {
  it('acepta montos mayores que cero', () => {
    expect(isPositiveAmount(0.01)).toBe(true);
    expect(isPositiveAmount(1500)).toBe(true);
  });

  it('rechaza cero, negativos, NaN, null y undefined', () => {
    expect(isPositiveAmount(0)).toBe(false);
    expect(isPositiveAmount(-5)).toBe(false);
    expect(isPositiveAmount(NaN)).toBe(false);
    expect(isPositiveAmount(null)).toBe(false);
    expect(isPositiveAmount(undefined)).toBe(false);
  });
});

describe('parseAmount', () => {
  it('convierte texto con comas y decimales', () => {
    expect(parseAmount('1,250.50')).toBe(1250.5);
  });

  it('devuelve null para texto vacío o inválido', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('   ')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });
});

describe('isValidEmail', () => {
  it('valida formatos básicos', () => {
    expect(isValidEmail('ana@correo.com')).toBe(true);
    expect(isValidEmail('ana@correo')).toBe(false);
    expect(isValidEmail('ana correo.com')).toBe(false);
  });
});
