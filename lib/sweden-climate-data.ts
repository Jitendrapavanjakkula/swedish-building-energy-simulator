// Swedish weather stations grouped by county
// Matched to actual simulation results

export interface WeatherStation {
  id: string;
  name: string;
}

export interface County {
  code: string;
  name: string;
  stations: WeatherStation[];
}

export const CONSTRUCTION_PERIODS = [
  { id: "before-1961", label: "Before 1961" },
  { id: "1961-1975", label: "1961-1975" },
  { id: "1976-1985", label: "1976-1985" },
  { id: "1986-1995", label: "1986-1995" },
  { id: "1996-2005", label: "1996-2005" },
] as const;

export type ConstructionPeriodId = typeof CONSTRUCTION_PERIODS[number]["id"];

// IDF Parameters for each construction period (locked values for display)
export const IDF_PARAMETERS: Record<ConstructionPeriodId, {
  wallUValue: number;
  atticUValue: number;
  groundSlabUValue: number;
  windowUValue: number;
  infiltrationACH: number;
  floorArea: number;
  numberOfFloors: number;
  windowArea: number;
}> = {
  "before-1961": {
    wallUValue: 0.60,
    atticUValue: 0.29,
    groundSlabUValue: 0.28,
    windowUValue: 2.34,
    infiltrationACH: 0.15,
    floorArea: 125,
    numberOfFloors: 2,
    windowArea: 28,
  },
  "1961-1975": {
    wallUValue: 0.31,
    atticUValue: 0.21,
    groundSlabUValue: 0.32,
    windowUValue: 2.30,
    infiltrationACH: 0.15,
    floorArea: 125,
    numberOfFloors: 2,
    windowArea: 28,
  },
  "1976-1985": {
    wallUValue: 0.21,
    atticUValue: 0.15,
    groundSlabUValue: 0.27,
    windowUValue: 2.01,
    infiltrationACH: 0.15,
    floorArea: 125,
    numberOfFloors: 2,
    windowArea: 28,
  },
  "1986-1995": {
    wallUValue: 0.17,
    atticUValue: 0.12,
    groundSlabUValue: 0.24,
    windowUValue: 1.94,
    infiltrationACH: 0.15,
    floorArea: 125,
    numberOfFloors: 2,
    windowArea: 28,
  },
  "1996-2005": {
    wallUValue: 0.20,
    atticUValue: 0.12,
    groundSlabUValue: 0.18,
    windowUValue: 1.87,
    infiltrationACH: 0.08,
    floorArea: 125,
    numberOfFloors: 2,
    windowArea: 28,
  },
};

// MFD (Mid-Rise Apartment) parameters from verified Excel (IDF U-Values with film resistances)
// Building: 46.3m x 7.6m, 3 floors (G/M/T), ~784 m² per floor = ~2351 m² total
// ACH: 0.05 for most periods, variable for 1996-2005
export const MFD_IDF_PARAMETERS: Record<ConstructionPeriodId, {
  wallUValue: number;
  atticUValue: number;
  groundSlabUValue: number;
  windowUValue: number;
  infiltrationACH: number;
  floorArea: number;
  numberOfFloors: number;
  windowArea: number;
}> = {
  "before-1961": {
    wallUValue: 0.58,
    atticUValue: 0.36,
    groundSlabUValue: 0.36,
    windowUValue: 2.22,
    infiltrationACH: 0.05,
    floorArea: 3135,
    numberOfFloors: 4,
    windowArea: 307,
  },
  "1961-1975": {
    wallUValue: 0.50,
    atticUValue: 0.28,
    groundSlabUValue: 0.32,
    windowUValue: 2.22,
    infiltrationACH: 0.05,
    floorArea: 3135,
    numberOfFloors: 4,
    windowArea: 307,
  },
  "1976-1985": {
    wallUValue: 0.41,
    atticUValue: 0.20,
    groundSlabUValue: 0.28,
    windowUValue: 2.22,
    infiltrationACH: 0.05,
    floorArea: 3135,
    numberOfFloors: 4,
    windowArea: 307,
  },
  "1986-1995": {
    wallUValue: 0.22,
    atticUValue: 0.15,
    groundSlabUValue: 0.26,
    windowUValue: 1.80,
    infiltrationACH: 0.05,
    floorArea: 3135,
    numberOfFloors: 4,
    windowArea: 307,
  },
  "1996-2005": {
    wallUValue: 0.20,
    atticUValue: 0.13,
    groundSlabUValue: 0.22,
    windowUValue: 1.97,
    infiltrationACH: 0.04,
    floorArea: 3135,
    numberOfFloors: 4,
    windowArea: 307,
  },
};

