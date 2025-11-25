import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoGreen from "@/assets/logo-green.png";
import { Users, Sprout, TrendingUp, Award, MapPin } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalPlanteurs: 0,
    totalPlantations: 0,
    superficieTotale: 0,
    meilleurCommercial: { nom: "Chargement...", ventes: 0 }
  });

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: planteurs } = await (supabase as any)
        .from("souscripteurs")
        .select("*", { count: "exact" });

      const { data: plantations } = await (supabase as any)
        .from("plantations")
        .select("superficie_ha", { count: "exact" });

      const superficie = plantations?.reduce((sum: number, p: any) => sum + Number(p.superficie_ha || 0), 0) || 0;

      // Meilleur commercial de la semaine (basé sur les plantations créées cette semaine)
      const dateDebut = new Date();
      dateDebut.setDate(dateDebut.getDate() - 7);

      const { data: commercialStats } = await (supabase as any)
        .from("plantations")
        .select(`
          created_by,
          profiles!plantations_created_by_fkey(nom_complet)
        `)
        .gte("created_at", dateDebut.toISOString());

      const commercialCounts: { [key: string]: { nom: string; count: number } } = {};
      commercialStats?.forEach((p: any) => {
        const id = p.created_by;
        const nom = p.profiles?.nom_complet || "Inconnu";
        if (!commercialCounts[id]) {
          commercialCounts[id] = { nom, count: 0 };
        }
        commercialCounts[id].count++;
      });

      const meilleur = Object.values(commercialCounts).sort((a, b) => b.count - a.count)[0] || { nom: "Aucun", count: 0 };

      setStats({
        totalPlanteurs: planteurs?.length || 0,
        totalPlantations: plantations?.length || 0,
        superficieTotale: superficie,
        meilleurCommercial: { nom: meilleur.nom, ventes: meilleur.count }
      });
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logoGreen} alt="AgriCapital" className="h-20 w-auto" />
          </div>
          <Button onClick={() => navigate("/login")} size="lg" className="gap-2">
            <Users className="h-4 w-4" />
            Se Connecter
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-foreground mb-6">
          Plateforme de Gestion <span className="text-primary">AgriCapital</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          Solution complète pour la gestion des souscriptions, le suivi des plantations, 
          le calcul automatique des commissions et la gestion des équipes terrain.
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.totalPlanteurs}</p>
                  <p className="text-sm text-muted-foreground">Planteurs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Sprout className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.totalPlantations}</p>
                  <p className="text-sm text-muted-foreground">Plantations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.superficieTotale.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Hectares</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground line-clamp-1">{stats.meilleurCommercial.nom}</p>
                  <p className="text-sm text-muted-foreground">{stats.meilleurCommercial.ventes} ventes cette semaine</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Fonctionnalités Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <TrendingUp className="h-10 w-10 text-primary mb-4" />
              <h4 className="text-xl font-semibold mb-2">Gestion des Souscriptions</h4>
              <p className="text-muted-foreground">
                Enregistrement et suivi complet des planteurs et de leurs plantations avec documents justificatifs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Sprout className="h-10 w-10 text-green-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Suivi Technique</h4>
              <p className="text-muted-foreground">
                Gestion des interventions techniques, rapports de suivi et photos géolocalisées des plantations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Award className="h-10 w-10 text-yellow-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Commissions Automatiques</h4>
              <p className="text-muted-foreground">
                Calcul automatique des commissions par souscription et gestion des portefeuilles des commerciaux.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-muted-foreground">
            &copy; 2025 AgriCapital - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
