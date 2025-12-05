/*
  # Fix User Update Policies

  1. Changes
    - Drop conflicting UPDATE policies
    - Create single UPDATE policy that allows both:
      * Users to update their own profile
      * Admins to update any profile
    
  2. Security
    - Users can only update their own profile (auth.uid() = id)
    - Admins can update any profile (role = 'ADMIN')
    - Uses OR logic to allow either condition
*/

-- Drop existing conflicting UPDATE policies
DROP POLICY IF EXISTS "Admins can update any profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create combined UPDATE policy
CREATE POLICY "Users can update profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  )
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );
