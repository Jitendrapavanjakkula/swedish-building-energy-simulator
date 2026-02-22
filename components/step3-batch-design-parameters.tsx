"use client";

import { Sliders, Thermometer, Wind, Lock, Home, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IDF_PARAMETERS,
  MFD_IDF_PARAMETERS,
  CONSTRUCTION_PERIODS,
  type ConstructionPeriodId,
} from "@/lib/sweden-climate-data";
import type { BatchPeriodAllocation } from "./step2-batch-building-info";

const BUILDING_TYPE_INFO: Record<string, { label: string; icon: any }> = {
  "single-family-house": { label: "Single Family House", icon: Home },
  "mid-rise-apartment": { label: "Mid-Rise Apartment", icon: Building2 },
};

interface Step3BatchProps {
  batchPeriods: BatchPeriodAllocation;
}

export function Step3BatchDesignParameters({ batchPeriods }: Step3BatchProps) {
  // Building type sort order
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

  // Collect all non-zero entries
  const entries: { buildingType: string; periodId: ConstructionPeriodId; count: number }[] = [];
  for (const [btId, periods] of Object.entries(batchPeriods)) {
    for (const [pId, count] of Object.entries(periods)) {
      if (count > 0) {
        entries.push({ buildingType: btId, periodId: pId as ConstructionPeriodId, count });
      }
    }
  }

  // Sort entries by building type order
  entries.sort((a, b) => (buildingTypeOrder[a.buildingType] || 99) - (buildingTypeOrder[b.buildingType] || 99));

  // Group by building type
  const groupedByType: Record<string, typeof entries> = {};
  for (const entry of entries) {
    if (!groupedByType[entry.buildingType]) groupedByType[entry.buildingType] = [];
    groupedByType[entry.buildingType].push(entry);
  }

  // Sort the grouped keys
  const sortedBuildingTypes = Object.keys(groupedByType).sort(
    (a, b) => (buildingTypeOrder[a] || 99) - (buildingTypeOrder[b] || 99)
  );

  const totalBuildings = entries.reduce((a, e) => a + e.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Sliders className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Batch Design Parameters</h2>
            <p className="text-sm text-gray-500">
              Fixed IDF parameters for {totalBuildings} building{totalBuildings !== 1 ? "s" : ""} in the batch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <Lock className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            All parameters are fixed based on the IDF prototypes for each building type and construction period.
          </p>
        </div>
      </div>

      {/* Parameter tables per building type */}
      {sortedBuildingTypes.map((btId) => {
        const btEntries = groupedByType[btId];
        const info = BUILDING_TYPE_INFO[btId];
        if (!info) return null;
        const Icon = info.icon;

        return (
          <div key={btId} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">{info.label}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Period</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">Count</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">
                      <span className="flex items-center justify-center gap-1">
                        <Thermometer className="h-3 w-3" /> Wall U
                      </span>
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">
                      <span className="flex items-center justify-center gap-1">
                        <Thermometer className="h-3 w-3" /> Attic U
                      </span>
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">
                      <span className="flex items-center justify-center gap-1">
                        <Thermometer className="h-3 w-3" /> Slab U
                      </span>
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">
                      <span className="flex items-center justify-center gap-1">
                        <Thermometer className="h-3 w-3" /> Win U
                      </span>
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">
                      <span className="flex items-center justify-center gap-1">
                        <Wind className="h-3 w-3" /> ACH
                      </span>
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">Floor Area</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">Floors</th>
                  </tr>
                </thead>
                <tbody>
                  {btEntries.map(({ periodId, count }) => {
                    const params = btId === "mid-rise-apartment"
                      ? MFD_IDF_PARAMETERS[periodId]
                      : IDF_PARAMETERS[periodId];
                    const periodLabel = CONSTRUCTION_PERIODS.find(p => p.id === periodId)?.label || periodId;

                    return (
                      <tr key={periodId} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-gray-900">{periodLabel}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
                            {count}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{params.wallUValue.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{params.atticUValue.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{params.groundSlabUValue.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{params.windowUValue.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{params.infiltrationACH.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{params.floorArea} m²</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{params.numberOfFloors}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-2">Batch Summary</h4>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {entries.map(({ buildingType, periodId, count }) => {
            const btLabel = BUILDING_TYPE_INFO[buildingType]?.label || buildingType;
            const pLabel = CONSTRUCTION_PERIODS.find(p => p.id === periodId)?.label || periodId;
            return (
              <div key={`${buildingType}-${periodId}`} className="text-sm text-gray-600">
                <span className="font-medium">{count}×</span> {btLabel} ({pLabel})
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Total: {totalBuildings} building{totalBuildings !== 1 ? "s" : ""} · Simulation may take {totalBuildings * 30}–{totalBuildings * 60} seconds
        </p>
      </div>
    </div>
  );
}
