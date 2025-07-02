
import React, { useEffect, useState } from 'react';
import { Car, Bike, Phone, X } from 'lucide-react';
import { ParkingSpot as ParkingSpotType } from '@/types/parking';
import { formatCurrency } from '@/utils/parkingUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ParkingSpotProps {
  spot: ParkingSpotType;
  onRelease: (spotId: number) => void;
  isSearchResult?: boolean;
  onClearSearch?: () => void;
}

const ParkingSpot: React.FC<ParkingSpotProps> = ({ 
  spot, 
  onRelease, 
  isSearchResult = false,
  onClearSearch 
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (spot.isOccupied && spot.vehicleInfo) {
      // Função para calcular apenas os segundos
      const updateSeconds = () => {
        const now = new Date();
        const entryTime = new Date(spot.vehicleInfo!.entryTime);
        const diffInSeconds = Math.floor((now.getTime() - entryTime.getTime()) / 1000);
        const newSeconds = diffInSeconds % 60;
        setSeconds(newSeconds);
      };
      
      // Executar cálculo imediatamente
      updateSeconds();
      
      // Definir um intervalo para atualizar apenas os segundos a cada segundo
      timer = setInterval(updateSeconds, 1000);
    } else {
      // Resetar valores quando a vaga não está ocupada
      setSeconds(0);
    }
    
    // Limpar o intervalo na desmontagem
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [spot.isOccupied, spot.vehicleInfo?.entryTime]);

  const getSpotClassName = () => {
    const baseClasses = "gradient-card p-4 flex flex-col h-full min-h-[180px] relative";
    
    if (spot.isOccupied) {
      return cn(
        baseClasses,
        spot.type === 'car' ? 'car-spot occupied' : 'motorcycle-spot occupied'
      );
    }
    
    return cn(
      baseClasses,
      spot.type === 'car' ? 'car-spot available' : 'motorcycle-spot available'
    );
  };

  const formatTime = (totalMinutes: number, s: number): string => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={getSpotClassName()}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="font-bold text-lg mr-2">#{spot.id}</span>
          {spot.type === 'car' ? (
            <Car size={20} />
          ) : (
            <Bike size={20} />
          )}
        </div>
        <div className="text-sm font-medium">
          {spot.isOccupied ? 'Ocupada' : 'Disponível'}
        </div>
      </div>

      {spot.isOccupied && spot.vehicleInfo ? (
        <div className="flex-grow">
          <div className="text-sm mb-2">
            <div className="font-bold mb-1">Placa:</div>
            <div className="bg-white/20 rounded-md p-1 text-center">
              {spot.vehicleInfo.licensePlate}
            </div>
          </div>
          
          <div className="text-sm mb-2">
            <div className="flex items-center gap-1">
              <Phone size={14} />
              <span className="truncate">{spot.vehicleInfo.phoneNumber}</span>
            </div>
          </div>
          
          <div className="flex justify-between text-sm mt-2">
            <div>
              <div className="font-bold">Tempo:</div>
              <div className="bg-white/20 rounded-md p-1 text-center">
                {formatTime(spot.vehicleInfo.minutes || 0, seconds)}
              </div>
            </div>
            <div>
              <div className="font-bold">Valor:</div>
              <div className="bg-white/20 rounded-md p-1 text-center">
                {formatCurrency(spot.vehicleInfo.cost || 0)}
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full mt-2 bg-white/20 hover:bg-white/30 border-white/40"
            onClick={() => onRelease(spot.id)}
          >
            <X size={14} className="mr-1" /> Liberar
          </Button>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center">
          <div className="opacity-80">
            {spot.type === 'car' ? 'Vaga para carro' : 'Vaga para moto'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSpot;
