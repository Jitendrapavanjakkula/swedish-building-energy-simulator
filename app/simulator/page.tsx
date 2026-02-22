"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, LogOut, History } from "lucide-react";
import { StepIndicator } from "@/components/step-indicator";
import { Step1SimulationType } from "@/components/step1-simulation-type";
import type { BatchCounts } from "@/components/step1-simulation-type";
import { Step2BuildingInfo } from "@/components/step2-building-info";
import { Step2BatchBuildingInfo } from "@/components/step2-batch-building-info";
import type { BatchPeriodAllocation } from "@/components/step2-batch-building-info";
import { Step3DesignParameters } from "@/components/step3-design-parameters";
import { Step3CustomParameters } from "@/components/step3-custom-parameters";
import { Step3BatchDesignParameters } from "@/components/step3-batch-design-parameters";
import { Step4Results } from "@/components/step4-results-api";
import { Step4ResultsDisplay } from "@/components/step4-results-display";
import { Step4BatchResults } from "@/components/step4-batch-results";
import { SimulationLoading } from "@/components/simulation-loading";
import type { ConstructionPeriodId } from "@/lib/sweden-climate-data";
import { getStationName } from "@/lib/sweden-climate-data";
import { useAuth } from "@/lib/auth-context";
import { saveSimulation } from "@/lib/simulation-storage";

