"use client";

import { MapPin, Calendar, Home, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SWEDEN_COUNTIES,
  CONSTRUCTION_PERIODS,
  type ConstructionPeriodId,
} from "@/lib/sweden-climate-data";
import { SwedenMap } from "./sweden-map";
import { StationCombobox } from "./station-combobox";
import type { BatchCounts } from "./step1-simulation-type";

// Mapping building type IDs to display names and icons
const BUILDING_TYPE_INFO: Record<string, { label: string; icon: any }> = {
  "single-family-house": { label: "Single Family House", icon: Home },
  "mid-rise-apartment": { label: "Mid-Rise Apartment", icon: Building2 },
};

export interface BatchPeriodAllocation {
  [buildingTypeId: string]: {
    [periodId: string]: number;
  };
}

interface Step2BatchProps {
  weatherStation: string;
  onWeatherStationChange: (value: string) => void;
  batchCounts: BatchCounts;
  batchPeriods: BatchPeriodAllocation;
  onBatchPeriodsChange: (periods: BatchPeriodAllocation) => void;
}

export function Step2BatchBuildingInfo({
  weatherStation,
  onWeatherStationChange,
  batchCounts,
  batchPeriods,
  onBatchPeriodsChange,
}: Step2BatchProps) {
  // Get only selected building types (count > 0), sorted with SFH first
  const buildingTypeOrder: Record<string, number> = {
    'single-family-house': 1,
    'mid-rise-apartment': 2,
    'office': 3,
    'school': 4,
    'retail': 5,
    'hotel': 6,
    'warehouse': 7,
    'hospital': 8,
  };
  
  const selectedTypes = Object.entries(batchCounts)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => (buildingTypeOrder[a.id] || 99) - (buildingTypeOrder[b.id] || 99));

  const updatePeriodCount = (buildingTypeId: string, periodId: string, value: number) => {
    const updated = { ...batchPeriods };
    if (!updated[buildingTypeId]) {
      updated[buildingTypeId] = {};
    }
    updated[buildingTypeId] = { ...updated[buildingTypeId], [periodId]: value };
    onBatchPeriodsChange(updated);
  };

  const getPeriodSum = (buildingTypeId: string): number => {
    const periods = batchPeriods[buildingTypeId] || {};
    return Object.values(periods).reduce((a, b) => a + b, 0);
  };

  return (
    <div className="space-y-6">
      {/* Combined: Map left, Location + Construction Periods right */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Left: Map - same size as preconfig */}
          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 md:flex-shrink-0 self-start">
            <SwedenMap selectedStation={weatherStation} onStationSelect={onWeatherStationChange} />
          </div>

          {/* Right: Location dropdown + Construction Period Allocation */}
          <div className="flex-1 space-y-6">
            {/* Location */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <MapPin className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                  <p className="text-sm text-gray-500">Select weather station for all buildings</p>
                </div>
              </div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <MapPin className="mr-1 inline h-4 w-4 text-orange-500" />
                Weather Station <span className="text-red-500">*</span>
              </label>
              <StationCombobox
                value={weatherStation}
                onChange={onWeatherStationChange}
                placeholder="Search or select location..."
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Construction Period Allocation */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Construction Period Allocation</h2>
                  <p className="text-sm text-gray-500">Distribute buildings across construction periods</p>
                </div>
              </div>

              {/* Allocation tables for each building type */}
              <div className="space-y-6">
                {selectedTypes.map(({ id, count }) => {
                  const info = BUILDING_TYPE_INFO[id] || { label: id, icon: Home };
                  const Icon = info.icon;
                  const periodSum = getPeriodSum(id);
                  const isValid = periodSum === count;

                  return (
                    <div key={id} className="border border-gray-200 rounded-lg p-4">
                      {/* Building type header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-orange-500" />
                          <span className="font-medium text-gray-900">{info.label}</span>
                          <span className="text-sm text-gray-500">({count} buildings)</span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          isValid ? "text-green-600" : "text-amber-600"
                        )}>
                          {isValid ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span>{periodSum} / {count} allocated</span>
                        </div>
                      </div>

                      {/* Period inputs */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {CONSTRUCTION_PERIODS.map((period) => (
                          <div key={period.id} className="space-y-1">
                            <label className="text-xs text-gray-600">{period.label}</label>
                            <select
                              value={batchPeriods[id]?.[period.id] || 0}
                              onChange={(e) => updatePeriodCount(id, period.id, Number(e.target.value))}
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none"
                            >
                              {Array.from({ length: count + 1 }, (_, i) => (
                                <option key={i} value={i}>{i}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
