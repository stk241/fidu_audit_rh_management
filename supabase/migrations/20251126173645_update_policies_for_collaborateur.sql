/*
  # Update Policies for COLLABORATEUR Role

  1. Changes
    - Update feedback policies to treat COLLABORATEUR same as ASSISTANT
    - CHEF_DE_MISSION can create/view feedbacks for both ASSISTANT and COLLABORATEUR
    - Update rapport policies to include COLLABORATEUR
    
  2. Security
    - ADMIN can manage all users
    - CHEF_DE_MISSION can manage ASSISTANT and COLLABORATEUR
    - Users can view their own data
*/

-- Update feedbacks SELECT policy
DROP POLICY IF EXISTS "Users can view feedbacks based on role" ON feedbacks;

CREATE POLICY "Users can view feedbacks based on role"
  ON feedbacks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid()
      AND (
        u.role = 'ADMIN'
        OR (
          u.role = 'CHEF_DE_MISSION'
          AND EXISTS (
            SELECT 1 FROM users AS collab
            WHERE collab.id = feedbacks.collaborator_id
            AND collab.role IN ('ASSISTANT', 'COLLABORATEUR')
          )
        )
        OR u.id = feedbacks.author_id
      )
    )
  );

-- Update feedbacks INSERT policy
DROP POLICY IF EXISTS "Managers can create feedbacks" ON feedbacks;

CREATE POLICY "Managers can create feedbacks"
  ON feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'CHEF_DE_MISSION')
    )
    AND
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
        AND users.role IN ('ASSISTANT', 'COLLABORATEUR')
      )
    )
  );

-- Update rapports SELECT policy
DROP POLICY IF EXISTS "Users can view rapports based on role" ON rapports;

CREATE POLICY "Users can view rapports based on role"
  ON rapports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid()
      AND (
        u.role = 'ADMIN'
        OR (
          u.role = 'CHEF_DE_MISSION'
          AND EXISTS (
            SELECT 1 FROM users AS collab
            WHERE collab.id = rapports.collaborator_id
            AND collab.role IN ('ASSISTANT', 'COLLABORATEUR')
          )
        )
        OR u.id = rapports.author_id
        OR u.id = rapports.collaborator_id
      )
    )
  );
