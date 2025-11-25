import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { username, email, password, nom_complet, telephone } = await req.json();

    console.log('Creating super admin (idempotent):', { username, email, nom_complet });

    let userId: string | null = null;

    // 1) Try to create auth user; if exists, find and update password
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      const msg = String(authError.message || '').toLowerCase();
      // Handle already-exists scenario idempotently
      if (msg.includes('already') || msg.includes('registered') || authError.status === 422) {
        console.warn('User already exists, resolving by lookup and update...');
        // Fallback: scan users to find by email (small datasets OK for bootstrap)
        let page = 1;
        const perPage = 1000;
        let found = null as any;

        while (!found && page <= 10) {
          const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
          if (listErr) {
            console.error('listUsers error:', listErr);
            break;
          }
          found = listData.users?.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase()) || null;
          if (listData.users?.length < perPage) break; // no more pages
          page++;
        }

        if (!found) {
          return new Response(
            JSON.stringify({ error: 'Utilisateur déjà existant, mais introuvable lors de la résolution automatique.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const existingId: string = found.id;
        userId = existingId;
        // Ensure password is updated to provided one
        const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(existingId, { password });
        if (pwErr) {
          console.error('Password update error:', pwErr);
        }
      } else {
        console.error('Auth error:', authError);
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      userId = authData?.user?.id ?? null;
      console.log('User created with ID:', userId);
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Impossible de déterminer l’ID utilisateur.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2) Upsert profile (idempotent)
    const { error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        username,
        nom_complet,
        email,
        telephone: telephone || null,
        est_actif: true,
      }, { onConflict: 'id' });

    if (profileUpsertError) {
      console.error('Profile upsert error:', profileUpsertError);
      return new Response(
        JSON.stringify({ error: profileUpsertError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile ensured');

    // 3) Ensure super_admin role (idempotent)
    const { error: roleUpsertError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: 'super_admin' }, { onConflict: 'user_id,role' });

    if (roleUpsertError) {
      console.error('Role upsert error:', roleUpsertError);
      return new Response(
        JSON.stringify({ error: roleUpsertError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Super admin role ensured');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Super admin créé/mis à jour avec succès',
        user_id: userId,
        username,
        email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
