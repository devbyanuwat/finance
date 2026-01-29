-- Fix alert_threshold precision issue
-- Run this in Supabase SQL Editor

-- The alert_threshold should be 0-100 (percentage), not 0-1 (decimal)
-- Change from DECIMAL(3,2) to DECIMAL(5,2) to support 0.00 to 100.00

ALTER TABLE budgets 
ALTER COLUMN alert_threshold TYPE DECIMAL(5,2);

-- Update existing data if any (convert from 0-1 scale to 0-100 scale if needed)
-- Only run this if your existing data is in 0-1 format
-- UPDATE budgets SET alert_threshold = alert_threshold * 100 WHERE alert_threshold <= 1;

-- Verify the change
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'budgets' AND column_name = 'alert_threshold';

-- Test insert
SELECT 'Fix completed! Now supports values from 0.00 to 100.00' as status;
