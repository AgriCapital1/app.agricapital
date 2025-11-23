import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Mail, Phone, DollarSign, Settings, Bell, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Configuration {
  id: string;
  cle: string;
  valeur: string;
  description: string | null;
  categorie: string;
  type_donnee: string;
  modifiable: boolean;
}

const ConfigurationSysteme = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const { data: configurations, isLoading } = useQuery({
    queryKey: ['configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuration_systeme')
        .select('*')
        .order('categorie', { ascending: true })
        .order('cle', { ascending: true});
      
      if (error) throw error;
      return data as Configuration[];
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, valeur }: { id: string; valeur: string }) => {
      const { error } = await supabase
        .from('configuration_systeme')
        .update({ valeur, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      setEditedValues({});
      toast({
        title: "Configuration mise à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration.",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  const handleSave = (config: Configuration) => {
    const newValue = editedValues[config.id] || config.valeur;
    updateConfigMutation.mutate({ id: config.id, valeur: newValue });
  };

  const handleValueChange = (configId: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [configId]: value }));
  };

  const renderInput = (config: Configuration) => {
    const currentValue = editedValues[config.id] ?? config.valeur;
    const hasChanged = editedValues[config.id] !== undefined && editedValues[config.id] !== config.valeur;

    switch (config.type_donnee) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor={config.id}>{config.description || config.cle}</Label>
            </div>
            <Switch
              id={config.id}
              checked={currentValue === 'true'}
              onCheckedChange={(checked) => handleValueChange(config.id, checked ? 'true' : 'false')}
              disabled={!config.modifiable || updateConfigMutation.isPending}
            />
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={config.id}>{config.description || config.cle}</Label>
            <Input
              id={config.id}
              type="number"
              value={currentValue}
              onChange={(e) => handleValueChange(config.id, e.target.value)}
              disabled={!config.modifiable || updateConfigMutation.isPending}
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={config.id}>{config.description || config.cle}</Label>
            <Input
              id={config.id}
              type={config.type_donnee === 'email' ? 'email' : config.type_donnee === 'url' ? 'url' : 'text'}
              value={currentValue}
              onChange={(e) => handleValueChange(config.id, e.target.value)}
              disabled={!config.modifiable || updateConfigMutation.isPending}
            />
          </div>
        );
    }
  };

  const groupedConfigs = configurations?.reduce((acc, config) => {
    if (!acc[config.categorie]) {
      acc[config.categorie] = [];
    }
    acc[config.categorie].push(config);
    return acc;
  }, {} as Record<string, Configuration[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <Globe className="h-4 w-4" />;
      case 'contact': return <Mail className="h-4 w-4" />;
      case 'paiements': return <DollarSign className="h-4 w-4" />;
      case 'commissions': return <DollarSign className="h-4 w-4" />;
      case 'notifications': return <Bell className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuration Système
          </CardTitle>
          <CardDescription>
            Configuration globale de la plateforme app.agricapital.ci
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              {Object.keys(groupedConfigs || {}).map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedConfigs || {}).map(([category, configs]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                {configs.map((config) => {
                  const hasChanged = editedValues[config.id] !== undefined && editedValues[config.id] !== config.valeur;
                  
                  return (
                    <Card key={config.id}>
                      <CardContent className="pt-6 space-y-4">
                        {renderInput(config)}
                        {config.modifiable && hasChanged && (
                          <Button
                            onClick={() => handleSave(config)}
                            disabled={updateConfigMutation.isPending}
                            size="sm"
                          >
                            {updateConfigMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Enregistrer
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationSysteme;
