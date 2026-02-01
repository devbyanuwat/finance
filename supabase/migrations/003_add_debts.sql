-- =============================================
-- Debt/Installment/Loan Management
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  debt_type TEXT NOT NULL CHECK (debt_type IN ('credit_card_installment', 'credit_card_full', 'personal_loan')),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
  monthly_payment DECIMAL(15,2) NOT NULL CHECK (monthly_payment >= 0),
  installment_count INTEGER NOT NULL DEFAULT 1 CHECK (installment_count >= 1),
  paid_count INTEGER NOT NULL DEFAULT 0 CHECK (paid_count >= 0),
  remaining_amount DECIMAL(15,2) NOT NULL CHECK (remaining_amount >= 0),
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (interest_rate >= 0),
  creditor_name TEXT,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view own debts" ON debts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts" ON debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts" ON debts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts" ON debts
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_status ON debts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_debts_user_due ON debts(user_id, due_day);

-- 5. Add debt_id column to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS debt_id UUID REFERENCES debts(id) ON DELETE SET NULL;

-- 6. Index for looking up transactions by debt
CREATE INDEX IF NOT EXISTS idx_transactions_debt ON transactions(debt_id);

-- 7. Documentation
COMMENT ON TABLE debts IS 'Debt tracking: credit card installments, full payments, and personal loans';
COMMENT ON COLUMN debts.debt_type IS 'credit_card_installment: monthly installments, credit_card_full: single payment, personal_loan: borrowing from friends';
COMMENT ON COLUMN debts.due_day IS 'Day of month when payment is due (1-31)';
COMMENT ON COLUMN debts.paid_count IS 'Number of installments already paid';
COMMENT ON COLUMN debts.remaining_amount IS 'Remaining amount to be paid';
COMMENT ON COLUMN transactions.debt_id IS 'Links transaction to parent debt for installment tracking';
