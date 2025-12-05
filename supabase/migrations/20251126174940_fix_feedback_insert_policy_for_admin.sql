/*
  # Fix Feedback INSERT Policy for Admin

  1. Changes
    - Simplify policy to properly check roles
    - ADMIN can create feedback for anyone (no role restriction)
    - CHEF_DE_MISSION can only create feedback for ASSISTANT or COLLABORATEUR
    - Use NEW record reference instead of table reference in WITH CHECK

  2. Security
    - Author must be authenticated user
    - Role-based access control enforced
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Managers can create feedbacks" ON feedbacks;

-- Create corrected INSERT policy with proper NEW reference
CREATE POLICY "Managers can create feedbacks"
  ON feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be the author
    auth.uid() = author_id
    AND
    (
      -- If ADMIN, can create for anyone (no additional checks needed)
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
          WHERE users.id = collaborator_id
          AND users.role IN ('ASSISTANT', 'COLLABORATEUR')
        )
      )
    )
  );
