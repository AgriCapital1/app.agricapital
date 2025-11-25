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
      departement,
      equipe_id,
      relation_rh,
      taux_commission,
      region_id,
      photo_url,
      roles 
    } = await req.json();

    // Input validation
    if (!username || !/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Nom d'utilisateur invalide. Doit contenir 3-50 caractères alphanumériques." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email invalide" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!password || password.length < 8 || password.length > 128) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Mot de passe invalide. Doit contenir entre 8 et 128 caractères." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!nom_complet || nom_complet.length < 2 || nom_complet.length > 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Nom complet invalide. Doit contenir entre 2 et 100 caractères." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (telephone && !/^\d{10}$/.test(telephone)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Format de téléphone invalide. Doit être 10 chiffres." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("User creation initiated");

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

    console.log("User authentication record created");

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        username,
        email,
        nom_complet,
        telephone,
        whatsapp,
        departement,
        equipe_id,
        relation_rh: relation_rh || "Employé",
        taux_commission,
        region_id,
        photo_url,
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

      console.log("User roles assigned successfully");
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
