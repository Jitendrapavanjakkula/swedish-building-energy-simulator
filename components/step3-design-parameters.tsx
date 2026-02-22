"use client";

import { Sliders, Thermometer, Wind, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IDF_PARAMETERS,
  MFD_IDF_PARAMETERS,
  type ConstructionPeriodId,
} from "@/lib/sweden-climate-data";

interface Step3Props {
  constructionPeriod: ConstructionPeriodId;
  buildingType?: string;
}

// Window glazing types based on construction period
const WINDOW_GLAZING: Record<ConstructionPeriodId, "single" | "double" | "triple"> = {
  "before-1961": "double",
  "1961-1975": "double",
  "1976-1985": "triple",
  "1986-1995": "triple",
  "1996-2005": "triple",
};

// Window icon component - Section view showing glass panes
function WindowIcon({ panes, isActive }: { panes: 1 | 2 | 3; isActive: boolean }) {
  const frameColor = isActive ? "#ea580c" : "#9ca3af";
  const glassColor = isActive ? "#f97316" : "#d1d5db";
  const airGapColor = isActive ? "#fed7aa" : "#f3f4f6";
  
  return (
    <svg viewBox="0 0 60 80" className="w-14 h-20">
      {/* Window frame - outer */}
      <rect x="5" y="5" width="50" height="70" rx="2" fill="none" stroke={frameColor} strokeWidth="4" />
      
      {/* Window frame - inner area */}
      <rect x="9" y="9" width="42" height="62" fill={airGapColor} />
      
      {/* Glass panes as vertical lines (section view) */}
      {panes === 1 && (
        <rect x="28" y="12" width="4" height="56" fill={glassColor} rx="1" />
      )}
      
      {panes === 2 && (
        <>
          <rect x="18" y="12" width="4" height="56" fill={glassColor} rx="1" />
          <rect x="38" y="12" width="4" height="56" fill={glassColor} rx="1" />
        </>
      )}
      
      {panes === 3 && (
        <>
          <rect x="13" y="12" width="4" height="56" fill={glassColor} rx="1" />
          <rect x="28" y="12" width="4" height="56" fill={glassColor} rx="1" />
          <rect x="43" y="12" width="4" height="56" fill={glassColor} rx="1" />
        </>
      )}
    </svg>
  );
}

export function Step3DesignParameters({ constructionPeriod, buildingType = "single-family-house" }: Step3Props) {
  const params = buildingType === "mid-rise-apartment" 
    ? MFD_IDF_PARAMETERS[constructionPeriod] 
    : IDF_PARAMETERS[constructionPeriod];
  const activeGlazing = WINDOW_GLAZING[constructionPeriod];

  // Define slider ranges for visual display
  const sliderConfig = [
    {
      label: "Wall U-Value",
      value: params.wallUValue,
      unit: "W/m²K",
      min: 0.1,
      max: 1.0,
      icon: Thermometer,
      description: "Lower is better insulation",
    },
    {
      label: "Attic U-Value",
      value: params.atticUValue,
      unit: "W/m²K",
      min: 0.05,
      max: 0.5,
      icon: Thermometer,
      description: "Lower is better insulation",
    },
    {
      label: "Ground Slab U-Value",
      value: params.groundSlabUValue,
      unit: "W/m²K",
      min: 0.1,
      max: 0.5,
      icon: Thermometer,
      description: "Lower is better insulation",
    },
    {
      label: "Window U-Value",
      value: params.windowUValue,
      unit: "W/m²K",
      min: 1.0,
      max: 3.0,
      icon: Thermometer,
      description: "Lower is better insulation",
    },
    {
      label: "Air Infiltration (ACH)",
      value: params.infiltrationACH,
      unit: "h⁻¹",
      min: 0,
      max: 1.0,
      icon: Wind,
      description: "Lower is more airtight",
    },
  ];

  // Calculate percentage for slider position
  const getSliderPercent = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const glazingTypes = [
    { id: "single" as const, label: "Single glazed", panes: 1 as const },
    { id: "double" as const, label: "Double glazed", panes: 2 as const },
    { id: "triple" as const, label: "Triple glazed", panes: 3 as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Sliders className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Design Parameters
            </h2>
            <p className="text-sm text-gray-500">
              Fixed values from IDF prototype for {constructionPeriod}
            </p>
          </div>
        </div>

        {/* Building Summary */}
        <div className={cn(
          "grid gap-4 rounded-lg bg-gray-50 p-4",
          buildingType === "mid-rise-apartment" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-5"
        )}>
          <div>
            <p className="text-xs text-gray-500">Construction Period</p>
            <p className="font-medium text-gray-900">{constructionPeriod}</p>
          </div>
          {buildingType !== "mid-rise-apartment" && (
            <div>
              <p className="text-xs text-gray-500">Total Floor Area</p>
              <p className="font-medium text-gray-900">188 m²</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Conditioned Floor Area</p>
            <p className="font-medium text-gray-900">{params.floorArea} m²</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Number of Floors</p>
            <p className="font-medium text-gray-900">{params.numberOfFloors}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Locked
            </p>
          </div>
        </div>
      </div>

      {/* Window Glazing Type */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Window Glazing Type
          </h3>
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            <Lock className="h-3 w-3" /> Based on IDF
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {glazingTypes.map((type) => {
            const isActive = type.id === activeGlazing;
            return (
              <div
                key={type.id}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                  isActive
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-gray-50 opacity-50"
                )}
              >
                <WindowIcon panes={type.panes} isActive={isActive} />
                <span className={cn(
                  "mt-2 text-sm font-medium",
                  isActive ? "text-orange-600" : "text-gray-400"
                )}>
                  {type.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Locked Sliders */}
      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Building Envelope Parameters
          </h3>
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            <Lock className="h-3 w-3" /> Values from EnergyPlus IDF
          </span>
        </div>

        {sliderConfig.map((slider) => {
          const Icon = slider.icon;
          const percent = getSliderPercent(slider.value, slider.min, slider.max);

          return (
            <div key={slider.label} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-orange-500" />
                <label className="text-sm font-medium text-gray-700">
                  {slider.label}
                </label>
                <span className="ml-auto text-sm font-semibold text-orange-500">
                  {slider.value.toFixed(2)} {slider.unit}
                </span>
              </div>

              {/* Visual slider (locked) */}
              <div className="relative">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow"
                  style={{ left: `calc(${percent}% - 8px)` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>
                  {slider.min} {slider.unit}
                </span>
                <span className="text-gray-500">{slider.description}</span>
                <span>
                  {slider.max} {slider.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> These parameters are fixed based on typical Swedish building standards for the selected construction period. The simulation may take 30-60 seconds. Results will be cached for instant retrieval on repeat queries.
        </p>
      </div>
    </div>
  );
}
