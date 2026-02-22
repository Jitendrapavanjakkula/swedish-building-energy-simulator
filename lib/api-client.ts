// ============================================================================
// SIMULATION API CLIENT
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SimulationResult {
  heating: number;
  cooling: number;
  dhw: number;
  lighting: number;
  equipment: number;
  fans: number;
  total: number;
  floor_area: number;
  eui: number;
  peak_power_kw: number;
  peak_heating_kw: number;
  peak_cooling_kw: number;
  avg_power_kw: number;
}

export interface HourlyPowerData {
  heating_power_kw: number[];
  cooling_power_kw: number[];
  total_power_kw: number[];
}

export interface SimulationResponse {
  annual: SimulationResult;
  hourly: HourlyPowerData;
  cached: boolean;
}

export async function runSimulation(
  weatherStation: string,
  constructionPeriod: string,
  buildingType: string = "single-family-house"
): Promise<SimulationResponse> {
  const response = await fetch(`${API_BASE_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      weatherStation,
      constructionPeriod,
      buildingType,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Simulation failed");
  }

  return response.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    return data.status === "running" && data.energyplus === true;
  } catch {
    return false;
  }
}

export async function getCacheStats(): Promise<{
  total_cached: number;
  entries: { station: string; period: string; type: string }[];
}> {
  const response = await fetch(`${API_BASE_URL}/cache/stats`);
  return response.json();
}
