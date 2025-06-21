
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        setSubscription(data);
      } else {
        // Create a new subscription record
        const { data: newSubscription, error: insertError } = await supabase
          .from('subscribers')
          .insert({
            user_id: user.id,
            email: user.email,
            subscribed: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating subscription:', insertError);
        } else {
          setSubscription(newSubscription);
        }
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (tier: string) => {
    if (!user || !subscription) return;

    try {
      const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('subscribers')
        .update({
          subscribed: true,
          subscription_tier: tier,
          subscription_end: subscriptionEndDate,
        })
        .eq('id', subscription.id);

      if (error) {
        console.error('Error updating subscription:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar a assinatura',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Assinatura ativada!',
          description: `Plano ${tier} ativado com sucesso!`,
        });
        
        // Send confirmation email
        await sendConfirmationEmail(tier, subscriptionEndDate);
        
        fetchSubscription();
      }
    } catch (error) {
      console.error('Error in updateSubscription:', error);
    }
  };

  const sendConfirmationEmail = async (tier: string, subscriptionEnd: string) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: user.email,
          subscriptionTier: tier,
          subscriptionEnd: subscriptionEnd,
        },
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const isSubscribed = subscription?.subscribed ?? false;
  const subscriptionTier = subscription?.subscription_tier;
  const subscriptionEnd = subscription?.subscription_end;

  return {
    subscription,
    loading,
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    updateSubscription,
    fetchSubscription,
  };
};
