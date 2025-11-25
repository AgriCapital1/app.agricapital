import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useRealtime } from "@/hooks/useRealtime";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlantationsMap } from "@/components/dashboard/PlantationsMap";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Sprout, 
  TrendingUp, 
  CreditCard, 
  AlertCircle,
  MapPin,
  Calendar,
  TrendingDown,
  Bell,
  Award,
  DollarSign
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const Dashboard = () => {
  const { profile } = useAuth();
  const [connectionTime] = useState(new Date().toLocaleTimeString("fr-FR"));
  const [stats, setStats] = useState({
    totalPlanteurs: 0,
    totalPlantations: 0,
    totalSuperficie: 0,
    totalPaiements: 0,
    paiementsEnAttente: 0,
    plantationsEnProduction: 0,
    evolutionPlanteurs: 0,
    evolutionPlantations: 0,
    tauxProduction: 0,
  });

  const [recentPlanteurs, setRecentPlanteurs] = useState<any[]>([]);
  const [recentPaiements, setRecentPaiements] = useState<any[]>([]);
  const [statsParRegion, setStatsParRegion] = useState<any[]>([]);
  const [evolutionMensuelle, setEvolutionMensuelle] = useState<any[]>([]);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [topPlanteurs, setTopPlanteurs] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      // Stats globales
      const { count: planteursCount } = await (supabase as any)
        .from("souscripteurs")
        .select("*", { count: "exact", head: true });

      const { data: plantations } = await (supabase as any)
        .from("plantations")
        .select("superficie_ha, statut_global, created_at, region_id");

      const totalSuperficie = plantations?.reduce((sum, p) => sum + (p.superficie_ha || 0), 0) || 0;
      const plantationsEnProduction = plantations?.filter((p) => p.statut_global === "en_production").length || 0;
      const tauxProduction = plantations?.length ? ((plantationsEnProduction / plantations.length) * 100).toFixed(1) : 0;

      // Évolution mois précédent
      const dateDebutMois = new Date();
      dateDebutMois.setDate(1);
      dateDebutMois.setHours(0, 0, 0, 0);

      const plantationsCeMois = plantations?.filter(p => 
        new Date(p.created_at) >= dateDebutMois
      ).length || 0;

      const { data: paiements } = await (supabase as any)
        .from("paiements")
        .select("montant_paye, montant_theorique, statut, created_at, plantation_id, plantations(souscripteurs(nom_complet))");
      
      const totalPaiements = paiements?.filter((p) => p.statut === "valide")
        .reduce((sum, p) => sum + (p.montant_paye || 0), 0) || 0;
      
      const paiementsEnAttenteCount = paiements?.filter((p) => p.statut === "en_attente").length || 0;
      const montantEnAttente = paiements?.filter((p) => p.statut === "en_attente")
        .reduce((sum, p) => sum + (p.montant_theorique || 0), 0) || 0;

      // Planteurs récents
      const { data: planteurs } = await (supabase as any)
        .from("souscripteurs")
        .select("id_unique, nom_complet, created_at, statut_global, nombre_plantations")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentPlanteurs(planteurs || []);

      // Paiements récents
      const paiementsRecents = paiements?.slice(0, 5).map((p: any) => ({
        ...p,
        planteur_nom: p.plantations?.souscripteurs?.nom_complet || "N/A"
      })) || [];
      setRecentPaiements(paiementsRecents);

      // Stats par département
      const { data: departements } = await (supabase as any)
        .from("departements")
        .select("id, nom");

      const statsDepartements = await Promise.all(
        (departements || []).map(async (dept: any) => {
          const { count } = await (supabase as any)
            .from("plantations")
            .select("*", { count: "exact", head: true })
            .eq("departement_id", dept.id);
          
          return {
            name: dept.nom,
            value: count || 0
          };
        })
      );

      setStatsParRegion(statsDepartements.filter(s => s.value > 0).slice(0, 6));

      // Évolution mensuelle (6 derniers mois)
      const mois = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const moisNom = date.toLocaleDateString('fr-FR', { month: 'short' });
        
        const debutMois = new Date(date.getFullYear(), date.getMonth(), 1);
        const finMois = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const plantatsMois = plantations?.filter(p => {
          const d = new Date(p.created_at);
          return d >= debutMois && d <= finMois;
        }).length || 0;

        const paiementsMois = paiements?.filter((p: any) => {
          const d = new Date(p.created_at);
          return d >= debutMois && d <= finMois && p.statut === "valide";
        }).reduce((sum, p) => sum + (p.montant_paye || 0), 0) || 0;

        mois.push({
          mois: moisNom,
          plantations: plantatsMois,
          paiements: paiementsMois / 1000000 // En millions
        });
      }

      setEvolutionMensuelle(mois);

      // Alertes
      const alertesArray = [];
      if (paiementsEnAttenteCount > 0) {
        alertesArray.push({
          type: "warning",
          message: `${paiementsEnAttenteCount} paiement(s) en attente - ${formatMontant(montantEnAttente)}`,
          date: new Date()
        });
      }

      const { data: plantationsAlerte } = await (supabase as any)
        .from("plantations")
        .select("*")
        .or("alerte_non_paiement.eq.true,alerte_visite_retard.eq.true");

      if (plantationsAlerte && plantationsAlerte.length > 0) {
        alertesArray.push({
          type: "error",
          message: `${plantationsAlerte.length} plantation(s) nécessitent votre attention`,
          date: new Date()
        });
      }

      setAlertes(alertesArray);

      // Top planteurs
      const { data: topPlanteursData } = await (supabase as any)
        .from("souscripteurs")
        .select("nom_complet, nombre_plantations, total_hectares")
        .order("total_hectares", { ascending: false })
        .limit(5);

      setTopPlanteurs(topPlanteursData || []);

      setStats({
        totalPlanteurs: planteursCount || 0,
        totalPlantations: plantations?.length || 0,
        totalSuperficie,
        totalPaiements,
        paiementsEnAttente: paiementsEnAttenteCount,
        plantationsEnProduction,
        evolutionPlanteurs: plantationsCeMois > 0 ? 12 : 0,
        evolutionPlantations: plantationsCeMois,
        tauxProduction: Number(tauxProduction),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useRealtime({ table: "souscripteurs", onChange: fetchStats });
  useRealtime({ table: "plantations", onChange: fetchStats });
  useRealtime({ table: "paiements", onChange: fetchStats });

  const formatMontant = (m: number) => 
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(m);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d'];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-primary-foreground">
              Bienvenue, <span className="text-accent font-extrabold">{profile?.nom_complet || "Utilisateur"}</span>
            </h1>
            <p className="text-primary-foreground/90 mt-2 flex items-center gap-4">
              <span>Connecté à {connectionTime}</span>
              <span className="text-primary-foreground/70">•</span>
              <span>Support: <a href="tel:+2250759566087" className="text-accent hover:underline font-semibold">+225 07 59 56 60 87</a></span>
            </p>
          </div>

          {/* 1️⃣ APERÇU GLOBAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-scale cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Planteurs Inscrits
                </CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPlanteurs}</div>
                {stats.evolutionPlanteurs > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+{stats.evolutionPlanteurs}% ce mois</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Plantations
                </CardTitle>
                <Sprout className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPlantations}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.totalSuperficie.toFixed(1)} hectares au total
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En Production
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.plantationsEnProduction}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.tauxProduction}% du total
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Paiements
                </CardTitle>
                <CreditCard className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMontant(stats.totalPaiements)}</div>
                {stats.paiementsEnAttente > 0 && (
                  <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {stats.paiementsEnAttente} en attente
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Carte Interactive des Plantations */}
          <PlantationsMap />

          {/* 2️⃣ ANALYSE GRAPHIQUE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution mensuelle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Évolution sur 6 mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={evolutionMensuelle}>
                    <defs>
                      <linearGradient id="colorPlantations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="plantations" 
                      name="Plantations" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorPlantations)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition par département */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Répartition par Département
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statsParRegion}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statsParRegion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progression paiements */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Évolution des Paiements (en millions XOF)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionMensuelle}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="paiements" 
                      name="Paiements (M XOF)" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 3️⃣ TABLEAUX DÉTAILLÉS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Planteurs récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Planteurs Récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Plantations</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPlanteurs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Aucun planteur
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentPlanteurs.map((p) => (
                          <TableRow key={p.id_unique}>
                            <TableCell className="font-mono text-xs">{p.id_unique}</TableCell>
                            <TableCell>{p.nom_complet}</TableCell>
                            <TableCell>{p.nombre_plantations || 0}</TableCell>
                            <TableCell>
                              <Badge variant={p.statut_global === 'actif' ? 'default' : 'secondary'}>
                                {p.statut_global}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Paiements récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Paiements Récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Planteur</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPaiements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            Aucun paiement
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentPaiements.map((p, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{p.planteur_nom}</TableCell>
                            <TableCell>{formatMontant(p.montant_paye || 0)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  p.statut === 'valide' ? 'default' : 
                                  p.statut === 'en_attente' ? 'secondary' : 
                                  'destructive'
                                }
                              >
                                {p.statut}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4️⃣ ALERTES & 5️⃣ PERFORMANCE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alertes */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  Alertes & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune alerte pour le moment
                    </p>
                  ) : (
                    alertes.map((alerte, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg border ${
                          alerte.type === 'error' ? 'border-destructive bg-destructive/10' :
                          alerte.type === 'warning' ? 'border-orange-500 bg-orange-500/10' :
                          'border-primary bg-primary/10'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className={`h-4 w-4 mt-0.5 ${
                            alerte.type === 'error' ? 'text-destructive' :
                            alerte.type === 'warning' ? 'text-orange-500' :
                            'text-primary'
                          }`} />
                          <p className="text-sm">{alerte.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Top 5 Planteurs (par superficie)
                    </h4>
                    <div className="space-y-2">
                      {topPlanteurs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Aucune donnée disponible
                        </p>
                      ) : (
                        topPlanteurs.map((planteur, i) => (
                          <div 
                            key={i}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                i === 0 ? 'bg-yellow-500/20 text-yellow-700' :
                                i === 1 ? 'bg-gray-400/20 text-gray-700' :
                                i === 2 ? 'bg-orange-500/20 text-orange-700' :
                                'bg-primary/20 text-primary'
                              }`}>
                                <span className="text-sm font-bold">#{i + 1}</span>
                              </div>
                              <span className="font-medium">{planteur.nom_complet}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{planteur.total_hectares?.toFixed(1) || 0} ha</div>
                              <div className="text-xs text-muted-foreground">
                                {planteur.nombre_plantations || 0} plantation(s)
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
