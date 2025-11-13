-- Table pour les paiements Wave
CREATE TABLE IF NOT EXISTS public.paiements_wave (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_wave_id TEXT UNIQUE NOT NULL,
  telephone TEXT NOT NULL,
  souscripteur_id UUID REFERENCES public.souscripteurs(id),
  montant_paye NUMERIC NOT NULL,
  type_paiement TEXT NOT NULL CHECK (type_paiement IN ('droit_acces', 'contribution_annuelle')),
  date_paiement TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'echoue')),
  donnees_wave JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherches rapides
CREATE INDEX idx_paiements_wave_telephone ON public.paiements_wave(telephone);
CREATE INDEX idx_paiements_wave_souscripteur ON public.paiements_wave(souscripteur_id);
CREATE INDEX idx_paiements_wave_transaction ON public.paiements_wave(transaction_wave_id);
CREATE INDEX idx_paiements_wave_date ON public.paiements_wave(date_paiement DESC);

-- Activer RLS
ALTER TABLE public.paiements_wave ENABLE ROW LEVEL SECURITY;

-- Politique: visible par tous authentifiés
CREATE POLICY "Paiements Wave visibles par authentifiés"
ON public.paiements_wave
FOR SELECT
TO authenticated
USING (true);

-- Politique: insertion via edge function
CREATE POLICY "Insertion paiements Wave via service"
ON public.paiements_wave
FOR INSERT
TO service_role
WITH CHECK (true);

-- Trigger pour updated_at
CREATE TRIGGER update_paiements_wave_updated_at
BEFORE UPDATE ON public.paiements_wave
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer le montant DA avec promotion
CREATE OR REPLACE FUNCTION public.get_montant_da_wave(superficie_ha NUMERIC)
RETURNS TABLE(
  montant_unitaire NUMERIC,
  montant_total NUMERIC,
  promotion_active BOOLEAN,
  nom_promotion TEXT,
  reduction_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo RECORD;
  v_montant_base NUMERIC := 30000;
  v_montant_unitaire NUMERIC;
  v_montant_total NUMERIC;
BEGIN
  -- Chercher promotion active
  SELECT * INTO v_promo
  FROM public.promotions
  WHERE statut = 'ACTIF'
    AND date_debut <= now()
    AND date_fin >= now()
  ORDER BY date_debut DESC
  LIMIT 1;
  
  IF v_promo.id IS NOT NULL THEN
    v_montant_unitaire := v_promo.montant_reduit_ha;
    v_montant_total := superficie_ha * v_promo.montant_reduit_ha;
    
    RETURN QUERY SELECT 
      v_montant_unitaire,
      v_montant_total,
      true as promotion_active,
      v_promo.nom_promotion,
      v_promo.reduction_pct;
  ELSE
    v_montant_total := superficie_ha * v_montant_base;
    
    RETURN QUERY SELECT 
      v_montant_base as montant_unitaire,
      v_montant_total,
      false as promotion_active,
      NULL::TEXT as nom_promotion,
      0::NUMERIC as reduction_pct;
  END IF;
END;
$$;

-- Fonction pour calculer statut contribution annuelle
CREATE OR REPLACE FUNCTION public.calculer_statut_contribution(
  p_souscripteur_id UUID,
  p_montant_total_paye NUMERIC
)
RETURNS TABLE(
  jours_couverts NUMERIC,
  jours_restants_annee NUMERIC,
  statut TEXT,
  montant_recommande NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_taux_jour CONSTANT NUMERIC := 65;
  v_jours_annee CONSTANT NUMERIC := 365;
  v_jours_couverts NUMERIC;
  v_jours_restants NUMERIC;
  v_statut TEXT;
  v_montant_recommande NUMERIC;
BEGIN
  -- Calculer jours couverts
  v_jours_couverts := FLOOR(p_montant_total_paye / v_taux_jour);
  
  -- Calculer jours restants
  v_jours_restants := v_jours_annee - v_jours_couverts;
  
  -- Déterminer statut
  IF v_jours_restants < 0 THEN
    v_statut := 'en_avance';
    v_montant_recommande := 0;
  ELSIF v_jours_restants = 0 THEN
    v_statut := 'a_jour';
    v_montant_recommande := 0;
  ELSE
    v_statut := 'en_arriere';
    -- Suggérer paiement mensuel standard
    v_montant_recommande := 1900;
  END IF;
  
  RETURN QUERY SELECT 
    v_jours_couverts,
    v_jours_restants,
    v_statut,
    v_montant_recommande;
END;
$$;