export interface Income {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
}

export interface MonthlyData {
  month: string; // YYYY-MM
  total: number;
  incomes: Income[];
  categoryBreakdown: { name: string; value: number }[];
}

export const CATEGORIES = [
  'Activo',
  'Pasivo',
  'Ventas',
  'Inversión',
  'Salario',
  'Honorario',
  'Servicio',
  'Mensualidad'
] as const;

export type CategoryType = typeof CATEGORIES[number];
