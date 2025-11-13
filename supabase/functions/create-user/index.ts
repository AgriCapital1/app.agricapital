import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { 
      username, 
      email, 
      password, 
      nom_complet,
      telephone,
      whatsapp,
      poste,
      departement,
      equipe,
      statut_employe,
      taux_commission,
      date_embauche,
      roles 
    } = await req.json();

    console.log("Creating user:", { username, email, nom_complet });

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Un utilisateur avec ce nom d'utilisateur existe déjà" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Un utilisateur avec cet email existe déjà" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    console.log("User created in auth:", authData.user.id);

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        username,
        email,
        nom_complet,
        telephone: telephone || null,
        whatsapp: whatsapp || null,
        departement: departement || null,
        equipe_id: equipe || null,
        relation_rh: statut_employe || "Employé",
        taux_commission: taux_commission || null,
        est_actif: true,
      });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Try to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    console.log("Profile created successfully");

    // Create roles
    if (roles && roles.length > 0) {
      const roleInserts = roles.map((role: string) => ({
        user_id: authData.user.id,
        role: role,
      }));

      const { error: rolesError } = await supabase
        .from("user_roles")
        .insert(roleInserts);

      if (rolesError) {
        console.error("Roles error:", rolesError);
        throw rolesError;
      }

      console.log("Roles created:", roles);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Utilisateur créé avec succès",
        user_id: authData.user.id,
        username,
        email,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || "Une erreur est survenue lors de la création de l'utilisateur" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
