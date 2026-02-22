"use client";

import {
  Home,
  Building2,
  Briefcase,
  BookOpen,
  ShoppingCart,
  Hotel,
  Package,
  Stethoscope,
  Zap,
  Settings,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BatchCounts {
  [key: string]: number;
}

interface Step1Props {
  simulationType: string;
  buildingType: string;
  batchCounts: BatchCounts;
  onSimulationTypeChange: (value: string) => void;
  onBuildingTypeChange: (value: string) => void;
  onBatchCountsChange: (counts: BatchCounts) => void;
}

const buildingTypes = [
  { id: "single-family-house", label: "Single Family House", icon: Home, available: true },
  { id: "mid-rise-apartment", label: "Mid-Rise Apartment", icon: Building2, available: true },
  { id: "office", label: "Office", icon: Briefcase, available: false },
  { id: "school", label: "School", icon: BookOpen, available: false },
  { id: "retail", label: "Retail", icon: ShoppingCart, available: false },
  { id: "hotel", label: "Hotel", icon: Hotel, available: false },
  { id: "warehouse", label: "Warehouse", icon: Package, available: false },
  { id: "hospital", label: "Hospital", icon: Stethoscope, available: false },
];

export { buildingTypes };

function SimTypeCard({ icon: Icon, title, description, selected, onClick }: {
  icon: any; title: string; description: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-xl border-2 p-6 transition-all text-left",
        selected ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:border-orange-300"
      )}
    >
      <div className="absolute top-4 right-4">
        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center",
          selected ? "border-orange-500" : "border-gray-300"
        )}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
        </div>
      </div>
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4",
        selected ? "bg-orange-100" : "bg-gray-100"
      )}>
        <Icon className={cn("h-6 w-6", selected ? "text-orange-500" : "text-gray-400")} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}

export function Step1SimulationType({
  simulationType,
  buildingType,
  batchCounts,
  onSimulationTypeChange,
  onBuildingTypeChange,
  onBatchCountsChange,
}: Step1Props) {
  const isBatch = simulationType === "batch";
  const totalBatch = Object.values(batchCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Simulation Type */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Simulation Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SimTypeCard
            icon={Settings}
            title="Pre-configured Building"
            description="Choose from standard building templates with predefined parameters"
            selected={simulationType === "pre-configured"}
            onClick={() => onSimulationTypeChange("pre-configured")}
          />
          <SimTypeCard
            icon={Zap}
            title="Real-time Simulation"
            description="Build a custom simulation with live parameter adjustments"
            selected={simulationType === "real-time"}
            onClick={() => onSimulationTypeChange("real-time")}
          />
          <SimTypeCard
            icon={Layers}
            title="Batch Simulation"
            description="Simulate multiple buildings at once and get combined results"
            selected={simulationType === "batch"}
            onClick={() => onSimulationTypeChange("batch")}
          />
        </div>
      </div>

      {/* Building Typology */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isBatch ? "Select Buildings & Quantities" : "Select Building Typology"}
          </h2>
          {isBatch && totalBatch > 0 && (
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              {totalBatch} building{totalBatch !== 1 ? "s" : ""} selected
            </span>
          )}
        </div>

        {isBatch ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {buildingTypes.map((type) => {
              const Icon = type.icon;
              const count = batchCounts[type.id] || 0;
              const hasCount = count > 0;
              return (
                <div
                  key={type.id}
                  className={cn(
                    "rounded-lg border-2 p-4 transition-all flex flex-col items-center gap-3",
                    !type.available
                      ? "border-gray-100 bg-gray-50 text-gray-400 opacity-60"
                      : hasCount
                      ? "border-orange-500 bg-orange-50 text-gray-900"
                      : "border-gray-200 bg-white text-gray-700"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm text-center font-medium">{type.label}</span>
                  {type.available ? (
                    <select
                      value={count}
                      onChange={(e) => {
                        onBatchCountsChange({ ...batchCounts, [type.id]: parseInt(e.target.value) });
                      }}
                      className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-center font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      {Array.from({ length: 11 }, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      disabled
                      value={0}
                      className="w-20 rounded-md border border-gray-200 bg-gray-100 px-2 py-1.5 text-sm text-center text-gray-400 cursor-not-allowed"
                    >
                      <option value={0}>0</option>
                    </select>
                  )}
                  {!type.available && (
                    <span className="text-[10px] text-gray-400">Coming soon</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {buildingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => type.available && onBuildingTypeChange(type.id)}
                  disabled={!type.available}
                  className={cn(
                    "rounded-lg border-2 p-4 transition-all font-medium flex flex-col items-center gap-2 relative",
                    !type.available
                      ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                      : buildingType === type.id
                      ? "border-orange-500 bg-orange-50 text-gray-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm text-center">{type.label}</span>
                  {!type.available && (
                    <span className="text-[10px] text-gray-400 absolute bottom-1">Coming soon</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
