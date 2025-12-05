/*
  # Fix Admin Feedback Creation Policy

  1. Changes
    - Simplify feedback INSERT policy logic
    - ADMIN can create feedbacks for ANY user (no role restriction on collaborator)
    - CHEF_DE_MISSION can only create feedbacks for ASSISTANT and COLLABORATEUR
    
  2. Security
    - Author must be authenticated user
    - Must be ADMIN or CHEF_DE_MISSION role
    - Collaborator role validation based on author's role
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Managers can create feedbacks" ON feedbacks;

-- Create simplified INSERT policy
CREATE POLICY "Managers can create feedbacks"
  ON feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be the author
    auth.uid() = author_id
    AND
    (
      -- If ADMIN, can create for anyone
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
      )
      OR
      -- If CHEF_DE_MISSION, can only create for ASSISTANT or COLLABORATEUR
      (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role = 'CHEF_DE_MISSION'
        )
        AND
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = feedbacks.collaborator_id
          AND users.role IN ('ASSISTANT', 'COLLABORATEUR')
        )
      )
    )
  );
