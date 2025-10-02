export interface Port {
  id: string;
  port_code: string;
  port_name: string;
  country: string;
  country_code: string;
  city: string;
  port_type: 'commercial' | 'industrial' | 'mixed' | 'marina';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  currency: string;
  currency_symbol: string;
  local_languages: string[];
  population?: number;
  continuous_operation: boolean;
  status: 'active' | 'inactive' | 'under_maintenance';
  facilities: string[];
  restrictions: string[];
  health_protocols: string[];
  berths_available: number;
  max_vessel_size: string;
  harbor_depth: number; // meters
  created_at: string;
  updated_at: string;
}

export interface PortAgent {
  id: string;
  port_id: string;
  agent_name: string;
  company_name: string;
  email: string;
  phone: string;
  mobile_phone?: string;
  fax?: string;
  website?: string;
  address: string;
  services: string[];
  operating_hours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  emergency_contact: string;
  languages_spoken: string[];
  specialties: string[];
  is_main_agent: boolean;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  open_time?: string; // HH:MM format
  close_time?: string; // HH:MM format
  is_closed: boolean;
  notes?: string;
}

export interface PortPracticalInfo {
  port_id: string;
  local_emergency_number: string;
  police_number: string;
  hospital_number: string;
  embassy_contact?: string;
  local_transport: {
    taxi_companies: TaxiCompany[];
    bus_routes: string[];
    railway_station?: string;
    metro_station?: string;
  };
  local_facilities: {
    shopping_centers: LocalFacility[];
    restaurants: LocalFacility[];
    medical_clinics: LocalFacility[];
    banks_atms: LocalFacility[];
    internet_cafes: LocalFacility[];
    pharmacies: LocalFacility[];
  };
  customs_info: {
    office_hours: WorkingHours;
    contact_info: string;
    notes: string[];
  };
  immigration_info: {
    office_hours: WorkingHours;
    contact_info: string;
    notes: string[];
  };
  safety_info: {
    crime_level: 'low' | 'moderate' | 'high';
    safety_tips: string[];
    restricted_areas: string[];
  };
}

export interface TaxiCompany {
  name: string;
  phone: string;
  website?: string;
  operating_24h: boolean;
}

export interface LocalFacility {
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  distance_from_port: string; // walking time or distance
  notes?: string;
}

export interface WeatherData {
  port_id: string;
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    visibility: number;
    uv_index: number;
    condition: string;
    condition_code: string;
    wind_speed: number;
    wind_direction: number;
    gust_speed?: number;
  };
  forecast: WeatherForecastDay[];
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  last_updated: string;
}

export interface WeatherForecastDay {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  condition_code: string;
  precipitation_chance: number;
  wind_speed: number;
  wind_direction: number;
}

export interface AirportTransferInfo {
  port_id: string;
  nearest_airports: AirportInfo[];
  transfer_options: TransferOption[];
  typical_travel_times: {
    to_main_airport: number; // minutes
    to_secondary_airport?: number; // minutes
  };
}

export interface AirportInfo {
  airport_code: string;
  airport_name: string;
  city: string;
  country: string;
  distance_from_port: number; // kilometers
  distance_text: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface TransferOption {
  type: 'taxi' | 'bus' | 'train' | 'ferry' | 'private_car';
  operator_name: string;
  contact_info: string;
  price_range: string;
  average_duration: number; // minutes
  frequency: string;
  notes?: string;
}

export interface CurrencyConverterData {
  base_currency: string;
  target_currency: string;
  rates: Record<string, number>;
  last_updated: string;
}

export interface PortRequirements {
  port_id: string;
  health_requirements: {
    yellow_fever_certificate: boolean;
    other_vaccinations: string[];
    covid_quarantine: string;
    medical_check: string;
  };
  documentation_requirements: {
    passport_validity: string;
    visa_requirements: string[];
    seaman_book_stamps: string;
    crew_list_updates: string;
  };
  port_clearance: {
    arrival_notice_period: string;
    customs_declaration: string;
    agent_appointment: boolean;
    required_fees: FeeInfo[];
  };
  security_requirements: {
    cargo_requirements: string[];
    dangerous_goods: string[];
    passenger_screening: string;
    crew_identification: string;
  };
}

export interface FeeInfo {
  service: string;
  amount: number;
  currency: string;
  required: boolean;
  notes?: string;
}

export interface FavoriteLocation {
  id: string;
  user_id: string;
  location_type: 'port' | 'airport' | 'hospital' | 'embassy' | 'custom';
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  notes?: string;
  created_at: string;
}

export interface PortFilter {
  country?: string;
  port_type?: 'commercial' | 'industrial' | 'mixed' | 'marina' | 'all';
  port_size?: 'small' | 'medium' | 'large' | 'all';
  facilities?: string[];
  status?: 'active' | 'inactive' | 'all';
  search_term?: string;
}

export interface EmergencyContact {
  id: string;
  port_id: string;
  contact_type: 'port_authority' | 'police' | 'medical' | 'fire' | 'coast_guard' | 'customs' | 'immigration';
  name: string;
  phone: string;
  mobile?: string;
  email?: string;
  address?: int16;
  available_24h: boolean;
  languages: string[];
  notes?: string;
}

export interface PortActivityLog {
  id: string;
  user_id: string;
  port_id: string;
  activity_type: 'view' | 'contact' | 'favorite' | 'navigate' | 'weather_check';
  timestamp: string;
  details?: string;
}

export interface PortComparison {
  ports: Port[];
  comparison_criteria: string[];
  analysis: {
    best_for_large_vessels: string[];
    best_for_crew_welfare: string[];
    most_cost_effective: string[];
    best_facilities: string[];
  };
}
