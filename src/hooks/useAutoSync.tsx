
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useParkingSettings } from '@/contexts/ParkingSettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { ParkingSpot as ParkingSpotType } from '@/types/parking';

interface UseAutoSyncProps {
  spots: ParkingSpotType[];
  setSpots: (spots: ParkingSpotType[] | ((prev: ParkingSpotType[]) => ParkingSpotType[])) => void;
}

export const useAutoSync = ({ spots, setSpots }: UseAutoSyncProps) => {
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const { settings } = useParkingSettings();

  useEffect(() => {
    if (!user || !isSubscribed) return;

    // Função para sincronizar dados com o banco
    const syncWithDatabase = async () => {
      try {
        const { data, error } = await supabase
          .from('parking_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao sincronizar com o banco:', error);
          return;
        }

        if (data && data.length > 0) {
          setSpots((currentSpots: ParkingSpotType[]) => {
            const newSpots = [...currentSpots];
            
            // Primeiro, limpar todas as vagas ocupadas
            newSpots.forEach((spot, index) => {
              if (spot.isOccupied) {
                newSpots[index] = {
                  ...spot,
                  isOccupied: false,
                  vehicleInfo: undefined
                };
              }
            });
            
            // Depois, aplicar as sessões ativas do banco
            data.forEach(session => {
              const spotIndex = newSpots.findIndex(s => s.id === session.spot_id);
              if (spotIndex !== -1) {
                const entryTime = new Date(session.entry_time);
                const now = new Date();
                const minutes = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60));
                const hourlyRate = session.vehicle_type === 'car' ? settings.car_hourly_rate : settings.motorcycle_hourly_rate;
                const cost = parseFloat(((hourlyRate * minutes) / 60).toFixed(2));
                
                newSpots[spotIndex] = {
                  ...newSpots[spotIndex],
                  isOccupied: true,
                  vehicleInfo: {
                    licensePlate: session.license_plate,
                    phoneNumber: session.phone_number,
                    entryTime: entryTime,
                    minutes: minutes,
                    cost: cost
                  }
                };
              }
            });
            
            return newSpots;
          });
        }
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      }
    };

    // Sincronizar a cada 5 minutos
    const syncInterval = setInterval(syncWithDatabase, 5 * 60 * 1000); // 5 minutos

    // Sincronizar imediatamente
    syncWithDatabase();

    return () => clearInterval(syncInterval);
  }, [user, isSubscribed, setSpots, settings]);
};
