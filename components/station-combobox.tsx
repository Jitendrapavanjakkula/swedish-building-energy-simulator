"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Search, ChevronDown, X } from "lucide-react";
import { SWEDEN_COUNTIES } from "@/lib/sweden-climate-data";

interface StationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function StationCombobox({
  value,
  onChange,
  placeholder = "Search or select location...",
}: StationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Flatten all stations for searching
  const allStations = useMemo(() => {
    const stations: { id: string; name: string; county: string }[] = [];
    SWEDEN_COUNTIES.forEach((county) => {
      county.stations.forEach((station) => {
        stations.push({
          id: station.id,
          name: station.name,
          county: county.name,
        });
      });
    });
    return stations;
  }, []);

  // Get selected station display name
  const selectedStation = useMemo(() => {
    return allStations.find((s) => s.id === value);
  }, [value, allStations]);

  // Filter stations based on search query
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) {
      return allStations;
    }
    const query = searchQuery.toLowerCase();
    return allStations.filter(
      (station) =>
        station.name.toLowerCase().includes(query) ||
        station.county.toLowerCase().includes(query) ||
        station.id.toLowerCase().includes(query)
    );
  }, [searchQuery, allStations]);

  // Group filtered stations by county
  const groupedStations = useMemo(() => {
    const groups: { [county: string]: typeof filteredStations } = {};
    filteredStations.forEach((station) => {
      if (!groups[station.county]) {
        groups[station.county] = [];
      }
      groups[station.county].push(station);
    });
    return groups;
  }, [filteredStations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (stationId: string) => {
    onChange(stationId);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input field */}
      <div
        className={`flex items-center gap-2 w-full rounded-lg border bg-white px-3 py-2.5 cursor-pointer transition-colors ${
          isOpen
            ? "border-orange-500 ring-2 ring-orange-200"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none text-gray-900 placeholder-gray-400 min-w-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`flex-1 truncate ${
              selectedStation ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {selectedStation
              ? `${selectedStation.name} (${selectedStation.county})`
              : placeholder}
          </span>
        )}

        {value && !isOpen && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
        
        <ChevronDown
          className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filteredStations.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No stations found for "{searchQuery}"
            </div>
          ) : (
            Object.entries(groupedStations).map(([county, stations]) => (
              <div key={county}>
                {/* County header */}
                <div className="sticky top-0 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  {county} ({stations.length})
                </div>
                {/* Stations */}
                {stations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleSelect(station.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 flex items-center gap-2 ${
                      station.id === value
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-700"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{station.name}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
