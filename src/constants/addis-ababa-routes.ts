// ────────────────────────────────────────────────────────────
// Addis Ababa Local Transit Routes & Bus Data
// Real GPS coordinates for local bus stops and stations
// ────────────────────────────────────────────────────────────

export interface Station {
  name: string;
  lat: number;
  lng: number;
}

export interface LocalRoute {
  id: string;
  from: Station;
  to: Station;
  label: string;
}

export interface BusData {
  id: string;
  route: LocalRoute;
  driver: string;
  speed: string;
  passengers: number;
  nextStop: string;
  eta: string;
  status: "online" | "offline" | "maintenance";
  /** Current simulated position [lat, lng] */
  position: [number, number];
}

// ── Addis Ababa Stations with real coordinates ──
export const STATIONS: Record<string, Station> = {
  GORO:        { name: "Goro",        lat: 8.9570, lng: 38.8240 },
  MEGENAGNA:   { name: "Megenagna",   lat: 9.0120, lng: 38.7835 },
  SUMMIT:      { name: "Summit",      lat: 9.0195, lng: 38.8365 },
  AYAT:        { name: "Ayat",        lat: 9.0380, lng: 38.8540 },
  CMC:         { name: "CMC",         lat: 9.0260, lng: 38.8195 },
  PIASSA:      { name: "Piassa",      lat: 9.0340, lng: 38.7485 },
  FOUR_KILO:   { name: "4 Kilo",     lat: 9.0320, lng: 38.7630 },
  SIX_KILO:    { name: "6 Kilo",     lat: 9.0360, lng: 38.7550 },
  MERKATO:     { name: "Merkato",     lat: 9.0270, lng: 38.7380 },
  BOLE:        { name: "Bole",        lat: 8.9960, lng: 38.7840 },
  MEXICO:      { name: "Mexico",      lat: 9.0100, lng: 38.7530 },
  TORHAILOCH:  { name: "Torhailoch",  lat: 9.0010, lng: 38.7130 },
  LEBU:        { name: "Lebu",        lat: 8.9780, lng: 38.7020 },
  SARBET:      { name: "Sarbet",      lat: 9.0050, lng: 38.7420 },
  GERJI:       { name: "Gerji",       lat: 8.9980, lng: 38.8100 },
  KAZANCHIS:   { name: "Kazanchis",   lat: 9.0160, lng: 38.7710 },
  SARIS:       { name: "Saris",       lat: 8.9630, lng: 38.7530 },
  KALITI:      { name: "Kaliti",      lat: 8.9350, lng: 38.7460 },
  ARAT_KILO:   { name: "Arat Kilo",  lat: 9.0350, lng: 38.7630 },
  STADIUM:     { name: "Stadium",     lat: 9.0140, lng: 38.7570 },
  IMPERIAL:    { name: "Imperial",    lat: 9.0310, lng: 38.7530 },
  JEMO:        { name: "Jemo",        lat: 8.9710, lng: 38.7180 },
  KOTEBE:      { name: "Kotebe",      lat: 9.0370, lng: 38.8070 },
  LAFTO:       { name: "Lafto",       lat: 8.9520, lng: 38.7350 },
  GOTERA:      { name: "Gotera",      lat: 8.9890, lng: 38.7640 },
  BOLE_ATLAS:  { name: "Atlas",       lat: 8.9880, lng: 38.7910 },
  MESKEL_SQ:   { name: "Meskel Sq.",  lat: 9.0110, lng: 38.7630 },
  AUTOBUS:     { name: "Autobus Tera",lat: 9.0220, lng: 38.7390 },
  WINGATE:     { name: "Wingate",     lat: 9.0260, lng: 38.7540 },
  LAMBERET:    { name: "Lamberet",    lat: 9.0260, lng: 38.8310 },
  BOLE_MEDH:   { name: "Bole Medhanialem", lat: 9.0010, lng: 38.7930 },
};

