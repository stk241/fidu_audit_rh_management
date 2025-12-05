/*
  # Fix Admin Update Policy - Add WITH CHECK Clause

  1. Problem
    - UPDATE policies need both USING (can select/target) and WITH CHECK (can write new values)
    - Current "Admins can update users" policy only has USING clause
    - This prevents admins from successfully updating user records
    
  2. Solution
    - Drop and recreate the policy with both USING and WITH CHECK clauses
    - USING: Check if user performing update is ADMIN
    - WITH CHECK: Allow any new values (admin has full control)
    
  3. Security
    - Only users with ADMIN role can update user records
    - Admins can change any field including roles
    - Maintains proper separation of concerns
*/

-- Drop the incomplete policy
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Recreate with both USING and WITH CHECK clauses
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.jwt()->>'role') = 'ADMIN'
  )
  WITH CHECK (
    (SELECT auth.jwt()->>'role') = 'ADMIN'
  );
