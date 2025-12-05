import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUsers() {
  console.log('Creating test users...\n');

  const users = [
    {
      email: 'admin@fiduaudit.com',
      password: 'Admin123!',
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'ADMIN'
    },
    {
      email: 'chef@fiduaudit.com',
      password: 'Chef123!',
      firstName: 'Pierre',
      lastName: 'Martin',
      role: 'CHEF_DE_MISSION'
    },
    {
      email: 'assistant1@fiduaudit.com',
      password: 'Assistant123!',
      firstName: 'Sophie',
      lastName: 'Bernard',
      role: 'ASSISTANT'
    },
    {
      email: 'assistant2@fiduaudit.com',
      password: 'Assistant123!',
      firstName: 'Lucas',
      lastName: 'Petit',
      role: 'ASSISTANT'
    }
  ];

  for (const user of users) {
    console.log(`Creating ${user.role}: ${user.email}...`);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        first_name: user.firstName,
        last_name: user.lastName
      }
    });

    if (authError) {
      console.error(`Error creating auth user ${user.email}:`, authError.message);
      continue;
    }

    console.log(`✓ Auth user created with ID: ${authData.user.id}`);

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role
      });

    if (profileError) {
      console.error(`Error creating profile for ${user.email}:`, profileError.message);
    } else {
      console.log(`✓ Profile created for ${user.email}\n`);
    }
  }

  console.log('\nCreating active season...');
  const { error: seasonError } = await supabase
    .from('saisons')
    .insert({
      name: '2024-2025',
      start_date: '2024-09-01',
      end_date: '2025-08-31',
      status: 'ACTIVE'
    });

  if (seasonError) {
    console.error('Error creating season:', seasonError.message);
  } else {
    console.log('✓ Active season 2024-2025 created\n');
  }

  console.log('Done! You can now login with:');
  console.log('- admin@fiduaudit.com / Admin123!');
  console.log('- chef@fiduaudit.com / Chef123!');
}

createUsers().catch(console.error);
