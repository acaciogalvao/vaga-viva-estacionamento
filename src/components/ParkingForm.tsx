import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Car, Bike, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ParkingFormData, VehicleType } from '@/types/parking';
import { 
  formatLicensePlate, 
  validateLicensePlate, 
  formatPhoneNumber, 
  validatePhoneNumber 
} from '@/utils/parkingUtils';
import { useToast } from '@/hooks/use-toast';

interface ParkingFormProps {
  onPark: (data: ParkingFormData) => void;
  onSearch: (licensePlate: string) => void;
  availableCars: number;
  availableMotorcycles: number;
}

export interface ParkingFormRef {
  clearSearch: () => void;
}

const ParkingForm = forwardRef<ParkingFormRef, ParkingFormProps>(({ 
  onPark, 
  onSearch, 
  availableCars, 
  availableMotorcycles 
}, ref) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [searchValue, setSearchValue] = useState('');
  const { toast } = useToast();

  // Expose clearSearch method to parent component
  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      setSearchValue('');
    }
  }));

  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicensePlate(e.target.value);
    setLicensePlate(formatted);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!validateLicensePlate(licensePlate)) {
      toast({
        title: 'Erro de validação',
        description: 'Placa inválida. Use o formato AAA-1234 ou AAA1A23.',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: 'Erro de validação',
        description: 'Número de telefone inválido. Use DDD + número.',
        variant: 'destructive',
      });
      return;
    }

    // Check availability
    if (vehicleType === 'car' && availableCars === 0) {
      toast({
        title: 'Sem vagas disponíveis',
        description: 'Não há vagas para carros disponíveis no momento.',
        variant: 'destructive',
      });
      return;
    }

    if (vehicleType === 'motorcycle' && availableMotorcycles === 0) {
      toast({
        title: 'Sem vagas disponíveis',
        description: 'Não há vagas para motos disponíveis no momento.',
        variant: 'destructive',
      });
      return;
    }

    onPark({ licensePlate, phoneNumber, vehicleType });
    
    // Reset form
    setLicensePlate('');
    setPhoneNumber('');
    setVehicleType('car');

    toast({
      title: 'Veículo estacionado',
      description: 'O veículo foi estacionado com sucesso!',
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() === '') {
      toast({
        title: 'Erro de busca',
        description: 'Digite uma placa para buscar.',
        variant: 'destructive',
      });
      return;
    }

    onSearch(searchValue.toUpperCase());
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Park a vehicle form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Estacionar Veículo
          </h2>
          
          <div className="space-y-2">
            <Label htmlFor="license-plate">Placa do Veículo</Label>
            <Input
              id="license-plate"
              placeholder="AAA-1234"
              value={licensePlate}
              onChange={handleLicensePlateChange}
              className="input-gradient"
              maxLength={8}
              required
            />
            <div className="text-xs text-gray-500">Formato: AAA-1234 ou AAA1A23</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number">Telefone de Contato</Label>
            <Input
              id="phone-number"
              placeholder="(11) 98765-4321"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="input-gradient"
              maxLength={15}
              required
            />
            <div className="text-xs text-gray-500">Formato: (DD) XXXXX-XXXX</div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Veículo</Label>
            <RadioGroup 
              defaultValue="car" 
              value={vehicleType} 
              onValueChange={(val) => setVehicleType(val as VehicleType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="car" id="car" />
                <Label htmlFor="car" className="flex items-center gap-1 cursor-pointer">
                  <Car size={18} />
                  Carro ({availableCars} vagas)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="motorcycle" id="motorcycle" />
                <Label htmlFor="motorcycle" className="flex items-center gap-1 cursor-pointer">
                  <Bike size={18} />
                  Moto ({availableMotorcycles} vagas)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            Estacionar
          </Button>
        </form>

        {/* Search form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <h2 className="text-xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
            Buscar Veículo
          </h2>
          
          <div className="space-y-2">
            <Label htmlFor="search-plate">Buscar por Placa</Label>
            <div className="flex gap-2">
              <Input
                id="search-plate"
                placeholder="Digite a placa"
                value={searchValue}
                onChange={(e) => setSearchValue(formatLicensePlate(e.target.value))}
                className="input-gradient"
              />
              <Button 
                type="submit" 
                className="bg-gradient-secondary hover:opacity-90"
              >
                <Search size={18} />
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Digite a placa completa para localizar o veículo
            </div>
          </div>

          {/* Empty space to balance layout */}
          <div className="hidden lg:block h-40"></div>
        </form>
      </div>
    </div>
  );
});

ParkingForm.displayName = 'ParkingForm';

export default ParkingForm;
