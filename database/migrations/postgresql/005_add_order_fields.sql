-- Migration: Add customer_count and cancellation_reason to orders table
-- Date: 2026-03-17
-- Description: Add missing fields for order management functionality

-- Add customer_count field to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_count INTEGER DEFAULT 1;

-- Add cancellation_reason field to orders table  
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add comment to document the changes
COMMENT ON COLUMN orders.customer_count IS 'Number of customers at the table for this order';
COMMENT ON COLUMN orders.cancellation_reason IS 'Reason provided when order is cancelled';

-- Update existing orders to have default customer_count if null
UPDATE orders 
SET customer_count = 1 
WHERE customer_count IS NULL;