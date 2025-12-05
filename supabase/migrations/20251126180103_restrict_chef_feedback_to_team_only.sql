/*
  # Restrict CHEF_DE_MISSION Feedback Creation

  1. Changes
    - Drop existing INSERT policy
    - Create new policy that prevents CHEF_DE_MISSION from creating feedbacks for other CHEF_DE_MISSION
    - CHEF_DE_MISSION can only create feedbacks for ASSISTANT and COLLABORATEUR
    
  2. Security
    - ADMIN can create feedbacks for any user (all roles)
    - CHEF_DE_MISSION can ONLY create feedbacks for ASSISTANT and COLLABORATEUR
    - Author must always be the authenticated user
*/

-- Drop the current policy
DROP POLICY IF EXISTS "Managers can create feedbacks for team members" ON feedbacks;

-- Create new restrictive policy
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
      -- CHEF_DE_MISSION can ONLY create feedbacks for ASSISTANT and COLLABORATEUR
      (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role = 'CHEF_DE_MISSION'
        )
        AND
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = feedbacks.collaborator_id 
          AND role IN ('ASSISTANT', 'COLLABORATEUR')
        )
      )
    )
  );
