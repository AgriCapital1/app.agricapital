import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateSuperAdmin = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createSuperAdmin = async () => {
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-super-admin', {
        body: {
          username: 'admin',
          email: 'contact@agricapital.ci',
          password: '@AgriCapital',
          nom_complet: 'KOFFI Inocent',
          telephone: '0759566087'
        }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Compte super admin créé avec succès !",
      });

      console.log('Super admin créé:', data);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer le compte",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Initialisation AgriCapital</CardTitle>
          <CardDescription>
            Créer le compte super administrateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p><strong>Nom d'utilisateur:</strong> admin</p>
            <p><strong>Email:</strong> contact@agricapital.ci</p>
            <p><strong>Nom:</strong> KOFFI Inocent</p>
            <p><strong>Téléphone:</strong> 0759566087</p>
            <p><strong>Rôle:</strong> Super Administrateur</p>
          </div>
          
          <Button 
            onClick={createSuperAdmin}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Création en cours..." : "Créer le compte Super Admin"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Cette page sert uniquement à l'initialisation du système.
            Après création, connectez-vous via la page de login.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSuperAdmin;
