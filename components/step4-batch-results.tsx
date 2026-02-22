"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Flame,
  Snowflake,
  Zap,
  Home,
  Building2,
  TrendingUp,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IDF_PARAMETERS,
  MFD_IDF_PARAMETERS,
  CONSTRUCTION_PERIODS,
  type ConstructionPeriodId,
} from "@/lib/sweden-climate-data";
import type { BatchPeriodAllocation } from "./step2-batch-building-info";

// Batch loading animation - shows building type counts with single filling animation
function BatchLoadingAnimation({ buildingTypeCounts }: { buildingTypeCounts: Record<string, number> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return 95;
        return p + 0.8;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const fillY = 160 - (progress / 100) * 145;
  const totalBuildings = Object.values(buildingTypeCounts).reduce((a, b) => a + b, 0);

  // Simple house SVG for the animation
  const renderBuilding = () => (
    <svg viewBox="0 0 160 180" className="w-36 h-44">
      <defs>
        <clipPath id="batchSfhClip">
          <path d="M20,50 L80,15 L140,50 L140,160 L20,160 Z" />
        </clipPath>
        <linearGradient id="batchFillGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <rect x="0" y={fillY} width="160" height={180 - fillY} fill="url(#batchFillGrad2)" clipPath="url(#batchSfhClip)" />
      <path d="M20,50 L80,15 L140,50 L140,160 L20,160 Z" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <rect x="35" y="65" width="35" height="40" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="52.5" y1="65" x2="52.5" y2="105" stroke="#94a3b8" strokeWidth="1" />
      <line x1="35" y1="85" x2="70" y2="85" stroke="#94a3b8" strokeWidth="1" />
      <rect x="90" y="65" width="35" height="40" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="107.5" y1="65" x2="107.5" y2="105" stroke="#94a3b8" strokeWidth="1" />
      <line x1="90" y1="85" x2="125" y2="85" stroke="#94a3b8" strokeWidth="1" />
      <rect x="65" y="115" width="30" height="45" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="88" cy="140" r="2.5" fill="#94a3b8" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center">
      {renderBuilding()}
      {/* Building type counts - bigger icons */}
      <div className="mt-6 flex gap-6">
        {Object.entries(buildingTypeCounts)
          .sort(([a], [b]) => {
            const order: Record<string, number> = {
              'single-family-house': 1,
              'mid-rise-apartment': 2,
              'office': 3,
              'school': 4,
              'retail': 5,
              'hotel': 6,
              'warehouse': 7,
              'hospital': 8,
            };
            return (order[a] || 99) - (order[b] || 99);
          })
          .map(([type, count]) => {
          if (count === 0) return null;
          const info = BUILDING_TYPE_INFO[type];
          const Icon = info?.icon || Home;
          return (
            <div key={type} className="flex items-center gap-2 text-base text-gray-700">
              <Icon className="h-6 w-6 text-orange-500" />
              <span className="font-semibold text-lg">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const BUILDING_TYPE_INFO: Record<string, { label: string; icon: any; color: string; lightColor: string }> = {
  "single-family-house": { label: "Single Family House", icon: Home, color: "#f97316", lightColor: "#fed7aa" },
  "mid-rise-apartment": { label: "Mid-Rise Apartment", icon: Building2, color: "#3b82f6", lightColor: "#bfdbfe" },
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface BatchResultEntry {
  buildingType: string;
  periodId: ConstructionPeriodId;
  count: number;
  annual: any;
  hourly: any;
}

interface Step4BatchProps {
  batchPeriods: BatchPeriodAllocation;
  weatherStation: string;
  batchResults: BatchResultEntry[] | null;
  isLoading: boolean;
  error: string | null;
}

// Simple bar chart component (no external library needed)
function StackedBarChart({ data, title, unit }: {
  data: { month: string; segments: { label: string; value: number; color: string }[]; total: number }[];
  title: string;
  unit: string;
}) {
  const maxVal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="flex items-end gap-1.5 h-48">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse" style={{ height: `${(d.total / maxVal) * 160}px` }}>
              {d.segments.map((seg, i) => (
                <div
                  key={i}
                  title={`${seg.label}: ${Math.round(seg.value)} ${unit}`}
                  style={{
                    height: `${(seg.value / d.total) * 100}%`,
                    backgroundColor: seg.color,
                    minHeight: seg.value > 0 ? "2px" : "0px",
                  }}
                  className={cn(i === 0 ? "rounded-t" : "", i === d.segments.length - 1 ? "rounded-b" : "")}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">{d.month}</span>
          </div>
        ))}
      </div>
      {/* Total line label */}
      <div className="flex items-center gap-4 text-xs text-gray-500 justify-center">
        {Object.entries(BUILDING_TYPE_INFO).map(([id, info]) => (
          <div key={id} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: info.color }} />
            <span>{info.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Step4BatchResults({
  batchPeriods,
  weatherStation,
  batchResults,
  isLoading,
  error,
}: Step4BatchProps) {
  // Collect all entries
  const entries: { buildingType: string; periodId: ConstructionPeriodId; count: number }[] = [];
  for (const [btId, periods] of Object.entries(batchPeriods)) {
    for (const [pId, count] of Object.entries(periods)) {
      if (count > 0) entries.push({ buildingType: btId, periodId: pId as ConstructionPeriodId, count });
    }
  }
  // Calculate counts per building type
  const buildingTypeCounts: Record<string, number> = {};
  for (const [btId, periods] of Object.entries(batchPeriods)) {
    const typeTotal = Object.values(periods).reduce((a, b) => a + b, 0);
    if (typeTotal > 0) buildingTypeCounts[btId] = typeTotal;
  }
  const totalBuildings = entries.reduce((a, e) => a + e.count, 0);
  const firstBuildingType = entries.length > 0 ? entries[0].buildingType : 'single-family-house';

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
        <div className="flex flex-col items-center">
          <BatchLoadingAnimation buildingTypeCounts={buildingTypeCounts} />
          
          <p className="text-4xl font-light text-slate-800 mt-6 tracking-tight">
            <span className="text-slate-400">Simulating {totalBuildings} building{totalBuildings !== 1 ? 's' : ''}</span>
          </p>
          
          <p className="text-slate-300 text-xs mt-4">
            This may take a few minutes
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600 font-medium">Simulation Error</p>
        <p className="text-sm text-red-500 mt-1">{error}</p>
      </div>
    );
  }

  if (!batchResults || batchResults.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 shadow-sm text-center">
        <Info className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No batch results available yet. Run the simulation to see combined results.</p>
      </div>
    );
  }

  // Aggregate results
  let totalHeating = 0, totalCooling = 0, totalDHW = 0, totalLighting = 0, totalEquipment = 0;
  let totalEnergy = 0, totalArea = 0;
  let peakHeating = 0, peakCooling = 0;

  // Monthly aggregation by building type
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const monthlyByType: Record<string, { heating: number[]; cooling: number[] }> = {};

  for (const result of batchResults) {
    const { annual, hourly, count, buildingType } = result;
    if (!annual) continue;

    totalHeating += (annual.heating || 0) * count;
    totalCooling += (annual.cooling || 0) * count;
    totalDHW += (annual.dhw || 0) * count;
    totalLighting += (annual.lighting || 0) * count;
    totalEquipment += (annual.equipment || 0) * count;
    totalEnergy += (annual.total || 0) * count;
    totalArea += (annual.floor_area || 0) * count;
    peakHeating += (annual.peak_heating_kw || 0) * count;
    peakCooling += (annual.peak_cooling_kw || 0) * count;

    // Monthly from hourly
    if (hourly?.heating_power_kw && hourly?.cooling_power_kw) {
      if (!monthlyByType[buildingType]) {
        monthlyByType[buildingType] = { heating: Array(12).fill(0), cooling: Array(12).fill(0) };
      }
      let offset = 0;
      for (let m = 0; m < 12; m++) {
        const hours = monthDays[m] * 24;
        const heatSlice = hourly.heating_power_kw.slice(offset, offset + hours);
        const coolSlice = hourly.cooling_power_kw.slice(offset, offset + hours);
        monthlyByType[buildingType].heating[m] += heatSlice.reduce((a: number, b: number) => a + b, 0) * count;
        monthlyByType[buildingType].cooling[m] += coolSlice.reduce((a: number, b: number) => a + b, 0) * count;
        offset += hours;
      }
    }
  }

  const combinedEUI = totalArea > 0 ? totalEnergy / totalArea : 0;

  // Build aggregated 8760 hourly arrays
  const hourlyHeating = new Float64Array(8760);
  const hourlyCooling = new Float64Array(8760);
  for (const result of batchResults) {
    const { hourly, count } = result;
    if (hourly?.heating_power_kw && hourly?.cooling_power_kw) {
      const len = Math.min(8760, hourly.heating_power_kw.length);
      for (let h = 0; h < len; h++) {
        hourlyHeating[h] += hourly.heating_power_kw[h] * count;
        hourlyCooling[h] += hourly.cooling_power_kw[h] * count;
      }
    }
  }
  const hourlyCombined = new Float64Array(8760);
  for (let h = 0; h < 8760; h++) {
    hourlyCombined[h] = hourlyHeating[h] + hourlyCooling[h];
  }

  // Downsample 8760 to ~365 points for rendering (daily max)
  const downsample = (arr: Float64Array) => {
    const daily: number[] = [];
    for (let d = 0; d < 365; d++) {
      let max = 0;
      for (let h = 0; h < 24; h++) {
        const idx = d * 24 + h;
        if (idx < arr.length && arr[idx] > max) max = arr[idx];
      }
      daily.push(max);
    }
    return daily;
  };

  const dailyPeakHeating = downsample(hourlyHeating);
  const dailyPeakCooling = downsample(hourlyCooling);
  const dailyPeakCombined = downsample(hourlyCombined);

  // Prepare full 8760 hourly data for Recharts LineChart (same as preconfig)
  const hourlyHeatingChartData = [];
  const hourlyCoolingChartData = [];
  for (let h = 0; h < 8760; h++) {
    hourlyHeatingChartData.push({ hour: h, power: hourlyHeating[h] });
    hourlyCoolingChartData.push({ hour: h, power: hourlyCooling[h] });
  }

  // Build stacked monthly heating data
  const heatingChartData = MONTH_NAMES.map((month, i) => {
    const segments: { label: string; value: number; color: string }[] = [];
    let total = 0;
    for (const [btId, data] of Object.entries(monthlyByType)) {
      const val = data.heating[i];
      segments.push({ label: BUILDING_TYPE_INFO[btId]?.label || btId, value: val, color: BUILDING_TYPE_INFO[btId]?.color || "#999" });
      total += val;
    }
    return { month, segments, total };
  });

  const coolingChartData = MONTH_NAMES.map((month, i) => {
    const segments: { label: string; value: number; color: string }[] = [];
    let total = 0;
    for (const [btId, data] of Object.entries(monthlyByType)) {
      const val = data.cooling[i];
      segments.push({ label: BUILDING_TYPE_INFO[btId]?.label || btId, value: val, color: BUILDING_TYPE_INFO[btId]?.color || "#999" });
      total += val;
    }
    return { month, segments, total };
  });

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <BarChart3 className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Batch Simulation Results</h2>
            <p className="text-sm text-gray-500">
              Combined results for {totalBuildings} building{totalBuildings !== 1 ? "s" : ""} · Total area: {Math.round(totalArea)} m²
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-red-50 border border-red-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-red-600">Total Heating</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{Math.round(totalHeating).toLocaleString()}</p>
            <p className="text-xs text-gray-500">kWh/year</p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-blue-600">Total Cooling</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{Math.round(totalCooling).toLocaleString()}</p>
            <p className="text-xs text-gray-500">kWh/year</p>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600">Total Energy</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{Math.round(totalEnergy).toLocaleString()}</p>
            <p className="text-xs text-gray-500">kWh/year</p>
          </div>

          <div className="rounded-lg bg-green-50 border border-green-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">Weighted Avg EUI</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{combinedEUI.toFixed(1)}</p>
            <p className="text-xs text-gray-500">kWh/m²/year</p>
          </div>
        </div>
      </div>

      {/* Peak Powers */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Power Demand</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Peak Heating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{peakHeating.toFixed(1)} kW</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Snowflake className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Peak Cooling</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{peakCooling.toFixed(1)} kW</p>
          </div>
        </div>
      </div>

      {/* Monthly Stacked Charts - Stacked vertically */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Energy Breakdown</h3>
        <div className="space-y-8">
          <StackedBarChart data={heatingChartData} title="Heating Energy (kWh)" unit="kWh" />
          <StackedBarChart data={coolingChartData} title="Cooling Energy (kWh)" unit="kWh" />
        </div>
      </div>

      {/* Hourly Power Profiles (8760) - Same style as preconfig/realtime */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Heating Power (Full Year)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          8760 hourly heating power values (kW) - combined across all buildings
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyHeatingChartData}>
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

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Cooling Power (Full Year)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          8760 hourly cooling power values (kW) - combined across all buildings
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyCoolingChartData}>
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

      {/* Energy Breakdown - Vertical Bar Chart (same as preconfig) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Energy Breakdown</h3>
        <p className="text-sm text-gray-500 mb-4">
          Distribution of energy consumption by end-use (kWh/year)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { name: "Heating", value: totalHeating, fill: "#ef4444" },
            { name: "Cooling", value: totalCooling, fill: "#3b82f6" },
            { name: "DHW", value: totalDHW, fill: "#f59e0b" },
            { name: "Lighting", value: totalLighting, fill: "#facc15" },
            { name: "Equipment", value: totalEquipment, fill: "#a855f7" },
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              label={{ value: "kWh/year", angle: -90, position: "insideLeft" }}
            />
            <Tooltip formatter={(value: number) => `${Math.round(value).toLocaleString()} kWh`} />
            <Bar dataKey="value" name="Energy">
              {[
                { name: "Heating", fill: "#ef4444" },
                { name: "Cooling", fill: "#3b82f6" },
                { name: "DHW", fill: "#f59e0b" },
                { name: "Lighting", fill: "#facc15" },
                { name: "Equipment", fill: "#a855f7" },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {[
            { name: "Heating", fill: "#ef4444" },
            { name: "Cooling", fill: "#3b82f6" },
            { name: "DHW", fill: "#f59e0b" },
            { name: "Lighting", fill: "#facc15" },
            { name: "Equipment", fill: "#a855f7" },
          ].map((item) => (
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

      {/* Per-building breakdown table */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Per-Building Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 font-medium text-gray-600">Building Type</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Period</th>
                <th className="text-center py-2 px-3 font-medium text-gray-600">Count</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Heating</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Cooling</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">EUI</th>
              </tr>
            </thead>
            <tbody>
              {[...batchResults].sort((a, b) => {
                // Sort order: SFH first, then mid-rise, then others
                const order: Record<string, number> = {
                  'single-family-house': 1,
                  'mid-rise-apartment': 2,
                  'office': 3,
                  'school': 4,
                  'retail': 5,
                  'hotel': 6,
                  'warehouse': 7,
                  'hospital': 8,
                };
                const orderA = order[a.buildingType] || 99;
                const orderB = order[b.buildingType] || 99;
                if (orderA !== orderB) return orderA - orderB;
                // Same building type - sort by period
                return (a.periodId || '').localeCompare(b.periodId || '');
              }).map((r, i) => {
                const btLabel = BUILDING_TYPE_INFO[r.buildingType]?.label || r.buildingType;
                const pLabel = CONSTRUCTION_PERIODS.find(p => p.id === r.periodId)?.label || r.periodId;
                return (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-gray-900">{btLabel}</td>
                    <td className="py-2.5 px-3 text-gray-700">{pLabel}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-semibold text-xs">
                        {r.count}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-700">
                      {Math.round((r.annual?.heating || 0) * r.count).toLocaleString()} kWh
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-700">
                      {Math.round((r.annual?.cooling || 0) * r.count).toLocaleString()} kWh
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                      {Math.round((r.annual?.total || 0) * r.count).toLocaleString()} kWh
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-700">
                      {(r.annual?.eui || 0).toFixed(1)} kWh/m²
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="border-t-2 border-gray-300 font-semibold">
                <td className="py-2.5 pr-3 text-gray-900" colSpan={2}>Total</td>
                <td className="py-2.5 px-3 text-center text-gray-900">{totalBuildings}</td>
                <td className="py-2.5 px-3 text-right text-gray-900">{Math.round(totalHeating).toLocaleString()} kWh</td>
                <td className="py-2.5 px-3 text-right text-gray-900">{Math.round(totalCooling).toLocaleString()} kWh</td>
                <td className="py-2.5 px-3 text-right text-gray-900">{Math.round(totalEnergy).toLocaleString()} kWh</td>
                <td className="py-2.5 px-3 text-right text-gray-900">{combinedEUI.toFixed(1)} kWh/m²</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
