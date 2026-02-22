"use client";

import { MapPin, Calendar, Square, Layers, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SWEDEN_COUNTIES,
  CONSTRUCTION_PERIODS,
  IDF_PARAMETERS,
  type ConstructionPeriodId,
} from "@/lib/sweden-climate-data";
import { SwedenMap } from "./sweden-map";
import { StationCombobox } from "./station-combobox";

interface Step2Props {
  weatherStation: string;
  constructionPeriod: ConstructionPeriodId;
  onWeatherStationChange: (value: string) => void;
  onConstructionPeriodChange: (value: ConstructionPeriodId) => void;
  hideConstructionPeriod?: boolean;
}

export function Step2BuildingInfo({
  weatherStation,
  constructionPeriod,
  onWeatherStationChange,
  onConstructionPeriodChange,
  hideConstructionPeriod = false,
}: Step2Props) {
  const params = IDF_PARAMETERS[constructionPeriod];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
          <Home className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Building Information
          </h2>
          <p className="text-sm text-gray-500">
            Configure your Swedish building parameters
          </p>
        </div>
      </div>

      {/* Top Row: Location dropdown + About simulation box */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Location (Weather Station) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4 text-orange-500" />
            Location (Weather Station)
            <span className="text-red-500">*</span>
          </label>
          <StationCombobox
            value={weatherStation}
            onChange={onWeatherStationChange}
            placeholder="Search or select location..."
          />
          <p className="text-xs text-gray-500">
            Weather data from climate.onebuilding.org (TMYx 2009-2023)
          </p>
        </div>

        {/* About simulation - compact box */}
        <div className="flex items-start">
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
            <p className="text-sm text-gray-700">
              <strong>About the simulation:</strong>{" "}
              {hideConstructionPeriod
                ? "Results are based on selected parameters and EnergyPlus simulations, combined with TMYx weather data for the selected Swedish location."
                : "Results are based on pre-computed EnergyPlus simulations using building prototypes for each construction period, combined with TMYx weather data for the selected Swedish location."}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Map + Construction Period (for pre-configured) or just Map (for real-time) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Sweden Map (big) */}
        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
          <SwedenMap 
            selectedStation={weatherStation} 
            onStationSelect={onWeatherStationChange}
          />
        </div>

        {/* Right: Construction Period + Fixed values (only for pre-configured mode) */}
        {!hideConstructionPeriod && (
          <div className="space-y-4">
            {/* Construction Period */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-orange-500" />
                Construction Period
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {CONSTRUCTION_PERIODS.map((period) => (
                  <button
                    key={period.id}
                    onClick={() =>
                      onConstructionPeriodChange(period.id as ConstructionPeriodId)
                    }
                    className={cn(
                      "rounded-lg border px-4 py-3 text-sm font-medium transition-all text-left",
                      constructionPeriod === period.id
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Area and Number of Floors - inline */}
            <div className="grid grid-cols-2 gap-4">
              {/* Floor Area - Fixed Display */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Square className="h-4 w-4 text-orange-500" />
                  Floor Area
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                    Fixed
                  </span>
                </label>
                <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700 text-sm">
                  {params.floorArea} m²
                </div>
              </div>

              {/* Number of Floors - Fixed Display */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Layers className="h-4 w-4 text-orange-500" />
                  Floors
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                    Fixed
                  </span>
                </label>
                <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700 text-sm">
                  {params.numberOfFloors}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Fields marked with <span className="text-red-500">*</span> are required
      </p>
    </div>
  );
}
