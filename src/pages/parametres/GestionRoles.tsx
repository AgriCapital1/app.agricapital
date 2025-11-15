import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PERMISSIONS = [
  { id: "view_dashboard", label: "Voir le tableau de bord", category: "Général" },
  { id: "manage_users", label: "Gérer les utilisateurs", category: "Utilisateurs" },
  { id: "manage_planteurs", label: "Gérer les planteurs", category: "Planteurs" },
  { id: "manage_plantations", label: "Gérer les plantations", category: "Plantations" },
  { id: "manage_paiements", label: "Gérer les paiements", category: "Paiements" },
  { id: "validate_documents", label: "Valider les documents", category: "Documents" },
  { id: "view_reports", label: "Voir les rapports", category: "Rapports" },
  { id: "manage_commissions", label: "Gérer les commissions", category: "Finances" },
  { id: "manage_tickets", label: "Gérer les tickets", category: "Support" },
  { id: "manage_settings", label: "Gérer les paramètres", category: "Paramètres" },
];

const ROLES_DEFINITIONS = [
  { 
    role: "super_admin",
    nom: "Super Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    color: "destructive"
  },
  { 
    role: "pdg",
    nom: "PDG",
    description: "Direction générale et vision stratégique",
    color: "default"
  },
  { 
    role: "directeur_general",
    nom: "Directeur Général",
    description: "Gestion opérationnelle globale",
    color: "default"
  },
  { 
    role: "directeur_commercial",
    nom: "Directeur Commercial",
    description: "Direction de l'activité commerciale",
    color: "secondary"
  },
  { 
    role: "responsable_operations",
    nom: "Responsable Opérations",
    description: "Gestion des opérations terrain",
    color: "secondary"
  },
  { 
    role: "responsable_service_client",
    nom: "Responsable Service Client",
    description: "Gestion de la relation client",
    color: "secondary"
  },
  { 
    role: "responsable_zone",
    nom: "Responsable de Zone",
    description: "Gestion d'une zone géographique",
    color: "outline"
  },
  { 
    role: "chef_equipe",
    nom: "Chef d'Équipe",
    description: "Encadrement d'une équipe terrain",
    color: "outline"
  },
  { 
    role: "commercial",
    nom: "Commercial",
    description: "Acquisition et suivi des planteurs",
    color: "outline"
  },
  { 
    role: "technicien",
    nom: "Technicien",
    description: "Suivi technique des plantations",
    color: "outline"
  },
  { 
    role: "agent_service_client",
    nom: "Agent Service Client",
    description: "Support et assistance client",
    color: "outline"
  },
];

const GestionRoles = () => {
  const { toast } = useToast();
  const [roles] = useState(ROLES_DEFINITIONS);

  const groupedPermissions = PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof PERMISSIONS>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestion des Rôles et Permissions
              </CardTitle>
              <CardDescription>
                Gérer les rôles utilisateurs et leurs permissions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.role}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={role.color as any}>{role.nom}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{role.description}</span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Voir les permissions
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Permissions - {role.nom}</DialogTitle>
                              <DialogDescription>
                                Configuration des permissions pour ce rôle
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className="space-y-2">
                                  <h4 className="font-medium text-sm">{category}</h4>
                                  <div className="space-y-2 pl-4">
                                    {perms.map((permission) => (
                                      <div key={permission.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                          id={`${role.role}-${permission.id}`}
                                          checked={role.role === "super_admin"}
                                          disabled={role.role === "super_admin"}
                                        />
                                        <label
                                          htmlFor={`${role.role}-${permission.id}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {permission.label}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={role.role === "super_admin"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hiérarchie des Rôles</CardTitle>
                <CardDescription>
                  Structure hiérarchique des rôles dans l'organisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-destructive pl-4">
                    <p className="font-semibold">Direction</p>
                    <p className="text-sm text-muted-foreground">Super Admin → PDG → Directeur Général</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <p className="font-semibold">Management</p>
                    <p className="text-sm text-muted-foreground">
                      Directeur Commercial / Responsable Opérations / Responsable Service Client
                    </p>
                  </div>
                  <div className="border-l-4 border-secondary pl-4">
                    <p className="font-semibold">Terrain</p>
                    <p className="text-sm text-muted-foreground">
                      Responsable de Zone → Chef d'Équipe → Commercial / Technicien / Agent Service Client
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionRoles;