export default function BuildingSimulator() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [simulationType, setSimulationType] = useState("pre-configured");
  const [buildingType, setBuildingType] = useState("single-family-house");
  const [weatherStation, setWeatherStation] = useState("lund");
  const [constructionPeriod, setConstructionPeriod] =
    useState<ConstructionPeriodId>("1986-1995");

  // Custom parameters for real-time simulation
  const [wallU, setWallU] = useState(0.3);
  const [atticU, setAtticU] = useState(0.2);
  const [groundU, setGroundU] = useState(0.2);
  const [ach, setAch] = useState(0.5);
  const [windowType, setWindowType] = useState<"single" | "double" | "triple">("double");
  const [wwr, setWwr] = useState(15);
  const [ventilationType, setVentilationType] = useState<"self-propelled" | "mechanical-exhaust" | "mechanical-exhaust-hr">("mechanical-exhaust-hr");
  const [heatedFloorArea, setHeatedFloorArea] = useState(125);
  const [numberOfFloors, setNumberOfFloors] = useState(2);

  // Batch simulation state
  const [batchCounts, setBatchCounts] = useState<BatchCounts>({});
  const [batchPeriods, setBatchPeriods] = useState<BatchPeriodAllocation>({});
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [isBatchSimulating, setIsBatchSimulating] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  // Simulation state for real-time mode
  const [isSimulating, setIsSimulating] = useState(false);
  const [customResult, setCustomResult] = useState<any>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Simulation state for pre-configured mode (from API)
  const [preConfigResult, setPreConfigResult] = useState<any>(null);
  const [preConfigHourly, setPreConfigHourly] = useState<any>(null);

  // Update defaults when building type changes
  useEffect(() => {
    if (buildingType === "mid-rise-apartment") {
      setHeatedFloorArea(3135);
      setNumberOfFloors(4);
      setWwr(20);
    } else {
      setHeatedFloorArea(125);
      setNumberOfFloors(2);
      setWwr(15);
    }
  }, [buildingType]);

  const steps = [
    { number: 1, label: "Building Typology" },
    { number: 2, label: "Building Info" },
    { number: 3, label: "Design Parameters" },
    { number: 4, label: "Results" },
  ];

  const isBatch = simulationType === "batch";

  // API call for custom simulation
  const runCustomSimulation = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    setIsSimulating(true);
    setSimulationError(null);
    setCustomResult(null);
    setCurrentStep(4); // Go to step 4 first to show loading
    
    try {
      const response = await fetch(`${API_BASE}/simulate/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weatherStation,
          wallU,
          atticU,
          groundU,
          ach,
          windowType,
          wwr,
          ventilationType,
          heatedFloorArea,
          numberOfFloors,
          buildingType,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      setCustomResult(result);
      
      // Save to history
      await saveSimulation({
        simulation_type: 'real-time',
        building_type: buildingType,
        weather_station: weatherStation,
        total_heating: result.annual?.heating || 0,
        total_cooling: result.annual?.cooling || 0,
        total_energy: result.annual?.total || 0,
        eui: result.annual?.eui || 0,
        floor_area: result.annual?.floor_area || heatedFloorArea,
        results_json: result.annual,
        hourly_data: result.hourly,
      });
    } catch (error) {
      setSimulationError(error instanceof Error ? error.message : "Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  // API call for batch simulation
  const runBatchSimulation = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    setIsBatchSimulating(true);
    setBatchError(null);
    setBatchResults(null);
    setCurrentStep(4); // Go to step 4 first to show loading

    try {
      // Build list of simulation jobs from batchPeriods
      const jobs: { buildingType: string; periodId: string; count: number }[] = [];
      for (const [btId, periods] of Object.entries(batchPeriods)) {
        for (const [pId, count] of Object.entries(periods)) {
          if (count > 0) jobs.push({ buildingType: btId, periodId: pId, count });
        }
      }

      // Run all simulations in parallel (each unique combo only once)
      const results = await Promise.all(
        jobs.map(async (job) => {
          const response = await fetch(`${API_BASE}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weatherStation,
              constructionPeriod: job.periodId,
              buildingType: job.buildingType,
            }),
          });
          if (!response.ok) throw new Error(`Simulation failed for ${job.buildingType} ${job.periodId}`);
          const data = await response.json();
          return {
            buildingType: job.buildingType,
            periodId: job.periodId,
            count: job.count,
            annual: data.annual || data,
            hourly: data.hourly || null,
          };
        })
      );

      setBatchResults(results);
      
      // Calculate totals for saving
      let totalHeating = 0, totalCooling = 0, totalEnergy = 0, totalArea = 0;
      for (const r of results) {
        const count = r.count || 1;
        totalHeating += (r.annual?.heating || 0) * count;
        totalCooling += (r.annual?.cooling || 0) * count;
        totalEnergy += (r.annual?.total || 0) * count;
        totalArea += (r.annual?.floor_area || 0) * count;
      }
      const weightedEui = totalArea > 0 ? totalEnergy / totalArea : 0;
      
      // Save to history
      await saveSimulation({
        simulation_type: 'batch',
        weather_station: weatherStation,
        batch_config: batchPeriods,
        building_count: jobs.reduce((a, j) => a + j.count, 0),
        total_heating: totalHeating,
        total_cooling: totalCooling,
        total_energy: totalEnergy,
        eui: weightedEui,
        floor_area: totalArea,
        results_json: results,
      });
    } catch (error) {
      setBatchError(error instanceof Error ? error.message : "Batch simulation failed");
    } finally {
      setIsBatchSimulating(false);
    }
  };

  const nextStep = async () => {
    if (simulationType === "real-time" && currentStep === 3) {
      await runCustomSimulation();
    } else if (simulationType === "batch" && currentStep === 3) {
      await runBatchSimulation();
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Validation helpers for batch
  const totalBatchCount = Object.values(batchCounts).reduce((a, b) => a + b, 0);
  
  const batchPeriodsValid = () => {
    for (const [btId, count] of Object.entries(batchCounts)) {
      if (count > 0) {
        const periods = batchPeriods[btId] || {};
        const sum = Object.values(periods).reduce((a, b) => a + b, 0);
        if (sum !== count) return false;
      }
    }
    return true;
  };

  const canProceed = () => {
    if (currentStep === 1) {
      if (isBatch) return totalBatchCount >= 2; // Batch requires at least 2 buildings
      return simulationType && buildingType;
    }
    if (currentStep === 2) {
      if (isBatch) return weatherStation && batchPeriodsValid();
      if (simulationType === "real-time") return weatherStation;
      return weatherStation && constructionPeriod;
    }
    return true;
  };

  const downloadResults = () => {
    let result: any = null;
    let hourlyData: any = null;

    if (simulationType === "real-time" && customResult) {
      result = customResult.annual;
      hourlyData = customResult.hourly;
    } else if (simulationType === "pre-configured" && preConfigResult) {
      result = preConfigResult;
      hourlyData = preConfigHourly;
    } else if (simulationType === "batch" && batchResults) {
      // Batch CSV download
      downloadBatchResults();
      return;
    }

    if (!result) return;

    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: { month: string; heating: number; cooling: number }[] = [];
    
    if (hourlyData && hourlyData.heating_power_kw && hourlyData.cooling_power_kw) {
      let hourOffset = 0;
      for (let m = 0; m < 12; m++) {
        const hoursInMonth = monthDays[m] * 24;
        const heatingEnergy = hourlyData.heating_power_kw.slice(hourOffset, hourOffset + hoursInMonth).reduce((a: number, b: number) => a + b, 0);
        const coolingEnergy = hourlyData.cooling_power_kw.slice(hourOffset, hourOffset + hoursInMonth).reduce((a: number, b: number) => a + b, 0);
        monthlyData.push({ month: monthNames[m], heating: Math.round(heatingEnergy), cooling: Math.round(coolingEnergy) });
        hourOffset += hoursInMonth;
      }
    }

    const stationName = getStationName(weatherStation);
    
    let csv = "";
    csv += "Building Energy Simulation Results\n";
    csv += `Generated,${new Date().toISOString()}\n\n`;
    
    csv += "CONFIGURATION\n";
    csv += `Building Type,${buildingType.replace(/-/g, " ")}\n`;
    csv += `Weather Location,${stationName}\n`;
    if (simulationType === "pre-configured") {
      csv += `Construction Period,${constructionPeriod}\n`;
    } else {
      csv += `Simulation Type,Custom Real-Time\n`;
    }
    csv += `Conditioned Floor Area,${result.floor_area} m²\n\n`;
    
    csv += "ANNUAL SUMMARY\n";
    csv += `Total Energy,${Math.round(result.total)},kWh/year\n`;
    csv += `EUI,${result.eui.toFixed(1)},kWh/m²/year\n`;
    csv += `Peak Heating Power,${(result.peak_heating_kw || 0).toFixed(2)},kW\n`;
    csv += `Peak Cooling Power,${(result.peak_cooling_kw || 0).toFixed(2)},kW\n\n`;
    
    csv += "ENERGY BREAKDOWN\n";
    csv += `Heating,${Math.round(result.heating)},kWh/year\n`;
    csv += `Cooling,${Math.round(result.cooling)},kWh/year\n`;
    csv += `DHW,${Math.round(result.dhw)},kWh/year\n`;
    csv += `Lighting,${Math.round(result.lighting)},kWh/year\n`;
    csv += `Equipment,${Math.round(result.equipment)},kWh/year\n\n`;
    
    csv += "MONTHLY HEATING & COOLING (kWh)\n";
    csv += "Month,Heating,Cooling\n";
    monthlyData.forEach((m) => {
      csv += `${m.month},${m.heating},${m.cooling}\n`;
    });
    csv += "\n";
    
    if (hourlyData && hourlyData.heating_power_kw && hourlyData.cooling_power_kw) {
      csv += "HOURLY DATA (8760 hours)\n";
      csv += "Hour,Heating Power (kW),Cooling Power (kW)\n";
      for (let h = 0; h < Math.min(8760, hourlyData.heating_power_kw.length); h++) {
        csv += `${h},${hourlyData.heating_power_kw[h].toFixed(3)},${hourlyData.cooling_power_kw[h].toFixed(3)}\n`;
      }
    }
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `energy_results_${weatherStation}_${simulationType === "pre-configured" ? constructionPeriod : "custom"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadBatchResults = () => {
    if (!batchResults) return;

    const stationName = getStationName(weatherStation);
    let csv = "Batch Simulation Results\n";
    csv += `Generated,${new Date().toISOString()}\n`;
    csv += `Weather Location,${stationName}\n\n`;

    csv += "PER-BUILDING RESULTS\n";
    csv += "Building Type,Construction Period,Count,Heating (kWh),Cooling (kWh),DHW (kWh),Lighting (kWh),Equipment (kWh),Total (kWh),EUI (kWh/m²),Floor Area (m²),Peak Heating (kW),Peak Cooling (kW)\n";

    let totH = 0, totC = 0, totDHW = 0, totL = 0, totE = 0, totT = 0, totA = 0, totPH = 0, totPC = 0;

    for (const r of batchResults) {
      const a = r.annual || {};
      const h = (a.heating || 0) * r.count;
      const c = (a.cooling || 0) * r.count;
      const d = (a.dhw || 0) * r.count;
      const l = (a.lighting || 0) * r.count;
      const e = (a.equipment || 0) * r.count;
      const t = (a.total || 0) * r.count;
      const area = (a.floor_area || 0) * r.count;
      const ph = (a.peak_heating_kw || 0) * r.count;
      const pc = (a.peak_cooling_kw || 0) * r.count;
      
      totH += h; totC += c; totDHW += d; totL += l; totE += e; totT += t; totA += area; totPH += ph; totPC += pc;

      csv += `${r.buildingType},${r.periodId},${r.count},${Math.round(h)},${Math.round(c)},${Math.round(d)},${Math.round(l)},${Math.round(e)},${Math.round(t)},${(a.eui || 0).toFixed(1)},${Math.round(area)},${ph.toFixed(2)},${pc.toFixed(2)}\n`;
    }

    csv += `\nTOTAL,,${batchResults.reduce((a, r) => a + r.count, 0)},${Math.round(totH)},${Math.round(totC)},${Math.round(totDHW)},${Math.round(totL)},${Math.round(totE)},${Math.round(totT)},${totA > 0 ? (totT / totA).toFixed(1) : "0"},${Math.round(totA)},${totPH.toFixed(2)},${totPC.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `batch_results_${weatherStation}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isAnySimulating = isSimulating || isBatchSimulating;

  // Show loading while checking auth
  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </main>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Top bar with user info */}
          <div className="flex items-center justify-between mb-4">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
              BETA RELEASE
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard-preview')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 transition-colors"
              >
                <History className="h-4 w-4" />
                History
              </button>
              <span className="text-sm text-gray-500">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Building Energy Simulator
            </h1>
            <p className="mt-2 text-lg text-gray-500">For Swedish buildings</p>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Error Display */}
        {(simulationError || batchError) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{simulationError || batchError}</p>
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {currentStep === 1 && (
            <Step1SimulationType
              simulationType={simulationType}
              buildingType={buildingType}
              batchCounts={batchCounts}
              onSimulationTypeChange={(newType) => {
                setSimulationType(newType);
                // Clear all results when simulation type changes
                setCustomResult(null);
                setPreConfigResult(null);
                setPreConfigHourly(null);
                setBatchResults(null);
                // Clear batch data when switching away from batch
                if (newType !== "batch") {
                  setBatchCounts({});
                  setBatchPeriods({});
                }
              }}
              onBuildingTypeChange={(newType) => {
                setBuildingType(newType);
                // Clear results when building type changes
                setCustomResult(null);
                setPreConfigResult(null);
                setPreConfigHourly(null);
              }}
              onBatchCountsChange={(newCounts) => {
                setBatchCounts(newCounts);
                // Clear batch results when counts change
                setBatchResults(null);
                // Clear batchPeriods for building types that are now 0
                setBatchPeriods((prev) => {
                  const updated: BatchPeriodAllocation = {};
                  for (const [btId, count] of Object.entries(newCounts)) {
                    if (count > 0 && prev[btId]) {
                      updated[btId] = prev[btId];
                    }
                  }
                  return updated;
                });
              }}
            />
          )}

          {currentStep === 2 && !isBatch && (
            <Step2BuildingInfo
              weatherStation={weatherStation}
              constructionPeriod={constructionPeriod}
              onWeatherStationChange={(newStation) => {
                setWeatherStation(newStation);
                // Clear all results when weather station changes
                setCustomResult(null);
                setPreConfigResult(null);
                setPreConfigHourly(null);
                setBatchResults(null);
              }}
              onConstructionPeriodChange={(newPeriod) => {
                setConstructionPeriod(newPeriod);
                // Clear pre-config results when period changes
                setPreConfigResult(null);
                setPreConfigHourly(null);
              }}
              hideConstructionPeriod={simulationType === "real-time"}
            />
          )}

          {currentStep === 2 && isBatch && (
            <Step2BatchBuildingInfo
              weatherStation={weatherStation}
              onWeatherStationChange={(newStation) => {
                setWeatherStation(newStation);
                // Clear batch results when weather station changes
                setBatchResults(null);
              }}
              batchCounts={batchCounts}
              batchPeriods={batchPeriods}
              onBatchPeriodsChange={(newPeriods) => {
                setBatchPeriods(newPeriods);
                // Clear batch results when periods change
                setBatchResults(null);
              }}
            />
          )}

          {currentStep === 3 && simulationType === "pre-configured" && (
            <Step3DesignParameters constructionPeriod={constructionPeriod} buildingType={buildingType} />
          )}

          {currentStep === 3 && simulationType === "real-time" && (
            <Step3CustomParameters
              wallU={wallU}
              atticU={atticU}
              groundU={groundU}
              ach={ach}
              windowType={windowType}
              wwr={wwr}
              ventilationType={ventilationType}
              heatedFloorArea={heatedFloorArea}
              numberOfFloors={numberOfFloors}
              buildingType={buildingType}
              onWallUChange={setWallU}
              onAtticUChange={setAtticU}
              onGroundUChange={setGroundU}
              onAchChange={setAch}
              onWindowTypeChange={setWindowType}
              onWwrChange={setWwr}
              onVentilationTypeChange={setVentilationType}
              onHeatedFloorAreaChange={setHeatedFloorArea}
              onNumberOfFloorsChange={setNumberOfFloors}
            />
          )}

          {currentStep === 3 && simulationType === "batch" && (
            <Step3BatchDesignParameters batchPeriods={batchPeriods} />
          )}

          {currentStep === 4 && simulationType === "pre-configured" && (
            <Step4Results
              weatherStation={weatherStation}
              constructionPeriod={constructionPeriod}
              buildingType={buildingType}
              onResult={async (annual, hourly) => {
                setPreConfigResult(annual);
                setPreConfigHourly(hourly);
                
                // Save to history (only if we have results and haven't saved this combo)
                if (annual && annual.total > 0) {
                  await saveSimulation({
                    simulation_type: 'pre-configured',
                    building_type: buildingType,
                    weather_station: weatherStation,
                    construction_period: constructionPeriod,
                    total_heating: annual.heating || 0,
                    total_cooling: annual.cooling || 0,
                    total_energy: annual.total || 0,
                    eui: annual.eui || 0,
                    floor_area: annual.floor_area || 125,
                    results_json: annual,
                    hourly_data: hourly,
                  });
                }
              }}
            />
          )}

          {currentStep === 4 && simulationType === "real-time" && isSimulating && (
            <SimulationLoading buildingType={buildingType} />
          )}

          {currentStep === 4 && simulationType === "real-time" && customResult && !isSimulating && (
            <Step4ResultsDisplay 
              result={customResult.annual}
              hourlyData={customResult.hourly}
              cached={customResult.cached}
              weatherStation={weatherStation}
              customParameters={{ wallU, atticU, groundU, ach, windowType, wwr, ventilationType, heatedFloorArea, numberOfFloors }}
            />
          )}

          {currentStep === 4 && simulationType === "batch" && (
            <Step4BatchResults
              batchPeriods={batchPeriods}
              weatherStation={weatherStation}
              batchResults={batchResults}
              isLoading={isBatchSimulating}
              error={batchError}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isAnySimulating}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          {currentStep === 4 ? (
            <button
              onClick={downloadResults}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-all hover:bg-orange-600"
            >
              <Download className="h-4 w-4" />
              Download Results
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed() || isAnySimulating}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnySimulating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                currentStep === 3 && (simulationType === "real-time" || simulationType === "batch")
                  ? "Run Simulation"
                  : "Continue"
              )}
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-500">
            Developed by Jitendra Pavan Jakkula | Project Assistant, Lund University, Sweden
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supervised by Akram Abdul Hamid | Assistant Professor, Lund University, Sweden
          </p>
        </footer>
      </div>
    </main>
  );
}
