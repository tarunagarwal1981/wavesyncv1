import type { 
  Port, 
  WeatherData, 
  CurrencyConverterData,
  FavoriteLocation,
  EmergencyContact,
  AirportInfo,
  TransferOption
} from './types';

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/**
 * Convert UTC timestamp to port local time
 */
export function convertToPortTime(timestamp: string, portTimezone: string): Date {
  const utc = new Date(timestamp);
  return new Date(utc.toLocaleString('en-US', { timeZone: portTimezone }));
}

/**
 * Format time in port's local timezone
 */
export function formatLocalTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Get current time at port
 */
export function getPortCurrentTime(timezone: string): {
  localTime: string;
  localDate: string;
  formattedDateTime: string;
} {
  const now = new Date();
  const localTime = formatLocalTime(now, timezone);
  
  return {
    localTime: localTime.split(', ')[1], // Get time part
    localDate: localTime.split(', ')[0], // Get date part
    formattedDateTime: localTime
  };
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * Format travel time estimate
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Generate Google Maps directions URL
 */
export function generateDirectionsUrl(
  destinationLat: number,
  destinationLng: number,
  destinationName?: string,
  currentLocation?: { lat: number; lng: number }
): string {
  let url = 'https://www.google.com/maps/dir/';
  
  if (currentLocation) {
    url += `${currentLocation.lat},${currentLocation.lng}/`;
  }
  
  url += `${destinationLat},${destinationLng}`;
  
  if (destinationName) {
    url += `/${encodeURIComponent(destinationName)}`;
  }
  
  return url;
}

/**
 * Generate Google Maps static map image URL
 */
export function generateStaticMapUrl(
  centerLat: number,
  centerLng: number,
  width: number = 600,
  height: number = 400,
  zoom: number = 12,
  markers?: Array<{ lat: number; lng: number; label?: string }>
): string {
  let url = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap`;
  
  if (markers && markers.length > 0) {
    const markersParam = markers.map(marker => {
      let markerParam = `${marker.lat},${marker.lng}`;
      if (marker.label) {
        markerParam += `&label:${encodeURIComponent(marker.label)}`;
      }
      return markerParam;
    }).join('|');
    
    url += `&markers=${markersParam}`;
  }
  
  return url;
}

/**
 * Convert currency amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
  const targetAmount = toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];
  
  return Math.round(targetAmount * 100) / 100;
}

/**
 * Format currency amount for display
 */
export function formatCurrencyAmount(
  amount: number,
  currency: string,
  currencySymbol?: string
): string {
  const symbol = currencySymbol || getCurrencySymbol(currency);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'KRW': '₩',
    'SGD': 'S$',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'TRY': '₺',
    'BRL': 'R$',
    'MXN': '$',
    'INR': '₹',
    'AED': 'د.إ',
    'SAR': '﷼',
  };
  
  return symbols[currency] || currency;
}

/**
 * Generate weather description
 */
export function getWeatherDescription(
  condition: string,
  temperature: number,
  windSpeed: number,
  humidity: number
): string {
  const temp = Math.round(temperature);
  const wind = Math.round(windSpeed);
  const humid = Math.round(humidity);
  
  return `${condition}, ${temp}°C, Wind: ${wind}mph, Humidity: ${humid}%`;
}

/**
 * Get weather icon based on condition code
 */
export function getWeatherIcon(conditionCode: string): {
  icon: string;
  description: string;
  color: string;
} {
  const weatherIcons: Record<string, { icon: string; description: string; color: string }> = {
    '01d': { icon: '☀️', description: 'Clear sky', color: 'text-yellow-500' },
    '01n': { icon: '🌙', description: 'Clear night', color: 'text-blue-500' },
    '02d': { icon: '⛅', description: 'Few clouds', color: 'text-blue-400' },
    '02n': { icon: '☁️', description: 'Few clouds', color: 'text-gray-500' },
    '03d': { icon: '☁️', description: 'Scattered clouds', color: 'text-gray-500' },
    '03n': { icon: '☁️', description: 'Scattered clouds', color: 'text-gray-600' },
    '04d': { icon: '☁️', description: 'Broken clouds', color: 'text-gray-500' },
    '04n': { icon: '☁️', description: 'Broken clouds', color: 'text-gray-600' },
    '09d': { icon: '🌧️', description: 'Shower rain', color: 'text-blue-600' },
    '09n': { icon: '🌧️', description: 'Shower rain', color: 'text-blue-700' },
    '10d': { icon: '🌦️', description: 'Light rain', color: 'text-blue-600' },
    '10n': { icon: '🌧️', description: 'Light rain', color: 'text-blue-700' },
    '11d': { icon: '⛈️', description: 'Thunderstorm', color: 'text-purple-600' },
    '11n': { icon: '⛈️', description: 'Thunderstorm', color: 'text-purple-700' },
    '13d': { icon: '❄️', description: 'Snow', color: 'text-blue-300' },
    '13n': { icon: '❄️', description: 'Snow', color: 'text-blue-400' },
    '50d': { icon: '🌫️', description: 'Mist', color: 'text-gray-400' },
    '50n': { icon: '🌫️', description: 'Fog', color: 'text-gray-500' },
  };
  
  return weatherIcons[conditionCode] || { icon: '❓', description: 'Unknown', color: 'text-gray-500' };
}

/**
 * Generate emergency contact sections
 */
export function categorizeEmergencyContacts(
  contacts: EmergencyContact[]
): {
  immediate: EmergencyContact[];
  authorities: EmergencyContact[];
  services: EmergencyContact[];
} {
  const immediate = contacts.filter(c => 
    ['police', 'fire', 'medical', 'coast_guard'].includes(c.contact_type)
  );
  
  const authorities = contacts.filter(c => 
    ['port_authority', 'customs', 'immigration'].includes(c.contact_type)
  );
  
  const services = contacts.filter(c => 
    ['port_authority'].includes(c.contact_type) || c.contact_type === 'custom'
  );
  
  return { immediate, authorities, services };
}

/**
 * Generate PDF-ready port data
 */
export function preparePortDataForPDF(port: Port): {
  basicInfo: string;
  contactInfo: string;
  practicalInfo: string;
  weatherInfo?: string;
} {
  const basicInfo = `
PORT INFORMATION
Port Name: ${port.port_name}
Port Code: ${port.port_code}
Country: ${port.country}, ${port.city}
Coordinates: ${formatCoordinates(port.coordinates.latitude, port.coordinates.longitude)}
Timezone: ${port.timezone}
24-Hour Port: ${port.continuous_operation ? 'Yes' : 'No'}
Port Type: ${port.port_type}
Status: ${port.status}
  `.trim();
  
  const contactInfo = `
CONTACT INFORMATION
Available in port database and agent listings.
See mobile app for complete contact details.
  `.trim();
  
  const practicalInfo = `
PRACTICAL INFORMATION
Currency: ${port.currency} (${port.currency_symbol})
Languages: ${port.local_languages.join(', ')}
Facilities: ${port.facilities.join(', ')}
Restrictions: ${port.restrictions.join(', ')}
  `.trim();
  
  return { basicInfo, contactInfo, practicalInfo };
}

/**
 * Validate port coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}



