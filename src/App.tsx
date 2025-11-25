import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CreateSuperAdmin from "./pages/CreateSuperAdmin";
import Planteurs from "./pages/Souscriptions";
import PlanteurDetail from "./pages/PlanteurDetail";
import Plantations from "./pages/Plantations";
import Paiements from "./pages/Paiements";
import Utilisateurs from "./pages/Utilisateurs";
import RapportsFinanciers from "./pages/RapportsFinanciers";
import Commissions from "./pages/Commissions";
import PortefeuilleClients from "./pages/PortefeuilleClients";
import Equipes from "./pages/Equipes";
import Promotions from "./pages/Promotions";
import NouvelleSouscription from "./pages/NouvelleSouscription";
import Parametres from "./pages/Parametres";
import HistoriqueComplet from "./pages/HistoriqueComplet";
import PaiementsWave from "./pages/PaiementsWave";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/souscriptions" element={<Planteurs />} />
            <Route path="/planteur/:id" element={<PlanteurDetail />} />
            <Route path="/planteur/:id/historique" element={<HistoriqueComplet />} />
            <Route path="/plantations" element={<Plantations />} />
            <Route path="/paiements" element={<Paiements />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/rapports-financiers" element={<RapportsFinanciers />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/portefeuille-clients" element={<PortefeuilleClients />} />
            <Route path="/equipes" element={<Equipes />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/parametres" element={<Parametres />} />
            <Route path="/nouvelle-souscription" element={<NouvelleSouscription />} />
            <Route path="/paiements-wave" element={<PaiementsWave />} />
            <Route path="/create-super-admin" element={<CreateSuperAdmin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
