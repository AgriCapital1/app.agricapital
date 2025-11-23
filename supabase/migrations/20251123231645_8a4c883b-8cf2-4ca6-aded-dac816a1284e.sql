-- =====================================================
-- TABLES POUR LES PARAMÈTRES DE LA PLATEFORME
-- Domaine: app.agricapital.ci
-- =====================================================

-- Table pour la configuration système
CREATE TABLE IF NOT EXISTS public.configuration_systeme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cle TEXT NOT NULL UNIQUE,
  valeur TEXT NOT NULL,
  description TEXT,
  categorie TEXT NOT NULL,
  type_donnee TEXT NOT NULL DEFAULT 'text',
  modifiable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Configuration par défaut
INSERT INTO public.configuration_systeme (cle, valeur, description, categorie, type_donnee, modifiable) VALUES
('platform_url', 'https://app.agricapital.ci', 'URL principale de la plateforme', 'general', 'url', true),
('platform_name', 'AgriCapital', 'Nom de la plateforme', 'general', 'text', true),
('support_email', 'support@agricapital.ci', 'Email du support', 'contact', 'email', true),
('support_phone', '+225 XX XX XX XX XX', 'Téléphone du support', 'contact', 'phone', true),
('da_montant_defaut', '30000', 'Montant par défaut du droit d''accès (FCFA)', 'paiements', 'number', true),
('contribution_mensuelle', '1700', 'Montant contribution mensuelle (FCFA)', 'paiements', 'number', true),
('contribution_trimestrielle', '5000', 'Montant contribution trimestrielle (FCFA)', 'paiements', 'number', true),
('contribution_annuelle', '20000', 'Montant contribution annuelle (FCFA)', 'paiements', 'number', true),
('taux_commission_defaut', '2.5', 'Taux de commission par défaut (%)', 'commissions', 'number', true),
('redevance_agricapital', '20', 'Taux de redevance AgriCapital (%)', 'plantations', 'number', true),
('email_notifications_actif', 'true', 'Activer les notifications email', 'notifications', 'boolean', true),
('sms_notifications_actif', 'true', 'Activer les notifications SMS', 'notifications', 'boolean', true),
('whatsapp_notifications_actif', 'true', 'Activer les notifications WhatsApp', 'notifications', 'boolean', true);

-- Table pour les templates de notifications
CREATE TABLE IF NOT EXISTS public.templates_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  description TEXT,
  type_notification TEXT NOT NULL CHECK (type_notification IN ('email', 'sms', 'whatsapp')),
  sujet TEXT,
  contenu TEXT NOT NULL,
  variables_disponibles TEXT[],
  est_actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Templates par défaut
INSERT INTO public.templates_notifications (code, nom, description, type_notification, sujet, contenu, variables_disponibles) VALUES
('welcome_email', 'Email de bienvenue', 'Envoyé lors de la création d''un compte utilisateur', 'email', 'Bienvenue sur AgriCapital', 'Bonjour {{nom_complet}},\n\nBienvenue sur la plateforme AgriCapital!\n\nVotre compte a été créé avec succès.\nIdentifiant: {{username}}\n\nConnectez-vous sur: https://app.agricapital.ci\n\nCordialement,\nL''équipe AgriCapital', ARRAY['nom_complet', 'username', 'email']),
('souscription_validee', 'Souscription validée', 'Confirmation de validation d''une souscription', 'sms', NULL, 'Bonjour {{nom_prenoms}}, votre souscription {{id_unique}} a été validée. Montant DA: {{montant_da}} FCFA. Merci de votre confiance. AgriCapital', ARRAY['nom_prenoms', 'id_unique', 'montant_da']),
('paiement_recu', 'Paiement reçu', 'Confirmation de réception d''un paiement', 'sms', NULL, 'Paiement de {{montant}} FCFA reçu pour {{type_paiement}}. Référence: {{id_transaction}}. Merci! AgriCapital', ARRAY['montant', 'type_paiement', 'id_transaction']),
('rappel_contribution', 'Rappel contribution', 'Rappel pour le paiement des contributions', 'whatsapp', NULL, 'Bonjour {{nom_prenoms}},\n\nRappel: Votre contribution pour {{periode}} est en attente.\nMontant: {{montant_du}} FCFA\n\nPour payer: https://app.agricapital.ci/paiements\n\nMerci!', ARRAY['nom_prenoms', 'periode', 'montant_du']);

-- Table pour les champs personnalisés
CREATE TABLE IF NOT EXISTS public.champs_personnalises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_champ TEXT NOT NULL,
  libelle TEXT NOT NULL,
  formulaire_cible TEXT NOT NULL CHECK (formulaire_cible IN ('utilisateur', 'planteur', 'plantation', 'paiement', 'intervention')),
  type_champ TEXT NOT NULL CHECK (type_champ IN ('texte', 'nombre', 'date', 'liste', 'fichier', 'booleen', 'email', 'telephone')),
  options_liste TEXT[],
  obligatoire BOOLEAN DEFAULT false,
  ordre INTEGER DEFAULT 0,
  est_actif BOOLEAN DEFAULT true,
  valeur_defaut TEXT,
  validation_regex TEXT,
  message_aide TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Table pour stocker les valeurs des champs personnalisés
