
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParkingSettings {
  car_hourly_rate: number;
  motorcycle_hourly_rate: number;
}

export const useParkingSettings = () => {
  const [settings, setSettings] = useState<ParkingSettings>({
    car_hourly_rate: 3.0,
    motorcycle_hourly_rate: 2.0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('car_hourly_rate, motorcycle_hourly_rate')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        setSettings({
          car_hourly_rate: data.car_hourly_rate || 3.0,
          motorcycle_hourly_rate: data.motorcycle_hourly_rate || 2.0
        });
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: ParkingSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          car_hourly_rate: newSettings.car_hourly_rate,
          motorcycle_hourly_rate: newSettings.motorcycle_hourly_rate
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating settings:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar as configurações',
          variant: 'destructive',
        });
      } else {
        setSettings(newSettings);
        toast({
          title: 'Configurações salvas!',
          description: 'Os valores do estacionamento foram atualizados com sucesso.',
        });
      }
    } catch (error) {
      console.error('Error in updateSettings:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    fetchSettings
  };
};
