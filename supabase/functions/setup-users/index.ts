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
      { email: 's.klutsch@fidu.fr', password: 'FiduAudit2025!', firstName: 'Stephane', lastName: 'Klutsch', role: 'ADMIN' },
      { email: 'j.mardjoeki@fidu.fr', password: 'FiduAudit2025!', firstName: 'Julie', lastName: 'Mardjoeki', role: 'ADMIN' },
      { email: 'm.roques@fidu.fr', password: 'FiduAudit2025!', firstName: 'Mélanie', lastName: 'Roques', role: 'ADMIN' },
      { email: 's.walther@fidu.fr', password: 'FiduAudit2025!', firstName: 'Sabrina', lastName: 'Walther', role: 'ADMIN' },
      { email: 'c.deroualle@fidu.fr', password: 'FiduAudit2025!', firstName: 'Cyrille', lastName: 'Deroualle', role: 'CHEF_DE_MISSION' },
      { email: 'm.dhers@fidu.fr', password: 'FiduAudit2025!', firstName: 'Marie', lastName: 'Dhers', role: 'CHEF_DE_MISSION' },
      { email: 'r.lefortier@fidu.fr', password: 'FiduAudit2025!', firstName: 'Remi', lastName: 'Lefortier', role: 'CHEF_DE_MISSION' },
      { email: 'c.vasseur@fidu.fr', password: 'FiduAudit2025!', firstName: 'Christina', lastName: 'Vasseur', role: 'CHEF_DE_MISSION' },
      { email: 's.jabnati@fidu.fr', password: 'FiduAudit2025!', firstName: 'Samir', lastName: 'Jabnati', role: 'ASSISTANT' },
      { email: 'e.lauzu@fidu.fr', password: 'FiduAudit2025!', firstName: 'Emeline', lastName: 'Lauzu', role: 'ASSISTANT' },
      { email: 's.rochambeau@fidu.fr', password: 'FiduAudit2025!', firstName: 'Shannel', lastName: 'Rochambeau', role: 'ASSISTANT' }
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
        credentials: {
          password: 'FiduAudit2025!',
          note: 'All users share the same password. They should change it on first login.'
        }
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