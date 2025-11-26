import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface PlantationFormProps {
  plantation?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const PlantationForm = ({ plantation, onSuccess, onCancel }: PlantationFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: plantation || {},
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [souscripteurs, setSouscripteurs] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [sousPrefectures, setSousPrefectures] = useState<any[]>([]);
  const [documentPreview, setDocumentPreview] = useState<string>(plantation?.document_foncier_url || "");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSouscripteurs();
    fetchDistricts();
  }, []);

  const fetchSouscripteurs = async () => {
    const { data } = await (supabase as any)
      .from("souscripteurs")
      .select("id, nom_complet, id_unique")
      .order("nom_complet");
    setSouscripteurs(data || []);
  };

  const fetchDistricts = async () => {
    const { data } = await (supabase as any)
      .from("districts")
      .select("id, nom")
      .eq("est_actif", true)
      .order("nom");
    setDistricts(data || []);
  };

  const fetchRegions = async (districtId: string) => {
    const { data } = await (supabase as any)
      .from("regions")
      .select("id, nom, code")
      .eq("district_id", districtId)
      .eq("est_active", true)
      .order("nom");
    setRegions(data || []);
  };

  const fetchDepartements = async (regionId: string) => {
    const { data } = await (supabase as any)
      .from("departements")
      .select("id, nom, code")
      .eq("region_id", regionId)
      .eq("est_actif", true)
      .order("nom");
    setDepartements(data || []);
  };

  const fetchSousPrefectures = async (departementId: string) => {
    const { data } = await (supabase as any)
      .from("sous_prefectures")
      .select("id, nom, code")
      .eq("departement_id", departementId)
      .eq("est_active", true)
      .order("nom");
    setSousPrefectures(data || []);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(file.name);
      }
    }
  };

  const onSubmit = async (data: any) => {
    if (!user) return;
    setLoading(true);

    try {
      let document_foncier_url = plantation?.document_foncier_url;

      if (documentFile) {
        const result = await uploadFile("documents-fonciers", documentFile);
        if (result) document_foncier_url = result.url;
      }

      const payload = {
        ...data,
        document_foncier_url,
        created_by: plantation ? undefined : user.id,
        updated_by: user.id,
      };

      if (plantation) {
        const { error } = await (supabase as any)
          .from("plantations")
          .update(payload)
          .eq("id", plantation.id);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Plantation modifiée avec succès",
        });
      } else {
        const { error } = await (supabase as any)
          .from("plantations")
          .insert(payload);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Plantation créée avec succès",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 space-y-2">
          <Label>Nom de la Plantation *</Label>
          <Input {...register("nom_plantation", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label>Planteur *</Label>
          <Select
            defaultValue={plantation?.souscripteur_id}
            onValueChange={(value) => setValue("souscripteur_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un planteur" />
            </SelectTrigger>
            <SelectContent>
              {souscripteurs.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nom_complet} ({s.id_unique})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Superficie (ha) *</Label>
          <Input
            type="number"
            step="0.01"
            {...register("superficie_ha", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label>Nombre de Plants *</Label>
          <Input
            type="number"
            {...register("nombre_plants", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label>District *</Label>
          <Select
            defaultValue={plantation?.district_id}
            onValueChange={(value) => {
              setValue("district_id", value);
              fetchRegions(value);
              setValue("region_id", undefined);
              setValue("departement_id", undefined);
              setValue("sous_prefecture_id", undefined);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un district" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Région *</Label>
          <Select
            defaultValue={plantation?.region_id}
            onValueChange={(value) => {
              setValue("region_id", value);
              fetchDepartements(value);
              setValue("departement_id", undefined);
              setValue("sous_prefecture_id", undefined);
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
          <Label>Département *</Label>
          <Select
            defaultValue={plantation?.departement_id}
            onValueChange={(value) => {
              setValue("departement_id", value);
              fetchSousPrefectures(value);
              setValue("sous_prefecture_id", undefined);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un département" />
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
          <Label>Sous-Préfecture</Label>
          <Select
            defaultValue={plantation?.sous_prefecture_id}
            onValueChange={(value) => setValue("sous_prefecture_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une sous-préfecture" />
            </SelectTrigger>
            <SelectContent>
              {sousPrefectures.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  {sp.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Village *</Label>
          <Input {...register("village_nom", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label>Latitude</Label>
          <Input type="number" step="0.000001" {...register("latitude")} />
        </div>

        <div className="space-y-2">
          <Label>Longitude</Label>
          <Input type="number" step="0.000001" {...register("longitude")} />
        </div>

        <div className="space-y-2">
          <Label>Altitude (m)</Label>
          <Input type="number" {...register("altitude")} />
        </div>

        <div className="space-y-2">
          <Label>Type de Document Foncier *</Label>
          <Select
            defaultValue={plantation?.document_foncier_type}
            onValueChange={(value) => setValue("document_foncier_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="titre_foncier">Titre Foncier</SelectItem>
              <SelectItem value="certificat_foncier">Certificat Foncier</SelectItem>
              <SelectItem value="contrat_metayage">Contrat Métayage</SelectItem>
              <SelectItem value="autorisation">Autorisation d'exploiter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Numéro du Document *</Label>
          <Input {...register("document_foncier_numero", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label>Date de Délivrance *</Label>
          <Input
            type="date"
            {...register("document_foncier_date_delivrance", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label>Date de Signature Contrat *</Label>
          <Input
            type="date"
            {...register("date_signature_contrat", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label>Chef de Village *</Label>
          <Input {...register("chef_village_nom", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label>Téléphone Chef Village *</Label>
          <Input {...register("chef_village_telephone", { required: true })} />
        </div>

        <Card className="col-span-3">
          <CardContent className="pt-6">
            <Label>Document Foncier *</Label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleDocumentChange}
              className="mt-2 w-full"
            />
            {documentPreview && (
              <div className="mt-3 relative">
                {documentPreview.startsWith('data:image') || documentPreview.includes('.jpg') || documentPreview.includes('.png') ? (
                  <img
                    src={documentPreview}
                    alt="Document foncier"
                    className="w-full h-48 object-contain rounded border"
                  />
                ) : (
                  <div className="p-4 bg-muted rounded border text-sm">
                    📄 {typeof documentPreview === 'string' && documentPreview.includes('/') ? 'Document chargé' : documentPreview}
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setDocumentPreview("");
                    setDocumentFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-2">
          <Label>Notes Internes</Label>
          <Textarea {...register("notes_internes")} rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : plantation ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
};

export default PlantationForm;
