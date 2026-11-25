/**
 * Tipos de la base de datos (provisionales, escritos a mano; reflejan supabase/migrations/0001_init.sql).
 * Los nombres de tablas, columnas y valores están en español, igual que en la base de datos.
 * Cuando exista la base en Supabase, se pueden regenerar con:
 *   npx supabase gen types typescript --project-id <ID> > src/types/database.ts
 * Dueño: Integrante 1. No modificar sin coordinar.
 */

export type TipoMovimiento = 'ingreso' | 'gasto';
export type OrigenMovimiento = 'manual' | 'recurrente' | 'ia';
export type Frecuencia = 'semanal' | 'quincenal' | 'mensual';

/** Tabla `categorias`. */
export interface Categoria {
  id: string;
  usuario_id: string;
  nombre: string;
  tipo: TipoMovimiento;
  icono: string | null;
}

/** Tabla `movimientos`: ingresos y gastos que realmente ocurrieron. */
export interface Movimiento {
  id: string;
  usuario_id: string;
  categoria_id: string;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string; // YYYY-MM-DD
  descripcion: string | null;
  establecimiento: string | null;
  origen: OrigenMovimiento;
  movimiento_recurrente_id: string | null;
  fecha_programada: string | null; // YYYY-MM-DD
  creado_en: string;
  actualizado_en: string;
}

/** Tabla `movimientos_recurrentes`: programaciones que se repiten. */
export interface MovimientoRecurrente {
  id: string;
  usuario_id: string;
  categoria_id: string;
  tipo: TipoMovimiento;
  monto_esperado: number;
  frecuencia: Frecuencia;
  fecha_inicio: string; // YYYY-MM-DD
  proxima_fecha: string; // YYYY-MM-DD
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

/** Tabla `presupuestos`. `categoria_id` es null para el presupuesto general del mes. */
export interface Presupuesto {
  id: string;
  usuario_id: string;
  categoria_id: string | null;
  monto_limite: number;
  mes: string; // YYYY-MM-01
  creado_en: string;
}

type Insertar<T, Opcionales extends keyof T> = Omit<T, Opcionales> & Partial<Pick<T, Opcionales>>;

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: Categoria;
        Insert: Insertar<Categoria, 'id' | 'icono'>;
        Update: Partial<Categoria>;
        Relationships: [];
      };
      movimientos: {
        Row: Movimiento;
        Insert: Insertar<
          Movimiento,
          | 'id'
          | 'descripcion'
          | 'establecimiento'
          | 'origen'
          | 'movimiento_recurrente_id'
          | 'fecha_programada'
          | 'creado_en'
          | 'actualizado_en'
        >;
        Update: Partial<Movimiento>;
        Relationships: [];
      };
      movimientos_recurrentes: {
        Row: MovimientoRecurrente;
        Insert: Insertar<
          MovimientoRecurrente,
          'id' | 'descripcion' | 'activo' | 'creado_en' | 'actualizado_en'
        >;
        Update: Partial<MovimientoRecurrente>;
        Relationships: [];
      };
      presupuestos: {
        Row: Presupuesto;
        Insert: Insertar<Presupuesto, 'id' | 'creado_en'>;
        Update: Partial<Presupuesto>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      /** Ingresos menos gastos del usuario conectado (0003_dinero_disponible.sql). */
      dinero_disponible: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
