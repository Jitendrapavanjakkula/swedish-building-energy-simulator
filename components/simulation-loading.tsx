"use client";

import { useState, useEffect } from 'react';

interface SimulationLoadingProps {
  buildingType: string;
}

// Single Family House
function SFHBuilding({ fillY }: { fillY: number }) {
  return (
    <svg viewBox="0 0 160 180" className="w-44 h-52">
      <defs>
        <clipPath id="sfhClip">
          <path d="M20,50 L80,15 L140,50 L140,160 L20,160 Z" />
        </clipPath>
        <linearGradient id="fillGradSFH" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      
      <rect x="0" y={fillY} width="160" height={180 - fillY} fill="url(#fillGradSFH)" clipPath="url(#sfhClip)" />
      
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
}

// Mid-Rise Apartment
function MidRiseBuilding({ fillY }: { fillY: number }) {
  return (
    <svg viewBox="0 0 160 180" className="w-44 h-52">
      <defs>
        <clipPath id="mfdClip">
          <rect x="25" y="25" width="110" height="135" />
        </clipPath>
        <linearGradient id="fillGradMFD" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      
      <rect x="0" y={fillY} width="160" height={180 - fillY} fill="url(#fillGradMFD)" clipPath="url(#mfdClip)" />
      
      <rect x="25" y="25" width="110" height="135" fill="none" stroke="#94a3b8" strokeWidth="2" />
      
      {[35, 60, 85, 110].map((x, i) => (
        <rect key={`f4-${i}`} x={x} y="32" width="15" height="18" fill="none" stroke="#94a3b8" strokeWidth="1" />
      ))}
      
      {[35, 60, 85, 110].map((x, i) => (
        <rect key={`f3-${i}`} x={x} y="58" width="15" height="18" fill="none" stroke="#94a3b8" strokeWidth="1" />
      ))}
      
      {[35, 60, 85, 110].map((x, i) => (
        <rect key={`f2-${i}`} x={x} y="84" width="15" height="18" fill="none" stroke="#94a3b8" strokeWidth="1" />
      ))}
      
      {[35, 110].map((x, i) => (
        <rect key={`f1-${i}`} x={x} y="110" width="15" height="18" fill="none" stroke="#94a3b8" strokeWidth="1" />
      ))}
      
      <rect x="65" y="110" width="30" height="50" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="80" y1="110" x2="80" y2="160" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}

// Office Building
function OfficeBuilding({ fillY }: { fillY: number }) {
  return (
    <svg viewBox="0 0 160 180" className="w-44 h-52">
      <defs>
        <clipPath id="officeClip">
          <rect x="30" y="20" width="100" height="140" />
        </clipPath>
        <linearGradient id="fillGradOffice" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      
      <rect x="0" y={fillY} width="160" height={180 - fillY} fill="url(#fillGradOffice)" clipPath="url(#officeClip)" />
      
      <rect x="30" y="20" width="100" height="140" fill="none" stroke="#94a3b8" strokeWidth="2" />
      
      {[28, 50, 72, 94, 116, 138].map((y) => (
        [38, 58, 82, 102].map((x, col) => (
          <rect 
            key={`w-${y}-${col}`} 
            x={x} y={y} 
            width="18" height="16" 
            fill="none" 
            stroke="#94a3b8" 
            strokeWidth="1"
          />
        ))
      ))}
    </svg>
  );
}

// School Building - Scandinavian style
function SchoolBuilding({ fillY }: { fillY: number }) {
  return (
    <svg viewBox="0 0 180 180" className="w-48 h-48">
      <defs>
        <clipPath id="schoolClip">
          <path d="M10,70 L90,15 L170,70 L170,160 L10,160 Z" />
        </clipPath>
        <linearGradient id="fillGradSchool" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      
      <rect x="0" y={fillY} width="180" height={180 - fillY} fill="url(#fillGradSchool)" clipPath="url(#schoolClip)" />
      
      <path d="M10,70 L90,15 L170,70 L170,160 L10,160 Z" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <line x1="10" y1="70" x2="170" y2="70" stroke="#94a3b8" strokeWidth="1" />
      
      {/* Flag - stays gray */}
      <line x1="90" y1="15" x2="90" y2="-5" stroke="#94a3b8" strokeWidth="1.5" />
      <polygon points="90,-5 90,8 105,1.5" fill="#94a3b8" />
      
      <path d="M75,50 L90,35 L105,50 Z" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      
      {[25, 55, 105, 135].map((x, i) => (
        <rect key={`w-${i}`} x={x} y="85" width="25" height="30" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      ))}
      
      {[25, 55, 105, 135].map((x, i) => (
        <g key={`cross-${i}`}>
          <line x1={x + 12.5} y1="85" x2={x + 12.5} y2="115" stroke="#94a3b8" strokeWidth="1" />
          <line x1={x} y1="100" x2={x + 25} y2="100" stroke="#94a3b8" strokeWidth="1" />
        </g>
      ))}
      
      <rect x="75" y="125" width="30" height="35" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="98" cy="145" r="2" fill="#94a3b8" />
    </svg>
  );
}

// Retail Store
function RetailBuilding({ fillY }: { fillY: number }) {
  return (
    <svg viewBox="0 0 160 180" className="w-44 h-52">
      <defs>
        <clipPath id="retailClip">
          <rect x="20" y="35" width="120" height="125" />
        </clipPath>
        <linearGradient id="fillGradRetail" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      
      <rect x="0" y={fillY} width="160" height={180 - fillY} fill="url(#fillGradRetail)" clipPath="url(#retailClip)" />
      
      <rect x="20" y="35" width="120" height="125" fill="none" stroke="#94a3b8" strokeWidth="2" />
      
      <rect x="30" y="42" width="100" height="25" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      
      <rect x="30" y="80" width="60" height="55" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="60" y1="80" x2="60" y2="135" stroke="#94a3b8" strokeWidth="1" />
      <line x1="30" y1="107.5" x2="90" y2="107.5" stroke="#94a3b8" strokeWidth="1" />
      
      <rect x="100" y="95" width="30" height="65" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="105" cy="130" r="2.5" fill="#94a3b8" />
      
      <rect x="105" y="80" width="20" height="10" fill="none" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}

// Hotel Building
function HotelBuilding({ fillY }: { fillY: number }) {
  return (
    <svg viewBox="0 0 160 180" className="w-44 h-52">
      <defs>
        <clipPath id="hotelClip">
          <rect x="35" y="15" width="90" height="145" />
        </clipPath>
        <linearGradient id="fillGradHotel" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      
      <rect x="0" y={fillY} width="160" height={180 - fillY} fill="url(#fillGradHotel)" clipPath="url(#hotelClip)" />
      
      <rect x="35" y="15" width="90" height="145" fill="none" stroke="#94a3b8" strokeWidth="2" />
      
      {[22, 42, 62, 82, 102, 122].map((y) => (
        [45, 72.5, 100].map((x, col) => (
          <rect 
            key={`w-${y}-${col}`}
            x={x} y={y} 
            width="15" height="15" 
            fill="none" 
            stroke="#94a3b8" 
            strokeWidth="1"
          />
        ))
      ))}
      
      <rect x="65" y="140" width="30" height="20" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  );
}

// Warehouse
function WarehouseBuilding({ fillY }: { fillY: number }) {
  return (
    <svg viewBox="0 0 180 160" className="w-52 h-44">
      <defs>
        <clipPath id="warehouseClip">
          <path d="M10,50 L90,25 L170,50 L170,140 L10,140 Z" />
        </clipPath>
        <linearGradient id="fillGradWarehouse" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      
      <rect x="0" y={fillY} width="180" height={160 - fillY} fill="url(#fillGradWarehouse)" clipPath="url(#warehouseClip)" />
      
      <path d="M10,50 L90,25 L170,50 L170,140 L10,140 Z" fill="none" stroke="#94a3b8" strokeWidth="2" />
      
      {[25, 70, 115].map((x, i) => (
        <rect key={`dock-${i}`} x={x} y="70" width="35" height="55" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      ))}
      
      <rect x="25" y="55" width="18" height="12" fill="none" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}

// Hospital
function HospitalBuilding({ fillY }: { fillY: number }) {
  return (
    <svg viewBox="0 0 160 180" className="w-44 h-52">
      <defs>
        <clipPath id="hospitalClip">
          <rect x="30" y="25" width="100" height="135" />
        </clipPath>
        <linearGradient id="fillGradHospital" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      
      <rect x="0" y={fillY} width="160" height={180 - fillY} fill="url(#fillGradHospital)" clipPath="url(#hospitalClip)" />
      
      <rect x="30" y="25" width="100" height="135" fill="none" stroke="#94a3b8" strokeWidth="2" />
      
      <rect x="60" y="32" width="40" height="32" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="80" y1="38" x2="80" y2="58" stroke="#94a3b8" strokeWidth="2.5" />
      <line x1="70" y1="48" x2="90" y2="48" stroke="#94a3b8" strokeWidth="2.5" />
      
      {[75, 100, 125].map((y) => (
        [40, 62, 88, 110].map((x, col) => (
          <rect 
            key={`w-${y}-${col}`}
            x={x} y={y} 
            width="14" height="18" 
            fill="none" 
            stroke="#94a3b8" 
            strokeWidth="1"
          />
        ))
      ))}
      
      <rect x="67" y="148" width="26" height="12" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  );
}

// Building type to component mapping
const BUILDING_COMPONENTS: Record<string, React.FC<{ fillY: number }>> = {
  'single-family-house': SFHBuilding,
  'mid-rise-apartment': MidRiseBuilding,
  'office': OfficeBuilding,
  'school': SchoolBuilding,
  'retail': RetailBuilding,
  'hotel': HotelBuilding,
  'warehouse': WarehouseBuilding,
  'hospital': HospitalBuilding,
};

export function SimulationLoading({ buildingType }: SimulationLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to 95% over ~60 seconds
    // Stays at 95% until real completion (handled externally)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return 95;
        // Slow down as it approaches 95%
        const increment = p < 50 ? 1.5 : p < 80 ? 1 : 0.5;
        return Math.min(95, p + increment);
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const fillY = 160 - (progress / 100) * 145;

  const BuildingComponent = BUILDING_COMPONENTS[buildingType] || SFHBuilding;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
      <div className="flex flex-col items-center">
        <BuildingComponent fillY={fillY} />
        
        <p className="text-4xl font-light text-slate-800 mt-6 tracking-tight">
          {Math.round(progress)}<span className="text-2xl text-slate-400">%</span>
        </p>
        
        <p className="text-slate-400 text-sm mt-2 tracking-wide uppercase">
          Running Simulation
        </p>
        
        <p className="text-slate-300 text-xs mt-4">
          This typically takes 30-60 seconds
        </p>
      </div>
    </div>
  );
}
