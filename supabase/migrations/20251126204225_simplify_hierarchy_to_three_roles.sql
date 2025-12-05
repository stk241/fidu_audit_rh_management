/*
  # Simplify Hierarchy to Three Roles

  1. Changes
    - Remove COLLABORATEUR role from the system
    - Update hierarchy: ADMIN → CHEF_DE_MISSION → ASSISTANT
    - Update RLS policies to reflect new structure
    
  2. New Security Model
    - ADMIN can create feedback for CHEF_DE_MISSION
    - CHEF_DE_MISSION can create feedback for ASSISTANT
    - Users can read feedback where they are author or subject
    
  3. Important Notes
    - Existing COLLABORATEUR users will be converted to ASSISTANT role
    - All existing data (feedbacks, rapports) will be preserved
*/

-- Update existing COLLABORATEUR users to ASSISTANT
UPDATE users 
SET role = 'ASSISTANT' 
WHERE role = 'COLLABORATEUR';

-- Drop all existing feedback policies
DROP POLICY IF EXISTS "Users can view feedbacks they authored" ON feedbacks;
DROP POLICY IF EXISTS "Users can view feedbacks about them" ON feedbacks;
DROP POLICY IF EXISTS "ADMIN can create feedback for CHEF_DE_MISSION" ON feedbacks;
DROP POLICY IF EXISTS "CHEF_DE_MISSION can create feedback for COLLABORATEUR" ON feedbacks;
DROP POLICY IF EXISTS "Users can update their own feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Users can delete their own feedbacks" ON feedbacks;

-- Create new simplified policies
CREATE POLICY "Users can view feedbacks they authored"
  ON feedbacks FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can view feedbacks about them"
  ON feedbacks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = feedbacks.collaborator_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "ADMIN can create feedback for CHEF_DE_MISSION"
  ON feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users AS author
      WHERE author.id = auth.uid()
      AND author.role = 'ADMIN'
    )
    AND EXISTS (
      SELECT 1 FROM users AS collab
      WHERE collab.id = collaborator_id
      AND collab.role = 'CHEF_DE_MISSION'
    )
  );

CREATE POLICY "CHEF_DE_MISSION can create feedback for ASSISTANT"
  ON feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users AS author
      WHERE author.id = auth.uid()
      AND author.role = 'CHEF_DE_MISSION'
    )
    AND EXISTS (
      SELECT 1 FROM users AS collab
      WHERE collab.id = collaborator_id
      AND collab.role = 'ASSISTANT'
    )
  );

CREATE POLICY "Users can update their own feedbacks"
  ON feedbacks FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own feedbacks"
  ON feedbacks FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);
