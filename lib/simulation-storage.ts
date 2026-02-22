import { supabase } from './supabase';

export interface SimulationRecord {
  id: string;
  user_id: string;
  created_at: string;
  simulation_type: 'pre-configured' | 'real-time' | 'batch';
  building_type: string | null;
  weather_station: string;
  construction_period: string | null;
  batch_config: Record<string, Record<string, number>> | null;
  building_count: number;
  total_heating: number;
  total_cooling: number;
  total_energy: number;
  eui: number;
  floor_area: number;
  results_json: any;
  hourly_data: any;
}

// Save a simulation to the database
export async function saveSimulation(data: {
  simulation_type: 'pre-configured' | 'real-time' | 'batch';
  building_type?: string;
  weather_station: string;
  construction_period?: string;
  batch_config?: Record<string, Record<string, number>>;
  building_count?: number;
  total_heating: number;
  total_cooling: number;
  total_energy: number;
  eui: number;
  floor_area: number;
  results_json: any;
  hourly_data?: any;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase.from('simulations').insert({
      user_id: user.id,
      simulation_type: data.simulation_type,
      building_type: data.building_type || null,
      weather_station: data.weather_station,
      construction_period: data.construction_period || null,
      batch_config: data.batch_config || null,
      building_count: data.building_count || 1,
      total_heating: data.total_heating,
      total_cooling: data.total_cooling,
      total_energy: data.total_energy,
      eui: data.eui,
      floor_area: data.floor_area,
      results_json: data.results_json,
      hourly_data: data.hourly_data || null,
    });

    if (error) {
      console.error('Error saving simulation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving simulation:', err);
    return { success: false, error: 'Failed to save simulation' };
  }
}

// Get all simulations for the current user
export async function getSimulations(): Promise<{ data: SimulationRecord[] | null; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching simulations:', error);
      return { data: null, error: error.message };
    }

    return { data: data as SimulationRecord[] };
  } catch (err) {
    console.error('Error fetching simulations:', err);
    return { data: null, error: 'Failed to fetch simulations' };
  }
}

// Get a single simulation by ID
export async function getSimulation(id: string): Promise<{ data: SimulationRecord | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching simulation:', error);
      return { data: null, error: error.message };
    }

    return { data: data as SimulationRecord };
  } catch (err) {
    console.error('Error fetching simulation:', err);
    return { data: null, error: 'Failed to fetch simulation' };
  }
}

// Delete a simulation
export async function deleteSimulation(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('simulations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting simulation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error deleting simulation:', err);
    return { success: false, error: 'Failed to delete simulation' };
  }
}

// Generate CSV content from simulation data
export function generateCSV(simulation: SimulationRecord): string {
  const lines: string[] = [];
  
  // Header info
  lines.push('Simulation Report');
  lines.push(`Date,${new Date(simulation.created_at).toLocaleString()}`);
  lines.push(`Type,${simulation.simulation_type}`);
  lines.push(`Location,${simulation.weather_station}`);
  
  if (simulation.building_type) {
    lines.push(`Building Type,${simulation.building_type}`);
  }
  if (simulation.construction_period) {
    lines.push(`Construction Period,${simulation.construction_period}`);
  }
  if (simulation.building_count > 1) {
    lines.push(`Building Count,${simulation.building_count}`);
  }
  
  lines.push('');
  lines.push('Annual Results');
  lines.push(`Total Heating (kWh),${simulation.total_heating}`);
  lines.push(`Total Cooling (kWh),${simulation.total_cooling}`);
  lines.push(`Total Energy (kWh),${simulation.total_energy}`);
  lines.push(`EUI (kWh/m²/year),${simulation.eui}`);
  lines.push(`Floor Area (m²),${simulation.floor_area}`);
  
  // Hourly data if available
  if (simulation.hourly_data?.heating_power_kw && simulation.hourly_data?.cooling_power_kw) {
    lines.push('');
    lines.push('Hourly Data (8760 hours)');
    lines.push('Hour,Heating (kW),Cooling (kW)');
    
    const heating = simulation.hourly_data.heating_power_kw;
    const cooling = simulation.hourly_data.cooling_power_kw;
    
    for (let i = 0; i < Math.min(heating.length, 8760); i++) {
      lines.push(`${i + 1},${heating[i]?.toFixed(4) || 0},${cooling[i]?.toFixed(4) || 0}`);
    }
  }
  
  return lines.join('\n');
}

// Download CSV
export function downloadCSV(simulation: SimulationRecord) {
  const csv = generateCSV(simulation);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulation-${simulation.id.slice(0, 8)}-${new Date(simulation.created_at).toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
