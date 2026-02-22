"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Building2,
  Calendar,
  MapPin,
  Flame,
  Snowflake,
  Zap,
  TrendingUp,
  Download,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  LogOut,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { 
  getSimulations, 
  deleteSimulation, 
  downloadCSV,
  type SimulationRecord 
} from "@/lib/simulation-storage";
import { getStationName } from "@/lib/sweden-climate-data";

const BUILDING_ICONS: Record<string, any> = {
  "single-family-house": Home,
  "mid-rise-apartment": Building2,
  "mixed": Building2,
};

const BUILDING_LABELS: Record<string, string> = {
  "single-family-house": "Single Family House",
  "mid-rise-apartment": "Mid-Rise Apartment",
};

const TYPE_COLORS: Record<string, string> = {
  "pre-configured": "bg-blue-100 text-blue-700",
  "real-time": "bg-purple-100 text-purple-700",
  "batch": "bg-orange-100 text-orange-700",
};

function getBatchSummary(batchConfig: Record<string, Record<string, number>> | null): string {
  if (!batchConfig) return "Various";
  
  const typeCounts: Record<string, number> = {};
  for (const [buildingType, periods] of Object.entries(batchConfig)) {
    const total = Object.values(periods).reduce((a, b) => a + b, 0);
    if (total > 0) {
      typeCounts[buildingType] = total;
    }
  }
  
  const parts = Object.entries(typeCounts).map(([type, count]) => {
    const label = type === "single-family-house" ? "SFH" : 
                  type === "mid-rise-apartment" ? "MFD" : type;
    return `${count} ${label}`;
  });
  
  return parts.join(" + ") || "Various";
}

function SimulationCard({ 
  sim, 
  expanded, 
  onToggle,
  onDelete,
  onDownload,
  isDeleting,
}: { 
  sim: SimulationRecord; 
  expanded: boolean; 
  onToggle: () => void;
  onDelete: () => void;
  onDownload: () => void;
  isDeleting: boolean;
}) {
  const isBatch = sim.simulation_type === "batch";
  const Icon = isBatch ? Building2 : (BUILDING_ICONS[sim.building_type || ""] || Home);
  const date = new Date(sim.created_at);
  
  const buildingLabel = isBatch 
    ? `Batch (${sim.building_count} buildings)` 
    : BUILDING_LABELS[sim.building_type || ""] || sim.building_type;
  
  const periodLabel = isBatch 
    ? getBatchSummary(sim.batch_config) 
    : (sim.construction_period || "Custom");
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header - always visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Icon className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{buildingLabel}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TYPE_COLORS[sim.simulation_type])}>
                  {sim.simulation_type}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-orange-500" />
                  {getStationName(sim.weather_station)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-orange-500" />
                  {periodLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{sim.eui.toFixed(1)} kWh/m²</p>
              <p className="text-xs text-gray-500">{isBatch ? "Weighted Avg EUI" : "EUI"}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">
                {date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
              <p className="text-xs text-gray-400">
                {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="rounded-lg bg-red-50 border border-red-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-600">Heating</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{Math.round(sim.total_heating).toLocaleString()}</p>
              <p className="text-xs text-gray-500">kWh/year</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Snowflake className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">Cooling</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{Math.round(sim.total_cooling).toLocaleString()}</p>
              <p className="text-xs text-gray-500">kWh/year</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-600">Total</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{Math.round(sim.total_energy).toLocaleString()}</p>
              <p className="text-xs text-gray-500">kWh/year</p>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-600">{isBatch ? "Weighted Avg EUI" : "EUI"}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{sim.eui.toFixed(1)}</p>
              <p className="text-xs text-gray-500">kWh/m²/year</p>
            </div>
          </div>
          
          {/* Batch details */}
          {isBatch && sim.batch_config && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Building Breakdown</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sim.batch_config).map(([buildingType, periods]) => {
                  const total = Object.values(periods).reduce((a, b) => a + b, 0);
                  if (total === 0) return null;
                  const label = BUILDING_LABELS[buildingType] || buildingType;
                  return (
                    <span key={buildingType} className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {total}x {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors ml-auto disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SimulationHistory() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [simulations, setSimulations] = useState<SimulationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSim, setExpandedSim] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Load simulations
  useEffect(() => {
    async function loadSimulations() {
      setLoading(true);
      const { data, error } = await getSimulations();
      if (error) {
        setError(error);
      } else {
        setSimulations(data || []);
        // Expand the first one if any exist
        if (data && data.length > 0) {
          setExpandedSim(data[0].id);
        }
      }
      setLoading(false);
    }
    loadSimulations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this simulation?")) return;
    
    setDeletingId(id);
    const { success, error } = await deleteSimulation(id);
    if (success) {
      setSimulations(prev => prev.filter(s => s.id !== id));
      if (expandedSim === id) setExpandedSim(null);
    } else {
      alert(`Failed to delete: ${error}`);
    }
    setDeletingId(null);
  };

  const handleDownload = (sim: SimulationRecord) => {
    downloadCSV(sim);
  };

  const filteredSimulations = filterType === "all" 
    ? simulations 
    : simulations.filter(s => s.simulation_type === filterType);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/simulator')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Simulator
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{user?.email || ""}</span>
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/login');
                }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Simulation History
            </h1>
            <p className="mt-2 text-lg text-gray-500">View and manage your past simulations</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading simulations...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : simulations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No simulations yet</p>
            <p className="text-gray-500 text-sm mb-4">Run your first simulation to see it here</p>
            <button
              onClick={() => router.push('/simulator')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Go to Simulator
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing {filteredSimulations.length} of {simulations.length} simulations
              </p>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="all">All types</option>
                <option value="pre-configured">Pre-configured</option>
                <option value="real-time">Real-time</option>
                <option value="batch">Batch</option>
              </select>
            </div>
            {filteredSimulations.map((sim) => (
              <SimulationCard
                key={sim.id}
                sim={sim}
                expanded={expandedSim === sim.id}
                onToggle={() => setExpandedSim(expandedSim === sim.id ? null : sim.id)}
                onDelete={() => handleDelete(sim.id)}
                onDownload={() => handleDownload(sim)}
                isDeleting={deletingId === sim.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