// ── Local Bus Routes ──
export const LOCAL_ROUTES: LocalRoute[] = [
  { id: "R-01", from: STATIONS.GORO,       to: STATIONS.MEGENAGNA,  label: "Goro → Megenagna" },
  { id: "R-02", from: STATIONS.SUMMIT,     to: STATIONS.AYAT,       label: "Summit → Ayat" },
  { id: "R-03", from: STATIONS.CMC,        to: STATIONS.PIASSA,     label: "CMC → Piassa" },
  { id: "R-04", from: STATIONS.FOUR_KILO,  to: STATIONS.MERKATO,    label: "4 Kilo → Merkato" },
  { id: "R-05", from: STATIONS.BOLE,       to: STATIONS.MEXICO,     label: "Bole → Mexico" },
  { id: "R-06", from: STATIONS.TORHAILOCH, to: STATIONS.LEBU,       label: "Torhailoch → Lebu" },
  { id: "R-07", from: STATIONS.SARBET,     to: STATIONS.GERJI,      label: "Sarbet → Gerji" },
  { id: "R-08", from: STATIONS.KAZANCHIS,  to: STATIONS.SARIS,      label: "Kazanchis → Saris" },
  { id: "R-09", from: STATIONS.MEGENAGNA,  to: STATIONS.CMC,        label: "Megenagna → CMC" },
  { id: "R-10", from: STATIONS.PIASSA,     to: STATIONS.MEXICO,     label: "Piassa → Mexico" },
  { id: "R-11", from: STATIONS.KALITI,     to: STATIONS.MESKEL_SQ,  label: "Kaliti → Meskel Sq." },
  { id: "R-12", from: STATIONS.ARAT_KILO,  to: STATIONS.BOLE,       label: "Arat Kilo → Bole" },
  { id: "R-13", from: STATIONS.JEMO,       to: STATIONS.MERKATO,    label: "Jemo → Merkato" },
  { id: "R-14", from: STATIONS.KOTEBE,     to: STATIONS.FOUR_KILO,  label: "Kotebe → 4 Kilo" },
  { id: "R-15", from: STATIONS.LAFTO,      to: STATIONS.STADIUM,    label: "Lafto → Stadium" },
  { id: "R-16", from: STATIONS.GOTERA,     to: STATIONS.MEGENAGNA,  label: "Gotera → Megenagna" },
  { id: "R-17", from: STATIONS.AUTOBUS,    to: STATIONS.BOLE_MEDH,  label: "Autobus Tera → Bole Medhanialem" },
  { id: "R-18", from: STATIONS.LAMBERET,   to: STATIONS.WINGATE,    label: "Lamberet → Wingate" },
];

// ── Active Buses (used across pages) ──
export const ACTIVE_BUSES: BusData[] = [
  {
    id: "AA-001", route: LOCAL_ROUTES[0], driver: "Abebe K.",
    speed: "32 km/h", passengers: 38, nextStop: "Bole Atlas",
    eta: "8 min", status: "online",
    position: [8.9820, 38.8050],
  },
  {
    id: "AA-008", route: LOCAL_ROUTES[4], driver: "Dawit M.",
    speed: "28 km/h", passengers: 35, nextStop: "Meskel Sq.",
    eta: "5 min", status: "online",
    position: [9.0030, 38.7700],
  },
  {
    id: "AA-012", route: LOCAL_ROUTES[2], driver: "Selam T.",
    speed: "22 km/h", passengers: 42, nextStop: "Kazanchis",
    eta: "12 min", status: "online",
    position: [9.0230, 38.7910],
  },
  {
    id: "AA-017", route: LOCAL_ROUTES[3], driver: "Yonas G.",
    speed: "25 km/h", passengers: 29, nextStop: "Piassa",
    eta: "15 min", status: "online",
    position: [9.0340, 38.7610],
  },
  {
    id: "AA-023", route: LOCAL_ROUTES[7], driver: "Hana B.",
    speed: "0 km/h", passengers: 0, nextStop: "—",
    eta: "—", status: "offline",
    position: [9.0160, 38.7710],
  },
  {
    id: "AA-031", route: LOCAL_ROUTES[1], driver: "Kidus A.",
    speed: "30 km/h", passengers: 22, nextStop: "Lamberet",
    eta: "6 min", status: "online",
    position: [9.0290, 38.8450],
  },
  {
    id: "AA-035", route: LOCAL_ROUTES[5], driver: "Tigist W.",
    speed: "0 km/h", passengers: 0, nextStop: "—",
    eta: "—", status: "maintenance",
    position: [9.0010, 38.7130],
  },
  {
    id: "AA-042", route: LOCAL_ROUTES[8], driver: "Belay F.",
    speed: "26 km/h", passengers: 31, nextStop: "Summit",
    eta: "10 min", status: "online",
    position: [9.0200, 38.8000],
  },
];

// ── Addis Ababa center for map ──
export const ADDIS_CENTER: [number, number] = [9.0192, 38.7525];
export const DEFAULT_ZOOM = 13;
