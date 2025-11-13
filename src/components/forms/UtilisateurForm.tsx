import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UtilisateurFormProps {
  utilisateur?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const ROLES = [
  "super_admin", "pdg", "directeur_general", "directeur_commercial",
  "responsable_zone", "chef_equipe", "commercial", "technicien",
  "responsable_operations", "responsable_service_client",
  "agent_service_client", "responsable_financier", "comptable"
];

const UtilisateurForm = ({ utilisateur, onSuccess, onCancel }: UtilisateurFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: utilisateur || {},
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    utilisateur?.user_roles?.map((r: any) => r.role) || []
  );
  const [regions, setRegions] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [sousPrefectures, setSousPrefectures] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [souscripteurs, setSouscripteurs] = useState<any[]>([]);
  const [selectedPortefeuille, setSelectedPortefeuille] = useState<string[]>([]);

  useEffect(() => {
    fetchRegions();
    fetchEquipes();
    fetchSouscripteurs();
  }, []);

  const fetchRegions = async () => {
    const { data } = await (supabase as any).from("regions").select("*").eq("est_active", true);
    setRegions(data || []);
  };

  const fetchDepartements = async (regionId: string) => {
    const { data } = await (supabase as any)
      .from("departements")
      .select("*")
      .eq("region_id", regionId)
      .eq("est_actif", true);
    setDepartements(data || []);
  };

  const fetchSousPrefectures = async (departementId: string) => {
    const { data } = await (supabase as any)
      .from("sous_prefectures")
      .select("*")
      .eq("departement_id", departementId)
      .eq("est_active", true);
    setSousPrefectures(data || []);
  };

  const fetchEquipes = async () => {
    const { data, error } = await (supabase as any).from("equipes").select("*").eq("est_active", true);
    if (!error && data) setEquipes(data);
  };

  const fetchSouscripteurs = async () => {
    const { data, error } = await (supabase as any).from("souscripteurs").select("id, nom_complet, id_unique");
    if (!error && data) setSouscripteurs(data);
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (utilisateur) {
        // Update existing user
        const { error: profileError } = await (supabase as any)
          .from("profiles")
          .update({
            nom_complet: data.nom_complet,
            email: data.email,
            telephone: data.telephone,
            whatsapp: data.whatsapp,
            poste: data.poste,
            departement: data.departement,
            equipe: data.equipe,
            statut_employe: data.statut_employe,
            taux_commission: data.taux_commission,
            date_embauche: data.date_embauche,
          })
          .eq("id", utilisateur.id);

        if (profileError) throw profileError;

        // Update roles
        await (supabase as any).from("user_roles").delete().eq("user_id", utilisateur.id);
        
        for (const role of selectedRoles) {
          await (supabase as any).from("user_roles").insert({
            user_id: utilisateur.id,
            role: role,
          });
        }

        toast({ title: "Succès", description: "Utilisateur modifié" });
      } else {
        // Create new user via edge function
        const { data: result, error } = await supabase.functions.invoke('create-user', {
          body: {
            username: data.username,
            email: data.email,
            password: data.password || '@AgriCapital2025', // Default password
            nom_complet: data.nom_complet,
            telephone: data.telephone,
            whatsapp: data.whatsapp,
            poste: data.poste,
            departement: data.departement,
            equipe: data.equipe,
            statut_employe: data.statut_employe || 'actif',
            taux_commission: data.taux_commission,
            date_embauche: data.date_embauche,
            roles: selectedRoles,
          }
        });

        if (error) throw error;
        if (!result.success) throw new Error(result.error);

        toast({ 
          title: "Succès", 
          description: `Utilisateur créé. Mot de passe par défaut: @AgriCapital2025` 
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const togglePortefeuille = (souscripteurId: string) => {
    setSelectedPortefeuille(prev =>
      prev.includes(souscripteurId)
        ? prev.filter(id => id !== souscripteurId)
        : [...prev, souscripteurId]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nom Complet *</Label>
            <Input {...register("nom_complet", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label>Username *</Label>
            <Input {...register("username", { required: true })} disabled={!!utilisateur} />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" {...register("email", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input {...register("telephone")} />
          </div>

          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input {...register("whatsapp")} />
          </div>

          <div className="space-y-2">
            <Label>Poste</Label>
            <Input {...register("poste")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hiérarchie et Équipe</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Département</Label>
            <Input {...register("departement")} />
          </div>

          <div className="space-y-2">
            <Label>Équipe</Label>
            <Select
              defaultValue={utilisateur?.equipe}
              onValueChange={(value) => setValue("equipe", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une équipe" />
              </SelectTrigger>
              <SelectContent>
                {equipes.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.nom} ({eq.type_equipe})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Région de Couverture</Label>
            <Select
              defaultValue={utilisateur?.region_id}
              onValueChange={(value) => {
                setValue("region_id", value);
                fetchDepartements(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une région" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Départements</Label>
            <Select onValueChange={(value) => fetchSousPrefectures(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner département" />
              </SelectTrigger>
              <SelectContent>
                {departements.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date d'Embauche</Label>
            <Input type="date" {...register("date_embauche")} />
          </div>

          <div className="space-y-2">
            <Label>Taux Commission (%)</Label>
            <Input type="number" step="0.01" {...register("taux_commission")} />
          </div>

          <div className="space-y-2">
            <Label>Statut Employé</Label>
            <Select
              defaultValue={utilisateur?.statut_employe || "actif"}
              onValueChange={(value) => setValue("statut_employe", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Rôles et Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 p-4 border rounded-lg">
            {ROLES.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                />
                <label htmlFor={role} className="text-sm cursor-pointer">
                  {role}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRoles.includes("commercial") && (
        <Card>
          <CardHeader>
            <CardTitle>Attribution de Portefeuille</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
              {souscripteurs.map((s) => (
                <div key={s.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={s.id}
                    checked={selectedPortefeuille.includes(s.id)}
                    onCheckedChange={() => togglePortefeuille(s.id)}
                  />
                  <label htmlFor={s.id} className="text-sm cursor-pointer">
                    {s.id_unique} - {s.nom_complet}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : utilisateur ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
};

export default UtilisateurForm;
