/**
 * Tipos de la base de datos (provisionales, escritos a mano).
 * Cuando exista la base en Supabase, regenerar con:
 *   npx supabase gen types typescript --project-id <ID> > src/types/database.ts
 * Dueño: Integrante 1. No modificar sin coordinar.
 */

export type MovementType = 'income' | 'expense';
export type TransactionSource = 'manual' | 'recurring' | 'ai';
export type Frequency = 'weekly' | 'biweekly' | 'monthly';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: MovementType;
  icon: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: MovementType;
  amount: number;
  occurred_at: string; // YYYY-MM-DD
  description: string | null;
  merchant: string | null;
  source: TransactionSource;
  recurring_schedule_id: string | null;
  scheduled_date: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface RecurringSchedule {
  id: string;
  user_id: string;
  category_id: string;
  type: MovementType;
  expected_amount: number;
  frequency: Frequency;
  start_date: string; // YYYY-MM-DD
  next_due_date: string; // YYYY-MM-DD
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null; // null = presupuesto general
  amount_limit: number;
  period_month: string; // YYYY-MM-01
  created_at: string;
}

type Insert<T, Auto extends keyof T> = Omit<T, Auto> & Partial<Pick<T, Auto>>;

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Insert<Category, 'id' | 'icon'>;
        Update: Partial<Category>;
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: Insert<
          Transaction,
          | 'id'
          | 'description'
          | 'merchant'
          | 'source'
          | 'recurring_schedule_id'
          | 'scheduled_date'
          | 'created_at'
          | 'updated_at'
        >;
        Update: Partial<Transaction>;
        Relationships: [];
      };
      recurring_schedules: {
        Row: RecurringSchedule;
        Insert: Insert<
          RecurringSchedule,
          'id' | 'description' | 'is_active' | 'created_at' | 'updated_at'
        >;
        Update: Partial<RecurringSchedule>;
        Relationships: [];
      };
      budgets: {
        Row: Budget;
        Insert: Insert<Budget, 'id' | 'created_at'>;
        Update: Partial<Budget>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
