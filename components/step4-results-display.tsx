"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Zap, Flame, Snowflake, Battery, CheckCircle2 } from "lucide-react";
import { getStationName } from "@/lib/sweden-climate-data";

interface SimulationResult {
  heating: number;
  cooling: number;
  dhw: number;
  lighting: number;
  equipment: number;
  fans: number;
  total: number;
  eui: number;
  floor_area: number;
  peak_power_kw: number;
  peak_heating_kw: number;
  peak_cooling_kw: number;
  avg_power_kw: number;
}

interface HourlyPowerData {
  heating_power_kw: number[];
  cooling_power_kw: number[];
  total_power_kw: number[];
}

interface Step4ResultsDisplayProps {
  result: SimulationResult;
  hourlyData: HourlyPowerData | null;
  cached: boolean;
  weatherStation: string;
  // For pre-configured mode
  constructionPeriod?: string;
  buildingType?: string;
  // For custom mode
  customParameters?: {
    wallU: number;
    atticU: number;
    groundU: number;
    ach: number;
    windowType: string;
    wwr: number;
    ventilationType: string;
    heatedFloorArea: number;
    numberOfFloors: number;
  };
}

// Summary Card Component
function SummaryCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <p className="text-xs text-gray-400 mt-1">{unit}</p>
    </div>
  );
}

// Helper: Calculate monthly energy from hourly data
function calculateMonthlyEnergy(hourlyData: HourlyPowerData | null) {
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (!hourlyData || !hourlyData.heating_power_kw.length) {
    return monthNames.map((month) => ({ month, heating: 0, cooling: 0 }));
  }

  const result = [];
  let hourOffset = 0;

  for (let m = 0; m < 12; m++) {
    const hoursInMonth = monthDays[m] * 24;
    const heatingSlice = hourlyData.heating_power_kw.slice(
      hourOffset,
      hourOffset + hoursInMonth
    );
    const coolingSlice = hourlyData.cooling_power_kw.slice(
      hourOffset,
      hourOffset + hoursInMonth
    );

    const heatingEnergy = heatingSlice.reduce((a, b) => a + b, 0);
    const coolingEnergy = coolingSlice.reduce((a, b) => a + b, 0);

    result.push({
      month: monthNames[m],
      heating: Math.round(heatingEnergy),
      cooling: Math.round(coolingEnergy),
    });

    hourOffset += hoursInMonth;
  }

  return result;
}

const WINDOW_U_VALUES: Record<string, number> = {
  single: 2.8,
  double: 2.3,
  triple: 1.8,
};

const VENTILATION_LABELS: Record<string, string> = {
  "self-propelled": "Self-propelled (Natural)",
  "mechanical-exhaust": "Mechanical Exhaust",
  "mechanical-exhaust-hr": "Mech. Exhaust + Heat Recovery",
};

