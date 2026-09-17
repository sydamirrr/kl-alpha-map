/**
 * /api/haze – Live air-quality readings for Klang Valley locations.
 *
 * Data source: Open-Meteo Air Quality API (CAMS / Copernicus).
 * This is NOT official Malaysian DOE / APIMS data – APIMS has no usable
 * public API (SPA + anti-bot, old JSON endpoints 404, data.gov.my ends 2022).
 *
 * Open-Meteo is free, keyless, and permits non-commercial / open-data use.
 * https://open-meteo.com/en/docs/air-quality-api
 *
 * Returns JSON: { stations: [{station, lat, lng, aqi, pm25, category, color}], attribution }
 * Cache-Control: public, max-age=900 (15 min).
 */

import { NextResponse } from "next/server";

// ── Fixed Klang Valley monitoring points ──────────────────────────────────────
const STATIONS = [
  { name: "KL City Centre", lat: 3.1390, lng: 101.6869 },
  { name: "Shah Alam", lat: 3.0733, lng: 101.5185 },
  { name: "Klang", lat: 3.0449, lng: 101.4455 },
  { name: "Petaling Jaya", lat: 3.1073, lng: 101.6068 },
  { name: "Subang Jaya", lat: 3.0565, lng: 101.5851 },
  { name: "Cheras", lat: 3.1073, lng: 101.7328 },
  { name: "Kajang", lat: 2.9927, lng: 101.7909 },
  { name: "Cyberjaya", lat: 2.9213, lng: 101.6559 },
  { name: "Putrajaya", lat: 2.9264, lng: 101.6964 },
  { name: "Rawang", lat: 3.3217, lng: 101.5767 },
  { name: "Ampang", lat: 3.1500, lng: 101.7667 },
  { name: "Damansara", lat: 3.1350, lng: 101.5800 },
  { name: "Kepong", lat: 3.2090, lng: 101.6320 },
  { name: "Banting", lat: 2.8167, lng: 101.5000 },
  { name: "Gombak", lat: 3.2530, lng: 101.7330 },
] as const;

// ── US AQI category bands ─────────────────────────────────────────────────────
function aqiCategory(aqi: number): { category: string; color: string } {
  if (aqi <= 50) return { category: "Good", color: "#22c55e" };
  if (aqi <= 100) return { category: "Moderate", color: "#eab308" };
  if (aqi <= 150) return { category: "Unhealthy for Sensitive Groups", color: "#f97316" };
  if (aqi <= 200) return { category: "Unhealthy", color: "#ef4444" };
  if (aqi <= 300) return { category: "Very Unhealthy", color: "#a855f7" };
  return { category: "Hazardous", color: "#7f1d1d" };
}

export async function GET() {
  const latList = STATIONS.map((s) => s.lat).join(",");
  const lngList = STATIONS.map((s) => s.lng).join(",");

  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${latList}&longitude=${lngList}` +
    `&current=pm2_5,us_aqi&timezone=Asia/Kuala_Lumpur`;

  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Open-Meteo upstream error", status: res.status },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const data: Array<{
      current: { pm2_5: number | null; us_aqi: number | null };
    }> = await res.json();

    const stations = STATIONS.map((s, i) => {
      const c = data[i]?.current;
      const aqi = c?.us_aqi ?? null;
      const pm25 = c?.pm2_5 ?? null;
      const cat = aqi !== null ? aqiCategory(aqi) : { category: "Unknown", color: "#94a3b8" };
      return {
        station: s.name,
        lat: s.lat,
        lng: s.lng,
        aqi,
        pm25,
        ...cat,
      };
    });

    return NextResponse.json(
      { stations, attribution: "Air quality: Open-Meteo CAMS" },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=900, s-maxage=900" },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch air quality data", detail: String(err) },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
