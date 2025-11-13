import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useRealtime } from "@/hooks/useRealtime";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CheckCircle, XCircle, Eye } from "lucide-react";
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
import PaiementForm from "@/components/forms/PaiementForm";

const Paiements = () => {
  const [paiements, setPaiements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaiement, setSelectedPaiement] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const { hasRole } = useAuth();
  
  const canAddPaiement = hasRole('super_admin') || hasRole('agent_service_client');

  const fetchPaiements = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("paiements")
        .select(`
          *,
          plantations (
            id_unique,
            nom_plantation,
            souscripteurs (nom_complet)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaiements(data || []);
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
    fetchPaiements();
  }, []);

  useRealtime({
    table: "paiements",
    onChange: () => fetchPaiements(),
  });

  const filteredPaiements = paiements.filter((p) =>
    p.plantations?.id_unique?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.plantations?.souscripteurs?.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedPaiement(null);
    fetchPaiements();
  };

  const getStatutBadge = (statut: string) => {
    const colors: any = {
      en_attente: "bg-yellow-100 text-yellow-800",
      valide: "bg-green-100 text-green-800",
      rejete: "bg-red-100 text-red-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(montant);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
              <p className="text-muted-foreground mt-1">
                {paiements.length} paiement(s) enregistré(s)
              </p>
            </div>
            {canAddPaiement && (
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau Paiement
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPaiement ? "Modifier" : "Nouveau"} Paiement
                  </DialogTitle>
                </DialogHeader>
                <PaiementForm
                  paiement={selectedPaiement}
                  onSuccess={handleSuccess}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedPaiement(null);
                  }}
                />
              </DialogContent>
            </Dialog>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par plantation ou souscripteur..."
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
                  <TableHead>Plantation</TableHead>
                  <TableHead>Souscripteur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date Paiement</TableHead>
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
                ) : filteredPaiements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Aucun paiement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPaiements.map((paiement) => (
                    <TableRow key={paiement.id}>
                      <TableCell className="font-mono text-sm">
                        {paiement.plantations?.id_unique}
                      </TableCell>
                      <TableCell>
                        {paiement.plantations?.souscripteurs?.nom_complet}
                      </TableCell>
                      <TableCell>{paiement.type_paiement}</TableCell>
                      <TableCell className="font-bold">
                        {formatMontant(paiement.montant_paye || paiement.montant_theorique)}
                      </TableCell>
                      <TableCell>
                        {paiement.date_paiement
                          ? new Date(paiement.date_paiement).toLocaleDateString("fr-FR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatutBadge(
                            paiement.statut
                          )}`}
                        >
                          {paiement.statut?.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPaiement(paiement);
                            setIsFormOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
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

export default Paiements;
