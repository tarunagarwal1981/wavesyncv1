import { createClient } from '@/lib/supabase/server';
import type { 
  Port, 
  PortAgent, 
  PortPracticalInfo, 
  FavoriteLocation,
  EmergencyContact,
  PortRequirements,
  AirportTransferInfo,
  PortFilter
} from './types';

export interface PortQueryOptions {
  filters?: PortFilter;
  limit?: number;
  offset?: number;
}

export interface PortsWithCount {
  ports: Port[];
  total: number;
}

/**
 * Get all ports with optional filtering
 */
export async function getPorts(options: PortQueryOptions = {}): Promise<PortsWithCount> {
  const supabase = await createClient();
  
  let query = supabase
    .from('ports')
    .select('*', { count: 'exact' })
    .eq('status', 'active');
  
  // Apply filters
  if (options.filters) {
    const { country, port_type, port_size, facilities, search_term } = options.filters;
    
    if (country && country !== 'all') {
      query = query.eq('country', country);
    }
    
    if (port_type && port_type !== 'all') {
      query = query.eq('port_type', port_type);
    }
    
    if (port_size && port_size !== 'all') {
      // This would need port_size to be added to the database schema
      // query = query.eq('port_size', port_size);
    }
    
    if (facilities && facilities.length > 0) {
      // Filter ports that have any of the specified facilities
      query = query.contains('facilities', facilities);
    }
    
    if (search_term) {
      query = query.or(
        `port_name.ilike.%${search_term}%,city.ilike.%${search_term}%,country.ilike.%${search_term}%,port_code.ilike.%${search_term}%`
      );
    }
  }
  
  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }
  
  const { data: ports, count, error } = await query;
  
  if (error) {
    console.error('Error fetching ports:', error);
    return { ports: [], total: 0 };
  }
  
  return { ports: ports || [], total: count || 0 };
}

/**
 * Get a single port by ID or code
 */
export async function getPortById(
  portIdentifier: string,
  userId?: string
): Promise<Port | null> {
  const supabase = await createClient();
  
  // Try by ID first, then by port code
  let query = supabase
    .from('ports')
    .select('*')
    .eq('id', portIdentifier)
    .single();
  
  let { data: port, error } = await query;
  
  if (error || !port) {
    // Try by port code
    query = supabase
      .from('ports')
      .select('*')
      .eq('port_code', portIdentifier.toUpperCase())
      .single();
    
    const result = await query;
    port = result.data;
    error = result.error;
  }
  
  if (error) {
    console.error('Error fetching port:', error);
    return null;
  }
  
  return port;
}

/**
 * Get ports by country
 */
export async function getPortsByCountry(countryCode: string): Promise<Port[]> {
  const supabase = await createClient();
  
  const { data: ports, error } = await supabase
    .from('ports')
    .select('*')
    .eq('country_code', countryCode.toUpperCase())
    .eq('status', 'active')
    .order('port_name');
  
  if (error) {
    console.error('Error fetching ports by country:', error);
    return [];
  }
  
  return ports || [];
}

/**
 * Get port agents for a specific port
 */
export async function getPortAgents(portId: string): Promise<PortAgent[]> {
  const supabase = await createClient();
  
  const { data: agents, error } = await supabase
    .from('port_agents')
    .select('*')
    .eq('port_id', portId)
    .order('is_main_agent', { ascending: false })
    .order('agent_name');
  
  if (error) {
    console.error('Error fetching port agents:', error);
    return [];
  }
  
  return agents || [];
}

/**
 * Get main port agent for a port
 */
export async function getMainPortAgent(portId: string): Promise<PortAgent | null> {
  const supabase = await createClient();
  
  const { data: agent, error } = await supabase
    .from('port_agents')
    .select('*')
    .eq('port_id', portId)
    .eq('is_main_agent', true)
    .single();
  
  if (error) {
    console.error('Error fetching main port agent:', error);
    return null;
  }
  
  return agent;
}

/**
 * Get practical information for a port
 */
export async function getPortPracticalInfo(portId: string): Promise<PortPracticalInfo | null> {
  const supabase = await createClient();
  
  const { data: info, error } = await supabase
    .from('port_practical_info')
    .select('*')
    .eq('port_id', portId)
    .single();
  
  if (error) {
    console.error('Error fetching port practical info:', error);
    return null;
  }
  
  return info;
}

