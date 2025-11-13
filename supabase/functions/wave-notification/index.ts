import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
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

    // Récupérer les données de paiement Wave
    const {
      transaction_id,
      telephone,
      montant,
      date_paiement,
      type_paiement,
      donnees_supplementaires
    } = await req.json();

    console.log('Notification Wave reçue:', {
      transaction_id,
      telephone,
      montant,
      type_paiement
    });

    // Validation des données requises
    if (!transaction_id || !telephone || !montant) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Données de paiement incomplètes' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier si la transaction existe déjà
    const { data: existingTrans, error: checkError } = await supabase
      .from('paiements_wave')
      .select('id')
      .eq('transaction_wave_id', transaction_id)
      .maybeSingle();

    if (existingTrans) {
      console.log('Transaction déjà enregistrée:', transaction_id);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Transaction déjà enregistrée' 
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Rechercher le souscripteur
    const { data: souscripteur, error: sousError } = await supabase
      .from('souscripteurs')
      .select(`
        id,
        nom_complet,
        total_da_verse,
        plantations (
          id,
          superficie_ha
        )
      `)
      .eq('telephone', telephone)
      .maybeSingle();

    if (sousError || !souscripteur) {
      console.error('Souscripteur non trouvé:', telephone);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Souscripteur non trouvé' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Souscripteur trouvé:', souscripteur.id);

    // Enregistrer le paiement Wave
    const { data: paiementWave, error: waveError } = await supabase
      .from('paiements_wave')
      .insert({
        transaction_wave_id: transaction_id,
        telephone: telephone,
        souscripteur_id: souscripteur.id,
        montant_paye: montant,
        type_paiement: type_paiement || 'droit_acces',
        date_paiement: date_paiement || new Date().toISOString(),
        statut: 'valide',
        donnees_wave: donnees_supplementaires || {}
      })
      .select()
      .single();

    if (waveError) {
      console.error('Erreur enregistrement paiement Wave:', waveError);
      throw waveError;
    }

    console.log('Paiement Wave enregistré:', paiementWave.id);

    // Mettre à jour le CRM selon le type de paiement
    if (type_paiement === 'droit_acces') {
      // Mise à jour du Droit d'Accès
      const nouveauDA = (souscripteur.total_da_verse || 0) + montant;
      
      const { error: updateSousError } = await supabase
        .from('souscripteurs')
        .update({
          total_da_verse: nouveauDA
        })
        .eq('id', souscripteur.id);

      if (updateSousError) {
        console.error('Erreur mise à jour DA:', updateSousError);
        throw updateSousError;
      }

      // Enregistrer dans la table paiements standard
      if (souscripteur.plantations && souscripteur.plantations.length > 0) {
        const plantationId = souscripteur.plantations[0].id;
        
        const { error: paiementError } = await supabase
          .from('paiements')
          .insert({
            plantation_id: plantationId,
            type_paiement: 'Droit d\'Accès',
            montant_theorique: montant,
            montant_paye: montant,
            date_paiement: date_paiement || new Date().toISOString(),
            statut: 'valide',
            mode_paiement: 'wave',
            id_transaction: transaction_id,
            annee: new Date().getFullYear(),
            created_by: souscripteur.id
          });

        if (paiementError) {
          console.error('Erreur enregistrement paiement DA:', paiementError);
        }
      }

      console.log('DA mis à jour:', nouveauDA);

    } else if (type_paiement === 'contribution_annuelle') {
      // Contribution Annuelle
      const tauxJour = 65;
      const nombreMois = montant / tauxJour;

      if (souscripteur.plantations && souscripteur.plantations.length > 0) {
        const plantationId = souscripteur.plantations[0].id;
        
        const { error: contribError } = await supabase
          .from('paiements')
          .insert({
            plantation_id: plantationId,
            type_paiement: 'Contribution Trimestrielle',
            montant_theorique: montant,
            montant_paye: montant,
            nombre_mois: nombreMois,
            date_paiement: date_paiement || new Date().toISOString(),
            statut: 'valide',
            mode_paiement: 'wave',
            id_transaction: transaction_id,
            annee: new Date().getFullYear(),
            created_by: souscripteur.id
          });

        if (contribError) {
          console.error('Erreur enregistrement contribution:', contribError);
          throw contribError;
        }
      }

      // Mise à jour du total contributions
      const { error: updateContribError } = await supabase
        .from('souscripteurs')
        .update({
          total_contributions_versees: (souscripteur.total_da_verse || 0) + montant
        })
        .eq('id', souscripteur.id);

      if (updateContribError) {
        console.error('Erreur mise à jour contributions:', updateContribError);
      }

      console.log('Contribution enregistrée:', montant, 'Mois:', nombreMois);
    }

    // Réponse de succès
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Paiement enregistré avec succès',
        paiement_id: paiementWave.id,
        souscripteur_id: souscripteur.id,
        type_paiement: type_paiement,
        montant: montant
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Erreur wave-notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Erreur interne du serveur' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
