
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParkingSettings } from '@/contexts/ParkingSettingsContext';
import { ParkingSpot as ParkingSpotType } from '@/types/parking';

interface UseRealtimeUpdatesProps {
  spots: ParkingSpotType[];
  setSpots: (spots: ParkingSpotType[] | ((prev: ParkingSpotType[]) => ParkingSpotType[])) => void;
}

export const useRealtimeUpdates = ({ spots, setSpots }: UseRealtimeUpdatesProps) => {
  const { user } = useAuth();
  const { settings } = useParkingSettings();

  useEffect(() => {
    if (!user) return;

    // Função para calcular o custo baseado no tempo e configurações personalizadas
    const calculateCost = (minutes: number, vehicleType: 'car' | 'motorcycle') => {
      const hourlyRate = vehicleType === 'car' ? settings.car_hourly_rate : settings.motorcycle_hourly_rate;
      return parseFloat(((hourlyRate * minutes) / 60).toFixed(2));
    };

    // Função para atualizar os custos dos veículos estacionados
    const updateCosts = () => {
      setSpots((currentSpots: ParkingSpotType[]) => {
        return currentSpots.map(spot => {
          if (spot.isOccupied && spot.vehicleInfo) {
            const now = new Date();
            const entryTime = spot.vehicleInfo.entryTime;
            const minutes = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60));
            const cost = calculateCost(minutes, spot.type);
            
            return {
              ...spot,
              vehicleInfo: {
                ...spot.vehicleInfo,
                minutes,
                cost
              }
            };
          }
          return spot;
        });
      });
    };

    // Calcular tempo até o próximo minuto para sincronizar
    const now = new Date();
    const secondsUntilNextMinute = 60 - now.getSeconds();
    const millisecondsUntilNextMinute = (secondsUntilNextMinute * 1000) - now.getMilliseconds();

    // Atualizar imediatamente na primeira execução
    updateCosts();

    let mainInterval: NodeJS.Timeout | null = null;

    // Definir timeout para sincronizar com o próximo minuto
    const syncTimeout = setTimeout(() => {
      updateCosts();
      // Depois disso, atualizar exatamente a cada 60 segundos
      mainInterval = setInterval(updateCosts, 60000);
    }, millisecondsUntilNextMinute);

    // Escutar mudanças nas configurações para recalcular imediatamente
    const handleSettingsUpdate = () => {
      updateCosts();
    };

    window.addEventListener('parkingSettingsUpdated', handleSettingsUpdate);

    return () => {
      clearTimeout(syncTimeout);
      if (mainInterval) clearInterval(mainInterval);
      window.removeEventListener('parkingSettingsUpdated', handleSettingsUpdate);
    };
  }, [user, setSpots, settings]);
};
