/*
  # Fix all RLS policies to use correct JWT path for role

  1. Problem
    - Current policies use `auth.jwt() ->> 'role'` which looks at root level
    - The role is actually stored in `app_metadata.role`
    - This causes all role-based policies to fail silently

  2. Changes
    - Drop all existing role-based policies
    - Recreate them with correct JWT path: `auth.jwt() -> 'app_metadata' ->> 'role'`
    - Keep user-based policies (auth.uid()) unchanged

  3. Policies Updated
    - "Admins can view all users" (SELECT)
    - "Admins can update users" (UPDATE)
    - "Admins can delete users" (DELETE)
    - "Users can view profiles based on role" (SELECT)
*/

-- Drop existing role-based policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles based on role" ON public.users;

-- Recreate with correct JWT path
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

CREATE POLICY "Chefs can view their assistants"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN' AND role = 'CHEF_DE_MISSION') OR
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'CHEF_DE_MISSION' AND role = 'ASSISTANT')
  );
