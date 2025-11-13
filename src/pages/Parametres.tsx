import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Gift, Shield, MapPin, Settings2 } from "lucide-react";
import Utilisateurs from "@/pages/Utilisateurs";
import Promotions from "@/pages/Promotions";
import GestionRoles from "@/pages/parametres/GestionRoles";
import GestionRegions from "@/pages/parametres/GestionRegions";
import ChampsPersonnalises from "@/pages/parametres/ChampsPersonnalises";

const Parametres = () => {
  return (
    <ProtectedRoute requiredRole="super_admin">
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground mt-1">
              Configuration et gestion de la plateforme
            </p>
          </div>

          <Tabs defaultValue="utilisateurs" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="utilisateurs">
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="promotions">
                <Gift className="h-4 w-4 mr-2" />
                Promotions
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Shield className="h-4 w-4 mr-2" />
                Rôles & Permissions
              </TabsTrigger>
              <TabsTrigger value="regions">
                <MapPin className="h-4 w-4 mr-2" />
                Régions
              </TabsTrigger>
              <TabsTrigger value="champs">
                <Settings2 className="h-4 w-4 mr-2" />
                Champs Personnalisés
              </TabsTrigger>
            </TabsList>

            <TabsContent value="utilisateurs">
              <Utilisateurs />
            </TabsContent>

            <TabsContent value="promotions">
              <Promotions />
            </TabsContent>

            <TabsContent value="roles">
              <GestionRoles />
            </TabsContent>

            <TabsContent value="regions">
              <GestionRegions />
            </TabsContent>

            <TabsContent value="champs">
              <ChampsPersonnalises />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Parametres;
