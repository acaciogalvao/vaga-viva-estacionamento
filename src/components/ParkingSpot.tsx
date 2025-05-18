
import React, { useEffect, useState } from 'react';
import { Car, Bike, Phone, X } from 'lucide-react';
import { ParkingSpot as ParkingSpotType } from '@/types/parking';
import { formatTime, formatCurrency } from '@/utils/parkingUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ParkingSpotProps {
  spot: ParkingSpotType;
  onRelease: (spotId: number) => void;
}

const ParkingSpot: React.FC<ParkingSpotProps> = ({ spot, onRelease }) => {
  const [minutes, setMinutes] = useState(spot.vehicleInfo?.minutes || 0);
  const [cost, setCost] = useState(spot.vehicleInfo?.cost || 0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (spot.isOccupied && spot.vehicleInfo) {
      // Função para calcular o tempo e custo
      const updateTimeAndCost = () => {
        const now = new Date();
        const entryTime = new Date(spot.vehicleInfo!.entryTime);
        const diffInMinutes = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60));
        
        // Calcular custo: R$10 por hora para carros, R$8 por hora para motos
        const hourlyRate = spot.type === 'car' ? 10 : 8;
        const newCost = parseFloat(((hourlyRate * diffInMinutes) / 60).toFixed(2));
        
        setMinutes(diffInMinutes);
        setCost(newCost);
        
        // Atualizar as informações da vaga
        spot.vehicleInfo!.minutes = diffInMinutes;
        spot.vehicleInfo!.cost = newCost;
      };
      
      // Executar cálculo imediatamente na montagem do componente
      updateTimeAndCost();
      
      // Definir um intervalo para atualizar a cada segundo
      timer = setInterval(updateTimeAndCost, 1000);
    }
    
    // Limpar o intervalo na desmontagem
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [spot]);

  const getSpotClassName = () => {
    const baseClasses = "gradient-card p-4 flex flex-col h-full min-h-[180px]";
    
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
                {formatTime(minutes)}
              </div>
            </div>
            <div>
              <div className="font-bold">Valor:</div>
              <div className="bg-white/20 rounded-md p-1 text-center">
                {formatCurrency(cost)}
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
