/*
  # Add COLLABORATEUR Role

  1. Changes
    - Add 'COLLABORATEUR' to allowed roles in users table
    - Update role check constraint to include all 4 roles:
      * ADMIN
      * CHEF_DE_MISSION
      * ASSISTANT
      * COLLABORATEUR
    
  2. Notes
    - This aligns the database with the frontend code
    - COLLABORATEUR will have same permissions as ASSISTANT for now
*/

-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new check constraint with COLLABORATEUR included
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'CHEF_DE_MISSION', 'ASSISTANT', 'COLLABORATEUR'));
