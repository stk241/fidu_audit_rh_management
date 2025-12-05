/*
  # Add Admin User Management Policies

  1. Changes
    - Add INSERT policy for authenticated users to create profiles during signup
    - Add UPDATE policy for admins to update any user profile
    - Add DELETE policy for admins to delete users
    
  2. Security
    - INSERT: Any authenticated user can insert their own profile (needed for signup)
    - UPDATE: Admins can update any profile, users can update their own
    - DELETE: Only admins can delete users
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can update any profile" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow admins to update any user profile
CREATE POLICY "Admins can update any profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Allow admins to delete users
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );
