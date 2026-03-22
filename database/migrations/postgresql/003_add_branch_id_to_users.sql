-- Add branch_id column to users table
-- This allows staff to be assigned to specific branches

-- Add the column (nullable initially)
ALTER TABLE public.users 
ADD COLUMN branch_id TEXT;

-- Add foreign key constraint
ALTER TABLE public.users 
ADD CONSTRAINT users_branch_id_fkey 
FOREIGN KEY (branch_id) REFERENCES public.branches(id);

-- Add index for performance
CREATE INDEX idx_users_branch_id ON public.users(branch_id);

-- Update existing users to have no specific branch (they can access all branches)
-- New staff will be assigned to specific branches when created

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'branch_id';