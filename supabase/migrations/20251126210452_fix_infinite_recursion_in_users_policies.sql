/*
  # Fix Infinite Recursion in Users Table RLS Policies

  1. Problem
    - Policies on users table are querying the users table itself
    - This creates infinite recursion when checking permissions
    - Example: "Admins can view all users" checks users table to see if user is admin
    
  2. Solution
    - Use raw_app_meta_data from auth.jwt() instead of querying users table
    - Store role in auth metadata so policies don't need to query users table
    - For policies that must query users, ensure they don't create circular dependencies
    
  3. Important
    - This maintains same security model but avoids recursion
    - Users table can now be queried without infinite loops
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can view profiles based on role" ON users;

-- Recreate policies without recursion
-- Admin policies: Allow admins to see/modify all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt()->>'role') = 'ADMIN'
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    (select auth.jwt()->>'role') = 'ADMIN'
  );

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    (select auth.jwt()->>'role') = 'ADMIN'
  );

-- Role-based viewing: Users can view their subordinates
-- ADMIN can view CHEF_DE_MISSION, CHEF_DE_MISSION can view ASSISTANT
CREATE POLICY "Users can view profiles based on role"
  ON users FOR SELECT
  TO authenticated
  USING (
    (
      (select auth.jwt()->>'role') = 'ADMIN' 
      AND role = 'CHEF_DE_MISSION'
    ) OR (
      (select auth.jwt()->>'role') = 'CHEF_DE_MISSION' 
      AND role = 'ASSISTANT'
    )
  );

-- Function to sync user role to auth metadata
-- This ensures auth.jwt()->>'role' is always up to date
CREATE OR REPLACE FUNCTION public.sync_user_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users metadata with the role from public.users
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync role on insert/update
DROP TRIGGER IF EXISTS sync_user_role_trigger ON users;
CREATE TRIGGER sync_user_role_trigger
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_to_auth();

-- Sync existing user roles to auth metadata
UPDATE auth.users au
SET raw_app_meta_data = 
  COALESCE(au.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', u.role)
FROM users u
WHERE au.id = u.id;
