import { listCategories } from '@/features/categories/service';
import { listTransactions } from '@/features/transactions/service';
import { monthRange } from '@/lib/dates';
import type { Categoria, TipoMovimiento } from '@/types/database';

export type CategoryReport = {
  categoria: Categoria | null;
  nombreCategoria: string;
  tipo: TipoMovimiento;
  total: number;
};

export type MonthlyReport = {
  year: number;
  month: number;
  desde: string;
  hasta: string;
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  porCategoria: CategoryReport[];
};

type CategoryTotal = {
  categoria: Categoria | null;
  nombreCategoria: string;
  tipo: TipoMovimiento;
  centavos: number;
};

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('El año y el mes del reporte no son válidos.');
  }

  const { start, end } = monthRange(year, month);
  const [movimientos, categoriasIngreso, categoriasGasto] = await Promise.all([
    listTransactions({ desde: start, hasta: end }),
    listCategories('ingreso'),
    listCategories('gasto'),
  ]);
  const categoriasPorId = new Map(
    [...categoriasIngreso, ...categoriasGasto].map((categoria) => [categoria.id, categoria]),
  );

  let ingresosCentavos = 0;
  let gastosCentavos = 0;
  const totalesPorCategoria = new Map<string, CategoryTotal>();

  for (const movimiento of movimientos) {
    const categoria = categoriasPorId.get(movimiento.categoria_id);
    const centavos = Math.round(movimiento.monto * 100);
    if (movimiento.tipo === 'ingreso') {
      ingresosCentavos += centavos;
    } else {
      gastosCentavos += centavos;
    }

    const nombreCategoria = categoria?.nombre ?? 'Sin categoría';
    const key = categoria
      ? `${movimiento.tipo}:${categoria.id}`
      : `${movimiento.tipo}:sin-categoria`;
    const total = totalesPorCategoria.get(key);
    if (total) {
      total.centavos += centavos;
    } else {
      totalesPorCategoria.set(key, {
        categoria: categoria ?? null,
        nombreCategoria,
        tipo: movimiento.tipo,
        centavos,
      });
    }
  }

  const porCategoria = [...totalesPorCategoria.values()]
    .map(({ categoria, nombreCategoria, tipo, centavos }) => ({
      categoria,
      nombreCategoria,
      tipo,
      total: centavos / 100,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    year,
    month,
    desde: start,
    hasta: end,
    totalIngresos: ingresosCentavos / 100,
    totalGastos: gastosCentavos / 100,
    balance: (ingresosCentavos - gastosCentavos) / 100,
    porCategoria,
  };
}
