import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Gift, Shield, MapPin, Settings2, List, Bell, Globe } from "lucide-react";
import Utilisateurs from "@/pages/Utilisateurs";
import Promotions from "@/pages/Promotions";
import GestionRoles from "@/pages/parametres/GestionRoles";
import GestionRegions from "@/pages/parametres/GestionRegions";
import ChampsPersonnalises from "@/pages/parametres/ChampsPersonnalises";
import GestionStatuts from "@/pages/parametres/GestionStatuts";
import ConfigurationSysteme from "@/pages/parametres/ConfigurationSysteme";
import GestionNotifications from "@/pages/parametres/GestionNotifications";

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
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
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
                Rôles
              </TabsTrigger>
              <TabsTrigger value="regions">
                <MapPin className="h-4 w-4 mr-2" />
                Régions
              </TabsTrigger>
              <TabsTrigger value="statuts">
                <List className="h-4 w-4 mr-2" />
                Statuts
              </TabsTrigger>
              <TabsTrigger value="champs">
                <Settings2 className="h-4 w-4 mr-2" />
                Champs
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="systeme">
                <Globe className="h-4 w-4 mr-2" />
                Système
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

            <TabsContent value="statuts">
              <GestionStatuts />
            </TabsContent>

            <TabsContent value="notifications">
              <GestionNotifications />
            </TabsContent>

            <TabsContent value="systeme">
              <ConfigurationSysteme />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Parametres;
