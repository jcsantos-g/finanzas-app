import { listCategories } from '@/features/categories/service';
import { listTransactions } from '@/features/transactions/service';
import type { Categoria, Movimiento } from '@/types/database';

import { getMonthlyReport } from '../service';

jest.mock('@/features/categories/service', () => ({
  listCategories: jest.fn(),
}));

jest.mock('@/features/transactions/service', () => ({
  listTransactions: jest.fn(),
}));

const listCategoriesMock = jest.mocked(listCategories);
const listTransactionsMock = jest.mocked(listTransactions);

const salaryCategory: Categoria = {
  id: 'category-salary',
  usuario_id: 'user-1',
  nombre: 'Salario',
  tipo: 'ingreso',
  icono: 'salario',
};

const giftsCategory: Categoria = {
  id: 'category-gifts',
  usuario_id: 'user-1',
  nombre: 'Regalos',
  tipo: 'ingreso',
  icono: 'regalos',
};

const foodCategory: Categoria = {
  id: 'category-food',
  usuario_id: 'user-1',
  nombre: 'Alimentación',
  tipo: 'gasto',
  icono: 'alimentacion',
};

const transportCategory: Categoria = {
  id: 'category-transport',
  usuario_id: 'user-1',
  nombre: 'Transporte',
  tipo: 'gasto',
  icono: 'transporte',
};