export function Step4ResultsDisplay({
  result,
  hourlyData,
  cached,
  weatherStation,
  constructionPeriod,
  buildingType,
  customParameters,
}: Step4ResultsDisplayProps) {
  // Calculate monthly energy from hourly data
  const monthlyData = calculateMonthlyEnergy(hourlyData);

  // Prepare full 8760 hourly data for charts
  const hourlyHeatingData = hourlyData?.heating_power_kw.map((power, hour) => ({
    hour,
    power,
  })) || [];

  const hourlyCoolingData = hourlyData?.cooling_power_kw.map((power, hour) => ({
    hour,
    power,
  })) || [];

  const hourlyCombinedData = hourlyData?.heating_power_kw.map((heating, hour) => ({
    hour,
    heating,
    cooling: hourlyData?.cooling_power_kw[hour] || 0,
  })) || [];

  // Energy breakdown data
  const energyBreakdown = [
    { name: "Heating", value: Math.round(result.heating), fill: "#ef4444" },
    { name: "Cooling", value: Math.round(result.cooling), fill: "#06b6d4" },
    { name: "DHW", value: Math.round(result.dhw), fill: "#f59e0b" },
    { name: "Lighting", value: Math.round(result.lighting), fill: "#22c55e" },
    { name: "Equipment", value: Math.round(result.equipment), fill: "#8b5cf6" },
  ];

  const isCustomMode = !!customParameters;

  return (
    <div className="space-y-6">
      {/* Cache indicator */}
      <div className={`flex items-center gap-2 text-sm ${cached ? 'text-green-600' : 'text-orange-600'}`}>
        <CheckCircle2 className="h-4 w-4" />
        {cached ? 'Results loaded from cache (instant)' : 'Fresh simulation completed'}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Peak Heating Power"
          value={result.peak_heating_kw.toFixed(1)}
          unit="kW"
          icon={Flame}
          color="text-red-500"
        />
        <SummaryCard
          title="Peak Cooling Power"
          value={result.peak_cooling_kw.toFixed(1)}
          unit="kW"
          icon={Snowflake}
          color="text-cyan-500"
        />
        <SummaryCard
          title="Total Annual Energy"
          value={Math.round(result.total).toLocaleString()}
          unit="kWh/year"
          icon={Zap}
          color="text-orange-500"
        />
        <SummaryCard
          title="EUI"
          value={result.eui.toFixed(1)}
          unit="kWh/m²/year"
          icon={Battery}
          color="text-green-600"
        />
      </div>

      {/* Monthly Heating & Cooling Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Heating & Cooling Energy Demand
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Energy consumption throughout the year (kWh)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              label={{ value: "kWh", angle: -90, position: "insideLeft" }}
            />
            <Tooltip formatter={(value: number) => `${Math.round(value)} kWh`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="heating"
              stroke="#ef4444"
              strokeWidth={2}
              name="Heating"
              dot={{ fill: "#ef4444" }}
            />
            <Line
              type="monotone"
              dataKey="cooling"
              stroke="#06b6d4"
              strokeWidth={2}
              name="Cooling"
              dot={{ fill: "#06b6d4" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Heating Power - Full Year (8760 hours) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Heating Power (Full Year)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          8760 hourly heating power values (kW)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyHeatingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => {
                const month = Math.floor(h / 730);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthNames[month] || '';
              }}
              interval={729}
            />
            <YAxis
              label={{ value: "kW", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)} kW`}
              labelFormatter={(h) => `Hour ${h} of year`}
            />
            <Line
              type="monotone"
              dataKey="power"
              stroke="#ef4444"
              strokeWidth={1}
              name="Heating Power"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Cooling Power - Full Year (8760 hours) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Cooling Power (Full Year)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          8760 hourly cooling power values (kW)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyCoolingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => {
                const month = Math.floor(h / 730);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthNames[month] || '';
              }}
              interval={729}
            />
            <YAxis
              label={{ value: "kW", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)} kW`}
              labelFormatter={(h) => `Hour ${h} of year`}
            />
            <Line
              type="monotone"
              dataKey="power"
              stroke="#06b6d4"
              strokeWidth={1}
              name="Cooling Power"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Combined Power - Full Year (8760 hours) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Heating & Cooling Power (Full Year)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Combined 8760 hourly power values (kW)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyCombinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => {
                const month = Math.floor(h / 730);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthNames[month] || '';
              }}
              interval={729}
            />
            <YAxis
              label={{ value: "kW", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)} kW`}
              labelFormatter={(h) => `Hour ${h} of year`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="heating"
              stroke="#ef4444"
              strokeWidth={1}
              name="Heating"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cooling"
              stroke="#06b6d4"
              strokeWidth={1}
              name="Cooling"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Energy Breakdown Bar Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Annual Energy Breakdown
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Distribution of energy consumption by end-use (kWh/year)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={energyBreakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              label={{ value: "kWh/year", angle: -90, position: "insideLeft" }}
            />
            <Tooltip formatter={(value: number) => `${Math.round(value).toLocaleString()} kWh`} />
            <Bar dataKey="value" name="Energy">
              {energyBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {energyBreakdown.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Simulation Details
        </h3>
        
        {isCustomMode ? (
          /* Custom mode parameters */
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            <div>
              <p className="text-sm text-gray-500">Weather Location</p>
              <p className="font-semibold capitalize">
                {getStationName(weatherStation)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wall U-Value</p>
              <p className="font-semibold">{customParameters!.wallU} W/m²K</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Attic U-Value</p>
              <p className="font-semibold">{customParameters!.atticU} W/m²K</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ground U-Value</p>
              <p className="font-semibold">{customParameters!.groundU} W/m²K</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Air Infiltration</p>
              <p className="font-semibold">{customParameters!.ach} ACH</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Window Type</p>
              <p className="font-semibold capitalize">
                {customParameters!.windowType} ({WINDOW_U_VALUES[customParameters!.windowType]} W/m²K)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Window-to-Wall Ratio</p>
              <p className="font-semibold">{customParameters!.wwr}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ventilation Type</p>
              <p className="font-semibold">{VENTILATION_LABELS[customParameters!.ventilationType] || customParameters!.ventilationType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Heated Floor Area</p>
              <p className="font-semibold">{customParameters!.heatedFloorArea} m²</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of Floors</p>
              <p className="font-semibold">{customParameters!.numberOfFloors}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Source</p>
              <p className="font-semibold">EnergyPlus + TMYx</p>
            </div>
          </div>
        ) : (
          /* Pre-configured mode parameters */
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div>
              <p className="text-sm text-gray-500">Building Type</p>
              <p className="font-semibold capitalize">
                {buildingType?.replace(/-/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weather Location</p>
              <p className="font-semibold capitalize">
                {getStationName(weatherStation)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Construction Period</p>
              <p className="font-semibold">{constructionPeriod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Conditioned Floor Area</p>
              <p className="font-semibold">{result.floor_area} m²</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Source</p>
              <p className="font-semibold">EnergyPlus + TMYx</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
