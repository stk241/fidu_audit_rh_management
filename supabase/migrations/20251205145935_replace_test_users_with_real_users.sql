/*
  # Replace test users with real FIDU Audit team members

  1. Changes
    - Remove all test users from auth.users and public.users
    - Add 11 real team members with their actual information
    
  2. Real Users Created
    
    **Administrators (4)**
    - Stephane Klutsch (s.klutsch@fidu.fr)
    - Julie Mardjoeki (j.mardjoeki@fidu.fr)
    - Mélanie Roques (m.roques@fidu.fr)
    - Sabrina Walther (s.walther@fidu.fr)
    
    **Chefs de Mission (4)**
    - Cyrille Deroualle (c.deroualle@fidu.fr)
    - Marie Dhers (m.dhers@fidu.fr)
    - Remi Lefortier (r.lefortier@fidu.fr)
    - Christina Vasseur (c.vasseur@fidu.fr)
    
    **Assistants (3)**
    - Samir Jabnati (s.jabnati@fidu.fr)
    - Emeline Lauzu (e.lauzu@fidu.fr)
    - Shannel Rochambeau (s.rochambeau@fidu.fr)
    
  3. Security
    - All users have default password: FiduAudit2025!
    - Users are created in both auth.users and public.users tables
    - Email confirmation is set to now() (emails are pre-confirmed)
    - All users have 'authenticated' role and audience
*/

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Delete test users from both tables
  DELETE FROM public.users WHERE email IN (
    'admin@fiduaudit.com',
    'chef@fiduaudit.com',
    'assistant1@fiduaudit.com',
    'assistant2@fiduaudit.com'
  );
  
  DELETE FROM auth.users WHERE email IN (
    'admin@fiduaudit.com',
    'chef@fiduaudit.com',
    'assistant1@fiduaudit.com',
    'assistant2@fiduaudit.com'
  );

  -- Create Administrators
  
  -- Stephane Klutsch
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 's.klutsch@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Stephane","last_name":"Klutsch"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 's.klutsch@fidu.fr', 'Stephane', 'Klutsch', 'ADMIN');

  -- Julie Mardjoeki
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 'j.mardjoeki@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Julie","last_name":"Mardjoeki"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 'j.mardjoeki@fidu.fr', 'Julie', 'Mardjoeki', 'ADMIN');

  -- Mélanie Roques
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 'm.roques@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Mélanie","last_name":"Roques"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 'm.roques@fidu.fr', 'Mélanie', 'Roques', 'ADMIN');

  -- Sabrina Walther
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 's.walther@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Sabrina","last_name":"Walther"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 's.walther@fidu.fr', 'Sabrina', 'Walther', 'ADMIN');

  -- Create Chefs de Mission
  
  -- Cyrille Deroualle
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 'c.deroualle@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Cyrille","last_name":"Deroualle"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 'c.deroualle@fidu.fr', 'Cyrille', 'Deroualle', 'CHEF_DE_MISSION');

  -- Marie Dhers
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 'm.dhers@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Marie","last_name":"Dhers"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 'm.dhers@fidu.fr', 'Marie', 'Dhers', 'CHEF_DE_MISSION');

  -- Remi Lefortier
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 'r.lefortier@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Remi","last_name":"Lefortier"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 'r.lefortier@fidu.fr', 'Remi', 'Lefortier', 'CHEF_DE_MISSION');

  -- Christina Vasseur
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 'c.vasseur@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Christina","last_name":"Vasseur"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 'c.vasseur@fidu.fr', 'Christina', 'Vasseur', 'CHEF_DE_MISSION');

  -- Create Assistants
  
  -- Samir Jabnati
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 's.jabnati@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Samir","last_name":"Jabnati"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 's.jabnati@fidu.fr', 'Samir', 'Jabnati', 'ASSISTANT');

  -- Emeline Lauzu
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 'e.lauzu@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Emeline","last_name":"Lauzu"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 'e.lauzu@fidu.fr', 'Emeline', 'Lauzu', 'ASSISTANT');

  -- Shannel Rochambeau
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    user_id, '00000000-0000-0000-0000-000000000000', 's.rochambeau@fidu.fr',
    crypt('FiduAudit2025!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Shannel","last_name":"Rochambeau"}'::jsonb,
    'authenticated', 'authenticated'
  );
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (user_id, 's.rochambeau@fidu.fr', 'Shannel', 'Rochambeau', 'ASSISTANT');

END $$;
