
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

    let mainInterval: NodeJS.Timeout | null = null;
    let syncTimeout: NodeJS.Timeout | null = null;

    // Função para calcular o custo baseado no tempo e configurações atuais
    const calculateCost = (minutes: number, vehicleType: 'car' | 'motorcycle') => {
      const hourlyRate = vehicleType === 'car' ? settings.car_hourly_rate : settings.motorcycle_hourly_rate;
      return parseFloat(((hourlyRate * minutes) / 60).toFixed(2));
    };

    // Função para atualizar os custos dos veículos estacionados
    const updateCosts = () => {
      setSpots((currentSpots: ParkingSpotType[]) => {
        const now = new Date();
        return currentSpots.map(spot => {
          if (spot.isOccupied && spot.vehicleInfo) {
            const entryTime = new Date(spot.vehicleInfo.entryTime);
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

    // Função para iniciar o sistema de atualização sincronizada
    const startSyncronizedUpdates = () => {
      // Limpar timers existentes
      if (syncTimeout) clearTimeout(syncTimeout);
      if (mainInterval) clearInterval(mainInterval);

      // Calcular tempo até o próximo minuto exato
      const now = new Date();
      const secondsUntilNextMinute = 60 - now.getSeconds();
      const millisecondsUntilNextMinute = (secondsUntilNextMinute * 1000) - now.getMilliseconds();

      // Atualizar imediatamente
      updateCosts();

      // Sincronizar com o próximo minuto exato
      syncTimeout = setTimeout(() => {
        updateCosts();
        // Configurar intervalo para atualizar exatamente a cada minuto
        mainInterval = setInterval(updateCosts, 60000);
      }, millisecondsUntilNextMinute);
    };

    // Iniciar atualizações sincronizadas
    startSyncronizedUpdates();

    // Escutar mudanças nas configurações para recalcular e ressincronizar
    const handleSettingsUpdate = () => {
      updateCosts();
      // Ressincronizar após mudança de configuração
      startSyncronizedUpdates();
    };

    window.addEventListener('parkingSettingsUpdated', handleSettingsUpdate);

    return () => {
      if (syncTimeout) clearTimeout(syncTimeout);
      if (mainInterval) clearInterval(mainInterval);
      window.removeEventListener('parkingSettingsUpdated', handleSettingsUpdate);
    };
  }, [user, setSpots, settings.car_hourly_rate, settings.motorcycle_hourly_rate]);
};
