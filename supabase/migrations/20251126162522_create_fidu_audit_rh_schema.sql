/*
  # FIDU AUDIT RH - Schema Initial

  ## Description
  This migration creates the complete database schema for the FIDU AUDIT RH application,
  an internal tool for managing annual employee reviews with AI-powered report generation.

  ## 1. New Tables

  ### `users` (extends Supabase auth.users)
  Additional user profile information:
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text, unique, not null)
  - `first_name` (text, not null)
  - `last_name` (text, not null)
  - `role` (text, not null) - ADMIN, CHEF_DE_MISSION, or ASSISTANT
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

  ### `saisons` (Seasons/Years)
  Defines evaluation periods:
  - `id` (uuid, primary key)
  - `name` (text, not null) - e.g., "2024-2025"
  - `start_date` (date, not null)
  - `end_date` (date, not null)
  - `status` (text, not null) - ACTIVE or ARCHIVED
  - `created_at` (timestamptz, default now)

  ### `feedbacks` (Ongoing feedback notes)
  Continuous feedback entries throughout the season:
  - `id` (uuid, primary key)
  - `content` (text, not null) - The feedback text
  - `author_id` (uuid, not null) - References users(id)
  - `collaborator_id` (uuid, not null) - References users(id)
  - `saison_id` (uuid, not null) - References saisons(id)
  - `mission` (text) - Mission name or reference
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

  ### `rapports` (Final evaluation reports)
  AI-generated and manually edited annual reports:
  - `id` (uuid, primary key)
  - `collaborator_id` (uuid, not null) - References users(id)
  - `author_id` (uuid, not null) - References users(id)
  - `saison_id` (uuid, not null) - References saisons(id)
  - `content` (text) - Rich text/HTML report content
  - `status` (text, not null) - DRAFT or VALIDATED
  - `generated_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

  ## 2. Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with policies enforcing:
  
  **Users:**
  - Authenticated users can view all users (needed for collaboration)
  - Users can only update their own profile
  
  **Saisons:**
  - All authenticated users can view seasons
  - Only ADMIN can create, update, or delete seasons
  
  **Feedbacks:**
  - ADMIN can see all feedbacks
  - CHEF_DE_MISSION can see feedbacks for ASSISTANT collaborators
  - Authors can see their own feedbacks
  - Only ADMIN and CHEF_DE_MISSION can create feedbacks
  - Authors can update/delete their own feedbacks
  
  **Rapports:**
  - ADMIN can see all reports
  - CHEF_DE_MISSION can see reports for ASSISTANT collaborators
  - Authors can see their own reports
  - Only ADMIN and CHEF_DE_MISSION can create reports
  - Authors can update their own reports
  - Only ADMIN can delete reports

  ## 3. Important Notes
  
  - All timestamps use timestamptz for proper timezone handling
  - Foreign keys ensure referential integrity
  - Cascading deletes are configured where appropriate
  - Default values ensure data consistency
  - Role-based access is enforced through RLS policies
*/

-- Create users profile table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN', 'CHEF_DE_MISSION', 'ASSISTANT')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saisons table
CREATE TABLE IF NOT EXISTS saisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  created_at timestamptz DEFAULT now()
);

-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collaborator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saison_id uuid NOT NULL REFERENCES saisons(id) ON DELETE CASCADE,
  mission text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rapports table
CREATE TABLE IF NOT EXISTS rapports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saison_id uuid NOT NULL REFERENCES saisons(id) ON DELETE CASCADE,
  content text,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'VALIDATED')),
  generated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Authenticated users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Saisons policies
CREATE POLICY "Authenticated users can view saisons"
  ON saisons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only ADMIN can insert saisons"
  ON saisons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Only ADMIN can update saisons"
  ON saisons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Only ADMIN can delete saisons"
  ON saisons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Feedbacks policies
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
            AND collab.role = 'ASSISTANT'
          )
        )
        OR u.id = feedbacks.author_id
      )
    )
  );

CREATE POLICY "Managers can create feedbacks"
  ON feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'CHEF_DE_MISSION')
    )
    AND auth.uid() = author_id
  );

CREATE POLICY "Authors can update own feedbacks"
  ON feedbacks FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own feedbacks"
  ON feedbacks FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Rapports policies
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
            AND collab.role = 'ASSISTANT'
          )
        )
        OR u.id = rapports.author_id
      )
    )
  );

CREATE POLICY "Managers can create rapports"
  ON rapports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'CHEF_DE_MISSION')
    )
    AND auth.uid() = author_id
  );

CREATE POLICY "Authors can update own rapports"
  ON rapports FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Only ADMIN can delete rapports"
  ON rapports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS feedbacks_author_id_idx ON feedbacks(author_id);
CREATE INDEX IF NOT EXISTS feedbacks_collaborator_id_idx ON feedbacks(collaborator_id);
CREATE INDEX IF NOT EXISTS feedbacks_saison_id_idx ON feedbacks(saison_id);
CREATE INDEX IF NOT EXISTS rapports_collaborator_id_idx ON rapports(collaborator_id);
CREATE INDEX IF NOT EXISTS rapports_author_id_idx ON rapports(author_id);
CREATE INDEX IF NOT EXISTS rapports_saison_id_idx ON rapports(saison_id);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);