import { NextRequest, NextResponse } from "next/server";
import { STATIONS, LOCAL_ROUTES } from "@/constants/addis-ababa-routes";

function randomCongestion() {
  const score = Math.floor(Math.random() * 100);
  const level = score < 25 ? "low" : score < 50 ? "medium" : score < 75 ? "high" : "critical";
  return { score, level };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ success: false, error: "from and to are required" }, { status: 400 });
  }

  const fromStation = Object.values(STATIONS).find((s) => s.name === from);
  const toStation = Object.values(STATIONS).find((s) => s.name === to);

  if (!fromStation || !toStation) {
    return NextResponse.json({ success: false, error: "Invalid station names" }, { status: 400 });
  }

  const distance = haversineKm(fromStation.lat, fromStation.lng, toStation.lat, toStation.lng);
  const options = [];

  // Direct route
  const directDuration = Math.max(8, Math.round((distance / 25) * 60));
  const directCong = randomCongestion();
  options.push({
    id: `direct-${from}-${to}`,
    from,
    to,
    distance: Math.round(distance * 10) / 10,
    fare: Math.max(7, Math.round(distance * 8)),
    durationMinutes: directDuration,
    congestionScore: directCong.score,
    congestionLevel: directCong.level,
    availableBuses: Math.floor(Math.random() * 5) + 1,
    waitTimeMinutes: Math.floor(Math.random() * 10) + 2,
    routeType: "direct",
    transferStops: [],
    label: `${from} → ${to}`,
  });

  // Generate alternatives via intermediate stations
  const intermediates = Object.values(STATIONS).filter(
    (s) => s.name !== from && s.name !== to
  );

  // Pick 3-4 random intermediates to create alternative routes
  const shuffled = intermediates.sort(() => Math.random() - 0.5).slice(0, 4);

  for (const mid of shuffled) {
    const d1 = haversineKm(fromStation.lat, fromStation.lng, mid.lat, mid.lng);
    const d2 = haversineKm(mid.lat, mid.lng, toStation.lat, toStation.lng);
    const totalDist = d1 + d2;
    const altDuration = Math.max(12, Math.round((totalDist / 22) * 60) + 5);
    const altCong = randomCongestion();

    options.push({
      id: `alt-${from}-${mid.name}-${to}`,
      from,
      to,
      distance: Math.round(totalDist * 10) / 10,
      fare: Math.max(10, Math.round(totalDist * 6)),
      durationMinutes: altDuration,
      congestionScore: altCong.score,
      congestionLevel: altCong.level,
      availableBuses: Math.floor(Math.random() * 4) + 1,
      waitTimeMinutes: Math.floor(Math.random() * 12) + 3,
      routeType: "alternative",
      transferStops: [mid.name],
      label: `${from} → ${mid.name} → ${to}`,
    });
  }

  // Sort by duration
  options.sort((a, b) => a.durationMinutes - b.durationMinutes);

  return NextResponse.json({ success: true, data: options });
}
