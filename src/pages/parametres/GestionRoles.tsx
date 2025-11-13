import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

const GestionRoles = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Rôles et Permissions</CardTitle>
          <CardDescription>
            Créer et gérer les rôles, statuts et permissions des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Rôles existants</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Rôle
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded">
                  <p className="font-medium">Super Admin</p>
                  <p className="text-xs text-muted-foreground">Tous les accès</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="font-medium">Commercial</p>
                  <p className="text-xs text-muted-foreground">Gestion planteurs</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="font-medium">Technicien</p>
                  <p className="text-xs text-muted-foreground">Suivi plantations</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Créer un nouveau statut</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="nouveau_statut">Nom du statut</Label>
                  <Input
                    id="nouveau_statut"
                    placeholder="Ex: Responsable Régional"
                  />
                </div>
                <Button>Créer le statut</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionRoles;