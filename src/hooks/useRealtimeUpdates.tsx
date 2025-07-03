
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

    console.log('🔄 Starting realtime updates system');
    let mainInterval: NodeJS.Timeout | null = null;

    // Função para calcular o custo baseado no tempo e configurações atuais
    const calculateCost = (minutes: number, vehicleType: 'car' | 'motorcycle') => {
      const hourlyRate = vehicleType === 'car' ? settings.car_hourly_rate : settings.motorcycle_hourly_rate;
      return parseFloat(((hourlyRate * minutes) / 60).toFixed(2));
    };

    // Função para atualizar os custos dos veículos estacionados
    const updateCosts = () => {
      console.log('⏰ Updating costs at:', new Date().toLocaleTimeString());
      
      setSpots((currentSpots: ParkingSpotType[]) => {
        const now = new Date();
        let updatedCount = 0;
        
        const newSpots = currentSpots.map(spot => {
          if (spot.isOccupied && spot.vehicleInfo) {
            const entryTime = new Date(spot.vehicleInfo.entryTime);
            const minutes = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60));
            const cost = calculateCost(minutes, spot.type);
            
            updatedCount++;
            
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
        
        if (updatedCount > 0) {
          console.log(`💰 Updated ${updatedCount} occupied spots`);
        }
        
        return newSpots;
      });
    };

    // Atualizar imediatamente
    updateCosts();

    // Configurar intervalo para atualizar a cada minuto (60 segundos)
    mainInterval = setInterval(() => {
      updateCosts();
    }, 60000);

    // Escutar mudanças nas configurações para recalcular imediatamente
    const handleSettingsUpdate = () => {
      console.log('⚙️ Settings updated, recalculating costs');
      updateCosts();
    };

    window.addEventListener('parkingSettingsUpdated', handleSettingsUpdate);

    return () => {
      console.log('🛑 Cleaning up realtime updates');
      if (mainInterval) clearInterval(mainInterval);
      window.removeEventListener('parkingSettingsUpdated', handleSettingsUpdate);
    };
  }, [user, setSpots, settings.car_hourly_rate, settings.motorcycle_hourly_rate]);
};
