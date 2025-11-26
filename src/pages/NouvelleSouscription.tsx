import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Etape1Souscripteur } from "@/components/forms/souscription/Etape1Souscripteur";
import { Etape2Cotitulaire } from "@/components/forms/souscription/Etape2Cotitulaire";
import { Etape3Parcelle } from "@/components/forms/souscription/Etape3Parcelle";
import { Etape4Enquete } from "@/components/forms/souscription/Etape4Enquete";
import { Etape5Documents } from "@/components/forms/souscription/Etape5Documents";
import { Etape6Confirmation } from "@/components/forms/souscription/Etape6Confirmation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NouvelleSouscription = () => {
  const [etapeActuelle, setEtapeActuelle] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [brouillonId, setBrouillonId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Charger le brouillon existant au montage
  useEffect(() => {
    const chargerBrouillon = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: brouillons } = await (supabase as any)
        .from("souscriptions_brouillon")
        .select("*")
        .eq("created_by", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (brouillons && brouillons.length > 0) {
        const brouillon = brouillons[0];
        setBrouillonId(brouillon.id);
        setFormData(brouillon.donnees);
        setEtapeActuelle(brouillon.etape_actuelle);
        toast({
          title: "Brouillon récupéré",
          description: "Reprise de votre souscription en cours",
        });
      }
    };

    chargerBrouillon();
  }, []);

  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const sauvegarderBrouillon = async (nouvelleEtape?: number) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const etape = nouvelleEtape || etapeActuelle;
      
      if (brouillonId) {
        // Mise à jour du brouillon existant
        const { error } = await (supabase as any)
          .from("souscriptions_brouillon")
          .update({
            etape_actuelle: etape,
            donnees: formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", brouillonId);

        if (error) throw error;
      } else {
        // Création d'un nouveau brouillon
        const { data, error } = await (supabase as any)
          .from("souscriptions_brouillon")
          .insert({
            etape_actuelle: etape,
            donnees: formData,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setBrouillonId(data.id);
      }

      toast({
        title: "Sauvegarde réussie",
        description: "Vos données ont été enregistrées",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de sauvegarde",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const passerEtapeSuivante = async () => {
    const nouvelleEtape = Math.min(6, etapeActuelle + 1);
    await sauvegarderBrouillon(nouvelleEtape);
    setEtapeActuelle(nouvelleEtape);
  };

  const passerEtapePrecedente = () => {
    setEtapeActuelle(Math.max(1, etapeActuelle - 1));
  };

  const soumettreFormulaire = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Créer le souscripteur (normalisation des enums en minuscules)
      const { data: souscripteur, error: errorSous } = await (supabase as any)
        .from("souscripteurs")
        .insert({
          civilite: formData.civilite?.toLowerCase(),
          nom_complet: formData.nom_famille || "",
          prenoms: formData.prenoms || "",
          date_naissance: formData.date_naissance,
          lieu_naissance: formData.lieu_naissance || "",
          type_piece: formData.type_piece?.toLowerCase(),
          numero_piece: formData.numero_piece,
          date_delivrance_piece: formData.date_delivrance_piece,
          fichier_piece_url: formData.fichier_piece_url || "",
          photo_profil_url: formData.photo_profil_url || "",
          statut_marital: formData.statut_marital?.toLowerCase(),
          conjoint_nom_prenoms: formData.cotit_nom_famille && formData.cotit_prenoms ? `${formData.cotit_nom_famille} ${formData.cotit_prenoms}` : null,
          conjoint_type_piece: formData.cotit_type_piece?.toLowerCase() || null,
          conjoint_numero_piece: formData.cotit_numero_piece || null,
          conjoint_date_delivrance: formData.cotit_date_delivrance || null,
          conjoint_telephone: formData.cotit_telephone || null,
          conjoint_whatsapp: formData.cotit_whatsapp || null,
          conjoint_photo_identite_url: formData.cotit_photo_cni || null,
          conjoint_photo_url: formData.cotit_photo_profil || null,
          domicile_residence: formData.domicile || "",
          telephone: formData.telephone || "",
          whatsapp: formData.whatsapp || "",
          email: formData.email || null,
          type_compte: formData.type_compte || null,
          numero_compte: formData.numero_compte || null,
          nom_beneficiaire: formData.nom_beneficiaire || null,
          banque_operateur: formData.banque_operateur || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (errorSous) throw errorSous;

      // Supprimer le brouillon
      if (brouillonId) {
        await (supabase as any).from("souscriptions_brouillon").delete().eq("id", brouillonId);
      }

      toast({
        title: "✅ Souscription enregistrée",
        description: `Référence: ${souscripteur.id_unique}`,
      });

      navigate("/planteurs");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const etapes = [
    { num: 1, titre: "Souscripteur", component: Etape1Souscripteur },
    { num: 2, titre: "Co-titulaire", component: Etape2Cotitulaire },
    { num: 3, titre: "Parcelle", component: Etape3Parcelle },
    { num: 4, titre: "Enquête", component: Etape4Enquete },
    { num: 5, titre: "Documents", component: Etape5Documents },
    { num: 6, titre: "Confirmation", component: Etape6Confirmation },
  ];

  const EtapeComponent = etapes[etapeActuelle - 1].component;

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Souscription</h1>
          <p className="text-muted-foreground">
            Formulaire d'enregistrement complet en 6 étapes - Sauvegarde automatique
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {etapes.map((etape) => (
            <Button
              key={etape.num}
              variant={etapeActuelle === etape.num ? "default" : "outline"}
              size="sm"
              onClick={() => setEtapeActuelle(etape.num)}
              className="min-w-fit"
            >
              {etape.num}. {etape.titre}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <EtapeComponent formData={formData} updateFormData={updateFormData} />
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={passerEtapePrecedente}
            disabled={etapeActuelle === 1 || saving}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>

          {etapeActuelle < 6 ? (
            <Button onClick={passerEtapeSuivante} disabled={saving}>
              {saving ? "Sauvegarde..." : "Suivant"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-primary"
              onClick={soumettreFormulaire}
              disabled={saving || !formData.contrat_lu}
            >
              {saving ? "Envoi en cours..." : "✓ SOUMETTRE DOSSIER COMPLET"}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NouvelleSouscription;
