import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface Etape4Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export const Etape4Enquete = ({ formData, updateFormData }: Etape4Props) => {
  const [previews, setPreviews] = useState<{[key: string]: string}>({});

  const handleFileSelect = (key: string, file: File) => {
    updateFormData({ [key]: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews({ ...previews, [key]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chef de village</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chef_nom">Nom de famille *</Label>
              <Input
                id="chef_nom"
                value={formData.chef_nom}
                onChange={(e) => updateFormData({ chef_nom: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chef_prenoms">Prénoms *</Label>
              <Input
                id="chef_prenoms"
                value={formData.chef_prenoms}
                onChange={(e) => updateFormData({ chef_prenoms: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chef_fonction">Fonction *</Label>
              <Select
                value={formData.chef_fonction}
                onValueChange={(value) => updateFormData({ chef_fonction: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chef village">Chef village</SelectItem>
                  <SelectItem value="Responsable quartier">Responsable quartier</SelectItem>
                  <SelectItem value="Délégué">Délégué</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chef_telephone">Téléphone *</Label>
              <Input
                id="chef_telephone"
                type="tel"
                value={formData.chef_telephone}
                onChange={(e) => updateFormData({ chef_telephone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chef_type_piece">Type de pièce *</Label>
              <Select
                value={formData.chef_type_piece}
                onValueChange={(value) => updateFormData({ chef_type_piece: value })}
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
              <Label htmlFor="chef_numero_piece">Numéro de pièce *</Label>
              <Input
                id="chef_numero_piece"
                value={formData.chef_numero_piece}
                onChange={(e) => updateFormData({ chef_numero_piece: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo CNI *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('chef_photo_cni_file', file);
              }}
              required
            />
            {previews.chef_photo_cni_file && (
              <div className="relative mt-2">
                <img src={previews.chef_photo_cni_file} alt="Aperçu CNI" className="w-full h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ chef_photo_cni_file: null });
                    setPreviews({ ...previews, chef_photo_cni_file: "" });
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Photo profil *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('chef_photo_profil_file', file);
              }}
              required
            />
            {previews.chef_photo_profil_file && (
              <div className="relative mt-2">
                <img src={previews.chef_photo_profil_file} alt="Aperçu profil" className="w-full h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ chef_photo_profil_file: null });
                    setPreviews({ ...previews, chef_photo_profil_file: "" });
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="chef_signature"
              checked={formData.chef_signature}
              onCheckedChange={(checked) => updateFormData({ chef_signature: checked })}
            />
            <Label htmlFor="chef_signature">J'approuve cette enquête *</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Témoin 1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temoin1_nom">Nom de famille *</Label>
              <Input
                id="temoin1_nom"
                value={formData.temoin1_nom}
                onChange={(e) => updateFormData({ temoin1_nom: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temoin1_prenoms">Prénoms *</Label>
              <Input
                id="temoin1_prenoms"
                value={formData.temoin1_prenoms}
                onChange={(e) => updateFormData({ temoin1_prenoms: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temoin1_fonction">Fonction *</Label>
              <Input
                id="temoin1_fonction"
                value={formData.temoin1_fonction}
                onChange={(e) => updateFormData({ temoin1_fonction: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temoin1_telephone">Téléphone *</Label>
              <Input
                id="temoin1_telephone"
                type="tel"
                value={formData.temoin1_telephone}
                onChange={(e) => updateFormData({ temoin1_telephone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temoin1_type_piece">Type de pièce *</Label>
              <Select
                value={formData.temoin1_type_piece}
                onValueChange={(value) => updateFormData({ temoin1_type_piece: value })}
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
              <Label htmlFor="temoin1_numero_piece">Numéro de pièce *</Label>
              <Input
                id="temoin1_numero_piece"
                value={formData.temoin1_numero_piece}
                onChange={(e) => updateFormData({ temoin1_numero_piece: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo CNI *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('temoin1_photo_cni_file', file);
              }}
              required
            />
            {previews.temoin1_photo_cni_file && (
              <div className="relative mt-2">
                <img src={previews.temoin1_photo_cni_file} alt="Aperçu CNI" className="w-full h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ temoin1_photo_cni_file: null });
                    setPreviews({ ...previews, temoin1_photo_cni_file: "" });
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Photo profil *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('temoin1_photo_profil_file', file);
              }}
              required
            />
            {previews.temoin1_photo_profil_file && (
              <div className="relative mt-2">
                <img src={previews.temoin1_photo_profil_file} alt="Aperçu profil" className="w-full h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ temoin1_photo_profil_file: null });
                    setPreviews({ ...previews, temoin1_photo_profil_file: "" });
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="temoin1_signature"
              checked={formData.temoin1_signature}
              onCheckedChange={(checked) => updateFormData({ temoin1_signature: checked })}
            />
            <Label htmlFor="temoin1_signature">J'atteste cette enquête *</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Témoin 2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temoin2_nom">Nom de famille *</Label>
              <Input
                id="temoin2_nom"
                value={formData.temoin2_nom}
                onChange={(e) => updateFormData({ temoin2_nom: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temoin2_prenoms">Prénoms *</Label>
              <Input
                id="temoin2_prenoms"
                value={formData.temoin2_prenoms}
                onChange={(e) => updateFormData({ temoin2_prenoms: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temoin2_fonction">Fonction *</Label>
              <Input
                id="temoin2_fonction"
                value={formData.temoin2_fonction}
                onChange={(e) => updateFormData({ temoin2_fonction: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temoin2_telephone">Téléphone *</Label>
              <Input
                id="temoin2_telephone"
                type="tel"
                value={formData.temoin2_telephone}
                onChange={(e) => updateFormData({ temoin2_telephone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temoin2_type_piece">Type de pièce *</Label>
              <Select
                value={formData.temoin2_type_piece}
                onValueChange={(value) => updateFormData({ temoin2_type_piece: value })}
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
              <Label htmlFor="temoin2_numero_piece">Numéro de pièce *</Label>
              <Input
                id="temoin2_numero_piece"
                value={formData.temoin2_numero_piece}
                onChange={(e) => updateFormData({ temoin2_numero_piece: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo CNI *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('temoin2_photo_cni_file', file);
              }}
              required
            />
            {previews.temoin2_photo_cni_file && (
              <div className="relative mt-2">
                <img src={previews.temoin2_photo_cni_file} alt="Aperçu CNI" className="w-full h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ temoin2_photo_cni_file: null });
                    setPreviews({ ...previews, temoin2_photo_cni_file: "" });
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Photo profil *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('temoin2_photo_profil_file', file);
              }}
              required
            />
            {previews.temoin2_photo_profil_file && (
              <div className="relative mt-2">
                <img src={previews.temoin2_photo_profil_file} alt="Aperçu profil" className="w-full h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ temoin2_photo_profil_file: null });
                    setPreviews({ ...previews, temoin2_photo_profil_file: "" });
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="temoin2_signature"
              checked={formData.temoin2_signature}
              onCheckedChange={(checked) => updateFormData({ temoin2_signature: checked })}
            />
            <Label htmlFor="temoin2_signature">J'atteste cette enquête *</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attestation et photo de groupe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="absence_litiges"
              checked={formData.absence_litiges}
              onCheckedChange={(checked) => updateFormData({ absence_litiges: checked })}
            />
            <Label htmlFor="absence_litiges">
              Je certifie qu'il n'existe aucun litige foncier *
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_attestation">Date attestation *</Label>
            <Input
              id="date_attestation"
              type="date"
              value={formData.date_attestation}
              onChange={(e) => updateFormData({ date_attestation: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Photo de groupe (OBLIGATOIRE) *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('photo_groupe_file', file);
              }}
              required
            />
            {previews.photo_groupe_file && (
              <div className="relative mt-2">
                <img src={previews.photo_groupe_file} alt="Aperçu groupe" className="w-full h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ photo_groupe_file: null });
                    setPreviews({ ...previews, photo_groupe_file: "" });
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Souscripteur + Co-titulaire + Chef + Témoin1 + Témoin2 + Technico-commercial
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
