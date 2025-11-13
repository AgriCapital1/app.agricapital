import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useRealtime } from "@/hooks/useRealtime";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Eye, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

const Souscriptions = () => {
  const [souscripteurs, setSouscripteurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data: sousData, error: sousError } = await (supabase as any)
        .from("souscripteurs")
        .select("*")
        .order("created_at", { ascending: false });

      if (sousError) throw sousError;

      setSouscripteurs(sousData || []);
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
    fetchData();
  }, []);

  useRealtime({ table: "souscripteurs", onChange: fetchData });
  useRealtime({ table: "plantations", onChange: fetchData });

  const filteredSouscripteurs = souscripteurs.filter((s) =>
    s.id_unique?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.telephone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatutBadge = (statut: string) => {
    const colors: any = {
      actif: "bg-green-500",
      inactif: "bg-gray-500",
      suspendu: "bg-orange-500",
      radie: "bg-red-500",
    };
    return colors[statut] || "bg-gray-500";
  };

  const stats = {
    total: souscripteurs.length,
    actifs: souscripteurs.filter(s => s.statut_global === "actif").length,
    inactifs: souscripteurs.filter(s => s.statut_global === "inactif").length,
    totalHectares: souscripteurs.reduce((sum, s) => sum + Number(s.total_hectares || 0), 0),
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Souscriptions</h1>
              <p className="text-muted-foreground mt-1">
                {souscripteurs.length} souscripteur(s) enregistré(s)
              </p>
            </div>
            <Link to="/nouvelle-souscription">
              <Button className="bg-primary hover:bg-primary-hover">
                <FileText className="mr-2 h-4 w-4" />
                Nouvelle Souscription
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Souscripteurs
                </CardTitle>
                <FileText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Actifs
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.actifs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Inactifs
                </CardTitle>
                <Clock className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactifs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Hectares
                </CardTitle>
                <FileText className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHectares.toFixed(2)} ha</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID, nom, téléphone..."
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
                  <TableHead>Nom Complet</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Plantations</TableHead>
                  <TableHead>Hectares</TableHead>
                  <TableHead>DA Versé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredSouscripteurs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Aucune souscription trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSouscripteurs.map((souscripteur) => (
                    <TableRow key={souscripteur.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {souscripteur.id_unique}
                      </TableCell>
                      <TableCell className="font-medium">
                        {souscripteur.nom_complet}
                      </TableCell>
                      <TableCell>{souscripteur.telephone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {souscripteur.nombre_plantations || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {Number(souscripteur.total_hectares || 0).toFixed(2)} ha
                      </TableCell>
                      <TableCell className="font-medium">
                        {Number(souscripteur.total_da_verse || 0).toLocaleString()} F
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatutBadge(souscripteur.statut_global)}>
                          {souscripteur.statut_global}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(souscripteur.created_at), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Link to={`/planteur/${souscripteur.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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

export default Souscriptions;
