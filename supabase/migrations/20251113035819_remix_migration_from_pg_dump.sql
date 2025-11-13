--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'super_admin',
    'pdg',
    'directeur_general',
    'directeur_commercial',
    'responsable_operations',
    'responsable_service_client',
    'responsable_zone',
    'chef_equipe',
    'commercial',
    'technicien',
    'agent_service_client'
);


--
-- Name: civilite; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.civilite AS ENUM (
    'M',
    'Mme',
    'Mlle'
);


--
-- Name: mode_paiement; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.mode_paiement AS ENUM (
    'mobile_money',
    'especes',
    'virement',
    'autre'
);


--
-- Name: statut_marital; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.statut_marital AS ENUM (
    'celibataire',
    'marie',
    'divorce',
    'veuf'
);


--
-- Name: statut_paiement; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.statut_paiement AS ENUM (
    'en_attente',
    'preuve_fournie',
    'en_verification',
    'valide',
    'rejete'
);


--
-- Name: statut_plantation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.statut_plantation AS ENUM (
    'en_attente_da',
    'da_valide',
    'en_delimitation_gps',
    'en_piquetage',
    'en_plantation',
    'en_croissance',
    'en_production',
    'autonomie',
    'suspendue',
    'hypothequee',
    'resiliee',
    'abandonnee'
);


--
-- Name: statut_souscripteur; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.statut_souscripteur AS ENUM (
    'actif',
    'inactif',
    'suspendu',
    'resilie',
    'blacklist'
);


--
-- Name: type_document_foncier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.type_document_foncier AS ENUM (
    'certificat_foncier',
    'titre_foncier',
    'contrat_metayage',
    'autorisation'
);


--
-- Name: type_piece_identite; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.type_piece_identite AS ENUM (
    'cni',
    'passeport',
    'attestation'
);


