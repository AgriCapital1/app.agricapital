import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import FileUpload from "@/components/ui/file-upload";
import { X } from "lucide-react";

interface Etape2Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export const Etape2Cotitulaire = ({ formData, updateFormData }: Etape2Props) => {
  const [pieceRectoPreview, setPieceRectoPreview] = useState<string>("");
  const [pieceVersoPreview, setPieceVersoPreview] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const handleFileSelect = (file: File, field: string, setPreview: (url: string) => void) => {
    updateFormData({ [field]: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Co-titulaire (OBLIGATOIRE)</CardTitle>
          <CardDescription>
            Le co-titulaire est obligatoire pour toute souscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_cotitulaire"
              checked={true}
              disabled
            />
            <Label htmlFor="has_cotitulaire" className="text-sm font-normal">
              J'ajoute un co-titulaire (obligatoire)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identité du co-titulaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cotit_civilite">Civilité *</Label>
              <Select
                value={formData.cotit_civilite}
                onValueChange={(value) => updateFormData({ cotit_civilite: value })}
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
              <Label htmlFor="cotit_nom_famille">Nom de famille *</Label>
              <Input
                id="cotit_nom_famille"
                value={formData.cotit_nom_famille}
                onChange={(e) => updateFormData({ cotit_nom_famille: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cotit_prenoms">Prénoms *</Label>
              <Input
                id="cotit_prenoms"
                value={formData.cotit_prenoms}
                onChange={(e) => updateFormData({ cotit_prenoms: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cotit_date_naissance">Date de naissance *</Label>
              <Input
                id="cotit_date_naissance"
                type="date"
                value={formData.cotit_date_naissance}
                onChange={(e) => updateFormData({ cotit_date_naissance: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cotit_relation">Relation avec souscripteur *</Label>
              <Select
                value={formData.cotit_relation}
                onValueChange={(value) => updateFormData({ cotit_relation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conjoint">Conjoint</SelectItem>
                  <SelectItem value="Enfant majeur">Enfant majeur</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Frère/Sœur">Frère/Sœur</SelectItem>
                  <SelectItem value="Associé">Associé</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pièce d'identité du co-titulaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cotit_type_piece">Type de pièce *</Label>
              <Select
                value={formData.cotit_type_piece}
                onValueChange={(value) => updateFormData({ cotit_type_piece: value })}
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
              <Label htmlFor="cotit_numero_piece">Numéro de pièce *</Label>
              <Input
                id="cotit_numero_piece"
                value={formData.cotit_numero_piece}
                onChange={(e) => updateFormData({ cotit_numero_piece: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cotit_date_delivrance">Date de délivrance *</Label>
              <Input
                id="cotit_date_delivrance"
                type="date"
                value={formData.cotit_date_delivrance}
                onChange={(e) => updateFormData({ cotit_date_delivrance: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Photo Pièce - Recto *</Label>
              <FileUpload
                onFileSelect={(file) => handleFileSelect(file, 'cotit_photo_cni_recto_file', setPieceRectoPreview)}
                accept="image/*"
                label="Choisir photo recto"
                currentFile={formData.cotit_photo_cni_recto_file?.name}
                onRemove={() => {
                  updateFormData({ cotit_photo_cni_recto_file: null });
                  setPieceRectoPreview("");
                }}
              />
              {pieceRectoPreview && (
                <div className="relative mt-2">
                  <img src={pieceRectoPreview} alt="Aperçu recto" className="w-full h-40 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => {
                      updateFormData({ cotit_photo_cni_recto_file: null });
                      setPieceRectoPreview("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Photo Pièce - Verso *</Label>
              <FileUpload
                onFileSelect={(file) => handleFileSelect(file, 'cotit_photo_cni_verso_file', setPieceVersoPreview)}
                accept="image/*"
                label="Choisir photo verso"
                currentFile={formData.cotit_photo_cni_verso_file?.name}
                onRemove={() => {
                  updateFormData({ cotit_photo_cni_verso_file: null });
                  setPieceVersoPreview("");
                }}
              />
              {pieceVersoPreview && (
                <div className="relative mt-2">
                  <img src={pieceVersoPreview} alt="Aperçu verso" className="w-full h-40 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => {
                      updateFormData({ cotit_photo_cni_verso_file: null });
                      setPieceVersoPreview("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo Profil *</Label>
            <FileUpload
              onFileSelect={(file) => handleFileSelect(file, 'cotit_photo_profil_file', setPhotoPreview)}
              accept="image/*"
              label="Choisir photo profil"
              currentFile={formData.cotit_photo_profil_file?.name}
              onRemove={() => {
                updateFormData({ cotit_photo_profil_file: null });
                setPhotoPreview("");
              }}
            />
            {photoPreview && (
              <div className="relative mt-2">
                <img src={photoPreview} alt="Aperçu profil" className="w-full h-40 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ cotit_photo_profil_file: null });
                    setPhotoPreview("");
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordonnées du co-titulaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cotit_telephone">Téléphone *</Label>
              <Input
                id="cotit_telephone"
                type="tel"
                value={formData.cotit_telephone}
                onChange={(e) => updateFormData({ cotit_telephone: e.target.value })}
                placeholder="+225 07XXXXXXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cotit_whatsapp">WhatsApp *</Label>
              <Input
                id="cotit_whatsapp"
                type="tel"
                value={formData.cotit_whatsapp}
                onChange={(e) => updateFormData({ cotit_whatsapp: e.target.value })}
                placeholder="+225 07XXXXXXXX"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