CREATE TABLE IF NOT EXISTS public.valeurs_champs_personnalises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  champ_id UUID REFERENCES public.champs_personnalises(id) ON DELETE CASCADE,
  entite_type TEXT NOT NULL,
  entite_id UUID NOT NULL,
  valeur TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(champ_id, entite_type, entite_id)
);

-- Table pour les définitions de statuts (pour personnalisation future)
CREATE TABLE IF NOT EXISTS public.definitions_statuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie TEXT NOT NULL CHECK (categorie IN ('plantation', 'souscripteur', 'paiement', 'ticket', 'commission')),
  code TEXT NOT NULL,
  libelle TEXT NOT NULL,
  description TEXT,
  couleur TEXT NOT NULL DEFAULT '#6B7280',
  icone TEXT,
  ordre INTEGER DEFAULT 0,
  est_actif BOOLEAN DEFAULT true,
  est_final BOOLEAN DEFAULT false,
  permet_modification BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(categorie, code)
);

-- Statuts par défaut pour plantations
INSERT INTO public.definitions_statuts (categorie, code, libelle, description, couleur, ordre, est_final) VALUES
('plantation', 'en_attente_da', 'En attente DA', 'En attente du paiement du droit d''accès', '#F59E0B', 1, false),
('plantation', 'da_valide', 'DA validé', 'Droit d''accès validé', '#10B981', 2, false),
('plantation', 'en_delimitation_gps', 'En délimitation GPS', 'Délimitation GPS en cours', '#3B82F6', 3, false),
('plantation', 'en_piquetage', 'En piquetage', 'Piquetage en cours', '#3B82F6', 4, false),
('plantation', 'en_plantation', 'En plantation', 'Mise en terre en cours', '#8B5CF6', 5, false),
('plantation', 'en_croissance', 'En croissance', 'Phase de croissance', '#06B6D4', 6, false),
('plantation', 'en_production', 'En production', 'Plantation en production', '#10B981', 7, false),
('plantation', 'autonomie', 'Autonomie', 'Plantation autonome', '#059669', 8, true),
('plantation', 'suspendue', 'Suspendue', 'Plantation suspendue temporairement', '#EF4444', 9, false),
('plantation', 'resiliee', 'Résiliée', 'Contrat résilié', '#991B1B', 10, true);

-- RLS Policies pour configuration_systeme
ALTER TABLE public.configuration_systeme ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Configuration visible par tous authentifiés"
ON public.configuration_systeme FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins peuvent gérer configuration"
ON public.configuration_systeme FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies pour templates_notifications
ALTER TABLE public.templates_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates visibles par tous authentifiés"
ON public.templates_notifications FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins et responsables gèrent templates"
ON public.templates_notifications FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'responsable_service_client'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'responsable_service_client'::app_role)
);

-- RLS Policies pour champs_personnalises
ALTER TABLE public.champs_personnalises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Champs personnalisés visibles par tous"
ON public.champs_personnalises FOR SELECT
TO authenticated
USING (est_actif = true);

CREATE POLICY "Super admins gèrent champs personnalisés"
ON public.champs_personnalises FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies pour valeurs_champs_personnalises
ALTER TABLE public.valeurs_champs_personnalises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Valeurs champs visibles par tous"
ON public.valeurs_champs_personnalises FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Utilisateurs peuvent gérer valeurs champs"
ON public.valeurs_champs_personnalises FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Utilisateurs peuvent modifier valeurs champs"
ON public.valeurs_champs_personnalises FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies pour definitions_statuts
ALTER TABLE public.definitions_statuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Statuts visibles par tous authentifiés"
ON public.definitions_statuts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins gèrent définitions statuts"
ON public.definitions_statuts FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Triggers pour updated_at
CREATE TRIGGER update_configuration_systeme_updated_at
  BEFORE UPDATE ON public.configuration_systeme
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_notifications_updated_at
  BEFORE UPDATE ON public.templates_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_champs_personnalises_updated_at
  BEFORE UPDATE ON public.champs_personnalises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_valeurs_champs_personnalises_updated_at
  BEFORE UPDATE ON public.valeurs_champs_personnalises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_definitions_statuts_updated_at
  BEFORE UPDATE ON public.definitions_statuts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction utilitaire pour récupérer une configuration
CREATE OR REPLACE FUNCTION public.get_config(p_cle TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT valeur FROM public.configuration_systeme WHERE cle = p_cle LIMIT 1;
$$;