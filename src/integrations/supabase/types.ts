export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      champs_personnalises: {
        Row: {
          created_at: string | null
          created_by: string | null
          est_actif: boolean | null
          formulaire_cible: string
          id: string
          libelle: string
          message_aide: string | null
          nom_champ: string
          obligatoire: boolean | null
          options_liste: string[] | null
          ordre: number | null
          type_champ: string
          updated_at: string | null
          valeur_defaut: string | null
          validation_regex: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          est_actif?: boolean | null
          formulaire_cible: string
          id?: string
          libelle: string
          message_aide?: string | null
          nom_champ: string
          obligatoire?: boolean | null
          options_liste?: string[] | null
          ordre?: number | null
          type_champ: string
          updated_at?: string | null
          valeur_defaut?: string | null
          validation_regex?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          est_actif?: boolean | null
          formulaire_cible?: string
          id?: string
          libelle?: string
          message_aide?: string | null
          nom_champ?: string
          obligatoire?: boolean | null
          options_liste?: string[] | null
          ordre?: number | null
          type_champ?: string
          updated_at?: string | null
          valeur_defaut?: string | null
          validation_regex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "champs_personnalises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          created_at: string | null
          date_calcul: string | null
          date_paiement: string | null
          date_validation: string | null
          id: string
          jours_retard: number | null
          montant_base: number
          montant_commission: number
          observations: string | null
          penalite_appliquee: boolean | null
          periode: string
          plantation_id: string | null
          statut: string | null
          taux_commission: number
          type_commission: string
          updated_at: string | null
          user_id: string
          valide_par: string | null
        }
        Insert: {
          created_at?: string | null
          date_calcul?: string | null
          date_paiement?: string | null
          date_validation?: string | null
          id?: string
          jours_retard?: number | null
          montant_base: number
          montant_commission: number
          observations?: string | null
          penalite_appliquee?: boolean | null
          periode: string
          plantation_id?: string | null
          statut?: string | null
          taux_commission: number
          type_commission: string
          updated_at?: string | null
          user_id: string
          valide_par?: string | null
        }
        Update: {
          created_at?: string | null
          date_calcul?: string | null
          date_paiement?: string | null
          date_validation?: string | null
          id?: string
          jours_retard?: number | null
          montant_base?: number
          montant_commission?: number
          observations?: string | null
          penalite_appliquee?: boolean | null
          periode?: string
          plantation_id?: string | null
          statut?: string | null
          taux_commission?: number
          type_commission?: string
          updated_at?: string | null
          user_id?: string
          valide_par?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_valide_par_fkey"
            columns: ["valide_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configuration_systeme: {
        Row: {
          categorie: string
          cle: string
          created_at: string | null
          description: string | null
          id: string
          modifiable: boolean | null
          type_donnee: string
          updated_at: string | null
          updated_by: string | null
          valeur: string
        }
        Insert: {
          categorie: string
          cle: string
          created_at?: string | null
          description?: string | null
          id?: string
          modifiable?: boolean | null
          type_donnee?: string
          updated_at?: string | null
          updated_by?: string | null
          valeur: string
        }
        Update: {
          categorie?: string
          cle?: string
          created_at?: string | null
          description?: string | null
          id?: string
          modifiable?: boolean | null
          type_donnee?: string
          updated_at?: string | null
          updated_by?: string | null
          valeur?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuration_systeme_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      definitions_statuts: {
        Row: {
          categorie: string
          code: string
          couleur: string
          created_at: string | null
          description: string | null
          est_actif: boolean | null
          est_final: boolean | null
          icone: string | null
          id: string
          libelle: string
          ordre: number | null
          permet_modification: boolean | null
          updated_at: string | null
        }
        Insert: {
          categorie: string
          code: string
          couleur?: string
          created_at?: string | null
          description?: string | null
          est_actif?: boolean | null
          est_final?: boolean | null
          icone?: string | null
          id?: string
          libelle: string
          ordre?: number | null
          permet_modification?: boolean | null
          updated_at?: string | null
        }
        Update: {
          categorie?: string
          code?: string
          couleur?: string
          created_at?: string | null
          description?: string | null
          est_actif?: boolean | null
          est_final?: boolean | null
          icone?: string | null
          id?: string
          libelle?: string
          ordre?: number | null
          permet_modification?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departements: {
        Row: {
          chef_lieu: string
          code: string
          created_at: string | null
          est_actif: boolean | null
          id: string
          nom: string
          region_id: string
          sous_prefecture_id: string | null
          updated_at: string | null
        }
        Insert: {
          chef_lieu: string
          code: string
          created_at?: string | null
          est_actif?: boolean | null
          id?: string
          nom: string
          region_id: string
          sous_prefecture_id?: string | null
          updated_at?: string | null
        }
        Update: {
          chef_lieu?: string
          code?: string
          created_at?: string | null
          est_actif?: boolean | null
          id?: string
          nom?: string
          region_id?: string
          sous_prefecture_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departements_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      departements_entreprise: {
        Row: {
          created_at: string | null
          id: string
          nom: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nom: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nom?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          created_at: string | null
          est_actif: boolean | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          est_actif?: boolean | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          est_actif?: boolean | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      equipes: {
        Row: {
          chef_equipe_id: string | null
          created_at: string | null
          id: string
          nom: string
          region_id: string | null
          updated_at: string | null
        }
        Insert: {
          chef_equipe_id?: string | null
          created_at?: string | null
          id?: string
          nom: string
          region_id?: string | null
          updated_at?: string | null
        }
        Update: {
          chef_equipe_id?: string | null
          created_at?: string | null
          id?: string
          nom?: string
          region_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipes_chef_equipe_id_fkey"
            columns: ["chef_equipe_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      historique_actions: {
        Row: {
          ancienne_valeur: Json | null
          created_at: string | null
          description: string
          id: string
          nouvelle_valeur: Json | null
          plantation_id: string | null
          souscripteur_id: string | null
          type_action: string
          user_id: string | null
        }
        Insert: {
          ancienne_valeur?: Json | null
          created_at?: string | null
          description: string
          id?: string
          nouvelle_valeur?: Json | null
          plantation_id?: string | null
          souscripteur_id?: string | null
          type_action: string
          user_id?: string | null
        }
        Update: {
          ancienne_valeur?: Json | null
          created_at?: string | null
          description?: string
          id?: string
          nouvelle_valeur?: Json | null
          plantation_id?: string | null
          souscripteur_id?: string | null
          type_action?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historique_actions_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_actions_souscripteur_id_fkey"
            columns: ["souscripteur_id"]
            isOneToOne: false
            referencedRelation: "souscripteurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions_techniques: {
        Row: {
          created_at: string | null
          created_by: string
          date_intervention: string
          dosage: string | null
          id: string
          incident_description: string | null
          incident_type: string | null
          mois_suivi: number | null
          observations: string | null
          photos_urls: string[] | null
          plantation_id: string
          produit_utilise: string | null
          rapport_url: string | null
          resultat_traitement: string | null
          taux_survie_constate: number | null
          technicien_id: string
          traitement_applique: string | null
          type_intervention: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          date_intervention: string
          dosage?: string | null
          id?: string
          incident_description?: string | null
          incident_type?: string | null
          mois_suivi?: number | null
          observations?: string | null
          photos_urls?: string[] | null
          plantation_id: string
          produit_utilise?: string | null
          rapport_url?: string | null
          resultat_traitement?: string | null
          taux_survie_constate?: number | null
          technicien_id: string
          traitement_applique?: string | null
          type_intervention: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          date_intervention?: string
          dosage?: string | null
          id?: string
          incident_description?: string | null
          incident_type?: string | null
          mois_suivi?: number | null
          observations?: string | null
          photos_urls?: string[] | null
          plantation_id?: string
          produit_utilise?: string | null
          rapport_url?: string | null
          resultat_traitement?: string | null
          taux_survie_constate?: number | null
          technicien_id?: string
          traitement_applique?: string | null
          type_intervention?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_techniques_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_techniques_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_techniques_technicien_id_fkey"
            columns: ["technicien_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements: {
        Row: {
          annee: number
          created_at: string | null
          created_by: string
          date_due: string | null
          date_paiement: string | null
          date_upload_preuve: string | null
          date_validation: string | null
          fichier_preuve_url: string | null
          id: string
          id_transaction: string | null
          mode_paiement: Database["public"]["Enums"]["mode_paiement"] | null
          montant_paye: number | null
          montant_promotion: number | null
          montant_theorique: number
          nombre_mois: number | null
          observations: string | null
          operateur_mobile_money: string | null
          plantation_id: string
          promotion_appliquee: boolean | null
          raison_rejet: string | null
          statut: Database["public"]["Enums"]["statut_paiement"] | null
          type_paiement: string
          type_preuve: string | null
          updated_at: string | null
          valide_par: string | null
        }
        Insert: {
          annee: number
          created_at?: string | null
          created_by: string
          date_due?: string | null
          date_paiement?: string | null
          date_upload_preuve?: string | null
          date_validation?: string | null
          fichier_preuve_url?: string | null
          id?: string
          id_transaction?: string | null
          mode_paiement?: Database["public"]["Enums"]["mode_paiement"] | null
          montant_paye?: number | null
          montant_promotion?: number | null
          montant_theorique: number
          nombre_mois?: number | null
          observations?: string | null
          operateur_mobile_money?: string | null
          plantation_id: string
          promotion_appliquee?: boolean | null
          raison_rejet?: string | null
          statut?: Database["public"]["Enums"]["statut_paiement"] | null
          type_paiement: string
          type_preuve?: string | null
          updated_at?: string | null
          valide_par?: string | null
        }
        Update: {
          annee?: number
          created_at?: string | null
          created_by?: string
          date_due?: string | null
          date_paiement?: string | null
          date_upload_preuve?: string | null
          date_validation?: string | null
          fichier_preuve_url?: string | null
          id?: string
          id_transaction?: string | null
          mode_paiement?: Database["public"]["Enums"]["mode_paiement"] | null
          montant_paye?: number | null
          montant_promotion?: number | null
          montant_theorique?: number
          nombre_mois?: number | null
          observations?: string | null
          operateur_mobile_money?: string | null
          plantation_id?: string
          promotion_appliquee?: boolean | null
          raison_rejet?: string | null
          statut?: Database["public"]["Enums"]["statut_paiement"] | null
          type_paiement?: string
          type_preuve?: string | null
          updated_at?: string | null
          valide_par?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paiements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_valide_par_fkey"
            columns: ["valide_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements_wave: {
        Row: {
          created_at: string | null
          date_paiement: string
          donnees_wave: Json | null
          id: string
          montant_paye: number
          souscripteur_id: string | null
          statut: string
          telephone: string
          transaction_wave_id: string
          type_paiement: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_paiement?: string
          donnees_wave?: Json | null
          id?: string
          montant_paye: number
          souscripteur_id?: string | null
          statut?: string
          telephone: string
          transaction_wave_id: string
          type_paiement: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_paiement?: string
          donnees_wave?: Json | null
          id?: string
          montant_paye?: number
          souscripteur_id?: string | null
          statut?: string
          telephone?: string
          transaction_wave_id?: string
          type_paiement?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paiements_wave_souscripteur_id_fkey"
            columns: ["souscripteur_id"]
            isOneToOne: false
            referencedRelation: "souscripteurs"
            referencedColumns: ["id"]
          },
        ]
      }
      photos_plantation: {
        Row: {
          created_at: string | null
          date_prise: string
          description: string | null
          id: string
          mois_suivi: number | null
          phase: string
          plantation_id: string
          prise_par: string | null
          type_photo: string
          url: string
        }
        Insert: {
          created_at?: string | null
          date_prise: string
          description?: string | null
          id?: string
          mois_suivi?: number | null
          phase: string
          plantation_id: string
          prise_par?: string | null
          type_photo: string
          url: string
        }
        Update: {
          created_at?: string | null
          date_prise?: string
          description?: string | null
          id?: string
          mois_suivi?: number | null
          phase?: string
          plantation_id?: string
          prise_par?: string | null
          type_photo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_plantation_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_plantation_prise_par_fkey"
            columns: ["prise_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plantations: {
        Row: {
          alerte_litige_foncier: boolean | null
          alerte_non_paiement: boolean | null
          alerte_recolte_illicite: boolean | null
          alerte_survie_faible: boolean | null
          alerte_visite_retard: boolean | null
          altitude: number | null
          attestation_absence_litiges: boolean | null
          chef_village_nom: string
          chef_village_signature_url: string | null
          chef_village_telephone: string
          created_at: string | null
          created_by: string
          cumul_revenu_planteur: number | null
          date_debut_plantation_reelle: string | null
          date_enquete: string | null
          date_prevue_production: string | null
          date_reelle_entree_production: string | null
          date_signature_contrat: string
          departement_id: string
          document_foncier_date_delivrance: string
          document_foncier_numero: string
          document_foncier_type: Database["public"]["Enums"]["type_document_foncier"]
          document_foncier_url: string
          id: string
          id_unique: string
          jalon_da_valide_date: string | null
          jalon_delimitation_gps_date: string | null
          jalon_enquete_date: string | null
          jalon_entree_production_date: string | null
          jalon_mise_en_terre_date: string | null
          jalon_piquetage_date: string | null
          latitude: number | null
          lieu_enquete: string | null
          limite_est: string | null
          limite_nord: string | null
          limite_ouest: string | null
          limite_sud: string | null
          longitude: number | null
          nom_plantation: string
          nombre_plants: number
          nombre_regimes_pod: number | null
          notes_internes: string | null
          notes_verification_fonciere: string | null
          numero_parcelle_localite: string | null
          phase_actuelle: number | null
          prix_unitaire_kg: number | null
          production_cumul_tonnes: number | null
          proprietaire_legal: string | null
          pv_enquete_url: string | null
          redevance_agricapital_pct: number | null
          region_id: string
          rendement_moyen_t_ha: number | null
          sous_prefecture_id: string
          souscripteur_id: string
          statut_global: Database["public"]["Enums"]["statut_plantation"] | null
          statut_validation_afor: string | null
          superficie_ha: number
          taux_survie_plants: number | null
          technicien_assigne_id: string | null
          temoin1_fonction: string | null
          temoin1_nom: string | null
          temoin1_photo_url: string | null
          temoin1_signature_url: string | null
          temoin1_telephone: string | null
          temoin2_fonction: string | null
          temoin2_nom: string | null
          temoin2_photo_url: string | null
          temoin2_signature_url: string | null
          temoin2_telephone: string | null
          updated_at: string | null
          updated_by: string | null
          validation_enquete: string | null
          village_id: string | null
          village_nom: string
        }
        Insert: {
          alerte_litige_foncier?: boolean | null
          alerte_non_paiement?: boolean | null
          alerte_recolte_illicite?: boolean | null
          alerte_survie_faible?: boolean | null
          alerte_visite_retard?: boolean | null
          altitude?: number | null
          attestation_absence_litiges?: boolean | null
          chef_village_nom: string
          chef_village_signature_url?: string | null
          chef_village_telephone: string
          created_at?: string | null
          created_by: string
          cumul_revenu_planteur?: number | null
          date_debut_plantation_reelle?: string | null
          date_enquete?: string | null
          date_prevue_production?: string | null
          date_reelle_entree_production?: string | null
          date_signature_contrat: string
          departement_id: string
          document_foncier_date_delivrance: string
          document_foncier_numero: string
          document_foncier_type: Database["public"]["Enums"]["type_document_foncier"]
          document_foncier_url: string
          id?: string
          id_unique: string
          jalon_da_valide_date?: string | null
          jalon_delimitation_gps_date?: string | null
          jalon_enquete_date?: string | null
          jalon_entree_production_date?: string | null
          jalon_mise_en_terre_date?: string | null
          jalon_piquetage_date?: string | null
          latitude?: number | null
          lieu_enquete?: string | null
          limite_est?: string | null
          limite_nord?: string | null
          limite_ouest?: string | null
          limite_sud?: string | null
          longitude?: number | null
          nom_plantation: string
          nombre_plants: number
          nombre_regimes_pod?: number | null
          notes_internes?: string | null
          notes_verification_fonciere?: string | null
          numero_parcelle_localite?: string | null
          phase_actuelle?: number | null
          prix_unitaire_kg?: number | null
          production_cumul_tonnes?: number | null
          proprietaire_legal?: string | null
          pv_enquete_url?: string | null
          redevance_agricapital_pct?: number | null
          region_id: string
          rendement_moyen_t_ha?: number | null
          sous_prefecture_id: string
          souscripteur_id: string
          statut_global?:
            | Database["public"]["Enums"]["statut_plantation"]
            | null
          statut_validation_afor?: string | null
          superficie_ha: number
          taux_survie_plants?: number | null
          technicien_assigne_id?: string | null
          temoin1_fonction?: string | null
          temoin1_nom?: string | null
          temoin1_photo_url?: string | null
          temoin1_signature_url?: string | null
          temoin1_telephone?: string | null
          temoin2_fonction?: string | null
          temoin2_nom?: string | null
          temoin2_photo_url?: string | null
          temoin2_signature_url?: string | null
          temoin2_telephone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          validation_enquete?: string | null
          village_id?: string | null
          village_nom: string
        }
        Update: {
          alerte_litige_foncier?: boolean | null
          alerte_non_paiement?: boolean | null
          alerte_recolte_illicite?: boolean | null
          alerte_survie_faible?: boolean | null
          alerte_visite_retard?: boolean | null
          altitude?: number | null
          attestation_absence_litiges?: boolean | null
          chef_village_nom?: string
          chef_village_signature_url?: string | null
          chef_village_telephone?: string
          created_at?: string | null
          created_by?: string
          cumul_revenu_planteur?: number | null
          date_debut_plantation_reelle?: string | null
          date_enquete?: string | null
          date_prevue_production?: string | null
          date_reelle_entree_production?: string | null
          date_signature_contrat?: string
          departement_id?: string
          document_foncier_date_delivrance?: string
          document_foncier_numero?: string
          document_foncier_type?: Database["public"]["Enums"]["type_document_foncier"]
          document_foncier_url?: string
          id?: string
          id_unique?: string
          jalon_da_valide_date?: string | null
          jalon_delimitation_gps_date?: string | null
          jalon_enquete_date?: string | null
          jalon_entree_production_date?: string | null
          jalon_mise_en_terre_date?: string | null
          jalon_piquetage_date?: string | null
          latitude?: number | null
          lieu_enquete?: string | null
          limite_est?: string | null
          limite_nord?: string | null
          limite_ouest?: string | null
          limite_sud?: string | null
          longitude?: number | null
          nom_plantation?: string
          nombre_plants?: number
          nombre_regimes_pod?: number | null
          notes_internes?: string | null
          notes_verification_fonciere?: string | null
          numero_parcelle_localite?: string | null
          phase_actuelle?: number | null
          prix_unitaire_kg?: number | null
          production_cumul_tonnes?: number | null
          proprietaire_legal?: string | null
          pv_enquete_url?: string | null
          redevance_agricapital_pct?: number | null
          region_id?: string
          rendement_moyen_t_ha?: number | null
          sous_prefecture_id?: string
          souscripteur_id?: string
          statut_global?:
            | Database["public"]["Enums"]["statut_plantation"]
            | null
          statut_validation_afor?: string | null
          superficie_ha?: number
          taux_survie_plants?: number | null
          technicien_assigne_id?: string | null
          temoin1_fonction?: string | null
          temoin1_nom?: string | null
          temoin1_photo_url?: string | null
          temoin1_signature_url?: string | null
          temoin1_telephone?: string | null
          temoin2_fonction?: string | null
          temoin2_nom?: string | null
          temoin2_photo_url?: string | null
          temoin2_signature_url?: string | null
          temoin2_telephone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          validation_enquete?: string | null
          village_id?: string | null
          village_nom?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantations_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantations_sous_prefecture_id_fkey"
            columns: ["sous_prefecture_id"]
            isOneToOne: false
            referencedRelation: "sous_prefectures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantations_souscripteur_id_fkey"
            columns: ["souscripteur_id"]
            isOneToOne: false
            referencedRelation: "souscripteurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantations_technicien_assigne_id_fkey"
            columns: ["technicien_assigne_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portefeuilles: {
        Row: {
          created_at: string | null
          dernier_versement_date: string | null
          dernier_versement_montant: number | null
          id: string
          solde_commissions: number | null
          total_gagne: number | null
          total_retire: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dernier_versement_date?: string | null
          dernier_versement_montant?: number | null
          id?: string
          solde_commissions?: number | null
          total_gagne?: number | null
          total_retire?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dernier_versement_date?: string | null
          dernier_versement_montant?: number | null
          id?: string
          solde_commissions?: number | null
          total_gagne?: number | null
          total_retire?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          departement: string | null
          departements: string[] | null
          email: string
          equipe_id: string | null
          est_actif: boolean | null
          id: string
          nom_complet: string
          photo_url: string | null
          region_id: string | null
          relation_rh: string | null
          sous_prefectures: string[] | null
          taux_commission: number | null
          telephone: string | null
          updated_at: string | null
          updated_by: string | null
          username: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          departement?: string | null
          departements?: string[] | null
          email: string
          equipe_id?: string | null
          est_actif?: boolean | null
          id: string
          nom_complet: string
          photo_url?: string | null
          region_id?: string | null
          relation_rh?: string | null
          sous_prefectures?: string[] | null
          taux_commission?: number | null
          telephone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          username: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          departement?: string | null
          departements?: string[] | null
          email?: string
          equipe_id?: string | null
          est_actif?: boolean | null
          id?: string
          nom_complet?: string
          photo_url?: string | null
          region_id?: string | null
          relation_rh?: string | null
          sous_prefectures?: string[] | null
          taux_commission?: number | null
          telephone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          username?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string | null
          created_by: string | null
          date_debut: string
          date_fin: string
          description: string | null
          id: string
          montant_normal_ha: number
          montant_reduit_ha: number
          nom_promotion: string
          reduction_pct: number | null
          statut: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date_debut: string
          date_fin: string
          description?: string | null
          id?: string
          montant_normal_ha?: number
          montant_reduit_ha: number
          nom_promotion: string
          reduction_pct?: number | null
          statut?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date_debut?: string
          date_fin?: string
          description?: string | null
          id?: string
          montant_normal_ha?: number
          montant_reduit_ha?: number
          nom_promotion?: string
          reduction_pct?: number | null
          statut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rapports_suivi: {
        Row: {
          annee_suivi: number
          created_at: string | null
          date_soumission: string
          hectares_visites: number
          id: string
          mois_suivi: number
          nombre_photos: number | null
          observations: string | null
          photos_urls: string[] | null
          plantation_id: string | null
          statut: string | null
          technicien_id: string | null
        }
        Insert: {
          annee_suivi: number
          created_at?: string | null
          date_soumission: string
          hectares_visites: number
          id?: string
          mois_suivi: number
          nombre_photos?: number | null
          observations?: string | null
          photos_urls?: string[] | null
          plantation_id?: string | null
          statut?: string | null
          technicien_id?: string | null
        }
        Update: {
          annee_suivi?: number
          created_at?: string | null
          date_soumission?: string
          hectares_visites?: number
          id?: string
          mois_suivi?: number
          nombre_photos?: number | null
          observations?: string | null
          photos_urls?: string[] | null
          plantation_id?: string | null
          statut?: string | null
          technicien_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rapports_suivi_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapports_suivi_technicien_id_fkey"
            columns: ["technicien_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recoltes: {
        Row: {
          created_at: string | null
          date_recolte: string
          enregistre_par: string
          id: string
          plantation_id: string
          prix_kg: number
          redevance_agricapital: number
          revenu_planteur: number
          revenu_total: number
          tonnage: number
        }
        Insert: {
          created_at?: string | null
          date_recolte: string
          enregistre_par: string
          id?: string
          plantation_id: string
          prix_kg: number
          redevance_agricapital: number
          revenu_planteur: number
          revenu_total: number
          tonnage: number
        }
        Update: {
          created_at?: string | null
          date_recolte?: string
          enregistre_par?: string
          id?: string
          plantation_id?: string
          prix_kg?: number
          redevance_agricapital?: number
          revenu_planteur?: number
          revenu_total?: number
          tonnage?: number
        }
        Relationships: [
          {
            foreignKeyName: "recoltes_enregistre_par_fkey"
            columns: ["enregistre_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recoltes_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          chef_lieu: string
          code: string
          created_at: string | null
          district: string
          district_id: string | null
          est_active: boolean | null
          id: string
          nom: string
          population: number | null
          updated_at: string | null
        }
        Insert: {
          chef_lieu: string
          code: string
          created_at?: string | null
          district: string
          district_id?: string | null
          est_active?: boolean | null
          id?: string
          nom: string
          population?: number | null
          updated_at?: string | null
        }
        Update: {
          chef_lieu?: string
          code?: string
          created_at?: string | null
          district?: string
          district_id?: string | null
          est_active?: boolean | null
          id?: string
          nom?: string
          population?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regions_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      retraits_portefeuille: {
        Row: {
          created_at: string | null
          date_demande: string | null
          date_traitement: string | null
          id: string
          mode_paiement: string
          montant: number
          numero_compte: string | null
          observations: string | null
          portefeuille_id: string
          statut: string | null
          traite_par: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_demande?: string | null
          date_traitement?: string | null
          id?: string
          mode_paiement: string
          montant: number
          numero_compte?: string | null
          observations?: string | null
          portefeuille_id: string
          statut?: string | null
          traite_par?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_demande?: string | null
          date_traitement?: string | null
          id?: string
          mode_paiement?: string
          montant?: number
          numero_compte?: string | null
          observations?: string | null
          portefeuille_id?: string
          statut?: string | null
          traite_par?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retraits_portefeuille_portefeuille_id_fkey"
            columns: ["portefeuille_id"]
            isOneToOne: false
            referencedRelation: "portefeuilles"
            referencedColumns: ["id"]
          },
        ]
      }
      sous_prefectures: {
        Row: {
          code: string
          created_at: string | null
          departement_id: string
          est_active: boolean | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          departement_id: string
          est_active?: boolean | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          departement_id?: string
          est_active?: boolean | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sous_prefectures_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
        ]
      }
      souscripteurs: {
        Row: {
          banque_operateur: string | null
          civilite: Database["public"]["Enums"]["civilite"]
          conjoint_date_delivrance: string | null
          conjoint_nom_prenoms: string | null
          conjoint_numero_piece: string | null
          conjoint_photo_identite_url: string | null
          conjoint_photo_url: string | null
          conjoint_telephone: string | null
          conjoint_type_piece:
            | Database["public"]["Enums"]["type_piece_identite"]
            | null
          conjoint_whatsapp: string | null
          created_at: string | null
          created_by: string
          date_delivrance_piece: string
          date_naissance: string
          domicile_residence: string
          email: string | null
          fichier_piece_url: string
          id: string
          id_unique: string
          lieu_naissance: string | null
          nom_beneficiaire: string | null
          nom_complet: string
          nombre_plantations: number | null
          numero_compte: string | null
          numero_mobile_money: string | null
          numero_piece: string
          photo_profil_url: string
          prenoms: string
          statut_global:
            | Database["public"]["Enums"]["statut_souscripteur"]
            | null
          statut_marital: Database["public"]["Enums"]["statut_marital"] | null
          telephone: string
          total_contributions_versees: number | null
          total_da_verse: number | null
          total_hectares: number | null
          type_compte: string | null
          type_piece: Database["public"]["Enums"]["type_piece_identite"]
          updated_at: string | null
          updated_by: string | null
          whatsapp: string
        }
        Insert: {
          banque_operateur?: string | null
          civilite: Database["public"]["Enums"]["civilite"]
          conjoint_date_delivrance?: string | null
          conjoint_nom_prenoms?: string | null
          conjoint_numero_piece?: string | null
          conjoint_photo_identite_url?: string | null
          conjoint_photo_url?: string | null
          conjoint_telephone?: string | null
          conjoint_type_piece?:
            | Database["public"]["Enums"]["type_piece_identite"]
            | null
          conjoint_whatsapp?: string | null
          created_at?: string | null
          created_by: string
          date_delivrance_piece: string
          date_naissance: string
          domicile_residence: string
          email?: string | null
          fichier_piece_url: string
          id?: string
          id_unique: string
          lieu_naissance?: string | null
          nom_beneficiaire?: string | null
          nom_complet: string
          nombre_plantations?: number | null
          numero_compte?: string | null
          numero_mobile_money?: string | null
          numero_piece: string
          photo_profil_url: string
          prenoms: string
          statut_global?:
            | Database["public"]["Enums"]["statut_souscripteur"]
            | null
          statut_marital?: Database["public"]["Enums"]["statut_marital"] | null
          telephone: string
          total_contributions_versees?: number | null
          total_da_verse?: number | null
          total_hectares?: number | null
          type_compte?: string | null
          type_piece: Database["public"]["Enums"]["type_piece_identite"]
          updated_at?: string | null
          updated_by?: string | null
          whatsapp: string
        }
        Update: {
          banque_operateur?: string | null
          civilite?: Database["public"]["Enums"]["civilite"]
          conjoint_date_delivrance?: string | null
          conjoint_nom_prenoms?: string | null
          conjoint_numero_piece?: string | null
          conjoint_photo_identite_url?: string | null
          conjoint_photo_url?: string | null
          conjoint_telephone?: string | null
          conjoint_type_piece?:
            | Database["public"]["Enums"]["type_piece_identite"]
            | null
          conjoint_whatsapp?: string | null
          created_at?: string | null
          created_by?: string
          date_delivrance_piece?: string
          date_naissance?: string
          domicile_residence?: string
          email?: string | null
          fichier_piece_url?: string
          id?: string
          id_unique?: string
          lieu_naissance?: string | null
          nom_beneficiaire?: string | null
          nom_complet?: string
          nombre_plantations?: number | null
          numero_compte?: string | null
          numero_mobile_money?: string | null
          numero_piece?: string
          photo_profil_url?: string
          prenoms?: string
          statut_global?:
            | Database["public"]["Enums"]["statut_souscripteur"]
            | null
          statut_marital?: Database["public"]["Enums"]["statut_marital"] | null
          telephone?: string
          total_contributions_versees?: number | null
          total_da_verse?: number | null
          total_hectares?: number | null
          type_compte?: string | null
          type_piece?: Database["public"]["Enums"]["type_piece_identite"]
          updated_at?: string | null
          updated_by?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "souscripteurs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "souscripteurs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      souscriptions_brouillon: {
        Row: {
          created_at: string | null
          created_by: string
          donnees: Json
          etape_actuelle: number
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          donnees?: Json
          etape_actuelle?: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          donnees?: Json
          etape_actuelle?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      templates_notifications: {
        Row: {
          code: string
          contenu: string
          created_at: string | null
          created_by: string | null
          description: string | null
          est_actif: boolean | null
          id: string
          nom: string
          sujet: string | null
          type_notification: string
          updated_at: string | null
          updated_by: string | null
          variables_disponibles: string[] | null
        }
        Insert: {
          code: string
          contenu: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          est_actif?: boolean | null
          id?: string
          nom: string
          sujet?: string | null
          type_notification: string
          updated_at?: string | null
          updated_by?: string | null
          variables_disponibles?: string[] | null
        }
        Update: {
          code?: string
          contenu?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          est_actif?: boolean | null
          id?: string
          nom?: string
          sujet?: string | null
          type_notification?: string
          updated_at?: string | null
          updated_by?: string | null
          variables_disponibles?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_notifications_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_techniques: {
        Row: {
          assigne_a: string | null
          created_at: string
          cree_par: string
          date_resolution: string | null
          description: string
          id: string
          photos_urls: string[] | null
          plantation_id: string
          priorite: string
          resolution: string | null
          statut: string
          titre: string
          updated_at: string
        }
        Insert: {
          assigne_a?: string | null
          created_at?: string
          cree_par: string
          date_resolution?: string | null
          description: string
          id?: string
          photos_urls?: string[] | null
          plantation_id: string
          priorite?: string
          resolution?: string | null
          statut?: string
          titre: string
          updated_at?: string
        }
        Update: {
          assigne_a?: string | null
          created_at?: string
          cree_par?: string
          date_resolution?: string | null
          description?: string
          id?: string
          photos_urls?: string[] | null
          plantation_id?: string
          priorite?: string
          resolution?: string | null
          statut?: string
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_techniques_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valeurs_champs_personnalises: {
        Row: {
          champ_id: string | null
          created_at: string | null
          entite_id: string
          entite_type: string
          id: string
          updated_at: string | null
          valeur: string | null
        }
        Insert: {
          champ_id?: string | null
          created_at?: string | null
          entite_id: string
          entite_type: string
          id?: string
          updated_at?: string | null
          valeur?: string | null
        }
        Update: {
          champ_id?: string | null
          created_at?: string | null
          entite_id?: string
          entite_type?: string
          id?: string
          updated_at?: string | null
          valeur?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valeurs_champs_personnalises_champ_id_fkey"
            columns: ["champ_id"]
            isOneToOne: false
            referencedRelation: "champs_personnalises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculer_nombre_mois: { Args: { montant: number }; Returns: number }
      calculer_statut_contribution: {
        Args: { p_montant_total_paye: number; p_souscripteur_id: string }
        Returns: {
          jours_couverts: number
          jours_restants_annee: number
          montant_recommande: number
          statut: string
        }[]
      }
      check_region_active: { Args: { region_nom: string }; Returns: boolean }
      est_region_active: { Args: { region_nom: string }; Returns: boolean }
      generate_plantation_id: { Args: { region_code: string }; Returns: string }
      generate_souscripteur_id: { Args: never; Returns: string }
      get_config: { Args: { p_cle: string }; Returns: string }
      get_montant_da_wave: {
        Args: { superficie_ha: number }
        Returns: {
          montant_total: number
          montant_unitaire: number
          nom_promotion: string
          promotion_active: boolean
          reduction_pct: number
        }[]
      }
      get_montant_theorique_da: { Args: never; Returns: number }
      get_promotion_active: {
        Args: never
        Returns: {
          date_debut: string
          date_fin: string
          id: string
          montant_normal_ha: number
          montant_reduit_ha: number
          nom_promotion: string
          reduction_pct: number
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "pdg"
        | "directeur_general"
        | "directeur_commercial"
        | "responsable_operations"
        | "responsable_service_client"
        | "responsable_zone"
        | "chef_equipe"
        | "commercial"
        | "technicien"
        | "agent_service_client"
      civilite: "M" | "Mme" | "Mlle"
      mode_paiement: "mobile_money" | "especes" | "virement" | "autre"
      statut_marital: "celibataire" | "marie" | "divorce" | "veuf"
      statut_paiement:
        | "en_attente"
        | "preuve_fournie"
        | "en_verification"
        | "valide"
        | "rejete"
      statut_plantation:
        | "en_attente_da"
        | "da_valide"
        | "en_delimitation_gps"
        | "en_piquetage"
        | "en_plantation"
        | "en_croissance"
        | "en_production"
        | "autonomie"
        | "suspendue"
        | "hypothequee"
        | "resiliee"
        | "abandonnee"
      statut_souscripteur:
        | "actif"
        | "inactif"
        | "suspendu"
        | "resilie"
        | "blacklist"
      type_document_foncier:
        | "certificat_foncier"
        | "titre_foncier"
        | "contrat_metayage"
        | "autorisation"
      type_piece_identite: "cni" | "passeport" | "attestation"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "pdg",
        "directeur_general",
        "directeur_commercial",
        "responsable_operations",
        "responsable_service_client",
        "responsable_zone",
        "chef_equipe",
        "commercial",
        "technicien",
        "agent_service_client",
      ],
      civilite: ["M", "Mme", "Mlle"],
      mode_paiement: ["mobile_money", "especes", "virement", "autre"],
      statut_marital: ["celibataire", "marie", "divorce", "veuf"],
      statut_paiement: [
        "en_attente",
        "preuve_fournie",
        "en_verification",
        "valide",
        "rejete",
      ],
      statut_plantation: [
        "en_attente_da",
        "da_valide",
        "en_delimitation_gps",
        "en_piquetage",
        "en_plantation",
        "en_croissance",
        "en_production",
        "autonomie",
        "suspendue",
        "hypothequee",
        "resiliee",
        "abandonnee",
      ],
      statut_souscripteur: [
        "actif",
        "inactif",
        "suspendu",
        "resilie",
        "blacklist",
      ],
      type_document_foncier: [
        "certificat_foncier",
        "titre_foncier",
        "contrat_metayage",
        "autorisation",
      ],
      type_piece_identite: ["cni", "passeport", "attestation"],
    },
  },
} as const