/**
 * Get emergency contacts for a port
 */
export async function getEmergencyContacts(portId: string): Promise<EmergencyContact[]> {
  const supabase = await createClient();
  
  const { data: contacts, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('port_id', portId)
    .order('contact_type');
  
  if (error) {
    console.error('Error fetching emergency contacts:', error);
    return [];
  }
  
  return contacts || [];
}

/**
 * Get port requirements for clearance
 */
export async function getPortRequirements(portId: string): Promise<PortRequirements | null> {
  const supabase = await createClient();
  
  const { data: requirements, error } = await supabase
    .from('port_requirements')
    .select('*')
    .eq('port_id', portId)
    .single();
  
  if (error) {
    console.error('Error fetching port requirements:', error);
    return null;
  }
  
  return requirements;
}

/**
 * Get airport transfer information
 */
export async function getAirportTransferInfo(portId: string): Promise<AirportTransferInfo | null> {
  const supabase = await createClient();
  
  const { data: transferInfo, error } = await supabase
    .from('airport_transfer_info')
    .select('*')
    .eq('port_id', portId)
    .single();
  
  if (error) {
    console.error('Error fetching airport transfer info:', error);
    return null;
  }
  
  return transferInfo;
}

/**
 * Get user's favorite locations
 */
export async function getFavoriteLocations(userId: string): Promise<FavoriteLocation[]> {
  const supabase = await createClient();
  
  const { data: favorites, error } = await supabase
    .from('favorite_locations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching favorite locations:', error);
    return [];
  }
  
  return favorites || [];
}

/**
 * Add a favorite location
 */
export async function addFavoriteLocation(
  userId: string,
  locationData: Omit<FavoriteLocation, 'id' | 'user_id' | 'created_at'>
): Promise<{ success: boolean; error: string | null; location?: FavoriteLocation }> {
  const supabase = await createClient();
  
  const { data: location, error } = await supabase
    .from('favorite_locations')
    .insert({
      ...locationData,
      user_id: userId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding favorite location:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, error: null, location };
}

/**
 * Remove a favorite location
 */
export async function removeFavoriteLocation(
  favoriteId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('favorite_locations')
    .delete()
    .eq('id', favoriteId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error removing favorite location:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, error: null };
}

/**
 * Get closest ports to coordinates
 */
export async function getNearbyPorts(
  latitude: number,
  longitude: number,
  radiusKm: number = 100,
  limit: number = 10
): Promise<Array<Port & { distance_km: number }>> {
  const supabase = await createClient();
  
  // Use PostGIS if available, otherwise filter in memory
  const { data: ports, error } = await supabase
    .from('ports')
    .select('*')
    .eq('status', 'active')
    .limit(limit * 2); // Get more than needed to account for distance filtering
  
  if (error) {
    console.error('Error fetching nearby ports:', error);
    return [];
  }
  
  if (!ports) return [];
  
  // Calculate distances and filter
  const portsWithDistance = ports
    .map(port => ({
      ...port,
      distance_km: calculateDistance(latitude, longitude, port.coordinates.latitude, port.coordinates.longitude)
    }))
    .filter(port => port.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
  
  return portsWithDistance;
}

/**
 * Log port activity
 */
export async function logPortActivity(
  userId: string,
  portId: string,
  activityType: 'view' | 'contact' | 'favorite' | 'navigate' | 'weather_check',
  details?: string
): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('port_activity_logs')
    .insert({
      user_id: userId,
      port_id: portId,
      activity_type: activityType,
      details: details || null,
      timestamp: new Date().toISOString(),
    });
}

/**
 * Search ports globally
 */
export async function searchPorts(
  searchTerm: string,
  options: {
    limit?: number;
    country?: string;
    facility?: string;
  } = {}
): Promise<Port[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('ports')
    .select('*')
    .eq('status', 'active');
  
  // Global search across name, city, country, and code
  if (searchTerm) {
    query = query.or(
      `port_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%,port_code.ilike.%${searchTerm}%`
    );
  }
  
  if (options.country) {
    query = query.eq('country_code', options.country.toUpperCase());
  }
  
  if (options.facility) {
    query = query.contains('facilities', [options.facility]);
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  const { data: ports, error } = await query;
  
  if (error) {
    console.error('Error searching ports:', error);
    return [];
  }
  
  return ports || [];
}

// Helper function for distance calculation (same as in utils.ts)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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



