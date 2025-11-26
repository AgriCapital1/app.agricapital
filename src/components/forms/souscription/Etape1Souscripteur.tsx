import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";

// Validation helpers
const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateText = (text: string, minLength: number, maxLength: number) => 
  text && text.length >= minLength && text.length <= maxLength;

interface Etape1Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export const Etape1Souscripteur = ({ formData, updateFormData }: Etape1Props) => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [sousPrefectures, setSousPrefectures] = useState<any[]>([]);
  
  const [photoRectoPreview, setPhotoRectoPreview] = useState<string>("");
  const [photoVersoPreview, setPhotoVersoPreview] = useState<string>("");
  const [photoProfilPreview, setPhotoProfilPreview] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: any) => {
    const errors = { ...validationErrors };
    
    switch(field) {
      case 'telephone':
      case 'whatsapp':
        if (value && !validatePhone(value)) {
          errors[field] = "Doit contenir exactement 10 chiffres";
        } else {
          delete errors[field];
        }
        break;
      case 'email':
        if (value && !validateEmail(value)) {
          errors[field] = "Email invalide";
        } else {
          delete errors[field];
        }
        break;
      case 'nom_complet':
      case 'prenoms':
        if (!validateText(value, 2, 100)) {
          errors[field] = "Doit contenir entre 2 et 100 caractères";
        } else {
          delete errors[field];
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
    validateField(field, value);
  };

  // Charger les districts
  useEffect(() => {
    const fetchDistricts = async () => {
      const { data } = await (supabase as any)
        .from("districts")
        .select("*")
        .eq("est_actif", true)
        .order("nom");
      if (data) setDistricts(data);
    };
    fetchDistricts();
  }, []);

  // Charger régions quand district change
  useEffect(() => {
    if (formData.district_id) {
      const fetchRegions = async () => {
        const { data } = await (supabase as any)
          .from("regions")
          .select("*")
          .eq("district_id", formData.district_id)
          .eq("est_active", true)
          .order("nom");
        if (data) setRegions(data);
      };
      fetchRegions();
    }
  }, [formData.district_id]);

  // Charger départements quand région change
  useEffect(() => {
    if (formData.region_id) {
      const fetchDepartements = async () => {
        const { data } = await (supabase as any)
          .from("departements")
          .select("*")
          .eq("region_id", formData.region_id)
          .eq("est_actif", true)
          .order("nom");
        if (data) setDepartements(data);
      };
      fetchDepartements();
    }
  }, [formData.region_id]);

  // Charger sous-préfectures quand département change
  useEffect(() => {
    if (formData.departement_id) {
      const fetchSousPrefectures = async () => {
        const { data } = await (supabase as any)
          .from("sous_prefectures")
          .select("*")
          .eq("departement_id", formData.departement_id)
          .eq("est_active", true)
          .order("nom");
        if (data) setSousPrefectures(data);
      };
      fetchSousPrefectures();
    }
  }, [formData.departement_id]);

  const handleFileChange = (field: string, file: File | null) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (field === "photo_piece_recto") {
        setPhotoRectoPreview(preview);
        updateFormData({ photo_piece_recto_file: file, photo_piece_recto_preview: preview });
      } else if (field === "photo_piece_verso") {
        setPhotoVersoPreview(preview);
        updateFormData({ photo_piece_verso_file: file, photo_piece_verso_preview: preview });
      } else if (field === "photo_profil") {
        setPhotoProfilPreview(preview);
        updateFormData({ photo_profil_file: file, photo_profil_preview: preview });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = (field: string) => {
    if (field === "photo_piece_recto") {
      setPhotoRectoPreview("");
      updateFormData({ photo_piece_recto_file: null, photo_piece_recto_preview: null });
    } else if (field === "photo_piece_verso") {
      setPhotoVersoPreview("");
      updateFormData({ photo_piece_verso_file: null, photo_piece_verso_preview: null });
    } else if (field === "photo_profil") {
      setPhotoProfilPreview("");
      updateFormData({ photo_profil_file: null, photo_profil_preview: null });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identité du Souscripteur</CardTitle>
          <CardDescription>Informations personnelles obligatoires</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="civilite">Civilité *</Label>
              <Select
                value={formData.civilite}
                onValueChange={(value) => updateFormData({ civilite: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">M.</SelectItem>
                  <SelectItem value="Mme">Mme</SelectItem>
                  <SelectItem value="Mlle">Mlle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom_famille">Nom de famille *</Label>
              <Input
                id="nom_famille"
                value={formData.nom_famille}
                onChange={(e) => updateFormData({ nom_famille: e.target.value })}
                placeholder="KOFFI"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenoms">Prénoms *</Label>
              <Input
                id="prenoms"
                value={formData.prenoms}
                onChange={(e) => handleInputChange('prenoms', e.target.value)}
                placeholder="Inocent"
                required
              />
              {validationErrors.prenoms && <p className="text-sm text-destructive mt-1">{validationErrors.prenoms}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_naissance">Date de naissance *</Label>
              <Input
                id="date_naissance"
                type="date"
                value={formData.date_naissance}
                onChange={(e) => updateFormData({ date_naissance: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lieu_naissance">Lieu de naissance *</Label>
              <Input
                id="lieu_naissance"
                value={formData.lieu_naissance}
                onChange={(e) => updateFormData({ lieu_naissance: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut_marital">Situation matrimoniale *</Label>
            <Select
              value={formData.statut_marital}
              onValueChange={(value) => updateFormData({ statut_marital: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celibataire">Célibataire</SelectItem>
                <SelectItem value="marie">Marié(e)</SelectItem>
                <SelectItem value="divorce">Divorcé(e)</SelectItem>
                <SelectItem value="veuf">Veuf(ve)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pièce d'identité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type_piece">Type de pièce *</Label>
              <Select
                value={formData.type_piece}
                onValueChange={(value) => updateFormData({ type_piece: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cni">CNI</SelectItem>
                  <SelectItem value="passeport">Passeport</SelectItem>
                  <SelectItem value="attestation">Attestation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_piece">Numéro de pièce *</Label>
              <Input
                id="numero_piece"
                value={formData.numero_piece}
                onChange={(e) => updateFormData({ numero_piece: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_delivrance_piece">Date de délivrance *</Label>
              <Input
                id="date_delivrance_piece"
                type="date"
                value={formData.date_delivrance_piece}
                onChange={(e) => updateFormData({ date_delivrance_piece: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Photo Recto */}
          <div className="space-y-2">
            <Label>Photo de la pièce - Recto *</Label>
            {!photoRectoPreview ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange("photo_piece_recto", e.target.files?.[0] || null)}
                  className="hidden"
                  id="recto-upload"
                />
                <Label htmlFor="recto-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <div className="text-4xl">📎</div>
                    <p className="text-sm text-muted-foreground">Glisser-déposer ou cliquer pour parcourir</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG max 5MB</p>
                  </div>
                </Label>
              </div>
            ) : (
              <div className="relative border rounded-lg p-4">
                <img src={photoRectoPreview} alt="Recto" className="w-full h-48 object-contain" />
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => window.open(photoRectoPreview)}>
                    <Eye className="h-4 w-4 mr-1" /> Visualiser
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => clearFile("photo_piece_recto")}>
                    <X className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Photo Verso */}
          <div className="space-y-2">
            <Label>Photo de la pièce - Verso *</Label>
            {!photoVersoPreview ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange("photo_piece_verso", e.target.files?.[0] || null)}
                  className="hidden"
                  id="verso-upload"
                />
                <Label htmlFor="verso-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <div className="text-4xl">📎</div>
                    <p className="text-sm text-muted-foreground">Glisser-déposer ou cliquer pour parcourir</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG max 5MB</p>
                  </div>
                </Label>
              </div>
            ) : (
              <div className="relative border rounded-lg p-4">
                <img src={photoVersoPreview} alt="Verso" className="w-full h-48 object-contain" />
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => window.open(photoVersoPreview)}>
                    <Eye className="h-4 w-4 mr-1" /> Visualiser
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => clearFile("photo_piece_verso")}>
                    <X className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Photo Profil */}
          <div className="space-y-2">
            <Label>Photo profil (Portrait) *</Label>
            {!photoProfilPreview ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange("photo_profil", e.target.files?.[0] || null)}
                  className="hidden"
                  id="profil-upload"
                />
                <Label htmlFor="profil-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <div className="text-4xl">👤</div>
                    <p className="text-sm text-muted-foreground">Photo portrait du souscripteur</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG max 5MB</p>
                  </div>
                </Label>
              </div>
            ) : (
              <div className="relative border rounded-lg p-4">
                <img src={photoProfilPreview} alt="Profil" className="w-full h-48 object-contain" />
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => window.open(photoProfilPreview)}>
                    <Eye className="h-4 w-4 mr-1" /> Visualiser
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => clearFile("photo_profil")}>
                    <X className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localisation et Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Structure administrative */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Select
                value={formData.district_id}
                onValueChange={(value) => {
                  updateFormData({ district_id: value, region_id: null, departement_id: null, sous_prefecture_id: null });
                  setRegions([]);
                  setDepartements([]);
                  setSousPrefectures([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Région *</Label>
              <Select
                value={formData.region_id}
                onValueChange={(value) => {
                  updateFormData({ region_id: value, departement_id: null, sous_prefecture_id: null });
                  setDepartements([]);
                  setSousPrefectures([]);
                }}
                disabled={!formData.district_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la région" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="departement">Département *</Label>
              <Select
                value={formData.departement_id}
                onValueChange={(value) => {
                  updateFormData({ departement_id: value, sous_prefecture_id: null });
                  setSousPrefectures([]);
                }}
                disabled={!formData.region_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le département" />
                </SelectTrigger>
                <SelectContent>
                  {departements.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sous_prefecture">Sous-préfecture *</Label>
              <Select
                value={formData.sous_prefecture_id}
                onValueChange={(value) => updateFormData({ sous_prefecture_id: value })}
                disabled={!formData.departement_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la sous-préfecture" />
                </SelectTrigger>
                <SelectContent>
                  {sousPrefectures.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domicile">Adresse complète du domicile *</Label>
            <Input
              id="domicile"
              value={formData.domicile}
              onChange={(e) => updateFormData({ domicile: e.target.value })}
              placeholder="Quartier, rue, indication précise..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="0XXXXXXXXX"
                required
              />
              {validationErrors.telephone && <p className="text-sm text-destructive mt-1">{validationErrors.telephone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="0XXXXXXXXX"
                required
              />
              {validationErrors.whatsapp && <p className="text-sm text-destructive mt-1">{validationErrors.whatsapp}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="exemple@email.com"
            />
            {validationErrors.email && <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations Financières</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type_compte">Type de compte *</Label>
              <Select
                value={formData.type_compte}
                onValueChange={(value) => updateFormData({ type_compte: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bancaire">Bancaire</SelectItem>
                  <SelectItem value="Microfinance">Microfinance</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banque_operateur">Banque/Opérateur *</Label>
              <Input
                id="banque_operateur"
                value={formData.banque_operateur}
                onChange={(e) => updateFormData({ banque_operateur: e.target.value })}
                placeholder="Ex: MTN, Orange, SGCI..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_compte">Numéro de compte *</Label>
              <Input
                id="numero_compte"
                value={formData.numero_compte}
                onChange={(e) => updateFormData({ numero_compte: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom_beneficiaire">Nom du bénéficiaire *</Label>
              <Input
                id="nom_beneficiaire"
                value={formData.nom_beneficiaire}
                onChange={(e) => updateFormData({ nom_beneficiaire: e.target.value })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};