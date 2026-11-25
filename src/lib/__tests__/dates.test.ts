import { addDays, addInterval, daysInMonth, monthRange } from '../dates';

describe('addInterval (RN-09 y RN-10)', () => {
  it('suma 7 días en periodicidad semanal', () => {
    expect(addInterval('2026-03-01', 'semanal')).toBe('2026-03-08');
  });

  it('suma 14 días en periodicidad quincenal y cruza de mes', () => {
    expect(addInterval('2026-03-25', 'quincenal')).toBe('2026-04-08');
  });

  it('avanza un mes en periodicidad mensual', () => {
    expect(addInterval('2026-03-15', 'mensual')).toBe('2026-04-15');
  });

  it('cruza de año en diciembre', () => {
    expect(addInterval('2026-12-15', 'mensual')).toBe('2027-01-15');
  });

  it('RN-10: usa el último día si el día no existe (31 ene -> 28 feb)', () => {
    expect(addInterval('2026-01-31', 'mensual')).toBe('2026-02-28');
  });

  it('RN-10: respeta años bisiestos (31 ene -> 29 feb 2028)', () => {
    expect(addInterval('2028-01-31', 'mensual')).toBe('2028-02-29');
  });

  it('con anchorDay vuelve al día original cuando el mes lo permite (28 feb -> 31 mar)', () => {
    expect(addInterval('2026-02-28', 'mensual', 31)).toBe('2026-03-31');
  });

  it('sin anchorDay el día se queda "pegado" al más bajo (por eso existe anchorDay)', () => {
    expect(addInterval('2026-02-28', 'mensual')).toBe('2026-03-28');
  });
});

describe('daysInMonth y monthRange', () => {
  it('calcula los días de febrero según el año', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
  });

  it('devuelve el primer y último día del mes', () => {
    expect(monthRange(2026, 4)).toEqual({ start: '2026-04-01', end: '2026-04-30' });
  });
});

describe('addDays', () => {
  it('suma y resta días cruzando mes y año', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});
