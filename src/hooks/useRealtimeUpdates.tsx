
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParkingSettings } from '@/contexts/ParkingSettingsContext';
import { ParkingSpot as ParkingSpotType } from '@/types/parking';

interface UseRealtimeUpdatesProps {
  spots: ParkingSpotType[];
  setSpots: (spots: ParkingSpotType[] | ((prev: ParkingSpotType[]) => ParkingSpotType[])) => void;
  searchResults?: ParkingSpotType[];
  setSearchResults?: (results: ParkingSpotType[] | ((prev: ParkingSpotType[]) => ParkingSpotType[])) => void;
}

export const useRealtimeUpdates = ({ spots, setSpots, searchResults, setSearchResults }: UseRealtimeUpdatesProps) => {
  const { user } = useAuth();
  const { settings } = useParkingSettings();

  useEffect(() => {
    if (!user) return;

    console.log('🔄 Starting unified timer system');
    let unifiedInterval: NodeJS.Timeout | null = null;

    // Função unificada que atualiza tudo a cada segundo
    const updateAll = () => {
      const now = new Date();
      
      // Função para atualizar spots
      const updateSpots = (currentSpots: ParkingSpotType[]) => {
        let hasUpdates = false;
        
        const newSpots = currentSpots.map(spot => {
          if (spot.isOccupied && spot.vehicleInfo) {
            const entryTime = new Date(spot.vehicleInfo.entryTime);
            const totalSeconds = Math.floor((now.getTime() - entryTime.getTime()) / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            
            // Calcular custo usando as configurações atuais (valor por minuto acumulado)
            const hourlyRate = spot.type === 'car' ? settings.car_hourly_rate : settings.motorcycle_hourly_rate;
            const minuteRate = hourlyRate / 60; // Valor por minuto
            const cost = parseFloat((minuteRate * minutes).toFixed(2)); // Valor acumulado por minutos
            
            // Verificar se houve mudança nos valores importantes
            if (spot.vehicleInfo.minutes !== minutes || spot.vehicleInfo.cost !== cost) {
              hasUpdates = true;
            }
            
            return {
              ...spot,
              vehicleInfo: {
                ...spot.vehicleInfo,
                minutes,
                cost,
                seconds: totalSeconds % 60 // Adicionar segundos para o cronômetro
              }
            };
          }
          return spot;
        });
        
        if (hasUpdates) {
          console.log('⏰ Updated parking data at:', now.toLocaleTimeString());
        }
        
        return newSpots;
      };

      // Atualizar spots principais
      setSpots(updateSpots);

      // Atualizar search results se existirem
      if (searchResults && setSearchResults) {
        setSearchResults(updateSpots);
      }
    };

    // Atualizar imediatamente
    updateAll();

    // Configurar intervalo para atualizar a cada segundo
    unifiedInterval = setInterval(updateAll, 1000);

    // Escutar mudanças nas configurações para recalcular imediatamente
    const handleSettingsUpdate = () => {
      console.log('⚙️ Settings updated, recalculating costs');
      updateAll();
    };

    window.addEventListener('parkingSettingsUpdated', handleSettingsUpdate);

    return () => {
      console.log('🛑 Cleaning up unified timer');
      if (unifiedInterval) clearInterval(unifiedInterval);
      window.removeEventListener('parkingSettingsUpdated', handleSettingsUpdate);
    };
  }, [user, setSpots]);
};
