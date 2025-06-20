import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { ParkingSpot as ParkingSpotType, ParkingFormData } from '@/types/parking';
import ParkingSpot from '@/components/ParkingSpot';
import ParkingForm, { ParkingFormRef } from '@/components/ParkingForm';
import { useToast } from '@/hooks/use-toast';
import { X, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ParkingSystemWithAuthProps {
  onShowDashboard: () => void;
}

const ParkingSystemWithAuth: React.FC<ParkingSystemWithAuthProps> = ({ onShowDashboard }) => {
  const { user } = useAuth();
  const { isSubscribed, subscriptionTier } = useSubscription();
  
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
  const formRef = useRef<ParkingFormRef>(null);

  // Calculate available spots
  const availableCars = spots.filter(s => s.type === 'car' && !s.isOccupied).length;
  const availableMotorcycles = spots.filter(s => s.type === 'motorcycle' && !s.isOccupied).length;

  const handleParkVehicle = async (data: ParkingFormData) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para usar o sistema',
        variant: 'destructive',
      });
      return;
    }

    if (!isSubscribed) {
      toast({
        title: 'Assinatura necessária',
        description: 'Você precisa de uma assinatura ativa para usar o sistema',
        variant: 'destructive',
      });
      return;
    }

    // Find the first available spot for the vehicle type
    const availableSpotIndex = spots.findIndex(s => 
      s.type === data.vehicleType && !s.isOccupied
    );
    
    if (availableSpotIndex === -1) {
      toast({
        title: 'Sem vagas disponíveis',
        description: `Não há vagas disponíveis para ${data.vehicleType === 'car' ? 'carros' : 'motos'}`,
        variant: 'destructive',
      });
      return;
    }

    const spotId = spots[availableSpotIndex].id;

    try {
      // Save parking session to database
      const { error } = await supabase
        .from('parking_sessions')
        .insert({
          user_id: user.id,
          spot_id: spotId,
          license_plate: data.licensePlate,
          phone_number: data.phoneNumber,
          vehicle_type: data.vehicleType,
        });

      if (error) {
        console.error('Error saving parking session:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar o veículo',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setSpots(currentSpots => {
        const newSpots = [...currentSpots];
        newSpots[availableSpotIndex] = {
          ...newSpots[availableSpotIndex],
          isOccupied: true,
          vehicleInfo: {
            licensePlate: data.licensePlate,
            phoneNumber: data.phoneNumber,
            entryTime: new Date(),
            minutes: 0,
            cost: 0
          }
        };
        return newSpots;
      });

      toast({
        title: 'Veículo estacionado',
        description: `Veículo ${data.licensePlate} foi estacionado na vaga ${spotId}`,
      });

      // Reset search results when parking a new vehicle
      setIsSearching(false);
      setSearchResults([]);
    } catch (error) {
      console.error('Error in handleParkVehicle:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    }
  };

  const handleReleaseSpot = async (spotId: number) => {
    if (!user) return;

    const spot = spots.find(s => s.id === spotId);
    if (!spot) return;

    try {
      // Update parking session in database
      const { error } = await supabase
        .from('parking_sessions')
        .update({
          exit_time: new Date().toISOString(),
          is_active: false,
          cost: spot.vehicleInfo?.cost || 0,
        })
        .eq('user_id', user.id)
        .eq('spot_id', spotId)
        .eq('is_active', true);

      if (error) {
        console.error('Error updating parking session:', error);
      }

      // Update local state
      setSpots(currentSpots => {
        return currentSpots.map(s => {
          if (s.id === spotId) {
            const finalCost = s.vehicleInfo?.cost || 0;
            
            toast({
              title: 'Vaga liberada',
              description: `Veículo com placa ${s.vehicleInfo?.licensePlate} saiu. Valor total: R$ ${finalCost.toFixed(2)}`,
            });
            
            return {
              ...s,
              isOccupied: false,
              vehicleInfo: undefined
            };
          }
          return s;
        });
      });

      // Update search results
      setSearchResults(prev => prev.filter(spot => spot.id !== spotId));
    } catch (error) {
      console.error('Error in handleReleaseSpot:', error);
    }
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

  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    if (formRef.current) {
      formRef.current.clearSearch();
    }
  };

  if (!isSubscribed) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            Sistema de Estacionamento
          </h1>
          <Button variant="outline" onClick={onShowDashboard} className="flex items-center gap-2">
            <User size={16} />
            Minha Conta
          </Button>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Assinatura Necessária</h2>
          <p className="text-gray-600 mb-6">
            Para usar o sistema de estacionamento, você precisa de uma assinatura ativa.
          </p>
          <Button onClick={onShowDashboard}>
            Ver Planos de Assinatura
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
          Sistema de Estacionamento
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onShowDashboard} className="flex items-center gap-2">
            <Settings size={16} />
            Configurações
          </Button>
        </div>
      </div>
      
      {/* Form component */}
      <ParkingForm 
        ref={formRef}
        onPark={handleParkVehicle} 
        onSearch={handleSearch}
        availableCars={availableCars}
        availableMotorcycles={availableMotorcycles}
      />

      {/* Search results */}
      {isSearching && searchResults.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
              Resultados da Busca
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearSearch}
              className="flex items-center gap-1"
            >
              <X size={16} />
              Fechar
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {searchResults.map(spot => (
              <ParkingSpot 
                key={`search-${spot.id}`} 
                spot={spot} 
                onRelease={handleReleaseSpot}
                isSearchResult={true}
                onClearSearch={handleClearSearch}
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

export default ParkingSystemWithAuth;
