-- Ajouter les configurations système manquantes
INSERT INTO public.configuration_systeme (cle, valeur, description, categorie, type_donnee, modifiable) 
VALUES
  ('support_email', 'support@agricapital.ci', 'Email du support technique', 'contact', 'email', true),
  ('support_phone', '+225 07 59 56 60 87', 'Téléphone du support', 'contact', 'text', true),
  ('whatsapp_support', '+225 07 59 56 60 87', 'WhatsApp du support', 'contact', 'text', true),
  ('domain_url', 'https://app.agricapital.ci', 'URL du domaine de la plateforme', 'general', 'url', false),
  ('smtp_host', '', 'Serveur SMTP pour envoi emails', 'notifications', 'text', true),
  ('smtp_port', '587', 'Port SMTP', 'notifications', 'number', true),
  ('smtp_user', '', 'Utilisateur SMTP', 'notifications', 'email', true),
  ('sms_api_key', '', 'Clé API SMS', 'notifications', 'text', true),
  ('whatsapp_api_key', '', 'Clé API WhatsApp Business', 'notifications', 'text', true),
  ('taux_commission_souscription', '2500', 'Commission par hectare pour souscription (FCFA)', 'commissions', 'number', true),
  ('taux_commission_renouvellement', '1000', 'Commission par hectare pour renouvellement (FCFA)', 'commissions', 'number', true),
  ('penalite_retard_pct', '10', 'Pénalité en % pour retard de paiement', 'paiements', 'number', true),
  ('delai_paiement_jours', '30', 'Délai de paiement en jours', 'paiements', 'number', true)
ON CONFLICT (cle) DO NOTHING;