export type TransactionType = 'Pemasukan' | 'Pengeluaran' | 'Transfer';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  description: string;
  account: string;
  amount: number;
  month?: string;
  year?: number | string;
}

export interface Account {
  id: number | string;
  name: string;
  type: string;
  initialBalance: number;
  status: string;
}

export interface QuickTemplate {
  name: string;
  category: string;
  account: string;
  amount: number;
}

export interface RoutineTransaction {
  name: string;
  category: string;
  amount: number;
  account: string;
}

export interface BudgetSummaryItem {
  group: string;
  category: string;
  budget: number;
  realization: number;
  remaining: number;
  percentage: number;
  status: string;
  hasBudget: boolean;
}

export interface DashboardMetrics {
  totalSaldo: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  sisaBudget: number;
  estimasiSaldo: number;
}

export interface MetadataResponse {
  accounts: Account[];
  budgetedCategories: string[];
  allCategories: string[];
  quickExpenseTemplates: QuickTemplate[];
  routineTransactions: RoutineTransaction[];
  dashboard: DashboardMetrics;
  budgets: BudgetSummaryItem[];
}

export type SpecialModeType = 'normal' | 'titip_audy' | 'tarik_audy' | 'pinjamkan' | 'traktir';

export interface PendingQueueItem {
  id: string;
  payload: Omit<Transaction, 'id'> & { requestId: string };
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}