function makeMovement(overrides: Partial<Movimiento> = {}): Movimiento {
  return {
    id: 'movement-1',
    usuario_id: 'user-1',
    categoria_id: salaryCategory.id,
    tipo: 'ingreso',
    monto: 1,
    fecha: '2026-03-15',
    descripcion: null,
    establecimiento: null,
    origen: 'manual',
    movimiento_recurrente_id: null,
    fecha_programada: null,
    creado_en: '2026-03-15T00:00:00.000Z',
    actualizado_en: '2026-03-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('getMonthlyReport', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    listTransactionsMock.mockResolvedValue([]);
    listCategoriesMock.mockImplementation(async (tipo) =>
      tipo === 'ingreso'
        ? [salaryCategory, giftsCategory]
        : [foodCategory, transportCategory],
    );
  });

  it('suma ingresos conservando los centavos', async () => {
    listTransactionsMock.mockResolvedValue([
      makeMovement({ id: 'income-1', monto: 1200.1 }),
      makeMovement({ id: 'income-2', monto: 300.45 }),
    ]);

    const report = await getMonthlyReport(2026, 3);

    expect(report.totalIngresos).toBe(1500.55);
  });

  it('suma gastos conservando los centavos', async () => {
    listTransactionsMock.mockResolvedValue([
      makeMovement({ id: 'expense-1', tipo: 'gasto', categoria_id: foodCategory.id, monto: 50.1 }),
      makeMovement({ id: 'expense-2', tipo: 'gasto', categoria_id: foodCategory.id, monto: 19.99 }),
    ]);

    const report = await getMonthlyReport(2026, 3);

    expect(report.totalGastos).toBe(70.09);
  });

  it('calcula el balance como ingresos menos gastos con centavos', async () => {
    listTransactionsMock.mockResolvedValue([
      makeMovement({ id: 'income-1', monto: 100.1 }),
      makeMovement({ id: 'income-2', monto: 0.25 }),
      makeMovement({ id: 'expense-1', tipo: 'gasto', categoria_id: foodCategory.id, monto: 40.2 }),
      makeMovement({ id: 'expense-2', tipo: 'gasto', categoria_id: foodCategory.id, monto: 0.15 }),
    ]);

    const report = await getMonthlyReport(2026, 3);

    expect(report.totalIngresos).toBe(100.35);
    expect(report.totalGastos).toBe(40.35);
    expect(report.balance).toBe(60);
  });

  it('agrupa los movimientos por categoría y tipo', async () => {
    listTransactionsMock.mockResolvedValue([
      makeMovement({ id: 'salary-1', monto: 4.1 }),
      makeMovement({ id: 'salary-2', monto: 1.2 }),
      makeMovement({ id: 'gift-1', categoria_id: giftsCategory.id, monto: 3.55 }),
      makeMovement({ id: 'food-1', tipo: 'gasto', categoria_id: foodCategory.id, monto: 8.25 }),
      makeMovement({ id: 'food-2', tipo: 'gasto', categoria_id: foodCategory.id, monto: 0.75 }),
    ]);

    const report = await getMonthlyReport(2026, 3);

    expect(
      report.porCategoria.map(({ categoria, nombreCategoria, tipo, total }) => ({
        categoria,
        nombreCategoria,
        tipo,
        total,
      })),
    ).toEqual([
      { categoria: foodCategory, nombreCategoria: 'Alimentación', tipo: 'gasto', total: 9 },
      { categoria: salaryCategory, nombreCategoria: 'Salario', tipo: 'ingreso', total: 5.3 },
      { categoria: giftsCategory, nombreCategoria: 'Regalos', tipo: 'ingreso', total: 3.55 },
    ]);
  });

  it('incluye los movimientos sin categoría en los totales y los agrupa como Sin categoría', async () => {
    listTransactionsMock.mockResolvedValue([
      makeMovement({
        id: 'uncategorized-expense',
        tipo: 'gasto',
        categoria_id: 'missing-category',
        monto: 19.99,
      }),
    ]);

    const report = await getMonthlyReport(2026, 3);

    expect(report.totalGastos).toBe(19.99);
    expect(report.porCategoria).toEqual([
      {
        categoria: null,
        nombreCategoria: 'Sin categoría',
        tipo: 'gasto',
        total: 19.99,
      },
    ]);
  });

  it('mantiene separados los ingresos y gastos sin categoría', async () => {
    listTransactionsMock.mockResolvedValue([
      makeMovement({ id: 'uncategorized-income-1', categoria_id: 'missing-income-1', monto: 10.15 }),
      makeMovement({ id: 'uncategorized-income-2', categoria_id: 'missing-income-2', monto: 2.35 }),
      makeMovement({
        id: 'uncategorized-expense-1',
        tipo: 'gasto',
        categoria_id: 'missing-expense-1',
        monto: 3.25,
      }),
      makeMovement({
        id: 'uncategorized-expense-2',
        tipo: 'gasto',
        categoria_id: 'missing-expense-2',
        monto: 1.25,
      }),
    ]);

    const report = await getMonthlyReport(2026, 3);

    expect(report.totalIngresos).toBe(12.5);
    expect(report.totalGastos).toBe(4.5);
    expect(report.porCategoria).toEqual([
      { categoria: null, nombreCategoria: 'Sin categoría', tipo: 'ingreso', total: 12.5 },
      { categoria: null, nombreCategoria: 'Sin categoría', tipo: 'gasto', total: 4.5 },
    ]);
  });

  it('devuelve totales en cero y categorías vacías si el mes no tiene movimientos', async () => {
    const report = await getMonthlyReport(2026, 3);

    expect(report).toEqual({
      year: 2026,
      month: 3,
      desde: '2026-03-01',
      hasta: '2026-03-31',
      totalIngresos: 0,
      totalGastos: 0,
      balance: 0,
      porCategoria: [],
    });
  });

  it('usa el rango de monthRange real para un febrero bisiesto', async () => {
    await getMonthlyReport(2028, 2);

    expect(listTransactionsMock).toHaveBeenCalledWith({
      desde: '2028-02-01',
      hasta: '2028-02-29',
    });
    expect(listCategoriesMock).toHaveBeenCalledWith('ingreso');
    expect(listCategoriesMock).toHaveBeenCalledWith('gasto');
  });

  it('rechaza años y meses inválidos con RangeError sin consultar los servicios', async () => {
    const invalidPeriods: { year: number; month: number }[] = [
      { year: 2026.5, month: 3 },
      { year: Number.NaN, month: 3 },
      { year: 2026, month: 0 },
      { year: 2026, month: 13 },
    ];

    for (const period of invalidPeriods) {
      await expect(getMonthlyReport(period.year, period.month)).rejects.toBeInstanceOf(RangeError);
    }

    expect(listTransactionsMock).not.toHaveBeenCalled();
    expect(listCategoriesMock).not.toHaveBeenCalled();
  });

  it('propaga los errores de listTransactions y listCategories', async () => {
    const transactionError = new Error('Falló la consulta de movimientos');
    listTransactionsMock.mockRejectedValueOnce(transactionError);

    await expect(getMonthlyReport(2026, 3)).rejects.toBe(transactionError);

    const categoryError = new Error('Falló la consulta de categorías');
    listCategoriesMock.mockRejectedValueOnce(categoryError);

    await expect(getMonthlyReport(2026, 3)).rejects.toBe(categoryError);
  });
});
