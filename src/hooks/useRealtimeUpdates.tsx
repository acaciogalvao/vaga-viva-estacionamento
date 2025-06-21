
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ParkingSpot as ParkingSpotType } from '@/types/parking';

interface UseRealtimeUpdatesProps {
  spots: ParkingSpotType[];
  setSpots: (spots: ParkingSpotType[] | ((prev: ParkingSpotType[]) => ParkingSpotType[])) => void;
}

export const useRealtimeUpdates = ({ spots, setSpots }: UseRealtimeUpdatesProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Função para calcular o custo baseado no tempo
    const calculateCost = (minutes: number, vehicleType: 'car' | 'motorcycle') => {
      const baseRate = vehicleType === 'car' ? 3.0 : 2.0; // R$ por hora
      const hours = Math.ceil(minutes / 60);
      return Math.max(hours * baseRate, baseRate); // Mínimo 1 hora de cobrança
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

    // Atualizar custos a cada minuto
    const interval = setInterval(updateCosts, 60000); // 60 segundos

    // Atualizar imediatamente na primeira execução
    updateCosts();

    return () => clearInterval(interval);
  }, [user, setSpots]);
};
