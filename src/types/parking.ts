
export type VehicleType = 'car' | 'motorcycle';

export interface ParkingSpot {
  id: number;
  type: VehicleType;
  isOccupied: boolean;
  vehicleInfo?: {
    licensePlate: string;
    phoneNumber: string;
    entryTime: Date;
    minutes: number;
    cost: number;
    seconds?: number;
  };
}

export interface ParkingFormData {
  licensePlate: string;
  phoneNumber: string;
  vehicleType: VehicleType;
}
