/*
  # Fix RLS Performance Issues and Remove Duplicate Policies

  1. Performance Optimization
    - Replace all `auth.uid()` with `(select auth.uid())` in RLS policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Remove Duplicate Policies
    - Drop duplicate policies on feedbacks table
    - Keep only the most recent and correct versions
    - Removes policy conflicts

  3. Security Improvements
    - Maintain same security model
    - Optimize without compromising protection
*/

-- ============================================================================
-- DROP ALL EXISTING POLICIES TO START FRESH
-- ============================================================================

-- Users table policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update profiles" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can view profiles based on role" ON users;

-- Saisons table policies
DROP POLICY IF EXISTS "Users can view active saisons" ON saisons;
DROP POLICY IF EXISTS "Only ADMIN can insert saisons" ON saisons;
DROP POLICY IF EXISTS "Only ADMIN can update saisons" ON saisons;
DROP POLICY IF EXISTS "Only ADMIN can delete saisons" ON saisons;

-- Feedbacks table policies (including duplicates)
DROP POLICY IF EXISTS "Users can view feedbacks they authored" ON feedbacks;
DROP POLICY IF EXISTS "Users can view feedbacks about them" ON feedbacks;
DROP POLICY IF EXISTS "Users can view feedbacks based on role" ON feedbacks;
DROP POLICY IF EXISTS "ADMIN can create feedback for CHEF_DE_MISSION" ON feedbacks;
DROP POLICY IF EXISTS "CHEF_DE_MISSION can create feedback for ASSISTANT" ON feedbacks;
DROP POLICY IF EXISTS "Managers can create feedbacks for team members" ON feedbacks;
DROP POLICY IF EXISTS "Users can update their own feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authors can update own feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Users can delete their own feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authors can delete own feedbacks" ON feedbacks;

-- Rapports table policies
DROP POLICY IF EXISTS "Users can view rapports based on role" ON rapports;
DROP POLICY IF EXISTS "Managers can create rapports" ON rapports;
DROP POLICY IF EXISTS "Authors can update own rapports" ON rapports;
DROP POLICY IF EXISTS "Only ADMIN can delete rapports" ON rapports;

-- ============================================================================
-- RECREATE OPTIMIZED POLICIES - USERS TABLE
-- ============================================================================

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update profiles"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view profiles based on role"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND (
        (u.role = 'ADMIN' AND users.role = 'CHEF_DE_MISSION') OR
        (u.role = 'CHEF_DE_MISSION' AND users.role = 'ASSISTANT')
      )
    )
  );

-- ============================================================================
-- RECREATE OPTIMIZED POLICIES - SAISONS TABLE
-- ============================================================================

CREATE POLICY "Users can view active saisons"
  ON saisons FOR SELECT
  TO authenticated
  USING (status = 'ACTIVE');

CREATE POLICY "Only ADMIN can insert saisons"
  ON saisons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'ADMIN'
    )
  );

CREATE POLICY "Only ADMIN can update saisons"
  ON saisons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'ADMIN'
    )
  );

CREATE POLICY "Only ADMIN can delete saisons"
  ON saisons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'ADMIN'
    )
  );

-- ============================================================================
-- RECREATE OPTIMIZED POLICIES - FEEDBACKS TABLE (NO DUPLICATES)
-- ============================================================================

CREATE POLICY "Users can view feedbacks they authored"
  ON feedbacks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = author_id);

CREATE POLICY "Users can view feedbacks about them"
  ON feedbacks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = feedbacks.collaborator_id
      AND u.id = (select auth.uid())
    )
  );

CREATE POLICY "Users can view feedbacks based on role"
  ON feedbacks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND (
        (u.role = 'ADMIN' AND 
         EXISTS (SELECT 1 FROM users u2 WHERE u2.id = feedbacks.collaborator_id AND u2.role = 'CHEF_DE_MISSION')) OR
        (u.role = 'CHEF_DE_MISSION' AND 
         EXISTS (SELECT 1 FROM users u2 WHERE u2.id = feedbacks.collaborator_id AND u2.role = 'ASSISTANT'))
      )
    )
  );

CREATE POLICY "ADMIN can create feedback for CHEF_DE_MISSION"
  ON feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users author
      WHERE author.id = (select auth.uid())
      AND author.role = 'ADMIN'
    )
    AND EXISTS (
      SELECT 1 FROM users collab
      WHERE collab.id = collaborator_id
      AND collab.role = 'CHEF_DE_MISSION'
    )
  );

CREATE POLICY "CHEF_DE_MISSION can create feedback for ASSISTANT"
  ON feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users author
      WHERE author.id = (select auth.uid())
      AND author.role = 'CHEF_DE_MISSION'
    )
    AND EXISTS (
      SELECT 1 FROM users collab
      WHERE collab.id = collaborator_id
      AND collab.role = 'ASSISTANT'
    )
  );

CREATE POLICY "Users can update their own feedbacks"
  ON feedbacks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Users can delete their own feedbacks"
  ON feedbacks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = author_id);

-- ============================================================================
-- RECREATE OPTIMIZED POLICIES - RAPPORTS TABLE
-- ============================================================================

CREATE POLICY "Users can view rapports based on role"
  ON rapports FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = author_id OR
    (select auth.uid()) = collaborator_id OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND (
        (u.role = 'ADMIN' AND 
         EXISTS (SELECT 1 FROM users u2 WHERE u2.id = rapports.collaborator_id AND u2.role = 'CHEF_DE_MISSION')) OR
        (u.role = 'CHEF_DE_MISSION' AND 
         EXISTS (SELECT 1 FROM users u2 WHERE u2.id = rapports.collaborator_id AND u2.role = 'ASSISTANT'))
      )
    )
  );

CREATE POLICY "Managers can create rapports"
  ON rapports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role IN ('ADMIN', 'CHEF_DE_MISSION')
    )
    AND (select auth.uid()) = author_id
  );

CREATE POLICY "Authors can update own rapports"
  ON rapports FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Only ADMIN can delete rapports"
  ON rapports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'ADMIN'
    )
  );
