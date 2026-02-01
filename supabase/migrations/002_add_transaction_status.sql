-- Add status field to transactions table for pending/scheduled transactions
-- Run this in Supabase SQL Editor

-- Add status column with default 'completed' (backward compatible)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled'));

-- Update existing transactions to be 'completed' (they already affected balances)
UPDATE transactions SET status = 'completed' WHERE status IS NULL;

-- Make status NOT NULL now that we've set defaults
ALTER TABLE transactions 
ALTER COLUMN status SET NOT NULL;

-- Add index for filtering by status
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(user_id, status, transaction_date DESC);

-- Add comment for documentation
COMMENT ON COLUMN transactions.status IS 'Transaction status: pending (scheduled/future), completed (affects balance), cancelled';
