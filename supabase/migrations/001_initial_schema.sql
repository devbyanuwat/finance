-- Money Manager Database Schema
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'THB',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 2. ACCOUNTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card', 'e_wallet')),
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  color TEXT,
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Default categories visible to all, custom categories only to owner
CREATE POLICY "Users can view default and own categories" ON categories
  FOR SELECT USING (is_default = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- =============================================
-- 4. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  note TEXT,
  tags TEXT[],
  receipt_url TEXT,
  transaction_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_rule JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- =============================================
-- 5. BUDGETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  period TEXT DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly')),
  start_date DATE,
  alert_threshold DECIMAL(3,2) DEFAULT 0.8 CHECK (alert_threshold >= 0 AND alert_threshold <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, period)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 6. GOALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  goal_type TEXT,
  target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15,2) DEFAULT 0 CHECK (current_amount >= 0),
  deadline DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  monthly_contribution DECIMAL(15,2),
  auto_allocate BOOLEAN DEFAULT FALSE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 7. PRODUCTS TABLE (Inventory)
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cost_method TEXT DEFAULT 'average' CHECK (cost_method IN ('fifo', 'lifo', 'average')),
  current_stock DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 8. PRODUCT_TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale')),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
  total_amount DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  transaction_date DATE NOT NULL,
  supplier TEXT,
  customer TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product_transactions" ON product_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product_transactions" ON product_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product_transactions" ON product_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product_transactions" ON product_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Update product stock on transaction
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'purchase' THEN
      UPDATE products SET current_stock = current_stock + NEW.quantity WHERE id = NEW.product_id;
    ELSIF NEW.type = 'sale' THEN
      UPDATE products SET current_stock = current_stock - NEW.quantity WHERE id = NEW.product_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'purchase' THEN
      UPDATE products SET current_stock = current_stock - OLD.quantity WHERE id = OLD.product_id;
    ELSIF OLD.type = 'sale' THEN
      UPDATE products SET current_stock = current_stock + OLD.quantity WHERE id = OLD.product_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_product_transaction ON product_transactions;
CREATE TRIGGER on_product_transaction
  AFTER INSERT OR DELETE ON product_transactions
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- =============================================
-- 9. INVESTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'fund', 'etf', 'gold', 'real_estate', 'other')),
  current_price DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 10. INVESTMENT_TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend')),
  quantity DECIMAL(15,6),
  price DECIMAL(15,2),
  total_amount DECIMAL(15,2) NOT NULL,
  fees DECIMAL(15,2) DEFAULT 0,
  transaction_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investment_transactions" ON investment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investment_transactions" ON investment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investment_transactions" ON investment_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investment_transactions" ON investment_transactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_investment_transactions_investment ON investment_transactions(investment_id);

-- =============================================
-- 11. SEED DEFAULT CATEGORIES
-- =============================================
INSERT INTO categories (id, user_id, name, type, icon, color, is_default) VALUES
  -- Income Categories
  (gen_random_uuid(), NULL, 'เงินเดือน', 'income', 'Briefcase', '#22c55e', TRUE),
  (gen_random_uuid(), NULL, 'รายได้เสริม', 'income', 'Coins', '#16a34a', TRUE),
  (gen_random_uuid(), NULL, 'โบนัส', 'income', 'Gift', '#15803d', TRUE),
  (gen_random_uuid(), NULL, 'ดอกเบี้ย', 'income', 'Percent', '#166534', TRUE),
  (gen_random_uuid(), NULL, 'เงินปันผล', 'income', 'TrendingUp', '#14532d', TRUE),
  (gen_random_uuid(), NULL, 'รายได้อื่นๆ', 'income', 'Plus', '#4ade80', TRUE),
  -- Expense Categories
  (gen_random_uuid(), NULL, 'อาหาร', 'expense', 'Utensils', '#ef4444', TRUE),
  (gen_random_uuid(), NULL, 'ที่อยู่อาศัย', 'expense', 'Home', '#dc2626', TRUE),
  (gen_random_uuid(), NULL, 'ขนส่ง', 'expense', 'Car', '#b91c1c', TRUE),
  (gen_random_uuid(), NULL, 'สาธารณูปโภค', 'expense', 'Zap', '#991b1b', TRUE),
  (gen_random_uuid(), NULL, 'ความบันเทิง', 'expense', 'Tv', '#f97316', TRUE),
  (gen_random_uuid(), NULL, 'ช้อปปิ้ง', 'expense', 'ShoppingBag', '#ea580c', TRUE),
  (gen_random_uuid(), NULL, 'สุขภาพ', 'expense', 'Heart', '#c2410c', TRUE),
  (gen_random_uuid(), NULL, 'การศึกษา', 'expense', 'GraduationCap', '#9a3412', TRUE),
  (gen_random_uuid(), NULL, 'รายจ่ายอื่นๆ', 'expense', 'MoreHorizontal', '#fb923c', TRUE)
ON CONFLICT DO NOTHING;

-- =============================================
-- 12. HELPER FUNCTIONS
-- =============================================

-- Function to get account balance
CREATE OR REPLACE FUNCTION get_account_balance(account_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  initial_balance DECIMAL;
  income_total DECIMAL;
  expense_total DECIMAL;
  transfer_in DECIMAL;
  transfer_out DECIMAL;
BEGIN
  SELECT balance INTO initial_balance FROM accounts WHERE id = account_uuid;

  SELECT COALESCE(SUM(amount), 0) INTO income_total
  FROM transactions WHERE account_id = account_uuid AND type = 'income';

  SELECT COALESCE(SUM(amount), 0) INTO expense_total
  FROM transactions WHERE account_id = account_uuid AND type = 'expense';

  SELECT COALESCE(SUM(amount), 0) INTO transfer_in
  FROM transactions WHERE to_account_id = account_uuid AND type = 'transfer';

  SELECT COALESCE(SUM(amount), 0) INTO transfer_out
  FROM transactions WHERE account_id = account_uuid AND type = 'transfer';

  RETURN initial_balance + income_total - expense_total + transfer_in - transfer_out;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get budget spent
CREATE OR REPLACE FUNCTION get_budget_spent(budget_uuid UUID, month_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL AS $$
DECLARE
  cat_id UUID;
  usr_id UUID;
  spent DECIMAL;
BEGIN
  SELECT category_id, user_id INTO cat_id, usr_id FROM budgets WHERE id = budget_uuid;

  SELECT COALESCE(SUM(amount), 0) INTO spent
  FROM transactions
  WHERE user_id = usr_id
    AND category_id = cat_id
    AND type = 'expense'
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', month_date);

  RETURN spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DONE!
-- =============================================
