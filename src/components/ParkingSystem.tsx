
import React, { useState, useEffect } from 'react';
import { ParkingSpot as ParkingSpotType, ParkingFormData } from '@/types/parking';
import ParkingSpot from '@/components/ParkingSpot';
import ParkingForm from '@/components/ParkingForm';
import { useToast } from '@/hooks/use-toast';

const ParkingSystem: React.FC = () => {
  // Initialize parking spots: 30 for cars (1-30) and 30 for motorcycles (31-60)
  const [spots, setSpots] = useState<ParkingSpotType[]>(() => {
    const initSpots: ParkingSpotType[] = [];
    
    // Create 30 car spots
    for (let i = 1; i <= 30; i++) {
      initSpots.push({
        id: i,
        type: 'car',
        isOccupied: false
      });
    }
    
    // Create 30 motorcycle spots
    for (let i = 31; i <= 60; i++) {
      initSpots.push({
        id: i,
        type: 'motorcycle',
        isOccupied: false
      });
    }
    
    return initSpots;
  });

  const [searchResults, setSearchResults] = useState<ParkingSpotType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Calculate available spots
  const availableCars = spots.filter(s => s.type === 'car' && !s.isOccupied).length;
  const availableMotorcycles = spots.filter(s => s.type === 'motorcycle' && !s.isOccupied).length;

  const handleParkVehicle = (data: ParkingFormData) => {
    setSpots(currentSpots => {
      const newSpots = [...currentSpots];
      
      // Find the first available spot for the vehicle type
      const spotIndex = newSpots.findIndex(s => 
        s.type === data.vehicleType && !s.isOccupied
      );
      
      if (spotIndex !== -1) {
        newSpots[spotIndex] = {
          ...newSpots[spotIndex],
          isOccupied: true,
          vehicleInfo: {
            licensePlate: data.licensePlate,
            phoneNumber: data.phoneNumber,
            entryTime: new Date(),
            minutes: 0,
            cost: 0
          }
        };
      }
      
      return newSpots;
    });

    // Reset search results when parking a new vehicle
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleReleaseSpot = (spotId: number) => {
    setSpots(currentSpots => {
      return currentSpots.map(spot => {
        if (spot.id === spotId) {
          // Calculate final cost before releasing
          const finalCost = spot.vehicleInfo?.cost || 0;
          
          toast({
            title: 'Vaga liberada',
            description: `Veículo com placa ${spot.vehicleInfo?.licensePlate} saiu. Valor total: R$ ${finalCost.toFixed(2)}`,
          });
          
          return {
            ...spot,
            isOccupied: false,
            vehicleInfo: undefined
          };
        }
        return spot;
      });
    });

    // Update search results
    setSearchResults(prev => prev.filter(spot => spot.id !== spotId));
  };

  const handleSearch = (licensePlate: string) => {
    const results = spots.filter(
      spot => spot.isOccupied && 
      spot.vehicleInfo?.licensePlate.replace(/-/g, '') === licensePlate.replace(/-/g, '')
    );
    
    setSearchResults(results);
    setIsSearching(true);
    
    if (results.length === 0) {
      toast({
        title: 'Nenhum resultado',
        description: `Não encontramos veículos com a placa ${licensePlate}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Veículo encontrado',
        description: `Encontramos ${results.length} veículo(s) com a placa ${licensePlate}`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-primary bg-clip-text text-transparent">
        Sistema de Estacionamento
      </h1>
      
      {/* Form component */}
      <ParkingForm 
        onPark={handleParkVehicle} 
        onSearch={handleSearch}
        availableCars={availableCars}
        availableMotorcycles={availableMotorcycles}
      />

      {/* Search results */}
      {isSearching && searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 bg-gradient-secondary bg-clip-text text-transparent">
            Resultados da Busca
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchResults.map(spot => (
              <ParkingSpot 
                key={`search-${spot.id}`} 
                spot={spot} 
                onRelease={handleReleaseSpot} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Car spots */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
          Vagas para Carros ({availableCars} disponíveis)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {spots.filter(spot => spot.type === 'car').map(spot => (
            <ParkingSpot 
              key={spot.id} 
              spot={spot} 
              onRelease={handleReleaseSpot} 
            />
          ))}
        </div>
      </div>

      {/* Motorcycle spots */}
      <div>
        <h2 className="text-xl font-bold mb-4 bg-gradient-secondary bg-clip-text text-transparent flex items-center gap-2">
          Vagas para Motos ({availableMotorcycles} disponíveis)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {spots.filter(spot => spot.type === 'motorcycle').map(spot => (
            <ParkingSpot 
              key={spot.id} 
              spot={spot} 
              onRelease={handleReleaseSpot} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParkingSystem;
