import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PromotionActive {
  id: string;
  nom_promotion: string;
  montant_reduit_ha: number;
  montant_normal_ha: number;
  reduction_pct: number;
  date_debut: string;
  date_fin: string;
}

export const usePromotionActive = () => {
  return useQuery({
    queryKey: ['promotion-active'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .rpc('get_promotion_active');
      
      if (error) throw error;
      
      return data && data.length > 0 ? (data[0] as PromotionActive) : null;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const calculerMontantDA = (
  superficieHa: number,
  promotionActive: PromotionActive | null
): {
  montantUnitaire: number;
  montantTotal: number;
  economie: number;
  promotionAppliquee: boolean;
} => {
  const montantNormal = 30000;
  const montantUnitaire = promotionActive 
    ? promotionActive.montant_reduit_ha 
    : montantNormal;
  
  const montantTotal = superficieHa * montantUnitaire;
  const montantSansPromo = superficieHa * montantNormal;
  const economie = montantSansPromo - montantTotal;
  
  return {
    montantUnitaire,
    montantTotal,
    economie,
    promotionAppliquee: promotionActive !== null,
  };
};
