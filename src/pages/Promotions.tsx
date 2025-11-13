import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Promotion {
  id: string;
  nom_promotion: string;
  montant_reduit_ha: number;
  montant_normal_ha: number;
  reduction_pct: number;
  date_debut: string;
  date_fin: string;
  statut: 'ACTIF' | 'INACTIF' | 'EXPIRÉ';
  description: string | null;
  created_at: string;
}

const Promotions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [formData, setFormData] = useState({
    nom_promotion: "",
    montant_reduit_ha: "20000",
    date_debut: "",
    date_fin: "",
    description: "",
  });

  // Fetch promotions
  const { data: promotions, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Promotion[];
    }
  });

  // Create/Update promotion
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const promoData = {
        nom_promotion: data.nom_promotion,
        montant_reduit_ha: parseInt(data.montant_reduit_ha),
        montant_normal_ha: 30000,
        date_debut: new Date(data.date_debut).toISOString(),
        date_fin: new Date(data.date_fin).toISOString(),
        description: data.description,
        statut: 'ACTIF' as const,
      };

      if (editingPromo) {
        const { error } = await (supabase as any)
          .from('promotions')
          .update(promoData)
          .eq('id', editingPromo.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('promotions')
          .insert([promoData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({
        title: "Succès",
        description: editingPromo ? "Promotion modifiée" : "Promotion créée",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await (supabase as any)
        .from('promotions')
        .update({ statut: newStatus })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({
        title: "Succès",
        description: "Statut modifié",
      });
    }
  });

  // Delete promotion
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('promotions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({
        title: "Succès",
        description: "Promotion supprimée",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nom_promotion: "",
      montant_reduit_ha: "20000",
      date_debut: "",
      date_fin: "",
      description: "",
    });
    setEditingPromo(null);
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData({
      nom_promotion: promo.nom_promotion,
      montant_reduit_ha: promo.montant_reduit_ha.toString(),
      date_debut: format(new Date(promo.date_debut), 'yyyy-MM-dd'),
      date_fin: format(new Date(promo.date_fin), 'yyyy-MM-dd'),
      description: promo.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      ACTIF: "default",
      INACTIF: "secondary",
      EXPIRÉ: "destructive",
    };
    return <Badge variant={variants[statut] || "secondary"}>{statut}</Badge>;
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Promotions</h1>
            <p className="text-muted-foreground">Configuration des réductions sur le Droit d'Accès</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPromo ? "Modifier la promotion" : "Créer une promotion"}
                </DialogTitle>
                <DialogDescription>
                  Le montant normal est fixé à 30 000 F/ha. La réduction sera calculée automatiquement.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la promotion *</Label>
                  <Input
                    id="nom"
                    value={formData.nom_promotion}
                    onChange={(e) => setFormData({...formData, nom_promotion: e.target.value})}
                    placeholder="Ex: Promo Lancement Phase Pilote"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="montant">Montant réduit (F/ha) *</Label>
                    <Input
                      id="montant"
                      type="number"
                      value={formData.montant_reduit_ha}
                      onChange={(e) => setFormData({...formData, montant_reduit_ha: e.target.value})}
                      min="1"
                      max="29999"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Réduction: {((30000 - parseInt(formData.montant_reduit_ha || "0")) / 30000 * 100).toFixed(2)}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Montant normal</Label>
                    <Input value="30 000 F/ha" disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debut">Date début *</Label>
                    <Input
                      id="debut"
                      type="date"
                      value={formData.date_debut}
                      onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fin">Date fin *</Label>
                    <Input
                      id="fin"
                      type="date"
                      value={formData.date_fin}
                      onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Informations complémentaires..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des promotions</CardTitle>
            <CardDescription>
              Une seule promotion ACTIVE peut être configurée à la fois
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8">Chargement...</p>
            ) : promotions && promotions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Montant réduit</TableHead>
                    <TableHead>Montant normal</TableHead>
                    <TableHead>Réduction</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-medium">{promo.nom_promotion}</TableCell>
                      <TableCell>{promo.montant_reduit_ha.toLocaleString()} F</TableCell>
                      <TableCell>{promo.montant_normal_ha.toLocaleString()} F</TableCell>
                      <TableCell>
                        <Badge variant="outline">{promo.reduction_pct.toFixed(1)}%</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(promo.date_debut), 'dd/MM/yyyy', { locale: fr })} -
                        {format(new Date(promo.date_fin), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{getStatusBadge(promo.statut)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(promo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStatusMutation.mutate({
                            id: promo.id,
                            newStatus: promo.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF'
                          })}
                        >
                          {promo.statut === 'ACTIF' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Supprimer cette promotion ?')) {
                              deleteMutation.mutate(promo.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Aucune promotion configurée. Créez-en une pour commencer.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Promotions;
