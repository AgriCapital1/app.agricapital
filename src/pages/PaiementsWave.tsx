import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

const PaiementsWave = () => {
  const [searchTelephone, setSearchTelephone] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [typePaiement, setTypePaiement] = useState<string>("tous");

  const { data: paiements, isLoading, refetch } = useQuery({
    queryKey: ["paiements-wave", searchTelephone, dateDebut, dateFin, typePaiement],
    queryFn: async () => {
      let query = (supabase as any)
        .from("paiements_wave")
        .select(`
          *,
          souscripteurs (
            nom_complet,
            id_unique
          )
        `)
        .order("date_paiement", { ascending: false });

      if (searchTelephone) {
        query = query.ilike("telephone", `%${searchTelephone}%`);
      }

      if (dateDebut) {
        query = query.gte("date_paiement", dateDebut);
      }

      if (dateFin) {
        query = query.lte("date_paiement", dateFin);
      }

      if (typePaiement !== "tous") {
        query = query.eq("type_paiement", typePaiement);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const handleReconciliation = async () => {
    try {
      toast.info("Réconciliation en cours...");
      
      const { data, error } = await supabase.functions.invoke("wave-reconciliation");
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(
          `Réconciliation terminée: ${data.resultats.total_verifies} paiements vérifiés, ${data.resultats.corriges} corrections effectuées`
        );
        refetch();
      }
    } catch (error: any) {
      console.error("Erreur réconciliation:", error);
      toast.error("Erreur lors de la réconciliation");
    }
  };

  const handleExport = () => {
    if (!paiements || paiements.length === 0) {
      toast.error("Aucun paiement à exporter");
      return;
    }

    const csv = [
      ["Date", "Transaction ID", "Téléphone", "Souscripteur", "Type", "Montant", "Statut"].join(";"),
      ...paiements.map((p: any) => [
        format(new Date(p.date_paiement), "dd/MM/yyyy HH:mm", { locale: fr }),
        p.transaction_wave_id,
        p.telephone,
        p.souscripteurs?.nom_complet || "N/A",
        p.type_paiement === "droit_acces" ? "Droit d'Accès" : "Contribution Annuelle",
        p.montant_paye.toLocaleString("fr-FR"),
        p.statut,
      ].join(";")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `paiements-wave-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    
    toast.success("Export réussi");
  };

  const totalMontant = paiements?.reduce((sum: number, p: any) => sum + p.montant_paye, 0) || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Paiements Wave</h1>
          <div className="flex gap-2">
            <Button onClick={handleReconciliation} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réconciliation
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paiements?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalMontant.toLocaleString("fr-FR")} FCFA
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Droit d'Accès</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paiements?.filter((p: any) => p.type_paiement === "droit_acces").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paiements?.filter((p: any) => p.type_paiement === "contribution_annuelle").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Téléphone</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTelephone}
                    onChange={(e) => setSearchTelephone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date début</label>
                <Input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date fin</label>
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={typePaiement}
                  onChange={(e) => setTypePaiement(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="tous">Tous</option>
                  <option value="droit_acces">Droit d'Accès</option>
                  <option value="contribution_annuelle">Contribution Annuelle</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Souscripteur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : !paiements || paiements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun paiement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paiements.map((paiement: any) => (
                    <TableRow key={paiement.id}>
                      <TableCell>
                        {format(new Date(paiement.date_paiement), "dd/MM/yyyy HH:mm", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {paiement.transaction_wave_id}
                      </TableCell>
                      <TableCell>{paiement.telephone}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{paiement.souscripteurs?.nom_complet}</div>
                          <div className="text-xs text-muted-foreground">
                            {paiement.souscripteurs?.id_unique}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paiement.type_paiement === "droit_acces" ? "default" : "secondary"}>
                          {paiement.type_paiement === "droit_acces"
                            ? "Droit d'Accès"
                            : "Contribution"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {paiement.montant_paye.toLocaleString("fr-FR")} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge variant={paiement.statut === "valide" ? "default" : "secondary"}>
                          {paiement.statut}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaiementsWave;
