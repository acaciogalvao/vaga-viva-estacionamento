
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useNotifications = () => {
  const { user } = useAuth();
  const { subscription, subscriptionEnd } = useSubscription();
  const { toast } = useToast();
  const [hasCheckedExpiration, setHasCheckedExpiration] = useState(false);

  useEffect(() => {
    if (user && subscription && subscriptionEnd && !hasCheckedExpiration) {
      checkSubscriptionExpiration();
      setHasCheckedExpiration(true);
    }
  }, [user, subscription, subscriptionEnd, hasCheckedExpiration]);

  const checkSubscriptionExpiration = () => {
    if (!subscriptionEnd) return;

    const now = new Date();
    const endDate = new Date(subscriptionEnd);
    const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Notificar se faltam 7 dias ou menos
    if (daysUntilExpiration <= 7 && daysUntilExpiration > 0) {
      toast({
        title: 'Assinatura expirando em breve!',
        description: `Sua assinatura expira em ${daysUntilExpiration} dias. Renove para continuar usando o sistema.`,
        variant: 'destructive',
      });
    }
    
    // Notificar se já expirou
    if (daysUntilExpiration <= 0) {
      toast({
        title: 'Assinatura expirada!',
        description: 'Sua assinatura expirou. Renove para continuar usando o sistema.',
        variant: 'destructive',
      });
    }
  };

  const sendExpirationEmail = async () => {
    if (!user || !subscriptionEnd) return;

    try {
      const { error } = await supabase.functions.invoke('send-expiration-notification', {
        body: {
          email: user.email,
          subscriptionEnd: subscriptionEnd,
        },
      });

      if (error) {
        console.error('Error sending expiration email:', error);
      }
    } catch (error) {
      console.error('Error in sendExpirationEmail:', error);
    }
  };

  return {
    checkSubscriptionExpiration,
    sendExpirationEmail,
  };
};
