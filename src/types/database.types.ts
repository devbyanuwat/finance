export type AccountType = 'cash' | 'bank' | 'credit_card' | 'e_wallet'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type TransactionStatus = 'pending' | 'completed' | 'cancelled'
export type CategoryType = 'income' | 'expense'
export type BudgetPeriod = 'monthly' | 'yearly'
export type GoalPriority = 'high' | 'medium' | 'low'
export type CostMethod = 'fifo' | 'lifo' | 'average'
export type ProductTransactionType = 'purchase' | 'sale'
export type AssetType = 'stock' | 'crypto' | 'fund' | 'etf' | 'gold' | 'real_estate' | 'other'
export type InvestmentTransactionType = 'buy' | 'sell' | 'dividend'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  currency: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  icon: string | null
  color: string | null
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  type: CategoryType
  parent_id: string | null
  color: string | null
  icon: string | null
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  to_account_id: string | null
  type: TransactionType
  amount: number
  description: string | null
  note: string | null
  tags: string[] | null
  receipt_url: string | null
  transaction_date: string
  status: TransactionStatus
  is_recurring: boolean
  recurring_rule: RecurringRule | null
  created_at: string
}

export interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  end_date?: string
  occurrences?: number
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: BudgetPeriod
  start_date: string | null
  alert_threshold: number
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  goal_type: string | null
  target_amount: number
  current_amount: number
  deadline: string | null
  priority: GoalPriority
  monthly_contribution: number | null
  auto_allocate: boolean
  icon: string | null
  color: string | null
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  sku: string | null
  name: string
  description: string | null
  category: string | null
  cost_method: CostMethod
  current_stock: number
  created_at: string
}

export interface ProductTransaction {
  id: string
  user_id: string
  product_id: string
  type: ProductTransactionType
  quantity: number
  unit_price: number
  total_amount: number
  transaction_date: string
  supplier: string | null
  customer: string | null
  note: string | null
  created_at: string
}

export interface Investment {
  id: string
  user_id: string
  symbol: string
  name: string
  asset_type: AssetType
  current_price: number | null
  created_at: string
}

export interface InvestmentTransaction {
  id: string
  user_id: string
  investment_id: string
  type: InvestmentTransactionType
  quantity: number | null
  price: number | null
  total_amount: number
  fees: number
  transaction_date: string
  note: string | null
  created_at: string
}

// Insert types (without id and created_at)
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type AccountInsert = Omit<Account, 'id' | 'created_at'>
export type CategoryInsert = Omit<Category, 'id' | 'created_at'>
export type TransactionInsert = Omit<Transaction, 'id' | 'created_at'>
export type BudgetInsert = Omit<Budget, 'id' | 'created_at'>
export type GoalInsert = Omit<Goal, 'id' | 'created_at'>
export type ProductInsert = Omit<Product, 'id' | 'created_at'>
export type ProductTransactionInsert = Omit<ProductTransaction, 'id' | 'created_at'>
export type InvestmentInsert = Omit<Investment, 'id' | 'created_at'>
export type InvestmentTransactionInsert = Omit<InvestmentTransaction, 'id' | 'created_at'>

// Update types (partial, without id)
export type ProfileUpdate = Partial<Omit<Profile, 'id'>>
export type AccountUpdate = Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>
export type CategoryUpdate = Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
export type BudgetUpdate = Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>>
export type GoalUpdate = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>
export type ProductUpdate = Partial<Omit<Product, 'id' | 'user_id' | 'created_at'>>
export type ProductTransactionUpdate = Partial<Omit<ProductTransaction, 'id' | 'user_id' | 'created_at'>>
export type InvestmentUpdate = Partial<Omit<Investment, 'id' | 'user_id' | 'created_at'>>
export type InvestmentTransactionUpdate = Partial<Omit<InvestmentTransaction, 'id' | 'user_id' | 'created_at'>>

// With relations
export interface TransactionWithRelations extends Transaction {
  account?: Account
  category?: Category
  to_account?: Account
}

export interface BudgetWithCategory extends Budget {
  category?: Category
  spent?: number
}

export interface ProductWithTransactions extends Product {
  transactions?: ProductTransaction[]
  total_purchased?: number
  total_sold?: number
  profit?: number
}

export interface InvestmentWithTransactions extends Investment {
  transactions?: InvestmentTransaction[]
  total_quantity?: number
  average_cost?: number
  total_invested?: number
  current_value?: number
  unrealized_pl?: number
}
