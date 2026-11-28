import { getErrorMessage } from '../errors';

describe('getErrorMessage', () => {
  it('usa el mensaje de una instancia de Error', () => {
    expect(getErrorMessage(new Error('Sin conexión'))).toBe('Sin conexión');
  });

  it('usa el mensaje de un error de Supabase (objeto simple)', () => {
    expect(getErrorMessage({ message: 'La ocurrencia ya fue resuelta', code: 'P0001' })).toBe(
      'La ocurrencia ya fue resuelta',
    );
  });

  it('usa el texto alternativo si no hay mensaje', () => {
    expect(getErrorMessage(null, 'Falló')).toBe('Falló');
    expect(getErrorMessage({ message: '' }, 'Falló')).toBe('Falló');
    expect(getErrorMessage({ message: 5 }, 'Falló')).toBe('Falló');
  });
});
