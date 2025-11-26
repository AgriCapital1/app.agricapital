import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "@/components/ui/file-upload";
import { X, FileText } from "lucide-react";

interface Etape5Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export const Etape5Documents = ({ formData, updateFormData }: Etape5Props) => {
  const [contratPreview, setContratPreview] = useState<string>("");
  const [foncierPreview, setFoncierPreview] = useState<string>("");

  const handleFileSelect = (file: File, field: string, setPreview: (url: string) => void) => {
    updateFormData({ [field]: file });
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(file.name);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contrat de souscription</CardTitle>
          <CardDescription>Document signé par les deux parties</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contrat de Souscription (Signé) *</Label>
            <FileUpload
              onFileSelect={(file) => handleFileSelect(file, 'contrat_file', setContratPreview)}
              accept=".pdf,image/*"
              label="Choisir le contrat signé"
              currentFile={formData.contrat_file?.name}
              onRemove={() => {
                updateFormData({ contrat_file: null });
                setContratPreview("");
              }}
            />
            {contratPreview && (
              <div className="relative mt-2 p-4 border rounded-lg">
                {formData.contrat_file?.type.startsWith('image/') ? (
                  <img src={contratPreview} alt="Aperçu contrat" className="w-full h-60 object-contain" />
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="text-sm">{contratPreview}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ contrat_file: null });
                    setContratPreview("");
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Formats acceptés: PDF, JPEG, PNG. Max 10MB.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_signature">Date de signature du contrat *</Label>
            <Input
              id="date_signature"
              type="date"
              value={formData.date_signature_contrat}
              onChange={(e) => updateFormData({ date_signature_contrat: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document foncier</CardTitle>
          <CardDescription>Justificatif de propriété ou d'exploitation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type_doc_foncier">Type de document foncier *</Label>
            <Select
              value={formData.type_document_foncier}
              onValueChange={(value) => updateFormData({ type_document_foncier: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certificat_foncier">Certificat foncier</SelectItem>
                <SelectItem value="titre_foncier">Titre foncier</SelectItem>
                <SelectItem value="contrat_metayage">Contrat métayage</SelectItem>
                <SelectItem value="autorisation">Autorisation d'exploiter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_doc_foncier">Numéro du document *</Label>
              <Input
                id="numero_doc_foncier"
                value={formData.numero_document_foncier}
                onChange={(e) => updateFormData({ numero_document_foncier: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_delivrance_foncier">Date de délivrance *</Label>
              <Input
                id="date_delivrance_foncier"
                type="date"
                value={formData.date_delivrance_foncier}
                onChange={(e) => updateFormData({ date_delivrance_foncier: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proprietaire_legal">Propriétaire légal (si différent du souscripteur)</Label>
            <Input
              id="proprietaire_legal"
              value={formData.proprietaire_legal}
              onChange={(e) => updateFormData({ proprietaire_legal: e.target.value })}
              placeholder="Laisser vide si le souscripteur est le propriétaire"
            />
          </div>

          <div className="space-y-2">
            <Label>Fichier du document foncier *</Label>
            <FileUpload
              onFileSelect={(file) => handleFileSelect(file, 'document_foncier_file', setFoncierPreview)}
              accept=".pdf,image/*"
              label="Choisir le document foncier"
              currentFile={formData.document_foncier_file?.name}
              onRemove={() => {
                updateFormData({ document_foncier_file: null });
                setFoncierPreview("");
              }}
            />
            {foncierPreview && (
              <div className="relative mt-2 p-4 border rounded-lg">
                {formData.document_foncier_file?.type.startsWith('image/') ? (
                  <img src={foncierPreview} alt="Aperçu document foncier" className="w-full h-60 object-contain" />
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="text-sm">{foncierPreview}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    updateFormData({ document_foncier_file: null });
                    setFoncierPreview("");
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Formats acceptés: PDF, JPEG, PNG. Max 10MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents complémentaires (optionnel)</CardTitle>
          <CardDescription>Autres documents pertinents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="docs_complementaires">Autres documents</Label>
            <Input
              id="docs_complementaires"
              type="file"
              multiple
              accept=".pdf,image/jpeg,image/png"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) updateFormData({ docs_complementaires_files: files });
              }}
            />
            <p className="text-xs text-muted-foreground">
              Maximum 5 fichiers. Formats: PDF, JPEG, PNG.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
