
// Calculate cost based on vehicle type and time
export const calculateCost = (vehicleType: 'car' | 'motorcycle', minutes: number): number => {
  const hourlyRate = vehicleType === 'car' ? 10 : 8;
  return parseFloat(((hourlyRate * minutes) / 60).toFixed(2));
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
  
  // Ensure minimum length
  if (plate.trim().length < 7) {
    return false;
  }
  
  return standardRegex.test(plate) || mercosulRegex.test(plate);
};

// Format Brazilian license plate
export const formatLicensePlate = (plate: string): string => {
  // Remove any non-alphanumeric characters
  const cleaned = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Check if it's likely to be a standard format
  if (cleaned.length === 7 && /^[A-Z]{3}\d{4}$/.test(cleaned)) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
  }
  
  return cleaned;
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
