# Swedish Building Energy Simulator

A web application for simulating building energy consumption across Swedish locations.

## Features

- 🏠 **5 Construction Periods**: Before 1961 to 1996-2005
- 🗺️ **56 Swedish Weather Stations**: Grouped by county
- 📊 **Pre-computed EnergyPlus Results**: Instant results
- 📈 **Charts**:
  - Monthly heating & cooling energy (kWh)
  - Average hourly heating power (kW)
  - Average hourly cooling power (kW)
  - Combined heating & cooling power (kW)
  - Annual energy breakdown by end-use

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Next.js and deploy

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Project Structure

```
energy-app/
├── app/
│   ├── globals.css       # Tailwind styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page with steps
├── components/
│   ├── step-indicator.tsx
│   ├── step1-simulation-type.tsx
│   ├── step2-building-info.tsx
│   ├── step3-design-parameters.tsx
│   └── step4-results.tsx
├── lib/
│   ├── simulation-results.ts  # 280 simulation results
│   ├── sweden-climate-data.ts # Counties & stations
│   └── utils.ts
└── package.json
```

## Data Source

- **Weather Data**: TMYx 2009-2023 from climate.onebuilding.org
- **Simulation Engine**: EnergyPlus 25.2
- **Building Prototypes**: Swedish residential building standards

## Simulation Results

Each result contains:
- Annual energy by end-use (heating, cooling, DHW, lighting, equipment, fans)
- Peak power (total, heating, cooling)
- 8760 hourly power values for heating, cooling, and total

Total: **280 simulations** (5 periods × 56 stations)
