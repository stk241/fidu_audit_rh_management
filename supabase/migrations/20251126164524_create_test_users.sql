/*
  # Create Test Users for FIDU AUDIT RH

  ## Description
  This migration creates test users for the application with different roles.
  
  ## Test Users Created
  
  1. **Admin User**
     - Email: admin@fiduaudit.com
     - Password: Admin123!
     - Role: ADMIN
     - Name: Marie Dupont
  
  2. **Chef de Mission User**
     - Email: chef@fiduaudit.com
     - Password: Chef123!
     - Role: CHEF_DE_MISSION
     - Name: Pierre Martin
  
  3. **Assistant User 1**
     - Email: assistant1@fiduaudit.com
     - Password: Assistant123!
     - Role: ASSISTANT
     - Name: Sophie Bernard
  
  4. **Assistant User 2**
     - Email: assistant2@fiduaudit.com
     - Password: Assistant123!
     - Role: ASSISTANT
     - Name: Lucas Petit

  ## Active Season
  Creates a 2024-2025 season marked as ACTIVE

  ## Important Notes
  - These are test accounts for development/demo purposes
  - In production, users should be created through proper signup flows
  - Passwords are intentionally simple for testing
*/

-- Insert a test admin user
DO $$
DECLARE
  admin_user_id uuid;
  chef_user_id uuid;
  assistant1_user_id uuid;
  assistant2_user_id uuid;
BEGIN
  -- Create admin user
  admin_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    admin_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@fiduaudit.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Marie","last_name":"Dupont"}'::jsonb,
    'authenticated',
    'authenticated'
  );

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (admin_user_id, 'admin@fiduaudit.com', 'Marie', 'Dupont', 'ADMIN');

  -- Create chef de mission user
  chef_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    chef_user_id,
    '00000000-0000-0000-0000-000000000000',
    'chef@fiduaudit.com',
    crypt('Chef123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Pierre","last_name":"Martin"}'::jsonb,
    'authenticated',
    'authenticated'
  );

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (chef_user_id, 'chef@fiduaudit.com', 'Pierre', 'Martin', 'CHEF_DE_MISSION');

  -- Create assistant user 1
  assistant1_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    assistant1_user_id,
    '00000000-0000-0000-0000-000000000000',
    'assistant1@fiduaudit.com',
    crypt('Assistant123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Sophie","last_name":"Bernard"}'::jsonb,
    'authenticated',
    'authenticated'
  );

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (assistant1_user_id, 'assistant1@fiduaudit.com', 'Sophie', 'Bernard', 'ASSISTANT');

  -- Create assistant user 2
  assistant2_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    assistant2_user_id,
    '00000000-0000-0000-0000-000000000000',
    'assistant2@fiduaudit.com',
    crypt('Assistant123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Lucas","last_name":"Petit"}'::jsonb,
    'authenticated',
    'authenticated'
  );

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (assistant2_user_id, 'assistant2@fiduaudit.com', 'Lucas', 'Petit', 'ASSISTANT');

END $$;

-- Create an active season
INSERT INTO saisons (name, start_date, end_date, status)
VALUES (
  '2024-2025',
  '2024-09-01',
  '2025-08-31',
  'ACTIVE'
);