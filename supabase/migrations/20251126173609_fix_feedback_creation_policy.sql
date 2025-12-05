/*
  # Fix Feedback Creation Policy

  1. Changes
    - Update INSERT policy for feedbacks to allow proper role-based creation
    - ADMIN can create feedbacks for anyone
    - CHEF_DE_MISSION can create feedbacks only for ASSISTANT users
    
  2. Security
    - Maintains role-based access control
    - Ensures author_id matches the authenticated user
    - Validates collaborator_id based on role permissions
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Managers can create feedbacks" ON feedbacks;

-- Create new INSERT policy with proper role-based restrictions
CREATE POLICY "Managers can create feedbacks"
  ON feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be the author
    auth.uid() = author_id
    AND
    -- Must be ADMIN or CHEF_DE_MISSION
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'CHEF_DE_MISSION')
    )
    AND
    -- If CHEF_DE_MISSION, can only create for ASSISTANT
    -- If ADMIN, can create for anyone
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
      )
      OR
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = feedbacks.collaborator_id
        AND users.role = 'ASSISTANT'
      )
    )
  );
