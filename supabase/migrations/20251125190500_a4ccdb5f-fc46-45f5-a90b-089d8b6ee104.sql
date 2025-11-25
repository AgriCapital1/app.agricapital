-- Créer des triggers de traçabilité pour toutes les tables importantes

-- Trigger pour souscripteurs (déjà existe mais on s'assure)
DROP TRIGGER IF EXISTS trg_souscripteurs_audit ON public.souscripteurs;
CREATE TRIGGER trg_souscripteurs_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.souscripteurs
  FOR EACH ROW
  EXECUTE FUNCTION public.create_historique_entry();

-- Trigger pour plantations
DROP TRIGGER IF EXISTS trg_plantations_historique ON public.plantations;
CREATE TRIGGER trg_plantations_historique
  AFTER INSERT OR UPDATE OR DELETE ON public.plantations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_historique_entry();

-- Créer fonction générique d'audit pour toutes les tables
CREATE OR REPLACE FUNCTION public.log_audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (
      table_name,
      action,
      record_id,
      user_id,
      new_data
    ) VALUES (
      TG_TABLE_NAME,
      'INSERT',
      NEW.id,
      auth.uid(),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (
      table_name,
      action,
      record_id,
      user_id,
      old_data,
      new_data
    ) VALUES (
      TG_TABLE_NAME,
      'UPDATE',
      NEW.id,
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (
      table_name,
      action,
      record_id,
      user_id,
      old_data
    ) VALUES (
      TG_TABLE_NAME,
      'DELETE',
      OLD.id,
      auth.uid(),
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Appliquer les triggers d'audit sur toutes les tables critiques
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_paiements AFTER INSERT OR UPDATE OR DELETE ON public.paiements FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_paiements_wave AFTER INSERT OR UPDATE OR DELETE ON public.paiements_wave FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_commissions AFTER INSERT OR UPDATE OR DELETE ON public.commissions FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_promotions AFTER INSERT OR UPDATE OR DELETE ON public.promotions FOR EACH ROW EXECUTE FUNCTION log_audit_changes();