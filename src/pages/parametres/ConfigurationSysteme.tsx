import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, DollarSign, Mail, Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConfigurationSysteme = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    // Général
    nomPlateforme: "AgriCapital",
    urlPlateforme: "https://app.agricapital.ci",
    emailContact: "contact@agricapital.ci",
    telephoneContact: "+225 XX XX XX XX XX",
    
    // Financier
    tauxCommissionDefaut: 2500,
    montantNormalHA: 30000,
    tauxRedevanceAgricapital: 20,
    
    // Notifications
    notificationsEmail: true,
    notificationsSMS: true,
    notificationsWhatsApp: true,
    
    // Sécurité
    authentification2FA: false,
    sessionTimeout: 30,
    tentativesConnexionMax: 5,
  });

  const handleSave = () => {
    toast({
      title: "Configuration enregistrée",
      description: "Les paramètres système ont été mis à jour avec succès",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <div>
              <CardTitle>Configuration Système</CardTitle>
              <CardDescription>
                Paramètres globaux de la plateforme
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <Globe className="h-4 w-4 mr-2" />
                Général
              </TabsTrigger>
              <TabsTrigger value="financier">
                <DollarSign className="h-4 w-4 mr-2" />
                Financier
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="securite">
                <Shield className="h-4 w-4 mr-2" />
                Sécurité
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de la plateforme</Label>
                  <Input 
                    value={config.nomPlateforme}
                    onChange={(e) => setConfig({...config, nomPlateforme: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL de la plateforme</Label>
                  <Input 
                    value={config.urlPlateforme}
                    onChange={(e) => setConfig({...config, urlPlateforme: e.target.value})}
                    placeholder="https://app.agricapital.ci"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL principale de la plateforme pour les liens et communications
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <Input 
                    type="email"
                    value={config.emailContact}
                    onChange={(e) => setConfig({...config, emailContact: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone de contact</Label>
                  <Input 
                    value={config.telephoneContact}
                    onChange={(e) => setConfig({...config, telephoneContact: e.target.value})}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financier" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Taux de commission par défaut (FCFA/ha)</Label>
                  <Input 
                    type="number"
                    value={config.tauxCommissionDefaut}
                    onChange={(e) => setConfig({...config, tauxCommissionDefaut: Number(e.target.value)})}
                  />
                  <p className="text-sm text-muted-foreground">
                    Commission versée aux commerciaux pour chaque souscription
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Montant normal Droit d'Accès (FCFA/ha)</Label>
                  <Input 
                    type="number"
                    value={config.montantNormalHA}
                    onChange={(e) => setConfig({...config, montantNormalHA: Number(e.target.value)})}
                  />
                  <p className="text-sm text-muted-foreground">
                    Montant du droit d'accès par hectare (hors promotion)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Redevance AgriCapital (%)</Label>
                  <Input 
                    type="number"
                    value={config.tauxRedevanceAgricapital}
                    onChange={(e) => setConfig({...config, tauxRedevanceAgricapital: Number(e.target.value)})}
                  />
                  <p className="text-sm text-muted-foreground">
                    Pourcentage prélevé sur les récoltes
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des notifications par email
                    </p>
                  </div>
                  <Switch 
                    checked={config.notificationsEmail}
                    onCheckedChange={(checked) => setConfig({...config, notificationsEmail: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des notifications par SMS
                    </p>
                  </div>
                  <Switch 
                    checked={config.notificationsSMS}
                    onCheckedChange={(checked) => setConfig({...config, notificationsSMS: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des notifications via WhatsApp
                    </p>
                  </div>
                  <Switch 
                    checked={config.notificationsWhatsApp}
                    onCheckedChange={(checked) => setConfig({...config, notificationsWhatsApp: checked})}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="securite" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à deux facteurs (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer la double authentification pour tous les utilisateurs
                    </p>
                  </div>
                  <Switch 
                    checked={config.authentification2FA}
                    onCheckedChange={(checked) => setConfig({...config, authentification2FA: checked})}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Timeout de session (minutes)</Label>
                  <Input 
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => setConfig({...config, sessionTimeout: Number(e.target.value)})}
                  />
                  <p className="text-sm text-muted-foreground">
                    Durée d'inactivité avant déconnexion automatique
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Tentatives de connexion maximales</Label>
                  <Input 
                    type="number"
                    value={config.tentativesConnexionMax}
                    onChange={(e) => setConfig({...config, tentativesConnexionMax: Number(e.target.value)})}
                  />
                  <p className="text-sm text-muted-foreground">
                    Nombre de tentatives avant blocage du compte
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline">Réinitialiser</Button>
            <Button onClick={handleSave}>Enregistrer les modifications</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationSysteme;
