
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

    // Atualizar custos a cada 10 segundos para melhor responsividade
    const interval = setInterval(updateCosts, 10000); // 10 segundos

    // Atualizar imediatamente na primeira execução e quando configurações mudarem
    updateCosts();

    // Escutar mudanças nas configurações para recalcular imediatamente
    const handleSettingsUpdate = () => {
      updateCosts();
    };

    window.addEventListener('parkingSettingsUpdated', handleSettingsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('parkingSettingsUpdated', handleSettingsUpdate);
    };
  }, [user, setSpots, settings]);
};
