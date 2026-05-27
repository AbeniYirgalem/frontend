/**
 * This Next.js API route is intentionally disabled.
 *
 * All trip data is served directly by the Express backend at:
 *   GET http://localhost:5000/api/trip-bookings/mine
 *
 * The frontend uses api() from @/services/api which calls the Express
 * backend directly via NEXT_PUBLIC_API_URL — this file is NOT called.
 *
 * Returning 404 here prevents any stale relative-fetch code from
 * accidentally receiving fake data instead of a clear error.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message:
        "This endpoint is disabled. Use the Express backend at /api/trip-bookings/mine",
    },
    { status: 404 },
  );
}