export const SWEDEN_COUNTIES: County[] = [
  {
    code: "BD",
    name: "Norrbotten",
    stations: [
      { id: "kiruna", name: "Kiruna" },
      { id: "gallivare", name: "Gällivare" },
      { id: "lulea", name: "Luleå" },
      { id: "boden", name: "Boden" },
      { id: "haparanda", name: "Haparanda" },
      { id: "pajala", name: "Pajala" },
      { id: "jokkmokk", name: "Jokkmokk" },
      { id: "arvidsjaur", name: "Arvidsjaur" },
    ],
  },
  {
    code: "AC",
    name: "Västerbotten",
    stations: [
      { id: "umea", name: "Umeå" },
      { id: "skelleftea", name: "Skellefteå" },
      { id: "lycksele", name: "Lycksele" },
      { id: "vilhelmina", name: "Vilhelmina" },
      { id: "storuman", name: "Storuman" },
    ],
  },
  {
    code: "Z",
    name: "Jämtland",
    stations: [
      { id: "ostersund", name: "Östersund" },
      { id: "are", name: "Åre" },
      { id: "sveg", name: "Sveg" },
    ],
  },
  {
    code: "Y",
    name: "Västernorrland",
    stations: [
      { id: "sundsvall", name: "Sundsvall" },
      { id: "harnosand", name: "Härnösand" },
      { id: "ornskoldsvik", name: "Örnsköldsvik" },
    ],
  },
  {
    code: "X",
    name: "Gävleborg",
    stations: [
      { id: "gavle", name: "Gävle" },
      { id: "soderhamn", name: "Söderhamn" },
    ],
  },
  {
    code: "W",
    name: "Dalarna",
    stations: [
      { id: "borlange", name: "Borlänge" },
      { id: "mora", name: "Mora" },
      { id: "malung", name: "Malung" },
      { id: "idre", name: "Idre" },
    ],
  },
  {
    code: "S",
    name: "Värmland",
    stations: [
      { id: "karlstad", name: "Karlstad" },
      { id: "arvika", name: "Arvika" },
      { id: "torsby", name: "Torsby" },
    ],
  },
  {
    code: "T",
    name: "Örebro",
    stations: [
      { id: "orebro", name: "Örebro" },
    ],
  },
  {
    code: "U",
    name: "Västmanland",
    stations: [
      { id: "vasteras", name: "Västerås" },
    ],
  },
  {
    code: "C",
    name: "Uppsala",
    stations: [
      { id: "uppsala", name: "Uppsala" },
    ],
  },
  {
    code: "AB",
    name: "Stockholm",
    stations: [
      { id: "stockholm", name: "Stockholm" },
      { id: "stockholm-arlanda", name: "Stockholm-Arlanda" },
      { id: "stockholm-bromma", name: "Stockholm-Bromma" },
    ],
  },
  {
    code: "D",
    name: "Södermanland",
    stations: [
      { id: "eskilstuna", name: "Eskilstuna" },
      { id: "nykoping", name: "Nyköping" },
    ],
  },
  {
    code: "E",
    name: "Östergötland",
    stations: [
      { id: "norrkoping", name: "Norrköping" },
      { id: "linkoping", name: "Linköping" },
    ],
  },
  {
    code: "F",
    name: "Jönköping",
    stations: [
      { id: "jonkoping", name: "Jönköping" },
    ],
  },
  {
    code: "G",
    name: "Kronoberg",
    stations: [
      { id: "vaxjo", name: "Växjö" },
      { id: "ljungby", name: "Ljungby" },
    ],
  },
  {
    code: "H",
    name: "Kalmar",
    stations: [
      { id: "kalmar", name: "Kalmar" },
    ],
  },
  {
    code: "I",
    name: "Gotland",
    stations: [
      { id: "visby", name: "Visby" },
    ],
  },
  {
    code: "K",
    name: "Blekinge",
    stations: [
      { id: "karlskrona", name: "Karlskrona" },
      { id: "ronneby", name: "Ronneby" },
    ],
  },
  {
    code: "M",
    name: "Skåne",
    stations: [
      { id: "malmo", name: "Malmö" },
      { id: "lund", name: "Lund" },
      { id: "helsingborg", name: "Helsingborg" },
      { id: "kristianstad", name: "Kristianstad" },
      { id: "angelholm", name: "Ängelholm" },
    ],
  },
  {
    code: "N",
    name: "Halland",
    stations: [
      { id: "halmstad", name: "Halmstad" },
    ],
  },
  {
    code: "O",
    name: "Västra Götaland",
    stations: [
      { id: "goteborg", name: "Göteborg" },
      { id: "goteborg-landvetter", name: "Göteborg-Landvetter" },
      { id: "trollhattan", name: "Trollhättan" },
      { id: "skovde", name: "Skövde" },
      { id: "satenas", name: "Såtenäs" },
    ],
  },
];

// Get all station IDs
export function getAllStationIds(): string[] {
  return SWEDEN_COUNTIES.flatMap(county => 
    county.stations.map(station => station.id)
  );
}

// Get station name by ID
export function getStationName(id: string): string {
  for (const county of SWEDEN_COUNTIES) {
    const station = county.stations.find(s => s.id === id);
    if (station) return station.name;
  }
  return id;
}

// Get county name by station ID
export function getCountyByStation(stationId: string): string {
  for (const county of SWEDEN_COUNTIES) {
    if (county.stations.some(s => s.id === stationId)) {
      return county.name;
    }
  }
  return "";
}
