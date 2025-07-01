import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParkingSettings {
  car_hourly_rate: number;
  motorcycle_hourly_rate: number;
}

interface ParkingSettingsContextType {
  settings: ParkingSettings;
  loading: boolean;
  updateSettings: (newSettings: ParkingSettings) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const ParkingSettingsContext = createContext<ParkingSettingsContextType | undefined>(undefined);

interface ParkingSettingsProviderProps {
  children: ReactNode;
}

export const ParkingSettingsProvider: React.FC<ParkingSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ParkingSettings>({
    car_hourly_rate: 3.0,
    motorcycle_hourly_rate: 2.0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('car_hourly_rate, motorcycle_hourly_rate')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        const newSettings = {
          car_hourly_rate: data.car_hourly_rate || 3.0,
          motorcycle_hourly_rate: data.motorcycle_hourly_rate || 2.0
        };
        setSettings(newSettings);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('parkingSettingsUpdated', { 
          detail: newSettings 
        }));
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
          description: 'Não foi possível salvar as configurações.',
          variant: 'destructive',
        });
      } else {
        setSettings(newSettings);
        
        // Dispatch custom event to notify other components immediately
        window.dispatchEvent(new CustomEvent('parkingSettingsUpdated', { 
          detail: newSettings 
        }));
        
        toast({
          title: 'Configurações salvas!',
          description: 'Os valores do estacionamento foram atualizados em todas as vagas.',
        });
      }
    } catch (error) {
      console.error('Error in updateSettings:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado ao salvar as configurações.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const value = {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings
  };

  return (
    <ParkingSettingsContext.Provider value={value}>
      {children}
    </ParkingSettingsContext.Provider>
  );
};

export const useParkingSettings = () => {
  const context = useContext(ParkingSettingsContext);
  if (context === undefined) {
    throw new Error('useParkingSettings must be used within a ParkingSettingsProvider');
  }
  return context;
};