import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PlantationLocation {
  sous_prefecture: string;
  count: number;
  superficie: number;
}

export const PlantationsMap = () => {
  const [locations, setLocations] = useState<PlantationLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("plantations")
        .select(`
          sous_prefecture_id,
          superficie_ha,
          sous_prefectures (nom)
        `);

      if (error) throw error;

      // Grouper par sous-préfecture
      const grouped = data.reduce((acc: any, curr: any) => {
        const spName = curr.sous_prefectures?.nom || "Non défini";
        if (!acc[spName]) {
          acc[spName] = { count: 0, superficie: 0 };
        }
        acc[spName].count += 1;
        acc[spName].superficie += Number(curr.superficie_ha) || 0;
        return acc;
      }, {});

      const locationsList = Object.entries(grouped).map(([name, data]: [string, any]) => ({
        sous_prefecture: name,
        count: data.count,
        superficie: data.superficie,
      }));

      setLocations(locationsList.sort((a, b) => b.count - a.count));
    } catch (error) {
      console.error("Erreur lors du chargement des localisations:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...locations.map(l => l.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Carte des Plantations par Sous-Préfecture
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : locations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune plantation enregistrée
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {locations.map((loc, idx) => {
              const percentage = (loc.count / maxCount) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{loc.sous_prefecture}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {loc.count} plantation{loc.count > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({loc.superficie.toFixed(1)} ha)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};