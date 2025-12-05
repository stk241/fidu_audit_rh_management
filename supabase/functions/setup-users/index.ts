import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

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

    const results = [];

    for (const user of users) {
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
        results.push({ email: user.email, success: false, error: authError.message });
        continue;
      }

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
        results.push({ email: user.email, success: false, error: profileError.message });
      } else {
        results.push({ email: user.email, success: true, role: user.role });
      }
    }

    const { data: existingSeason } = await supabase
      .from('saisons')
      .select('*')
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (!existingSeason) {
      await supabase
        .from('saisons')
        .insert({
          name: '2024-2025',
          start_date: '2024-09-01',
          end_date: '2025-08-31',
          status: 'ACTIVE'
        });
    }

    return new Response(
      JSON.stringify({ 
        message: 'Users setup completed', 
        results,
        credentials: [
          { email: 'admin@fiduaudit.com', password: 'Admin123!', role: 'ADMIN' },
          { email: 'chef@fiduaudit.com', password: 'Chef123!', role: 'CHEF_DE_MISSION' }
        ]
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in setup-users function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});