--
-- Name: auto_calculate_nombre_mois(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_calculate_nombre_mois() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.type_paiement = 'Contribution Trimestrielle' AND NEW.montant_paye IS NOT NULL THEN
    NEW.nombre_mois := calculer_nombre_mois(NEW.montant_paye);
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: auto_set_montant_theorique_da(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_set_montant_theorique_da() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.type_paiement = 'Droit d''Accès' THEN
    NEW.montant_theorique := get_montant_theorique_da();
    NEW.montant_paye := NEW.montant_theorique; -- DA doit être payé en totalité
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: calculer_commission_souscription(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculer_commission_souscription() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_taux_commission NUMERIC;
  v_montant_commission NUMERIC;
  v_commercial_id UUID;
BEGIN
  -- Récupérer le taux de commission du commercial (depuis profiles ou une valeur par défaut)
  SELECT created_by INTO v_commercial_id FROM public.plantations WHERE id = NEW.id;
  
  -- Utiliser un taux par défaut de 5% ou récupérer depuis le profil
  v_taux_commission := 5.0;
  
  -- Calculer la commission basée sur le montant théorique du premier paiement
  IF NEW.statut_global = 'en_production' THEN
    v_montant_commission := (NEW.superficie_ha * 500000) * (v_taux_commission / 100);
    
    -- Insérer la commission
    INSERT INTO public.commissions (
      user_id,
      plantation_id,
      type_commission,
      montant_base,
      taux_commission,
      montant_commission,
      periode,
      statut
    ) VALUES (
      v_commercial_id,
      NEW.id,
      'souscription',
      NEW.superficie_ha * 500000,
      v_taux_commission,
      v_montant_commission,
      CURRENT_DATE,
      'en_attente'
    );
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: calculer_commission_souscription_avec_penalite(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculer_commission_souscription_avec_penalite() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_taux_commission NUMERIC := 2500;
  v_montant_commission NUMERIC;
  v_commercial_id UUID;
  v_relation_rh TEXT;
  v_date_signature DATE;
  v_jours_retard INTEGER;
BEGIN
  -- Récupérer le commercial et vérifier qu'il est prestataire
  SELECT created_by, date_signature_contrat INTO v_commercial_id, v_date_signature 
  FROM public.plantations WHERE id = NEW.id;
  
  SELECT relation_rh INTO v_relation_rh FROM public.profiles WHERE id = v_commercial_id;
  
  -- Seulement pour les prestataires
  IF v_relation_rh = 'Prestataire' AND NEW.statut_global IN ('da_valide', 'en_cours') THEN
    -- Calculer les jours de retard
    v_jours_retard := EXTRACT(DAY FROM (CURRENT_DATE - v_date_signature));
    
    -- Calculer la commission de base
    v_montant_commission := NEW.superficie_ha * v_taux_commission;
    
    -- Appliquer les pénalités
    IF v_jours_retard > 7 THEN
      v_montant_commission := 0;
    ELSIF v_jours_retard > 2 THEN
      v_montant_commission := v_montant_commission * 0.9; -- -10%
    END IF;
    
    -- Insérer la commission
    INSERT INTO public.commissions (
      user_id,
      plantation_id,
      type_commission,
      montant_base,
      taux_commission,
      montant_commission,
      periode,
      statut,
      penalite_appliquee,
      jours_retard
    ) VALUES (
      v_commercial_id,
      NEW.id,
      'souscription',
      NEW.superficie_ha * v_taux_commission,
      v_taux_commission,
      v_montant_commission,
      CURRENT_DATE,
      'en_attente',
      v_jours_retard > 2,
      v_jours_retard
    );
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: calculer_nombre_mois(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculer_nombre_mois(montant numeric) RETURNS numeric
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  taux_mensuel CONSTANT numeric := 1700;
  taux_trimestre CONSTANT numeric := 5000;
  taux_annuel CONSTANT numeric := 20000;
  nombre_mois numeric;
BEGIN
  -- Cas spéciaux
  IF montant = taux_trimestre THEN
    RETURN 3;
  ELSIF montant = taux_annuel THEN
    RETURN 12;
  END IF;
  
  -- Calcul général
  nombre_mois := montant / taux_mensuel;
  
  -- Vérifier que c'est un multiple de 0.5
  IF (nombre_mois * 2) != FLOOR(nombre_mois * 2) THEN
    RAISE EXCEPTION 'Le montant saisi doit correspondre à un nombre de mois entier ou demi-mois. Exemple : 1 mois = 1 700 F, 1,5 mois = 2 550 F, 3 mois = 5 000 F.';
  END IF;
  
  RETURN nombre_mois;
END;
$$;


--
-- Name: check_region_active(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_region_active(region_nom text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.regions 
    WHERE nom = region_nom AND est_active = true
  );
END;
$$;


--
-- Name: create_historique_entry(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_historique_entry() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO historique_actions (
      souscripteur_id,
      user_id,
      type_action,
      description,
      nouvelle_valeur
    ) VALUES (
      NEW.id,
      NEW.created_by,
      'creation',
      'Création du planteur',
      row_to_json(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO historique_actions (
      souscripteur_id,
      user_id,
      type_action,
      description,
      ancienne_valeur,
      nouvelle_valeur
    ) VALUES (
      NEW.id,
      NEW.updated_by,
      'modification',
      'Modification du planteur',
      row_to_json(OLD),
      row_to_json(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: est_region_active(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.est_region_active(region_nom text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM regions WHERE nom = region_nom AND est_active = true
  );
END;
$$;


--
-- Name: generate_plantation_id(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_plantation_id(region_code text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_id TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.plantations;
  new_id := 'AGRI-PLANT-' || region_code || '-2025-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_id;
END;
$$;


--
-- Name: generate_souscripteur_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_souscripteur_id() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_id TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.souscripteurs;
  new_id := 'AGRI-PLANTR-2025-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_id;
END;
$$;


--
-- Name: get_montant_theorique_da(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_montant_theorique_da() RETURNS numeric
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  promotion_active RECORD;
  montant_final numeric := 30000;
BEGIN
  SELECT * INTO promotion_active FROM get_promotion_active() LIMIT 1;
  
  IF promotion_active.id IS NOT NULL THEN
    montant_final := promotion_active.montant_reduit_ha;
  END IF;
  
  RETURN montant_final;
END;
$$;


--
-- Name: get_promotion_active(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_promotion_active() RETURNS TABLE(id uuid, nom_promotion text, montant_reduit_ha numeric, montant_normal_ha numeric, reduction_pct numeric, date_debut timestamp with time zone, date_fin timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id, nom_promotion, montant_reduit_ha, montant_normal_ha, 
         reduction_pct, date_debut, date_fin
  FROM public.promotions
  WHERE statut = 'ACTIF'
    AND date_debut <= now()
    AND date_fin >= now()
  ORDER BY date_debut DESC
  LIMIT 1;
$$;


--
-- Name: get_user_roles(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_roles(_user_id uuid) RETURNS SETOF public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: set_souscripteur_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_souscripteur_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.id_unique IS NULL OR NEW.id_unique = '' THEN
    NEW.id_unique := public.generate_souscripteur_id();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id uuid,
    "timestamp" timestamp with time zone DEFAULT now()
);


--
-- Name: commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plantation_id uuid,
    type_commission text NOT NULL,
    montant_base numeric(10,2) NOT NULL,
    taux_commission numeric(5,2) NOT NULL,
    montant_commission numeric(10,2) NOT NULL,
    periode date NOT NULL,
    statut text DEFAULT 'en_attente'::text,
    date_calcul timestamp with time zone DEFAULT now(),
    date_validation timestamp with time zone,
    valide_par uuid,
    date_paiement timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    penalite_appliquee boolean DEFAULT false,
    jours_retard integer DEFAULT 0,
    CONSTRAINT commissions_statut_check CHECK ((statut = ANY (ARRAY['en_attente'::text, 'valide'::text, 'paye'::text, 'annule'::text]))),
    CONSTRAINT commissions_type_commission_check CHECK ((type_commission = ANY (ARRAY['souscription'::text, 'installation'::text, 'suivi'::text, 'bonus'::text])))
);


--
-- Name: departements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    region_id uuid NOT NULL,
    code text NOT NULL,
    nom text NOT NULL,
    chef_lieu text NOT NULL,
    est_actif boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    sous_prefecture_id uuid
);


--
-- Name: departements_entreprise; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departements_entreprise (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom text NOT NULL,
    est_actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: equipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom text NOT NULL,
    chef_equipe_id uuid,
    region_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: historique_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historique_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    souscripteur_id uuid,
    plantation_id uuid,
    user_id uuid,
    type_action text NOT NULL,
    description text NOT NULL,
    ancienne_valeur jsonb,
    nouvelle_valeur jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: interventions_techniques; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interventions_techniques (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plantation_id uuid NOT NULL,
    type_intervention text NOT NULL,
    date_intervention date NOT NULL,
    mois_suivi integer,
    technicien_id uuid NOT NULL,
    taux_survie_constate numeric(5,2),
    observations text,
    incident_type text,
    incident_description text,
    traitement_applique text,
    produit_utilise text,
    dosage text,
    resultat_traitement text,
    photos_urls text[],
    rapport_url text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL
);


--
-- Name: paiements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paiements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plantation_id uuid NOT NULL,
    type_paiement text NOT NULL,
    annee integer NOT NULL,
    montant_theorique numeric(15,2) NOT NULL,
    montant_paye numeric(15,2),
    date_paiement date,
    date_due date,
    mode_paiement public.mode_paiement,
    type_preuve text,
    id_transaction text,
    operateur_mobile_money text,
    fichier_preuve_url text,
    date_upload_preuve timestamp with time zone,
    statut public.statut_paiement DEFAULT 'en_attente'::public.statut_paiement,
    valide_par uuid,
    date_validation timestamp with time zone,
    observations text,
    raison_rejet text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    nombre_mois numeric,
    montant_promotion numeric,
    promotion_appliquee boolean DEFAULT false,
    CONSTRAINT paiements_type_paiement_check CHECK ((type_paiement = ANY (ARRAY['Droit d''Accès'::text, 'Contribution Trimestrielle'::text])))
);


--
-- Name: photos_plantation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photos_plantation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plantation_id uuid NOT NULL,
    phase text NOT NULL,
    type_photo text NOT NULL,
    mois_suivi integer,
    url text NOT NULL,
    description text,
    date_prise date NOT NULL,
    prise_par uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: plantations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plantations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_unique text NOT NULL,
    souscripteur_id uuid NOT NULL,
    nom_plantation text NOT NULL,
    superficie_ha numeric(10,2) NOT NULL,
    nombre_plants integer NOT NULL,
    numero_parcelle_localite text,
    region_id uuid NOT NULL,
    departement_id uuid NOT NULL,
    sous_prefecture_id uuid NOT NULL,
    village_id uuid,
    village_nom text NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    altitude numeric(8,2),
    limite_nord text,
    limite_sud text,
    limite_est text,
    limite_ouest text,
    document_foncier_type public.type_document_foncier NOT NULL,
    document_foncier_numero text NOT NULL,
    document_foncier_date_delivrance date NOT NULL,
    document_foncier_url text NOT NULL,
    proprietaire_legal text,
    statut_validation_afor text DEFAULT 'non_valide'::text,
    notes_verification_fonciere text,
    chef_village_nom text NOT NULL,
    chef_village_telephone text NOT NULL,
    chef_village_signature_url text,
    temoin1_nom text,
    temoin1_fonction text,
    temoin1_telephone text,
    temoin1_signature_url text,
    temoin1_photo_url text,
    temoin2_nom text,
    temoin2_fonction text,
    temoin2_telephone text,
    temoin2_signature_url text,
    temoin2_photo_url text,
    attestation_absence_litiges boolean DEFAULT false,
    date_enquete date,
    lieu_enquete text,
    pv_enquete_url text,
    validation_enquete text DEFAULT 'en_attente'::text,
    phase_actuelle integer DEFAULT 1,
    statut_global public.statut_plantation DEFAULT 'en_attente_da'::public.statut_plantation,
    date_signature_contrat date NOT NULL,
    date_debut_plantation_reelle date,
    date_prevue_production date,
    date_reelle_entree_production date,
    jalon_enquete_date date,
    jalon_da_valide_date date,
    jalon_delimitation_gps_date date,
    jalon_piquetage_date date,
    jalon_mise_en_terre_date date,
    jalon_entree_production_date date,
    technicien_assigne_id uuid,
    taux_survie_plants numeric(5,2),
    rendement_moyen_t_ha numeric(8,2),
    production_cumul_tonnes numeric(12,2) DEFAULT 0,
    nombre_regimes_pod integer,
    prix_unitaire_kg numeric(10,2),
    redevance_agricapital_pct numeric(5,2) DEFAULT 20,
    cumul_revenu_planteur numeric(15,2) DEFAULT 0,
    alerte_non_paiement boolean DEFAULT false,
    alerte_visite_retard boolean DEFAULT false,
    alerte_survie_faible boolean DEFAULT false,
    alerte_recolte_illicite boolean DEFAULT false,
    alerte_litige_foncier boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    updated_by uuid,
    notes_internes text,
    CONSTRAINT plantations_superficie_ha_check CHECK ((superficie_ha >= (1)::numeric))
);


--
-- Name: portefeuilles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portefeuilles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    solde_commissions numeric(10,2) DEFAULT 0,
    total_gagne numeric(10,2) DEFAULT 0,
    total_retire numeric(10,2) DEFAULT 0,
    dernier_versement_date timestamp with time zone,
    dernier_versement_montant numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text NOT NULL,
    nom_complet text NOT NULL,
    email text NOT NULL,
    telephone text,
    whatsapp text,
    photo_url text,
    region_id uuid,
    departements uuid[],
    sous_prefectures uuid[],
    est_actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    equipe_id uuid,
    relation_rh text,
    departement text,
    taux_commission numeric,
    CONSTRAINT profiles_relation_rh_check CHECK ((relation_rh = ANY (ARRAY['Employé'::text, 'Prestataire'::text])))
);


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom_promotion text NOT NULL,
    montant_reduit_ha numeric NOT NULL,
    montant_normal_ha numeric DEFAULT 30000 NOT NULL,
    reduction_pct numeric GENERATED ALWAYS AS ((((montant_normal_ha - montant_reduit_ha) / montant_normal_ha) * (100)::numeric)) STORED,
    date_debut timestamp with time zone NOT NULL,
    date_fin timestamp with time zone NOT NULL,
    statut text DEFAULT 'ACTIF'::text NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT promotions_statut_check CHECK ((statut = ANY (ARRAY['ACTIF'::text, 'INACTIF'::text, 'EXPIRÉ'::text])))
);


--
-- Name: rapports_suivi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rapports_suivi (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plantation_id uuid,
    technicien_id uuid,
    mois_suivi integer NOT NULL,
    annee_suivi integer NOT NULL,
    date_soumission date NOT NULL,
    nombre_photos integer DEFAULT 0,
    photos_urls text[],
    hectares_visites numeric NOT NULL,
    observations text,
    statut text DEFAULT 'en_attente'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rapports_suivi_statut_check CHECK ((statut = ANY (ARRAY['en_attente'::text, 'valide'::text, 'rejete'::text])))
);


--
-- Name: recoltes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recoltes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plantation_id uuid NOT NULL,
    date_recolte date NOT NULL,
    tonnage numeric(10,2) NOT NULL,
    prix_kg numeric(10,2) NOT NULL,
    revenu_total numeric(15,2) NOT NULL,
    redevance_agricapital numeric(15,2) NOT NULL,
    revenu_planteur numeric(15,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    enregistre_par uuid NOT NULL
);


--
-- Name: regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    nom text NOT NULL,
    district text NOT NULL,
    chef_lieu text NOT NULL,
    population bigint,
    est_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    district_id uuid
);


--
-- Name: retraits_portefeuille; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.retraits_portefeuille (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portefeuille_id uuid NOT NULL,
    user_id uuid NOT NULL,
    montant numeric(10,2) NOT NULL,
    mode_paiement text NOT NULL,
    numero_compte text,
    statut text DEFAULT 'en_attente'::text,
    date_demande timestamp with time zone DEFAULT now(),
    date_traitement timestamp with time zone,
    traite_par uuid,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT retraits_portefeuille_statut_check CHECK ((statut = ANY (ARRAY['en_attente'::text, 'approuve'::text, 'paye'::text, 'rejete'::text])))
);


--
-- Name: sous_prefectures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sous_prefectures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    departement_id uuid NOT NULL,
    code text NOT NULL,
    nom text NOT NULL,
    est_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: souscripteurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.souscripteurs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_unique text NOT NULL,
    civilite public.civilite NOT NULL,
    nom_complet text NOT NULL,
    prenoms text NOT NULL,
    date_naissance date NOT NULL,
    lieu_naissance text,
    type_piece public.type_piece_identite NOT NULL,
    numero_piece text NOT NULL,
    date_delivrance_piece date NOT NULL,
    fichier_piece_url text NOT NULL,
    photo_profil_url text NOT NULL,
    statut_marital public.statut_marital,
    conjoint_nom_prenoms text,
    conjoint_type_piece public.type_piece_identite,
    conjoint_numero_piece text,
    conjoint_date_delivrance date,
    conjoint_telephone text,
    conjoint_whatsapp text,
    conjoint_photo_identite_url text,
    conjoint_photo_url text,
    domicile_residence text NOT NULL,
    telephone text NOT NULL,
    whatsapp text NOT NULL,
    email text,
    type_compte text,
    numero_compte text,
    numero_mobile_money text,
    nom_beneficiaire text,
    banque_operateur text,
    nombre_plantations integer DEFAULT 0,
    total_hectares numeric(10,2) DEFAULT 0,
    total_da_verse numeric(15,2) DEFAULT 0,
    total_contributions_versees numeric(15,2) DEFAULT 0,
    statut_global public.statut_souscripteur DEFAULT 'actif'::public.statut_souscripteur,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    updated_by uuid
);


--
-- Name: souscriptions_brouillon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.souscriptions_brouillon (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etape_actuelle integer DEFAULT 1 NOT NULL,
    donnees jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: tickets_techniques; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets_techniques (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plantation_id uuid NOT NULL,
    titre text NOT NULL,
    description text NOT NULL,
    priorite text DEFAULT 'moyenne'::text NOT NULL,
    statut text DEFAULT 'ouvert'::text NOT NULL,
    cree_par uuid NOT NULL,
    assigne_a uuid,
    resolution text,
    date_resolution timestamp with time zone,
    photos_urls text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tickets_techniques_priorite_check CHECK ((priorite = ANY (ARRAY['basse'::text, 'moyenne'::text, 'haute'::text, 'urgente'::text]))),
    CONSTRAINT tickets_techniques_statut_check CHECK ((statut = ANY (ARRAY['ouvert'::text, 'en_cours'::text, 'resolu'::text, 'ferme'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: commissions commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_pkey PRIMARY KEY (id);


--
-- Name: departements departements_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departements
    ADD CONSTRAINT departements_code_key UNIQUE (code);


--
-- Name: departements_entreprise departements_entreprise_nom_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departements_entreprise
    ADD CONSTRAINT departements_entreprise_nom_key UNIQUE (nom);


--
-- Name: departements_entreprise departements_entreprise_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departements_entreprise
    ADD CONSTRAINT departements_entreprise_pkey PRIMARY KEY (id);


--
-- Name: departements departements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departements
    ADD CONSTRAINT departements_pkey PRIMARY KEY (id);


--
-- Name: districts districts_nom_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_nom_key UNIQUE (nom);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: equipes equipes_nom_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_nom_key UNIQUE (nom);


--
-- Name: equipes equipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_pkey PRIMARY KEY (id);


--
-- Name: historique_actions historique_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historique_actions
    ADD CONSTRAINT historique_actions_pkey PRIMARY KEY (id);


--
-- Name: interventions_techniques interventions_techniques_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interventions_techniques
    ADD CONSTRAINT interventions_techniques_pkey PRIMARY KEY (id);


--
-- Name: paiements paiements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_pkey PRIMARY KEY (id);


--
-- Name: photos_plantation photos_plantation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos_plantation
    ADD CONSTRAINT photos_plantation_pkey PRIMARY KEY (id);


--
-- Name: plantations plantations_id_unique_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_id_unique_key UNIQUE (id_unique);


--
-- Name: plantations plantations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_pkey PRIMARY KEY (id);


--
-- Name: portefeuilles portefeuilles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portefeuilles
    ADD CONSTRAINT portefeuilles_pkey PRIMARY KEY (id);


--
-- Name: portefeuilles portefeuilles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portefeuilles
    ADD CONSTRAINT portefeuilles_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: rapports_suivi rapports_suivi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rapports_suivi
    ADD CONSTRAINT rapports_suivi_pkey PRIMARY KEY (id);


--
-- Name: rapports_suivi rapports_suivi_plantation_id_mois_suivi_annee_suivi_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rapports_suivi
    ADD CONSTRAINT rapports_suivi_plantation_id_mois_suivi_annee_suivi_key UNIQUE (plantation_id, mois_suivi, annee_suivi);


--
-- Name: recoltes recoltes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recoltes
    ADD CONSTRAINT recoltes_pkey PRIMARY KEY (id);


--
-- Name: regions regions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_code_key UNIQUE (code);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: retraits_portefeuille retraits_portefeuille_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retraits_portefeuille
    ADD CONSTRAINT retraits_portefeuille_pkey PRIMARY KEY (id);


--
-- Name: sous_prefectures sous_prefectures_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sous_prefectures
    ADD CONSTRAINT sous_prefectures_code_key UNIQUE (code);


--
-- Name: sous_prefectures sous_prefectures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sous_prefectures
    ADD CONSTRAINT sous_prefectures_pkey PRIMARY KEY (id);


--
-- Name: souscripteurs souscripteurs_id_unique_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.souscripteurs
    ADD CONSTRAINT souscripteurs_id_unique_key UNIQUE (id_unique);


--
-- Name: souscripteurs souscripteurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.souscripteurs
    ADD CONSTRAINT souscripteurs_pkey PRIMARY KEY (id);


--
-- Name: souscriptions_brouillon souscriptions_brouillon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.souscriptions_brouillon
    ADD CONSTRAINT souscriptions_brouillon_pkey PRIMARY KEY (id);


--
-- Name: tickets_techniques tickets_techniques_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets_techniques
    ADD CONSTRAINT tickets_techniques_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_departements_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departements_region ON public.departements USING btree (region_id);


--
-- Name: idx_historique_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historique_date ON public.historique_actions USING btree (created_at DESC);


--
-- Name: idx_historique_plantation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historique_plantation ON public.historique_actions USING btree (plantation_id);


--
-- Name: idx_historique_souscripteur; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historique_souscripteur ON public.historique_actions USING btree (souscripteur_id);


--
-- Name: idx_interventions_plantation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventions_plantation ON public.interventions_techniques USING btree (plantation_id);


--
-- Name: idx_interventions_technicien; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventions_technicien ON public.interventions_techniques USING btree (technicien_id);


--
-- Name: idx_paiements_plantation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paiements_plantation ON public.paiements USING btree (plantation_id);


--
-- Name: idx_paiements_statut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paiements_statut ON public.paiements USING btree (statut);


--
-- Name: idx_photos_plantation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_photos_plantation ON public.photos_plantation USING btree (plantation_id);


--
-- Name: idx_plantations_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plantations_id_unique ON public.plantations USING btree (id_unique);


--
-- Name: idx_plantations_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plantations_region ON public.plantations USING btree (region_id);


--
-- Name: idx_plantations_souscripteur; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plantations_souscripteur ON public.plantations USING btree (souscripteur_id);


--
-- Name: idx_plantations_statut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plantations_statut ON public.plantations USING btree (statut_global);


--
-- Name: idx_profiles_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);


--
-- Name: idx_promotions_statut_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promotions_statut_dates ON public.promotions USING btree (statut, date_debut, date_fin);


--
-- Name: idx_recoltes_plantation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recoltes_plantation ON public.recoltes USING btree (plantation_id);


--
-- Name: idx_sous_prefectures_departement; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sous_prefectures_departement ON public.sous_prefectures USING btree (departement_id);


--
-- Name: idx_souscripteurs_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_souscripteurs_created_by ON public.souscripteurs USING btree (created_by);


--
-- Name: idx_souscripteurs_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_souscripteurs_id_unique ON public.souscripteurs USING btree (id_unique);


--
-- Name: idx_souscripteurs_statut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_souscripteurs_statut ON public.souscripteurs USING btree (statut_global);


--
-- Name: idx_souscripteurs_telephone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_souscripteurs_telephone ON public.souscripteurs USING btree (telephone);


--
-- Name: idx_user_roles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_role ON public.user_roles USING btree (role);


--
-- Name: idx_user_roles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user ON public.user_roles USING btree (user_id);


--
-- Name: souscriptions_brouillon trigger_brouillon_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_brouillon_updated_at BEFORE UPDATE ON public.souscriptions_brouillon FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: paiements trigger_calculate_mois; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_calculate_mois BEFORE INSERT OR UPDATE ON public.paiements FOR EACH ROW EXECUTE FUNCTION public.auto_calculate_nombre_mois();


--
-- Name: plantations trigger_commission_souscription; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_commission_souscription AFTER UPDATE ON public.plantations FOR EACH ROW WHEN ((old.statut_global IS DISTINCT FROM new.statut_global)) EXECUTE FUNCTION public.calculer_commission_souscription_avec_penalite();


--
-- Name: souscripteurs trigger_historique_souscripteurs; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_historique_souscripteurs AFTER INSERT OR UPDATE ON public.souscripteurs FOR EACH ROW EXECUTE FUNCTION public.create_historique_entry();


--
-- Name: paiements trigger_set_montant_da; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_montant_da BEFORE INSERT OR UPDATE ON public.paiements FOR EACH ROW EXECUTE FUNCTION public.auto_set_montant_theorique_da();


--
-- Name: souscripteurs trigger_set_souscripteur_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_souscripteur_id BEFORE INSERT ON public.souscripteurs FOR EACH ROW EXECUTE FUNCTION public.set_souscripteur_id();


--
-- Name: souscripteurs trigger_souscripteurs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_souscripteurs_updated_at BEFORE UPDATE ON public.souscripteurs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: commissions update_commissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: departements update_departements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_departements_updated_at BEFORE UPDATE ON public.departements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: equipes update_equipes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_equipes_updated_at BEFORE UPDATE ON public.equipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: paiements update_paiements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_paiements_updated_at BEFORE UPDATE ON public.paiements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: plantations update_plantations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_plantations_updated_at BEFORE UPDATE ON public.plantations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: portefeuilles update_portefeuilles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_portefeuilles_updated_at BEFORE UPDATE ON public.portefeuilles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: promotions update_promotions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: regions update_regions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sous_prefectures update_sous_prefectures_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sous_prefectures_updated_at BEFORE UPDATE ON public.sous_prefectures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: souscripteurs update_souscripteurs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_souscripteurs_updated_at BEFORE UPDATE ON public.souscripteurs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tickets_techniques update_tickets_techniques_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tickets_techniques_updated_at BEFORE UPDATE ON public.tickets_techniques FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: commissions commissions_plantation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id);


--
-- Name: commissions commissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: commissions commissions_valide_par_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: departements departements_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departements
    ADD CONSTRAINT departements_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: equipes equipes_chef_equipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_chef_equipe_id_fkey FOREIGN KEY (chef_equipe_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: equipes equipes_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: historique_actions historique_actions_plantation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historique_actions
    ADD CONSTRAINT historique_actions_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id) ON DELETE CASCADE;


--
-- Name: historique_actions historique_actions_souscripteur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historique_actions
    ADD CONSTRAINT historique_actions_souscripteur_id_fkey FOREIGN KEY (souscripteur_id) REFERENCES public.souscripteurs(id) ON DELETE CASCADE;


--
-- Name: historique_actions historique_actions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historique_actions
    ADD CONSTRAINT historique_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: interventions_techniques interventions_techniques_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interventions_techniques
    ADD CONSTRAINT interventions_techniques_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: interventions_techniques interventions_techniques_plantation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interventions_techniques
    ADD CONSTRAINT interventions_techniques_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id) ON DELETE CASCADE;


--
-- Name: interventions_techniques interventions_techniques_technicien_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interventions_techniques
    ADD CONSTRAINT interventions_techniques_technicien_id_fkey FOREIGN KEY (technicien_id) REFERENCES public.profiles(id);


--
-- Name: paiements paiements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: paiements paiements_plantation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id) ON DELETE CASCADE;


--
-- Name: paiements paiements_valide_par_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES public.profiles(id);


--
-- Name: photos_plantation photos_plantation_plantation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos_plantation
    ADD CONSTRAINT photos_plantation_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id) ON DELETE CASCADE;


--
-- Name: photos_plantation photos_plantation_prise_par_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos_plantation
    ADD CONSTRAINT photos_plantation_prise_par_fkey FOREIGN KEY (prise_par) REFERENCES public.profiles(id);


--
-- Name: plantations plantations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: plantations plantations_departement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES public.departements(id);


--
-- Name: plantations plantations_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: plantations plantations_sous_prefecture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_sous_prefecture_id_fkey FOREIGN KEY (sous_prefecture_id) REFERENCES public.sous_prefectures(id);


--
-- Name: plantations plantations_souscripteur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_souscripteur_id_fkey FOREIGN KEY (souscripteur_id) REFERENCES public.souscripteurs(id) ON DELETE CASCADE;


--
-- Name: plantations plantations_technicien_assigne_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_technicien_assigne_id_fkey FOREIGN KEY (technicien_assigne_id) REFERENCES public.profiles(id);


--
-- Name: plantations plantations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantations
    ADD CONSTRAINT plantations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- Name: portefeuilles portefeuilles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portefeuilles
    ADD CONSTRAINT portefeuilles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: profiles profiles_equipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_equipe_id_fkey FOREIGN KEY (equipe_id) REFERENCES public.equipes(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: profiles profiles_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- Name: promotions promotions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: rapports_suivi rapports_suivi_plantation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rapports_suivi
    ADD CONSTRAINT rapports_suivi_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id) ON DELETE CASCADE;


--
-- Name: rapports_suivi rapports_suivi_technicien_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rapports_suivi
    ADD CONSTRAINT rapports_suivi_technicien_id_fkey FOREIGN KEY (technicien_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: recoltes recoltes_enregistre_par_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recoltes
    ADD CONSTRAINT recoltes_enregistre_par_fkey FOREIGN KEY (enregistre_par) REFERENCES public.profiles(id);


--
-- Name: recoltes recoltes_plantation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recoltes
    ADD CONSTRAINT recoltes_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id) ON DELETE CASCADE;


--
-- Name: regions regions_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- Name: retraits_portefeuille retraits_portefeuille_portefeuille_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retraits_portefeuille
    ADD CONSTRAINT retraits_portefeuille_portefeuille_id_fkey FOREIGN KEY (portefeuille_id) REFERENCES public.portefeuilles(id);


--
-- Name: retraits_portefeuille retraits_portefeuille_traite_par_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retraits_portefeuille
    ADD CONSTRAINT retraits_portefeuille_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES auth.users(id);


--
-- Name: retraits_portefeuille retraits_portefeuille_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retraits_portefeuille
    ADD CONSTRAINT retraits_portefeuille_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: sous_prefectures sous_prefectures_departement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sous_prefectures
    ADD CONSTRAINT sous_prefectures_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES public.departements(id) ON DELETE CASCADE;


--
-- Name: souscripteurs souscripteurs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.souscripteurs
    ADD CONSTRAINT souscripteurs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: souscripteurs souscripteurs_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.souscripteurs
    ADD CONSTRAINT souscripteurs_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- Name: souscriptions_brouillon souscriptions_brouillon_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.souscriptions_brouillon
    ADD CONSTRAINT souscriptions_brouillon_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: tickets_techniques tickets_techniques_assigne_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets_techniques
    ADD CONSTRAINT tickets_techniques_assigne_a_fkey FOREIGN KEY (assigne_a) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: tickets_techniques tickets_techniques_cree_par_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets_techniques
    ADD CONSTRAINT tickets_techniques_cree_par_fkey FOREIGN KEY (cree_par) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tickets_techniques tickets_techniques_plantation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets_techniques
    ADD CONSTRAINT tickets_techniques_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: commissions Admins gèrent commissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins gèrent commissions" ON public.commissions USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'responsable_zone'::public.app_role)));


--
-- Name: portefeuilles Admins gèrent portefeuilles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins gèrent portefeuilles" ON public.portefeuilles USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: retraits_portefeuille Admins gèrent retraits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins gèrent retraits" ON public.retraits_portefeuille FOR UPDATE USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: audit_log Audit visible par admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Audit visible par admins" ON public.audit_log FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'pdg'::public.app_role)));


--
-- Name: souscripteurs Commerciaux peuvent créer souscripteurs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Commerciaux peuvent créer souscripteurs" ON public.souscripteurs FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'commercial'::public.app_role) OR public.has_role(auth.uid(), 'chef_equipe'::public.app_role) OR public.has_role(auth.uid(), 'responsable_zone'::public.app_role) OR public.has_role(auth.uid(), 'agent_service_client'::public.app_role)));


--
-- Name: tickets_techniques Créer des tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Créer des tickets" ON public.tickets_techniques FOR INSERT TO authenticated WITH CHECK ((auth.uid() = cree_par));


--
-- Name: plantations Créer plantations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Créer plantations" ON public.plantations FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'commercial'::public.app_role) OR public.has_role(auth.uid(), 'responsable_zone'::public.app_role)));


--
-- Name: departements_entreprise Departements entreprise visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Departements entreprise visibles par tous" ON public.departements_entreprise FOR SELECT TO authenticated USING (true);


--
-- Name: departements Departements visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Departements visibles par tous" ON public.departements FOR SELECT TO authenticated USING (true);


--
-- Name: districts Districts visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Districts visibles par tous" ON public.districts FOR SELECT USING (true);


--
-- Name: paiements Enregistrer paiements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enregistrer paiements" ON public.paiements FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'commercial'::public.app_role) OR public.has_role(auth.uid(), 'agent_service_client'::public.app_role) OR public.has_role(auth.uid(), 'responsable_service_client'::public.app_role)));


--
-- Name: historique_actions Historique visible par tous authentifiés; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Historique visible par tous authentifiés" ON public.historique_actions FOR SELECT USING (true);


--
-- Name: interventions_techniques Interventions visibles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Interventions visibles" ON public.interventions_techniques FOR SELECT TO authenticated USING (true);


--
-- Name: tickets_techniques Modifier ses propres tickets ou tickets assignés; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modifier ses propres tickets ou tickets assignés" ON public.tickets_techniques FOR UPDATE TO authenticated USING (((auth.uid() = cree_par) OR (auth.uid() = assigne_a) OR public.has_role(auth.uid(), 'super_admin'::public.app_role)));


--
-- Name: paiements Paiements visibles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Paiements visibles" ON public.paiements FOR SELECT TO authenticated USING (true);


--
-- Name: photos_plantation Photos visibles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Photos visibles" ON public.photos_plantation FOR SELECT TO authenticated USING (true);


--
-- Name: plantations Plantations visibles selon zone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Plantations visibles selon zone" ON public.plantations FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'pdg'::public.app_role) OR public.has_role(auth.uid(), 'directeur_general'::public.app_role) OR true));


--
-- Name: profiles Profiles visibles par tous les utilisateurs authentifiés; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles visibles par tous les utilisateurs authentifiés" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: promotions Promotions visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Promotions visibles par tous" ON public.promotions FOR SELECT TO authenticated USING (true);


--
-- Name: rapports_suivi Rapports visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Rapports visibles par tous" ON public.rapports_suivi FOR SELECT USING (true);


--
-- Name: recoltes Recoltes visibles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Recoltes visibles" ON public.recoltes FOR SELECT TO authenticated USING (true);


--
-- Name: regions Regions visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Regions visibles par tous" ON public.regions FOR SELECT TO authenticated USING (true);


--
-- Name: sous_prefectures Sous prefectures visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sous prefectures visibles par tous" ON public.sous_prefectures FOR SELECT TO authenticated USING (true);


--
-- Name: souscripteurs Souscripteurs visibles selon zone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Souscripteurs visibles selon zone" ON public.souscripteurs FOR SELECT USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'pdg'::public.app_role) OR public.has_role(auth.uid(), 'directeur_general'::public.app_role) OR true));


--
-- Name: districts Super admins gèrent districts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins gèrent districts" ON public.districts USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: departements_entreprise Super admins gèrent départements entreprise; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins gèrent départements entreprise" ON public.departements_entreprise TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: promotions Super admins gèrent promotions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins gèrent promotions" ON public.promotions TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: equipes Super admins gèrent équipes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins gèrent équipes" ON public.equipes USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: departements Super admins peuvent gérer départements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins peuvent gérer départements" ON public.departements TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: user_roles Super admins peuvent gérer les rôles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins peuvent gérer les rôles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: regions Super admins peuvent gérer régions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins peuvent gérer régions" ON public.regions TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: profiles Super admins peuvent tout faire sur profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins peuvent tout faire sur profiles" ON public.profiles TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: historique_actions Système peut créer historique; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Système peut créer historique" ON public.historique_actions FOR INSERT WITH CHECK (true);


--
-- Name: interventions_techniques Techniciens créent interventions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Techniciens créent interventions" ON public.interventions_techniques FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'technicien'::public.app_role) OR public.has_role(auth.uid(), 'responsable_operations'::public.app_role)));


--
-- Name: rapports_suivi Techniciens créent rapports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Techniciens créent rapports" ON public.rapports_suivi FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'technicien'::public.app_role) OR (auth.uid() = technicien_id)));


--
-- Name: tickets_techniques Tickets visibles par tous les authentifiés; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tickets visibles par tous les authentifiés" ON public.tickets_techniques FOR SELECT TO authenticated USING (true);


--
-- Name: photos_plantation Upload photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Upload photos" ON public.photos_plantation FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'technicien'::public.app_role) OR public.has_role(auth.uid(), 'commercial'::public.app_role)));


--
-- Name: user_roles User roles visibles par authentifiés; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User roles visibles par authentifiés" ON public.user_roles FOR SELECT TO authenticated USING (true);


--
-- Name: retraits_portefeuille Utilisateurs créent retraits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Utilisateurs créent retraits" ON public.retraits_portefeuille FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: souscriptions_brouillon Utilisateurs gèrent leurs brouillons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Utilisateurs gèrent leurs brouillons" ON public.souscriptions_brouillon USING ((auth.uid() = created_by)) WITH CHECK ((auth.uid() = created_by));


--
-- Name: profiles Utilisateurs peuvent modifier leur profil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Utilisateurs peuvent modifier leur profil" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: commissions Voir ses propres commissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Voir ses propres commissions" ON public.commissions FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'responsable_zone'::public.app_role)));


--
-- Name: retraits_portefeuille Voir ses propres retraits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Voir ses propres retraits" ON public.retraits_portefeuille FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role)));


--
-- Name: portefeuilles Voir son propre portefeuille; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Voir son propre portefeuille" ON public.portefeuilles FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role)));


--
-- Name: audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: commissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

--
-- Name: departements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.departements ENABLE ROW LEVEL SECURITY;

--
-- Name: departements_entreprise; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.departements_entreprise ENABLE ROW LEVEL SECURITY;

--
-- Name: districts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

--
-- Name: equipes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

--
-- Name: historique_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.historique_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: interventions_techniques; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.interventions_techniques ENABLE ROW LEVEL SECURITY;

--
-- Name: paiements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;

--
-- Name: photos_plantation; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.photos_plantation ENABLE ROW LEVEL SECURITY;

--
-- Name: plantations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plantations ENABLE ROW LEVEL SECURITY;

--
-- Name: portefeuilles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portefeuilles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: promotions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

--
-- Name: rapports_suivi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rapports_suivi ENABLE ROW LEVEL SECURITY;

--
-- Name: recoltes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recoltes ENABLE ROW LEVEL SECURITY;

--
-- Name: regions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

--
-- Name: retraits_portefeuille; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.retraits_portefeuille ENABLE ROW LEVEL SECURITY;

--
-- Name: sous_prefectures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sous_prefectures ENABLE ROW LEVEL SECURITY;

--
-- Name: souscripteurs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.souscripteurs ENABLE ROW LEVEL SECURITY;

--
-- Name: souscriptions_brouillon; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.souscriptions_brouillon ENABLE ROW LEVEL SECURITY;

--
-- Name: tickets_techniques; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tickets_techniques ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: equipes Équipes visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Équipes visibles par tous" ON public.equipes FOR SELECT USING (true);


--
-- PostgreSQL database dump complete
--


