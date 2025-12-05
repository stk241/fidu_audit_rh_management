/*
  # Synchronize existing user roles to auth metadata

  1. Problem
    - User roles in public.users table are not reflected in auth.users metadata
    - RLS policies check auth.jwt()->>'role' which reads from auth.users.raw_app_meta_data
    - When roles are updated in public.users, they must be synced to auth.users
    
  2. Solution
    - Sync all existing user roles from public.users to auth.users.raw_app_meta_data
    - This ensures the trigger sync_user_role_to_auth() catches future updates
    - After this, all role changes will be properly reflected in JWT tokens
    
  3. Security
    - This maintains the security model by ensuring JWT tokens contain accurate role info
    - All RLS policies will now work correctly based on actual user roles
*/

-- Sync all existing user roles from public.users to auth.users metadata
UPDATE auth.users au
SET raw_app_meta_data = 
  COALESCE(au.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', u.role)
FROM public.users u
WHERE au.id = u.id;
