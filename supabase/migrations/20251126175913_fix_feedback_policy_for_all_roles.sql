/*
  # Fix Feedback Creation Policy for All Roles

  1. Changes
    - Drop existing restrictive INSERT policy
    - Create new policy that allows ADMIN to create feedbacks for anyone
    - Allow CHEF_DE_MISSION to create feedbacks for ASSISTANT, COLLABORATEUR, and other CHEF_DE_MISSION
    
  2. Security
    - ADMIN can create feedbacks for any user
    - CHEF_DE_MISSION can create feedbacks for team members (ASSISTANT, COLLABORATEUR, CHEF_DE_MISSION)
    - Author must always be the authenticated user
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Managers can create feedbacks" ON feedbacks;

-- Create new policy that allows appropriate feedback creation
CREATE POLICY "Managers can create feedbacks for team members"
  ON feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND (
      -- ADMIN can create feedbacks for anyone
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
      )
      OR
      -- CHEF_DE_MISSION can create feedbacks for ASSISTANT, COLLABORATEUR, and other CHEF_DE_MISSION
      (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role = 'CHEF_DE_MISSION'
        )
        AND
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = feedbacks.collaborator_id 
          AND role IN ('ASSISTANT', 'COLLABORATEUR', 'CHEF_DE_MISSION')
        )
      )
    )
  );
