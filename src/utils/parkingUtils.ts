
// Calculate cost based on vehicle type and time using custom rates
export const calculateCost = (vehicleType: 'car' | 'motorcycle', minutes: number, carRate: number = 3.0, motorcycleRate: number = 2.0): number => {
  const hourlyRate = vehicleType === 'car' ? carRate : motorcycleRate;
  const hours = Math.ceil(minutes / 60);
  return Math.max(hours * hourlyRate, hourlyRate); // Minimum 1 hour charge
};

// Format time for display
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Format cost with currency symbol
export const formatCurrency = (amount: number): string => {
  return `R$ ${amount.toFixed(2)}`;
};

// Validate Brazilian license plate
export const validateLicensePlate = (plate: string): boolean => {
  // Standard format (AAA-1234) or Mercosul format (AAA1A23)
  const standardRegex = /^[A-Z]{3}-?\d{4}$/;
  const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  // Verificação rigorosa do comprimento e formato
  const cleaned = plate.trim();
  if (cleaned.length < 7 || cleaned.length > 8) {
    return false;
  }
  
  return standardRegex.test(cleaned) || mercosulRegex.test(cleaned);
};

// Format Brazilian license plate
export const formatLicensePlate = (plate: string): string => {
  // Remove any non-alphanumeric characters
  const cleaned = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Check if it's likely to be a standard format
  if (cleaned.length === 7 && /^[A-Z]{3}\d{4}$/.test(cleaned)) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
  }
  
  // Limitar a 8 caracteres no máximo (7 sem hífen para placa padrão, 7 para Mercosul)
  return cleaned.substring(0, 7);
};

// Format Brazilian phone number
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  
  return cleaned;
};

// Validate Brazilian phone number
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};
