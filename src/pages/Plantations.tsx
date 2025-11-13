import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useRealtime } from "@/hooks/useRealtime";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PlantationForm from "@/components/forms/PlantationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Plantations = () => {
  const [plantations, setPlantations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlantation, setSelectedPlantation] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchPlantations = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("plantations")
        .select(`
          *,
          souscripteurs (nom_complet, id_unique),
          regions (nom),
          departements (nom)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlantations(data || []);
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

  useEffect(() => {
    fetchPlantations();
  }, []);

  useRealtime({
    table: "plantations",
    onChange: () => fetchPlantations(),
  });

  const filteredPlantations = plantations.filter((p) =>
    p.id_unique?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nom_plantation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.souscripteurs?.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nombreTotal = plantations.length;
  const superficieTotale = plantations.reduce((sum, p) => sum + (Number(p.superficie_ha) || 0), 0);
  const superficiePlantee = plantations.filter(p => ['en_cours', 'en_production'].includes(p.statut_global)).reduce((sum, p) => sum + (Number(p.superficie_ha) || 0), 0);
  const superficieEnProduction = plantations.filter(p => p.statut_global === 'en_production').reduce((sum, p) => sum + (Number(p.superficie_ha) || 0), 0);
  const nombreEnProduction = plantations.filter(p => p.statut_global === 'en_production').length;

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedPlantation(null);
    fetchPlantations();
  };

  const getStatutBadge = (statut: string) => {
    const colors: any = {
      en_attente_da: "bg-yellow-100 text-yellow-800",
      da_valide: "bg-blue-100 text-blue-800",
      en_cours: "bg-purple-100 text-purple-800",
      en_production: "bg-green-100 text-green-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Nombre Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nombreTotal}</div>
                <p className="text-xs text-muted-foreground mt-1">plantations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Superficie Totale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{superficieTotale.toFixed(1)} ha</div>
                <p className="text-xs text-muted-foreground mt-1">enregistrée</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Superficie Plantée</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{superficiePlantee.toFixed(1)} ha</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {superficieTotale > 0 ? `${((superficiePlantee / superficieTotale) * 100).toFixed(0)}%` : '0%'} du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">En Production</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nombreEnProduction}</div>
                <p className="text-xs text-muted-foreground mt-1">{superficieEnProduction.toFixed(1)} ha</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Plantations</h1>
              <p className="text-muted-foreground mt-1">
                {nombreTotal} plantation(s) enregistrée(s)
              </p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Plantation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPlantation ? "Modifier" : "Nouvelle"} Plantation
                  </DialogTitle>
                </DialogHeader>
                <PlantationForm
                  plantation={selectedPlantation}
                  onSuccess={handleSuccess}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedPlantation(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, ID ou planteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Unique</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Planteur</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredPlantations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Aucune plantation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlantations.map((plantation) => (
                    <TableRow key={plantation.id}>
                      <TableCell className="font-mono text-sm">
                        {plantation.id_unique}
                      </TableCell>
                      <TableCell className="font-medium">
                        {plantation.nom_plantation}
                      </TableCell>
                      <TableCell>
                        {plantation.souscripteurs?.nom_complet}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{plantation.superficie_ha}</span> ha
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{plantation.regions?.nom}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatutBadge(
                            plantation.statut_global
                          )}`}
                        >
                          {plantation.statut_global?.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlantation(plantation);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Plantations;
