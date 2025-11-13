import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GestionRegions = () => {
  const { toast } = useToast();
  const [districts, setDistricts] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: districtsData } = await (supabase as any)
        .from("districts")
        .select("*")
        .order("nom");
      
      const { data: regionsData } = await (supabase as any)
        .from("regions")
        .select("*, districts(nom)")
        .order("nom");

      if (districtsData) setDistricts(districtsData);
      if (regionsData) setRegions(regionsData);
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

  const toggleRegion = async (regionId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("regions")
        .update({ est_active: !currentStatus })
        .eq("id", regionId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Région mise à jour",
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const toggleDistrict = async (districtId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("districts")
        .update({ est_actif: !currentStatus })
        .eq("id", districtId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "District mis à jour",
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Régions</CardTitle>
          <CardDescription>
            Activer ou désactiver les régions selon le déploiement de l'entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Districts</h3>
                <div className="space-y-2">
                  {districts.map((district) => (
                    <div key={district.id} className="flex items-center justify-between p-3 border rounded">
                      <Label htmlFor={`district-${district.id}`} className="flex-1">
                        {district.nom}
                      </Label>
                      <Switch
                        id={`district-${district.id}`}
                        checked={district.est_actif}
                        onCheckedChange={() => toggleDistrict(district.id, district.est_actif)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Régions</h3>
                <div className="space-y-2">
                  {regions.map((region) => (
                    <div key={region.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <Label htmlFor={`region-${region.id}`}>
                          {region.nom}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {region.districts?.nom || "District non défini"}
                        </p>
                      </div>
                      <Switch
                        id={`region-${region.id}`}
                        checked={region.est_active}
                        onCheckedChange={() => toggleRegion(region.id, region.est_active)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💡 Note: La région <span className="font-semibold">Haut-Sassandra</span> est activée par défaut.
                  Activez progressivement d'autres régions selon votre déploiement.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionRegions;