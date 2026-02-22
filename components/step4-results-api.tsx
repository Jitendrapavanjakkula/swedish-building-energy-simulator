"use client";

import { useState, useEffect } from "react";
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
import { Zap, Flame, Snowflake, Battery, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  runSimulation,
  type SimulationResult,
  type HourlyPowerData,
} from "@/lib/api-client";
import { getStationName, type ConstructionPeriodId } from "@/lib/sweden-climate-data";
import { SimulationLoading } from "./simulation-loading";

interface Step4Props {
  weatherStation: string;
  constructionPeriod: ConstructionPeriodId;
  buildingType: string;
  onResult?: (annual: SimulationResult, hourly: HourlyPowerData) => void;
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

export function Step4Results({ weatherStation, constructionPeriod, buildingType, onResult }: Step4Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyPowerData | null>(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSimulation() {
      setLoading(true);
      setError(null);

      try {
        const response = await runSimulation(weatherStation, constructionPeriod, buildingType);
        
        if (!cancelled) {
          setResult(response.annual);
          setHourlyData(response.hourly);
          setCached(response.cached);
          setLoading(false);
          if (onResult) {
            onResult(response.annual, response.hourly);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Simulation failed");
          setLoading(false);
        }
      }
    }

    fetchSimulation();

    return () => {
      cancelled = true;
    };
  }, [weatherStation, constructionPeriod, buildingType]);

  // Loading state
  if (loading) {
    return (
      <SimulationLoading buildingType={buildingType} />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Simulation Failed
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-red-400">
          Make sure the API server is running at localhost:8000
        </p>
      </div>
    );
  }

  // No results
  if (!result) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">
          No simulation results available for this combination.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Please select a valid location and construction period.
        </p>
      </div>
    );
  }

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

      {/* Configuration Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuration Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="text-sm text-gray-500">Building Type</p>
            <p className="font-semibold capitalize">
              {buildingType.replace(/-/g, " ")}
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
      </div>
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

    // Sum hourly power (kW) to get energy (kWh) for the month
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
